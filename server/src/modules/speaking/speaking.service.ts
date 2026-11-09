import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateSpeakingPromptDto } from './dto/create-speaking-prompt.dto';
import { SubmitSpeakingDto } from './dto/submit-speaking.dto';
import { GradeSpeakingDto } from './dto/grade-speaking.dto';
import { SubmissionStatus, Role } from '@prisma/client';

@Injectable()
export class SpeakingService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. PROMPTS MANAGEMENT
  // ==========================================

  async findAllPrompts(lessonId?: string) {
    const where: any = {};
    if (lessonId) where.lessonId = lessonId;

    return this.prisma.speakingPrompt.findMany({
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
    const prompt = await this.prisma.speakingPrompt.findUnique({
      where: { id },
      include: {
        lesson: {
          select: { id: true, title: true },
        },
      },
    });

    if (!prompt) {
      throw new NotFoundException(`Không tìm thấy đề bài Speaking ID: ${id}`);
    }

    return prompt;
  }

  async createPrompt(dto: CreateSpeakingPromptDto) {
    return this.prisma.speakingPrompt.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        topic: dto.topic,
        sampleAudioUrl: dto.sampleAudioUrl,
        minSeconds: dto.minSeconds ?? 30,
        maxSeconds: dto.maxSeconds ?? 120,
      },
    });
  }

  async updatePrompt(id: string, dto: Partial<CreateSpeakingPromptDto>) {
    await this.findPromptById(id);
    return this.prisma.speakingPrompt.update({
      where: { id },
      data: dto,
    });
  }

  async deletePrompt(id: string) {
    await this.findPromptById(id);
    return this.prisma.speakingPrompt.delete({ where: { id } });
  }

  // ==========================================
  // 2. STUDENT SUBMISSIONS
  // ==========================================

  async submitRecording(dto: SubmitSpeakingDto, userId: string) {
    await this.findPromptById(dto.promptId);

    const submission = await this.prisma.speakingSubmission.create({
      data: {
        promptId: dto.promptId,
        userId,
        audioUrl: dto.audioUrl,
        durationSeconds: dto.durationSeconds,
        status: SubmissionStatus.PENDING,
      },
      include: {
        prompt: {
          select: { id: true, title: true },
        },
      },
    });

    return {
      message: 'Bản ghi âm đã được nộp thành công cho giáo viên chấm điểm.',
      submission,
    };
  }

  async getMySubmissions(userId: string) {
    return this.prisma.speakingSubmission.findMany({
      where: { userId },
      include: {
        prompt: {
          select: { id: true, title: true, topic: true },
        },
        gradedBy: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getSubmissionById(id: string, userId: string, role: Role) {
    const submission = await this.prisma.speakingSubmission.findUnique({
      where: { id },
      include: {
        prompt: true,
        user: {
          select: { id: true, fullName: true, email: true },
        },
        gradedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp Speaking ID: ${id}`);
    }

    if (role !== Role.ADMIN && submission.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập bài nộp này');
    }

    return submission;
  }

  // ==========================================
  // 3. ADMIN TEACHER GRADING STUDIO
  // ==========================================

  async getAdminSubmissions(status?: SubmissionStatus) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.speakingSubmission.findMany({
      where,
      include: {
        prompt: { select: { id: true, title: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async gradeSubmission(
    id: string,
    dto: GradeSpeakingDto,
    adminId: string,
  ) {
    const submission = await this.prisma.speakingSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp Speaking ID: ${id}`);
    }

    // Calculate band score with 0.5 rounding if not manually provided
    const raw =
      (dto.fluencyScore +
        dto.lexicalScore +
        dto.grammarScore +
        dto.pronunciationScore) /
      4;
    const bandScore = dto.bandScore ?? Math.round(raw * 2) / 2;

    return this.prisma.speakingSubmission.update({
      where: { id },
      data: {
        status: SubmissionStatus.GRADED,
        fluencyScore: dto.fluencyScore,
        lexicalScore: dto.lexicalScore,
        grammarScore: dto.grammarScore,
        pronunciationScore: dto.pronunciationScore,
        bandScore,
        feedback: dto.feedback,
        timestampFeedback: dto.timestampFeedback as any,
        gradedAt: new Date(),
        gradedById: adminId,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        prompt: { select: { id: true, title: true } },
      },
    });
  }
}
