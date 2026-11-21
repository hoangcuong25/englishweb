import { api } from '../lib/api';

export interface QuizQuestionOption {
  id: string;
  content: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  content: string;
  questionText?: string;
  type: string;
  skillType?: string;
  part?: number;
  groupPrompt?: string;
  imageUrl?: string;
  audioUrl?: string;
  order: number;
  options: QuizQuestionOption[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  passage?: string;
  audioUrl?: string;
  sectionsPayload?: any;
  skill?: string;
  category?: string;
  quizType?: string;
  testType?: string;
  courseId?: string;
  course?: { id: string; title: string; category?: string; isEnglishCourse?: boolean };
  timeLimitMinutes?: number;
  passScore?: number;
  passingScore?: number;
  lessonId?: string;
  lesson?: { id: string; title: string };
  questions: QuizQuestion[];
}

export interface SubmitQuizAnswer {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
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

  async getSkillsTests(params?: { skill?: string; category?: string; quizType?: string; courseId?: string } | string) {
    const queryParams = typeof params === 'string' ? { skill: params } : params;
    const response = await api.get('/quizzes/skills/tests', {
      params: queryParams,
    });
    return response.data?.data || response.data || [];
  },

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    const response = await api.get(`/quizzes/course/${courseId}`);
    return response.data?.data || response.data || [];
  },

  async createQuiz(data: {
    title: string;
    description?: string;
    skill?: string;
    category?: string;
    quizType?: string;
    testType?: string;
    courseId?: string;
    passage?: string;
    audioUrl?: string;
    sectionsPayload?: any;
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
      part?: number;
      groupPrompt?: string;
      imageUrl?: string;
      audioUrl?: string;
      options: { content: string; isCorrect: boolean }[];
    }
  ) {
    const response = await api.post(`/quizzes/${quizId}/questions`, data);
    return response.data?.data || response.data;
  },

  async createQuestion(data: {
    quizId: string;
    questionText?: string;
    content?: string;
    skillType?: string;
    type?: string;
    explanation?: string;
    part?: number;
    groupPrompt?: string;
    imageUrl?: string;
    audioUrl?: string;
    options: { content: string; isCorrect: boolean }[];
  }) {
    return this.addQuestion(data.quizId, {
      content: data.questionText || data.content || '',
      skill: data.skillType,
      type: data.type,
      explanation: data.explanation,
      part: data.part,
      groupPrompt: data.groupPrompt,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      options: data.options,
    });
  },

  async deleteQuiz(id: string) {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  async deleteQuestion(id: string) {
    const response = await api.delete(`/quizzes/questions/${id}`);
    return response.data?.data || response.data;
  },

  async getAllQuizzes(params?: {
    skill?: string;
    category?: string;
    quizType?: string;
    courseId?: string;
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

  async assignQuiz(
    quizId: string,
    data: {
      courseId?: string;
      dueDate?: string;
      sendNotification?: boolean;
      sendEmail?: boolean;
    }
  ) {
    const response = await api.post(`/quizzes/${quizId}/assign`, data);
    return response.data?.data || response.data;
  },
};

