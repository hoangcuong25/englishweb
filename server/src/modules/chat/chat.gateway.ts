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
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly jwtSecret: string;

  constructor(
    private readonly chatService: ChatService,
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
      // Allow unauthenticated connection for fallback if needed, but client.data.user remains null
    }
    this.logger.log(`Client connected to chat: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from chat: ${client.id}`);
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
        `Security alert: Socket ${client.id} (${client.data.userId}) attempted to join unowned room user_${targetUserId}`,
      );
      return { status: 'forbidden', error: 'Cannot join another user room' };
    }

    if (targetUserId) {
      client.join(`user_${targetUserId}`);
      return { status: 'joined_user', userId: targetUserId };
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.join(`conv_${data.conversationId}`);
      return {
        status: 'joined_conversation',
        conversationId: data.conversationId,
      };
    }
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.leave(`conv_${data.conversationId}`);
      return {
        status: 'left_conversation',
        conversationId: data.conversationId,
      };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      userId: string;
      fullName: string;
      isTyping: boolean;
    },
  ) {
    if (data?.conversationId) {
      client.to(`conv_${data.conversationId}`).emit('userTyping', data);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      senderId: string;
      role: string;
      content: string;
    },
  ) {
    try {
      const message = await this.chatService.sendMessage(
        payload.conversationId,
        payload.senderId,
        payload.role,
        payload.content,
      );

      // Broadcast new message to anyone in this conversation room & participant user rooms
      this.broadcastNewMessage(
        payload.conversationId,
        message,
        (message as any).studentId,
        (message as any).adminId,
      );

      return { status: 'success', message };
    } catch (err: any) {
      return { status: 'error', message: err?.message || 'Lỗi gửi tin nhắn' };
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      userId: string;
      role: string;
    },
  ) {
    try {
      const result = await this.chatService.markAsRead(
        payload.conversationId,
        payload.userId,
        payload.role,
      );

      this.server.to(`conv_${payload.conversationId}`).emit('messagesRead', {
        conversationId: payload.conversationId,
        readBy: payload.userId,
      });

      return { status: 'success', ...result };
    } catch (err: any) {
      return {
        status: 'error',
        message: err?.message || 'Lỗi đánh dấu đã đọc',
      };
    }
  }

  /**
   * Helper to broadcast message from REST controller if sent via HTTP
   */
  broadcastNewMessage(
    conversationId: string,
    message: any,
    studentId?: string,
    adminId?: string,
  ) {
    if (this.server) {
      this.server.to(`conv_${conversationId}`).emit('newMessage', message);
      if (studentId) {
        this.server.to(`user_${studentId}`).emit('newMessage', message);
      }
      if (adminId) {
        this.server.to(`user_${adminId}`).emit('newMessage', message);
      }
    }
  }
}
