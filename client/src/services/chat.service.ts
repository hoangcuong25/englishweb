import { api } from '../lib/api';
import { getChatSocket } from '../lib/socket';

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

  // ==========================================
  // REAL-TIME SOCKET.IO CLIENT METHODS
  // ==========================================

  joinConversation(conversationId: string) {
    const socket = getChatSocket();
    socket.emit('joinConversation', { conversationId });
  },

  leaveConversation(conversationId: string) {
    const socket = getChatSocket();
    socket.emit('leaveConversation', { conversationId });
  },

  sendTyping(conversationId: string, userId: string, fullName: string, isTyping: boolean) {
    const socket = getChatSocket();
    socket.emit('typing', { conversationId, userId, fullName, isTyping });
  },

  onNewMessage(callback: (msg: ChatMessageItem) => void): () => void {
    const socket = getChatSocket();
    socket.on('newMessage', callback);
    return () => {
      socket.off('newMessage', callback);
    };
  },

  onUserTyping(
    callback: (data: { conversationId: string; userId: string; fullName: string; isTyping: boolean }) => void
  ): () => void {
    const socket = getChatSocket();
    socket.on('userTyping', callback);
    return () => {
      socket.off('userTyping', callback);
    };
  },

  onMessagesRead(callback: (data: { conversationId: string; readBy: string }) => void): () => void {
    const socket = getChatSocket();
    socket.on('messagesRead', callback);
    return () => {
      socket.off('messagesRead', callback);
    };
  },
};
