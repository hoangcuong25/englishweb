import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LivekitService } from './livekit.service';
import { WhiteboardService } from './whiteboard.service';
import { WhiteboardStrokeDto, SetWhiteboardPermissionDto } from './dto/whiteboard-stroke.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('LiveKit WebRTC & Whiteboard')
@Controller('livekit')
export class LivekitController {
  constructor(
    private livekitService: LivekitService,
    private whiteboardService: WhiteboardService,
  ) {}

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of active or scheduled live classrooms' })
  @ResponseMessage('Lấy danh sách phòng học trực tuyến thành công')
  async getRooms() {
    return this.livekitService.listRooms();
  }

  @Post('rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin schedules a new LiveKit classroom' })
  @ResponseMessage('Lập lịch phòng học trực tuyến thành công')
  async createRoom(
    @CurrentUser('id') hostId: string,
    @Body() body: { name: string; courseId?: string; scheduledStartTime: string; scheduledEndTime: string },
  ) {
    return this.livekitService.createRoom(hostId, {
      name: body.name,
      courseId: body.courseId,
      scheduledStartTime: new Date(body.scheduledStartTime),
      scheduledEndTime: new Date(body.scheduledEndTime),
    });
  }

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate access token for WebRTC classroom' })
  async getToken(
    @Body('roomName') roomName: string,
    @CurrentUser() user: any,
  ) {
    return this.livekitService.createToken(
      roomName,
      user.id,
      user.fullName,
      user.role,
    );
  }

  @Post('end-room')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Host ends class for everyone' })
  async endRoom(@Body('roomName') roomName: string) {
    return this.livekitService.endRoom(roomName);
  }

  @Post('mute-participant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Host mutes a participant track' })
  async muteParticipant(
    @Body('roomName') roomName: string,
    @Body('identity') identity: string,
    @Body('trackSid') trackSid: string,
    @Body('muted') muted: boolean,
  ) {
    return this.livekitService.muteParticipantTrack(roomName, identity, trackSid, muted);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'LiveKit SFU webhook endpoint for participant events' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('authorization') authHeader: string,
  ) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    return this.livekitService.handleWebhook(rawBody, authHeader);
  }

  // ==========================================
  // WHITEBOARD 2-WAY INTERACTIVE ENDPOINTS
  // ==========================================

  @Get('rooms/:roomName/whiteboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current whiteboard state and strokes snapshot' })
  @ResponseMessage('Lấy dữ liệu bảng trắng thành công')
  async getWhiteboardSnapshot(@Param('roomName') roomName: string) {
    const snapshot = this.whiteboardService.getSnapshot(roomName);
    return {
      ...snapshot,
      count: snapshot.strokes.length,
    };
  }

  @Post('rooms/:roomName/whiteboard/stroke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Draw a new stroke on the classroom whiteboard' })
  @ResponseMessage('Vẽ nét mới lên bảng trắng thành công')
  async drawStroke(
    @Param('roomName') roomName: string,
    @Body() dto: WhiteboardStrokeDto,
    @CurrentUser() user: any,
  ) {
    const stroke = this.whiteboardService.addStroke(roomName, dto, {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
    });
    return {
      success: true,
      stroke,
    };
  }

  @Post('rooms/:roomName/whiteboard/clear')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear whiteboard strokes' })
  @ResponseMessage('Xóa bảng trắng thành công')
  async clearWhiteboard(
    @Param('roomName') roomName: string,
    @CurrentUser() user: any,
  ) {
    return this.whiteboardService.clearWhiteboard(roomName, {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
    });
  }

  @Post('rooms/:roomName/whiteboard/permission')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin grants or revokes student whiteboard drawing permission' })
  @ResponseMessage('Cập nhật quyền vẽ bảng trắng thành công')
  async setWhiteboardPermission(
    @Param('roomName') roomName: string,
    @Body() dto: SetWhiteboardPermissionDto,
  ) {
    return this.whiteboardService.setStudentDrawingPermission(
      roomName,
      dto.allowStudentDrawing,
    );
  }
}
