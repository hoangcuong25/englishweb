'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardService, AdminDashboardData } from '@/services/dashboard.service';
import {
  Users,
  FileCheck,
  Headphones,
  BookOpen,
  Calendar,
  ArrowRight,
  TrendingUp,
  Download,
  Crown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      }
    };
    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {
    totalStudents: 128,
    totalCourses: 6,
    totalLessons: 48,
    totalClassrooms: 14,
    totalWritingSubmissions: 35,
    totalSpeakingSubmissions: 28,
  };

  const actionItems = data?.actionItems || {
    pendingWritingApprovals: 5,
    pendingSpeakingGradings: 8,
  };

  const attendance = data?.attendanceOverview || {
    totalRecords: 128,
    presentCount: 112,
    lateCount: 11,
    absentCount: 5,
    presentRate: 88,
    lateRate: 8,
    absentRate: 4,
  };

  const totalPending = actionItems.pendingWritingApprovals + actionItems.pendingSpeakingGradings;

  return (
    <div className="space-y-6 select-none">
      {/* 1. Admin Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#11243B] via-[#1B64B0] to-[#257ad4] text-white p-6 sm:p-8 shadow-xl shadow-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB547] text-[#14263D] text-[10.5px] font-black uppercase tracking-wider shadow-sm">
            <Crown className="w-3.5 h-3.5" />
            <span>ADMINISTRATION • Quản trị & Giảng dạy trực tuyến</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            Chào mừng trở lại, Teacher Dong!
          </h1>

          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            Hệ thống đang phục vụ <strong className="text-white">{metrics.totalStudents} học viên</strong> đang hoạt động. Bạn có <strong className="text-[#FFB547]">{actionItems.pendingWritingApprovals} bài Writing</strong> chờ duyệt và <strong className="text-[#FFB547]">{actionItems.pendingSpeakingGradings} bài Speaking</strong> cần chấm điểm.
          </p>
        </div>

        <Link
          href="/admin/classroom"
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-[#FFB547] hover:bg-[#FFA726] active:scale-95 text-[#14263D] font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap"
        >
          <Crown className="w-4 h-4 text-[#14263D]" />
          <span>Mở phòng học LiveKit với quyền Host</span>
        </Link>
      </div>

      {/* 2. Four Operational Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Students */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Tổng học viên Active</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalStudents} <span className="text-xs font-bold text-slate-400">học viên</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12 học viên mới tuần này
            </p>
          </div>
        </div>

        {/* Stat 2: Total Courses */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Khóa học & Giáo trình</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalCourses} <span className="text-xs font-bold text-slate-400">khóa</span>
            </div>
            <p className="text-[11px] text-muted mt-1">{metrics.totalLessons || 48} bài học đa phương tiện</p>
          </div>
        </div>

        {/* Stat 3: Writing Pending */}
        <Link
          href="/admin/writing-review"
          className="p-5 rounded-3xl bg-white border border-line hover:border-purple-300 shadow-xs transition space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Bài Writing chờ duyệt</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
              {actionItems.pendingWritingApprovals} <span className="text-xs font-bold text-slate-400">bài</span>
            </div>
            <span className="text-[11px] text-primary font-bold hover:underline mt-1 inline-flex items-center gap-1">
              <span>Xem & Duyệt bài ngay</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Stat 4: Speaking Pending */}
        <Link
          href="/admin/speaking-grading"
          className="p-5 rounded-3xl bg-white border border-line hover:border-amber-300 shadow-xs transition space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Bài Speaking chờ chấm</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {actionItems.pendingSpeakingGradings} <span className="text-xs font-bold text-slate-400">bài</span>
            </div>
            <span className="text-[11px] text-amber-600 font-bold hover:underline mt-1 inline-flex items-center gap-1">
              <span>Vào phòng chấm audio</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Main Grid: Action Queue & LiveKit Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Submissions Queue */}
        <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Hàng Đợi Bài Nộp Cần Xử Lý
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-black uppercase">
              {totalPending} BÀI CHỜ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5">Học viên</th>
                  <th className="pb-2.5">Phân hệ</th>
                  <th className="pb-2.5">Thời gian</th>
                  <th className="pb-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs font-semibold text-slate-700">
                {/* Item 1 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3">
                    <span className="font-bold text-slate-900">Nguyễn Văn An</span>
                    <span className="block text-[10.5px] text-muted font-normal">an.nguyen@dong.edu.vn</span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10.5px]">
                      Writing AI Task 2
                    </span>
                  </td>
                  <td className="py-3 text-muted text-[11px]">10 phút trước</td>
                  <td className="py-3 text-right">
                    <Link
                      href="/admin/writing-review"
                      className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-[11px] transition shadow-xs"
                    >
                      Duyệt bài
                    </Link>
                  </td>
                </tr>

                {/* Item 2 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3">
                    <span className="font-bold text-slate-900">Trần Thị Mai</span>
                    <span className="block text-[10.5px] text-muted font-normal">mai.tran@dong.edu.vn</span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10.5px]">
                      Speaking Part 2
                    </span>
                  </td>
                  <td className="py-3 text-muted text-[11px]">25 phút trước</td>
                  <td className="py-3 text-right">
                    <Link
                      href="/admin/speaking-grading"
                      className="px-3 py-1.5 rounded-xl bg-[#FFB547] hover:bg-[#FFA726] text-[#14263D] font-bold text-[11px] transition shadow-xs"
                    >
                      Chấm audio
                    </Link>
                  </td>
                </tr>

                {/* Item 3 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3">
                    <span className="font-bold text-slate-900">Lê Quốc Hoàng</span>
                    <span className="block text-[10.5px] text-muted font-normal">hoang.le@dong.edu.vn</span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10.5px]">
                      Writing Task 1
                    </span>
                  </td>
                  <td className="py-3 text-muted text-[11px]">1 giờ trước</td>
                  <td className="py-3 text-right">
                    <Link
                      href="/admin/writing-review"
                      className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-[11px] transition shadow-xs"
                    >
                      Duyệt bài
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: LiveKit Attendance Overview Widget (from Mockup) */}
        <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Chuyên Cần Phòng Học LiveKit Tuần Này
              </h3>
            </div>
            <Link
              href="/admin/attendance"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel (.xlsx)</span>
            </Link>
          </div>

          {/* Donut / Percentage Metric */}
          <div className="flex items-center gap-5 pt-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#1B64B0] to-sky-400 text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              {attendance.presentRate}%
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                Tỷ lệ học viên tham gia đúng giờ
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Dữ liệu đồng bộ tự động qua LiveKit Webhook. Học viên học &ge; 80% thời lượng tính trạng thái <strong className="text-slate-700">PRESENT</strong>.
              </p>
            </div>
          </div>

          {/* Breakdown Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Có mặt (PRESENT &ge;80%):</span>
              </span>
              <strong className="text-emerald-600 font-black">
                {attendance.presentCount} lượt ({attendance.presentRate}%)
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Đi muộn (LATE &gt;15 phút):</span>
              </span>
              <strong className="text-amber-600 font-black">
                {attendance.lateCount} lượt ({attendance.lateRate}%)
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Vắng mặt (ABSENT &lt;30%):</span>
              </span>
              <strong className="text-red-600 font-black">
                {attendance.absentCount} lượt ({attendance.absentRate}%)
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Direct Management Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/attendance"
          className="p-5 rounded-3xl bg-white border border-line hover:border-emerald-300 shadow-xs transition space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition">
            Báo Cáo Điểm Danh
          </h4>
          <p className="text-[11px] text-muted">
            Kiểm soát phút học và xuất file Excel (.xlsx) chuẩn kiểm toán.
          </p>
        </Link>

        <Link
          href="/admin/library"
          className="p-5 rounded-3xl bg-white border border-line hover:border-sky-300 shadow-xs transition space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition">
            Quản Lý Học Liệu Số
          </h4>
          <p className="text-[11px] text-muted">
            Cấp URL ký số 15 phút & Watermark canvas bảo mật chống leak.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="p-5 rounded-3xl bg-white border border-line hover:border-purple-300 shadow-xs transition space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition">
            Quản Lý Học Viên
          </h4>
          <p className="text-[11px] text-muted">
            Phân quyền RBAC nghiêm ngặt và kiểm soát cơ chế phiên đăng nhập đơn.
          </p>
        </Link>
      </div>
    </div>
  );
}
