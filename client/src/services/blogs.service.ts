import { api } from '../lib/api';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  coverImageUrl?: string;
  videoUrl?: string;
  published?: boolean;
  status?: string;
  isFeatured?: boolean;
  viewCount: number;
  category?: string;
  tags?: string | string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role?: string;
  };
}

export interface QueryBlogsParams {
  category?: string;
  search?: string;
  published?: boolean;
  status?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export const blogsService = {
  async getBlogs(params?: QueryBlogsParams): Promise<{ items: BlogPost[]; total: number }> {
    try {
      const response = await api.get('/blogs', { params });
      const payload = response.data?.data || response.data;
      if (Array.isArray(payload)) {
        return { items: payload, total: payload.length };
      }
      if (payload && Array.isArray(payload.items)) {
        return { items: payload.items, total: payload.total ?? payload.items.length };
      }
      return { items: [], total: 0 };
    } catch {
      return { items: [], total: 0 };
    }
  },

  async getBlogBySlug(slugOrId: string): Promise<BlogPost | null> {
    try {
      const response = await api.get(`/blogs/${slugOrId}`);
      return response.data?.data || response.data;
    } catch {
      return null;
    }
  },

  async createBlog(formData: FormData) {
    const response = await api.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateBlog(id: string, formData: FormData) {
    const response = await api.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteBlog(id: string) {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  async uploadImage(file: File): Promise<{ secureUrl: string; url?: string; publicId?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/media/upload/image?folder=teacher_dong_academy/blogs/content', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const payload = response.data?.data || response.data;
    return payload;
  },
};

