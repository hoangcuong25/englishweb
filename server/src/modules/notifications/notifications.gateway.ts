import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
      'dev_jwt_secret_teacher_dong_2026';
  }

  handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;
      const cookieHeader = client.handshake.headers.cookie;
      let cookieToken: string | null = null;
      if (cookieHeader) {
        const match = cookieHeader.match(/access_token=([^;]+)/);
        if (match) cookieToken = decodeURIComponent(match[1]);
      }
      const token = client.handshake.auth?.token || bearerToken || cookieToken;

      if (token) {
        const decoded: any = this.jwtService.verify(token, {
          secret: this.jwtSecret,
        });
        client.data.user = decoded;
        client.data.userId = decoded.sub;
      }
    } catch {
      // Allow connection but without authenticated user
    }
    this.logger.log(
      `Client connected to Notifications WebSocket: ${client.id}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected from Notifications WebSocket: ${client.id}`,
    );
  }

  @SubscribeMessage('joinUser')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const targetUserId = data?.userId || client.data?.userId;

    // Security check: if client is authenticated as a student, reject joining another user's room
    if (
      client.data?.user &&
      client.data.user.role !== 'ADMIN' &&
      client.data.userId !== targetUserId
    ) {
      this.logger.warn(
        `Security alert: Socket ${client.id} (${client.data.userId}) attempted to join unowned notifications room user_${targetUserId}`,
      );
      return {
        status: 'forbidden',
        error: 'Cannot join another user notification room',
      };
    }

    if (targetUserId) {
      const room = `user_${targetUserId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined user room: ${room}`);
      return { status: 'joined', room };
    }
  }

  @SubscribeMessage('leaveUser')
  handleLeaveUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      const room = `user_${data.userId}`;
      client.leave(room);
      return { status: 'left', room };
    }
  }

  /**
   * Emit notification to a specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    if (this.server) {
      this.server
        .to(`user_${userId}`)
        .emit('notificationReceived', notification);
    }
  }

  /**
   * Broadcast notification to all active clients
   */
  broadcastNotification(notification: any) {
    if (this.server) {
      this.server.emit('broadcastNotification', notification);
    }
  }
}
