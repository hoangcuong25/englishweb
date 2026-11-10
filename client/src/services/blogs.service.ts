import { api } from '../lib/api';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  videoUrl?: string;
  published: boolean;
  viewCount: number;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface QueryBlogsParams {
  category?: string;
  search?: string;
  published?: boolean;
  page?: number;
  limit?: number;
}

export const blogsService = {
  async getBlogs(params?: QueryBlogsParams) {
    const response = await api.get('/blogs', { params });
    return response.data?.data || response.data || [];
  },

  async getBlogBySlug(slugOrId: string): Promise<BlogPost> {
    const response = await api.get(`/blogs/${slugOrId}`);
    return response.data?.data || response.data;
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
};

