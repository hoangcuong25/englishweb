import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN';
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  deviceId?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UserSession {
  id: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterPayload) {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data?.data || response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async logoutAll() {
    const response = await api.post('/auth/logout-all');
    return response.data;
  },

  async getSessions(): Promise<UserSession[]> {
    const response = await api.get('/auth/sessions');
    return response.data?.data || response.data || [];
  },

  async revokeSession(sessionId: string) {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  async changePassword(passwords: { oldPassword: string; newPassword: string }) {
    const response = await api.post('/auth/change-password', passwords);
    return response.data;
  },
};

