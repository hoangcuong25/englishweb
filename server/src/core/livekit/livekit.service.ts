import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, WebhookReceiver, RoomServiceClient } from 'livekit-server-sdk';
import { Role, AttendanceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private apiKey: string;
  private apiSecret: string;
  private livekitUrl: string;
  private webhookReceiver: WebhookReceiver;
  private roomService: RoomServiceClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY', 'API_KEY_DEV');
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET', 'API_SECRET_DEV_ENGLISHWEB_2026');
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL', 'http://localhost:7880');
    this.webhookReceiver = new WebhookReceiver(this.apiKey, this.apiSecret);
    this.roomService = new RoomServiceClient(this.livekitUrl, this.apiKey, this.apiSecret);
  }

  async createToken(roomName: string, identity: string, name: string, role: Role) {
    if (!roomName || !identity) {
      throw new BadRequestException('Room name and user identity are required');
    }

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      name: name || identity,
    });

    const isHost = role === Role.ADMIN;

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost,
      roomCreate: isHost,
    });

    return {
      token: await at.toJwt(),
      roomName,
      identity,
      role,
      isHost,
    };
  }

  async muteParticipantTrack(roomName: string, identity: string, trackSid: string, muted: boolean) {
    try {
      await this.roomService.mutePublishedTrack(roomName, identity, trackSid, muted);
      return { success: true };
    } catch (err) {
      this.logger.error(`Error muting track ${trackSid}:`, err);
      throw new BadRequestException(`Could not mute track: ${err.message}`);
    }
  }

  async removeParticipant(roomName: string, identity: string) {
    try {
      await this.roomService.removeParticipant(roomName, identity);
      return { success: true };
    } catch (err) {
      this.logger.error(`Error removing participant ${identity}:`, err);
      throw new BadRequestException(`Could not remove participant: ${err.message}`);
    }
  }

  async endRoom(roomName: string) {
    try {
      await this.roomService.deleteRoom(roomName);

      // Update room in DB if exists
      await this.prisma.classroom.updateMany({
        where: { name: roomName },
        data: { status: 'ENDED', actualEndTime: new Date() },
      });

      return { success: true, message: `Room ${roomName} ended` };
    } catch (err) {
      this.logger.error(`Error ending room ${roomName}:`, err);
      return { success: false, message: err.message };
    }
  }

  async getParticipants(roomName: string) {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants;
    } catch {
      return [];
    }
  }

  async handleWebhook(body: string, authHeader: string) {
    try {
      const event = await this.webhookReceiver.receive(body, authHeader);
      this.logger.log(`Received LiveKit webhook event: ${event.event} for room ${event.room?.name}`);

      const roomName = event.room?.name;
      const participant = event.participant;

      if (!roomName || !participant) {
        return { status: 'ignored' };
      }

      // Find corresponding Classroom in DB
      const classroom = await this.prisma.classroom.findFirst({
        where: { name: roomName },
      });

      if (!classroom) {
        return { status: 'room_not_tracked' };
      }

      // Check if participant is a student
      const student = await this.prisma.user.findUnique({
        where: { id: participant.identity },
      });

      if (!student || student.role !== Role.STUDENT) {
        return { status: 'host_or_non_student' };
      }

      const now = new Date();

      if (event.event === 'participant_joined') {
        await this.prisma.attendanceRecord.upsert({
          where: {
            classroomId_studentId: {
              classroomId: classroom.id,
              studentId: student.id,
            },
          },
          create: {
            classroomId: classroom.id,
            studentId: student.id,
            firstJoinedAt: now,
            status: AttendanceStatus.PRESENT,
          },
          update: {
            firstJoinedAt: now,
          },
        });
      } else if (event.event === 'participant_left') {
        const record = await this.prisma.attendanceRecord.findUnique({
          where: {
            classroomId_studentId: {
              classroomId: classroom.id,
              studentId: student.id,
            },
          },
        });

        if (record && record.firstJoinedAt) {
          const durationMinutes = Math.max(
            1,
            Math.round((now.getTime() - record.firstJoinedAt.getTime()) / (1000 * 60)),
          );

          // Calculate attendance status:
          const delayMinutes = (record.firstJoinedAt.getTime() - classroom.scheduledStartTime.getTime()) / (1000 * 60);
          let status: AttendanceStatus = AttendanceStatus.PRESENT;

          if (delayMinutes > 15) {
            status = AttendanceStatus.LATE;
          }
          if (durationMinutes < 15) {
            status = AttendanceStatus.ABSENT;
          }

          await this.prisma.attendanceRecord.update({
            where: { id: record.id },
            data: {
              lastLeftAt: now,
              totalMinutes: record.totalMinutes + durationMinutes,
              status: record.isManualOverride ? record.status : status,
            },
          });
        }
      }

      return { status: 'processed', event: event.event };
    } catch (err) {
      this.logger.error('Failed to process LiveKit webhook', err);
      return { status: 'error', message: err.message };
    }
  }
}
