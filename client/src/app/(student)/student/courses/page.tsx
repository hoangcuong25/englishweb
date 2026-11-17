'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { coursesService, Course, CourseModule, CourseLesson } from '@/services/courses.service';
import { lessonsService } from '@/services/lessons.service';
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
  PlusCircle,
  Check,
  Users,
  Layers,
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

// Fallback initial enrolled courses
const DEFAULT_MY_COURSES: Course[] = [
  {
    id: 'course-ielts-masterclass',
    title: 'IELTS Masterclass 7.5+ Intensive (Writing & Speaking Focus)',
    slug: 'ielts-masterclass-band-7',
    description: 'Lộ trình bứt phá Band 7.5+ IELTS toàn diện, chuyên sâu rèn luyện cấu trúc bài luận Academic và phản xạ Speaking 1-1.',
    category: 'IELTS',
    level: 'Band 7.0 - 8.0+',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    progress: 68,
    progressPercent: 68,
    totalModules: 4,
    totalLessons: 15,
    enrolledAt: '15/10/2026',
  },
  {
    id: 'course-business-english',
    title: 'Business English VIP: Đàm Phán & Giao Tiếp Thương Mại Quốc Tế',
    slug: 'business-english-vip',
    description: 'Nâng cao năng lực thuyết trình tiếng Anh doanh nghiệp, viết email chuyên nghiệp và đàm phán hợp đồng kinh tế.',
    category: 'BUSINESS',
    level: 'B2 - C1 Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    progress: 35,
    progressPercent: 35,
    totalModules: 3,
    totalLessons: 12,
    enrolledAt: '01/11/2026',
  },
];

// Fallback initial recommended courses
const DEFAULT_RECOMMENDED_COURSES: Course[] = [
  {
    id: 'rec-1',
    title: 'IELTS Speaking Studio: Phản Xạ 1-1 & Chuẩn Hóa Phát Âm IPA',
    slug: 'ielts-speaking-studio',
    description: 'Khóa học phản xạ nói trên WebRTC LiveKit, ghi âm hiển thị sóng âm và AI phân tích 4 tiêu chí IELTS Speaking thời gian thực.',
    category: 'IELTS',
    level: 'Band 6.0 - 7.5+',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    studentCount: 342,
    moduleCount: 4,
  },
  {
    id: 'rec-2',
    title: 'Cambridge Primary English: Starters & Movers Toàn Diện',
    slug: 'cambridge-primary-english',
    description: 'Chương trình phát triển ngôn ngữ tự nhiên dành cho học sinh tiểu học với phương pháp học tương tác trực quan.',
    category: 'KIDS',
    level: 'Starters / Movers',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    studentCount: 215,
    moduleCount: 6,
  },
  {
    id: 'rec-3',
    title: 'Phương Pháp Sư Phạm Giảng Dạy Tiếng Anh Hiện Đại (TESOL Foundation)',
    slug: 'tesol-foundation',
    description: 'Phát triển năng lực sư phạm, thiết kế giáo án tương tác EdTech và kỹ năng quản lý lớp học trực tuyến WebRTC.',
    category: 'PEDAGOGY',
    level: 'Giảng viên & Trợ giảng',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    studentCount: 128,
    moduleCount: 5,
  },
  {
    id: 'rec-4',
    title: 'Global Mindset & Life Skills in English',
    slug: 'global-mindset-life-skills',
    description: 'Tư duy phản biện toàn cầu, kỹ năng lãnh đạo bản thân và khả năng tranh luận học thuật bằng tiếng Anh.',
    category: 'LIFE_SKILLS',
    level: 'Mọi trình độ',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    studentCount: 190,
    moduleCount: 3,
  },
];

const DEFAULT_CURRICULUM: MockModule[] = [
  {
    id: 'm1',
    title: 'Module 01: Foundations of Academic Writing & Lexis',
    lessonsCount: 4,
    isCompleted: true,
    lessons: [
      { id: 'l1', title: 'Lesson 01: IELTS Band Descriptors & Assessment Criteria', duration: '45 phút', isDone: true, isLocked: false, type: 'VIDEO' },
      { id: 'l2', title: 'Lesson 02: Academic Word List (AWL) Sublist 1 & 2', duration: '50 phút', isDone: true, isLocked: false, type: 'VIDEO' },
      { id: 'l3', title: 'Lesson 03: Paraphrasing Techniques & Nominalisation', duration: '60 phút', isDone: true, isLocked: false, type: 'WRITING' },
      { id: 'l4', title: 'Checkpoint 01: Vocabulary & Collocation Quiz', duration: '20 phút', isDone: true, isLocked: false, type: 'QUIZ' },
    ],
  },
  {
    id: 'm2',
    title: 'Module 02: Planning, Brainstorming & Essay Structure',
    lessonsCount: 4,
    isCompleted: true,
    lessons: [
      { id: 'l5', title: 'Lesson 04: Idea Generation & Mind Mapping for Abstract Topics', duration: '55 phút', isDone: true, isLocked: false, type: 'VIDEO' },
      { id: 'l6', title: 'Lesson 05: 4-Paragraph Structure for Opinion & Discussion Essays', duration: '60 phút', isDone: true, isLocked: false, type: 'VIDEO' },
      { id: 'l7', title: 'Lesson 06: Writing High-Impact Thesis Statements', duration: '45 phút', isDone: true, isLocked: false, type: 'WRITING' },
      { id: 'l8', title: 'Checkpoint 02: Essay Architecture Review Quiz', duration: '20 phút', isDone: false, isLocked: false, type: 'QUIZ' },
    ],
  },
  {
    id: 'm3',
    title: 'Module 03: Paragraph Development & Coherence (Current Focus)',
    lessonsCount: 4,
    isCompleted: false,
    lessons: [
      { id: 'l9', title: 'Lesson 07: Topic Sentences & Supporting Ideas Development', duration: '60 phút', isDone: true, isLocked: false, type: 'VIDEO' },
      { id: 'l10', title: 'Lesson 08: Inversion & Cleft Sentences for Cohesion (GRA 7.5+)', duration: '50 phút', isDone: true, isLocked: false, type: 'VIDEO' },
      { id: 'l11', title: 'Lesson 09: Writing Submissions with AI Instant Feedback', duration: '40 phút', isDone: false, isLocked: false, type: 'WRITING' },
      { id: 'l12', title: 'Checkpoint 03: End-of-Module Mastery Quiz', duration: '20 phút', isDone: false, isLocked: false, type: 'QUIZ' },
    ],
  },
  {
    id: 'm4',
    title: 'Module 04: Advanced Lexical Flexibility & Counter-arguments',
    lessonsCount: 3,
    isCompleted: false,
    isLocked: true,
    lessons: [
      { id: 'l13', title: 'Lesson 10: Addressing Counter-arguments & Rebuttals', duration: '60 phút', isDone: false, isLocked: true, type: 'VIDEO' },
      { id: 'l14', title: 'Lesson 11: C1/C2 Academic Precision in Writing', duration: '55 phút', isDone: false, isLocked: true, type: 'SPEAKING' },
      { id: 'l15', title: 'Checkpoint 04: Comprehensive Mock Assessment', duration: '30 phút', isDone: false, isLocked: true, type: 'QUIZ' },
    ],
  },
];

