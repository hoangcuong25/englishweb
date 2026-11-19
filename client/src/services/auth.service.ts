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

  async loginGoogle(payload: { idToken: string; email?: string; fullName?: string; avatarUrl?: string }) {
    const response = await api.post('/auth/google', payload);
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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_')) {
        return [
          {
            id: 'demo-session-current',
            deviceInfo: 'Chrome trên Windows 11 (Thiết bị hiện tại)',
            ipAddress: '127.0.0.1 (Hà Nội, VN)',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            isCurrent: true,
          },
        ];
      }
    }
    const response = await api.get('/auth/sessions');
    return response.data?.data || response.data || [];
  },

  async revokeSession(sessionId: string) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_')) {
        return { success: true };
      }
    }
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  async changePassword(passwords: { oldPassword: string; newPassword: string }) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_')) {
        return { success: true, message: 'Đổi mật khẩu thành công!' };
      }
    }
    const response = await api.post('/auth/change-password', passwords);
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async updateProfile(payload: { phone?: string; fullName?: string; avatarUrl?: string }): Promise<User> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_')) {
        let currentUser: Partial<User> = {};
        try {
          const cachedUserStr = localStorage.getItem('user');
          if (cachedUserStr) currentUser = JSON.parse(cachedUserStr);
        } catch {}
        const updatedUser: User = {
          id: currentUser.id || 'std-tran-nam',
          email: currentUser.email || 'student@dong.edu.vn',
          fullName: payload.fullName || currentUser.fullName || 'Trần Văn Nam',
          role: (currentUser.role as 'STUDENT' | 'ADMIN') || 'STUDENT',
          phone: payload.phone !== undefined ? payload.phone : currentUser.phone,
          avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : currentUser.avatarUrl,
        };
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch {}
        return updatedUser;
      }
    }
    const response = await api.put('/auth/profile', payload);
    return response.data?.data || response.data;
  },

  async uploadAvatar(file: File): Promise<User> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_')) {
        let currentUser: Partial<User> = {};
        try {
          const cachedUserStr = localStorage.getItem('user');
          if (cachedUserStr) currentUser = JSON.parse(cachedUserStr);
        } catch {}
        const previewUrl = URL.createObjectURL(file);
        const updatedUser: User = {
          id: currentUser.id || 'std-tran-nam',
          email: currentUser.email || 'student@dong.edu.vn',
          fullName: currentUser.fullName || 'Trần Văn Nam',
          role: (currentUser.role as 'STUDENT' | 'ADMIN') || 'STUDENT',
          phone: currentUser.phone,
          avatarUrl: previewUrl,
        };
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch {}
        return updatedUser;
      }
    }
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },
};

