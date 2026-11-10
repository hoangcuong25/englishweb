'use client';

import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Search,
  MoreVertical,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ADMIN' | 'STUDENT';
  studentName: string;
  text: string;
  time: string;
}

export default function AdminMessagesPage() {
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'ADMIN',
      studentName: 'Thầy Đông',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-line shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Students Conversation List */}
      <div className="w-full md:w-80 border-r border-line flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-line">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Trung Tâm Hỗ Trợ Học Viên (Admin)
          </h2>
          <div className="relative mt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm học viên..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line text-xs bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-line/60">
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
        </div>
      </div>

      {/* Active Conversation */}
      <div className="flex-1 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-line flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">
              TN
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Trần Văn Nam (HV-0102)</h3>
              <p className="text-[11px] text-muted">IELTS Masterclass 7.5+ • Đang học Module 03</p>
            </div>
          </div>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
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

