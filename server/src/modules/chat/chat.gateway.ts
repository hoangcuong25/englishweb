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
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
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
    if (data?.userId) {
      client.join(`user_${data.userId}`);
      return { status: 'joined_user', userId: data.userId };
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.join(`conv_${data.conversationId}`);
      return { status: 'joined_conversation', conversationId: data.conversationId };
    }
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.leave(`conv_${data.conversationId}`);
      return { status: 'left_conversation', conversationId: data.conversationId };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversationId: string; userId: string; fullName: string; isTyping: boolean },
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

      // Broadcast new message to anyone in this conversation room
      this.server.to(`conv_${payload.conversationId}`).emit('newMessage', message);

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
      return { status: 'error', message: err?.message || 'Lỗi đánh dấu đã đọc' };
    }
  }

  /**
   * Helper to broadcast message from REST controller if sent via HTTP
   */
  broadcastNewMessage(conversationId: string, message: any) {
    if (this.server) {
      this.server.to(`conv_${conversationId}`).emit('newMessage', message);
    }
  }
}
