'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ClassroomParticipant } from './video-grid';
import {
  Users,
  MessageSquare,
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Send,
  Crown,
  Search,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'ADMIN' | 'STUDENT';
  text: string;
  timestamp: string;
  isMe: boolean;
}

interface ClassroomSidebarProps {
  isOpen: boolean;
  activeTab: 'participants' | 'chat';
  onClose: () => void;
  onTabChange: (tab: 'participants' | 'chat') => void;
  participants: ClassroomParticipant[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isHost: boolean;
  onMuteParticipant?: (identity: string) => void;
}

export const ClassroomSidebar: React.FC<ClassroomSidebarProps> = ({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
  participants,
  messages,
  onSendMessage,
  isHost,
  onMuteParticipant,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isOpen) return null;

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl transition-all">
      {/* Header Tabs */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => onTabChange('participants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === 'participants'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Học viên ({participants.length})</span>
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeTab === 'chat'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tin nhắn ({messages.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Đóng sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content: Participants List */}
      {activeTab === 'participants' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên học viên..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800/90 text-slate-200 placeholder-slate-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredParticipants.map((p) => (
              <div
                key={p.identity}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                      p.isHost ? 'bg-amber-500 ring-2 ring-amber-400/30' : 'bg-slate-700'
                    }`}
                  >
                    {p.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(-2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-semibold text-slate-200 truncate">{p.name}</span>
                      {p.isHost && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {p.isHost ? 'Chủ phòng' : 'Học viên'}
                    </span>
                  </div>
                </div>

                {/* State Icons & Quick Action */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {p.isHandRaised && (
                    <span className="p-1 text-yellow-400" title="Đang giơ tay">
                      <Hand className="w-3.5 h-3.5 fill-current animate-bounce" />
                    </span>
                  )}

                  <span
                    className={`p-1 rounded-md text-xs ${
                      p.isMuted ? 'text-red-400' : 'text-emerald-400'
                    }`}
                    title={p.isMuted ? 'Mic tắt' : 'Mic bật'}
                  >
                    {p.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </span>

                  <span
                    className={`p-1 rounded-md text-xs ${
                      p.isVideoOff ? 'text-red-400' : 'text-sky-400'
                    }`}
                    title={p.isVideoOff ? 'Cam tắt' : 'Cam bật'}
                  >
                    {p.isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  </span>

                  {isHost && !p.isHost && !p.isMuted && (
                    <button
                      onClick={() => onMuteParticipant?.(p.identity)}
                      className="ml-1 px-1.5 py-0.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded text-[10px] font-semibold transition"
                    >
                      Tắt mic
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Live Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-8">
                Chưa có tin nhắn nào trong lớp học. <br />
                Hãy gửi lời chào hoặc đặt câu hỏi cho giảng viên!
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{m.senderName}</span>
                    {m.senderRole === 'ADMIN' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                        HOST
                      </span>
                    )}
                    <span>• {m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${
                      m.isMe
                        ? 'bg-sky-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chat Chips for Language Learning */}
          <div className="px-3 py-1.5 border-t border-slate-800/80 flex items-center space-x-1 overflow-x-auto text-[11px]">
            <button
              onClick={() => onSendMessage('I have a question! 🙋‍♂️')}
              className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              🙋‍♂️ Question
            </button>
            <button
              onClick={() => onSendMessage('Can you repeat that please? 🔁')}
              className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              🔁 Repeat
            </button>
            <button
              onClick={() => onSendMessage('Great explanation! 👍')}
              className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              👍 Clear
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 py-2 bg-slate-800 text-slate-200 placeholder-slate-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition disabled:opacity-40"
              title="Gửi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
