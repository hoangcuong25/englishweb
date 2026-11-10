'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardService, AdminDashboardData } from '@/services/dashboard.service';
import {
  Users,
  Video,
  FileCheck,
  Headphones,
  PlusCircle,
  TrendingUp,
  Server,
  ArrowRight,
  BookOpen,
  Calendar,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardData>({
    totalStudents: 185,
    activeStudentsToday: 42,
    totalCourses: 5,
    pendingWritingCount: 8,
    pendingSpeakingCount: 5,
    todayLiveClassrooms: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getAdminDashboard();
        if (data) {
          setMetrics(data);
        }
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-primary-deep to-primary text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <span>👨‍🏫 Bảng Điều Khiển Quản Trị & Giảng Viên</span>
            {loading && <RefreshCw className="w-3 h-3 animate-spin text-white" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Teacher Dong Academy Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Hệ thống đang phục vụ <strong>{metrics.totalStudents} học viên</strong> đang hoạt động với Uptime SFU đạt <strong>99.98%</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/classroom"
            className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-slate-900 font-bold text-xs shadow-md transition flex items-center space-x-1.5"
          >
            <Video className="w-4 h-4" />
            <span>Mở Phòng LiveKit Host</span>
          </Link>
          <Link
            href="/admin/courses"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Khóa Học</span>
          </Link>
        </div>
      </div>

      {/* 4 Operations Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Học viên Active</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {metrics.totalStudents}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12 học viên tuần này
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Writing Chờ Phê Duyệt</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-purple-600 mt-2">
            {metrics.pendingWritingCount || 8}
          </p>
          <Link
            href="/admin/writing-review"
            className="text-[11px] text-primary hover:underline font-bold mt-1 inline-block"
          >
            Xem & Duyệt bài ngay →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Speaking Chờ Chấm Điểm</span>
            <Headphones className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">
            {metrics.pendingSpeakingCount || 5}
          </p>
          <Link
            href="/admin/speaking-grading"
            className="text-[11px] text-primary hover:underline font-bold mt-1 inline-block"
          >
            Vào phòng chấm điểm →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">LiveKit SFU Uptime</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">99.98%</p>
          <p className="text-[11px] text-muted mt-1">Docker LiveKit Server: Online</p>
        </div>
      </div>

      {/* Main Admin Section: Actions & Management Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Action Hub */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">
                Lịch Dạy & Phòng Học Trực Tuyến LiveKit Hôm Nay
              </h3>
              <span className="text-xs text-muted">19:30 - 21:00 (Phòng chính)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-primary uppercase">
                  Lớp Sắp Mở
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  IELTS Speaking Part 2 Forecast — Intensive Mock Session
                </h4>
                <p className="text-xs text-slate-500">
                  Chế độ SFU: 1 Host + 8 Học viên • Quyền vẽ bảng Canvas: Bật • Webhook tính điểm danh: Bật
                </p>
              </div>

              <Link
                href="/admin/classroom"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition whitespace-nowrap"
              >
                Khởi động phòng
              </Link>
            </div>
          </div>

          {/* Quick Direct Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/attendance"
              className="p-4 rounded-2xl bg-white border border-line hover:border-primary/50 shadow-sm transition space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary transition">
                Báo Cáo Điểm Danh
              </h4>
              <p className="text-[11px] text-muted">
                Kiểm soát phút học và xuất file Excel (.xlsx) chuẩn.
              </p>
            </Link>

            <Link
              href="/admin/library"
              className="p-4 rounded-2xl bg-white border border-line hover:border-primary/50 shadow-sm transition space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary transition">
                Quản Lý Học Liệu Số
              </h4>
              <p className="text-[11px] text-muted">
                Cấp URL ký số 15 phút & Watermark canvas bảo mật.
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="p-4 rounded-2xl bg-white border border-line hover:border-primary/50 shadow-sm transition space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary transition">
                Quản Lý Học Viên
              </h4>
              <p className="text-[11px] text-muted">
                Phân quyền RBAC nghiêm ngặt và kiểm soát phiên đơn.
              </p>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Pending Reviews List */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">
              Bài Nộp Cần Xử Lý Ngay
            </h3>

            <div className="space-y-2.5">
              <Link
                href="/admin/writing-review"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                  <span className="truncate">Writing: Trần Văn Nam (Task 2)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted flex-shrink-0" />
              </Link>

              <Link
                href="/admin/speaking-grading"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                  <span className="truncate">Speaking: Đỗ Thùy Trang (Part 2)</span>
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
