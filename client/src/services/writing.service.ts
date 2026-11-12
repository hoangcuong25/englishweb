import { api } from '../lib/api';

export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  taskType: 'TASK_1' | 'TASK_2';
  chartImageUrl?: string;
  minWords: number;
  timeLimitMinutes: number;
}

export interface WritingAiAnalysis {
  bandScore: number;
  taskResponse: { score: number; feedback: string };
  coherenceCohesion: { score: number; feedback: string };
  lexicalResource: { score: number; feedback: string };
  grammaticalAccuracy: { score: number; feedback: string };
  suggestedSampleBand8?: string;
  grammarFixes?: Array<{ original: string; corrected: string; explanation: string }>;
}

export interface WritingSubmission {
  id: string;
  promptId: string;
  prompt?: WritingPrompt;
  content: string;
  wordCount: number;
  durationSeconds: number;
  status: 'PENDING_AI' | 'AI_SCORED' | 'APPROVED' | 'OVERRIDDEN';
  aiScore?: number;
  aiAnalysis?: WritingAiAnalysis;
  teacherScore?: number;
  teacherFeedback?: string;
  student?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export const writingService = {
  async getPrompts(taskType?: 'TASK_1' | 'TASK_2', lessonId?: string): Promise<WritingPrompt[]> {
    const response = await api.get('/writing/prompts', {
      params: { taskType, lessonId },
    });
    return response.data?.data || response.data || [];
  },

  async getPromptById(id: string): Promise<WritingPrompt> {
    const response = await api.get(`/writing/prompts/${id}`);
    return response.data?.data || response.data;
  },

  async submitEssay(data: { promptId: string; content: string; wordCount: number; durationSeconds: number }) {
    const response = await api.post('/writing/submissions', data);
    return response.data?.data || response.data;
  },

  async getMySubmissions(): Promise<WritingSubmission[]> {
    const response = await api.get('/writing/submissions/my');
    return response.data?.data || response.data || [];
  },

  async getSubmissionById(id: string): Promise<WritingSubmission> {
    const response = await api.get(`/writing/submissions/${id}`);
    return response.data?.data || response.data;
  },

  async getAdminSubmissions(status?: string): Promise<WritingSubmission[]> {
    const response = await api.get('/writing/admin/submissions', {
      params: { status },
    });
    return response.data?.data || response.data || [];
  },

  async approveSubmission(id: string, data: { teacherScore?: number; teacherFeedback?: string; isApproved: boolean }) {
    const response = await api.post(`/writing/admin/submissions/${id}/approve`, data);
    return response.data?.data || response.data;
  },

  async saveDraft(data: { promptId: string; content: string; wordCount?: number; durationSeconds?: number }) {
    const response = await api.post('/writing/drafts', data);
    return response.data?.data || response.data;
  },

  async getDraft(promptId: string) {
    const response = await api.get(`/writing/drafts/${promptId}`);
    return response.data?.data || response.data;
  },

  async deleteDraft(promptId: string) {
    const response = await api.delete(`/writing/drafts/${promptId}`);
    return response.data?.data || response.data;
  },
};

