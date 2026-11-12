import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Role, MaterialType } from '@prisma/client';

@Injectable()
export class MaterialsService {
  private readonly jwtSecret: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'teacher-dong-academy-jwt-secret-key-32chars';
  }

  private maskPhone(phone?: string | null): string {
    if (!phone || phone.length < 7) {
      return '098***321';
    }
    return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
  }

  async create(dto: CreateMaterialDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
    });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học ID: ${dto.lessonId}`);
    }

    return this.prisma.material.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        type: dto.type,
        fileKey: dto.fileKey,
        fileSize: dto.fileSize,
        durationSeconds: dto.durationSeconds,
        isPrivate: dto.isPrivate ?? true,
        isWatermarked: dto.isWatermarked ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateMaterialDto) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) {
      throw new NotFoundException(`Không tìm thấy tài liệu ID: ${id}`);
    }

    return this.prisma.material.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) {
      throw new NotFoundException(`Không tìm thấy tài liệu ID: ${id}`);
    }

    return this.prisma.material.delete({ where: { id } });
  }

  async findAll(
    query: {
      search?: string;
      fileType?: MaterialType;
      courseId?: string;
      lessonId?: string;
      page?: number;
      limit?: number;
    },
    user?: any,
  ) {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.fileType) {
      where.type = query.fileType;
    }
    if (query.lessonId) {
      where.lessonId = query.lessonId;
    }
    if (query.courseId) {
      where.lesson = {
        module: {
          courseId: query.courseId,
        },
      };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { fileKey: { contains: query.search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              isFreePreview: true,
              module: {
                select: {
                  id: true,
                  title: true,
                  course: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.material.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByLessonId(lessonId: string) {
    return this.prisma.material.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Không tìm thấy tài liệu ID: ${id}`);
    }

    return material;
  }

  async generateSignedUrl(materialId: string, user: any) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        lesson: {
          include: {
            module: {
              select: { courseId: true },
            },
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Không tìm thấy tài liệu ID: ${materialId}`);
    }

    // Check access permission
    if (user.role !== Role.ADMIN) {
      const courseId = material.lesson.module.courseId;
      const isFreePreview = material.lesson.isFreePreview;

      if (!isFreePreview) {
        const enrollment = await this.prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId,
            },
          },
        });

        if (!enrollment) {
          throw new ForbiddenException(
            'Học viên cần ghi danh khóa học để truy cập tài liệu bảo mật này',
          );
        }
      }
    }

    // Generate signed token valid for 15 minutes (900 seconds)
    const token = this.jwtService.sign(
      {
        materialId: material.id,
        userId: user.id,
        role: user.role,
        fileKey: material.fileKey,
      },
      {
        secret: this.jwtSecret,
        expiresIn: '15m',
      },
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const studentCode = `TD-STU-${user.id.substring(0, 4).toUpperCase()}`;
    const maskedPhone = this.maskPhone(user.phone);

    return {
      materialId: material.id,
      title: material.title,
      type: material.type,
      signedUrl: `/api/materials/${material.id}/stream?token=${token}`,
      token,
      expiresInSeconds: 900,
      expiresAt: expiresAt.toISOString(),
      watermark: {
        studentName: user.fullName || 'Học viên Teacher Dong',
        studentCode,
        maskedPhone,
        renderedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        displayWarning: 'Bản quyền thuộc về Teacher Dong Academy • Không sao chép hoặc phân phối trái phép',
      },
    };
  }

  async verifyTokenAndGetStream(materialId: string, token: string) {
    if (!token) {
      throw new UnauthorizedException('Thiếu chữ ký bảo mật (token) để truy cập tài liệu');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret: this.jwtSecret });
    } catch {
      throw new UnauthorizedException(
        'Token ký số đã hết hạn hoặc không hợp lệ. Vui lòng làm mới token truy cập.',
      );
    }

    if (payload.materialId !== materialId) {
      throw new ForbiddenException('Token ký số không khớp với tài liệu yêu cầu');
    }

    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new NotFoundException(`Không tìm thấy tài liệu ID: ${materialId}`);
    }

    const contentType =
      material.type === MaterialType.PDF ? 'application/pdf' : 'audio/mpeg';

    // Mock document content buffer for test/verification
    const buffer = Buffer.from(
      material.type === MaterialType.PDF
        ? `%PDF-1.4 Mock Encrypted Secure Document for ${material.title}`
        : `MOCK_AUDIO_MP3_STREAM_FOR_${material.title}`,
    );

    return {
      material,
      contentType,
      buffer,
      fileSize: buffer.length,
    };
  }
}
