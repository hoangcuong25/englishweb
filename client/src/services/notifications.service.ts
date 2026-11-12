import { api } from '../lib/api';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'WRITING' | 'SPEAKING' | 'LIVE' | 'QUIZ' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export const notificationsService = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsListResponse> {
    const response = await api.get('/notifications', { params });
    return response.data?.data || response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    const data = response.data?.data || response.data;
    return typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data?.data || response.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/notifications/read-all');
    return response.data?.data || response.data;
  },

  async deleteNotification(id: string): Promise<NotificationItem> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data?.data || response.data;
  },
};
