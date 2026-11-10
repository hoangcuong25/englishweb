import { api } from '../lib/api';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  level: string;
  thumbnailUrl?: string;
  published: boolean;
  enrollmentCount?: number;
  modules?: CourseModule[];
  progress?: number;
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

