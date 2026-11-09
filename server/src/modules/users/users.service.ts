import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: {
    role?: Role;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          preferredLang: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              enrollments: true,
              studentWritingSubmits: true,
              speakingSubmissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        preferredLang: true,
        createdAt: true,
        updatedAt: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                category: true,
              },
            },
          },
        },
        attendanceRecords: {
          include: {
            classroom: {
              select: {
                name: true,
                scheduledStartTime: true,
              },
            },
          },
        },
        _count: {
          select: {
            studentWritingSubmits: true,
            speakingSubmissions: true,
            quizSubmissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    return user;
  }

  async updateStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    if (user.role === Role.ADMIN && !isActive) {
      throw new BadRequestException('Không thể vô hiệu hóa tài khoản Quản trị viên Master');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // If deactivated, revoke all active sessions immediately
    if (!isActive) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      });
    }

    return updated;
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Revoke old sessions to force re-login with new password
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return {
      message: 'Đặt lại mật khẩu cho học viên thành công',
      userId: id,
    };
  }

  async updateAvatar(id: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    const uploadRes = await this.cloudinaryService.uploadImage(
      file,
      'teacher_dong_academy/avatars',
    );

    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl: uploadRes.secureUrl },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }
}
