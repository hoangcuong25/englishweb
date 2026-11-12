import { api } from '../lib/api';

export interface QuizQuestionOption {
  id: string;
  content: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  content: string;
  type: string;
  skillType?: string;
  order: number;
  options: QuizQuestionOption[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  lessonId?: string;
  questions: QuizQuestion[];
}

export interface SubmitQuizAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface QuizResult {
  submissionId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
}

export const quizzesService = {
  async getQuizById(id: string): Promise<Quiz> {
    const response = await api.get(`/quizzes/${id}`);
    return response.data?.data || response.data;
  },

  async getQuizByLesson(lessonId: string): Promise<Quiz> {
    const response = await api.get(`/quizzes/lesson/${lessonId}`);
    return response.data?.data || response.data;
  },

  async submitQuiz(id: string, answers: SubmitQuizAnswer[]): Promise<QuizResult> {
    const response = await api.post(`/quizzes/${id}/submit`, { answers });
    return response.data?.data || response.data;
  },

  async getMySubmissions(id: string) {
    const response = await api.get(`/quizzes/${id}/my-submissions`);
    return response.data?.data || response.data;
  },

  async getMyDiagnostic(skill?: string) {
    const response = await api.get('/quizzes/diagnostic/me', {
      params: { skill },
    });
    return response.data?.data || response.data;
  },

  async getAdminDiagnosticOverview(skill?: string) {
    const response = await api.get('/quizzes/diagnostic/admin/overview', {
      params: { skill },
    });
    return response.data?.data || response.data;
  },

  async getSkillsTests(skill?: string) {
    const response = await api.get('/quizzes/skills/tests', {
      params: { skill },
    });
    return response.data?.data || response.data || [];
  },

  async createQuiz(data: {
    title: string;
    description?: string;
    skill?: string;
    testType?: string;
    passage?: string;
    audioUrl?: string;
    timeLimitMinutes?: number;
    passScore?: number;
    lessonId?: string;
  }) {
    const response = await api.post('/quizzes', data);
    return response.data?.data || response.data;
  },

  async addQuestion(
    quizId: string,
    data: {
      content: string;
      skill?: string;
      type?: string;
      points?: number;
      explanation?: string;
      orderIndex?: number;
      options: { content: string; isCorrect: boolean }[];
    }
  ) {
    const response = await api.post(`/quizzes/${quizId}/questions`, data);
    return response.data?.data || response.data;
  },

  async deleteQuiz(id: string) {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  async getAllQuizzes(params?: {
    skill?: string;
    testType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/quizzes', { params });
    return response.data?.data || response.data || [];
  },

  async updateQuiz(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data?.data || response.data;
  },

  async addQuestionsBulk(quizId: string, questions: Record<string, unknown>[]) {
    const response = await api.post(`/quizzes/${quizId}/questions/bulk`, { questions });
    return response.data?.data || response.data;
  },
};

