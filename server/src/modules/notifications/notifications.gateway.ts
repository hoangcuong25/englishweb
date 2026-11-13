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

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Notifications WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from Notifications WebSocket: ${client.id}`);
  }

  @SubscribeMessage('joinUser')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      const room = `user_${data.userId}`;
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
      this.server.to(`user_${userId}`).emit('notificationReceived', notification);
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
