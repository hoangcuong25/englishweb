import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { WhiteboardStrokeDto } from './dto/whiteboard-stroke.dto';

export interface WhiteboardStroke {
  id: string;
  tool: string;
  color: string;
  size: number;
  points?: Array<{ x: number; y: number }>;
  text?: string;
  imageUrl?: string;
  userId: string;
  userName: string;
  role: Role;
  timestamp: number;
}

export interface WhiteboardRoomState {
  roomName: string;
  allowStudentDrawing: boolean;
  strokes: WhiteboardStroke[];
  lastClearedAt?: number;
}

@Injectable()
export class WhiteboardService {
  private readonly logger = new Logger(WhiteboardService.name);
  private readonly rooms = new Map<string, WhiteboardRoomState>();

  /**
   * Lấy hoặc khởi tạo trạng thái bảng trắng của phòng học
   */
  getSnapshot(roomName: string): WhiteboardRoomState {
    let state = this.rooms.get(roomName);
    if (!state) {
      state = {
        roomName,
        allowStudentDrawing: false, // Mặc định chỉ Admin mới được vẽ cho đến khi cấp quyền
        strokes: [],
      };
      this.rooms.set(roomName, state);
    }
    return {
      roomName: state.roomName,
      allowStudentDrawing: state.allowStudentDrawing,
      strokes: [...state.strokes],
      lastClearedAt: state.lastClearedAt,
    };
  }

  /**
   * Thêm một nét vẽ mới lên bảng trắng (kiểm tra phân quyền học viên)
   */
  addStroke(
    roomName: string,
    dto: WhiteboardStrokeDto,
    user: { id: string; fullName?: string; role: Role },
  ): WhiteboardStroke {
    const state = this.getOrCreateRoom(roomName);

    // Kiểm tra quyền: nếu là STUDENT mà chưa được Admin cấp quyền vẽ thì từ chối (MSG-CLASS-005)
    if (user.role === Role.STUDENT && !state.allowStudentDrawing) {
      throw new ForbiddenException('Bạn chưa được cấp quyền thao tác bảng trắng');
    }

    const stroke: WhiteboardStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      tool: dto.tool,
      color: dto.color || '#0284c7',
      size: dto.size || 3,
      points: dto.points || [],
      text: dto.text,
      imageUrl: dto.imageUrl,
      userId: user.id,
      userName: user.fullName || 'User',
      role: user.role,
      timestamp: Date.now(),
    };

    state.strokes.push(stroke);
    // Giới hạn bộ nhớ tối đa 2000 strokes / phòng để tối ưu hiệu năng
    if (state.strokes.length > 2000) {
      state.strokes.shift();
    }

    return stroke;
  }

  /**
   * Xóa toàn bộ nét vẽ trên bảng trắng
   */
  clearWhiteboard(
    roomName: string,
    user: { id: string; fullName?: string; role: Role },
  ) {
    const state = this.getOrCreateRoom(roomName);

    // Nếu là STUDENT mà chưa được cấp quyền thì không được xóa
    if (user.role === Role.STUDENT && !state.allowStudentDrawing) {
      throw new ForbiddenException('Bạn chưa được cấp quyền thao tác bảng trắng');
    }

    state.strokes = [];
    state.lastClearedAt = Date.now();

    return {
      success: true,
      message: 'Bảng trắng đã được xóa thành công',
      roomName,
    };
  }

  /**
   * Admin phân quyền cho phép / cấm học viên vẽ bảng trắng
   */
  setStudentDrawingPermission(roomName: string, allowStudentDrawing: boolean) {
    const state = this.getOrCreateRoom(roomName);
    state.allowStudentDrawing = allowStudentDrawing;

    return {
      success: true,
      roomName,
      allowStudentDrawing: state.allowStudentDrawing,
    };
  }

  /**
   * Xóa phòng khỏi bộ nhớ khi lớp học kết thúc
   */
  resetRoom(roomName: string) {
    this.rooms.delete(roomName);
  }

  private getOrCreateRoom(roomName: string): WhiteboardRoomState {
    let state = this.rooms.get(roomName);
    if (!state) {
      state = {
        roomName,
        allowStudentDrawing: false,
        strokes: [],
      };
      this.rooms.set(roomName, state);
    }
    return state;
  }
}
