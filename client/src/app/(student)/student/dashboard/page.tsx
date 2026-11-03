'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, Video, Mic, CheckCircle2, Clock, LogOut, PlayCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-sky-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center shadow-sm">
              EL
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg">EnglishHub</span>
              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full ml-2 font-medium">Học Viên</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.fullName || 'Học viên'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 text-white p-6 sm:p-8 shadow-lg shadow-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              Khóa học đang hoạt động
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Chào mừng trở lại, {user?.fullName}!</h1>
            <p className="text-sky-100 text-sm leading-relaxed">
              Buổi học trực tuyến tiếp theo sẽ diễn ra lúc 19:30 tối nay. Bạn đã sẵn sàng tham gia lớp WebRTC cùng giảng viên chưa?
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/student/classroom/ielts-speaking-live"
              className="px-6 py-3 bg-white text-sky-700 hover:bg-sky-50 font-bold rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Video className="w-5 h-5 text-sky-600" />
              <span>Vào Lớp Trực Tuyến Ngay</span>
            </Link>
          </div>
        </div>

        {/* Learning Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Khóa học ghi danh</p>
              <p className="text-2xl font-bold text-slate-800">1 Khóa</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Bài tập hoàn thành</p>
              <p className="text-2xl font-bold text-slate-800">4 / 12</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Bài Speaking đã nộp</p>
              <p className="text-2xl font-bold text-slate-800">2 Bài</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Thời gian học thực tế</p>
              <p className="text-2xl font-bold text-slate-800">320 Phút</p>
            </div>
          </div>
        </div>

        {/* Current Enrolled Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Lộ Trình Học Của Bạn</h2>
            <span className="text-xs text-sky-600 font-semibold cursor-pointer">Xem tất cả giáo trình →</span>
          </div>

          <div className="bg-white rounded-2xl border border-sky-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                  IELTS MASTERCLASS
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">
                  IELTS Comprehensive Masterclass (Target 7.0+)
                </h3>
                <p className="text-sm text-slate-500 mt-1">Giáo trình: Cambridge IELTS 18 & Mindset for IELTS Level 3</p>
              </div>

              <div className="w-full sm:w-48 text-right">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Tiến độ</span>
                  <span className="text-sky-600 font-bold">25%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>

            {/* Lesson Quick List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PlayCircle className="w-6 h-6 text-sky-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Lesson 1: Introduction to IELTS Speaking Part 1</h4>
                    <p className="text-xs text-slate-500">Video bài giảng + PDF Mindset + Trắc nghiệm</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Mở trình đọc tài liệu PDF và video bài giảng')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Học bài
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mic className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Speaking Practice: Hometown & Family</h4>
                    <p className="text-xs text-slate-500">Thu âm trực tiếp trên web bằng MediaRecorder</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Mở giao diện phòng thu âm Speaking')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Thu âm
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
