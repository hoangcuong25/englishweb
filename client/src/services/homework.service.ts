import { api } from '../lib/api';

export interface HomeworkCourse {
  id: string;
  title: string;
  category?: string;
}

export interface HomeworkLesson {
  id: string;
  title: string;
}

export interface HomeworkSubmissionStudent {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
  status: 'PENDING' | 'GRADED';
  student?: HomeworkSubmissionStudent;
  homework?: {
    id: string;
    title: string;
    maxScore: number;
  };
}

export interface HomeworkStats {
  totalSubmissions: number;
  gradedCount: number;
  pendingCount: number;
}

export interface Homework {
  id: string;
  courseId: string;
  course?: HomeworkCourse;
  lessonId?: string;
  lesson?: HomeworkLesson;
  title: string;
  description: string;
  dueDate?: string;
  maxScore: number;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  submissions?: HomeworkSubmission[];
  stats?: HomeworkStats;
  submissionStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'GRADED';
  mySubmission?: HomeworkSubmission;
}

export interface CreateHomeworkInput {
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate?: string;
  maxScore?: number;
  attachmentUrl?: string;
}

export interface UpdateHomeworkInput {
  title?: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  attachmentUrl?: string;
}

export interface SubmitHomeworkInput {
  content?: string;
  fileUrl?: string;
}

export interface GradeHomeworkInput {
  score: number;
  feedback?: string;
}

export const homeworkService = {
  async getAll(params?: { courseId?: string }): Promise<Homework[]> {
    const response = await api.get('/homework', { params });
    return response.data?.data || response.data || [];
  },

  async getMyHomeworks(params?: { courseId?: string }): Promise<Homework[]> {
    const response = await api.get('/homework/student/my-homework', { params });
    return response.data?.data || response.data || [];
  },

  async getById(id: string): Promise<Homework> {
    const response = await api.get(`/homework/${id}`);
    return response.data?.data || response.data;
  },

  async create(data: CreateHomeworkInput): Promise<Homework> {
    const response = await api.post('/homework', data);
    return response.data?.data || response.data;
  },

  async update(id: string, data: UpdateHomeworkInput): Promise<Homework> {
    const response = await api.put(`/homework/${id}`, data);
    return response.data?.data || response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/homework/${id}`);
  },

  async submit(homeworkId: string, data: SubmitHomeworkInput): Promise<HomeworkSubmission> {
    const response = await api.post(`/homework/${homeworkId}/submit`, data);
    return response.data?.data || response.data;
  },

  async grade(submissionId: string, data: GradeHomeworkInput): Promise<HomeworkSubmission> {
    const response = await api.put(`/homework/submissions/${submissionId}/grade`, data);
    return response.data?.data || response.data;
  },
};
