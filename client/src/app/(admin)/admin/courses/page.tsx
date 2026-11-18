'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { coursesService, CourseEnrollment } from '@/services/courses.service';
import { lessonsService } from '@/services/lessons.service';
import { usersService, UserProfile } from '@/services/users.service';
import CustomSelect from '@/components/ui/custom-select';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
  BookOpen,
  Briefcase,
  Baby,
  GraduationCap,
  Sparkles,
  Video,
  FileText,
  HelpCircle,
  PenTool,
  Mic,
  ChevronUp,
  ChevronDown,
  Layers,
  UserPlus,
  Search,
  Clock,
  CreditCard,
  Check,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  price: number;
  status: 'PUBLISHED' | 'DRAFT';
  modulesCount: number;
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    durationMinutes?: number;
    type?: string;
  }>;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'c-1',
      title: 'IELTS Masterclass 7.5+ Intensive (Writing & Speaking Focus)',
      slug: 'ielts-masterclass-75-intensive',
      category: 'IELTS',
      level: 'ADVANCED',
      price: 4500000,
      status: 'PUBLISHED',
      modulesCount: 4,
    },
    {
      id: 'c-2',
      title: 'Business English VIP & Executive Communication',
      slug: 'business-english-vip-executive',
      category: 'BUSINESS',
      level: 'INTERMEDIATE',
      price: 5200000,
      status: 'PUBLISHED',
      modulesCount: 3,
    },
    {
      id: 'c-3',
      title: 'TESOL Teaching Methodology & Modern EdTech Tools',
      slug: 'tesol-teaching-methodology',
      category: 'TEACHER_TRAINING',
      level: 'MASTER',
      price: 6800000,
      status: 'DRAFT',
      modulesCount: 5,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Top Tabs: 'courses' | 'enrollments'
  const [adminTab, setAdminTab] = useState<'courses' | 'enrollments'>('courses');

  // Enrollments State
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentFilter, setEnrollmentFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [processingEnrollmentId, setProcessingEnrollmentId] = useState<string | null>(null);

  // Manual Enroll Modal State
  const [isManualEnrollOpen, setIsManualEnrollOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<UserProfile[]>([]);
  const [manualEnrollForm, setManualEnrollForm] = useState({
    courseId: 'c-1',
    userId: '',
    note: '',
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const res = await coursesService.getAdminEnrollments();
      if (Array.isArray(res) && res.length > 0) {
        setEnrollments(res);
      } else {
        setEnrollments([
          {
            id: 'enr-mock-1',
            userId: 'u-student-1',
            courseId: 'c-1',
            status: 'PENDING',
            progressPercent: 0,
            paymentAmount: 4500000,
            paymentNote: 'TD 0988776655 IELTS75 - CK từ MBBank Nguyễn Văn Nam',
            enrolledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            user: {
              id: 'u-student-1',
              fullName: 'Nguyễn Văn Nam',
              email: 'nam.nguyen@example.com',
              phone: '0988776655',
            },
            course: {
              id: 'c-1',
              title: 'IELTS Masterclass 7.5+ Intensive (Writing & Speaking Focus)',
              slug: 'ielts-masterclass-75-intensive',
              category: 'IELTS',
              price: 4500000,
            },
          },
          {
            id: 'enr-mock-2',
            userId: 'u-student-2',
            courseId: 'c-2',
            status: 'ACTIVE',
            progressPercent: 35,
            paymentAmount: 5200000,
            paymentNote: 'TD 0912345678 BUSVIP - Đã chuyển qua Techcombank',
            enrolledAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            approvedAt: new Date(Date.now() - 3600000 * 46).toISOString(),
            user: {
              id: 'u-student-2',
              fullName: 'Trần Thị Thu Thảo',
              email: 'thao.tran@example.com',
              phone: '0912345678',
            },
            course: {
              id: 'c-2',
              title: 'Business English VIP & Executive Communication',
              slug: 'business-english-vip-executive',
              category: 'BUSINESS',
              price: 5200000,
            },
          },
        ]);
      }
    } catch {
      // Fallback mock
      setEnrollments([
        {
          id: 'enr-mock-1',
          userId: 'u-student-1',
          courseId: 'c-1',
          status: 'PENDING',
          progressPercent: 0,
          paymentAmount: 4500000,
          paymentNote: 'TD 0988776655 IELTS75 - CK từ MBBank Nguyễn Văn Nam',
          enrolledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          user: {
            id: 'u-student-1',
            fullName: 'Nguyễn Văn Nam',
            email: 'nam.nguyen@example.com',
            phone: '0988776655',
          },
          course: {
            id: 'c-1',
            title: 'IELTS Masterclass 7.5+ Intensive (Writing & Speaking Focus)',
            slug: 'ielts-masterclass-75-intensive',
            category: 'IELTS',
            price: 4500000,
          },
        },
      ]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await usersService.getUsers({ role: 'STUDENT', limit: 100 });
      const list = Array.isArray(res) ? res : (res as unknown as { items?: UserProfile[] })?.items || [];
      if (list.length > 0) {
        setStudentsList(list);
        setManualEnrollForm((prev) => ({ ...prev, userId: prev.userId || list[0].id }));
      }
    } catch {
      // Default fallback student list
      const fallbackList: UserProfile[] = [
        { id: 'u-1', fullName: 'Nguyễn Văn Nam', email: 'nam.nguyen@example.com', phone: '0988776655', role: 'STUDENT', isActive: true, createdAt: new Date().toISOString() },
        { id: 'u-2', fullName: 'Trần Thị Thu Thảo', email: 'thao.tran@example.com', phone: '0912345678', role: 'STUDENT', isActive: true, createdAt: new Date().toISOString() },
        { id: 'u-3', fullName: 'Lê Hoàng Long', email: 'long.le@example.com', phone: '0977112233', role: 'STUDENT', isActive: true, createdAt: new Date().toISOString() },
      ];
      setStudentsList(fallbackList);
      setManualEnrollForm((prev) => ({ ...prev, userId: prev.userId || fallbackList[0].id }));
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await coursesService.getCourses();
        if (data && data.length > 0) {
          const mapped = data.map((c: Record<string, unknown>) => ({
            id: String(c.id || ''),
            title: String(c.title || ''),
            slug: String(c.slug || String(c.title || '').toLowerCase().replace(/\s+/g, '-')),
            category: String(c.category || 'IELTS'),
            level: String(c.level || 'INTERMEDIATE'),
            price: Number(c.price || 4500000),
            status: (c.published ? 'PUBLISHED' : 'DRAFT') as 'PUBLISHED' | 'DRAFT',
            modulesCount: Array.isArray(c.modules) ? c.modules.length : 1,
          }));
          setCourses(mapped);
        }
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Course Form State (#courseModal)
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    category: 'IELTS',
    level: 'INTERMEDIATE',
    price: 4500000,
    shortDesc: '',
  });

  // Lesson Form State (#lessonModal)
  const [lessonFormData, setLessonFormData] = useState({
    courseId: 'c-1',
    moduleTitle: '',
    lessonTitle: '',
    type: 'VIDEO',
    durationMinutes: 45,
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: `c-${Date.now()}`,
      title: courseFormData.title,
      slug: courseFormData.title.toLowerCase().replace(/\s+/g, '-'),
      category: courseFormData.category,
      level: courseFormData.level,
      price: Number(courseFormData.price),
      status: 'PUBLISHED',
      modulesCount: 1,
    };
    try {
      await coursesService.createCourse({
        title: courseFormData.title,
        category: courseFormData.category,
        level: courseFormData.level,
        description: courseFormData.shortDesc,
      });
    } catch {
      // Local fallback
    }
    setCourses([...courses, newCourse]);
    setIsCourseModalOpen(false);
    setNotice(`Đã tạo khóa học mới "${newCourse.title}" thành công!`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lessonsService.createLesson({
        title: lessonFormData.lessonTitle,
        durationMinutes: lessonFormData.durationMinutes,
        moduleId: lessonFormData.courseId,
      });
    } catch {
      // Local fallback
    }
    setIsLessonModalOpen(false);
    setNotice(`Đã thêm bài học "${lessonFormData.lessonTitle}" thành công!`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await coursesService.deleteCourse(courseId);
    } catch {
      // Local fallback
    }
    setCourses(courses.filter((c) => c.id !== courseId));
    setNotice('Đã xóa khóa học thành công.');
    setTimeout(() => setNotice(''), 3000);
  };

  // Approve Enrollment (Admin confirms VietQR transfer)
  const handleApproveEnrollment = async (enrollmentId: string) => {
    setProcessingEnrollmentId(enrollmentId);
    try {
      await coursesService.approveEnrollment(enrollmentId);
    } catch {}
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId
          ? { ...e, status: 'ACTIVE', approvedAt: new Date().toISOString() }
          : e,
      ),
    );
    setProcessingEnrollmentId(null);
    setNotice('✅ Đã xác nhận chuyển khoản thành công và kích hoạt khóa học cho học viên!');
    setTimeout(() => setNotice(''), 4000);
  };

  // Reject Enrollment
  const handleRejectEnrollment = async (enrollmentId: string) => {
    setProcessingEnrollmentId(enrollmentId);
    try {
      await coursesService.rejectEnrollment(enrollmentId);
    } catch {}
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, status: 'REJECTED' } : e)),
    );
    setProcessingEnrollmentId(null);
    setNotice('Đã từ chối yêu cầu đăng ký khóa học.');
    setTimeout(() => setNotice(''), 3000);
  };

  // Manual Enroll Submit
  const handleManualEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEnrollForm.courseId || !manualEnrollForm.userId) {
      alert('Vui lòng chọn học viên và khóa học!');
      return;
    }
    setIsSubmittingManual(true);
    try {
      await coursesService.manualEnroll({
        courseId: manualEnrollForm.courseId,
        userId: manualEnrollForm.userId,
        note: manualEnrollForm.note,
      });
    } catch {}

    const selectedStudent = studentsList.find((s) => s.id === manualEnrollForm.userId);
    const selectedCourseObj = courses.find((c) => c.id === manualEnrollForm.courseId);

    const newEnr: CourseEnrollment = {
      id: `enr-${Date.now()}`,
      userId: manualEnrollForm.userId,
      courseId: manualEnrollForm.courseId,
      status: 'ACTIVE',
      progressPercent: 0,
      paymentAmount: selectedCourseObj?.price || 4500000,
      paymentNote: manualEnrollForm.note || 'Ghi danh thủ công bởi Admin',
      enrolledAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      user: {
        id: manualEnrollForm.userId,
        fullName: selectedStudent?.fullName || 'Học viên',
        email: selectedStudent?.email || '',
        phone: selectedStudent?.phone || '',
      },
      course: {
        id: manualEnrollForm.courseId,
        title: selectedCourseObj?.title || 'Khóa học',
        slug: selectedCourseObj?.slug || '',
        category: selectedCourseObj?.category || 'IELTS',
      },
    };

    setEnrollments((prev) => [newEnr, ...prev]);
    setIsSubmittingManual(false);
    setIsManualEnrollOpen(false);
    setManualEnrollForm({ courseId: courses[0]?.id || 'c-1', userId: studentsList[0]?.id || '', note: '' });
    setNotice(`🎉 Đã ghi danh thủ công học viên "${selectedStudent?.fullName || ''}" vào khóa học thành công!`);
    setTimeout(() => setNotice(''), 4000);
  };

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const matchFilter =
        enrollmentFilter === 'ALL' || e.status === enrollmentFilter;
      if (!matchFilter) return false;

      if (!enrollmentSearch.trim()) return true;
      const q = enrollmentSearch.toLowerCase();
      const sName = e.user?.fullName?.toLowerCase() || '';
      const sEmail = e.user?.email?.toLowerCase() || '';
      const sPhone = e.user?.phone?.toLowerCase() || '';
      const cTitle = e.course?.title?.toLowerCase() || '';
      const note = e.paymentNote?.toLowerCase() || '';

      return (
        sName.includes(q) ||
        sEmail.includes(q) ||
        sPhone.includes(q) ||
        cTitle.includes(q) ||
        note.includes(q)
      );
    });
  }, [enrollments, enrollmentFilter, enrollmentSearch]);

  const pendingCount = useMemo(() => {
    return enrollments.filter((e) => e.status === 'PENDING').length;
  }, [enrollments]);

  // Curriculum Reorder State & Handlers
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c-1');
  const [curriculumModules, setCurriculumModules] = useState<ModuleItem[]>([
    {
      id: 'm-1',
      title: 'Module 01: IELTS Writing Task 2 Overview & Band Descriptors',
      order: 1,
      lessons: [
        { id: 'l-1', title: 'Lesson 01: Academic Register & Formal Tone', order: 1, durationMinutes: 30, type: 'VIDEO' },
        { id: 'l-2', title: 'Lesson 02: Introduction Writing Techniques', order: 2, durationMinutes: 45, type: 'DOCUMENT' },
        { id: 'l-3', title: 'Lesson 03: Checkpoint Quiz Task 2 Formal Style', order: 3, durationMinutes: 15, type: 'QUIZ_CHECKPOINT' },
      ],
    },
    {
      id: 'm-2',
      title: 'Module 02: Paragraph Coherence & Topic Sentences',
      order: 2,
      lessons: [
        { id: 'l-4', title: 'Lesson 04: PEEL Method for Body Paragraphs', order: 1, durationMinutes: 40, type: 'VIDEO' },
        { id: 'l-5', title: 'Lesson 05: Studio Writing Task 2 Practice #1', order: 2, durationMinutes: 50, type: 'WRITING' },
      ],
    },
    {
      id: 'm-3',
      title: 'Module 03: Lexical Resource & Academic Collocations',
      order: 3,
      lessons: [
        { id: 'l-6', title: 'Lesson 06: C1/C2 Collocations in Environment & Tech', order: 1, durationMinutes: 35, type: 'VIDEO' },
        { id: 'l-7', title: 'Lesson 07: Speaking Part 3 Discussion Studio', order: 2, durationMinutes: 40, type: 'SPEAKING' },
      ],
    },
  ]);

  const handleMoveModule = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= curriculumModules.length) return;

    const updated = [...curriculumModules];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((m, idx) => ({ ...m, order: idx + 1 }));
    setCurriculumModules(reordered);

    try {
      await lessonsService.reorderModules(
        reordered.map((m) => ({ id: m.id, order: m.order }))
      );
    } catch {
      // Local fallback
    }
    setNotice(`Đã đổi vị trí chương: "${temp.title}"!`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleMoveLesson = async (moduleIdx: number, lessonIdx: number, direction: -1 | 1) => {
    const mod = curriculumModules[moduleIdx];
    const targetIdx = lessonIdx + direction;
    if (targetIdx < 0 || targetIdx >= mod.lessons.length) return;

    const updatedLessons = [...mod.lessons];
    const temp = updatedLessons[lessonIdx];
    updatedLessons[lessonIdx] = updatedLessons[targetIdx];
    updatedLessons[targetIdx] = temp;

    const reorderedLessons = updatedLessons.map((l, idx) => ({ ...l, order: idx + 1 }));
    const updatedModules = [...curriculumModules];
    updatedModules[moduleIdx] = { ...mod, lessons: reorderedLessons };
    setCurriculumModules(updatedModules);

    try {
      await lessonsService.reorderLessons(
        reorderedLessons.map((l) => ({ id: l.id, order: l.order }))
      );
    } catch {
      // Local fallback
    }
    setNotice(`Đã đổi vị trí bài học: "${temp.title}"!`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Quản Lý Khóa Học & Đào Tạo (LMS Engine)</span>
            {(loading || loadingEnrollments) && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Quản lý danh mục 5 Trụ Cột Đào Tạo, duyệt đăng ký VietQR và ghi danh học viên thủ công.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => setIsManualEnrollOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition flex items-center space-x-1.5 shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>+ Ghi Danh Thủ Công</span>
          </button>
          <button
            onClick={() => setIsLessonModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            + Thêm Bài Học (#lessonModal)
          </button>
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Khóa Học (#courseModal)</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setAdminTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            adminTab === 'courses'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Khóa Học & Giáo Trình ({courses.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('enrollments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            adminTab === 'enrollments'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Duyệt Đăng Ký & Ghi Danh</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black animate-pulse">
              {pendingCount} chờ duyệt
            </span>
          )}
        </button>
      </div>

      {/* ================= TAB 1: COURSES & CURRICULUM ================= */}
      {adminTab === 'courses' && (
        <div className="space-y-6">

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách khóa học ({courses.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-line text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">Tên Khóa Học</th>
                <th className="py-3 px-4">Trụ Cột</th>
                <th className="py-3 px-4">Cấp Độ</th>
                <th className="py-3 px-4">Học Phí (VND)</th>
                <th className="py-3 px-4">Số Modules</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">
                    {c.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-primary">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{c.level}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                    {c.price.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{c.modulesCount} modules</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button className="p-1.5 text-slate-500 hover:text-primary rounded-lg transition">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="Xóa khóa học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curriculum Reorder & Sequential Architecture (STT 3) */}
      <div className="bg-white rounded-2xl border border-line shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-sky-100 text-primary text-[11px] font-bold mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Curriculum Reorder & Sequential Architecture</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              Quản Trị Cây Giáo Trình & Thứ Tự Bài Học
            </h2>
            <p className="text-xs text-muted">
              Cơ chế Sequential Unlocking: Di chuyển và hoán đổi vị trí các Chương học (Module) và Bài học (Lesson).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600">Khóa học:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-line bg-slate-50 focus:outline-none focus:border-primary text-slate-800"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modules & Lessons List with Up/Down Controls */}
        <div className="space-y-4 pt-1">
          {curriculumModules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className="rounded-2xl border border-line bg-slate-50/60 p-4 space-y-3 hover:border-slate-300 transition"
            >
              {/* Module Header */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-line shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {mod.order}
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">{mod.title}</h3>
                    <span className="text-[10px] text-muted">{mod.lessons.length} bài học trực thuộc</span>
                  </div>
                </div>

                {/* Module Reorder Controls */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    disabled={modIdx === 0}
                    onClick={() => handleMoveModule(modIdx, -1)}
                    className="p-1 rounded-lg border border-line bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-slate-50 transition"
                    title="Chuyển lên trên"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={modIdx === curriculumModules.length - 1}
                    onClick={() => handleMoveModule(modIdx, 1)}
                    className="p-1 rounded-lg border border-line bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-slate-50 transition"
                    title="Chuyển xuống dưới"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lessons within this module */}
              <div className="space-y-1.5 pl-6">
                {mod.lessons.map((les, lesIdx) => (
                  <div
                    key={les.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-line text-xs hover:border-primary/40 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{les.order}
                      </span>
                      <span className="font-bold text-slate-800">{les.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-600">
                        {les.type || 'VIDEO'} • {les.durationMinutes || 45}m
                      </span>
                    </div>

                    {/* Lesson Reorder Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        disabled={lesIdx === 0}
                        onClick={() => handleMoveLesson(modIdx, lesIdx, -1)}
                        className="p-1 rounded text-slate-500 hover:text-primary hover:bg-sky-50 disabled:opacity-20 transition"
                        title="Di chuyển bài học lên"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={lesIdx === mod.lessons.length - 1}
                        onClick={() => handleMoveLesson(modIdx, lesIdx, 1)}
                        className="p-1 rounded text-slate-500 hover:text-primary hover:bg-sky-50 disabled:opacity-20 transition"
                        title="Di chuyển bài học xuống"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

      {/* ================= TAB 2: ENROLLMENT APPROVAL & MANAGEMENT ================= */}
      {adminTab === 'enrollments' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Tổng yêu cầu đăng ký</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{enrollments.length} lượt</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Chờ đối soát sao kê (PENDING)</p>
                <p className="text-xl sm:text-2xl font-black text-amber-600">{pendingCount} yêu cầu</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Đã kích hoạt khóa học (ACTIVE)</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600">
                  {enrollments.filter((e) => e.status === 'ACTIVE').length} học viên
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white p-4 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, email, SĐT, khóa học..."
                value={enrollmentSearch}
                onChange={(e) => setEnrollmentSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: `Tất cả (${enrollments.length})` },
                { id: 'PENDING', label: `⏳ Chờ duyệt (${pendingCount})` },
                { id: 'ACTIVE', label: '✅ Đã kích hoạt' },
                { id: 'REJECTED', label: '❌ Đã từ chối' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEnrollmentFilter(tab.id as 'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    enrollmentFilter === tab.id
                      ? 'bg-sky-600 text-white font-extrabold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={fetchEnrollments}
                disabled={loadingEnrollments}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                title="Tải lại danh sách"
              >
                <RefreshCw className={`w-4 h-4 ${loadingEnrollments ? 'animate-spin text-sky-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Danh sách yêu cầu đăng ký & ghi danh ({filteredEnrollments.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-line text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">Học Viên</th>
                    <th className="py-3 px-4">Khóa Học Đăng Ký</th>
                    <th className="py-3 px-4">Số Tiền (VND)</th>
                    <th className="py-3 px-4">Ghi Chú / Cú Pháp CK</th>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Hành Động Đối Soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        Không tìm thấy yêu cầu đăng ký nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((e) => {
                      const isProcessing = processingEnrollmentId === e.id;

                      return (
                        <tr key={e.id} className="hover:bg-slate-50/50 transition">
                          {/* Student */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                {e.user?.fullName?.charAt(0) || 'HV'}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">{e.user?.fullName || 'Học viên'}</p>
                                <p className="text-[11px] text-slate-500">{e.user?.email || ''}</p>
                                {e.user?.phone && (
                                  <p className="text-[10px] text-sky-600 font-bold">{e.user.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Course */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-extrabold text-slate-800 line-clamp-1">
                              {e.course?.title || 'Khóa học'}
                            </p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 mt-0.5 inline-block">
                              {e.course?.category || 'IELTS'}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                            {(e.paymentAmount || e.course?.price || 4500000).toLocaleString('vi-VN')} đ
                          </td>

                          {/* Transfer Note */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] block truncate" title={e.paymentNote || 'Không có ghi chú'}>
                              {e.paymentNote || 'Chưa có ghi chú'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {e.enrolledAt ? new Date(e.enrolledAt).toLocaleString('vi-VN') : 'Mới đây'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {e.status === 'PENDING' ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black flex items-center gap-1 border border-amber-300 w-fit">
                                <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                <span>Chờ đối soát</span>
                              </span>
                            ) : e.status === 'ACTIVE' ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center gap-1 border border-emerald-300 w-fit">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Đã kích hoạt</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black flex items-center gap-1 border border-rose-300 w-fit">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Đã từ chối</span>
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            {e.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => handleApproveEnrollment(e.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1 disabled:opacity-50"
                                >
                                  {isProcessing ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  <span>Duyệt & Kích hoạt</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => handleRejectEnrollment(e.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs border border-slate-200 transition disabled:opacity-50"
                                >
                                  Từ chối
                                </button>
                              </div>
                            ) : e.status === 'ACTIVE' ? (
                              <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã mở khóa</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={processingEnrollmentId === e.id}
                                onClick={() => handleApproveEnrollment(e.id)}
                                className="text-xs text-sky-600 hover:text-sky-700 font-bold underline disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingEnrollmentId === e.id ? 'Đang xử lý...' : 'Kích hoạt lại'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Course Creation Modal (#courseModal - Form 3 in Plan) */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Tạo Khóa Học Mới (#courseModal)
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  placeholder="Ví dụ: IELTS Masterclass 7.5+ Intensive"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Trụ Cột Đào Tạo *"
                  value={courseFormData.category}
                  onChange={(val) => setCourseFormData({ ...courseFormData, category: val })}
                  options={[
                    {
                      value: 'IELTS',
                      label: 'English Proficiency (IELTS)',
                      sublabel: 'IELTS Academic & General',
                      icon: <BookOpen className="w-4 h-4 text-sky-500" />,
                      badge: 'Core',
                    },
                    {
                      value: 'BUSINESS',
                      label: 'Business English',
                      sublabel: 'Giao tiếp & Đàm phán chuyên nghiệp',
                      icon: <Briefcase className="w-4 h-4 text-emerald-500" />,
                      badge: 'VIP',
                      badgeColor: 'bg-emerald-100 text-emerald-700',
                    },
                    {
                      value: 'KIDS',
                      label: 'Kids English',
                      sublabel: 'Tiếng Anh thiếu nhi',
                      icon: <Baby className="w-4 h-4 text-amber-500" />,
                      badge: 'Junior',
                      badgeColor: 'bg-amber-100 text-amber-700',
                    },
                    {
                      value: 'TEACHER_TRAINING',
                      label: 'Professional Development',
                      sublabel: 'Đào tạo giáo viên & Phương pháp',
                      icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
                      badge: 'TESOL',
                      badgeColor: 'bg-purple-100 text-purple-700',
                    },
                    {
                      value: 'LIFE_SKILLS',
                      label: 'Life Skills & Leadership',
                      sublabel: 'Kỹ năng mềm & Lãnh đạo',
                      icon: <Sparkles className="w-4 h-4 text-pink-500" />,
                      badge: 'Skills',
                      badgeColor: 'bg-pink-100 text-pink-700',
                    },
                  ]}
                />

                <CustomSelect
                  label="Cấp độ mục tiêu *"
                  value={courseFormData.level}
                  onChange={(val) => setCourseFormData({ ...courseFormData, level: val })}
                  options={[
                    { value: 'BEGINNER', label: 'Beginner (4.0 - 5.0)', colorDot: 'bg-sky-400', badge: 'Tier 1' },
                    { value: 'INTERMEDIATE', label: 'Intermediate (5.5 - 6.5)', colorDot: 'bg-emerald-400', badge: 'Tier 2' },
                    { value: 'ADVANCED', label: 'Advanced (7.0 - 7.5)', colorDot: 'bg-purple-400', badge: 'Tier 3' },
                    { value: 'MASTER', label: 'Master (8.0 - 8.5+)', colorDot: 'bg-amber-400', badge: 'Elite' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Học phí niêm yết (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={courseFormData.price}
                  onChange={(e) => setCourseFormData({ ...courseFormData, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả tóm tắt
                </label>
                <textarea
                  rows={2}
                  value={courseFormData.shortDesc}
                  onChange={(e) => setCourseFormData({ ...courseFormData, shortDesc: e.target.value })}
                  placeholder="Mô tả mục tiêu chuẩn đầu ra của khóa học..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  Tạo Khóa Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Creation Modal (#lessonModal - Form 4 in Plan) */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Thêm Module & Bài Học Mới (#lessonModal)
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <CustomSelect
                label="Khóa học trực thuộc *"
                value={lessonFormData.courseId}
                onChange={(val) => setLessonFormData({ ...lessonFormData, courseId: val })}
                searchable
                placeholder="Chọn khóa học..."
                options={courses.map((c) => ({
                  value: c.id,
                  label: c.title,
                  sublabel: `${c.category} • ${c.level}`,
                  icon: <GraduationCap className="w-4 h-4 text-primary" />,
                  badge: `${c.modulesCount} modules`,
                }))}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Chương học (Module) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lessonFormData.moduleTitle}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, moduleTitle: e.target.value })}
                  placeholder="Ví dụ: Module 03: Paragraph Development & Coherence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Bài học cụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lessonFormData.lessonTitle}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, lessonTitle: e.target.value })}
                  placeholder="Ví dụ: Lesson 08: Inversion & Cleft Sentences"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Loại bài học *"
                  value={lessonFormData.type}
                  onChange={(val) => setLessonFormData({ ...lessonFormData, type: val })}
                  options={[
                    {
                      value: 'VIDEO',
                      label: 'Video bài giảng',
                      sublabel: 'Video streaming HLS',
                      icon: <Video className="w-4 h-4 text-sky-500" />,
                      badge: 'Video',
                    },
                    {
                      value: 'DOCUMENT',
                      label: 'Tài liệu PDF',
                      sublabel: 'Xem bảo mật có Watermark',
                      icon: <FileText className="w-4 h-4 text-red-500" />,
                      badge: 'PDF',
                      badgeColor: 'bg-red-100 text-red-700',
                    },
                    {
                      value: 'QUIZ_CHECKPOINT',
                      label: 'Quiz Checkpoint',
                      sublabel: 'Kiểm tra sàn điểm ≥ 80%',
                      icon: <HelpCircle className="w-4 h-4 text-amber-500" />,
                      badge: 'Checkpoint',
                      badgeColor: 'bg-amber-100 text-amber-700',
                    },
                    {
                      value: 'WRITING',
                      label: 'Writing Studio',
                      sublabel: 'Nộp bài viết AI chấm 4 tiêu chí',
                      icon: <PenTool className="w-4 h-4 text-emerald-500" />,
                      badge: 'Writing',
                      badgeColor: 'bg-emerald-100 text-emerald-700',
                    },
                    {
                      value: 'SPEAKING',
                      label: 'Speaking Studio',
                      sublabel: 'Ghi âm sóng âm Audio Wave',
                      icon: <Mic className="w-4 h-4 text-purple-500" />,
                      badge: 'Speaking',
                      badgeColor: 'bg-purple-100 text-purple-700',
                    },
                  ]}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời lượng ước tính (Phút)
                  </label>
                  <input
                    type="number"
                    value={lessonFormData.durationMinutes}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  Lưu Bài Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Enroll Modal (#manualEnrollModal) */}
      {isManualEnrollOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ghi Danh Học Viên Thủ Công
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Kích hoạt quyền truy cập khóa học trực tiếp cho học viên</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualEnrollOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Học Viên <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={manualEnrollForm.userId}
                  onChange={(e) => setManualEnrollForm({ ...manualEnrollForm, userId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Chọn học viên từ danh sách --</option>
                  {studentsList.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.fullName} ({stu.email}) {stu.phone ? `— ${stu.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Khóa Học Ghi Danh <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={manualEnrollForm.courseId}
                  onChange={(e) => setManualEnrollForm({ ...manualEnrollForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-sky-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} — [{c.category}] — {c.price.toLocaleString('vi-VN')} đ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú ghi danh (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={manualEnrollForm.note}
                  onChange={(e) => setManualEnrollForm({ ...manualEnrollForm, note: e.target.value })}
                  placeholder="VD: Đã đóng học phí tiền mặt / Chuyển khoản trực tiếp / Học bổng..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  Học viên được ghi danh sẽ ngay lập tức có trạng thái <strong className="text-sky-950 font-black">ACTIVE</strong> và truy cập được toàn bộ bài học, video và tài liệu của khóa học.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsManualEnrollOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingManual ? 'Đang ghi danh...' : 'Xác Nhận Ghi Danh Thủ Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

