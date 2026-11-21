'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { materialsService, SignedUrlResponse, AttachedAudioTrack } from '@/services/materials.service';
import { coursesService, CourseEnrollment } from '@/services/courses.service';
import DynamicWatermarkCanvas from '@/components/shared/dynamic-watermark-canvas';
import {
  FileText,
  Headphones,
  Clock,
  Eye,
  Lock,
  Search,
  X,
  ShieldCheck,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Play,
  Pause,
  Layers,
  FolderOpen,
  Briefcase,
  Award,
  Compass,
  CheckCircle2,
  ExternalLink,
  Volume2,
} from 'lucide-react';

interface LibraryChildAudio {
  id: string;
  title: string;
  type?: string;
  fileKey?: string;
  fileSize?: number;
  durationSeconds?: number;
}

interface LibraryMaterial {
  id: string;
  title: string;
  fileType: 'PDF' | 'AUDIO_MP3';
  courseId: string;
  courseTitle: string;
  size: string;
  updatedAt: string;
  children: LibraryChildAudio[];
  childrenCount: number;
}

interface RawMaterial {
  id: string;
  title: string;
  type?: string;
  fileSize?: number;
  courseId?: string;
  course?: { id?: string; title?: string };
  createdAt?: string;
  lesson?: { module?: { course?: { id?: string; title?: string } } };
  children?: LibraryChildAudio[];
}

interface EnrolledCourseItem {
  id: string;
  title: string;
  category?: string;
  thumbnail?: string;
}

function StudentLibraryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const urlCourseId = searchParams?.get('courseId');

  // Materials & Enrolled Courses
  const [materials, setMaterials] = useState<LibraryMaterial[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Course Tab: 'ALL' or specific courseId
  const [selectedCourseTab, setSelectedCourseTab] = useState<string>('ALL');

  // Search & Filter within the active course
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXAM_AUDIO' | 'PDF' | 'AUDIO'>('ALL');

  // Viewer State
  const [selectedMaterial, setSelectedMaterial] = useState<LibraryMaterial | null>(null);
  const [signedUrlData, setSignedUrlData] = useState<SignedUrlResponse | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(24);

  // Audio Player State inside PDF Viewer
  const [activeAudioIdx, setActiveAudioIdx] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState(1);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const studentAudioRef = useRef<HTMLAudioElement | null>(null);

  const formatAudioTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlayAudio = () => {
    if (!studentAudioRef.current) return;
    if (isAudioPlaying) {
      studentAudioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      studentAudioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  const handleSeekAudio = (t: number) => {
    if (!studentAudioRef.current) return;
    studentAudioRef.current.currentTime = t;
    setAudioCurrentTime(t);
  };

  const handleSetSpeed = (rate: number) => {
    setAudioPlaybackRate(rate);
    if (studentAudioRef.current) {
      studentAudioRef.current.playbackRate = rate;
    }
  };

  const handlePageChange = (delta: number) => {
    if (!selectedMaterial) return;
    const newPage = Math.max(1, Math.min(totalPages, currentPage + delta));
    setCurrentPage(newPage);
    try {
      localStorage.setItem(`reader_page_${selectedMaterial.id}`, String(newPage));
    } catch {
      // Ignore
    }
  };

  // 15:00 countdown timer
  useEffect(() => {
    if (!selectedMaterial) return;
    setTimeLeft(15 * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedMaterial]);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch student active enrollments
        let activeCourses: EnrolledCourseItem[] = [];
        try {
          const myLearning = await coursesService.getMyLearning();
          if (Array.isArray(myLearning)) {
            activeCourses = myLearning
              .filter((item: CourseEnrollment) => (item.status || 'ACTIVE') === 'ACTIVE' && item.course)
              .map((item: CourseEnrollment) => ({
                id: item.course!.id,
                title: item.course!.title,
                category: item.course!.category,
                thumbnail: item.course!.thumbnail,
              }));
            setEnrolledCourses(activeCourses);

            // Pre-select course from URL if valid
            if (urlCourseId && activeCourses.some((c) => c.id === urlCourseId)) {
              setSelectedCourseTab(urlCourseId);
            } else if (activeCourses.length > 0 && selectedCourseTab === 'ALL') {
              // Default to first enrolled course for optimal course-centric UX
              setSelectedCourseTab(activeCourses[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to fetch enrolled courses:', err);
        }

        // 2. Fetch materials
        const res = await materialsService.getAll();
        if (res && Array.isArray(res.items)) {
          const mapped: LibraryMaterial[] = (res.items as unknown as RawMaterial[]).map((m: RawMaterial) => {
            const cId = m.courseId || m.course?.id || m.lesson?.module?.course?.id || '';
            const cTitle = m.course?.title || m.lesson?.module?.course?.title || 'Khóa học';
            const children = Array.isArray(m.children) ? m.children : [];
            return {
              id: m.id,
              title: m.title,
              fileType: m.type === 'AUDIO' ? 'AUDIO_MP3' : 'PDF',
              courseId: cId,
              courseTitle: cTitle,
              size: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(1)} MB` : '8.5 MB',
              updatedAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : 'Gần đây',
              children,
              childrenCount: children.length,
            };
          });
          setMaterials(mapped);
        }
      } catch (err) {
        console.error('Failed to load library materials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlCourseId]);

  const handleOpenSecureMaterial = async (mat: LibraryMaterial, defaultAudioTrackId?: string) => {
    setSelectedMaterial(mat);
    setLoadingSignedUrl(true);
    setActiveAudioIdx(0);
    setIsAudioPlaying(false);
    setAudioCurrentTime(0);
    setAudioPlaybackRate(1);

    try {
      const savedPage = localStorage.getItem(`reader_page_${mat.id}`);
      setCurrentPage(savedPage ? Math.max(1, Number(savedPage)) : 1);
    } catch {
      setCurrentPage(1);
    }

    try {
      const data = await materialsService.getSignedUrl(mat.id);
      setSignedUrlData(data);
      if (data.audios && data.audios.length > 0 && defaultAudioTrackId) {
        const foundIdx = data.audios.findIndex((a) => a.id === defaultAudioTrackId);
        if (foundIdx >= 0) setActiveAudioIdx(foundIdx);
      }
    } catch {
      // Fallback preview
      setSignedUrlData({
        signedUrl: `http://localhost:3001/api/materials/${mat.id}/stream?token=demo_signed_token_15m`,
        expiresInSeconds: 900,
        watermark: {
          fullName: user?.fullName || 'Học Viên Teacher Dong',
          phone: user?.phone || '0912345678',
          userId: user?.id || 'std-demo-id',
          timestamp: Date.now(),
        },
      });
    } finally {
      setLoadingSignedUrl(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Currently focused course object
  const activeCourse = useMemo(() => {
    if (selectedCourseTab === 'ALL') return null;
    return enrolledCourses.find((c) => c.id === selectedCourseTab) || null;
  }, [selectedCourseTab, enrolledCourses]);

  // Materials belonging to the active selection
  const scopedMaterials = useMemo(() => {
    if (selectedCourseTab === 'ALL') return materials;
    return materials.filter((m) => m.courseId === selectedCourseTab);
  }, [materials, selectedCourseTab]);

  // Filtered materials by search and type
  const filteredMaterials = useMemo(() => {
    return scopedMaterials.filter((m) => {
      const matchSearch =
        !searchTerm.trim() ||
        m.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        m.courseTitle.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchType =
        filterType === 'ALL' ||
        (filterType === 'EXAM_AUDIO' && m.fileType === 'PDF' && m.childrenCount > 0) ||
        (filterType === 'PDF' && m.fileType === 'PDF') ||
        (filterType === 'AUDIO' && m.fileType === 'AUDIO_MP3');

      return matchSearch && matchType;
    });
  }, [scopedMaterials, searchTerm, filterType]);

  // Categorized materials for the active course
  const examWithAudios = useMemo(() => {
    return filteredMaterials.filter((m) => m.fileType === 'PDF' && m.childrenCount > 0);
  }, [filteredMaterials]);

  const standardPdfs = useMemo(() => {
    return filteredMaterials.filter((m) => m.fileType === 'PDF' && m.childrenCount === 0);
  }, [filteredMaterials]);

  const standaloneAudios = useMemo(() => {
    return filteredMaterials.filter((m) => m.fileType === 'AUDIO_MP3');
  }, [filteredMaterials]);

  const getCourseCategoryLabel = (category?: string) => {
    const cat = (category || '').toUpperCase();
    if (cat === 'IELTS') return 'IELTS Masterclass';
    if (cat === 'BUSINESS') return 'Business English';
    if (cat === 'PEDAGOGY') return 'Năng Lực Sư Phạm';
    if (cat === 'LIFE_SKILLS') return 'Kỹ Năng Sống';
    return 'Chương Trình Đào Tạo';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Explicit DRM Protection Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF3FC] text-[#1B64B0] text-xs font-black uppercase tracking-wider">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Kho Học Liệu Số Phân Theo Khóa Học</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tủ Sách Học Liệu & Đề Thi Số
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Mỗi khóa học có kho đề thi PDF, giáo trình và file nghe Audio riêng biệt do Thầy Đông trực tiếp phân bổ. Tài liệu được bảo vệ bản quyền với Dynamic Watermark thời gian thực và liên kết ký số bảo mật 15 phút.
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-[#1B64B0] text-xs font-extrabold shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#1B64B0]" />
          <span>DRM Watermark & Presigned URL 15:00</span>
        </div>
      </div>

      {/* 2. Empty State if student is not enrolled in any course */}
      {!loading && enrolledCourses.length === 0 && (
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-line shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Bạn chưa có khóa học đang hoạt động
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Theo chính sách bảo mật nội dung của Teacher Dong Academy, đề thi PDF và bài nghe Audio được cấp quyền riêng biệt theo từng khóa học. Vui lòng đăng ký khóa học để được mở khóa tài liệu học tập độc quyền.
            </p>
          </div>
          <Link
            href="/student/courses"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1B64B0] hover:bg-[#154E8A] text-white text-xs font-black transition shadow-sm"
          >
            <span>Khám phá các khóa học</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. Course-Centric Workspace Selector (Tabs / Cards) */}
      {enrolledCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Chọn khóa học để mở tủ sách ({enrolledCourses.length} khóa đang học):
              </span>
            </div>
            {activeCourse && (
              <button
                type="button"
                onClick={() => setSelectedCourseTab('ALL')}
                className="text-xs font-bold text-[#1B64B0] hover:underline cursor-pointer"
              >
                Xem tất cả khóa học
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tab: Tất cả khóa học */}
            <button
              type="button"
              onClick={() => setSelectedCourseTab('ALL')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                selectedCourseTab === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                  : 'bg-white text-slate-700 border-line hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedCourseTab === 'ALL' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  selectedCourseTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {materials.length} tài liệu
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight line-clamp-1">Toàn Bộ Học Liệu</h4>
                <p className={`text-[11px] ${selectedCourseTab === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Tất cả các khóa đã đăng ký
                </p>
              </div>
            </button>

            {/* Enrolled Courses Cards */}
            {enrolledCourses.map((c) => {
              const isSelected = selectedCourseTab === c.id;
              const courseMats = materials.filter((m) => m.courseId === c.id);
              const pdfCount = courseMats.filter((m) => m.fileType === 'PDF').length;
              const audioCount = courseMats.reduce(
                (sum, m) => sum + (m.fileType === 'AUDIO_MP3' ? 1 : m.childrenCount),
                0,
              );

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourseTab(c.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-[#1B64B0] text-white border-[#1B64B0] shadow-md ring-2 ring-[#1B64B0]/25'
                      : 'bg-white text-slate-800 border-line hover:border-[#1B64B0] hover:bg-sky-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md truncate max-w-[150px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-sky-50 text-[#1B64B0]'
                    }`}>
                      {getCourseCategoryLabel(c.category)}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {courseMats.length} file
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black tracking-tight line-clamp-2 leading-snug">
                      {c.title}
                    </h4>
                    <p className={`text-[10.5px] mt-1 flex items-center gap-1.5 font-semibold ${
                      isSelected ? 'text-sky-100' : 'text-slate-400'
                    }`}>
                      <span>{pdfCount} Đề PDF</span>
                      <span>•</span>
                      <span>{audioCount} Audio</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Active Course Hub Banner & Toolbar */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white rounded-3xl border border-line p-5 sm:p-6 shadow-xs space-y-5">
          {/* Active Course Info Bar */}
          {activeCourse ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-[#1B64B0]">
                    {getCourseCategoryLabel(activeCourse.category)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">• Giảng viên: Thầy Đông</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Tủ Sách: {activeCourse.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Tài liệu đề thi PDF và bài nghe Audio chính thức dành riêng cho học viên khóa này.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/student/courses"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Vào học đề cương</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="pb-4 border-b border-line">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Toàn Bộ Học Liệu Số (Tất Cả Khóa Học)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Đang hiển thị danh sách tài liệu tổng hợp từ các khóa học bạn đã đăng ký.
              </p>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tài liệu, đề thi, audio..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-[#1B64B0]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Tất cả tài liệu' },
                { id: 'EXAM_AUDIO', label: 'Đề thi kèm Audio' },
                { id: 'PDF', label: 'Giáo trình PDF' },
                { id: 'AUDIO', label: 'File nghe Audio' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    filterType === f.id
                      ? 'bg-[#1B64B0] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Materials Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-line">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1B64B0] mx-auto mb-2" />
          <p className="text-xs">Đang tải tủ sách học liệu của bạn...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-line shadow-xs space-y-2 max-w-lg mx-auto">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">
            {activeCourse ? `Chưa có tài liệu nào trong khóa học này` : `Không tìm thấy tài liệu phù hợp`}
          </h3>
          <p className="text-xs text-slate-500">
            Thầy Đông sẽ sớm bổ sung tài liệu đề thi và bài nghe cho khóa học này. Vui lòng quay lại sau!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION A: Đề Thi Thực Chiến Có Kèm Audio Bài Nghe */}
          {examWithAudios.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Bộ Đề Thi Thực Chiến & Bài Nghe Audio Đi Kèm ({examWithAudios.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Bấm &quot;Mở Đề & Nghe Audio&quot; để làm bài</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examWithAudios.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-5 rounded-3xl bg-white border border-line hover:border-[#1B64B0] shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-black text-[#1B64B0] bg-[#DDF3FC] px-2.5 py-0.5 rounded-md truncate max-w-[220px]">
                          {mat.courseTitle}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                          <Headphones className="w-3 h-3 text-emerald-700" />
                          <span>Kèm {mat.childrenCount} Track Audio</span>
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-[#1B64B0] transition-colors line-clamp-2 leading-snug">
                            {mat.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Dung lượng: {mat.size} • Cập nhật: {mat.updatedAt}
                          </p>
                        </div>
                      </div>

                      {/* Attached Audio Tracklist Preview */}
                      {mat.children.length > 0 && (
                        <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <p className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Volume2 className="w-3 h-3 text-[#1B64B0]" />
                            <span>File âm thanh đính kèm ({mat.children.length}):</span>
                          </p>
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {mat.children.map((childTrack, cIdx) => (
                              <div
                                key={childTrack.id || cIdx}
                                onClick={() => handleOpenSecureMaterial(mat, childTrack.id)}
                                className="flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-[#1B64B0] hover:bg-sky-50 px-2 py-1 rounded-lg cursor-pointer transition"
                              >
                                <span className="truncate flex-1">
                                  Track 0{cIdx + 1}: {childTrack.title}
                                </span>
                                <span className="text-[10px] text-amber-600 font-mono shrink-0 ml-2">
                                  {childTrack.durationSeconds ? `${Math.floor(childTrack.durationSeconds / 60)} phút` : 'Nghe ngay'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
                      <span className="text-[10.5px] text-slate-400 font-medium">Bảo mật DRM Canvas</span>
                      <button
                        type="button"
                        onClick={() => handleOpenSecureMaterial(mat)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>Mở Đọc Đề & Nghe Audio</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: Giáo Trình & Tài Liệu Chuyên Đề (PDF Only) */}
          {standardPdfs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B64B0]"></span>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Giáo Trình & Sách Tài Liệu Chuyên Đề ({standardPdfs.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Chỉ xem trực tuyến • Có Watermark</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standardPdfs.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-5 rounded-3xl bg-white border border-line hover:border-[#1B64B0] shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-black text-[#1B64B0] bg-[#DDF3FC] px-2.5 py-0.5 rounded-md truncate max-w-[220px]">
                          {mat.courseTitle}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Giáo trình PDF
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-[#1B64B0] transition-colors line-clamp-2 leading-snug">
                            {mat.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Dung lượng: {mat.size} • Cập nhật: {mat.updatedAt}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
                      <span className="text-[10.5px] text-slate-400 font-medium">Chống tải xuống • DRM</span>
                      <button
                        type="button"
                        onClick={() => handleOpenSecureMaterial(mat)}
                        className="px-4 py-2 rounded-xl bg-[#1B64B0] hover:bg-[#154E8A] text-white text-xs font-black transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Mở Đọc Giáo Trình</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION C: Bài Nghe & Audio Độc Lập */}
          {standaloneAudios.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Bài Nghe Audio Luyện Tập Độc Lập ({standaloneAudios.length})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standaloneAudios.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-5 rounded-3xl bg-white border border-line hover:border-amber-400 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md truncate max-w-[220px]">
                          {mat.courseTitle}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Audio Stream MP3
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                            {mat.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Dung lượng: {mat.size} • Cập nhật: {mat.updatedAt}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
                      <span className="text-[10.5px] text-slate-400 font-medium">Bản quyền Teacher Dong</span>
                      <button
                        type="button"
                        onClick={() => handleOpenSecureMaterial(mat)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Nghe Audio Trực Tuyến</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Secured Material Viewer Modal (Watermark, 15:00 Signed URL Countdown & Sticky Audio Player) */}
      {selectedMaterial && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm transition-all duration-300 ${
            isFocusMode ? 'p-0' : 'p-3 sm:p-5'
          }`}
        >
          <div
            className={`bg-white flex flex-col shadow-2xl overflow-hidden relative border border-line transition-all duration-300 ${
              isFocusMode
                ? 'w-screen h-screen rounded-none'
                : 'w-full max-w-5xl h-[88vh] rounded-3xl'
            }`}
          >
            {/* Viewer Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#1B64B0] flex items-center justify-center text-white font-bold shrink-0">
                  {selectedMaterial.fileType === 'PDF' ? <FileText className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider truncate">
                      {selectedMaterial.courseTitle}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold truncate max-w-md text-slate-100">
                    {selectedMaterial.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-300">
                    <span className="flex items-center space-x-1 text-amber-400 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>URL ký số hết hạn: {formatTimer(timeLeft)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Chống tải xuống & DRM Canvas</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {/* Fullscreen / Focus Mode Button */}
                <button
                  type="button"
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title={isFocusMode ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình tập trung'}
                >
                  {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isFocusMode ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedMaterial(null);
                    setSignedUrlData(null);
                    setIsFocusMode(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Stage with Moving Dynamic Watermark */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              {loadingSignedUrl ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#1B64B0]" />
                  <p className="text-xs font-bold">Đang tạo Signed URL bảo mật 15 phút...</p>
                </div>
              ) : selectedMaterial.fileType === 'PDF' && signedUrlData?.signedUrl ? (
                <div className="w-full h-full relative flex flex-col">
                  {/* Sticky Audio Player Bar on Top of PDF if Audios Exist */}
                  {signedUrlData.audios && signedUrlData.audios.length > 0 && (
                    <div className="w-full bg-slate-900 border-b border-slate-700/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white z-20 shadow-md">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                          <Headphones className="w-4 h-4" />
                        </span>
                        {signedUrlData.audios.length > 1 ? (
                          <select
                            value={activeAudioIdx}
                            onChange={(e) => {
                              setActiveAudioIdx(Number(e.target.value));
                              setIsAudioPlaying(false);
                            }}
                            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-semibold max-w-[200px] truncate"
                          >
                            {signedUrlData.audios.map((track, idx) => (
                              <option key={track.id} value={idx}>
                                {track.title || `Track Audio 0${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="truncate max-w-[220px]">
                            <p className="text-xs font-bold text-slate-100 truncate">
                              {signedUrlData.audios[0]?.title || 'Audio Đề Thi'}
                            </p>
                            <span className="text-[10px] text-amber-400 font-semibold">Tệp âm thanh đi kèm đề thi</span>
                          </div>
                        )}
                      </div>

                      {/* Integrated Audio Controls */}
                      <div className="flex items-center gap-3 flex-1 max-w-md justify-center">
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow transition cursor-pointer shrink-0"
                          title={isAudioPlaying ? 'Tạm dừng' : 'Phát bài nghe'}
                        >
                          {isAudioPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatAudioTime(audioCurrentTime)}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={audioDuration || 100}
                            value={audioCurrentTime}
                            onChange={(e) => handleSeekAudio(Number(e.target.value))}
                            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatAudioTime(audioDuration)}
                          </span>
                        </div>
                      </div>

                      {/* Playback speed switchers */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Tốc độ:</span>
                        {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => handleSetSpeed(speed)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition cursor-pointer ${
                              audioPlaybackRate === speed
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      <audio
                        ref={studentAudioRef}
                        key={signedUrlData.audios[activeAudioIdx]?.id || 'audio-track'}
                        src={
                          signedUrlData.audios[activeAudioIdx]?.signedUrl?.startsWith('http')
                            ? signedUrlData.audios[activeAudioIdx]?.signedUrl
                            : `http://localhost:3001${signedUrlData.audios[activeAudioIdx]?.signedUrl?.startsWith('/') ? '' : '/'}${signedUrlData.audios[activeAudioIdx]?.signedUrl || ''}`
                        }
                        onTimeUpdate={() => {
                          if (studentAudioRef.current) {
                            setAudioCurrentTime(studentAudioRef.current.currentTime);
                          }
                        }}
                        onLoadedMetadata={() => {
                          if (studentAudioRef.current) {
                            setAudioDuration(studentAudioRef.current.duration);
                            studentAudioRef.current.playbackRate = audioPlaybackRate;
                          }
                        }}
                        onEnded={() => setIsAudioPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* PDF Document Stage */}
                  <div className="flex-1 w-full h-full relative">
                    <iframe
                      src={`${signedUrlData.signedUrl.startsWith('http') ? signedUrlData.signedUrl : `http://localhost:3001${signedUrlData.signedUrl.startsWith('/') ? '' : '/'}${signedUrlData.signedUrl}`}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="w-full h-full border-none"
                      title={selectedMaterial.title}
                    />
                  </div>
                </div>
              ) : selectedMaterial.fileType === 'PDF' ? (
                <div className="w-full h-full p-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Đang nạp tài liệu: {selectedMaterial.title}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md">
                    Tài liệu được bảo vệ bản quyền với Dynamic Watermark thời gian thực.
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-lg p-6 bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl space-y-5 text-center z-10">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
                    <Headphones className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-100">{selectedMaterial.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedMaterial.courseTitle} • Audio bài học chính thức
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <audio
                      key={signedUrlData?.signedUrl}
                      controls
                      autoPlay
                      src={
                        signedUrlData?.signedUrl?.startsWith('http')
                          ? signedUrlData.signedUrl
                          : `http://localhost:3001${signedUrlData?.signedUrl?.startsWith('/') ? '' : '/'}${signedUrlData?.signedUrl || ''}`
                      }
                      className="w-full h-10"
                      controlsList="nodownload"
                    />
                  </div>
                  <p className="text-[11px] text-amber-400 font-medium flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bản quyền thuộc Teacher Dong Academy. Chặn nút tải trực tiếp.</span>
                  </p>
                </div>
              )}

              {/* Dynamic Watermark Canvas Overlay */}
              <DynamicWatermarkCanvas
                studentName={signedUrlData?.watermark?.fullName || user?.fullName || 'Học Viên Teacher Dong'}
                studentPhone={signedUrlData?.watermark?.phone || user?.phone || '0912345678'}
                studentId={signedUrlData?.watermark?.userId || user?.id || 'HV-2026'}
              />
            </div>

            {/* Viewer Footer: Reader Page Navigation */}
            {selectedMaterial.fileType === 'PDF' && (
              <div className="bg-white border-t border-line px-5 py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Bookmark className="w-4 h-4 text-[#1B64B0]" />
                  <span className="font-semibold">Vị trí đọc dở: Trang {currentPage}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(-1)}
                    className="p-1.5 rounded-lg border border-line bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-700 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-slate-800">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(1)}
                    className="p-1.5 rounded-lg border border-line bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-700 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen-capture & Print Shield */}
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function StudentLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-line">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1B64B0] mx-auto mb-2" />
          <p className="text-xs">Đang nạp tủ sách học liệu của bạn...</p>
        </div>
      }
    >
      <StudentLibraryContent />
    </Suspense>
  );
}
