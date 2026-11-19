'use client';

import React, { useState, useEffect, useRef } from 'react';
import ActionMenu from '@/components/ui/action-menu';
import { chatService, ConversationItem, ChatMessageItem } from '@/services/chat.service';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/toast';
import {
  Send,
  Paperclip,
  Search,
  UserCheck,
  BellOff,
  Trash2,
  GraduationCap,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ADMIN' | 'STUDENT';
  studentName: string;
  text: string;
  time: string;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'chat'>('list');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [studentIsTyping, setStudentIsTyping] = useState(false);
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

  // Auto-scroll to latest message on opening conversation or switching mobile view
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

  useEffect(() => {
    if (user?.id) {
      chatService.joinUser(user.id);
    }
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime Socket.IO subscriptions for active conversation
  useEffect(() => {
    if (!activeConversation?.id) return;

    chatService.joinConversation(activeConversation.id);

    const unsubNewMsg = chatService.onNewMessage((newMsg) => {
      // 1. Update message stream if belongs to active conversation
      if (newMsg.conversationId === activeConversation.id) {
        const isAdmin = newMsg.senderId === user?.id || newMsg.sender?.role === 'ADMIN';
        const formatted: ChatMessage = {
          id: newMsg.id,
          sender: isAdmin ? 'ADMIN' : 'STUDENT',
          studentName: isAdmin ? 'Thầy Đông' : activeConversation.student?.fullName || 'Học viên',
          text: newMsg.content,
          time: new Date(newMsg.createdAt || Date.now()).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;

          // If this is my own message as Admin, replace matching temporary optimistic message
          if (isAdmin) {
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

        if (!isAdmin) {
          chatService.markAsRead(activeConversation.id).catch(() => {});
        }
      }

      // 2. ALWAYS update conversations list: update lastMessage, lastMessageAt and sort newest to top!
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === newMsg.conversationId);
        let updated: ConversationItem[];

        if (exists) {
          updated = prev.map((c) => {
            if (c.id === newMsg.conversationId) {
              const isCurrentActive = activeConversation?.id === c.id;
              const isFromMe = newMsg.senderId === user?.id || newMsg.sender?.role === 'ADMIN';
              return {
                ...c,
                lastMessage: newMsg,
                lastMessageAt: newMsg.createdAt || new Date().toISOString(),
                unreadCount: isCurrentActive || isFromMe ? 0 : (c.unreadCount || 0) + 1,
              };
            }
            return c;
          });
        } else {
          loadConversations();
          return prev;
        }

        // Sort descending by lastMessageAt: conversation with latest message moves to top!
        return [...updated].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });
    });

    const unsubTyping = chatService.onUserTyping((data) => {
      if (data.conversationId === activeConversation.id && data.userId !== user?.id) {
        setStudentIsTyping(data.isTyping);
      }
    });

    return () => {
      chatService.leaveConversation(activeConversation.id);
      unsubNewMsg();
      unsubTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (!activeConversation?.id || !user?.id) return;

    chatService.sendTyping(activeConversation.id, user.id, 'Thầy Đông', true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendTyping(activeConversation.id, user.id, 'Thầy Đông', false);
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
        const first = sorted[0];
        setActiveConversation(first);
        await loadMessages(first.id, first.student?.fullName || 'Học viên');
      }
    } catch (err) {
      console.warn('Could not load conversations from server:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string, studentName: string) => {
    try {
      const items: ChatMessageItem[] = await chatService.getMessages(convId);
      if (Array.isArray(items)) {
        const formatted: ChatMessage[] = items.map((m) => {
          const isAdmin = m.senderId === user?.id || m.sender?.role === 'ADMIN';
          return {
            id: m.id,
            sender: isAdmin ? 'ADMIN' : 'STUDENT',
            studentName: isAdmin ? 'Thầy Đông' : studentName,
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        });
        setMessages(formatted);
        setTimeout(() => scrollToBottom('auto'), 60);
      }
      await chatService.markAsRead(convId).catch(() => {});
    } catch (err) {
      console.warn('Could not load messages:', err);
    }
  };

  const handleSelectConversation = async (conv: ConversationItem) => {
    setActiveConversation(conv);
    setActiveMobileView('chat');
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
    await loadMessages(conv.id, conv.student?.fullName || 'Học viên');
    setTimeout(() => scrollToBottom('auto'), 50);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const content = inputMessage.trim();
    setInputMessage('');

    const tempId = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      sender: 'ADMIN',
      studentName: 'Thầy Đông',
      text: content,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
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
        console.error('Failed to send admin message:', err);
      } finally {
        setIsSending(false);
      }
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const name = c.student?.fullName?.toLowerCase() || '';
    const email = c.student?.email?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  const studentName = activeConversation?.student?.fullName || 'Trần Văn Nam';
  const studentEmail = activeConversation?.student?.email || 'nam.tran@example.com';
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'HV';

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-line shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Students Conversation List */}
      <div
        className={`w-full md:w-80 border-r border-line flex-col h-full bg-slate-50/50 ${
          activeMobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Trung Tâm Hỗ Trợ Học Viên
            </h2>
            <p className="text-[10px] text-muted">
              {conversations.length > 0 ? `${conversations.length} hội thoại` : 'Chưa có hội thoại'}
            </p>
          </div>
          <button
            onClick={() => loadConversations()}
            disabled={loading}
            className="p-1.5 rounded-lg border border-line bg-white hover:bg-slate-100 text-slate-600 transition"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>

        <div className="p-3 border-b border-line bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-line/60">
          {conversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              const name = conv.student?.fullName || 'Học viên';
              const sInitials = name
                .split(' ')
                .filter(Boolean)
                .slice(-2)
                .map((w) => w[0]?.toUpperCase())
                .join('') || 'HV';
              const lastMsgText = conv.lastMessage?.content || 'Chưa có tin nhắn...';
              const lastTime = conv.lastMessage?.createdAt
                ? new Date(conv.lastMessage.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 flex items-start space-x-3 cursor-pointer transition ${
                    isActive
                      ? 'bg-sky-50/70 border-l-4 border-primary'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                    {sInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{name}</h4>
                      {lastTime && <span className="text-[10px] text-muted">{lastTime}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastMsgText}</p>
                  </div>
                  {Number(conv.unreadCount) > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <>
              {/* Default fallback items */}
              <div
                onClick={() => setActiveMobileView('chat')}
                className="p-4 bg-sky-50/70 border-l-4 border-primary flex items-start space-x-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                  TN
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Trần Văn Nam</h4>
                    <span className="text-[10px] text-muted">15:14</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Thầy ơi, bài Writing Task 2 em nộp...
                  </p>
                </div>
              </div>

              <div
                onClick={() => setActiveMobileView('chat')}
                className="p-4 hover:bg-slate-50 flex items-start space-x-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                  LM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Lê Thị Mai</h4>
                    <span className="text-[10px] text-muted">11:20</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Em đã làm xong bài Quiz Module 03 ạ.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Conversation */}
      <div
        className={`flex-1 flex-col h-full bg-white ${
          activeMobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-line flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Back Button to Students List */}
            <button
              type="button"
              onClick={() => setActiveMobileView('list')}
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition"
              title="Quay lại danh sách học viên"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">{studentName}</h3>
              <p className="text-[10px] sm:text-[11px] text-muted">{studentEmail} • Trực tuyến qua WebSocket</p>
            </div>
          </div>
          <ActionMenu
            items={[
              {
                label: 'Xem học bạ học viên',
                icon: <GraduationCap className="w-4 h-4 text-primary" />,
                onClick: () =>
                  toast.info(`Thông tin học viên: ${studentName} (${studentEmail})`),
              },
              {
                label: 'Đánh dấu đã hoàn thành hỗ trợ',
                icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
                onClick: () => toast.success('Đã đánh dấu phiên hỗ trợ này là hoàn thành.'),
              },
              {
                label: 'Tắt thông báo hội thoại',
                icon: <BellOff className="w-4 h-4" />,
                onClick: () => toast.info('Đã tắt thông báo cho cuộc hội thoại này.'),
              },
              {
                label: 'Xóa cuộc hội thoại',
                icon: <Trash2 className="w-4 h-4" />,
                variant: 'danger',
                onClick: () => {
                  if (confirm('Bạn có chắc chắn muốn xóa hội thoại với học viên này?')) {
                    setMessages([]);
                  }
                },
              },
            ]}
          />
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-bg scroll-smooth"
        >
          {messages.map((msg) => {
            const isAdmin = msg.sender === 'ADMIN';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isAdmin
                      ? 'bg-primary text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-line rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}

          {studentIsTyping && (
            <div className="flex items-center space-x-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] text-primary font-semibold">
                {activeConversation?.student?.fullName || 'Học viên'} đang soạn tin nhắn...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} className="h-0 w-full" />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-3.5 border-t border-line bg-white flex items-center space-x-2"
        >
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-primary rounded-lg transition"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Phản hồi cho học viên qua WebSocket Gateway..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-line text-xs sm:text-sm focus:outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white shadow-sm transition flex-shrink-0"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


