import { api } from '../lib/api';

export interface Material {
  id: string;
  title: string;
  fileType: 'PDF' | 'AUDIO_MP3' | 'DOCUMENT';
  fileSize?: number;
  lessonId?: string;
  createdAt: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresInSeconds: number;
  watermark: {
    fullName: string;
    phone?: string;
    userId: string;
    timestamp: number;
  };
}

export const materialsService = {
  async getByLesson(lessonId: string): Promise<Material[]> {
    const response = await api.get(`/materials/lesson/${lessonId}`);
    return response.data?.data || response.data || [];
  },

  async getById(id: string): Promise<Material> {
    const response = await api.get(`/materials/${id}`);
    return response.data?.data || response.data;
  },

  async getSignedUrl(id: string): Promise<SignedUrlResponse> {
    const response = await api.post(`/materials/${id}/signed-url`);
    return response.data?.data || response.data;
  },

  async create(data: Record<string, unknown>) {
    const response = await api.post('/materials', data);
    return response.data;
  },

  async update(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/materials/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  },
};

