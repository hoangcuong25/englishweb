import { Injectable, NotFoundException, ForbiddenException, Optional } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationType, Role } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  content: string;
  type?: NotificationType;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private readonly notificationsGateway?: NotificationsGateway,
  ) {}

  async getUserNotifications(
    userId: string,
    query: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
    };
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    const noti = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!noti) {
      throw new NotFoundException(`Không tìm thấy thông báo ID: ${id}`);
    }
    if (noti.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên thông báo này');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }

  async delete(id: string, userId: string) {
    const noti = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!noti) {
      throw new NotFoundException(`Không tìm thấy thông báo ID: ${id}`);
    }
    if (noti.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa thông báo này');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async createNotification(data: CreateNotificationInput) {
    const noti = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type || NotificationType.SYSTEM,
        link: data.link,
      },
    });

    try {
      this.notificationsGateway?.sendNotificationToUser(data.userId, noti);
    } catch {
      // Do not block database operation if socket fails
    }

    return noti;
  }

  async broadcastNotification(data: {
    title: string;
    content: string;
    type?: NotificationType;
    link?: string;
    targetRole?: Role;
  }) {
    const where: any = { isActive: true };
    if (data.targetRole) {
      where.role = data.targetRole;
    }
    const users = await this.prisma.user.findMany({ where, select: { id: true } });
    if (users.length === 0) {
      return { count: 0, message: 'Không có người dùng nào thỏa điều kiện nhận thông báo' };
    }

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: data.title,
        content: data.content,
        type: data.type || NotificationType.SYSTEM,
        link: data.link,
      })),
    });

    try {
      this.notificationsGateway?.broadcastNotification({
        title: data.title,
        content: data.content,
        type: data.type || NotificationType.SYSTEM,
        link: data.link,
        targetRole: data.targetRole,
      });
    } catch {
      // Non-blocking
    }

    return {
      count: users.length,
      message: `Đã gửi thông báo thành công tới ${users.length} người dùng`,
    };
  }
}
