import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Role, SkillType, QuestionType } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. QUIZ & QUESTIONS CRUD
  // ==========================================

  async createQuiz(dto: CreateQuizDto) {
    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
      });

      if (!lesson) {
        throw new NotFoundException(`Không tìm thấy bài học ID: ${dto.lessonId}`);
      }
    }

    return this.prisma.quiz.create({
      data: {
        lessonId: dto.lessonId || null,
        title: dto.title,
        description: dto.description,
        skill: dto.skill || SkillType.READING,
        testType: dto.testType || (dto.lessonId ? 'LESSON_QUIZ' : 'PRACTICE_TEST'),
        passage: dto.passage,
        audioUrl: dto.audioUrl,
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
        skill: dto.skill || quiz.skill || SkillType.READING,
        type: dto.type,
        subCategory: dto.subCategory,
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

  // ==========================================
  // 3. 4-SKILLS PRACTICE & DIAGNOSTIC ANALYTICS
  // ==========================================

  async findSkillsTests(skill?: SkillType, role?: Role) {
    const where: any = {};
    if (skill) where.skill = skill;

    const tests = await this.prisma.quiz.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { options: true },
        },
        _count: {
          select: { questions: true, submissions: true },
        },
      },
    });

    return tests.map((t) => this.sanitizeQuizForRole(t, role));
  }

  async getStudentSkillsDiagnostic(userId: string, skillFilter?: SkillType) {
    // 1. Lấy tất cả submissions trắc nghiệm kèm câu trả lời & phân loại dạng câu hỏi
    const submissions = await this.prisma.quizSubmission.findMany({
      where: { userId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                skill: true,
                type: true,
                subCategory: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // 2. Lấy dữ liệu bài nộp Writing
    const writingSubmissions = await this.prisma.writingSubmission.findMany({
      where: { userId },
      select: {
        id: true,
        overallBand: true,
        taskAchievementScore: true,
        coherenceCohesionScore: true,
        lexicalResourceScore: true,
        grammarScore: true,
        status: true,
        submittedAt: true,
      },
    });

    // 3. Lấy dữ liệu bài nộp Speaking
    const speakingSubmissions = await this.prisma.speakingSubmission.findMany({
      where: { userId },
      select: {
        id: true,
        bandScore: true,
        fluencyScore: true,
        lexicalScore: true,
        grammarScore: true,
        pronunciationScore: true,
        status: true,
        submittedAt: true,
      },
    });

    // Tổng hợp điểm số theo 4 Kỹ năng (Skill) & theo Loại kiểu câu hỏi (Question Type)
    const skillStats: Record<string, { total: number; correct: number; incorrect: number }> = {
      [SkillType.READING]: { total: 0, correct: 0, incorrect: 0 },
      [SkillType.LISTENING]: { total: 0, correct: 0, incorrect: 0 },
      [SkillType.WRITING]: { total: 0, correct: 0, incorrect: 0 },
      [SkillType.SPEAKING]: { total: 0, correct: 0, incorrect: 0 },
    };

    const typeStats: Record<
      string,
      { type: string; skill: string; total: number; correct: number; incorrect: number }
    > = {};

    for (const sub of submissions) {
      for (const ans of sub.answers) {
        if (!ans.question) continue;
        const qSkill = ans.question.skill || SkillType.READING;
        const qType = ans.question.type || QuestionType.SINGLE_CHOICE;

        if (skillFilter && qSkill !== skillFilter) continue;

        if (!skillStats[qSkill]) {
          skillStats[qSkill] = { total: 0, correct: 0, incorrect: 0 };
        }
        skillStats[qSkill].total++;
        if (ans.isCorrect) {
          skillStats[qSkill].correct++;
        } else {
          skillStats[qSkill].incorrect++;
        }

        if (!typeStats[qType]) {
          typeStats[qType] = {
            type: qType,
            skill: qSkill,
            total: 0,
            correct: 0,
            incorrect: 0,
          };
        }
        typeStats[qType].total++;
        if (ans.isCorrect) {
          typeStats[qType].correct++;
        } else {
          typeStats[qType].incorrect++;
        }
      }
    }

    const readingTotal = skillStats[SkillType.READING].total;
    const listeningTotal = skillStats[SkillType.LISTENING].total;

    const skillsBreakdown = {
      reading: {
        skill: SkillType.READING,
        totalAttempted: readingTotal,
        correctCount: skillStats[SkillType.READING].correct,
        incorrectCount: skillStats[SkillType.READING].incorrect,
        accuracyPercentage:
          readingTotal > 0 ? Math.round((skillStats[SkillType.READING].correct / readingTotal) * 100) : 0,
      },
      listening: {
        skill: SkillType.LISTENING,
        totalAttempted: listeningTotal,
        correctCount: skillStats[SkillType.LISTENING].correct,
        incorrectCount: skillStats[SkillType.LISTENING].incorrect,
        accuracyPercentage:
          listeningTotal > 0
            ? Math.round((skillStats[SkillType.LISTENING].correct / listeningTotal) * 100)
            : 0,
      },
      writing: {
        skill: SkillType.WRITING,
        totalSubmissions: writingSubmissions.length,
        averageBand:
          writingSubmissions.length > 0
            ? Math.round(
                (writingSubmissions.reduce((acc, curr) => acc + (curr.overallBand || 6.0), 0) /
                  writingSubmissions.length) *
                  2,
              ) / 2
            : null,
      },
      speaking: {
        skill: SkillType.SPEAKING,
        totalSubmissions: speakingSubmissions.length,
        averageBand:
          speakingSubmissions.length > 0
            ? Math.round(
                (speakingSubmissions.reduce((acc, curr) => acc + (curr.bandScore || 6.0), 0) /
                  speakingSubmissions.length) *
                  2,
              ) / 2
            : null,
      },
    };

    // Phân loại chi tiết theo từng kiểu câu hỏi (Matching, MCQ, TFNG, Note completion...)
    const questionTypesBreakdown = Object.values(typeStats).map((item) => {
      const accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      const errorRate = 100 - accuracy;
      let status = 'MODERATE';
      if (accuracy >= 80) status = 'STRONG';
      else if (accuracy < 50) status = 'WEAK';

      return {
        type: item.type,
        skill: item.skill,
        totalAttempted: item.total,
        correctCount: item.correct,
        incorrectCount: item.incorrect,
        accuracyPercentage: accuracy,
        errorRatePercentage: errorRate,
        status,
        recommendation: this.getRecommendationForType(item.type),
      };
    });

    // 1. Phân loại các dạng bài HAY LÀM SAI / ĐIỂM YẾU (Weaknesses)
    const weaknesses = questionTypesBreakdown
      .filter((q) => q.totalAttempted >= 1 && q.accuracyPercentage < 70)
      .sort((a, b) => b.errorRatePercentage - a.errorRatePercentage);

    // 2. Phân loại các dạng bài LÀM ĐÚNG / THẾ MẠNH (Strengths)
    const strengths = questionTypesBreakdown
      .filter((q) => q.totalAttempted >= 1 && q.accuracyPercentage >= 80)
      .sort((a, b) => b.accuracyPercentage - a.accuracyPercentage);

    let diagnosticSummary = 'Học viên cần làm thêm các bài luyện tập để hệ thống tổng hợp đầy đủ dữ liệu phân tích.';
    if (weaknesses.length > 0) {
      const topWeakness = weaknesses[0];
      diagnosticSummary = `Học viên cần đặc biệt lưu ý cải thiện dạng câu hỏi "${topWeakness.type}" (${topWeakness.skill}) với tỷ lệ sai sót là ${topWeakness.errorRatePercentage}%. ${topWeakness.recommendation}`;
    } else if (strengths.length > 0) {
      diagnosticSummary = `Học viên đang duy trì phong độ xuất sắc ở các dạng câu hỏi thế mạnh: ${strengths.map((s) => s.type).join(', ')}. Hãy tiếp tục duy trì và thử thách với các đề thi Mock Test nâng cao.`;
    }

    return {
      userId,
      filterSkill: skillFilter || null,
      totalTestsCompleted: submissions.length,
      skillsBreakdown,
      questionTypesBreakdown,
      weaknesses,
      strengths,
      diagnosticSummary,
    };
  }

  async getAdminSkillsDiagnosticOverview(skillFilter?: SkillType) {
    const submissions = await this.prisma.quizSubmission.findMany({
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                skill: true,
                type: true,
              },
            },
          },
        },
      },
    });

    const typeStats: Record<
      string,
      { type: string; skill: string; total: number; correct: number; incorrect: number }
    > = {};

    let totalAnswers = 0;
    let totalCorrect = 0;

    for (const sub of submissions) {
      for (const ans of sub.answers) {
        if (!ans.question) continue;
        const qSkill = ans.question.skill || SkillType.READING;
        const qType = ans.question.type || QuestionType.SINGLE_CHOICE;

        if (skillFilter && qSkill !== skillFilter) continue;

        totalAnswers++;
        if (ans.isCorrect) totalCorrect++;

        if (!typeStats[qType]) {
          typeStats[qType] = {
            type: qType,
            skill: qSkill,
            total: 0,
            correct: 0,
            incorrect: 0,
          };
        }
        typeStats[qType].total++;
        if (ans.isCorrect) typeStats[qType].correct++;
        else typeStats[qType].incorrect++;
      }
    }

    const academyQuestionTypes = Object.values(typeStats).map((item) => {
      const accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      return {
        type: item.type,
        skill: item.skill,
        totalAttempted: item.total,
        correctCount: item.correct,
        incorrectCount: item.incorrect,
        accuracyPercentage: accuracy,
        errorRatePercentage: 100 - accuracy,
        recommendation: this.getRecommendationForType(item.type),
      };
    });

    const topDifficultTypes = [...academyQuestionTypes]
      .filter((i) => i.totalAttempted >= 1)
      .sort((a, b) => b.errorRatePercentage - a.errorRatePercentage)
      .slice(0, 5);

    return {
      totalSubmissionsCount: submissions.length,
      totalQuestionsAttempted: totalAnswers,
      averageAcademyAccuracy: totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
      topDifficultTypes,
      academyQuestionTypes,
    };
  }

  getRecommendationForType(type: string): string {
    switch (type) {
      case 'MATCHING_HEADINGS':
        return 'Cần cải thiện kỹ năng đọc lướt (Skimming) để xác định ý chính của từng đoạn văn. Không dịch từng từ đơn lẻ, chú ý Topic Sentence và câu kết mỗi đoạn.';
      case 'TRUE_FALSE_NOT_GIVEN':
        return 'Cần phân biệt rõ: False là thông tin trực tiếp mâu thuẫn/trái ngược bài đọc; Not Given là bài đọc hoàn toàn không đề cập hoặc không đủ căn cứ để kết luận.';
      case 'YES_NO_NOT_GIVEN':
        return 'Chú ý quan điểm và thái độ của tác giả (Claims/Opinions), tránh nhầm lẫn giữa sự thật khách quan (Facts) và lập luận chủ quan.';
      case 'MATCHING_INFORMATION':
        return 'Luyện kỹ năng quét từ khóa (Scanning) tìm các từ đồng nghĩa (Paraphrasing), danh từ riêng, số liệu và mốc thời gian.';
      case 'SUMMARY_COMPLETION':
      case 'SENTENCE_COMPLETION':
        return 'Xác định từ loại cần điền (danh từ, động từ, tính từ) trước khi tìm trong bài và tuân thủ nghiêm ngặt giới hạn số từ (NO MORE THAN X WORDS).';
      case 'NOTE_COMPLETION':
      case 'FORM_COMPLETION':
        return 'Luyện kỹ năng nghe bắt từ khóa định hướng (Signpost words), đánh vần tên riêng, số điện thoại và phát hiện bẫy tự sửa (Self-correction).';
      case 'MAP_DIAGRAM_LABELING':
        return 'Trước khi nghe, quan sát kỹ la bàn (North/South), điểm xuất phát (Starting point) và các mốc định vị chính trong sơ đồ.';
      case 'MULTIPLE_CHOICE':
        return 'Tập trung loại trừ các phương án gây nhiễu (Distractors) chứa từ khóa giống trong bài nhưng ngữ cảnh bị bẻ cong hoặc trái ngược ý tác giả.';
      case 'SHORT_ANSWER':
        return 'Xác định từ để hỏi (Who, What, Where, When) và kiểm tra cẩn thận chính tả các từ vựng chuyên ngành.';
      default:
        return 'Tăng cường ôn tập từ vựng học thuật chuyên đề và luyện tập bổ sung thêm các bài tập thuộc dạng đề này.';
    }
  }
}
