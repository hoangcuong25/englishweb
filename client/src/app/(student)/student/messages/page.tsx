'use client';

import React, { useState, useEffect, useRef } from 'react';
import ActionMenu from '@/components/ui/action-menu';
import { chatService, ConversationItem, ChatMessageItem } from '@/services/chat.service';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/toast';
import {
  Send,
  Paperclip,
  CheckCheck,
  Search,
  User,
  BellOff,
  Trash2,
  FileText,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ME' | 'TEACHER';
  text: string;
  time: string;
  isRead: boolean;
}

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'chat'>('chat');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      if (behavior === 'auto') {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } else {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Auto-scroll to latest message on opening conversation or switching to chat view
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('auto');
    }, 60);
    return () => clearTimeout(timer);
  }, [activeConversation?.id, activeMobileView]);

  // Auto-scroll when new message arrives or is sent
  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 60);
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Real-time Socket.IO subscriptions for active conversation
  useEffect(() => {
    if (!activeConversation?.id) return;

    chatService.joinConversation(activeConversation.id);

    const unsubNewMsg = chatService.onNewMessage((newMsg) => {
      if (newMsg.conversationId === activeConversation.id) {
        const isMe = newMsg.senderId === user?.id || newMsg.sender?.role === 'STUDENT';
        const formatted: ChatMessage = {
          id: newMsg.id,
          sender: isMe ? 'ME' : 'TEACHER',
          text: newMsg.content,
          time: new Date(newMsg.createdAt || Date.now()).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isRead: newMsg.isRead,
        };
        setMessages((prev) => {
          // If already exists by id, do nothing
          if (prev.some((m) => m.id === newMsg.id)) return prev;

          // If this is my own message, replace matching optimistic temporary message
          if (isMe) {
            const tempIdx = prev.findIndex(
              (m) => m.id.startsWith('m-') && m.text.trim() === newMsg.content.trim()
            );
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = formatted;
              return updated;
            }
          }

          return [...prev, formatted];
        });

        if (!isMe) {
          chatService.markAsRead(activeConversation.id).catch(() => {});
        }
      }

      // Update conversations list so latest message shows snippet and moves conversation to top
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === newMsg.conversationId);
        let updated: ConversationItem[];

        if (exists) {
          updated = prev.map((c) => {
            if (c.id === newMsg.conversationId) {
              const isCurrentActive = activeConversation?.id === c.id;
              const isMe = newMsg.senderId === user?.id || newMsg.sender?.role === 'STUDENT';
              return {
                ...c,
                lastMessage: newMsg,
                lastMessageAt: newMsg.createdAt || new Date().toISOString(),
                unreadCount: isCurrentActive || isMe ? 0 : (c.unreadCount || 0) + 1,
              };
            }
            return c;
          });
        } else {
          loadConversations();
          return prev;
        }

        return [...updated].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });
    });

    const unsubTyping = chatService.onUserTyping((data) => {
      if (data.conversationId === activeConversation.id && data.userId !== user?.id) {
        setPartnerIsTyping(data.isTyping);
      }
    });

    return () => {
      chatService.leaveConversation(activeConversation.id);
      unsubNewMsg();
      unsubTyping();
    };
  }, [activeConversation?.id, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (!activeConversation?.id || !user?.id) return;

    chatService.sendTyping(activeConversation.id, user.id, user.fullName || 'Học viên', true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendTyping(activeConversation.id, user.id, user.fullName || 'Học viên', false);
    }, 2000);
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const list = await chatService.getConversations();
      if (Array.isArray(list) && list.length > 0) {
        const sorted = [...list].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        setConversations(sorted);
        const current = sorted[0];
        setActiveConversation(current);
        await loadMessages(current.id);
      } else {
        // Fallback default conversation with Teacher Dong
        const fallbackConv: ConversationItem = {
          id: 'conv-teacher-dong',
          studentId: user?.id || 'std-default',
          adminId: 'adm-teacher-dong',
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          admin: {
            id: 'adm-teacher-dong',
            fullName: 'Thầy Đông (IELTS 8.5)',
            email: 'admin@dong.edu.vn',
            role: 'ADMIN',
          },
          lastMessage: {
            id: 'msg-welcome-0',
            conversationId: 'conv-teacher-dong',
            senderId: 'adm-teacher-dong',
            content: 'Chào em! Thầy Đông có thể hỗ trợ gì cho em hôm nay?',
            isRead: true,
            createdAt: new Date().toISOString(),
          },
        };
        setConversations([fallbackConv]);
        setActiveConversation(fallbackConv);
        setMessages([
          {
            id: 'msg-welcome-0',
            sender: 'TEACHER',
            text: 'Chào em! Thầy Đông có thể hỗ trợ gì cho lộ trình học IELTS và kỹ năng của em hôm nay?',
            time: '08:00',
            isRead: true,
          },
        ]);
      }
    } catch (err) {
      console.warn('Could not load chat conversations from server, using default messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const items: ChatMessageItem[] = await chatService.getMessages(convId);
      if (Array.isArray(items)) {
        const formatted: ChatMessage[] = items.map((m) => {
          const isMe = m.senderId === user?.id || m.sender?.role === 'STUDENT';
          return {
            id: m.id,
            sender: isMe ? 'ME' : 'TEACHER',
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isRead: m.isRead,
          };
        });
        setMessages(formatted);
        setTimeout(() => scrollToBottom('auto'), 60);
      }
      // Mark as read
      await chatService.markAsRead(convId).catch(() => {});
    } catch (err) {
      console.warn('Could not load messages from server:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const content = inputMessage.trim();
    setInputMessage('');

    // Optimistic message
    const tempId = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      sender: 'ME',
      text: content,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);

    if (activeConversation?.id) {
      setIsSending(true);
      try {
        const sent = await chatService.sendMessage(activeConversation.id, content);
        if (sent && sent.id) {
          setMessages((prev) => {
            const alreadyHasReal = prev.some((m) => m.id === sent.id);
            if (alreadyHasReal) {
              return prev.filter((m) => m.id !== tempId);
            }
            return prev.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    id: sent.id,
                    time: new Date(sent.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  }
                : m
            );
          });

          // Update conversation lastMessage & move to top
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id === activeConversation.id) {
                return {
                  ...c,
                  lastMessage: sent,
                  lastMessageAt: sent.createdAt || new Date().toISOString(),
                  unreadCount: 0,
                };
              }
              return c;
            });
            return [...updated].sort(
              (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            );
          });
        }
      } catch (err) {
        console.error('Failed to send message via API:', err);
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-line shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Left Sidebar: Conversations List */}
      <div
        className={`w-full md:w-80 border-r border-line flex-col h-full bg-slate-50/50 ${
          activeMobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Hội Thoại & Hỗ Trợ Học Vụ
            </h2>
            <p className="text-[10px] text-muted">Trực tuyến cùng Thầy & Bộ môn</p>
          </div>
          <button
            onClick={() => loadConversations()}
            disabled={loading}
            className="p-1.5 rounded-lg border border-line bg-white hover:bg-slate-100 text-slate-600 transition"
            title="Làm mới cuộc trò chuyện"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>

        <div className="p-3 border-b border-line bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tin nhắn..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-line/60">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const teacherName = conv.admin?.fullName || 'Thầy Đông (IELTS 8.5)';
              const lastText = conv.lastMessage?.content || 'Chào em! Có câu hỏi gì cứ nhắn thầy nhé.';
              const lastTime = conv.lastMessage?.createdAt
                ? new Date(conv.lastMessage.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Mới';

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv);
                    setConversations((prev) =>
                      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                    );
                    loadMessages(conv.id);
                    setActiveMobileView('chat');
                    setTimeout(() => scrollToBottom('auto'), 50);
                  }}
                  className={`p-4 flex items-start space-x-3 cursor-pointer transition ${
                    activeConversation?.id === conv.id
                      ? 'bg-sky-50/70 border-l-4 border-primary'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                    TD
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{teacherName}</h4>
                      <span className="text-[10px] text-muted">{lastTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastText}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              onClick={() => setActiveMobileView('chat')}
              className="p-4 bg-sky-50/70 border-l-4 border-primary flex items-start space-x-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                TD
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Thầy Đông (IELTS 8.5)</h4>
                  <span className="text-[10px] text-muted">14:32</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Tốt lắm, tối nay chủ đề Part 2 khá hay...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Active Chat Window */}
      <div
        className={`flex-1 flex-col h-full bg-white ${
          activeMobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={() => setActiveMobileView('list')}
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition"
              title="Quay lại danh sách hội thoại"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shrink-0">
              TD
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Thầy Đông (IELTS 8.5)</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted">Online qua WebSocket Gateway • Phản hồi nhanh</p>
            </div>
          </div>

          <ActionMenu
            items={[
              {
                label: 'Hồ sơ Thầy Đông (8.5)',
                icon: <User className="w-4 h-4" />,
                onClick: () => toast.info('Thông tin: Thầy Đông - Trưởng bộ môn IELTS Masterclass (Speaking 8.5, Writing 8.5)'),
              },
              {
                label: 'Xem bài tập đính kèm',
                icon: <FileText className="w-4 h-4" />,
                onClick: () => toast.info('Không có bài tập nào đang được chia sẻ trong đoạn hội thoại này.'),
              },
              {
                label: 'Tắt thông báo trò chuyện',
                icon: <BellOff className="w-4 h-4" />,
                onClick: () => toast.info('Đã tắt thông báo cho cuộc hội thoại này.'),
              },
              {
                label: 'Xóa lịch sử tin nhắn',
                icon: <Trash2 className="w-4 h-4" />,
                variant: 'danger',
                onClick: () => {
                  if (confirm('Bạn có chắc chắn muốn xóa lịch sử cuộc trò chuyện này?')) {
                    setMessages([]);
                  }
                },
              },
            ]}
          />
        </div>

        {/* Messages Stream */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-bg scroll-smooth"
        >
          {messages.map((msg) => {
            const isMe = msg.sender === 'ME';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-primary text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-line rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-muted mt-1 px-1">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                </div>
              </div>
            );
          })}

          {partnerIsTyping && (
            <div className="flex items-center space-x-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] text-primary font-semibold">Thầy Đông đang soạn tin nhắn...</span>
            </div>
          )}

          <div ref={messagesEndRef} className="h-0 w-full" />
        </div>

        {/* Input Form Bar (Form 19 in Plan) */}
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 border-t border-line bg-white flex items-center space-x-2"
        >
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-primary rounded-lg transition"
            title="Đính kèm tệp / hình ảnh"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Nhập tin nhắn... (Nhấn Enter để gửi qua WebSocket)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-line text-xs sm:text-sm focus:outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white shadow-sm transition flex-shrink-0"
          >
            {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

