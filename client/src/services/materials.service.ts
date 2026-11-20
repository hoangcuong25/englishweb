import { api } from '../lib/api';

export interface Material {
  id: string;
  title: string;
  type?: 'PDF' | 'AUDIO';
  fileType?: 'PDF' | 'AUDIO_MP3' | 'DOCUMENT';
  fileSize?: number;
  courseId?: string;
  course?: {
    id: string;
    title: string;
    slug?: string;
    category?: string;
  };
  lessonId?: string;
  lesson?: {
    id: string;
    title: string;
    module?: {
      id: string;
      title: string;
      course?: {
        id: string;
        title: string;
        slug?: string;
      };
    };
  };
  isWatermarked?: boolean;
  isPrivate?: boolean;
  createdAt: string;
  parentId?: string | null;
  children?: Material[];
}

export interface AttachedAudioTrack {
  id: string;
  title: string;
  signedUrl: string;
  durationSeconds?: number;
  fileSize?: number;
}

export interface SignedUrlResponse {
  materialId?: string;
  title?: string;
  type?: 'PDF' | 'AUDIO';
  signedUrl: string;
  token?: string;
  expiresInSeconds: number;
  audios?: AttachedAudioTrack[];
  watermark: {
    fullName?: string;
    studentName?: string;
    phone?: string;
    maskedPhone?: string;
    userId?: string;
    studentCode?: string;
    timestamp?: number;
    renderedTimestamp?: string;
  };
}

export const materialsService = {
  async getAll(params?: {
    search?: string;
    fileType?: string;
    courseId?: string;
    lessonId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Material[]; total: number }> {
    const response = await api.get('/materials', { params });
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return {
      items: data?.items || [],
      total: data?.total || 0,
    };
  },

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
    const data: SignedUrlResponse = response.data?.data || response.data;
    if (data?.signedUrl && !data.signedUrl.startsWith('http://') && !data.signedUrl.startsWith('https://')) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const origin = apiBase.replace(/\/api\/?$/, '');
      data.signedUrl = `${origin}${data.signedUrl.startsWith('/') ? '' : '/'}${data.signedUrl}`;
    }
    return data;
  },

  async create(data: Record<string, unknown>) {
    const response = await api.post('/materials', data);
    return response.data;
  },

  async uploadWithFile(formData: FormData) {
    const response = await api.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async attachAudio(materialId: string, formData: FormData) {
    const response = await api.post(`/materials/${materialId}/attach-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

