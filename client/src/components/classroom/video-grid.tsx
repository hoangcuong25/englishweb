'use client';

import React from 'react';
import {
  Mic,
  MicOff,
  Hand,
  MoreVertical,
  Crown,
} from 'lucide-react';

export interface ClassroomParticipant {
  identity: string;
  name: string;
  role: 'ADMIN' | 'STUDENT';
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  avatarUrl?: string;
  videoTrack?: MediaStreamTrack | null;
}

interface VideoGridProps {
  participants: ClassroomParticipant[];
  currentUserId: string;
  currentUserRole: 'ADMIN' | 'STUDENT';
  layoutMode: 'gallery' | 'stage';
  onMuteParticipant?: (identity: string) => void;
  onLowerHand?: (identity: string) => void;
  onKickParticipant?: (identity: string) => void;
  isScreenSharing?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  currentUserId,
  currentUserRole,
  layoutMode,
  onMuteParticipant,
  onLowerHand,
  onKickParticipant,
}) => {
  const isHost = currentUserRole === 'ADMIN';

  // Separate Host from Students
  const host = participants.find((p) => p.isHost) || {
    identity: 'admin-host',
    name: 'Giảng Viên (Admin)',
    role: 'ADMIN' as const,
    isHost: true,
    isMuted: false,
    isVideoOff: false,
    isHandRaised: false,
    isSpeaking: true,
  };

  const students = participants.filter((p) => !p.isHost);

  // Pad students to 7 slots for standard IELTS classroom (1 Host + 7 Students)
  const totalStudentSlots = 7;
  const filledStudents: (ClassroomParticipant | null)[] = [...students];
  while (filledStudents.length < totalStudentSlots) {
    filledStudents.push(null);
  }

  // Render Single Participant Tile
  const renderTile = (
    p: ClassroomParticipant | null,
    isProminent: boolean = false,
    slotIndex?: number,
  ) => {
    if (!p) {
      // Empty slot placeholder
      return (
        <div
          key={`empty-${slotIndex}`}
          className="relative rounded-2xl bg-slate-900/40 border border-dashed border-slate-700/60 flex flex-col items-center justify-center text-slate-500 min-h-[140px] sm:min-h-[160px] p-4 transition"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 text-xs font-semibold mb-2">
            #{slotIndex ? slotIndex + 1 : ''}
          </div>
          <span className="text-xs font-medium">Chờ học viên vào...</span>
        </div>
      );
    }

    const isMe = p.identity === currentUserId;

    return (
      <div
        key={p.identity}
        className={`relative rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-200 group flex flex-col justify-between ${
          p.isSpeaking ? 'ring-2 ring-emerald-400 border-emerald-500 shadow-md shadow-emerald-950/20' : 'border-slate-800'
        } ${isProminent ? 'min-h-[220px] sm:min-h-[300px]' : 'min-h-[140px] sm:min-h-[170px]'}`}
      >
        {/* Video stream or Avatar Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
          {p.isVideoOff ? (
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                  p.isHost
                    ? 'w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-sky-600 to-blue-500 text-xl sm:text-2xl ring-4 ring-sky-400/30'
                    : 'w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-slate-700 to-slate-600 text-base sm:text-lg'
                }`}
              >
                {p.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(-2)
                  .join('')
                  .toUpperCase()}
              </div>
              <span className="text-xs text-slate-400 font-medium">Camera đã tắt</span>
            </div>
          ) : (
            // Simulated or real video stream
            <div className="w-full h-full bg-slate-950 flex items-center justify-center relative">
              <div className="text-slate-600 text-xs">Video Feed ({p.name})</div>
              {/* Active speaker wave animation */}
              {p.isSpeaking && (
                <div className="absolute bottom-12 right-4 flex items-center space-x-0.5">
                  <div className="w-1 bg-emerald-400 rounded-full animate-pulse h-3"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-pulse h-5 delay-75"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-pulse h-4 delay-150"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top Overlay Badges */}
        <div className="relative z-10 p-3 flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {p.isHost ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white backdrop-blur shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                <span>Giáo Viên (Host)</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/80 text-sky-300 backdrop-blur border border-slate-700">
                Học viên
              </span>
            )}

            {isMe && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-600 text-white shadow-sm">
                Bạn
              </span>
            )}
          </div>

          {/* Raised Hand Badge */}
          {p.isHandRaised && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-yellow-400 text-yellow-950 font-bold text-xs animate-bounce shadow-md">
              <Hand className="w-3.5 h-3.5 fill-current" />
              <span>Giơ tay!</span>
            </div>
          )}
        </div>

        {/* Bottom Overlay Info & Controls */}
        <div className="relative z-10 p-3 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <div
              className={`p-1.5 rounded-full ${
                p.isMuted ? 'bg-red-500/80 text-white' : 'bg-slate-800 text-emerald-400'
              }`}
            >
              {p.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-sm">
              {p.name}
            </span>
          </div>

          {/* Host Actions on Student Tile */}
          {isHost && !p.isHost && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
              {!p.isMuted && (
                <button
                  onClick={() => onMuteParticipant?.(p.identity)}
                  className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs"
                  title="Tắt mic học viên"
                >
                  <MicOff className="w-3.5 h-3.5" />
                </button>
              )}
              {p.isHandRaised && (
                <button
                  onClick={() => onLowerHand?.(p.identity)}
                  className="p-1.5 bg-yellow-500/80 hover:bg-yellow-500 text-white rounded-lg text-xs"
                  title="Hạ tay học viên"
                >
                  <Hand className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onKickParticipant?.(p.identity)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                title="Mời ra khỏi phòng"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // If in Stage Mode (Whiteboard or Screen Share is active)
  if (layoutMode === 'stage') {
    return (
      <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
        {/* Host tile pinned at top */}
        <div className="w-full">{renderTile(host, false)}</div>

        {/* Student tiles in vertical filmstrip */}
        {filledStudents
          .filter((s): s is ClassroomParticipant => s !== null)
          .map((s, idx) => (
            <div key={s.identity} className="w-full">
              {renderTile(s, false, idx)}
            </div>
          ))}
      </div>
    );
  }

  // Gallery Mode: 1 Prominent Host tile + 7 Student tiles
  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-y-auto">
      {/* Primary Row: Admin Host + Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Host takes 2 columns in large layout */}
        <div className="lg:col-span-2">{renderTile(host, true)}</div>

        {/* First 2 students */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {renderTile(filledStudents[0], false, 0)}
          {renderTile(filledStudents[1], false, 1)}
        </div>
      </div>

      {/* Secondary Row: 5 remaining students (Total 7 Students) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {renderTile(filledStudents[2], false, 2)}
        {renderTile(filledStudents[3], false, 3)}
        {renderTile(filledStudents[4], false, 4)}
        {renderTile(filledStudents[5], false, 5)}
        {renderTile(filledStudents[6], false, 6)}
      </div>
    </div>
  );
};
