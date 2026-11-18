import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateStudentConversation(studentId: string) {
    let conv = await this.prisma.conversation.findFirst({
      where: { studentId },
      include: {
        admin: {
          select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
        },
        student: {
          select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
        },
      },
    });

    if (!conv) {
      // Find the primary Admin
      const admin = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (!admin) {
        throw new BadRequestException('Hệ thống chưa thiết lập tài khoản giáo viên Admin');
      }

      conv = await this.prisma.conversation.create({
        data: {
          studentId,
          adminId: admin.id,
        },
        include: {
          admin: {
            select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
          },
          student: {
            select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
          },
        },
      });
    }

    return conv;
  }

  async getConversations(userId: string, role: string) {
    if (role === 'STUDENT') {
      const conv = await this.getOrCreateStudentConversation(userId);
      const lastMessage = await this.prisma.message.findFirst({
        where: { conversationId: conv.id },
        orderBy: { createdAt: 'desc' },
      });
      const unreadCount = await this.prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          isRead: false,
        },
      });

      return [
        {
          ...conv,
          lastMessage,
          unreadCount,
        },
      ];
    }

    // Role ADMIN: Get all conversations
    const conversations = await this.prisma.conversation.findMany({
      include: {
        student: {
          select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
        },
        admin: {
          select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    if (conversations.length === 0) {
      return [];
    }

    const convIds = conversations.map((c) => c.id);

    // Optimized: batch fetch unread counts and recent messages in 2 queries instead of 2N queries
    const [unreadGroups, recentMessages] = await Promise.all([
      this.prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          conversationId: { in: convIds },
          senderId: { not: userId },
          isRead: false,
        },
        _count: { _all: true },
      }),
      this.prisma.message.findMany({
        where: { conversationId: { in: convIds } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const unreadMap = new Map<string, number>();
    for (const g of unreadGroups as any[]) {
      unreadMap.set(g.conversationId, g._count?._all || 0);
    }

    const lastMessageMap = new Map<string, any>();
    for (const msg of recentMessages) {
      if (!lastMessageMap.has(msg.conversationId)) {
        lastMessageMap.set(msg.conversationId, msg);
      }
    }

    return conversations.map((conv) => ({
      ...conv,
      lastMessage: lastMessageMap.get(conv.id) || null,
      unreadCount: unreadMap.get(conv.id) || 0,
    }));
  }

  async getMessages(conversationId: string, userId: string, role: string, take = 50, skip = 0) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    }

    // Check RBAC access
    if (role === 'STUDENT' && conv.studentId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập cuộc trò chuyện này');
    }

    const [total, messages] = await Promise.all([
      this.prisma.message.count({ where: { conversationId } }),
      this.prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        take,
        skip,
      }),
    ]);

    return {
      conversationId,
      total,
      messages,
    };
  }

  async sendMessage(conversationId: string, senderId: string, role: string, content: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    }

    if (role === 'STUDENT' && conv.studentId !== senderId) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này');
    }

    const [message] = await Promise.all([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
        },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true, role: true },
          },
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return message;
  }

  async markAsRead(conversationId: string, userId: string, role: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    }

    if (role === 'STUDENT' && conv.studentId !== userId) {
      throw new ForbiddenException('Không có quyền thao tác trên cuộc trò chuyện này');
    }

    const updated = await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      conversationId,
      markedCount: updated.count,
    };
  }
}
