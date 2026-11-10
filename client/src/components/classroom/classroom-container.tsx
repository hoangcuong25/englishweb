'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Whiteboard, WhiteboardStroke } from './whiteboard';
import { VideoGrid, ClassroomParticipant } from './video-grid';
import { ClassroomControls } from './classroom-controls';
import { ClassroomSidebar, ChatMessage } from './classroom-sidebar';
import { Loader2, Wifi, Monitor } from 'lucide-react';
import { Room, RoomEvent } from 'livekit-client';

interface ClassroomContainerProps {
  roomId: string;
  isHost: boolean;
}

export const ClassroomContainer: React.FC<ClassroomContainerProps> = ({ roomId, isHost }) => {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // Classroom States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'gallery' | 'stage'>('stage');
  const [allowStudentDrawing, setAllowStudentDrawing] = useState(true);

  // Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'participants' | 'chat'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Collaborative Whiteboard strokes
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);

  // Participants List (1 Host + Students)
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);

  const roomRef = useRef<Room | null>(null);

  // Initialize Room Token & Setup
  useEffect(() => {
    let isMounted = true;

    async function initClassroom() {
      try {
        setLoading(true);

        // Fetch LiveKit Token from NestJS Backend
        const res = await api.post('/livekit/token', { roomName: roomId });
        const token = res.data?.data?.token || res.data?.token;
        if (!token) {
          throw new Error('Failed to retrieve LiveKit token from server response');
        }

        // Try to connect to LiveKit SFU server
        const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        // Listen for DataChannel packets
        room.on(RoomEvent.DataReceived, (payload) => {
          try {
            const data = JSON.parse(new TextDecoder().decode(payload));
            if (data.type === 'WB_STROKE') {
              setStrokes((prev) => [...prev, data.stroke]);
            } else if (data.type === 'WB_CLEAR') {
              setStrokes([]);
            } else if (data.type === 'WB_PERMS') {
              setAllowStudentDrawing(data.allow);
            } else if (data.type === 'CHAT') {
              setMessages((prev) => [...prev, { ...data.message, isMe: false }]);
              if (!isSidebarOpen) {
                setUnreadChatCount((prev) => prev + 1);
              }
            } else if (data.type === 'HAND_RAISE') {
              setParticipants((prev) =>
                prev.map((p) =>
                  p.identity === data.identity ? { ...p, isHandRaised: data.raised } : p,
                ),
              );
            } else if (data.type === 'MUTE_ALL' && !isHost) {
              setIsMuted(true);
            }
          } catch (e) {
            console.error('Error parsing DataChannel packet:', e);
          }
        });

        await room.connect(livekitUrl, token);
        if (isMounted) {
          setIsConnected(true);
        }
      } catch (err: unknown) {
        console.warn('LiveKit SFU not reachable on ws://localhost:7880. Entering Interactive Preview Sandbox Mode.', err);
        if (isMounted) {
          setIsSandboxMode(true);
          setupMockClassroom();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initClassroom();

    return () => {
      isMounted = false;
      roomRef.current?.disconnect();
    };
  }, [roomId, isHost]);

  // Setup interactive mock participants for testing when livekit SFU is not running locally
  const setupMockClassroom = useCallback(() => {
    const currentName = user?.fullName || (isHost ? 'Admin Host' : 'Học Viên');
    const myIdentity = user?.id || (isHost ? 'admin-1' : 'student-1');

    const mockHost: ClassroomParticipant = {
      identity: isHost ? myIdentity : 'admin-host-1',
      name: isHost ? currentName : 'Thầy Hoàng Cường (Admin)',
      role: 'ADMIN',
      isHost: true,
      isMuted: isHost ? isMuted : false,
      isVideoOff: isHost ? isVideoOff : false,
      isHandRaised: false,
      isSpeaking: true,
    };

    const mockStudents: ClassroomParticipant[] = [
      {
        identity: !isHost ? myIdentity : 'student-1',
        name: !isHost ? currentName : 'Nguyen Thi Mai',
        role: 'STUDENT',
        isHost: false,
        isMuted: !isHost ? isMuted : false,
        isVideoOff: !isHost ? isVideoOff : false,
        isHandRaised: !isHost ? isHandRaised : false,
        isSpeaking: false,
      },
      {
        identity: 'student-2',
        name: 'Tran Van Bao',
        role: 'STUDENT',
        isHost: false,
        isMuted: true,
        isVideoOff: false,
        isHandRaised: true,
        isSpeaking: false,
      },
      {
        identity: 'student-3',
        name: 'Pham Thu Huong',
        role: 'STUDENT',
        isHost: false,
        isMuted: false,
        isVideoOff: false,
        isHandRaised: false,
        isSpeaking: true,
      },
      {
        identity: 'student-4',
        name: 'Le Hoang Nam',
        role: 'STUDENT',
        isHost: false,
        isMuted: true,
        isVideoOff: true,
        isHandRaised: false,
        isSpeaking: false,
      },
      {
        identity: 'student-5',
        name: 'Doan Minh Quan',
        role: 'STUDENT',
        isHost: false,
        isMuted: true,
        isVideoOff: false,
        isHandRaised: false,
        isSpeaking: false,
      },
    ];

    setParticipants([mockHost, ...mockStudents]);

    // Initial warm-up chat message
    setMessages([
      {
        id: 'msg-1',
        senderName: 'Thầy Hoàng Cường',
        senderRole: 'ADMIN',
        text: 'Welcome everybody to our IELTS Speaking Part 1 masterclass! Please turn on your cameras and check your mics.',
        timestamp: '19:30',
        isMe: isHost,
      },
    ]);
  }, [user, isHost, isMuted, isVideoOff, isHandRaised]);

  // Broadcast data helper
  const broadcastData = useCallback((data: Record<string, unknown>) => {
    if (roomRef.current && isConnected) {
      const payload = new TextEncoder().encode(JSON.stringify(data));
      roomRef.current.localParticipant.publishData(payload, { reliable: true });
    }
  }, [isConnected]);

  // Whiteboard Actions
  const handleStrokeComplete = (stroke: WhiteboardStroke) => {
    setStrokes((prev) => [...prev, stroke]);
    broadcastData({ type: 'WB_STROKE', stroke });
  };

  const handleClearBoard = () => {
    setStrokes([]);
    broadcastData({ type: 'WB_CLEAR' });
  };

  const handleToggleStudentDraw = (allowed: boolean) => {
    setAllowStudentDrawing(allowed);
    broadcastData({ type: 'WB_PERMS', allow: allowed });
  };

  // Chat Actions
  const handleSendMessage = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: user?.fullName || (isHost ? 'Admin' : 'Học Viên'),
      senderRole: isHost ? 'ADMIN' : 'STUDENT',
      text,
      timestamp: time,
      isMe: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    broadcastData({ type: 'CHAT', message: newMessage });
  };

  // Participant Hand Actions
  const handleToggleHand = () => {
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);
    setParticipants((prev) =>
      prev.map((p) =>
        p.identity === user?.id ? { ...p, isHandRaised: nextHand } : p,
      ),
    );
    broadcastData({ type: 'HAND_RAISE', identity: user?.id, raised: nextHand });
  };

  // Host Controls
  const handleMuteParticipant = (targetIdentity: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.identity === targetIdentity ? { ...p, isMuted: true } : p)),
    );
  };

  const handleLowerHand = (targetIdentity: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.identity === targetIdentity ? { ...p, isHandRaised: false } : p)),
    );
  };

  const handleMuteAllStudents = () => {
    setParticipants((prev) =>
      prev.map((p) => (!p.isHost ? { ...p, isMuted: true } : p)),
    );
    broadcastData({ type: 'MUTE_ALL' });
  };

  const handleEndClass = async () => {
    if (confirm('Bạn có chắc chắn muốn kết thúc buổi học cho toàn bộ học viên không?')) {
      try {
        await api.post('/livekit/end-room', { roomName: roomId });
      } catch {
        // Continue redirect
      }
      router.push(isHost ? '/admin/dashboard' : '/student/dashboard');
    }
  };

  const handleLeaveRoom = () => {
    roomRef.current?.disconnect();
    router.push(isHost ? '/admin/dashboard' : '/student/dashboard');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Đang khởi tạo phòng học LiveKit WebRTC...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden text-white font-sans select-none">
      {/* Top Status Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            EL
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-200">Phòng: {roomId}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Trực Tiếp</span>
            </span>
            {isSandboxMode && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Chế độ Thử Nghiệm Tương Tác
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div className="hidden sm:flex items-center space-x-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Độ trễ &lt;120ms</span>
          </div>
          <span className="font-semibold text-slate-300">
            {isHost ? 'Admin (Host Giảng Dạy)' : 'Học Viên (Student)'}: {user?.fullName || 'Người dùng'}
          </span>
        </div>
      </div>

      {/* Main Classroom Body */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Stage / Video Canvas Container */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-2 sm:p-3 overflow-hidden">
          {layoutMode === 'stage' ? (
            /* Split Stage View: 70% Whiteboard/Share + 30% Video Strip */
            <div className="w-full h-full flex flex-col lg:flex-row gap-3">
              {/* Main Stage (Whiteboard or Screen) */}
              <div className="flex-1 h-full min-h-[350px] relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                {isWhiteboardOpen ? (
                  <Whiteboard
                    isHost={isHost}
                    canDraw={true}
                    onStrokeComplete={handleStrokeComplete}
                    onClearBoard={handleClearBoard}
                    onToggleStudentDraw={handleToggleStudentDraw}
                    remoteStrokes={strokes}
                    allowStudentDrawing={allowStudentDrawing}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-3">
                    <Monitor className="w-16 h-16 text-slate-600" />
                    <h3 className="text-base font-bold text-slate-300">Sân Khấu Bài Giảng</h3>
                    <p className="text-xs text-slate-500 max-w-md">
                      Bấm vào nút <strong>&quot;Bảng vẽ&quot;</strong> hoặc <strong>&quot;Chia sẻ&quot;</strong> ở thanh công cụ phía dưới để bắt đầu giảng dạy tương tác với học viên.
                    </p>
                  </div>
                )}
              </div>

              {/* Video Strip (Host + 7 Students) */}
              <div className="w-full lg:w-72 xl:w-80 h-48 lg:h-full flex-shrink-0">
                <VideoGrid
                  participants={participants}
                  currentUserId={user?.id || 'me'}
                  currentUserRole={isHost ? 'ADMIN' : 'STUDENT'}
                  layoutMode="stage"
                  onMuteParticipant={handleMuteParticipant}
                  onLowerHand={handleLowerHand}
                />
              </div>
            </div>
          ) : (
            /* Gallery Mode: Full Grid (1 Prominent Host + 7 Students) */
            <div className="w-full h-full">
              <VideoGrid
                participants={participants}
                currentUserId={user?.id || 'me'}
                currentUserRole={isHost ? 'ADMIN' : 'STUDENT'}
                layoutMode="gallery"
                onMuteParticipant={handleMuteParticipant}
                onLowerHand={handleLowerHand}
              />
            </div>
          )}
        </div>

        {/* Collapsible Sidebar (Participants / Chat) */}
        <ClassroomSidebar
          isOpen={isSidebarOpen}
          activeTab={sidebarTab}
          onClose={() => setIsSidebarOpen(false)}
          onTabChange={(tab) => setSidebarTab(tab)}
          participants={participants}
          messages={messages}
          onSendMessage={handleSendMessage}
          isHost={isHost}
          onMuteParticipant={handleMuteParticipant}
        />
      </div>

      {/* Bottom Floating Classroom Control Dock */}
      <ClassroomControls
        isHost={isHost}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isWhiteboardOpen={isWhiteboardOpen}
        isHandRaised={isHandRaised}
        layoutMode={layoutMode}
        participantCount={participants.length}
        unreadChatCount={unreadChatCount}
        isSidebarOpen={isSidebarOpen}
        sidebarTab={sidebarTab}
        onToggleMic={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
        onToggleWhiteboard={() => {
          setIsWhiteboardOpen(!isWhiteboardOpen);
          if (!isWhiteboardOpen) setLayoutMode('stage');
        }}
        onToggleHand={handleToggleHand}
        onToggleLayout={() => setLayoutMode(layoutMode === 'gallery' ? 'stage' : 'gallery')}
        onToggleSidebar={(tab) => {
          if (isSidebarOpen && sidebarTab === tab) {
            setIsSidebarOpen(false);
          } else {
            setIsSidebarOpen(true);
            setSidebarTab(tab);
            if (tab === 'chat') setUnreadChatCount(0);
          }
        }}
        onMuteAllStudents={handleMuteAllStudents}
        onEndClass={handleEndClass}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
};
