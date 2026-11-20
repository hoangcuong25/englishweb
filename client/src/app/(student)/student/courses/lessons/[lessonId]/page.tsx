'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { lessonsService } from '@/services/lessons.service';
import { materialsService } from '@/services/materials.service';
import { handleApiError } from '@/lib/api-error';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import DynamicWatermarkCanvas from '@/components/shared/dynamic-watermark-canvas';
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  FileText,
  Music,
  HelpCircle,
  PenTool,
  Mic,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Sparkles,
  BookOpen,
  X,
  Lock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface StudyData {
  lesson: {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    durationMinutes?: number;
    isCompleted: boolean;
    materials?: Array<{
      id: string;
      title: string;
      type: 'PDF' | 'AUDIO';
      fileSize?: number;
    }>;
    quizzes?: Array<{
      id: string;
      title: string;
      questions?: Array<{ id: string; content?: string }>;
    }>;
    speakingPrompts?: Array<{
      id: string;
      title: string;
      topic?: string;
    }>;
    writingPrompts?: Array<{
      id: string;
      title: string;
      taskType?: string;
    }>;
  };
  course: {
    id: string;
    title: string;
    modules: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        durationMinutes?: number;
        isCompleted: boolean;
      }>;
    }>;
  };
  navigation: {
    prevLesson: { id: string; title: string } | null;
    nextLesson: { id: string; title: string } | null;
  };
}

