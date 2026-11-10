import { api } from '../lib/api';

export interface SpeakingPrompt {
  id: string;
  title: string;
  description: string;
  cueCard?: string;
  part: number;
  prepTimeSeconds: number;
  recordTimeSeconds: number;
}

export interface TimestampComment {
  id?: string;
  timestampSeconds: number;
  comment: string;
}

export interface SpeakingSubmission {
  id: string;
  promptId: string;
  prompt?: SpeakingPrompt;
  audioUrl: string;
  durationSeconds: number;
  status: 'PENDING' | 'GRADED';
  bandScore?: number;
  fluencyScore?: number;
  lexicalScore?: number;
  grammarScore?: number;
  pronunciationScore?: number;
  feedback?: string;
  timestampComments?: TimestampComment[];
  student?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export const speakingService = {
  async getPrompts(lessonId?: string): Promise<SpeakingPrompt[]> {
    const response = await api.get('/speaking/prompts', {
      params: { lessonId },
    });
    return response.data?.data || response.data || [];
  },

  async getPromptById(id: string): Promise<SpeakingPrompt> {
    const response = await api.get(`/speaking/prompts/${id}`);
    return response.data?.data || response.data;
  },

  async submitRecording(data: { promptId: string; audioUrl: string; durationSeconds: number }) {
    const response = await api.post('/speaking/submissions', data);
    return response.data?.data || response.data;
  },

  async getMySubmissions(): Promise<SpeakingSubmission[]> {
    const response = await api.get('/speaking/submissions/my');
    return response.data?.data || response.data || [];
  },

  async getSubmissionById(id: string): Promise<SpeakingSubmission> {
    const response = await api.get(`/speaking/submissions/${id}`);
    return response.data?.data || response.data;
  },

  async getAdminSubmissions(status?: string): Promise<SpeakingSubmission[]> {
    const response = await api.get('/speaking/admin/submissions', {
      params: { status },
    });
    return response.data?.data || response.data || [];
  },

  async gradeSubmission(
    id: string,
    data: {
      fluencyScore: number;
      lexicalScore: number;
      grammarScore: number;
      pronunciationScore: number;
      feedback: string;
      timestampComments?: TimestampComment[];
    },
  ) {
    const response = await api.post(`/speaking/admin/submissions/${id}/grade`, data);
    return response.data?.data || response.data;
  },
};

