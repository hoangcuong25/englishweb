import { api } from '../lib/api';

export interface ClassroomAttendanceRecord {
  id: string;
  studentId: string;
  classroomId: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  durationMinutes: number;
  joinedAt?: string;
  leftAt?: string;
  notes?: string;
  student?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export interface ClassroomSession {
  id: string;
  name: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualDurationMinutes?: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export const attendanceService = {
  async getClassrooms(): Promise<ClassroomSession[]> {
    const response = await api.get('/attendance/classrooms');
    return response.data?.data || response.data || [];
  },

  async createClassroom(data: { name: string; courseId?: string; scheduledStartTime: string; scheduledEndTime: string }) {
    const response = await api.post('/attendance/classrooms', data);
    return response.data?.data || response.data;
  },

  async getAttendanceByClassroom(classroomId: string): Promise<ClassroomAttendanceRecord[]> {
    const response = await api.get(`/attendance/classroom/${classroomId}`);
    return response.data?.data || response.data || [];
  },

  async getMyAttendance(): Promise<ClassroomAttendanceRecord[]> {
    const response = await api.get('/attendance/my');
    return response.data?.data || response.data || [];
  },

  async overrideAttendance(id: string, data: { status: 'PRESENT' | 'LATE' | 'ABSENT'; notes?: string }) {
    const response = await api.put(`/attendance/${id}/override`, data);
    return response.data?.data || response.data;
  },

  async exportExcel(classroomId: string) {
    const response = await api.get(`/attendance/classroom/${classroomId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportDateRange(startDate?: string, endDate?: string, courseId?: string) {
    const response = await api.get('/attendance/export', {
      params: { startDate, endDate, courseId },
      responseType: 'blob',
    });
    return response.data;
  },
};

