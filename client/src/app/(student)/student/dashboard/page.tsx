'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { dashboardService, StudentDashboardData } from '@/services/dashboard.service';
import {
  BookOpen,
  Video,
  PenTool,
  Mic,
  CheckCircle2,
  ArrowRight,
  FileText,
  Play,
  Award,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);

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

  // Compute stats with fallback
  const overview = data?.overview || {
    enrolledCoursesCount: 1,
    averageProgress: 68,
    completedLessonsCount: 8,
    completedQuizzesCount: 4,
    writingSubmissionsCount: 2,
    speakingSubmissionsCount: 3,
  };

  const attendance = data?.attendanceSummary || {
    totalSessions: 12,
    present: 11,
    late: 1,
    absent: 0,
  };

  const attendanceRate =
    attendance.totalSessions > 0
      ? Math.round((attendance.present / attendance.totalSessions) * 100)
      : 95;

  const activeCourse = data?.recentCourses?.[0] || {
    id: 'course-1',
    title: 'IELTS Intensive 6.5 -> 7.5+ Masterclass',
    slug: 'ielts-masterclass-band-7',
    category: 'IELTS INTENSIVE',
    progressPercent: 68,
  };

  const latestSpeaking = data?.recentSpeaking?.[0];
  const latestWriting = data?.recentWriting?.[0];
  const upcomingClass = data?.upcomingClassrooms?.[0];

  return (
    <div className="space-y-6 select-none">
      {/* 1. Live Class Notification Banner (1-Touch Quick Join) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#153a68] via-[#1B64B0] to-[#257ad4] text-white p-6 sm:p-7 shadow-xl shadow-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-[10.5px] font-black uppercase tracking-wider shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              ĐANG DIỄN RA
            </span>
            <span className="text-xs text-sky-100 font-medium">
              Chào {user?.fullName || 'Học viên'} • Lớp học trực tiếp WebRTC LiveKit
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {upcomingClass?.name || 'IELTS Speaking & Discussion — Room #101'}
          </h2>

          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            Giảng viên Host: <strong className="text-white">Teacher Dong (IELTS 8.5)</strong> • Tích hợp bảng vẽ Canvas & Điểm danh tự động.
          </p>
        </div>

        <Link
          href={upcomingClass?.roomName ? `/student/classroom/${upcomingClass.roomName}` : '/student/classroom'}
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

        {/* Stat 3: Target Band */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Điểm IELTS ước tính</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              Band {latestSpeaking?.overallBand ? latestSpeaking.overallBand.toFixed(1) : '7.0+'}
            </div>
            <p className="text-[11px] text-muted mt-1">Mục tiêu cá nhân: <strong>7.5+</strong></p>
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

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Active Course & Studios */}
        <div className="space-y-6">
          {/* Active Course Card (from Mockup) */}
          <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Khóa học đang tiếp tục</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-[#1B64B0] text-[10.5px] font-black uppercase">
                {activeCourse.category || 'IELTS INTENSIVE'}
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {activeCourse.title}
              </h3>
              <p className="text-xs text-muted mt-1">
                Bài học tiếp theo: <strong className="text-slate-700">Unit 4 — Advanced Cohesion & Lexical Upgrade</strong>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Tiến độ hoàn thành khóa học</span>
                <span className="text-primary font-black">{activeCourse.progressPercent || 68}%</span>
              </div>
              <div className="w-full bg-[#E1EBF5] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-400 to-[#1B64B0] h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeCourse.progressPercent || 68}%` }}
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

          {/* Quick Access to Skills Studios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/student/writing"
              className="p-5 rounded-3xl bg-white border border-line hover:border-purple-300 shadow-xs transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition">
                  AI IELTS Writing Studio
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Luyện viết Task 1 & 2 với đếm từ thời gian thực và AI Gemini chấm tức thì 4 tiêu chí.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-purple-600 pt-1">
                <span>Vào phòng viết bài</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/student/speaking"
              className="p-5 rounded-3xl bg-white border border-line hover:border-amber-300 shadow-xs transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">
                  IELTS Speaking Studio
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Ghi âm giọng nói với sóng âm Web Audio API, Thầy Đông chấm 4 tiêu chí kèm timestamp.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-amber-600 pt-1">
                <span>Vào phòng thu âm</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
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
