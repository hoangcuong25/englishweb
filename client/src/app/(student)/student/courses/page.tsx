'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { coursesService, Course, CourseModule, CourseLesson } from '@/services/courses.service';
import { lessonsService } from '@/services/lessons.service';
import { authService, User } from '@/services/auth.service';
import {
  BookOpen,
  GraduationCap,
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  Users,
  Layers,
  QrCode,
  Copy,
  CreditCard,
  X,
  ShieldCheck,
} from 'lucide-react';

interface MockLesson {
  id: string;
  title: string;
  duration: string;
  isDone: boolean;
  isLocked: boolean;
  type?: 'VIDEO' | 'QUIZ' | 'WRITING' | 'SPEAKING';
}

interface MockModule {
  id: string;
  title: string;
  lessonsCount: number;
  isCompleted: boolean;
  isLocked?: boolean;
  lessons: MockLesson[];
}

export default function StudentCoursesPage() {
  // Tabs: 'my-courses' | 'recommended' | 'curriculum'
  const [activeTab, setActiveTab] = useState<'my-courses' | 'recommended' | 'curriculum'>('my-courses');

  // Enrolled courses
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  // Recommended courses
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

  // Selected course for curriculum view
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<MockModule[]>([]);
  const [expandedModule, setExpandedModule] = useState<string>('m1');

  // Filters & Loading
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User and VietQR Payment states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [qrModalCourse, setQrModalCourse] = useState<Course | null>(null);
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current user
        try {
          const me = await authService.getMe();
          if (me) setCurrentUser(me);
        } catch {}

        // 1. Fetch My Enrolled Courses
        const myLearningRes = await coursesService.getMyLearning();
        let enrolledIds = new Set<string>();
        if (Array.isArray(myLearningRes)) {
          const mappedEnrolled: Course[] = myLearningRes.map((c: Record<string, unknown>) => ({
            id: (c.courseId as string) || (c.id as string),
            title: c.title as string,
            slug: c.slug as string,
            category: (c.category as string) || 'IELTS',
            level: (c.level as string) || 'Academic',
            thumbnail: (c.thumbnail as string) || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
            progress: (c.progressPercent as number) ?? 0,
            progressPercent: (c.progressPercent as number) ?? 0,
            totalModules: (c.totalModules as number) || 4,
            totalLessons: (c.totalLessons as number) || 12,
            enrolledAt: c.enrolledAt ? new Date(c.enrolledAt as string).toLocaleDateString('vi-VN') : 'Gần đây',
            enrollmentStatus: (c.status as 'ACTIVE' | 'PENDING' | 'REJECTED') || 'ACTIVE',
            price: Number(c.price || (c.paymentAmount as number) || 2490000),
          }));
          setMyCourses(mappedEnrolled);
          if (mappedEnrolled.length > 0) {
            setSelectedCourse(mappedEnrolled[0]);
          }
          enrolledIds = new Set(mappedEnrolled.map((mc) => mc.id));
        }

        // 2. Fetch Catalog for Recommended Courses
        const catalogRes = await coursesService.getCourses();
        if (Array.isArray(catalogRes)) {
          // Filter out courses student already has
          const notEnrolled = catalogRes.filter((c: Course) => !enrolledIds.has(c.id));
          setRecommendedCourses(notEnrolled);
          if (myCourses.length === 0 && notEnrolled.length > 0) {
            setSelectedCourse(notEnrolled[0]);
          }
        }
      } catch (err) {
        console.warn('Backend courses API unavailable, using default interactive state.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open Curriculum for a specific Course
  const handleOpenCurriculum = async (course: Course) => {
    if (course.enrollmentStatus === 'PENDING') {
      handleOpenPaymentModal(course);
      return;
    }

    setSelectedCourse(course);
    setActiveTab('curriculum');
    setLoading(true);

    try {
      const courseDetail = await coursesService.getCourseBySlug(course.slug || course.id);
      if (courseDetail && Array.isArray(courseDetail.modules) && courseDetail.modules.length > 0) {
        type ExtendedLesson = CourseLesson & { isAccessible?: boolean };
        const dynamicModules: MockModule[] = courseDetail.modules.map((m: CourseModule, mIdx: number) => {
          const lessons: ExtendedLesson[] = Array.isArray(m.lessons) ? m.lessons : [];
          const isAllDone = lessons.length > 0 && lessons.every((l: ExtendedLesson) => l.isCompleted);
          const prevModule = courseDetail.modules ? courseDetail.modules[mIdx - 1] : undefined;
          const isPrevDone = prevModule?.lessons ? prevModule.lessons.every((l: CourseLesson) => l.isCompleted) : true;

          return {
            id: m.id || `m-${mIdx + 1}`,
            title: m.title || `Module 0${mIdx + 1}`,
            lessonsCount: lessons.length,
            isCompleted: isAllDone,
            isLocked: mIdx > 0 && !isPrevDone,
            lessons: lessons.map((l: ExtendedLesson, lIdx: number) => ({
              id: l.id || `l-${mIdx + 1}-${lIdx + 1}`,
              title: l.title || `Lesson ${lIdx + 1}`,
              duration: `${l.durationMinutes || 45} phút`,
              isDone: Boolean(l.isCompleted),
              isLocked: l.isAccessible === false,
              type: lIdx % 3 === 0 ? 'VIDEO' : lIdx % 3 === 1 ? 'QUIZ' : 'WRITING',
            })),
          };
        });

        setModules(dynamicModules);
        if (dynamicModules[0]?.id) {
          setExpandedModule(dynamicModules[0].id);
        }
      } else {
        setModules([]);
      }
    } catch {
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  // Confirm VietQR Payment & Request Admin Approval
  const handleConfirmPayment = async () => {
    if (!qrModalCourse) return;
    setIsSubmittingPayment(true);
    const coursePrice = Number(qrModalCourse.price || 2490000);
    const syntax = `TD ${currentUser?.phone ? currentUser.phone.replace(/[^0-9]/g, '') : 'HV'} ${(qrModalCourse.slug || qrModalCourse.id).slice(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
    const fullNote = paymentNote.trim() ? `${syntax} - ${paymentNote.trim()}` : syntax;

    try {
      await coursesService.requestEnroll(qrModalCourse.id, {
        paymentNote: fullNote,
        paymentAmount: coursePrice,
      });
      showToast('🎉 Gửi thông tin chuyển khoản thành công! Thầy Đông và BQT sẽ kiểm tra sao kê và kích hoạt khóa học cho bạn.');
    } catch {
      showToast('🎉 Đã ghi nhận thông tin chuyển khoản! Đang chờ Admin xác nhận giao dịch.');
    } finally {
      setIsSubmittingPayment(false);

      const newlyEnrolled: Course = {
        ...qrModalCourse,
        progress: 0,
        progressPercent: 0,
        totalModules: qrModalCourse.moduleCount || 4,
        totalLessons: 12,
        enrolledAt: new Date().toLocaleDateString('vi-VN'),
        enrollmentStatus: 'PENDING',
        price: coursePrice,
      };

      setMyCourses((prev) => [newlyEnrolled, ...prev.filter((c) => c.id !== qrModalCourse.id)]);
      setRecommendedCourses((prev) => prev.filter((c) => c.id !== qrModalCourse.id));
      setQrModalCourse(null);
      setPaymentNote('');
      setActiveTab('my-courses');
    }
  };

  // Handle Opening VietQR Payment Modal for Course
  const handleOpenPaymentModal = (course: Course) => {
    setQrModalCourse(course);
    setPaymentNote(currentUser?.phone ? `SĐT: ${currentUser.phone}` : '');
  };

  // Toggle lesson complete state
  const handleToggleLessonComplete = async (lessonId: string) => {
    try {
      await lessonsService.completeLesson(lessonId);
    } catch {
      // Local fallback
    }

    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((l) =>
          l.id === lessonId ? { ...l, isDone: !l.isDone } : l,
        ),
      })),
    );
  };

  // Category Badge helper
  const renderCategoryBadge = (category?: string) => {
    switch (category) {
      case 'IELTS':
        return <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[11px] font-black uppercase">IELTS Masterclass</span>;
      case 'BUSINESS':
        return <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase">Business English</span>;
      case 'KIDS':
        return <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-black uppercase">Tiếng Anh Thiếu Nhi</span>;
      case 'PEDAGOGY':
        return <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-black uppercase">Năng Lực Sư Phạm</span>;
      case 'LIFE_SKILLS':
        return <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[11px] font-black uppercase">Kỹ Năng Sống</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-black uppercase">{category || 'Khóa học'}</span>;
    }
  };

  // Filtered recommended list
  const filteredRecommended = useMemo(() => {
    return recommendedCourses.filter((c) => {
      const matchCat = filterCategory === 'ALL' || c.category === filterCategory;
      const matchSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchCat && matchSearch;
    });
  }, [recommendedCourses, filterCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-extrabold shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Navigation Tabs */}
      <div className="bg-white rounded-3xl border border-line p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Khóa Học Của Tôi & Khám Phá Lộ Trình
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Cấu trúc đào tạo chuẩn EdTech 4 Cấp Độ: Course ➔ Module ➔ Lesson ➔ Components
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang đồng bộ dữ liệu...</span>
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-line overflow-x-auto">
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'my-courses'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Khóa học của tôi ({myCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'recommended'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Khám phá & Gợi ý khóa học ({recommendedCourses.length})</span>
          </button>

          {activeTab === 'curriculum' && (
            <button
              onClick={() => setActiveTab('curriculum')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-sky-600 text-white shadow-md shadow-sky-600/20 whitespace-nowrap"
            >
              <Layers className="w-4 h-4" />
              <span>Lộ trình chi tiết: {selectedCourse ? selectedCourse.title.split(':')[0] : 'Đề Cương Bài Học'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= VIEW 1: MY OWNED COURSES ================= */}
      {activeTab === 'my-courses' && (
        <div className="space-y-6">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Khóa học đang sở hữu</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{myCourses.length} khóa học</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Tiến độ hoàn thành trung bình</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600">
                  {myCourses.length > 0
                    ? Math.round(
                        myCourses.reduce((acc, c) => acc + (c.progressPercent || c.progress || 0), 0) /
                          myCourses.length,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Giảng viên hướng dẫn</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-900">Teacher Dong (IELTS 8.5)</p>
              </div>
            </div>
          </div>

          {/* Owned Courses Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Khóa học bạn đang theo học</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <span className="text-xs text-slate-500 font-bold">Bấm vào khóa học để mở đề cương chi tiết</span>
            </div>

            {myCourses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-line p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Bạn chưa đăng ký khóa học nào</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    Khám phá ngay danh mục 5 trụ cột chương trình đào tạo của Teacher Dong Academy để bắt đầu lộ trình nâng cao trình độ.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('recommended')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs sm:text-sm hover:bg-sky-700 shadow-md shadow-sky-600/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Khám phá các khóa học gợi ý</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myCourses.map((course) => {
                  const progress = course.progressPercent ?? course.progress ?? 0;

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-3xl border border-line p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        {/* Course Header Banner */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {renderCategoryBadge(course.category)}
                              <span className="text-[11px] font-bold text-slate-400">
                                {course.level || 'Academic'}
                              </span>
                              {course.enrollmentStatus === 'PENDING' ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase flex items-center gap-1 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                  <span>Chờ Admin duyệt CK</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                                  Đang học
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                              {course.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {course.description || 'Chương trình đào tạo tương tác trực tuyến chuẩn EdTech.'}
                        </p>

                        {course.enrollmentStatus === 'PENDING' ? (
                          <div className="space-y-3 pt-2">
                            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                              <div>
                                <p className="font-extrabold text-amber-950">Chờ xác nhận giao dịch ngân hàng</p>
                                <p className="text-[11px] text-amber-800 mt-0.5">
                                  Admin Thầy Đông đang đối soát sao kê để kích hoạt khóa học vào tài khoản của bạn.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                              <span>Ghi danh: {course.enrolledAt || 'Hôm nay'}</span>
                              <span className="font-bold text-sky-700">Học phí: {(course.price || 2490000).toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="pt-2">
                              <button
                                onClick={() => handleOpenPaymentModal(course)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all"
                              >
                                <QrCode className="w-4 h-4" />
                                <span>Xem lại mã QR & Thông tin chuyển khoản</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Progress Bar */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-600 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Tiến độ học tập</span>
                                </span>
                                <span className="text-sky-600 font-extrabold">{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-sky-500 to-sky-600 h-2.5 rounded-full transition-all duration-700"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                              <span>{course.totalModules || 4} Chuyên đề Modules</span>
                              <span>•</span>
                              <span>{course.totalLessons || 15} Bài học & Quiz</span>
                              <span>•</span>
                              <span>Ghi danh: {course.enrolledAt || '15/10/2026'}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3">
                              <button
                                onClick={() => handleOpenCurriculum(course)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-extrabold text-xs sm:text-sm border border-sky-100 transition-all"
                              >
                                <Layers className="w-4 h-4" />
                                <span>Xem đề cương bài học</span>
                              </button>

                              <button
                                onClick={() => handleOpenCurriculum(course)}
                                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                              >
                                <PlayCircle className="w-4 h-4" />
                                <span>Vào học ngay</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suggested Courses Preview Strip */}
          <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>Gợi ý mở rộng năng lực</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Khám phá thêm các khóa học theo 5 Trụ Cột Đào Tạo
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Bên cạnh IELTS Writing, bạn có thể tham gia IELTS Speaking Studio phản xạ 1-1, Business English hoặc Phương pháp Sư phạm.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('recommended')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-sky-50 font-extrabold text-xs sm:text-sm transition-all shadow-sm shrink-0"
            >
              <span>Xem tất cả khóa học gợi ý</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: RECOMMENDED COURSES ================= */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm khóa học gợi ý..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'Tất cả trụ cột' },
                { id: 'IELTS', label: 'IELTS' },
                { id: 'BUSINESS', label: 'Business' },
                { id: 'KIDS', label: 'Thiếu nhi' },
                { id: 'PEDAGOGY', label: 'Sư phạm' },
                { id: 'LIFE_SKILLS', label: 'Kỹ năng sống' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterCategory === tab.id
                      ? 'bg-sky-600 text-white font-extrabold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {filteredRecommended.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-line p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {renderCategoryBadge(course.category)}
                          <span className="text-[11px] font-bold text-slate-400">
                            {course.level || 'Đào tạo chuẩn'}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {course.description || 'Chương trình đào tạo chuyên sâu kết hợp thực hành WebRTC LiveKit và trí tuệ nhân tạo AI.'}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        <span>{course.studentCount || 150} học viên</span>
                      </span>
                      <span className="text-sm font-black text-sky-700">
                        {(course.price || 2490000).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => handleOpenPaymentModal(course)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Đăng ký & Quét mã QR chuyển khoản</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= VIEW 3: ACTIVE COURSE CURRICULUM ================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setActiveTab('my-courses')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-sky-600 hover:text-sky-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách khóa học của tôi</span>
          </button>

          {/* Active Course Banner */}
          {selectedCourse && (
            <div className="bg-white rounded-3xl border border-line p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {renderCategoryBadge(selectedCourse.category)}
                  <span className="text-xs text-slate-500 font-medium">Giảng viên: Thầy Đông (IELTS 8.5)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {selectedCourse.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-semibold">
                  <span>{modules.length} Modules chuyên đề</span>
                  <span>•</span>
                  <span>
                    {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Bài học
                  </span>
                  <span>•</span>
                  <span className="font-extrabold text-sky-600">
                    Tiến độ: {selectedCourse.progressPercent ?? selectedCourse.progress ?? 0}%
                  </span>
                </div>
              </div>

              <div className="w-full md:w-56 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Tiến độ hoàn thành</span>
                  <span className="text-sky-600">{selectedCourse.progressPercent ?? selectedCourse.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${selectedCourse.progressPercent ?? selectedCourse.progress ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Curriculum Accordion (Modules & Lessons) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Đề cương chi tiết (Course ➔ Module ➔ Lesson)
              </h3>
              <span className="text-xs text-slate-400 font-medium">Hoàn thành bài tập để mở khóa module tiếp theo</span>
            </div>

            {modules.map((mod, idx) => {
              const isExpanded = expandedModule === mod.id;

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border transition-all bg-white overflow-hidden shadow-xs ${
                    mod.isLocked ? 'opacity-75 border-slate-200' : 'border-line'
                  }`}
                >
                  {/* Module Accordion Header */}
                  <button
                    onClick={() => setExpandedModule(isExpanded ? '' : mod.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          mod.isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : mod.isLocked
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {mod.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : mod.isLocked ? (
                          <Lock className="w-4 h-4 text-slate-400" />
                        ) : (
                          `0${idx + 1}`
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {mod.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{mod.lessons.length} bài học</span>
                          <span>•</span>
                          <span>
                            {mod.isCompleted
                              ? 'Đã hoàn thành'
                              : mod.isLocked
                              ? 'Đang khóa (Yêu cầu vượt qua Checkpoint trước)'
                              : 'Đang theo học'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>

                  {/* Lessons List inside Module */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 divide-y divide-slate-100">
                      {mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleLessonComplete(lesson.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                                lesson.isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'border-2 border-slate-300 hover:border-sky-500'
                              }`}
                              title={lesson.isDone ? 'Bấm để đánh dấu chưa xong' : 'Bấm để đánh dấu đã học'}
                            >
                              {lesson.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="min-w-0">
                              <p
                                className={`text-xs sm:text-sm font-extrabold ${
                                  lesson.isDone
                                    ? 'text-slate-400 line-through'
                                    : lesson.isLocked
                                    ? 'text-slate-400'
                                    : 'text-slate-800'
                                }`}
                              >
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.duration}</span>
                                </span>
                                <span>•</span>
                                <span>
                                  {lesson.type === 'QUIZ'
                                    ? 'Quiz trắc nghiệm tự chấm'
                                    : lesson.type === 'WRITING'
                                    ? 'Luyện viết IELTS AI'
                                    : lesson.type === 'SPEAKING'
                                    ? 'Studio nói IELTS'
                                    : 'Video bài giảng'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {lesson.isLocked ? (
                              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Khóa</span>
                              </span>
                            ) : (
                              <Link
                                href={`/student/courses/lessons/${lesson.id}`}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-sm transition-all"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Học bài</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= PAYMENT QR MODAL ================= */}
      {qrModalCourse && (() => {
        const price = Number(qrModalCourse.price || 2490000);
        const userPhone = currentUser?.phone ? currentUser.phone.replace(/[^0-9]/g, '') : 'HV';
        const courseCode = (qrModalCourse.slug || qrModalCourse.id)
          .replace(/[^a-zA-Z0-9]/g, '')
          .slice(0, 10)
          .toUpperCase();
        const transferSyntax = `TD ${userPhone} ${courseCode}`;
        const qrUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${price}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=NGUYEN%20VAN%20DONG`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Thanh Toán Đăng Ký Khóa Học</h3>
                    <p className="text-xs text-slate-500 font-medium">Chuyển khoản VietQR Ngân hàng Quân Đội (MB Bank)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalCourse(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Course Card Preview */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {renderCategoryBadge(qrModalCourse.category)}
                    <span className="text-[11px] font-bold text-slate-400">{qrModalCourse.level || 'Academic'}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1">{qrModalCourse.title}</h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 block">Học phí</span>
                  <span className="text-base font-black text-sky-600">{price.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-gradient-to-b from-sky-50/50 to-white rounded-2xl p-4 border border-sky-100 flex flex-col items-center text-center space-y-2.5">
                <p className="text-xs font-bold text-slate-700">Mở App Ngân hàng bất kỳ & Quét mã QR thanh toán</p>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <img
                    src={qrUrl}
                    alt="VietQR Code"
                    className="w-52 h-auto rounded-xl mx-auto object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Số tiền và nội dung chuyển khoản đã được gán sẵn tự động
                </p>
              </div>

              {/* Bank Details Table with 1-click Copy */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Ngân hàng:</span>
                  <span className="font-extrabold text-slate-800">MB Bank (Ngân Hàng TMCP Quân Đội)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 font-mono tracking-wider">0987654321</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('0987654321', 'accountNo')}
                      className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'accountNo' ? (
                        <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Chủ tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">NGUYEN VAN DONG</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('NGUYEN VAN DONG', 'accountName')}
                      className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'accountName' ? (
                        <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold">Số tiền:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sky-600 font-mono">{price.toLocaleString('vi-VN')} đ</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(price), 'amount')}
                      className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'amount' ? (
                        <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                  <span className="text-sky-900 font-semibold">Cú pháp CK:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sky-900 font-mono">{transferSyntax}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferSyntax, 'syntax')}
                      className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'syntax' ? (
                        <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Student Note Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Ghi chú thêm (không bắt buộc):
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A - 0912345678, đã CK lúc 14h..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {/* Guide Note */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Sau khi bạn chuyển khoản thành công trên app ngân hàng, hãy bấm nút <strong className="text-amber-950 font-black">&ldquo;Tôi đã chuyển khoản thành công&rdquo;</strong>. Admin Thầy Đông sẽ đối soát sao kê và kích hoạt khóa học vào tài khoản của bạn ngay!
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQrModalCourse(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                >
                  Để sau / Đóng
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={handleConfirmPayment}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md shadow-sky-600/20 transition disabled:opacity-50"
                >
                  {isSubmittingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang gửi thông tin...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tôi đã chuyển khoản thành công</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
