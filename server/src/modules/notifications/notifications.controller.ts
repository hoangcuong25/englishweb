import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ResponseMessage } from '../../core/common/decorators/response-message.decorator';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { Role } from '@prisma/client';

@ApiTags('Realtime Notifications System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin phát thông báo hệ thống tới toàn bộ hoặc nhóm người dùng' })
  @ApiResponse({ status: 201, description: 'Phát thông báo thành công' })
  @ResponseMessage('Phát thông báo hệ thống thành công')
  broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    return this.notificationsService.broadcastNotification(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng hiện tại' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo' })
  @ResponseMessage('Lấy danh sách thông báo thành công')
  getMyNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    return this.notificationsService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly: String(unreadOnly) === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy nhanh số lượng thông báo chưa đọc' })
  @ApiResponse({ status: 200, description: 'Số lượng thông báo chưa đọc' })
  @ResponseMessage('Lấy số lượng thông báo chưa đọc thành công')
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo của người dùng là đã đọc' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu tất cả là đã đọc' })
  @ResponseMessage('Đã đánh dấu tất cả thông báo là đã đọc')
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu một thông báo cụ thể là đã đọc' })
  @ApiParam({ name: 'id', description: 'UUID của thông báo' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu thông báo là đã đọc' })
  @ResponseMessage('Đã đánh dấu thông báo là đã đọc')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một thông báo' })
  @ApiParam({ name: 'id', description: 'UUID của thông báo' })
  @ApiResponse({ status: 200, description: 'Xóa thông báo thành công' })
  @ResponseMessage('Xóa thông báo thành công')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.delete(id, userId);
  }
}
