import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { GradeHomeworkDto } from './dto/grade-homework.dto';
import { Role, SubmissionStatus, NotificationType } from '@prisma/client';

@Injectable()
export class HomeworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateHomeworkDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID: ${dto.courseId}`);
    }

    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
      });
      if (!lesson) {
        throw new NotFoundException(`Không tìm thấy bài học với ID: ${dto.lessonId}`);
      }
    }

    const homework = await this.prisma.homework.create({
      data: {
        courseId: dto.courseId,
        lessonId: dto.lessonId || null,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        maxScore: dto.maxScore ?? 100,
        attachmentUrl: dto.attachmentUrl || null,
      },
      include: {
        course: { select: { id: true, title: true, category: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    // Tự động gửi thông báo cho tất cả học viên đã ghi danh vào khóa học này
    try {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId: dto.courseId },
        select: { userId: true },
      });

      const dueFormatted = dto.dueDate
        ? new Date(dto.dueDate).toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : 'Không giới hạn';

      for (const e of enrollments) {
        await this.notificationsService.createNotification({
          userId: e.userId,
          title: `📝 Thầy Đông vừa giao bài tập: ${dto.title}`,
          content: `Khóa học: ${course.title}\nHạn nộp: ${dueFormatted}\nHãy truy cập mục Bài tập về nhà để hoàn thành nhé!`,
          type: NotificationType.HOMEWORK,
          link: '/student/homework',
        });
      }
    } catch (err) {
      console.warn('Lỗi gửi thông báo giao bài tập:', err);
    }

    return homework;
  }

  async findAll(filter?: { courseId?: string }) {
    const where: any = {};
    if (filter?.courseId) {
      where.courseId = filter.courseId;
    }

    const homeworks = await this.prisma.homework.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, category: true } },
        lesson: { select: { id: true, title: true } },
        submissions: {
          select: {
            id: true,
            studentId: true,
            status: true,
            score: true,
            submittedAt: true,
          },
        },
      },
    });

    return homeworks.map((hw) => {
      const totalSubmissions = hw.submissions.length;
      const gradedCount = hw.submissions.filter((s) => s.status === SubmissionStatus.GRADED).length;
      const pendingCount = totalSubmissions - gradedCount;

      return {
        ...hw,
        stats: {
          totalSubmissions,
          gradedCount,
          pendingCount,
        },
      };
    });
  }

  async getMyHomeworks(studentId: string, courseId?: string) {
    // Lấy các khóa học học sinh đã ghi danh
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return [];
    }

    const where: any = {
      courseId: { in: courseIds },
    };
    if (courseId) {
      where.courseId = courseId;
    }

    const homeworks = await this.prisma.homework.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, category: true } },
        lesson: { select: { id: true, title: true } },
        submissions: {
          where: { studentId },
          take: 1,
        },
      },
    });

    return homeworks.map((hw) => {
      const submission = hw.submissions[0] || null;
      let submissionStatus: 'NOT_SUBMITTED' | 'PENDING' | 'GRADED' = 'NOT_SUBMITTED';

      if (submission) {
        submissionStatus = submission.status === SubmissionStatus.GRADED ? 'GRADED' : 'PENDING';
      }

      return {
        id: hw.id,
        courseId: hw.courseId,
        course: hw.course,
        lessonId: hw.lessonId,
        lesson: hw.lesson,
        title: hw.title,
        description: hw.description,
        dueDate: hw.dueDate,
        maxScore: hw.maxScore,
        attachmentUrl: hw.attachmentUrl,
        createdAt: hw.createdAt,
        updatedAt: hw.updatedAt,
        submissionStatus,
        mySubmission: submission,
      };
    });
  }

  async findOne(id: string, userRole: Role, userId: string) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, category: true } },
        lesson: { select: { id: true, title: true } },
        submissions:
          userRole === Role.ADMIN
            ? {
                include: {
                  student: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      avatarUrl: true,
                      phone: true,
                    },
                  },
                },
                orderBy: { submittedAt: 'desc' },
              }
            : {
                where: { studentId: userId },
                take: 1,
              },
      },
    });

    if (!homework) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID: ${id}`);
    }

    return homework;
  }

  async update(id: string, dto: UpdateHomeworkDto) {
    await this.findOne(id, Role.ADMIN, '');

    const data: any = { ...dto };
    if (dto.dueDate) {
      data.dueDate = new Date(dto.dueDate);
    }

    return this.prisma.homework.update({
      where: { id },
      data,
      include: {
        course: { select: { id: true, title: true, category: true } },
        lesson: { select: { id: true, title: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id, Role.ADMIN, '');
    return this.prisma.homework.delete({ where: { id } });
  }

  async submitHomework(homeworkId: string, studentId: string, dto: SubmitHomeworkDto) {
    if (!dto.content && !dto.fileUrl) {
      throw new BadRequestException('Vui lòng cung cấp nội dung bài làm hoặc tệp đính kèm.');
    }

    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        course: true,
      },
    });

    if (!homework) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID: ${homeworkId}`);
    }

    // Kiểm tra học sinh đã đăng ký khóa học này chưa
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: homework.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Bạn chưa ghi danh vào khóa học này để nộp bài.');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { fullName: true },
    });

    // Upsert submission
    const submission = await this.prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId,
        },
      },
      update: {
        content: dto.content || null,
        fileUrl: dto.fileUrl || null,
        submittedAt: new Date(),
        status: SubmissionStatus.PENDING,
      },
      create: {
        homeworkId,
        studentId,
        content: dto.content || null,
        fileUrl: dto.fileUrl || null,
        submittedAt: new Date(),
        status: SubmissionStatus.PENDING,
      },
    });

    // Gửi thông báo cho Admin
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN, isActive: true },
        select: { id: true },
      });

      for (const admin of admins) {
        await this.notificationsService.createNotification({
          userId: admin.id,
          title: `📥 Học viên nộp bài: ${homework.title}`,
          content: `Học viên ${student?.fullName || 'Học viên'} vừa nộp bài tập về nhà cho khóa học "${homework.course.title}".`,
          type: NotificationType.HOMEWORK,
          link: '/admin/homework',
        });
      }
    } catch (err) {
      console.warn('Lỗi gửi thông báo cho admin khi nộp bài:', err);
    }

    return submission;
  }

  async gradeSubmission(submissionId: string, dto: GradeHomeworkDto) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id: submissionId },
      include: {
        homework: {
          include: {
            course: true,
          },
        },
        student: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID: ${submissionId}`);
    }

    const updated = await this.prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback || null,
        gradedAt: new Date(),
        status: SubmissionStatus.GRADED,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        homework: {
          select: {
            id: true,
            title: true,
            maxScore: true,
          },
        },
      },
    });

    // Gửi thông báo kết quả chấm điểm cho học viên
    try {
      await this.notificationsService.createNotification({
        userId: submission.studentId,
        title: `🎉 Thầy Đông đã chấm điểm: ${submission.homework.title}`,
        content: `Điểm số: ${dto.score}/${submission.homework.maxScore} điểm\nLời phê: ${
          dto.feedback || 'Chúc mừng em đã hoàn thành bài tập!'
        }`,
        type: NotificationType.HOMEWORK,
        link: '/student/homework',
      });
    } catch (err) {
      console.warn('Lỗi gửi thông báo chấm điểm:', err);
    }

    return updated;
  }
}
