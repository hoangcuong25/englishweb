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
import { AppException } from '../../core/common/errors/app.exception';
import { AppErrorCode } from '../../core/common/errors/error-codes.enum';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class MaterialsService {
  private readonly jwtSecret: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
      'your_super_secret_jwt_key_teacher_dong_2026';
    this.jwtSecret = secret;
  }

  private maskPhone(phone?: string | null): string {
    if (!phone || phone.length < 7) {
      return '098***321';
    }
    return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
  }

  async create(dto: CreateMaterialDto) {
    let resolvedCourseId = dto.courseId;
    let resolvedLessonId = dto.lessonId;

    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
        include: { module: { select: { courseId: true } } },
      });
      if (!lesson) {
        throw new NotFoundException(`Không tìm thấy bài học ID: ${dto.lessonId}`);
      }
      if (!resolvedCourseId && lesson.module) {
        resolvedCourseId = lesson.module.courseId;
      }
    }

    if (resolvedCourseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: resolvedCourseId },
      });
      if (!course) {
        throw new NotFoundException(`Không tìm thấy khóa học ID: ${resolvedCourseId}`);
      }
    }

    if (!resolvedCourseId && !resolvedLessonId) {
      throw AppException.badRequest(
        AppErrorCode.LESSON_NOT_FOUND,
        'Vui lòng chỉ định khóa học hoặc bài học để gán học liệu.',
      );
    }

    return this.prisma.material.create({
      data: {
        courseId: resolvedCourseId,
        lessonId: resolvedLessonId,
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

  async uploadFile(file: Express.Multer.File, body: any) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw AppException.badRequest(
        AppErrorCode.MATERIAL_FILE_PAYLOAD_MISSING,
        'Vui lòng chọn tệp tin PDF hoặc MP3 từ máy tính để tải lên.',
      );
    }

    const originalName = (file.originalname || '').toLowerCase();
    const isPdf = originalName.endsWith('.pdf') || file.mimetype === 'application/pdf';
    const isAudio =
      originalName.endsWith('.mp3') ||
      originalName.endsWith('.wav') ||
      originalName.endsWith('.m4a') ||
      file.mimetype.startsWith('audio/');

    if (!isPdf && !isAudio) {
      throw AppException.unsupportedMediaType(
        AppErrorCode.MATERIAL_INVALID_MIME_TYPE,
        'Định dạng tệp không hợp lệ. Hệ thống chỉ hỗ trợ .pdf, .mp3, .wav, .m4a.',
      );
    }

    // PDF max 50MB, Audio max 100MB
    const maxPdfSize = 50 * 1024 * 1024;
    const maxAudioSize = 100 * 1024 * 1024;
    if (isPdf && file.size > maxPdfSize) {
      throw AppException.payloadTooLarge(
        AppErrorCode.MATERIAL_FILE_SIZE_EXCEEDED,
        'Dung lượng tệp PDF vượt quá giới hạn 50MB.',
      );
    }
    if (isAudio && file.size > maxAudioSize) {
      throw AppException.payloadTooLarge(
        AppErrorCode.MATERIAL_FILE_SIZE_EXCEEDED,
        'Dung lượng tệp Âm thanh vượt quá giới hạn 100MB.',
      );
    }

    const type = isPdf ? MaterialType.PDF : MaterialType.AUDIO;

    // Resolve course & lesson
    let courseId = body.courseId;
    let lessonId = body.lessonId;

    if (courseId) {
      const course = await this.prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        throw AppException.notFound(
          AppErrorCode.COURSE_NOT_FOUND,
          `Không tìm thấy khóa học ID: ${courseId} để gán học liệu.`,
        );
      }
    }

    if (lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: { select: { courseId: true } } },
      });
      if (!lesson) {
        throw AppException.notFound(
          AppErrorCode.LESSON_NOT_FOUND,
          `Không tìm thấy bài học ID: ${lessonId} để gán học liệu.`,
        );
      }
      if (!courseId && lesson.module) {
        courseId = lesson.module.courseId;
      }
    }

    if (!courseId && !lessonId) {
      const defaultCourse = await this.prisma.course.findFirst();
      if (defaultCourse) {
        courseId = defaultCourse.id;
      } else {
        throw AppException.badRequest(
          AppErrorCode.COURSE_NOT_FOUND,
          'Hệ thống chưa có khóa học nào để gán học liệu. Vui lòng tạo khóa học trước.',
        );
      }
    }

    const title = (body.title && body.title.trim()) || file.originalname;

    // Ensure physical storage folder exists
    const privateStorageDir = path.join(process.cwd(), 'private_storage', 'materials');
    if (!fs.existsSync(privateStorageDir)) {
      fs.mkdirSync(privateStorageDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || (isPdf ? '.pdf' : '.mp3');
    const safeBase = title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const fileName = `${Date.now()}_${safeBase}${ext}`;
    const targetPath = path.join(privateStorageDir, fileName);

    fs.writeFileSync(targetPath, file.buffer);

    const isPrivate = body.isPrivate !== undefined ? String(body.isPrivate) === 'true' : true;
    const isWatermarked = body.isWatermarked !== undefined ? String(body.isWatermarked) === 'true' : true;

    return this.prisma.material.create({
      data: {
        courseId: courseId || null,
        lessonId: lessonId || null,
        title,
        type,
        fileKey: fileName,
        fileSize: file.size,
        durationSeconds: isAudio ? (Number(body.durationSeconds) || 300) : null,
        isPrivate,
        isWatermarked,
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
      where.OR = [
        { courseId: query.courseId },
        { lesson: { module: { courseId: query.courseId } } },
      ];
    }
    if (query.search) {
      const searchConditions = [
        { title: { contains: query.search } },
        { fileKey: { contains: query.search } },
      ];
      if (where.OR) {
        where.AND = [
          ...(where.AND || []),
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // SEC-007: Students can only view materials of courses in which they are actively enrolled (status = "ACTIVE")
    if (user?.role !== Role.ADMIN && user?.id) {
      const activeEnrollments = await this.prisma.enrollment.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        select: { courseId: true },
      });
      const enrolledCourseIds = activeEnrollments.map((e) => e.courseId);

      // If student is not enrolled in any course, return empty list
      if (enrolledCourseIds.length === 0) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      // If student requested a specific course they are not enrolled in, return empty list
      if (query.courseId && !enrolledCourseIds.includes(query.courseId)) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { courseId: { in: enrolledCourseIds } },
            {
              lesson: {
                module: {
                  courseId: { in: enrolledCourseIds },
                },
              },
            },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
            },
          },
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
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: { id: true, title: true, slug: true },
                },
              },
            },
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
        course: { select: { id: true, title: true } },
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
      const courseId = material.courseId || material.lesson?.module?.courseId;

      if (!courseId) {
        throw new ForbiddenException(
          'Tài liệu không hợp lệ hoặc chưa được gán vào khóa học nào',
        );
      }

      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId,
          status: 'ACTIVE',
        },
      });

      if (!enrollment) {
        throw new ForbiddenException(
          'Học viên cần ghi danh và được kích hoạt khóa học này để truy cập tài liệu bảo mật',
        );
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

    // BIZ-01: Check for physical file in private storage first
    let stream: Readable;
    let fileSize: number;
    const privateStorageDir = path.join(process.cwd(), 'private_storage', 'materials');
    if (!fs.existsSync(privateStorageDir)) {
      fs.mkdirSync(privateStorageDir, { recursive: true });
    }

    const physicalPath = material.fileKey
      ? path.join(privateStorageDir, material.fileKey)
      : path.join(privateStorageDir, `${material.id}.${material.type === MaterialType.PDF ? 'pdf' : 'mp3'}`);

    if (fs.existsSync(physicalPath)) {
      const stat = fs.statSync(physicalPath);
      fileSize = stat.size;
      stream = fs.createReadStream(physicalPath);
    } else {
      // Fallback document content stream for test/verification
      const buffer = Buffer.from(
        material.type === MaterialType.PDF
          ? `%PDF-1.4 Mock Encrypted Secure Document for ${material.title}`
          : `MOCK_AUDIO_MP3_STREAM_FOR_${material.title}`,
      );
      fileSize = buffer.length;
      stream = Readable.from(buffer);
    }

    return {
      material,
      contentType,
      stream,
      fileSize,
    };
  }
}
