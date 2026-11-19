import { api } from '../lib/api';

export interface LivekitRoom {
  id?: string;
  name: string;
  courseId?: string | null;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  status?: string;
  host?: { id: string; fullName: string; email: string };
  course?: { id: string; title: string; slug: string; thumbnail?: string | null } | null;
  _count?: { attendanceRecords: number };
}

export interface AdminClassroomHistoryItem {
  id: string;
  name: string;
  course?: { id: string; title: string; slug: string; thumbnail?: string | null } | null;
  host?: { id: string; fullName: string; email: string };
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: string;
  isPastOrEnded: boolean;
  attendeeCount: number;
  stats: {
    present: number;
    late: number;
    absent: number;
  };
  records: Array<{
    id: string;
    status: string;
    totalMinutes: number;
    firstJoinedAt?: string | null;
    lastLeftAt?: string | null;
    student: { id: string; fullName: string; email: string };
  }>;
}

export interface StudentClassroomHistoryItem {
  id: string;
  name: string;
  course?: { id: string; title: string; slug: string; thumbnail?: string | null } | null;
  host?: { id: string; fullName: string };
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: string;
  hasJoined: boolean;
  attendanceStatus: 'PRESENT' | 'LATE' | 'ABSENT' | 'UPCOMING' | 'LIVE_NOW' | string;
  totalMinutes: number;
  firstJoinedAt?: string | null;
  lastLeftAt?: string | null;
  isPastOrEnded: boolean;
}

export interface StudentClassroomHistoryResponse {
  summary: {
    totalPastRooms: number;
    joinedCount: number;
    missedCount: number;
    attendanceRate: number;
  };
  history: StudentClassroomHistoryItem[];
}

export const livekitService = {
  async getRooms(): Promise<LivekitRoom[]> {
    const response = await api.get('/livekit/rooms');
    return response.data?.data || response.data || [];
  },

  async getAdminHistory(): Promise<AdminClassroomHistoryItem[]> {
    const response = await api.get('/livekit/admin/history');
    return response.data?.data || response.data || [];
  },

  async getStudentHistory(): Promise<StudentClassroomHistoryResponse> {
    const response = await api.get('/livekit/student/history');
    return (
      response.data?.data ||
      response.data || {
        summary: { totalPastRooms: 0, joinedCount: 0, missedCount: 0, attendanceRate: 100 },
        history: [],
      }
    );
  },

  async createRoom(data: { name: string; courseId?: string; scheduledStartTime: string; scheduledEndTime: string }) {
    const response = await api.post('/livekit/rooms', data);
    return response.data?.data || response.data;
  },

  async getToken(roomName: string): Promise<{ token: string; roomName: string }> {
    const response = await api.post('/livekit/token', { roomName });
    return response.data?.data || response.data;
  },

  async endRoom(roomName: string) {
    const response = await api.post('/livekit/end-room', { roomName });
    return response.data;
  },

  async muteParticipant(data: { roomName: string; identity: string; trackSid: string; muted: boolean }) {
    const response = await api.post('/livekit/mute-participant', data);
    return response.data;
  },

  async kickParticipant(data: { roomName: string; identity: string }) {
    const response = await api.post('/livekit/kick-participant', data);
    return response.data;
  },

  async getWhiteboardSnapshot(roomName: string) {
    const response = await api.get(`/livekit/rooms/${roomName}/whiteboard`);
    return response.data?.data || response.data;
  },

  async drawStroke(roomName: string, stroke: Record<string, unknown>) {
    const response = await api.post(`/livekit/rooms/${roomName}/whiteboard/stroke`, stroke);
    return response.data;
  },
};

