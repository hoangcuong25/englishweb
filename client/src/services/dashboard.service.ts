import { api } from '../lib/api';

export interface StudentDashboardData {
  enrolledCoursesCount: number;
  averageWritingScore: number;
  averageSpeakingScore: number;
  quizzesCompletedCount: number;
  attendanceRate: number;
  upcomingClassrooms: Record<string, unknown>[];
  recentActivities: Record<string, unknown>[];
}

export interface AdminDashboardData {
  totalStudents: number;
  activeStudentsToday: number;
  totalCourses: number;
  pendingWritingCount: number;
  pendingSpeakingCount: number;
  todayLiveClassrooms: Record<string, unknown>[];
  revenueSummary?: {
    monthly: number;
    currency: string;
  };
}

export const dashboardService = {
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const response = await api.get('/dashboard/student');
    return response.data?.data || response.data;
  },

  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await api.get('/dashboard/admin');
    return response.data?.data || response.data;
  },
};

