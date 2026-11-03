'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PenTool,
  Hand,
  Users,
  MessageSquare,
  PhoneOff,
  LayoutGrid,
  Maximize2,
  ShieldAlert,
  ChevronUp,
} from 'lucide-react';

interface ClassroomControlsProps {
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isWhiteboardOpen: boolean;
  isHandRaised: boolean;
  layoutMode: 'gallery' | 'stage';
  participantCount: number;
  unreadChatCount?: number;
  isSidebarOpen: boolean;
  sidebarTab: 'participants' | 'chat';
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleWhiteboard: () => void;
  onToggleHand: () => void;
  onToggleLayout: () => void;
  onToggleSidebar: (tab: 'participants' | 'chat') => void;
  onMuteAllStudents?: () => void;
  onEndClass?: () => void;
  onLeaveRoom: () => void;
}

export const ClassroomControls: React.FC<ClassroomControlsProps> = ({
  isHost,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isWhiteboardOpen,
  isHandRaised,
  layoutMode,
  participantCount,
  unreadChatCount = 0,
  isSidebarOpen,
  sidebarTab,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleWhiteboard,
  onToggleHand,
  onToggleLayout,
  onToggleSidebar,
  onMuteAllStudents,
  onEndClass,
  onLeaveRoom,
}) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  return (
    <div className="relative px-4 py-3 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 flex items-center justify-between text-white select-none">
      {/* Left section: Layout & Status info */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleLayout}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
            layoutMode === 'stage'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
          }`}
          title="Chuyển chế độ hiển thị"
        >
          {layoutMode === 'stage' ? (
            <>
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Chế độ Lưới (Gallery)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chế độ Sân Khấu (Stage)</span>
            </>
          )}
        </button>

        {isHost && (
          <div className="relative">
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Quyền Host</span>
              <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showAdminMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Admin Popup Menu */}
            {showAdminMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                <button
                  onClick={() => {
                    onMuteAllStudents?.();
                    setShowAdminMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition"
                >
                  <MicOff className="w-4 h-4 text-red-400" />
                  <span>Tắt mic tất cả học viên</span>
                </button>
                <button
                  onClick={() => {
                    onEndClass?.();
                    setShowAdminMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 flex items-center space-x-2 transition"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Kết thúc buổi học cho tất cả</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center Section: Core Call Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mic Button */}
        <button
          onClick={onToggleMic}
          className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm flex items-center space-x-2 transition shadow-md ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          <span className="hidden md:inline">{isMuted ? 'Bật Mic' : 'Mic'}</span>
        </button>

        {/* Camera Button */}
        <button
          onClick={onToggleVideo}
          className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm flex items-center space-x-2 transition shadow-md ${
            isVideoOff
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title={isVideoOff ? 'Bật Camera' : 'Tắt Camera'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-sky-400" />}
          <span className="hidden md:inline">{isVideoOff ? 'Bật Cam' : 'Camera'}</span>
        </button>

        {/* Screen Share Button */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm flex items-center space-x-2 transition shadow-md ${
            isScreenSharing
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-900/40 ring-2 ring-sky-400'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title="Chia sẻ màn hình bài giảng"
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5 text-sky-300" />}
          <span className="hidden md:inline">{isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ'}</span>
        </button>

        {/* Whiteboard Toggle Button */}
        <button
          onClick={onToggleWhiteboard}
          className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm flex items-center space-x-2 transition shadow-md ${
            isWhiteboardOpen
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-900/40 ring-2 ring-sky-400'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title="Bảng vẽ tương tác"
        >
          <PenTool className="w-5 h-5 text-amber-300" />
          <span className="hidden md:inline">{isWhiteboardOpen ? 'Ẩn bảng' : 'Bảng vẽ'}</span>
        </button>

        {/* Raise Hand (Student feature) */}
        {!isHost && (
          <button
            onClick={onToggleHand}
            className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm flex items-center space-x-2 transition shadow-md ${
              isHandRaised
                ? 'bg-yellow-400 text-yellow-950 shadow-yellow-900/40 ring-2 ring-yellow-300 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Giơ tay phát biểu"
          >
            <Hand className="w-5 h-5 fill-current" />
            <span className="hidden md:inline">{isHandRaised ? 'Hạ tay' : 'Giơ tay'}</span>
          </button>
        )}

        {/* Leave Room Button */}
        <button
          onClick={onLeaveRoom}
          className="p-3 sm:px-4 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-red-900/40 transition"
          title="Rời khỏi phòng học"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline">Rời lớp</span>
        </button>
      </div>

      {/* Right Section: Sidebar Toggles (Participants & Chat) */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToggleSidebar('participants')}
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
            isSidebarOpen && sidebarTab === 'participants'
              ? 'bg-sky-600 text-white'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
          }`}
          title="Danh sách học viên"
        >
          <Users className="w-4 h-4" />
          <span className="text-xs font-bold">{participantCount}</span>
        </button>

        <button
          onClick={() => onToggleSidebar('chat')}
          className={`relative p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
            isSidebarOpen && sidebarTab === 'chat'
              ? 'bg-sky-600 text-white'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
          }`}
          title="Trò chuyện trong lớp"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
