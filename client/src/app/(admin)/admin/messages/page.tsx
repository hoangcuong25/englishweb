'use client';

import React, { useState, useEffect } from 'react';
import ActionMenu from '@/components/ui/action-menu';
import { chatService, ConversationItem, ChatMessageItem } from '@/services/chat.service';
import { useAuth } from '@/lib/auth-context';
import {
  Send,
  Paperclip,
  Search,
  UserCheck,
  BellOff,
  Trash2,
  GraduationCap,
  RefreshCw,
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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'STUDENT',
      studentName: 'Trần Văn Nam',
      text: 'Thầy ơi, bài Writing Task 2 em nộp đã được AI chấm 7.0, Thầy xem giúp em phần Lexical Resource nhé!',
      time: '15:10',
    },
    {
      id: 'm2',
      sender: 'ADMIN',
      studentName: 'Thầy Đông',
      text: 'Thầy vừa xem rồi Nam nhé, bài viết rất tốt. Thầy đã điều chỉnh điểm LR lên 7.5 và duyệt kết quả rồi nhé.',
      time: '15:14',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const list = await chatService.getConversations();
      if (Array.isArray(list) && list.length > 0) {
        setConversations(list);
        const first = list[0];
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
      if (Array.isArray(items) && items.length > 0) {
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
      }
      await chatService.markAsRead(convId).catch(() => {});
    } catch (err) {
      console.warn('Could not load messages:', err);
    }
  };

  const handleSelectConversation = async (conv: ConversationItem) => {
    setActiveConversation(conv);
    await loadMessages(conv.id, conv.student?.fullName || 'Học viên');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

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
          setMessages((prev) =>
            prev.map((m) =>
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
            )
          );
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
      <div className="w-full md:w-80 border-r border-line flex flex-col h-full bg-slate-50/50">
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
              <div className="p-4 bg-sky-50/70 border-l-4 border-primary flex items-start space-x-3 cursor-pointer">
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

              <div className="p-4 hover:bg-slate-50 flex items-start space-x-3 cursor-pointer">
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
      <div className="flex-1 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-line flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">
              {initials}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">{studentName}</h3>
              <p className="text-[11px] text-muted">{studentEmail} • Trực tuyến qua WebSocket</p>
            </div>
          </div>
          <ActionMenu
            items={[
              {
                label: 'Xem học bạ học viên',
                icon: <GraduationCap className="w-4 h-4 text-primary" />,
                onClick: () =>
                  alert(`Thông tin học viên: ${studentName} (${studentEmail})`),
              },
              {
                label: 'Đánh dấu đã hoàn thành hỗ trợ',
                icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
                onClick: () => alert('Đã đánh dấu phiên hỗ trợ này là hoàn thành.'),
              },
              {
                label: 'Tắt thông báo hội thoại',
                icon: <BellOff className="w-4 h-4" />,
                onClick: () => alert('Đã tắt thông báo cho cuộc hội thoại này.'),
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-bg">
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
            onChange={(e) => setInputMessage(e.target.value)}
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


