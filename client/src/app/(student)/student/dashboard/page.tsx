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
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StudentDashboardData>({
    enrolledCoursesCount: 1,
    averageWritingScore: 7.0,
    averageSpeakingScore: 7.5,
    quizzesCompletedCount: 4,
    attendanceRate: 95.4,
    upcomingClassrooms: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getStudentDashboard();
        if (data) {
          setMetrics(data);
        }
      } catch {
        // Fallback default metrics
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-deep via-primary to-primary-dark text-white p-6 sm:p-8 shadow-lg shadow-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-bold">
            <span>🎓 Cổng Học Viên Chính Thức</span>
            {loading && <RefreshCw className="w-3 h-3 animate-spin text-white" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng trở lại, {user?.fullName || 'Học viên'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Mục tiêu của bạn là <strong>IELTS Band 7.5+</strong>. Hãy tiếp tục hoàn thành bài tập Writing và tham gia buổi học LiveKit tối nay nhé.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/student/classroom"
            className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-dark text-slate-900 font-bold text-xs shadow-md shadow-accent/20 flex items-center justify-center space-x-2 transition"
          >
            <Video className="w-4 h-4" />
            <span>Vào Lớp Trực Tuyến LiveKit</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Khóa học ghi danh</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics.enrolledCoursesCount || 1} Khóa
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Chuyên cần LiveKit</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">
            {metrics.attendanceRate || 95.4}%
          </p>
          <p className="text-[11px] text-muted mt-1">Buổi học đúng giờ (PRESENT)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Writing Band gần nhất</span>
            <PenTool className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">
            {metrics.averageWritingScore ? metrics.averageWritingScore.toFixed(1) : '7.0'}
          </p>
          <p className="text-[11px] text-muted mt-1">Task 2 • Thầy Đông đã duyệt</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Speaking Band gần nhất</span>
            <Mic className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-500 mt-2">
            {metrics.averageSpeakingScore ? metrics.averageSpeakingScore.toFixed(1) : '7.5'}
          </p>
          <p className="text-[11px] text-muted mt-1">Part 2 • 3 mốc nhận xét audio</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Classes & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming LiveKit Room & Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming WebRTC Classroom Card */}
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-primary flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Lớp Học Trực Tuyến Hôm Nay</h3>
                  <p className="text-[11px] text-muted">Phòng học LiveKit SFU 1 Host + 8 SV</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2.5 py-1 rounded-full animate-pulse">
                SẮP DIỄN RA
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  IELTS Speaking Part 2 Forecast — Intensive Mock Session
                </h4>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-primary">
                  <Clock className="w-3.5 h-3.5" />
                  <span>19:30 - 21:00 (Tối nay)</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Chủ tọa: <strong>Thầy Đông (IELTS 8.5)</strong> • Học viên tham gia: 8/8 người • Tích hợp Bảng trắng WebRTC Canvas.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                  Vào trước 15 phút đầu để được tính PRESENT
                </span>
                <Link
                  href="/student/classroom"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-sm"
                >
                  Tham gia phòng học
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Access to Skills Studios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/student/writing"
              className="p-5 rounded-2xl bg-white border border-line hover:border-primary/50 shadow-sm transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition">
                  AI IELTS Writing Studio
                </h4>
                <p className="text-xs text-muted mt-1">
                  Luyện viết Task 1 & 2 với bộ đếm từ và chấm tức thì bởi AI Google Gemini.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-primary pt-1">
                <span>Vào phòng viết</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/student/speaking"
              className="p-5 rounded-2xl bg-white border border-line hover:border-primary/50 shadow-sm transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition">
                  IELTS Speaking Studio
                </h4>
                <p className="text-xs text-muted mt-1">
                  Thu âm giọng nói với sóng âm thời gian thực, Thầy Đông trực tiếp chấm 4 tiêu chí.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-primary pt-1">
                <span>Vào phòng thu âm</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Pending Actions & Notices */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Nhiệm Vụ Cần Hoàn Thành
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Bài tập Writing Task 2 đang chờ nộp</span>
                </div>
                <p className="text-slate-600">
                  Chủ đề: &ldquo;University Education: Free vs Tuition Fees&rdquo; — Hạn nộp 23:59 hôm nay.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-primary">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Quiz Checkpoint 03 đã mở</span>
                </div>
                <p className="text-slate-600">
                  Đạt sàn ≥ 80% để tự động mở khóa Module 04 tiếp theo.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Học Liệu Mới Được Cập Nhật
            </h3>
            <div className="space-y-2">
              <Link
                href="/student/library"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="truncate">IELTS Writing Task 2 Master Vocabulary (PDF)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
