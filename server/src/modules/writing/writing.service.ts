import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { GeminiService } from '../../core/gemini/gemini.service';
import { CreateWritingPromptDto } from './dto/create-writing-prompt.dto';
import { SubmitWritingDto } from './dto/submit-writing.dto';
import { ApproveWritingDto } from './dto/approve-writing.dto';
import { SaveWritingDraftDto } from './dto/save-writing-draft.dto';
import {
  WritingTaskType,
  WritingSubmissionStatus,
  Role,
  NotificationType,
} from '@prisma/client';

@Injectable()
export class WritingService {
  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  // ==========================================
  // 1. PROMPTS MANAGEMENT
  // ==========================================

  async findAllPrompts(taskType?: WritingTaskType, lessonId?: string) {
    const where: any = {};
    if (taskType) where.taskType = taskType;
    if (lessonId) where.lessonId = lessonId;

    return this.prisma.writingPrompt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });
  }

  async findPromptById(id: string) {
    const prompt = await this.prisma.writingPrompt.findUnique({
      where: { id },
      include: {
        lesson: {
          select: { id: true, title: true },
        },
      },
    });

    if (!prompt) {
      throw new NotFoundException(`Không tìm thấy đề bài Writing ID: ${id}`);
    }

    return prompt;
  }

  async createPrompt(dto: CreateWritingPromptDto) {
    return this.prisma.writingPrompt.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        taskType: dto.taskType,
        topic: dto.topic,
        targetWords: dto.targetWords ?? 250,
        timeLimitMinutes: dto.timeLimitMinutes ?? 40,
        sampleEssay: dto.sampleEssay,
      },
    });
  }

  async updatePrompt(id: string, dto: Partial<CreateWritingPromptDto>) {
    await this.findPromptById(id);
    return this.prisma.writingPrompt.update({
      where: { id },
      data: dto,
    });
  }

  async deletePrompt(id: string) {
    await this.findPromptById(id);
    return this.prisma.writingPrompt.delete({ where: { id } });
  }

  // ==========================================
  // 2. AI EVALUATION PIPELINE & SUBMISSION
  // ==========================================

  async submitEssay(dto: SubmitWritingDto, userId: string) {
    const prompt = await this.findPromptById(dto.promptId);

    // Calculate word count
    const words = dto.content.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Run Google Gemini AI Evaluation Pipeline (4 criteria: TR, CC, LR, GRA)
    const evaluation = await this.geminiService.evaluateIeltsWriting({
      taskType: prompt.taskType,
      topic: prompt.topic,
      targetWords: prompt.targetWords,
      essayContent: dto.content,
      sampleEssay: prompt.sampleEssay,
    });

    const submission = await this.prisma.writingSubmission.create({
      data: {
        promptId: dto.promptId,
        userId,
        content: dto.content,
        wordCount,
        timeSpentSeconds: dto.timeSpentSeconds ?? 0,
        status: WritingSubmissionStatus.AI_EVALUATED,
        taskAchievementScore: evaluation.taskAchievementScore,
        coherenceCohesionScore: evaluation.coherenceCohesionScore,
        lexicalResourceScore: evaluation.lexicalResourceScore,
        grammarScore: evaluation.grammarScore,
        overallBand: evaluation.overallBand,
        aiFeedback: evaluation.aiFeedback,
        aiSuggestions: evaluation.aiSuggestions,
        sampleBand8Essay: evaluation.sampleBand8Essay,
      },
      include: {
        prompt: {
          select: { id: true, title: true, taskType: true },
        },
      },
    });

    // Auto-clean draft if exists
    try {
      await this.prisma.writingDraft.deleteMany({
        where: { userId, promptId: dto.promptId },
      });
    } catch {
      // Ignore if no draft
    }

    // Automatically create a notification for Admin in the database
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN, isActive: true },
        select: { id: true },
      });
      if (admins.length > 0) {
        await this.prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: 'Bài viết Writing mới chờ duyệt',
            content: `Học viên vừa nộp bài cho chủ đề "${prompt.title}". AI đề xuất Band ${evaluation.overallBand}, đang chờ bạn phê duyệt.`,
            type: NotificationType.WRITING,
            link: '/admin/writing-review',
            isRead: false,
          })),
        });
      }
    } catch {
      // Do not block submission
    }

    return {
      message: 'Bài viết đã được nộp và phân tích bởi AI. Đang chờ Admin phê duyệt kết quả chính thức.',
      submission,
    };
  }

  // ==========================================
  // DRAFTS (AUTO-SAVE)
  // ==========================================

  async saveDraft(userId: string, dto: SaveWritingDraftDto) {
    await this.findPromptById(dto.promptId);

    const words = dto.content.trim().split(/\s+/).filter(Boolean);
    const wordCount = dto.wordCount ?? words.length;

    return this.prisma.writingDraft.upsert({
      where: {
        userId_promptId: {
          userId,
          promptId: dto.promptId,
        },
      },
      create: {
        userId,
        promptId: dto.promptId,
        content: dto.content,
        wordCount,
        durationSeconds: dto.durationSeconds ?? 0,
      },
      update: {
        content: dto.content,
        wordCount,
        durationSeconds: dto.durationSeconds ?? 0,
      },
    });
  }

  async getDraft(userId: string, promptId: string) {
    return this.prisma.writingDraft.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });
  }

  async deleteDraft(userId: string, promptId: string) {
    const existing = await this.prisma.writingDraft.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });
    if (!existing) {
      return { success: true, message: 'Không có bản nháp để xóa' };
    }

    await this.prisma.writingDraft.delete({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });
    return { success: true, message: 'Đã xóa bản nháp thành công' };
  }

  // ==========================================
  // 3. STUDENT SUBMISSIONS & PROGRESS
  // ==========================================

  async getMySubmissions(userId: string) {
    return this.prisma.writingSubmission.findMany({
      where: { userId },
      include: {
        prompt: {
          select: { id: true, title: true, taskType: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getSubmissionById(id: string, userId: string, role: Role) {
    const submission = await this.prisma.writingSubmission.findUnique({
      where: { id },
      include: {
        prompt: true,
        user: {
          select: { id: true, fullName: true, email: true },
        },
        approvedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp Writing ID: ${id}`);
    }

    if (role !== Role.ADMIN && submission.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập bài viết này');
    }

    return submission;
  }

  // ==========================================
  // 4. ADMIN APPROVAL & OVERRIDE WORKFLOW
  // ==========================================

  async getAdminSubmissions(status?: WritingSubmissionStatus) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.writingSubmission.findMany({
      where,
      include: {
        prompt: { select: { id: true, title: true, taskType: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async approveSubmission(
    id: string,
    dto: ApproveWritingDto,
    adminId: string,
  ) {
    const submission = await this.prisma.writingSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp Writing ID: ${id}`);
    }

    const updated = await this.prisma.writingSubmission.update({
      where: { id },
      data: {
        status: WritingSubmissionStatus.APPROVED,
        adminOverrideBand: dto.adminOverrideBand ?? submission.overallBand,
        adminFeedback: dto.adminFeedback,
        approvedAt: new Date(),
        approvedById: adminId,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        prompt: { select: { id: true, title: true } },
      },
    });

    // Automatically create a notification for Student in the database
    try {
      const finalBand = dto.adminOverrideBand ?? submission.overallBand;
      await this.prisma.notification.create({
        data: {
          userId: submission.userId,
          title: 'Bài viết IELTS Writing đã duyệt',
          content: `Giáo viên đã phê duyệt bài viết "${updated.prompt?.title}". Điểm chính thức: Band ${finalBand}!`,
          type: NotificationType.WRITING,
          link: '/student/writing',
          isRead: false,
        },
      });
    } catch {
      // Do not block approval
    }

    return updated;
  }
}
