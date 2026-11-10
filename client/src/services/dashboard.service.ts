import { api } from '../lib/api';

export interface StudentDashboardData {
  overview: {
    enrolledCoursesCount: number;
    averageProgress: number;
    completedLessonsCount: number;
    completedQuizzesCount: number;
    writingSubmissionsCount: number;
    speakingSubmissionsCount: number;
  };
  recentCourses: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    category?: string;
    progressPercent?: number;
    enrolledAt?: string;
  }>;
  upcomingClassrooms: Array<{
    id: string;
    name: string;
    roomName: string;
    scheduledStartTime: string;
    durationMinutes: number;
    status: string;
    host?: { fullName: string };
    course?: { title: string };
  }>;
  recentWriting: Array<{
    id: string;
    overallScore?: number | null;
    status: string;
    submittedAt: string;
    feedbackSummary?: string | null;
    prompt?: { title: string; taskType: string };
  }>;
  recentSpeaking: Array<{
    id: string;
    overallBand?: number | null;
    status: string;
    submittedAt: string;
    adminFeedback?: string | null;
    prompt?: { title: string; topic: string };
  }>;
  attendanceSummary: {
    totalSessions: number;
    present: number;
    late: number;
    absent: number;
  };
}

export interface AdminDashboardData {
  metrics: {
    totalStudents: number;
    totalCourses: number;
    totalLessons: number;
    totalClassrooms: number;
    totalWritingSubmissions: number;
    totalSpeakingSubmissions: number;
  };
  actionItems: {
    pendingWritingApprovals: number;
    pendingSpeakingGradings: number;
  };
  attendanceOverview: {
    totalRecords: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    presentRate: number;
    lateRate: number;
    absentRate: number;
  };
  recentStudents: Array<{
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  activeOrUpcomingClassrooms: Array<{
    id: string;
    name: string;
    roomName: string;
    scheduledStartTime: string;
    durationMinutes: number;
    status: string;
    host?: { fullName: string };
    course?: { title: string };
    _count?: { attendanceRecords: number };
  }>;
  recentSubmissions: {
    writing: Array<{
      id: string;
      submittedAt: string;
      status: string;
      overallScore?: number | null;
      user?: { fullName: string; email: string };
      prompt?: { title: string; taskType: string };
    }>;
    speaking: Array<{
      id: string;
      submittedAt: string;
      status: string;
      overallBand?: number | null;
      user?: { fullName: string; email: string };
      prompt?: { title: string; topic: string };
    }>;
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