export default function LessonStudyPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;

  const { user } = useAuth();
  const [data, setData] = useState<StudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'materials' | 'practice'>('content');
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Secured Material Viewer State (Dynamic Watermark Protection)
  const [viewerMaterial, setViewerMaterial] = useState<{
    id: string;
    title: string;
    type: 'PDF' | 'AUDIO';
    signedUrl: string;
    watermark?: { fullName?: string; phone?: string; userId?: string };
  } | null>(null);
  const [loadingMaterialId, setLoadingMaterialId] = useState<string | null>(null);

  const fetchStudyData = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const res = await lessonsService.getStudyLesson(lessonId);
      setData(res);
      setIsCompleted(res.lesson.isCompleted);
    } catch (err) {
      handleApiError(err, 'Không thể tải nội dung bài học');
      setTimeout(() => {
        router.push('/student/courses');
      }, 2000);
    } finally {
      setLoading(false);
    }
  }, [lessonId, router]);

  useEffect(() => {
    fetchStudyData();
  }, [fetchStudyData]);

  const handleToggleComplete = async () => {
    if (!data?.lesson?.id) return;
    setCompleting(true);
    try {
      await lessonsService.completeLesson(data.lesson.id);
      setIsCompleted(true);
      toast.success('Đã ghi nhận hoàn thành bài học!');
      // Refresh to update curriculum checkmarks
      await fetchStudyData();
    } catch (err) {
      handleApiError(err, 'Không thể cập nhật tiến độ bài học');
    } finally {
      setCompleting(false);
    }
  };

  const handleOpenMaterial = async (mat: { id: string; title: string; type: 'PDF' | 'AUDIO' }) => {
    setLoadingMaterialId(mat.id);
    try {
      const res = await materialsService.getSignedUrl(mat.id);
      if (res?.signedUrl) {
        setViewerMaterial({
          id: mat.id,
          title: mat.title,
          type: mat.type,
          signedUrl: res.signedUrl,
          watermark: res.watermark,
        });
      } else {
        toast.info('Đang chuẩn bị học liệu an toàn...');
      }
    } catch (err) {
      handleApiError(err, 'Không thể tạo URL bảo mật cho học liệu');
    } finally {
      setLoadingMaterialId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-3 border-sky-200 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Đang tải phòng học kỹ thuật số...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-xs text-red-500 font-bold">Không tìm thấy thông tin bài học.</p>
        <Link
          href="/student/courses"
          className="inline-flex items-center space-x-1.5 text-xs text-primary font-bold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách khóa học</span>
        </Link>
      </div>
    );
  }

  const { lesson, course, navigation } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <Link href="/student/courses" className="hover:text-primary transition flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Khóa học</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700 truncate max-w-xs">{course.title}</span>
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{lesson.title}</span>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                Đã hoàn thành
              </span>
            )}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleComplete}
            disabled={completing}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Đã Hoàn Thành' : 'Đánh Dấu Hoàn Thành'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player on Left, Playlist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Video & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Box */}
          <div className="rounded-3xl overflow-hidden bg-slate-950 aspect-video relative shadow-xl border border-slate-800 flex items-center justify-center group">
            {lesson.videoUrl ? (
              <video
                src={lesson.videoUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
                poster="/video-poster.jpg"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform cursor-pointer">
                  <PlayCircle className="w-8 h-8 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Video bài giảng chuẩn hóa</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thời lượng ước tính: {lesson.durationMinutes || 45} phút • Phụ đề song ngữ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar between Lessons */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-line text-xs font-bold">
            {navigation.prevLesson ? (
              <Link
                href={`/student/courses/lessons/${navigation.prevLesson.id}`}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-primary transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate max-w-[180px]">Bài trước: {navigation.prevLesson.title}</span>
              </Link>
            ) : (
              <span className="text-slate-300 flex items-center space-x-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span>Bài đầu tiên</span>
              </span>
            )}

            {navigation.nextLesson ? (
              <Link
                href={`/student/courses/lessons/${navigation.nextLesson.id}`}
                className="flex items-center space-x-1.5 text-primary hover:text-primary-dark transition"
              >
                <span className="truncate max-w-[180px]">Bài tiếp: {navigation.nextLesson.title}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-slate-300 flex items-center space-x-1.5">
                <span>Bài cuối cùng</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-3xl border border-line p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-line pb-3">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'content'
                    ? 'bg-sky-50 text-primary border border-sky-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Nội Dung Bài Học</span>
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'materials'
                    ? 'bg-sky-50 text-primary border border-sky-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Học Liệu & Tài Liệu ({lesson.materials?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'practice'
                    ? 'bg-sky-50 text-primary border border-sky-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Luyện Tập & Đánh Giá</span>
              </button>
            </div>

            {/* Tab 1: Nội dung bài học */}
            {activeTab === 'content' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="prose prose-slate max-w-none">
                  {lesson.description ? (
                    <div className="whitespace-pre-line">{lesson.description}</div>
                  ) : (
                    <p className="text-slate-400 italic">
                      Bài học bao gồm kiến thức lý thuyết chuyên sâu, các bài tập thực hành tương tác và tài liệu bổ trợ đính kèm.
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start space-x-3 text-xs text-slate-600">
                  <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Chính sách học tập chuẩn Teacher Dong Academy</p>
                    <p className="mt-0.5 text-slate-500">
                      Tất cả học liệu, bài tập và video bài giảng đều được quản lý bản quyền số. Hãy hoàn thành các câu hỏi Checkpoint để mở khóa học phần tiếp theo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Học liệu số đính kèm */}
            {activeTab === 'materials' && (
              <div className="space-y-3">
                {lesson.materials && lesson.materials.length > 0 ? (
                  lesson.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3.5 rounded-2xl border border-line hover:border-primary/40 bg-slate-50/50 hover:bg-white transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                          {mat.type === 'PDF' ? (
                            <FileText className="w-5 h-5 text-red-500" />
                          ) : (
                            <Music className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{mat.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {mat.type} • {mat.fileSize ? `${(mat.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Bảo mật Watermark'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenMaterial(mat)}
                        disabled={loadingMaterialId === mat.id}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                      >
                        {loadingMaterialId === mat.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        )}
                        <span>{loadingMaterialId === mat.id ? 'Đang mở...' : 'Xem An Toàn'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400">Chưa có học liệu đính kèm cho bài học này.</p>
                )}
              </div>
            )}

            {/* Tab 3: Luyện tập & Đánh giá */}
            {activeTab === 'practice' && (
              <div className="space-y-4">
                {/* Quizzes */}
                {lesson.quizzes && lesson.quizzes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <span>Bài Kiểm Tra Trắc Nghiệm (Quizzes)</span>
                    </p>
                    {lesson.quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="p-3.5 rounded-2xl border border-line bg-slate-50/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{quiz.title}</p>
                          <p className="text-[11px] text-slate-400">Yêu cầu hoàn thành đạt ≥ 80% điểm số</p>
                        </div>
                        <Link
                          href={`/student/quizzes?quizId=${quiz.id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition"
                        >
                          Làm Bài Ngay
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Writing Practice */}
                {lesson.writingPrompts && lesson.writingPrompts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <PenTool className="w-4 h-4 text-emerald-600" />
                      <span>Bài Luyện Viết IELTS Writing AI</span>
                    </p>
                    {lesson.writingPrompts.map((wp) => (
                      <div
                        key={wp.id}
                        className="p-3.5 rounded-2xl border border-line bg-slate-50/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{wp.title}</p>
                          <p className="text-[11px] text-slate-400">Tích hợp AI chấm 4 tiêu chí IELTS Task 1 & 2</p>
                        </div>
                        <Link
                          href="/student/writing"
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          Luyện Viết Ngay
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Speaking Practice */}
                {lesson.speakingPrompts && lesson.speakingPrompts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <span>Studio Thu Âm Luyện Nói Speaking</span>
                    </p>
                    {lesson.speakingPrompts.map((sp) => (
                      <div
                        key={sp.id}
                        className="p-3.5 rounded-2xl border border-line bg-slate-50/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{sp.title}</p>
                          <p className="text-[11px] text-slate-400">Thu âm dạng sóng Web Audio API & Admin chấm điểm</p>
                        </div>
                        <Link
                          href="/student/speaking"
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          Thu Âm Ngay
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Curriculum Playlist */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-line p-5 space-y-4 shadow-sm sticky top-20">
            <div className="border-b border-line pb-3">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Mục Lục Khóa Học
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{course.title}</p>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {course.modules.map((mod, mIdx) => (
                <div key={mod.id} className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Phần {mIdx + 1}: {mod.title}
                  </p>
                  <div className="space-y-1">
                    {mod.lessons.map((l) => {
                      const isCurrent = l.id === lesson.id;
                      return (
                        <Link
                          key={l.id}
                          href={`/student/courses/lessons/${l.id}`}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                            isCurrent
                              ? 'bg-sky-50 border border-sky-300 text-primary font-bold'
                              : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate pr-2">
                            {l.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <PlayCircle className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-primary' : 'text-slate-400'}`} />
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>
                          {l.durationMinutes && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {l.durationMinutes}m
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECURED WATERMARKED MATERIAL VIEWER MODAL */}
      {viewerMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95">
            {/* Viewer Header */}
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3 truncate pr-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-sky-400 flex items-center justify-center shrink-0">
                  {viewerMaterial.type === 'PDF' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                    {viewerMaterial.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Bảo Mật Dynamic Watermark</span>
                    </span>
                    <span>•</span>
                    <span>Hiệu lực phiên: 15 phút</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  href="/student/library"
                  className="hidden sm:flex items-center space-x-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-xl bg-slate-800 transition"
                  title="Mở trong Thư viện số cá nhân"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kho Thư Viện</span>
                </Link>
                <button
                  onClick={() => setViewerMaterial(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Đóng học liệu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Stage with Dynamic Watermark Overlay */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden flex items-center justify-center select-none">
              {viewerMaterial.type === 'PDF' ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${viewerMaterial.signedUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-none"
                    title={viewerMaterial.title}
                  />
                  {/* Dynamic Watermark Canvas Protection */}
                  <DynamicWatermarkCanvas
                    studentName={viewerMaterial.watermark?.fullName || user?.fullName || 'Học Viên Teacher Dong'}
                    studentPhone={viewerMaterial.watermark?.phone || user?.phone || '0912345678'}
                    studentId={viewerMaterial.watermark?.userId || user?.id || 'HV-2026'}
                  />
                </div>
              ) : (
                <div className="w-full h-full relative flex flex-col items-center justify-center p-8 bg-slate-900 text-white space-y-6">
                  <div className="w-24 h-24 rounded-3xl bg-primary/20 text-sky-400 flex items-center justify-center border border-sky-400/30 shadow-xl">
                    <Music className="w-12 h-12" />
                  </div>
                  <div className="text-center space-y-1 max-w-md">
                    <h4 className="text-base font-bold text-slate-100">{viewerMaterial.title}</h4>
                    <p className="text-xs text-slate-400">
                      Tệp âm thanh chuẩn hóa giảng dạy IELTS Audio. Phát an toàn qua Signed URL.
                    </p>
                  </div>
                  <div className="w-full max-w-md p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-lg">
                    <audio controls autoPlay src={viewerMaterial.signedUrl} className="w-full h-10" />
                  </div>

                  {/* Watermark for Audio Player */}
                  <DynamicWatermarkCanvas
                    studentName={viewerMaterial.watermark?.fullName || user?.fullName || 'Học Viên Teacher Dong'}
                    studentPhone={viewerMaterial.watermark?.phone || user?.phone || '0912345678'}
                    studentId={viewerMaterial.watermark?.userId || user?.id || 'HV-2026'}
                  />
                </div>
              )}
            </div>

            {/* Viewer Anti-leak Notice Footer */}
            <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <span className="flex items-center space-x-1.5 text-amber-400/90 font-medium text-center sm:text-left">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Học liệu được mã hóa bản quyền riêng cho tài khoản: {user?.fullName || 'Học Viên'} ({user?.email})</span>
              </span>
              <button
                onClick={() => setViewerMaterial(null)}
                className="px-4 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Đóng Trình Xem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
