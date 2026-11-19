import { Injectable, Logger, BadRequestException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, WebhookReceiver, RoomServiceClient } from 'livekit-server-sdk';
import { Role, AttendanceStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LivekitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LivekitService.name);
  private apiKey: string;
  private apiSecret: string;
  private livekitUrl: string;
  private webhookReceiver: WebhookReceiver;
  private roomService: RoomServiceClient;
  private sweepIntervalRef: NodeJS.Timeout | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY', 'API_KEY_DEV');
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET', 'API_SECRET_DEV_ENGLISHWEB_2026');
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL', 'http://localhost:7880');
    this.webhookReceiver = new WebhookReceiver(this.apiKey, this.apiSecret);
    this.roomService = new RoomServiceClient(this.livekitUrl, this.apiKey, this.apiSecret);
  }

  onModuleInit() {
    this.autoEndExpiredRooms().catch((err) => {
      this.logger.error('Initial auto-end expired rooms failed:', err);
    });

    // Periodically sweep expired rooms every 60 seconds
    this.sweepIntervalRef = setInterval(() => {
      this.autoEndExpiredRooms().catch((err) => {
        this.logger.error('Scheduled auto-end expired rooms error:', err);
      });
    }, 60 * 1000);
  }

  onModuleDestroy() {
    if (this.sweepIntervalRef) {
      clearInterval(this.sweepIntervalRef);
      this.sweepIntervalRef = null;
    }
  }

  /**
   * Automatically close/end any classroom that has passed scheduledEndTime by 30+ minutes
   */
  async autoEndExpiredRooms(): Promise<number> {
    try {
      const now = new Date();
      // Cutoff time: scheduledEndTime + 30m <= now <=> scheduledEndTime <= now - 30m
      const cutoffTime = new Date(now.getTime() - 30 * 60 * 1000);

      const expiredRooms = await this.prisma.classroom.findMany({
        where: {
          status: { in: ['SCHEDULED', 'ACTIVE'] },
          scheduledEndTime: { lte: cutoffTime },
        },
      });

      if (expiredRooms.length === 0) {
        return 0;
      }

      this.logger.log(`Found ${expiredRooms.length} classroom(s) past scheduledEndTime by > 30 minutes. Auto-closing...`);

      for (const room of expiredRooms) {
        try {
          await this.roomService.deleteRoom(room.name).catch(() => {});
        } catch {
          // Room might already be closed or not created on LiveKit SFU
        }

        await this.prisma.classroom.update({
          where: { id: room.id },
          data: {
            status: 'ENDED',
            actualEndTime: room.actualEndTime || new Date(),
          },
        });

        this.logger.log(`Classroom "${room.name}" auto-ended and closed (ended after 30 mins).`);
      }

      return expiredRooms.length;
    } catch (err) {
      this.logger.error('Error in autoEndExpiredRooms:', err);
      return 0;
    }
  }

  async createToken(roomName: string, identity: string, name: string, role: Role) {
    if (!roomName || !identity) {
      throw new BadRequestException('Room name and user identity are required');
    }

    const classroom = await this.prisma.classroom.findFirst({
      where: {
        OR: [{ name: roomName }, { id: roomName }],
      },
    });

    if (classroom) {
      const now = new Date();
      const expirationTime = new Date(classroom.scheduledEndTime.getTime() + 30 * 60 * 1000);

      // If room is marked ENDED or is past scheduledEndTime + 30 minutes, reject connection
      if (classroom.status === 'ENDED' || now > expirationTime) {
        if (classroom.status !== 'ENDED') {
          await this.endRoom(roomName).catch(() => {});
        }
        throw new BadRequestException(
          'Lớp học đã kết thúc sau 30 phút theo lịch quy định của giảng viên và phòng học đã tự động đóng.',
        );
      }

      // If host joins a scheduled room, mark it as ACTIVE
      const isHost = role === Role.ADMIN;
      if (isHost && classroom.status === 'SCHEDULED') {
        await this.prisma.classroom.update({
          where: { id: classroom.id },
          data: {
            status: 'ACTIVE',
            actualStartTime: classroom.actualStartTime || new Date(),
          },
        });
      }

      // If student joins, auto record attendance record (mark as joined)
      if (!isHost && classroom) {
        try {
          await this.prisma.attendanceRecord.upsert({
            where: {
              classroomId_studentId: {
                classroomId: classroom.id,
                studentId: identity,
              },
            },
            create: {
              classroomId: classroom.id,
              studentId: identity,
              firstJoinedAt: now,
              status: AttendanceStatus.PRESENT,
              totalMinutes: 1,
            },
            update: {
              // Keep firstJoinedAt if already set
            },
          });
        } catch (err) {
          this.logger.warn(`Failed to auto-upsert attendance for student ${identity}: ${err}`);
        }
      }
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
      scheduledEndTime: classroom?.scheduledEndTime || null,
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

      // Notify admins that attendance report is ready
      try {
        const admins = await this.prisma.user.findMany({
          where: { role: Role.ADMIN, isActive: true },
          select: { id: true },
        });
        if (admins.length > 0) {
          await this.prisma.notification.createMany({
            data: admins.map((a) => ({
              userId: a.id,
              title: 'Báo cáo điểm danh sẵn sàng',
              content: `Buổi học LiveKit "${roomName}" đã kết thúc. Dữ liệu chuyên cần đã sẵn sàng xuất Excel.`,
              type: NotificationType.LIVE,
              link: '/admin/attendance',
              isRead: false,
            })),
          });
        }
      } catch {
        // Do not block end room
      }

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

  async listRooms() {
    // 1. Auto-end expired classrooms (> 30 mins after scheduledEndTime)
    await this.autoEndExpiredRooms();

    // 2. Filter out any rooms where scheduledEndTime + 30m <= now
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 30 * 60 * 1000);

    return this.prisma.classroom.findMany({
      where: {
        status: { in: ['SCHEDULED', 'ACTIVE'] },
        scheduledEndTime: { gt: cutoffTime },
      },
      include: {
        host: {
          select: { id: true, fullName: true, email: true },
        },
        course: {
          select: { id: true, title: true, slug: true, thumbnail: true },
        },
        _count: {
          select: { attendanceRecords: true },
        },
      },
      orderBy: { scheduledStartTime: 'asc' },
    });
  }

  async createRoom(hostId: string, data: { name: string; courseId?: string; scheduledStartTime: Date; scheduledEndTime: Date }) {
    const existing = await this.prisma.classroom.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException('Tên phòng học đã tồn tại');
    }

    const room = await this.prisma.classroom.create({
      data: {
        name: data.name,
        courseId: data.courseId || null,
        hostId,
        scheduledStartTime: data.scheduledStartTime,
        scheduledEndTime: data.scheduledEndTime,
        status: 'SCHEDULED',
      },
      include: {
        host: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    // Notify students about scheduled live class
    try {
      const students = await this.prisma.user.findMany({
        where: { role: Role.STUDENT, isActive: true },
        select: { id: true },
      });
      if (students.length > 0) {
        await this.prisma.notification.createMany({
          data: students.map((s) => ({
            userId: s.id,
            title: 'Lớp học trực tuyến sắp bắt đầu',
            content: `Buổi học LiveKit "${data.name}" đã được lên lịch. Nhấn để chuẩn bị vào lớp.`,
            type: NotificationType.LIVE,
            link: '/student/classroom',
            isRead: false,
          })),
        });
      }
    } catch {
      // Do not block room creation
    }

    return room;
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

      // Q-03 Idempotency check using composite key and event timestamp
      const eventTimestamp = event.createdAt
        ? (typeof event.createdAt === 'number' && event.createdAt < 1e12 ? event.createdAt * 1000 : Number(event.createdAt))
        : Date.now();
      const eventTime = new Date(eventTimestamp);
      const eventKey = event.id || `${roomName}:${participant.identity}:${event.event}:${Math.floor(eventTimestamp / 1000)}`;
      const dedupKey = `livekit_webhook_dedup:${eventKey}`;

      if (this.redisService) {
        const isProcessed = await this.redisService.get(dedupKey);
        if (isProcessed) {
          this.logger.warn(`LiveKit webhook event duplicate detected and ignored: ${eventKey}`);
          return { status: 'duplicate_ignored', event: event.event };
        }
        await this.redisService.set(dedupKey, '1', 86400); // 24-hour deduplication window
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
            firstJoinedAt: eventTime,
            status: AttendanceStatus.PRESENT,
          },
          update: {
            // Keep original firstJoinedAt if earlier
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
          const joinTime = new Date(record.firstJoinedAt).getTime();
          const leftTime = Math.max(eventTime.getTime(), joinTime);
          const durationMinutes = Math.max(
            1,
            Math.round((leftTime - joinTime) / (1000 * 60)),
          );

          // Calculate attendance status:
          const delayMinutes = (joinTime - classroom.scheduledStartTime.getTime()) / (1000 * 60);
          let status: AttendanceStatus = AttendanceStatus.PRESENT;

          if (delayMinutes > 15) {
            status = AttendanceStatus.LATE;
          }
          if (durationMinutes < 15) {
            status = AttendanceStatus.ABSENT;
          }

          // Use Math.max to prevent duplicate cumulative addition if left webhook repeats
          const updatedTotal = record.totalMinutes > 0 ? Math.max(record.totalMinutes, durationMinutes) : durationMinutes;

          await this.prisma.attendanceRecord.update({
            where: { id: record.id },
            data: {
              lastLeftAt: eventTime,
              totalMinutes: updatedTotal,
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

  /**
   * Admin: Get all created and taught classrooms history
   */
  async getAdminClassroomHistory() {
    await this.autoEndExpiredRooms().catch(() => {});

    const rooms = await this.prisma.classroom.findMany({
      orderBy: { scheduledStartTime: 'desc' },
      include: {
        host: {
          select: { id: true, fullName: true, email: true },
        },
        course: {
          select: { id: true, title: true, slug: true, thumbnail: true },
        },
        _count: {
          select: { attendanceRecords: true },
        },
        attendanceRecords: {
          select: {
            id: true,
            status: true,
            totalMinutes: true,
            firstJoinedAt: true,
            lastLeftAt: true,
            student: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    const now = new Date();

    return rooms.map((room) => {
      const presentCount = room.attendanceRecords.filter((a) => a.status === 'PRESENT').length;
      const lateCount = room.attendanceRecords.filter((a) => a.status === 'LATE').length;
      const absentCount = room.attendanceRecords.filter((a) => a.status === 'ABSENT').length;
      const isPastOrEnded =
        room.status === 'ENDED' ||
        now.getTime() > new Date(room.scheduledEndTime).getTime() + 30 * 60 * 1000;

      return {
        id: room.id,
        name: room.name,
        course: room.course,
        host: room.host,
        scheduledStartTime: room.scheduledStartTime,
        scheduledEndTime: room.scheduledEndTime,
        actualStartTime: room.actualStartTime,
        actualEndTime: room.actualEndTime,
        status: room.status,
        isPastOrEnded,
        attendeeCount: room._count.attendanceRecords,
        stats: {
          present: presentCount,
          late: lateCount,
          absent: absentCount,
        },
        records: room.attendanceRecords,
      };
    });
  }

  /**
   * Student: Get history of all classrooms indicating joined vs missed
   */
  async getStudentClassroomHistory(studentId: string) {
    await this.autoEndExpiredRooms().catch(() => {});

    const rooms = await this.prisma.classroom.findMany({
      orderBy: { scheduledStartTime: 'desc' },
      include: {
        host: {
          select: { id: true, fullName: true, email: true },
        },
        course: {
          select: { id: true, title: true, slug: true, thumbnail: true },
        },
        attendanceRecords: {
          where: { studentId },
          select: {
            id: true,
            status: true,
            totalMinutes: true,
            firstJoinedAt: true,
            lastLeftAt: true,
            note: true,
          },
        },
      },
    });

    const now = new Date();

    const history = rooms.map((room) => {
      const record = room.attendanceRecords?.[0];
      const isPastOrEnded =
        room.status === 'ENDED' ||
        now.getTime() > new Date(room.scheduledEndTime).getTime() + 30 * 60 * 1000;

      const hasJoined =
        !!record &&
        (record.totalMinutes > 0 ||
          !!record.firstJoinedAt ||
          record.status === 'PRESENT' ||
          record.status === 'LATE');
      let attendanceStatus = 'UPCOMING';
      if (hasJoined) {
        attendanceStatus = record.status; // PRESENT or LATE
      } else if (isPastOrEnded) {
        attendanceStatus = 'ABSENT'; // Chưa join / vắng mặt
      } else {
        attendanceStatus = room.status === 'ACTIVE' ? 'LIVE_NOW' : 'SCHEDULED';
      }

      return {
        id: room.id,
        name: room.name,
        course: room.course,
        host: room.host,
        scheduledStartTime: room.scheduledStartTime,
        scheduledEndTime: room.scheduledEndTime,
        actualStartTime: room.actualStartTime,
        actualEndTime: room.actualEndTime,
        status: room.status,
        hasJoined,
        attendanceStatus,
        totalMinutes: record?.totalMinutes || (hasJoined ? Math.max(1, record?.totalMinutes || 0) : 0),
        firstJoinedAt: record?.firstJoinedAt || null,
        lastLeftAt: record?.lastLeftAt || null,
        isPastOrEnded,
      };
    });

    const pastRooms = history.filter((h) => h.isPastOrEnded);
    const joinedRooms = pastRooms.filter((h) => h.hasJoined);
    const missedRooms = pastRooms.filter((h) => !h.hasJoined);

    return {
      summary: {
        totalPastRooms: pastRooms.length,
        joinedCount: joinedRooms.length,
        missedCount: missedRooms.length,
        attendanceRate:
          pastRooms.length > 0 ? Math.round((joinedRooms.length / pastRooms.length) * 100) : 100,
      },
      history,
    };
  }
}
