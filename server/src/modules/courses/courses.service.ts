import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseCategory, Role } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  getCategories() {
    return [
      { key: CourseCategory.IELTS, nameVi: '1. English Proficiency (IELTS/TOEIC)', code: 'p1' },
      { key: CourseCategory.BUSINESS, nameVi: '2. Professional Development (Business English)', code: 'p2' },
      { key: CourseCategory.PEDAGOGY, nameVi: '3. Năng lực sư phạm & Ứng dụng AI', code: 'p3' },
      { key: CourseCategory.LIFE_SKILLS, nameVi: '4. Kỹ năng sống & Phát triển bản thân', code: 'p4' },
      { key: CourseCategory.KIDS, nameVi: '5. English for Kids & Trải nghiệm thực tế', code: 'p5' },
    ];
  }

  async findAll(role?: Role, category?: CourseCategory, search?: string) {
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
    });

    return courses.map((course) => ({
      ...course,
      moduleCount: course._count?.modules ?? 0,
      studentCount: course._count?.enrollments ?? 0,
    }));
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
      progressPercent: enrollment ? enrollment.progressPercent : 0,
      modules: course.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((lesson) => ({
          ...lesson,
          isCompleted: completedLessonIds.includes(lesson.id),
          isAccessible:
            role === Role.ADMIN ||
            Boolean(enrollment) ||
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

      return {
        enrollmentId: e.id,
        courseId: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        category: e.course.category,
        thumbnail: e.course.thumbnail,
        progressPercent: e.progressPercent,
        enrolledAt: e.enrolledAt,
        totalModules: e.course._count?.modules ?? 0,
        totalLessons,
      };
    });
  }

  async createCourse(dto: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Đường dẫn slug "${dto.slug}" đã tồn tại trên hệ thống`);
    }

    return this.prisma.course.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        category: dto.category,
        thumbnail: dto.thumbnail,
        isPublished: dto.isPublished ?? false,
      },
    });
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

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${id}`);
    }

    return this.prisma.course.delete({ where: { id } });
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
      update: {},
      create: {
        userId,
        courseId,
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
}
