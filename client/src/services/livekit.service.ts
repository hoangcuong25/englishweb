import { api } from '../lib/api';

export interface LivekitRoom {
  id?: string;
  name: string;
  courseId?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  activeParticipants?: number;
}

export const livekitService = {
  async getRooms(): Promise<LivekitRoom[]> {
    const response = await api.get('/livekit/rooms');
    return response.data?.data || response.data || [];
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

  async getWhiteboardSnapshot(roomName: string) {
    const response = await api.get(`/livekit/rooms/${roomName}/whiteboard`);
    return response.data?.data || response.data;
  },

  async drawStroke(roomName: string, stroke: Record<string, unknown>) {
    const response = await api.post(`/livekit/rooms/${roomName}/whiteboard/stroke`, stroke);
    return response.data;
  },
};

