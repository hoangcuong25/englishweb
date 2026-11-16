import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AppException } from '../../core/common/errors/app.exception';
import { AppErrorCode } from '../../core/common/errors/error-codes.enum';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { RedisService } from '../../core/redis/redis.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderItemDto } from './dto/reorder-items.dto';
import { Role } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private redisService: RedisService,
  ) {}

  // ==========================================
  // MODULES (CHƯƠNG HỌC)
  // ==========================================

  async createModule(dto: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học ID: ${dto.courseId}`);
    }

    let orderIndex = dto.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      const last = await this.prisma.courseModule.findFirst({
        where: { courseId: dto.courseId },
        orderBy: { orderIndex: 'desc' },
      });
      orderIndex = (last?.orderIndex ?? 0) + 1;
    }

    return this.prisma.courseModule.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        orderIndex,
      },
    });
  }

  async updateModule(id: string, dto: UpdateModuleDto) {
    const moduleItem = await this.prisma.courseModule.findUnique({ where: { id } });
    if (!moduleItem) {
      throw new NotFoundException(`Không tìm thấy chương học ID: ${id}`);
    }

    return this.prisma.courseModule.update({
      where: { id },
      data: dto,
    });
  }

  async deleteModule(id: string) {
    const moduleItem = await this.prisma.courseModule.findUnique({ where: { id } });
    if (!moduleItem) {
      throw new NotFoundException(`Không tìm thấy chương học ID: ${id}`);
    }

    return this.prisma.courseModule.delete({ where: { id } });
  }

  async reorderModules(items: ReorderItemDto[]) {
    const res = await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.courseModule.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        }),
      ),
    );
    await this.redisService.delPattern('cache:courses:*');
    return res;
  }

  // ==========================================
  // LESSONS (BÀI HỌC)
  // ==========================================

  async createLesson(dto: CreateLessonDto) {
    const moduleItem = await this.prisma.courseModule.findUnique({
      where: { id: dto.moduleId },
    });
    if (!moduleItem) {
      throw new NotFoundException(`Không tìm thấy chương học ID: ${dto.moduleId}`);
    }

    let orderIndex = dto.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      const last = await this.prisma.lesson.findFirst({
        where: { moduleId: dto.moduleId },
        orderBy: { orderIndex: 'desc' },
      });
      orderIndex = (last?.orderIndex ?? 0) + 1;
    }

    return this.prisma.lesson.create({
      data: {
        moduleId: dto.moduleId,
        title: dto.title,
        description: dto.description,
        orderIndex,
        durationMinutes: dto.durationMinutes ?? 45,
        videoUrl: dto.videoUrl,
        isFreePreview: dto.isFreePreview ?? false,
      },
    });
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học ID: ${id}`);
    }

    return this.prisma.lesson.update({
      where: { id },
      data: dto,
    });
  }

  async deleteLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học ID: ${id}`);
    }

    return this.prisma.lesson.delete({ where: { id } });
  }

  async reorderLessons(items: ReorderItemDto[]) {
    const res = await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.lesson.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        }),
      ),
    );
    await this.redisService.delPattern('cache:courses:*');
    return res;
  }

  async getLesson(id: string, userId?: string, role?: Role) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        materials: true,
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
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
            topic: true,
            targetWords: true,
            timeLimitMinutes: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học ID: ${id}`);
    }

    const courseId = lesson.module.courseId;

    let isEnrolled = false;
    let isCompleted = false;

    if (userId) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });
      isEnrolled = Boolean(enrollment);

      const progress = await this.prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: id,
          },
        },
      });
      isCompleted = progress?.isCompleted ?? false;
    }

    // Access check: Admin can access all. For students, must be enrolled or lesson isFreePreview
    const isAccessible = role === Role.ADMIN || isEnrolled || lesson.isFreePreview;
    if (!isAccessible) {
      throw new ForbiddenException(
        'Bạn cần ghi danh vào khóa học này để truy cập toàn bộ nội dung bài học',
      );
    }

    return {
      ...lesson,
      isEnrolled,
      isCompleted,
      isAccessible,
    };
  }

  async getStudyLesson(id: string, userId?: string, role?: Role) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    lessons: {
                      orderBy: { orderIndex: 'asc' },
                      select: {
                        id: true,
                        title: true,
                        durationMinutes: true,
                        orderIndex: true,
                        isFreePreview: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        materials: true,
        quizzes: {
          include: {
            questions: {
              select: { id: true, type: true, content: true, points: true, orderIndex: true },
            },
          },
        },
        speakingPrompts: true,
        writingPrompts: true,
      },
    });

    if (!lesson) {
      throw AppException.notFound(AppErrorCode.LESSON_NOT_FOUND, `Không tìm thấy bài học ID: ${id}`);
    }

    const courseId = lesson.module.courseId;
    let isEnrolled = false;
    let isCompleted = false;
    const completedLessonIds: string[] = [];

    if (userId) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });
      isEnrolled = Boolean(enrollment);

      const userProgress = await this.prisma.lessonProgress.findMany({
        where: { userId },
      });
      userProgress.forEach((p) => {
        if (p.isCompleted) completedLessonIds.push(p.lessonId);
      });
      isCompleted = completedLessonIds.includes(id);
    }

    const isAccessible = role === Role.ADMIN || isEnrolled || lesson.isFreePreview;
    if (!isAccessible) {
      throw AppException.forbidden(
        AppErrorCode.LESSON_LOCKED_CHECKPOINT,
        'Bạn cần ghi danh vào khóa học này để truy cập toàn bộ nội dung bài học.',
      );
    }

    const allCourseLessons: Array<{ id: string; title: string; moduleId: string }> = [];
    lesson.module.course.modules.forEach((mod) => {
      mod.lessons.forEach((l) => {
        allCourseLessons.push({ id: l.id, title: l.title, moduleId: mod.id });
      });
    });

    const currentIndex = allCourseLessons.findIndex((l) => l.id === id);
    const prevLesson = currentIndex > 0 ? allCourseLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < allCourseLessons.length - 1 ? allCourseLessons[currentIndex + 1] : null;

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        durationMinutes: lesson.durationMinutes,
        orderIndex: lesson.orderIndex,
        isCompleted,
        isFreePreview: lesson.isFreePreview,
        materials: lesson.materials,
        quizzes: lesson.quizzes,
        speakingPrompts: lesson.speakingPrompts,
        writingPrompts: lesson.writingPrompts,
      },
      course: {
        id: lesson.module.course.id,
        title: lesson.module.course.title,
        modules: lesson.module.course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          lessons: m.lessons.map((l) => ({
            ...l,
            isCompleted: completedLessonIds.includes(l.id),
          })),
        })),
      },
      navigation: {
        prevLesson,
        nextLesson,
      },
    };
  }

  async completeLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học ID: ${lessonId}`);
    }

    const courseId = lesson.module.courseId;

    // 1. Mark lesson as completed
    await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // 2. Count total lessons in this course
    const courseModules = await this.prisma.courseModule.findMany({
      where: { courseId },
      include: {
        lessons: { select: { id: true } },
      },
    });

    const allLessonIds: string[] = [];
    courseModules.forEach((m) => {
      m.lessons.forEach((l) => allLessonIds.push(l.id));
    });

    const totalLessons = allLessonIds.length;

    // 3. Count how many of these lessons are completed by the user
    let completedCount = 0;
    if (totalLessons > 0) {
      completedCount = await this.prisma.lessonProgress.count({
        where: {
          userId,
          lessonId: { in: allLessonIds },
          isCompleted: true,
        },
      });
    }

    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 100;

    // 4. Update enrollment progress
    await this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        progressPercent,
      },
      create: {
        userId,
        courseId,
        progressPercent,
      },
    });

    return {
      message: 'Đã hoàn thành bài học thành công',
      lessonId,
      isCompleted: true,
      courseId,
      completedLessons: completedCount,
      totalLessons,
      progressPercent,
    };
  }

  async updateLessonVideo(lessonId: string, file: Express.Multer.File) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học ID: ${lessonId}`);
    }

    const uploadRes = await this.cloudinaryService.uploadVideo(
      file,
      'teacher_dong_academy/lessons/videos',
    );

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { videoUrl: uploadRes.secureUrl },
    });
  }
}
