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
import { WhiteboardService } from './whiteboard.service';
import { WhiteboardStrokeDto } from './dto/whiteboard-stroke.dto';
import { Role } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/whiteboard',
})
export class WhiteboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhiteboardGateway.name);

  constructor(private readonly whiteboardService: WhiteboardService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Whiteboard WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from Whiteboard WebSocket: ${client.id}`);
  }

  @SubscribeMessage('joinWhiteboard')
  handleJoinWhiteboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string },
  ) {
    if (data?.roomName) {
      const roomKey = `wb_${data.roomName}`;
      client.join(roomKey);
      const snapshot = this.whiteboardService.getSnapshot(data.roomName);
      return {
        status: 'joined',
        roomName: data.roomName,
        snapshot,
      };
    }
  }

  @SubscribeMessage('leaveWhiteboard')
  handleLeaveWhiteboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string },
  ) {
    if (data?.roomName) {
      client.leave(`wb_${data.roomName}`);
      return { status: 'left', roomName: data.roomName };
    }
  }

  @SubscribeMessage('drawStroke')
  handleDrawStroke(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
      stroke: WhiteboardStrokeDto;
      user: { id: string; fullName?: string; role: Role };
    },
  ) {
    try {
      if (!data?.roomName || !data?.stroke) return;

      const user = data.user || {
        id: 'anon',
        fullName: 'Anonymous',
        role: Role.STUDENT,
      };

      const stroke = this.whiteboardService.addStroke(data.roomName, data.stroke, user);

      // Phát sự kiện nét vẽ mới tới tất cả thành viên khác trong phòng học
      client.to(`wb_${data.roomName}`).emit('strokeAdded', {
        roomName: data.roomName,
        stroke,
      });

      return { status: 'success', stroke };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }

  @SubscribeMessage('clearWhiteboard')
  handleClearWhiteboard(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
      user: { id: string; fullName?: string; role: Role };
    },
  ) {
    try {
      if (!data?.roomName) return;

      const user = data.user || {
        id: 'anon',
        fullName: 'Anonymous',
        role: Role.ADMIN,
      };

      const res = this.whiteboardService.clearWhiteboard(data.roomName, user);

      // Thông báo xóa bảng cho toàn bộ học viên và giáo viên trong phòng
      this.server.to(`wb_${data.roomName}`).emit('whiteboardCleared', {
        roomName: data.roomName,
      });

      return res;
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }

  @SubscribeMessage('setPermission')
  handleSetPermission(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomName: string;
      allowStudentDrawing: boolean;
      role: Role;
    },
  ) {
    if (!data?.roomName || data.role !== Role.ADMIN) {
      return { status: 'forbidden', message: 'Chỉ Admin mới có quyền điều khiển bảng trắng' };
    }

    const res = this.whiteboardService.setStudentDrawingPermission(
      data.roomName,
      Boolean(data.allowStudentDrawing),
    );

    // Thông báo trạng thái phân quyền mới cho toàn phòng
    this.server.to(`wb_${data.roomName}`).emit('whiteboardPermissionChanged', {
      roomName: data.roomName,
      allowStudentDrawing: res.allowStudentDrawing,
    });

    return res;
  }
}
