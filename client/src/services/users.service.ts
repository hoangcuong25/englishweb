import { api } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface QueryUsersParams {
  role?: 'STUDENT' | 'ADMIN';
  search?: string;
  page?: number;
  limit?: number;
}

export const usersService = {
  async getUsers(params?: QueryUsersParams) {
    const response = await api.get('/users', { params });
    return response.data?.data || response.data || [];
  },

  async getUserById(id: string): Promise<UserProfile> {
    const response = await api.get(`/users/${id}`);
    return response.data?.data || response.data;
  },

  async updateUserStatus(id: string, isActive: boolean) {
    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
  },

  async adminResetPassword(id: string, newPassword: string) {
    const response = await api.put(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  async uploadAvatar(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

