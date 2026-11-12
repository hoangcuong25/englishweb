import { api } from '../lib/api';

export interface ChatUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: 'STUDENT' | 'ADMIN';
  };
}

export interface ConversationItem {
  id: string;
  studentId: string;
  adminId: string;
  lastMessageAt: string;
  createdAt: string;
  student?: ChatUser;
  admin?: ChatUser;
  lastMessage?: ChatMessageItem | null;
  unreadCount?: number;
}

export const chatService = {
  async getConversations(): Promise<ConversationItem[]> {
    const response = await api.get('/chat/conversations');
    return response.data?.data || response.data || [];
  },

  async getMessages(
    conversationId: string,
    take: number = 50,
    skip: number = 0
  ): Promise<ChatMessageItem[]> {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { take, skip },
    });
    return response.data?.data || response.data || [];
  },

  async sendMessage(conversationId: string, content: string): Promise<ChatMessageItem> {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data?.data || response.data;
  },

  async markAsRead(conversationId: string): Promise<unknown> {
    const response = await api.put(`/chat/conversations/${conversationId}/read`);
    return response.data?.data || response.data;
  },
};
