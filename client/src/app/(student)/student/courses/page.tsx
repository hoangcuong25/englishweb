'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { coursesService, Course, CourseModule, CourseLesson, getCourseCoverUrl, DEFAULT_COVERS } from '@/services/courses.service';
import { lessonsService } from '@/services/lessons.service';
import { materialsService, Material } from '@/services/materials.service';
import { homeworkService, Homework } from '@/services/homework.service';
import { authService, User } from '@/services/auth.service';
import { useCurrency } from '@/lib/currency-context';
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
  Compass,
  Briefcase,
  Globe,
  HeartHandshake,
  FolderOpen,
  Headphones,
  FileText,
  Eye,
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

function StudentCoursesContent() {
  const searchParams = useSearchParams();
  const urlTrack = searchParams?.get('track');

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
  const [curriculumTab, setCurriculumTab] = useState<'lessons' | 'materials' | 'homework'>('lessons');
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [courseHomeworks, setCourseHomeworks] = useState<Homework[]>([]);
  const [loadingHomeworks, setLoadingHomeworks] = useState(false);

  // Filters & Loading
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (urlTrack === 'english' || urlTrack === 'ielts') {
      setFilterCategory('IELTS');
      setActiveTab('recommended');
    } else if (urlTrack === 'personal_dev' || urlTrack === 'skills' || urlTrack === 'pedagogy') {
      setFilterCategory('PEDAGOGY');
      setActiveTab('recommended');
    }
  }, [urlTrack]);

  // Currency conversion hook
  const { formatPrice, convertToUsd, formatUsd, formatVnd, currency, exchangeRate } = useCurrency();

  // User and Payment states (VietQR Domestic & International USD)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [qrModalCourse, setQrModalCourse] = useState<Course | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'vietqr' | 'international'>('vietqr');
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

  const loadCourseMaterials = async (cId: string) => {
    setLoadingMaterials(true);
    try {
      const res = await materialsService.getAll({ courseId: cId });
      setCourseMaterials(res.items || []);
    } catch {
      setCourseMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const loadCourseHomeworks = async (cId: string) => {
    setLoadingHomeworks(true);
    try {
      const res = await homeworkService.getMyHomeworks({ courseId: cId });
      setCourseHomeworks(res || []);
    } catch {
      setCourseHomeworks([]);
    } finally {
      setLoadingHomeworks(false);
    }
  };

  // Open Curriculum for a specific Course
  const handleOpenCurriculum = async (course: Course) => {
    if (course.enrollmentStatus === 'PENDING') {
      handleOpenPaymentModal(course);
      return;
    }

    setSelectedCourse(course);
    setActiveTab('curriculum');
    setCurriculumTab('lessons');
    loadCourseMaterials(course.id);
    loadCourseHomeworks(course.id);
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

  // Handle Opening Payment Modal for Course (Domestic VietQR or International USD)
  const handleOpenPaymentModal = (course: Course) => {
    setQrModalCourse(course);
    setPaymentMethodTab(currency === 'USD' ? 'international' : 'vietqr');
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

  // Average progress across enrolled courses
  const avgProgress = useMemo(() => {
    if (myCourses.length === 0) return 0;
    const total = myCourses.reduce((acc, c) => acc + (c.progressPercent || c.progress || 0), 0);
    return Math.round(total / myCourses.length);
  }, [myCourses]);

  // Category Badge helper
  const renderCategoryBadge = (category?: string) => {
    const cat = (category || '').toUpperCase();
    const badgeMap: Record<string, { label: string; icon: React.ElementType }> = {
      IELTS: { label: 'IELTS Masterclass', icon: Award },
      BUSINESS: { label: 'Business English', icon: Briefcase },
      KIDS: { label: 'Tiếng Anh Thiếu Nhi', icon: Sparkles },
      ENGLISH: { label: 'General English', icon: Globe },
      PEDAGOGY: { label: 'Năng Lực Sư Phạm', icon: GraduationCap },
      LIFE_SKILLS: { label: 'Kỹ Năng Sống', icon: HeartHandshake },
      SOFT_SKILLS: { label: 'Kỹ Năng Mềm', icon: Users },
      PERSONAL_DEV: { label: 'Phát Triển Bản Thân', icon: Compass },
    };

    const item = badgeMap[cat];
    if (item) {
      const Icon = item.icon;
      return (
        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold uppercase flex items-center gap-1.5 shadow-2xs">
          <Icon className="w-3.5 h-3.5 text-[#1B64B0] shrink-0" />
          <span>{item.label}</span>
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold uppercase">
        {category || 'Khóa học'}
      </span>
    );
  };

  // Category Filter Pills for Catalog (Aligned with 5 Pillars)
  const categoryFilterPills = [
    { id: 'ALL', label: 'Tất cả lĩnh vực' },
    { id: 'IELTS', label: 'IELTS Masterclass' },
    { id: 'ENGLISH', label: 'Tiếng Anh Giao Tiếp' },
    { id: 'BUSINESS', label: 'Business English' },
    { id: 'PEDAGOGY', label: 'Phương Pháp Sư Phạm' },
    { id: 'LIFE_SKILLS', label: 'Kỹ Năng Sống' },
    { id: 'KIDS', label: 'Tiếng Anh Thiếu Nhi' },
  ];

  // Filtered recommended list based on Subcategory + Search
  const filteredRecommended = useMemo(() => {
    return recommendedCourses.filter((c) => {
      const cat = (c.category || '').toUpperCase();
      const matchCat =
        filterCategory === 'ALL' ||
        cat === filterCategory ||
        (filterCategory === 'ENGLISH' && ['ENGLISH', 'CONVERSATIONAL'].includes(cat)) ||
        (filterCategory === 'PEDAGOGY' && ['PEDAGOGY', 'EDUCATION'].includes(cat)) ||
        (filterCategory === 'LIFE_SKILLS' && ['LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(cat));
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

      {/* 1. Sleek Header & Quick Stats */}
      <div className="bg-white rounded-3xl border border-line p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Khóa Học Của Tôi
                </h1>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  LMS Học Viên
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Theo dõi tiến độ bài học, làm bài tập và đồng hành phát triển năng lực cùng Teacher Dong.
              </p>
            </div>
          </div>

          {/* Right: Inline Quick Stats Badges */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Owned count */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đang học</p>
                <p className="text-xs font-black text-slate-900">{myCourses.length} khóa học</p>
              </div>
            </div>

            {/* Average Progress */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ TB</p>
                <p className="text-xs font-black text-emerald-600">{avgProgress}%</p>
              </div>
            </div>

            {/* Mentor info */}
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Cố vấn</p>
                <p className="text-xs font-black text-slate-800">Teacher Dong (8.5)</p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 px-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden xl:inline">Đồng bộ...</span>
              </div>
            )}
          </div>
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
            <span>Khám phá khóa học ({recommendedCourses.length})</span>
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
          {/* Owned Courses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Khóa học bạn đang theo học</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <span className="text-xs text-slate-500 font-bold">Bấm vào khóa học để mở đề cương chi tiết</span>
            </div>

            {myCourses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-line p-10 sm:p-14 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100 shadow-2xs">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Bạn chưa đăng ký khóa học nào
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Khám phá ngay danh mục các chương trình đào tạo của Teacher Dong Academy để bắt đầu lộ trình học tập bứt phá.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('recommended')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Khám phá khóa học ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myCourses.map((course) => {
                  const progress = course.progressPercent ?? course.progress ?? 0;
                  const coverUrl = getCourseCoverUrl(course.thumbnail, course.category);

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs hover:shadow-lg hover:border-sky-200 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* 16:9 Course Cover Thumbnail */}
                        <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
                          <img
                            src={coverUrl}
                            alt={course.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_COVERS.IELTS;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/25" />

                          {/* Floating Badges Top */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {renderCategoryBadge(course.category)}
                              <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-white text-[10.5px] font-bold">
                                {course.level || 'Academic'}
                              </span>
                            </div>
                            {course.enrollmentStatus === 'PENDING' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                                <Clock className="w-3 h-3 text-slate-950 animate-spin" />
                                <span>Chờ duyệt CK</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase shadow-sm">
                                Đang học
                              </span>
                            )}
                          </div>

                          {/* Floating Progress Pill on Bottom-Right */}
                          {course.enrollmentStatus !== 'PENDING' && (
                            <div className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-xs font-black flex items-center gap-1.5 border border-white/10">
                              <span className="text-[10px] text-sky-300 font-bold">Tiến độ</span>
                              <span className="text-emerald-400">{progress}%</span>
                            </div>
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="p-5 sm:p-6 space-y-3">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                            {course.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                            {course.description || 'Chương trình đào tạo tương tác trực tuyến chuẩn quốc tế.'}
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
                                <span className="font-bold text-sky-700">
                                  Học phí: {formatPrice(course.price || 2490000)} <span className="text-slate-400 font-normal">({currency === 'USD' ? formatVnd(course.price || 2490000) : formatUsd(convertToUsd(course.price || 2490000))})</span>
                                </span>
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
                              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-3">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suggested Courses Preview Strip */}
          {myCourses.length > 0 && (
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
                  Bên cạnh khóa học hiện tại, bạn có thể tham gia IELTS Speaking Studio phản xạ 1-1, Business English hoặc Phương pháp Sư phạm Hiện Đại.
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
          )}
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

            {/* Category Filter Pills (Aligned with 5 Pillars) */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categoryFilterPills.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterCategory === tab.id
                      ? 'bg-sky-600 text-white font-extrabold shadow-sm shadow-sky-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Courses Grid */}
          {filteredRecommended.length === 0 ? (
            <div className="bg-white rounded-3xl border border-line p-10 text-center space-y-3">
              <p className="text-slate-500 text-sm font-semibold">
                Không tìm thấy khóa học nào phù hợp với từ khóa hoặc bộ lọc trong phân hệ này.
              </p>
              <button
                onClick={() => {
                  setFilterCategory('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
              {filteredRecommended.map((course) => {
                const coverUrl = getCourseCoverUrl(course.thumbnail, course.category);

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-line overflow-hidden shadow-xs hover:shadow-lg hover:border-sky-200 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* 16:9 Course Cover Thumbnail */}
                    <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={coverUrl}
                        alt={course.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_COVERS.IELTS;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20" />

                      {/* Floating Badges Top */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {renderCategoryBadge(course.category)}
                          <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-white text-[10.5px] font-bold">
                            {course.level || 'Đào tạo chuẩn'}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-sky-500/90 text-white text-[10.5px] font-extrabold shadow-xs backdrop-blur-sm flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{course.studentCount || 150}</span>
                        </span>
                      </div>

                      {/* Floating Price Tag Bottom-Right */}
                      <div className="absolute bottom-2.5 right-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
                        <span>{formatPrice(course.price || 2490000)}</span>
                        <span className="text-[10px] text-slate-300 font-semibold border-l border-white/20 pl-1.5">
                          {currency === 'USD' ? formatVnd(course.price || 2490000) : formatUsd(convertToUsd(course.price || 2490000))}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {course.description || 'Chương trình đào tạo chuyên sâu kết hợp thực hành lớp học trực tuyến và trí tuệ nhân tạo AI.'}
                      </p>

                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                          <span>Giảng viên: Teacher Dong</span>
                        </span>
                        <span className="text-xs font-extrabold text-emerald-600">
                          Lớp học trực tuyến tương tác
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-0">
                    <button
                      onClick={() => handleOpenPaymentModal(course)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Đăng ký & Quét mã QR chuyển khoản</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
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
            <div className="bg-white rounded-3xl border border-line p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                {/* 16:9 Cover Preview */}
                <div className="relative w-full sm:w-44 aspect-video rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                  <img
                    src={getCourseCoverUrl(selectedCourse.thumbnail, selectedCourse.category)}
                    alt={selectedCourse.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_COVERS.IELTS;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    {renderCategoryBadge(selectedCourse.category)}
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold">Giảng viên: Thầy Đông (IELTS 8.5)</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug line-clamp-2">
                    {selectedCourse.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 pt-0.5 font-semibold">
                    <span>{modules.length} Chuyên đề Modules</span>
                    <span>•</span>
                    <span>
                      {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Bài học & Quiz
                    </span>
                    <span>•</span>
                    <span className="font-extrabold text-sky-600">
                      Tiến độ: {selectedCourse.progressPercent ?? selectedCourse.progress ?? 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-56 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Tiến độ hoàn thành</span>
                  <span className="text-sky-600 font-black">{selectedCourse.progressPercent ?? selectedCourse.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-sky-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${selectedCourse.progressPercent ?? selectedCourse.progress ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub-tabs for Course: Lessons vs Course Materials */}
          <div className="flex items-center justify-between border-b border-line pb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurriculumTab('lessons')}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  curriculumTab === 'lessons'
                    ? 'bg-[#1B64B0] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Chương Trình & Bài Học ({modules.reduce((acc, m) => acc + m.lessons.length, 0)})</span>
              </button>
              <button
                type="button"
                onClick={() => setCurriculumTab('materials')}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  curriculumTab === 'materials'
                    ? 'bg-[#1B64B0] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Học Liệu & Đề Thi Khóa Học ({courseMaterials.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCurriculumTab('homework')}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  curriculumTab === 'homework'
                    ? 'bg-[#1B64B0] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Bài Tập Về Nhà ({courseHomeworks.length})</span>
              </button>
            </div>

            {selectedCourse && (
              <Link
                href={`/student/library?courseId=${selectedCourse.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B64B0] hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Mở toàn bộ tủ sách khóa học ➔</span>
              </Link>
            )}
          </div>

          {/* Curriculum Accordion (Modules & Lessons) */}
          {curriculumTab === 'lessons' ? (
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
          ) : curriculumTab === 'materials' ? (
          /* Materials View for the selected course */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Kho Học Liệu & Đề Thi Dành Riêng Cho Khóa Học Này ({courseMaterials.length})
                </h3>
                <p className="text-xs text-slate-500">Giáo trình PDF & file nghe Audio chính thức được phân bổ cho học viên khóa này.</p>
              </div>
              <Link
                href={`/student/library?courseId=${selectedCourse?.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-[#1B64B0] border border-sky-200 text-xs font-extrabold hover:bg-sky-100 transition flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Xem trong Tủ Sách</span>
              </Link>
            </div>

            {loadingMaterials ? (
              <div className="p-8 text-center text-slate-500 font-semibold bg-white rounded-2xl border border-line">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1B64B0] mb-2" />
                <p className="text-xs">Đang tải danh sách học liệu của khóa học...</p>
              </div>
            ) : courseMaterials.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-line space-y-2">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-800">Khóa học này chưa có học liệu riêng</h4>
                <p className="text-xs text-slate-500">Thầy Đông sẽ sớm bổ sung tài liệu và bài nghe cho khóa học này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseMaterials.map((mat) => {
                  const isPdf = mat.type === 'PDF' || mat.fileType === 'PDF';
                  const childrenCount = Array.isArray(mat.children) ? mat.children.length : 0;
                  return (
                    <div
                      key={mat.id}
                      className="p-5 rounded-2xl bg-white border border-line hover:border-[#1B64B0] shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-50 text-[#1B64B0]">
                            {isPdf ? 'Đề thi & Giáo trình' : 'Audio bài nghe'}
                          </span>
                          {childrenCount > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Kèm {childrenCount} file nghe
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isPdf ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {isPdf ? <FileText className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                              {mat.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {mat.fileSize ? `${(mat.fileSize / (1024 * 1024)).toFixed(1)} MB` : '8.5 MB'} • Bảo mật DRM Watermark
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-line flex items-center justify-between">
                        <span className="text-[10.5px] text-slate-400 font-medium">Bảo vệ bản quyền</span>
                        <Link
                          href={`/student/library?courseId=${selectedCourse?.id}`}
                          className={`px-3.5 py-1.5 rounded-xl text-white text-xs font-black transition shadow-sm flex items-center gap-1.5 ${
                            childrenCount > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1B64B0] hover:bg-[#154E8A]'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{childrenCount > 0 ? 'Mở Đề & Nghe Audio' : 'Mở Xem Bảo Mật'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          ) : (
          /* Homework View for the selected course */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Nhiệm Vụ & Bài Tập Về Nhà Của Khóa Học ({courseHomeworks.length})
                </h3>
                <p className="text-xs text-slate-500">Các bài tập thực hành do Thầy Đông giao riêng cho học viên khóa học này.</p>
              </div>
              <Link
                href="/student/homework"
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-[#1B64B0] border border-sky-200 text-xs font-extrabold hover:bg-sky-100 transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xem Tất Cả Bài Tập</span>
              </Link>
            </div>

            {loadingHomeworks ? (
              <div className="p-8 text-center text-slate-500 font-semibold bg-white rounded-2xl border border-line">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1B64B0] mb-2" />
                <p className="text-xs">Đang tải bài tập về nhà của khóa học...</p>
              </div>
            ) : courseHomeworks.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-line space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-800">Chưa có bài tập về nhà nào cho khóa học này</h4>
                <p className="text-xs text-slate-500">Thầy Đông sẽ cập nhật bài tập thực hành sau các buổi học.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseHomeworks.map((hw) => {
                  const isGraded = hw.submissionStatus === 'GRADED';
                  const isPending = hw.submissionStatus === 'PENDING';
                  return (
                    <div
                      key={hw.id}
                      className="p-5 rounded-2xl bg-white border border-line hover:border-[#1B64B0] shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-50 text-[#1B64B0]">
                            Thang điểm {hw.maxScore}đ
                          </span>
                          {hw.dueDate && (
                            <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Hạn: {new Date(hw.dueDate).toLocaleDateString('vi-VN')}</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {hw.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-line">
                          {hw.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-line flex items-center justify-between">
                        <div>
                          {isGraded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                              <Award className="w-3 h-3 text-emerald-600" />
                              <span>Điểm: {hw.mySubmission?.score}/{hw.maxScore}đ</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                              <Clock className="w-3 h-3 text-sky-600" />
                              <span>Đã nộp - Chờ chấm</span>
                            </span>
                          )}
                          {!isGraded && !isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                              Chưa nộp bài
                            </span>
                          )}
                        </div>

                        <Link
                          href="/student/homework"
                          className="px-3.5 py-1.5 rounded-xl bg-[#1B64B0] hover:bg-[#154E8A] text-white text-xs font-black transition shadow-sm flex items-center gap-1"
                        >
                          <span>{isGraded ? 'Xem Lời Phê' : isPending ? 'Xem Bài Nộp' : 'Làm & Nộp Bài'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
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

              {/* Payment Method Switcher (Domestic VND vs International USD) */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethodTab('vietqr')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethodTab === 'vietqr'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm">🇻🇳</span>
                  <span>VietQR (Ngân hàng VNĐ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethodTab('international')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethodTab === 'international'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm">🇺🇸</span>
                  <span>Quốc tế / USD (SWIFT & Wire)</span>
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
                  <span className="text-base font-black text-sky-600">
                    {paymentMethodTab === 'international'
                      ? `${formatUsd(convertToUsd(price))} USD`
                      : `${price.toLocaleString('vi-VN')} đ`}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {paymentMethodTab === 'international'
                      ? `≈ ${price.toLocaleString('vi-VN')} đ (1$ ≈ ${exchangeRate.toLocaleString('vi-VN')}₫)`
                      : `≈ ${formatUsd(convertToUsd(price))} USD`}
                  </span>
                </div>
              </div>

              {/* Conditional Content: VietQR for Domestic VND vs SWIFT / Wire Transfer for International USD */}
              {paymentMethodTab === 'vietqr' ? (
                <>
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
                </>
              ) : (
                <>
                  {/* International USD Wire Transfer Container */}
                  <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl p-4 border border-emerald-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-900">
                        <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-black">Điện Chuyển Tiền Quốc Tế (SWIFT Wire)</h4>
                          <p className="text-[10.5px] text-slate-500">Thanh toán bằng USD từ mọi quốc gia</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        USD ACCOUNT
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10.5px] font-bold text-slate-400 block">Số tiền quy đổi (USD)</span>
                        <span className="text-lg font-black text-emerald-700">{formatUsd(convertToUsd(price))} USD</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(String(convertToUsd(price)), 'usdAmount')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition"
                      >
                        {copiedField === 'usdAmount' ? (
                          <span className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Đã chép</span>
                        ) : (
                          <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Chép số tiền</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* International SWIFT Transfer Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-semibold">Beneficiary Bank:</span>
                      <span className="font-extrabold text-slate-800 text-right">Military Commercial Joint Stock Bank (MB Bank)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-semibold">SWIFT / BIC Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-700 font-mono tracking-wider">MSBVNVX</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('MSBVNVX', 'swiftCode')}
                          className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedField === 'swiftCode' ? (
                            <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                          ) : (
                            <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-semibold">Beneficiary Name:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">NGUYEN VAN DONG</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('NGUYEN VAN DONG', 'intAccountName')}
                          className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedField === 'intAccountName' ? (
                            <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                          ) : (
                            <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-semibold">Account Number (USD):</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 font-mono tracking-wider">0987654321</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('0987654321', 'intAccountNo')}
                          className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedField === 'intAccountNo' ? (
                            <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                          ) : (
                            <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                      <span className="text-sky-900 font-semibold">Payment Reference:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sky-900 font-mono">{transferSyntax}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(transferSyntax, 'intSyntax')}
                          className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedField === 'intSyntax' ? (
                            <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Đã chép</span>
                          ) : (
                            <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Sao chép</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* PayPal & International Cards Assistance */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                        <span>Hỗ trợ PayPal / Thẻ Visa / Mastercard quốc tế:</span>
                      </div>
                      <p className="leading-relaxed">
                        Học viên quốc tế có thể thanh toán trực tiếp qua PayPal hoặc thẻ quốc tế. Vui lòng liên hệ WhatsApp/Telegram/Zalo: <strong className="text-slate-900">(+84) 987 654 321</strong> hoặc điền ghi chú bên dưới để nhận link thanh toán trực tuyến bảo mật.
                      </p>
                    </div>
                  </div>
                </>
              )}

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
                  {paymentMethodTab === 'international' ? (
                    <>Sau khi hoàn tất điện chuyển tiền quốc tế (SWIFT) hoặc thanh toán PayPal, bấm nút <strong className="text-amber-950 font-black">&ldquo;Xác nhận đã thanh toán (USD)&rdquo;</strong>. Ban quản trị sẽ đối soát và kích hoạt khóa học cho bạn ngay!</>
                  ) : (
                    <>Sau khi bạn chuyển khoản thành công trên app ngân hàng, hãy bấm nút <strong className="text-amber-950 font-black">&ldquo;Tôi đã chuyển khoản thành công&rdquo;</strong>. Admin Thầy Đông sẽ đối soát sao kê và kích hoạt khóa học vào tài khoản của bạn ngay!</>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQrModalCourse(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Để sau / Đóng
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={handleConfirmPayment}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md shadow-sky-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang gửi thông tin...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{paymentMethodTab === 'international' ? 'Xác nhận đã chuyển tiền (USD)' : 'Tôi đã chuyển khoản thành công'}</span>
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

export default function StudentCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
          <span>Đang tải thông tin khóa học...</span>
        </div>
      }
    >
      <StudentCoursesContent />
    </Suspense>
  );
}
