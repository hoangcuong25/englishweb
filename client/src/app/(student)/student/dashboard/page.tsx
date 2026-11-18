'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { dashboardService, StudentDashboardData } from '@/services/dashboard.service';
import {
  BookOpen,
  Video,
  PenTool,
  CheckCircle2,
  ArrowRight,
  FileText,
  Play,
  Award,
  Sparkles,
  CalendarCheck,
  Target,
} from 'lucide-react';

const ENGLISH_CATEGORIES = ['ENGLISH', 'IELTS', 'BUSINESS', 'KIDS'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [metricTab, setMetricTab] = useState<'ielts' | 'skills' | 'pedagogy'>('ielts');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStudentDashboard();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
      }
    };
    fetchDashboard();
  }, []);

  // Dynamically determine which skill tracks the student is enrolled in
  const enrolledTracks = useMemo(() => {
    const courses = data?.recentCourses || [];
    if (courses.length === 0) {
      return ['ielts'] as ('ielts' | 'skills' | 'pedagogy')[];
    }

    const tracks: ('ielts' | 'skills' | 'pedagogy')[] = [];

    const hasEnglish = courses.some(
      (c: { category?: string; isEnglishCourse?: boolean; title?: string }) =>
        (c.category && ENGLISH_CATEGORIES.includes(c.category)) ||
        c.isEnglishCourse === true ||
        (typeof c.title === 'string' && (c.title.includes('IELTS') || c.title.includes('English'))),
    );
    if (hasEnglish) tracks.push('ielts');

    const hasSkills = courses.some(
      (c: { category?: string; title?: string }) =>
        (c.category && ['LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category)) ||
        (typeof c.title === 'string' &&
          (c.title.includes('Kỹ Năng') || c.title.includes('Skills') || c.title.includes('Sống'))),
    );
    if (hasSkills) tracks.push('skills');

    const hasPedagogy = courses.some(
      (c: { category?: string; title?: string }) =>
        c.category === 'PEDAGOGY' ||
        (typeof c.title === 'string' &&
          (c.title.includes('Sư Phạm') || c.title.includes('Giảng Dạy') || c.title.includes('Pedagogy'))),
    );
    if (hasPedagogy) tracks.push('pedagogy');

    if (tracks.length === 0) {
      tracks.push('skills');
    }

    return tracks;
  }, [data]);

  // Sync active metric tab to the first enrolled track
  useEffect(() => {
    if (enrolledTracks.length > 0 && !enrolledTracks.includes(metricTab)) {
      setMetricTab(enrolledTracks[0]);
    }
  }, [enrolledTracks, metricTab]);

  // Compute stats with fallback
  const overview = data?.overview || {
    enrolledCoursesCount: 0,
    averageProgress: 0,
    completedLessonsCount: 0,
    completedQuizzesCount: 0,
    writingSubmissionsCount: 0,
    speakingSubmissionsCount: 0,
  };

  const attendance = data?.attendanceSummary || {
    totalSessions: 0,
    present: 0,
    late: 0,
    absent: 0,
  };

  const attendanceRate =
    attendance.totalSessions > 0
      ? Math.round((attendance.present / attendance.totalSessions) * 100)
      : 100;

  const activeCourse = data?.recentCourses?.[0] || null;

  const latestSpeaking = data?.recentSpeaking?.[0];
  const latestWriting = data?.recentWriting?.[0];
  const upcomingClass = data?.upcomingClassrooms?.[0];
  const targetRoomName = upcomingClass?.name || upcomingClass?.id;
  const targetRoomUrl = targetRoomName
    ? `/student/classroom/${encodeURIComponent(targetRoomName)}`
    : '/student/classroom';

  return (
    <div className="space-y-6 select-none">
      {/* 1. Live Class Notification Banner (1-Touch Quick Join) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#153a68] via-[#1B64B0] to-[#257ad4] text-white p-6 sm:p-7 shadow-xl shadow-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-[10.5px] font-black uppercase tracking-wider shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              {upcomingClass ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA'}
            </span>
            <span className="text-xs text-sky-100 font-medium">
              Chào {user?.fullName || 'Học viên'} • Lớp học trực tiếp WebRTC LiveKit
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {upcomingClass?.name || 'IELTS Speaking & Discussion — Room #101'}
          </h2>

          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            Giảng viên Host: <strong className="text-white">{upcomingClass?.host?.fullName || 'Teacher Dong (IELTS 8.5)'}</strong> • Tích hợp bảng vẽ Canvas & Điểm danh tự động.
          </p>
        </div>

        <Link
          href={targetRoomUrl}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-[#FFB547] hover:bg-[#FFA726] active:scale-95 text-[#14263D] font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap"
        >
          <Video className="w-4 h-4 text-[#14263D]" />
          <span>Vào phòng học ngay (1 chạm)</span>
        </Link>
      </div>

      {/* 2. Four Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Courses */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Khóa học đang học</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {overview.enrolledCoursesCount} <span className="text-xs font-bold text-slate-400">Khóa</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${overview.averageProgress || 68}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stat 2: Quizzes passed */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Quiz đã vượt qua</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {overview.completedQuizzesCount} <span className="text-xs font-bold text-slate-400">bài thi</span>
            </div>
            <p className="text-[11px] text-muted mt-1">Sàn điểm đạt chuẩn &ge; 80%</p>
          </div>
        </div>

        {/* Stat 3: Target Band / Adaptive Skill Competency Index */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">
              {enrolledTracks.length === 1
                ? 'Mục tiêu cá nhân'
                : metricTab === 'ielts'
                ? 'Mục tiêu Tiếng Anh'
                : metricTab === 'skills'
                ? 'Mục tiêu Kỹ Năng'
                : 'Mục tiêu Sư Phạm'}
            </span>

            {/* Toggle metric pill - only show when student has multiple tracks */}
            {enrolledTracks.length > 1 && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[9.5px] font-extrabold">
                {enrolledTracks.includes('ielts') && (
                  <button
                    type="button"
                    onClick={() => setMetricTab('ielts')}
                    className={`px-1.5 py-0.5 rounded-md transition ${
                      metricTab === 'ielts'
                        ? 'bg-white text-amber-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Anh ngữ
                  </button>
                )}
                {enrolledTracks.includes('skills') && (
                  <button
                    type="button"
                    onClick={() => setMetricTab('skills')}
                    className={`px-1.5 py-0.5 rounded-md transition ${
                      metricTab === 'skills'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Kỹ năng
                  </button>
                )}
                {enrolledTracks.includes('pedagogy') && (
                  <button
                    type="button"
                    onClick={() => setMetricTab('pedagogy')}
                    className={`px-1.5 py-0.5 rounded-md transition ${
                      metricTab === 'pedagogy'
                        ? 'bg-white text-sky-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Sư phạm
                  </button>
                )}
              </div>
            )}
          </div>
          <div>
            {metricTab === 'ielts' && (
              <>
                <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
                  Band {latestSpeaking?.overallBand ? latestSpeaking.overallBand.toFixed(1) : '7.0+'}
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Mục tiêu cá nhân: <strong className="text-amber-600">Band 7.5+ IELTS</strong>
                </p>
              </>
            )}
            {metricTab === 'skills' && (
              <>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                  92/100
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Mục tiêu cá nhân: <strong className="text-emerald-700">Tích lũy &ge; 90đ (Xuất Sắc ⭐)</strong>
                </p>
              </>
            )}
            {metricTab === 'pedagogy' && (
              <>
                <div className="text-2xl sm:text-3xl font-black text-sky-600 tracking-tight">
                  4/5 Modul
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Mục tiêu cá nhân: <strong className="text-sky-700">Chứng chỉ Giỏi ⭐</strong>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stat 4: Attendance */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Chuyên cần WebRTC</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
              {attendanceRate}%
            </div>
            <p className="text-[11px] text-muted mt-1">{attendance.present}/{attendance.totalSessions} buổi đúng giờ (PRESENT)</p>
          </div>
        </div>
      </div>

      {/* 2.5. Multi-Skill Goals Tracking Banner - dynamically filtered to student's enrolled track(s) */}
      <div className="bg-white rounded-3xl border border-line p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-primary flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                {enrolledTracks.length === 1 ? 'Mục Tiêu Cá Nhân Của Bạn' : 'Mục Tiêu Cá Nhân Theo Nhóm Kỹ Năng'}
              </h3>
              <p className="text-[11px] text-muted">
                {enrolledTracks.length === 1
                  ? 'Theo dõi chỉ số tích lũy và mục tiêu hoàn thành lộ trình bạn đang học.'
                  : 'Theo dõi mục tiêu và chỉ số tích lũy cho toàn bộ các lộ trình bạn đang học tại Academy.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-100 self-start sm:self-auto">
            {enrolledTracks.length === 1 ? 'Lộ Trình Đang Học' : `${enrolledTracks.length} Lộ Trình Đang Học`}
          </span>
        </div>

        <div className={`grid gap-4 ${
          enrolledTracks.length === 1
            ? 'grid-cols-1 max-w-xl'
            : enrolledTracks.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {/* Track 1: Tiếng Anh & IELTS */}
          {enrolledTracks.includes('ielts') && (
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tiếng Anh & IELTS</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-800">
                  Hiện tại: Band {latestSpeaking?.overallBand ? latestSpeaking.overallBand.toFixed(1) : '7.0'}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Mục tiêu cá nhân:</p>
                <p className="text-sm font-black text-amber-700 mt-0.5">
                  Target Band 7.5+ Academic
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Tiến độ hoàn thành</span>
                  <span className="text-amber-700 font-extrabold">88%</span>
                </div>
                <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Track 2: Kỹ Năng Mềm & Sống */}
          {enrolledTracks.includes('skills') && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kỹ Năng Mềm & Sống</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800">
                  Hiện tại: 92/100đ
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Mục tiêu cá nhân:</p>
                <p className="text-sm font-black text-emerald-700 mt-0.5">
                  Tích lũy &ge; 90đ (Xuất Sắc ⭐)
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Tiến độ hoàn thành</span>
                  <span className="text-emerald-700 font-extrabold">92%</span>
                </div>
                <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Track 3: Sư Phạm & Giảng Dạy EdTech */}
          {enrolledTracks.includes('pedagogy') && (
            <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>Sư Phạm & Nghiệp Vụ</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100/90 text-sky-800">
                  Hiện tại: 4/5 Chuyên đề
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Mục tiêu cá nhân:</p>
                <p className="text-sm font-black text-sky-700 mt-0.5">
                  Chứng chỉ Sư Phạm Xuất Sắc ⭐
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Tiến độ hoàn thành</span>
                  <span className="text-sky-700 font-extrabold">80%</span>
                </div>
                <div className="w-full bg-sky-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Active Course & Studios */}
        <div className="space-y-6">
          {/* Active Course Card (from Mockup) */}
          {activeCourse ? (
            <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Khóa học đang tiếp tục</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-[#1B64B0] text-[10.5px] font-black uppercase">
                  {activeCourse.category || 'ACADEMIC'}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {activeCourse.title}
                </h3>
                <p className="text-xs text-muted mt-1">
                  Lộ trình học tập trực tuyến tích hợp bài giảng và studio luyện tập.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Tiến độ hoàn thành khóa học</span>
                  <span className="text-primary font-black">{activeCourse.progressPercent ?? 0}%</span>
                </div>
                <div className="w-full bg-[#E1EBF5] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-400 to-[#1B64B0] h-full rounded-full transition-all duration-500"
                    style={{ width: `${activeCourse.progressPercent ?? 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link
                  href="/student/courses"
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Tiếp tục bài học</span>
                </Link>
                <Link
                  href="/student/library"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tài liệu bài học</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Khóa học của bạn</span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                Bạn chưa kích hoạt khóa học nào
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Khám phá ngay danh mục các khóa học IELTS, Tiếng Anh Giao Tiếp và Kỹ Năng Sống tại Academy để bắt đầu lộ trình.
              </p>
              <div className="pt-2">
                <Link
                  href="/student/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition"
                >
                  <span>Khám phá khóa học ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Access to Learning Hubs & Studios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/student/ielts"
              className="p-4 rounded-2xl bg-white border border-line hover:border-sky-300 shadow-xs transition space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-sky-600 transition">
                  IELTS 4 Kỹ Năng
                </h4>
                <p className="text-[11px] text-muted mt-0.5 line-clamp-2">
                  Nghe • Đọc • Viết AI • Nói Studio kèm chẩn đoán dạng bài.
                </p>
              </div>
            </Link>

            <Link
              href="/student/writing"
              className="p-4 rounded-2xl bg-white border border-line hover:border-purple-300 shadow-xs transition space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-600 transition">
                  AI Writing Studio
                </h4>
                <p className="text-[11px] text-muted mt-0.5 line-clamp-2">
                  Đếm từ thời gian thực, AI chấm 4 tiêu chí TR, CC, LR, GRA.
                </p>
              </div>
            </Link>

            <Link
              href="/student/courses"
              className="p-4 rounded-2xl bg-white border border-line hover:border-emerald-300 shadow-xs transition space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition">
                  Lộ Trình & Khóa Học
                </h4>
                <p className="text-[11px] text-muted mt-0.5 line-clamp-2">
                  Tiếng Anh, Kỹ Năng Sống, Kỹ Năng Mềm & Sư Phạm.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Pending Tasks & Teacher Feedback */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Nhiệm vụ & Phản hồi giảng viên</span>
              </h3>
            </div>

            <div className="space-y-3">
              {/* Task 1: Writing Task Pending */}
              <div className="p-4 rounded-2xl bg-[#F7FAFD] border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {latestWriting?.prompt?.title || 'Bài viết IELTS Writing Task 2'}
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Hạn nộp: <strong className="text-slate-700">Tối nay 23:59</strong> • {latestWriting?.overallScore ? `Band ${latestWriting.overallScore}` : 'Trí tuệ nhân tạo & Giáo dục'}
                  </p>
                </div>
                <Link
                  href="/student/writing"
                  className="px-3.5 py-1.5 rounded-xl bg-[#FFB547] hover:bg-[#FFA726] text-[#14263D] font-bold text-xs self-start sm:self-auto transition shadow-xs text-center"
                >
                  {latestWriting?.overallScore ? 'Xem bài viết' : 'Làm bài AI'}
                </Link>
              </div>

              {/* Feedback 2: Speaking Audio Feedback */}
              <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#FFE4B5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#b26a00]">
                    Phản hồi Speaking Part 2 từ Teacher Dong
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                    {latestSpeaking?.overallBand ? `BAND ${latestSpeaking.overallBand.toFixed(1)}` : 'BAND 7.5'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  &ldquo;{latestSpeaking?.adminFeedback || 'Ngữ điệu rất tự nhiên, phát âm rõ ràng. Thầy đã để lại 3 ghi chú chi tiết tại các mốc thời gian trong audio.'}&rdquo;
                </p>
                <div className="pt-1">
                  <Link
                    href="/student/speaking"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Nghe nhận xét âm thanh →</span>
                  </Link>
                </div>
              </div>

              {/* Checkpoint Quiz */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Quiz Checkpoint: Speaking Fluency Rules
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Đạt &ge; 80% để tự động mở khóa Module bài học kế tiếp.
                  </p>
                </div>
                <Link
                  href="/student/quizzes"
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs self-start sm:self-auto transition shadow-xs text-center"
                >
                  Làm Quiz
                </Link>
              </div>
            </div>
          </div>

          {/* Secured Library Highlight */}
          <div className="bg-white rounded-3xl border border-line p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Học Liệu Mới Được Phát Hành
            </h3>
            <Link
              href="/student/library"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between text-xs font-semibold text-slate-800 group"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="truncate">Cambridge IELTS 18 Academic Vocabulary & Model Essays (PDF)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
