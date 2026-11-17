import { api } from '../lib/api';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  level: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  published?: boolean;
  isPublished?: boolean;
  enrollmentCount?: number;
  studentCount?: number;
  moduleCount?: number;
  modules?: CourseModule[];
  progress?: number;
  progressPercent?: number;
  enrolledAt?: string;
  isEnrolled?: boolean;
  totalModules?: number;
  totalLessons?: number;
  price?: number;
  status?: string;
  enrollmentStatus?: 'ACTIVE' | 'PENDING' | 'REJECTED';
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  progressPercent: number;
  paymentNote?: string;
  paymentAmount?: number;
  enrolledAt: string;
  approvedAt?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    thumbnail?: string;
    category?: string;
    price?: number;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
  isCompleted?: boolean;
}

export const coursesService = {
  async getCategories() {
    const response = await api.get('/courses/categories');
    return response.data?.data || response.data || [];
  },

  async getCourses(category?: string, search?: string) {
    const response = await api.get('/courses', {
      params: { category, search },
    });
    return response.data?.data || response.data || [];
  },

  async getMyLearning() {
    const response = await api.get('/courses/my-learning');
    return response.data?.data || response.data || [];
  },

  async getCourseBySlug(slugOrId: string): Promise<Course> {
    const response = await api.get(`/courses/${slugOrId}`);
    return response.data?.data || response.data;
  },

  async enroll(courseId: string) {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  async requestEnroll(courseId: string, payload?: { paymentNote?: string; paymentAmount?: number }) {
    const response = await api.post(`/courses/${courseId}/enroll-request`, payload || {});
    return response.data?.data || response.data;
  },

  async getAdminEnrollments(status?: string, courseId?: string): Promise<CourseEnrollment[]> {
    const response = await api.get('/courses/admin/enrollments', {
      params: { status, courseId },
    });
    return response.data?.data || response.data || [];
  },

  async approveEnrollment(enrollmentId: string) {
    const response = await api.put(`/courses/admin/enrollments/${enrollmentId}/approve`);
    return response.data?.data || response.data;
  },

  async rejectEnrollment(enrollmentId: string) {
    const response = await api.put(`/courses/admin/enrollments/${enrollmentId}/reject`);
    return response.data?.data || response.data;
  },

  async manualEnroll(payload: { courseId: string; userId: string; note?: string }) {
    const response = await api.post('/courses/admin/manual-enroll', payload);
    return response.data?.data || response.data;
  },

  async checkIeltsAccess(): Promise<{ hasAccess: boolean; enrolledEnglishCourses: Course[]; message?: string }> {
    try {
      const response = await api.get('/courses/ielts-access');
      return response.data?.data || response.data || { hasAccess: false, enrolledEnglishCourses: [] };
    } catch {
      return { hasAccess: false, enrolledEnglishCourses: [] };
    }
  },

  async createCourse(data: Record<string, unknown>) {
    const response = await api.post('/courses', data);
    return response.data;
  },

  async updateCourse(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  async deleteCourse(id: string) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

