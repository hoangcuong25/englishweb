'use client';

import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  CheckCheck,
  Search,
  MoreVertical,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ME' | 'TEACHER';
  text: string;
  time: string;
  isRead: boolean;
}

export default function StudentMessagesPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'TEACHER',
      text: 'Chào em! Thầy đã xem qua bài Writing Task 2 hôm qua em nộp. Em nhớ chú ý thêm các liên từ nhượng bộ như "Albeit" và "Notwithstanding" để nâng band Coherence nhé.',
      time: '14:25',
      isRead: true,
    },
    {
      id: 'm2',
      sender: 'ME',
      text: 'Dạ em cảm ơn Thầy Đông nhiều ạ! Tối nay lớp LiveKit Speaking 19:30 em sẽ vào sớm 10 phút để test micro ạ.',
      time: '14:30',
      isRead: true,
    },
    {
      id: 'm3',
      sender: 'TEACHER',
      text: 'Tốt lắm, tối nay chủ đề Part 2 khá hay về "Important Decision", em chuẩn bị trước dàn ý nhé!',
      time: '14:32',
      isRead: true,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'ME',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');

    // Simulate Teacher Reply via WebSocket Gateway
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        sender: 'TEACHER',
        text: 'Thầy đã nhận được tin nhắn qua WebSocket Gateway. Hẹn gặp em trong lớp học trực tuyến nhé!',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-line shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Left Sidebar: Conversations List */}
      <div className="w-full md:w-80 border-r border-line flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-line">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Hội Thoại & Hỗ Trợ Học Vụ
          </h2>
          <div className="relative mt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tin nhắn..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line text-xs bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-line/60">
          <div className="p-4 bg-sky-50/70 border-l-4 border-primary flex items-start space-x-3 cursor-pointer">
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

          <div className="p-4 hover:bg-slate-50 flex items-start space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
              HV
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 truncate">Hỗ Trợ Học Vụ & Kỹ Thuật</h4>
                <span className="text-[10px] text-muted">Hôm qua</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Tài khoản của bạn đã được gia hạn thành công...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Active Chat Window */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">
              TD
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Thầy Đông (IELTS 8.5)</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-muted">Online qua WebSocket Gateway • Phản hồi nhanh</p>
            </div>
          </div>

          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-bg">
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

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px]">Thầy Đông đang gõ tin nhắn...</span>
            </div>
          )}
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
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn... (Nhấn Enter để gửi qua WebSocket)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-line text-xs sm:text-sm focus:outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white shadow-sm transition flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