export default function StudentCoursesPage() {
  // Tabs: 'my-courses' | 'recommended' | 'curriculum'
  const [activeTab, setActiveTab] = useState<'my-courses' | 'recommended' | 'curriculum'>('my-courses');

  // Enrolled courses
  const [myCourses, setMyCourses] = useState<Course[]>(DEFAULT_MY_COURSES);
  // Recommended courses
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>(DEFAULT_RECOMMENDED_COURSES);

  // Selected course for curriculum view
  const [selectedCourse, setSelectedCourse] = useState<Course>(DEFAULT_MY_COURSES[0]);
  const [modules, setModules] = useState<MockModule[]>(DEFAULT_CURRICULUM);
  const [expandedModule, setExpandedModule] = useState<string>('m1');

  // Filters & Loading
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch My Enrolled Courses
        const myLearningRes = await coursesService.getMyLearning();
        if (Array.isArray(myLearningRes) && myLearningRes.length > 0) {
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
          }));
          setMyCourses(mappedEnrolled);
          setSelectedCourse(mappedEnrolled[0]);
        }

        // 2. Fetch Catalog for Recommended Courses
        const catalogRes = await coursesService.getCourses();
        if (Array.isArray(catalogRes) && catalogRes.length > 0) {
          // Filter out courses student already has
          const enrolledIds = new Set(myCourses.map((mc) => mc.id));
          const notEnrolled = catalogRes.filter((c: Course) => !enrolledIds.has(c.id));
          if (notEnrolled.length > 0) {
            setRecommendedCourses(notEnrolled);
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
        // Fallback default curriculum
        setModules(DEFAULT_CURRICULUM);
        setExpandedModule('m1');
      }
    } catch {
      setModules(DEFAULT_CURRICULUM);
      setExpandedModule('m1');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enrollment into Recommended Course
  const handleEnrollCourse = async (course: Course) => {
    setEnrollingId(course.id);
    try {
      await coursesService.enroll(course.id);
      showToast(`Chúc mừng bạn đã đăng ký khóa học "${course.title}" thành công!`);
    } catch {
      // Local fallback simulation
      showToast(`Đã thêm khóa học "${course.title}" vào danh sách học của bạn!`);
    } finally {
      setEnrollingId(null);

      // Add to myCourses
      const newlyEnrolled: Course = {
        ...course,
        progress: 0,
        progressPercent: 0,
        totalModules: course.moduleCount || 4,
        totalLessons: 12,
        enrolledAt: new Date().toLocaleDateString('vi-VN'),
      };

      setMyCourses((prev) => [newlyEnrolled, ...prev]);
      setRecommendedCourses((prev) => prev.filter((c) => c.id !== course.id));
      setActiveTab('my-courses');
    }
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
              <span>Lộ trình chi tiết: {selectedCourse.title.split(':')[0]}</span>
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
                            <div className="flex items-center gap-2">
                              {renderCategoryBadge(course.category)}
                              <span className="text-[11px] font-bold text-slate-400">
                                {course.level || 'Academic'}
                              </span>
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
            {filteredRecommended.map((course) => {
              const isEnrolling = enrollingId === course.id;

              return (
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

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        <span>{course.studentCount || 150} học viên</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-sky-600" />
                        <span>{course.moduleCount || 4} Chuyên đề Modules</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => handleEnrollCourse(course)}
                      disabled={isEnrolling}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                      {isEnrolling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang đăng ký...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>Đăng ký tham gia học ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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
                  Tiến độ: {selectedCourse.progressPercent || selectedCourse.progress || 68}%
                </span>
              </div>
            </div>

            <div className="w-full md:w-56 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Tiến độ hoàn thành</span>
                <span className="text-sky-600">{selectedCourse.progressPercent || selectedCourse.progress || 68}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-sky-600 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${selectedCourse.progressPercent || selectedCourse.progress || 68}%` }}
                />
              </div>
            </div>
          </div>

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
    </div>
  );
}
