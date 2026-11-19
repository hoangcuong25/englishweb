import { api } from '../lib/api';

export const DEFAULT_COVERS: Record<string, string> = {
  IELTS: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop',
  ENGLISH: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop',
  BUSINESS: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
  KIDS: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop',
  PEDAGOGY: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop',
  LIFE_SKILLS: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop',
  SOFT_SKILLS: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop',
  PERSONAL_DEV: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop',
};

export function getCourseCoverUrl(thumbnail?: string | null, category?: string): string {
  if (thumbnail && thumbnail.trim() !== '') return thumbnail.trim();
  const cat = (category || 'IELTS').toUpperCase();
  return DEFAULT_COVERS[cat] || DEFAULT_COVERS.IELTS;
}

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
  isEnglishCourse?: boolean;
  modulesCount?: number;
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

  async uploadThumbnailFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/courses/upload-thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  async uploadThumbnail(courseId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/courses/${courseId}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },
};

