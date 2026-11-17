import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { RedisService } from '../../core/redis/redis.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseCategory, Role } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private redisService: RedisService,
  ) {}

  getCategories() {
    return [
      { key: CourseCategory.ENGLISH, nameVi: 'Tiếng Anh (IELTS / Giao tiếp / Học thuật)', isEnglish: true, group: 'TIẾNG ANH' },
      { key: CourseCategory.IELTS, nameVi: 'Luyện thi IELTS Chuyên Sâu (4 Kỹ Năng)', isEnglish: true, group: 'TIẾNG ANH' },
      { key: CourseCategory.BUSINESS, nameVi: 'Business English (Tiếng Anh Thương Mại)', isEnglish: true, group: 'TIẾNG ANH' },
      { key: CourseCategory.KIDS, nameVi: 'English for Kids (Tiếng Anh Thiếu Nhi)', isEnglish: true, group: 'TIẾNG ANH' },
      { key: CourseCategory.LIFE_SKILLS, nameVi: 'Kỹ Năng Sống', isEnglish: false, group: 'KỸ NĂNG & PHÁT TRIỂN' },
      { key: CourseCategory.SOFT_SKILLS, nameVi: 'Kỹ Năng Mềm', isEnglish: false, group: 'KỸ NĂNG & PHÁT TRIỂN' },
      { key: CourseCategory.PERSONAL_DEV, nameVi: 'Phát Triển Bản Thân', isEnglish: false, group: 'KỸ NĂNG & PHÁT TRIỂN' },
      { key: CourseCategory.PEDAGOGY, nameVi: 'Năng Lực Sư Phạm & Giảng Dạy', isEnglish: false, group: 'KỸ NĂNG & PHÁT TRIỂN' },
    ];
  }

  async findAll(role?: Role, category?: CourseCategory, search?: string) {
    const cacheKey = `cache:courses:${role || 'PUBLIC'}:${category || 'ALL'}:${search || 'NONE'}`;
    const cached = await this.redisService.getJson<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: any = {};

    // Students / Guests can only view published courses
    if (role !== Role.ADMIN) {
      whereClause.isPublished = true;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const courses = await this.prisma.course.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // PERF-001: Protect against unbounded memory allocation
    });

    const result = courses.map((course) => ({
      ...course,
      moduleCount: course._count?.modules ?? 0,
      studentCount: course._count?.enrollments ?? 0,
    }));

    await this.redisService.setJson(cacheKey, result, 300);
    return result;
  }

  async findBySlugOrId(identifier: string, userId?: string, role?: Role) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const course = await this.prisma.course.findFirst({
      where: isUuid ? { id: identifier } : { slug: identifier },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              include: {
                materials: true,
                quizzes: {
                  select: {
                    id: true,
                    title: true,
                    timeLimitMinutes: true,
                    passScore: true,
                  },
                },
                speakingPrompts: {
                  select: {
                    id: true,
                    title: true,
                    topic: true,
                    minSeconds: true,
                    maxSeconds: true,
                  },
                },
                writingPrompts: {
                  select: {
                    id: true,
                    title: true,
                    taskType: true,
                    targetWords: true,
                    timeLimitMinutes: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với định danh: ${identifier}`);
    }

    if (!course.isPublished && role !== Role.ADMIN) {
      throw new ForbiddenException('Khóa học này hiện chưa được xuất bản');
    }

    let enrollment: any = null;
    let completedLessonIds: string[] = [];

    if (userId) {
      enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });

      const lessonProgresses = await this.prisma.lessonProgress.findMany({
        where: {
          userId,
          isCompleted: true,
        },
        select: { lessonId: true },
      });
      completedLessonIds = lessonProgresses.map((lp) => lp.lessonId);
    }

    return {
      ...course,
      studentCount: course._count?.enrollments ?? 0,
      isEnrolled: Boolean(enrollment),
      enrollmentStatus: enrollment ? (enrollment as any).status : null,
      progressPercent: enrollment ? enrollment.progressPercent : 0,
      modules: course.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((lesson) => ({
          ...lesson,
          isCompleted: completedLessonIds.includes(lesson.id),
          isAccessible:
            role === Role.ADMIN ||
            (Boolean(enrollment) && (enrollment as any).status === 'ACTIVE') ||
            lesson.isFreePreview,
        })),
      })),
    };
  }

  async findMyLearning(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: { id: true, title: true, orderIndex: true },
                },
              },
            },
            _count: {
              select: { modules: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((e) => {
      let totalLessons = 0;
      e.course.modules.forEach((m) => {
        totalLessons += m.lessons.length;
      });

      const isEnglish = (
        [
          CourseCategory.ENGLISH,
          CourseCategory.IELTS,
          CourseCategory.BUSINESS,
          CourseCategory.KIDS,
        ] as CourseCategory[]
      ).includes(e.course.category) || !!(e.course as any).isEnglishCourse;

      return {
        enrollmentId: e.id,
        courseId: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        category: e.course.category,
        isEnglishCourse: isEnglish,
        thumbnail: e.course.thumbnail,
        progressPercent: e.progressPercent,
        enrolledAt: e.enrolledAt,
        status: (e as any).status || 'ACTIVE',
        paymentNote: (e as any).paymentNote,
        paymentAmount: (e as any).paymentAmount,
        totalModules: e.course._count?.modules ?? 0,
        totalLessons,
      };
    });
  }

  /**
   * Kiểm tra quyền truy cập phân hệ IELTS 4 Kỹ Năng:
   * Yêu cầu học viên phải sở hữu ít nhất 1 khóa học Tiếng Anh (ENGLISH, IELTS, BUSINESS, KIDS).
   */
  async checkIeltsAccess(userId: string, role?: Role) {
    if (role === Role.ADMIN) {
      return {
        hasAccess: true,
        reason: 'ADMIN_FULL_ACCESS',
        enrolledEnglishCourses: [],
      };
    }

    const englishCategories: CourseCategory[] = [
      CourseCategory.ENGLISH,
      CourseCategory.IELTS,
      CourseCategory.BUSINESS,
      CourseCategory.KIDS,
    ];

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        course: {
          OR: [
            { category: { in: englishCategories } },
            { isEnglishCourse: true },
          ],
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            thumbnail: true,
          },
        },
      },
    });

    const hasAccess = enrollments.length > 0;

    return {
      hasAccess,
      enrolledEnglishCourses: enrollments.map((e) => e.course),
      message: hasAccess
        ? 'Học viên đã mở khóa trọn bộ phân hệ IELTS 4 Kỹ Năng.'
        : 'Phân hệ IELTS 4 Kỹ Năng chỉ dành riêng cho học viên đăng ký các khóa học Tiếng Anh. Hãy đăng ký khóa học Tiếng Anh để mở khóa!',
    };
  }

  async createCourse(dto: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Đường dẫn slug "${dto.slug}" đã tồn tại trên hệ thống`);
    }

    const isEnglishCourse = (
      [
        CourseCategory.ENGLISH,
        CourseCategory.IELTS,
        CourseCategory.BUSINESS,
        CourseCategory.KIDS,
      ] as CourseCategory[]
    ).includes(dto.category);

    const created = await this.prisma.course.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        category: dto.category,
        isEnglishCourse,
        thumbnail: dto.thumbnail,
        isPublished: dto.isPublished ?? false,
      },
    });

    await this.redisService.delPattern('cache:courses:*');
    return created;
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${id}`);
    }

    if (dto.slug && dto.slug !== course.slug) {
      const existing = await this.prisma.course.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Đường dẫn slug "${dto.slug}" đã tồn tại`);
      }
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: dto,
    });

    await this.redisService.delPattern('cache:courses:*');
    return updated;
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${id}`);
    }

    const deleted = await this.prisma.course.delete({ where: { id } });
    await this.redisService.delPattern('cache:courses:*');
    return deleted;
  }

  async enrollCourse(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${courseId}`);
    }

    const enrollment = await this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        status: 'ACTIVE',
      },
      create: {
        userId,
        courseId,
        status: 'ACTIVE',
        progressPercent: 0,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return {
      message: 'Ghi danh khóa học thành công',
      enrollment,
    };
  }

  /**
   * Học viên gửi yêu cầu đăng ký khóa học kèm mã QR chuyển khoản (chờ Admin xác nhận)
   */
  async requestEnrollment(
    courseId: string,
    userId: string,
    paymentNote?: string,
    paymentAmount?: number,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${courseId}`);
    }

    const enrollment = await this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        status: 'PENDING',
        paymentNote: paymentNote || `TD ${userId} ${course.slug}`,
        paymentAmount: paymentAmount || 2500000,
        enrolledAt: new Date(),
      },
      create: {
        userId,
        courseId,
        status: 'PENDING',
        paymentNote: paymentNote || `TD ${userId} ${course.slug}`,
        paymentAmount: paymentAmount || 2500000,
        progressPercent: 0,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true, category: true },
        },
      },
    });

    return {
      message:
        'Yêu cầu đăng ký đã được ghi nhận. Vui lòng quét mã QR chuyển khoản và chờ Admin xác nhận.',
      enrollment,
    };
  }

  /**
   * Admin lấy danh sách các yêu cầu đăng ký / ghi danh khóa học
   */
  async getAdminEnrollments(status?: string, courseId?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (courseId) {
      where.courseId = courseId;
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments;
  }

  /**
   * Admin đối soát số dư thủ công và duyệt kích hoạt khóa học cho học viên
   */
  async approveEnrollment(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { user: true, course: true },
    });

    if (!enrollment) {
      throw new NotFoundException(`Không tìm thấy yêu cầu ghi danh ID: ${enrollmentId}`);
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
      },
      include: { user: true, course: true },
    });

    await this.redisService.delPattern('cache:courses:*');

    return {
      message: `Đã xác nhận thanh toán & kích hoạt khóa học "${updated.course.title}" cho học viên ${updated.user.fullName}!`,
      enrollment: updated,
    };
  }

  /**
   * Admin từ chối yêu cầu đăng ký khóa học
   */
  async rejectEnrollment(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(`Không tìm thấy yêu cầu ghi danh ID: ${enrollmentId}`);
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'REJECTED',
      },
      include: { user: true, course: true },
    });

    await this.redisService.delPattern('cache:courses:*');

    return {
      message: 'Đã từ chối yêu cầu đăng ký khóa học',
      enrollment: updated,
    };
  }

  /**
   * Admin ghi danh thủ công học viên vào khóa học bất kỳ
   */
  async manualEnroll(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${courseId}`);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy học viên ID: ${userId}`);
    }

    const enrollment = await this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        status: 'ACTIVE',
        approvedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        status: 'ACTIVE',
        approvedAt: new Date(),
        progressPercent: 0,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    await this.redisService.delPattern('cache:courses:*');

    return {
      message: `Đã ghi danh thủ công học viên "${user.fullName}" vào khóa học "${course.title}" thành công!`,
      enrollment,
    };
  }

  async updateThumbnail(courseId: string, file: Express.Multer.File) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${courseId}`);
    }

    const uploadRes = await this.cloudinaryService.uploadImage(
      file,
      'teacher_dong_academy/courses',
    );

    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: { thumbnail: uploadRes.secureUrl },
    });

    await this.redisService.delPattern('cache:courses:*');
    return updated;
  }
}
