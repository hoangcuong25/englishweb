'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
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
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-deep via-primary to-primary-dark text-white p-6 sm:p-8 shadow-lg shadow-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-bold">
            <span>🎓 Cổng Học Viên Chính Thức</span>
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
            <span className="text-xs font-semibold text-muted">Tiến độ khóa học</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">68%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Chuyên cần LiveKit</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">95.4%</p>
          <p className="text-[11px] text-muted mt-1">21/22 buổi đúng giờ (PRESENT)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Writing Band gần nhất</span>
            <PenTool className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">7.0</p>
          <p className="text-[11px] text-muted mt-1">Task 2 • Thầy Đông đã duyệt</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Speaking Band gần nhất</span>
            <Mic className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-500 mt-2">7.5</p>
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
              className="p-5 rounded-2xl bg-white border border-line hover:border-purple-300 shadow-sm transition group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">IELTS Writing Studio</h4>
                  <span className="text-[11px] text-purple-600 font-semibold">Tích hợp AI chấm 4 tiêu chí</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Đếm từ thời gian thực, đồng hồ 40 phút và nhận phản hồi chi tiết TR, CC, LR, GRA.
              </p>
            </Link>

            <Link
              href="/student/speaking"
              className="p-5 rounded-2xl bg-white border border-line hover:border-sky-300 shadow-sm transition group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-primary flex items-center justify-center group-hover:scale-105 transition">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">IELTS Speaking Studio</h4>
                  <span className="text-[11px] text-primary font-semibold">Thầy Đông chấm thủ công 100%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Ghi âm sóng âm Web Audio API và nhận xét ghim theo mốc thời gian audio (Timestamp).
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column: Pending Tasks & Library Highlights */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Việc Cần Hoàn Thành</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1">
                <p className="font-bold text-slate-800">Nộp bài Writing Task 2 #W-104</p>
                <p className="text-[11px] text-muted">Hạn chót: 23:59 ngày mai</p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-200/60 text-xs space-y-1">
                <p className="font-bold text-slate-800">Làm Quiz Checkpoint Module 03</p>
                <p className="text-[11px] text-muted">Đạt $\ge 70\%$ để mở khóa Module 04</p>
              </div>
            </div>
          </div>

          {/* Secured Library Widget */}
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Kho Học Liệu Mới Nhất</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tài liệu được bảo vệ bằng Signed URL 15 phút và Dynamic Watermark chống quay chụp.
            </p>
            <Link
              href="/student/library"
              className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <span>Xem Thư Viện Tài Liệu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
