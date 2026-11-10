import { api } from '../lib/api';

export interface LessonDetail {
  id: string;
  title: string;
  order: number;
  content?: string;
  videoUrl?: string;
  durationMinutes?: number;
  moduleId: string;
  isCompleted?: boolean;
  module?: {
    id: string;
    title: string;
    courseId: string;
    course?: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

export const lessonsService = {
  async getLessonById(id: string): Promise<LessonDetail> {
    const response = await api.get(`/lessons/${id}`);
    return response.data?.data || response.data;
  },

  async completeLesson(id: string) {
    const response = await api.post(`/lessons/${id}/complete`);
    return response.data;
  },

  async createLesson(data: Record<string, unknown>) {
    const response = await api.post('/lessons', data);
    return response.data;
  },

  async updateLesson(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/lessons/${id}`, data);
    return response.data;
  },

  async deleteLesson(id: string) {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },

  async createModule(data: Record<string, unknown>) {
    const response = await api.post('/lessons/modules', data);
    return response.data;
  },

  async updateModule(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/lessons/modules/${id}`, data);
    return response.data;
  },

  async deleteModule(id: string) {
    const response = await api.delete(`/lessons/modules/${id}`);
    return response.data;
  },
};

