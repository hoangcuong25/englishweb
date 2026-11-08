import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Role } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. QUIZ & QUESTIONS CRUD
  // ==========================================

  async createQuiz(dto: CreateQuizDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học ID: ${dto.lessonId}`);
    }

    return this.prisma.quiz.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        description: dto.description,
        timeLimitMinutes: dto.timeLimitMinutes ?? 15,
        passScore: dto.passScore ?? 80,
      },
    });
  }

  async getQuizByLesson(lessonId: string, role?: Role) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: true,
          },
        },
      },
    });

    return quizzes.map((q) => this.sanitizeQuizForRole(q, role));
  }

  async getQuizById(id: string, role?: Role) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Không tìm thấy bài Quiz ID: ${id}`);
    }

    return this.sanitizeQuizForRole(quiz, role);
  }

  private sanitizeQuizForRole(quiz: any, role?: Role) {
    if (role === Role.ADMIN) return quiz;

    // For students: hide `isCorrect` from options to prevent inspection
    return {
      ...quiz,
      questions: quiz.questions.map((q: any) => ({
        ...q,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          content: opt.content,
        })),
      })),
    };
  }

  async addQuestion(quizId: string, dto: CreateQuestionDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new NotFoundException(`Không tìm thấy bài Quiz ID: ${quizId}`);
    }

    return this.prisma.question.create({
      data: {
        quizId,
        content: dto.content,
        type: dto.type,
        points: dto.points ?? 1.0,
        explanation: dto.explanation,
        orderIndex: dto.orderIndex ?? 0,
        options: {
          create: dto.options.map((opt) => ({
            content: opt.content,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: { options: true },
    });
  }

  async deleteQuiz(id: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      throw new NotFoundException(`Không tìm thấy bài Quiz ID: ${id}`);
    }

    return this.prisma.quiz.delete({ where: { id } });
  }

  // ==========================================
  // 2. TAKING & AUTOMATED GRADING
  // ==========================================

  async submitQuiz(quizId: string, dto: SubmitQuizDto, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            module: { select: { courseId: true } },
          },
        },
        questions: {
          include: { options: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Không tìm thấy bài Quiz ID: ${quizId}`);
    }

    const totalQuestions = quiz.questions.length;
    let correctCount = 0;
    const answerResults: any[] = [];

    for (const q of quiz.questions) {
      const studentAns = dto.answers.find((a) => a.questionId === q.id);
      let isCorrect = false;

      if (studentAns) {
        if (studentAns.selectedOptionId) {
          const selectedOption = q.options.find(
            (o) => o.id === studentAns.selectedOptionId,
          );
          if (selectedOption?.isCorrect) {
            isCorrect = true;
          }
        } else if (studentAns.textAnswer) {
          const correctOption = q.options.find((o) => o.isCorrect);
          if (
            correctOption &&
            correctOption.content.trim().toLowerCase() ===
              studentAns.textAnswer.trim().toLowerCase()
          ) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) correctCount++;

      answerResults.push({
        questionId: q.id,
        selectedOptionId: studentAns?.selectedOptionId || null,
        textAnswer: studentAns?.textAnswer || null,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 100;
    const isPassed = score >= quiz.passScore;

    // Create Submission record
    const submission = await this.prisma.quizSubmission.create({
      data: {
        quizId,
        userId,
        score,
        totalQuestions,
        correctAnswers: correctCount,
        isPassed,
        answers: {
          create: answerResults.map((ans) => ({
            questionId: ans.questionId,
            selectedOptionId: ans.selectedOptionId,
            textAnswer: ans.textAnswer,
            isCorrect: ans.isCorrect,
          })),
        },
      },
    });

    // SRS Requirement: Khi đạt điểm sàn >= 80%, tự động mở khóa / hoàn thành bài học kế tiếp!
    if (isPassed && quiz.lessonId) {
      await this.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: quiz.lessonId,
          },
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
        },
        create: {
          userId,
          lessonId: quiz.lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Recalculate progress for the course
      const courseId = quiz.lesson.module.courseId;
      const courseModules = await this.prisma.courseModule.findMany({
        where: { courseId },
        include: { lessons: { select: { id: true } } },
      });

      const allLessonIds: string[] = [];
      courseModules.forEach((m) => {
        m.lessons.forEach((l) => allLessonIds.push(l.id));
      });

      if (allLessonIds.length > 0) {
        const completedLessons = await this.prisma.lessonProgress.count({
          where: {
            userId,
            lessonId: { in: allLessonIds },
            isCompleted: true,
          },
        });

        const progressPercent = Math.round(
          (completedLessons / allLessonIds.length) * 100,
        );

        await this.prisma.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: { progressPercent },
          create: { userId, courseId, progressPercent },
        });
      }
    }

    return {
      message: isPassed
        ? `Chúc mừng bạn đã vượt qua bài Quiz với số điểm ${score}%!`
        : `Bạn chưa đạt điểm sàn yêu cầu (${quiz.passScore}%). Điểm đạt: ${score}%. Hãy ôn tập và thử lại!`,
      submissionId: submission.id,
      score,
      passScore: quiz.passScore,
      isPassed,
      correctAnswers: correctCount,
      totalQuestions,
      answers: answerResults,
    };
  }

  async getMySubmissions(quizId: string, userId: string) {
    return this.prisma.quizSubmission.findMany({
      where: { quizId, userId },
      orderBy: { submittedAt: 'desc' },
      include: {
        answers: {
          include: {
            question: { select: { id: true, content: true, explanation: true } },
          },
        },
      },
    });
  }
}
