'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { dashboardService, AdminDashboardData } from '@/services/dashboard.service';
import { coursesService, Course, CourseEnrollment } from '@/services/courses.service';
import {
  Users,
  FileCheck,
  BookOpen,
  Calendar,
  ArrowRight,
  TrendingUp,
  Download,
  Crown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Video,
  FileText,
  Sparkles,
  CreditCard,
  Layers,
  GraduationCap,
  Briefcase,
  Baby,
  Compass,
  Languages,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<CourseEnrollment[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, coursesRes, enrollRes] = await Promise.all([
          dashboardService.getAdminDashboard(),
          coursesService.getCourses(),
          coursesService.getAdminEnrollments('PENDING'),
        ]);

        if (dashRes) setData(dashRes);
        if (Array.isArray(coursesRes)) setCourses(coursesRes);
        if (Array.isArray(enrollRes)) setPendingEnrollments(enrollRes);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {
    totalStudents: 0,
    totalCourses: courses.length || 0,
    totalLessons: 0,
    totalClassrooms: 0,
    totalWritingSubmissions: 0,
    totalSpeakingSubmissions: 0,
  };

  const actionItems = data?.actionItems || {
    pendingWritingApprovals: 0,
    pendingSpeakingGradings: 0,
  };

  const attendance = data?.attendanceOverview || {
    totalRecords: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    presentRate: 0,
    lateRate: 0,
    absentRate: 0,
  };

  const totalPending = actionItems.pendingWritingApprovals + actionItems.pendingSpeakingGradings;

  const writingItems = (data?.recentSubmissions?.writing || []).map((w) => ({
    id: w.id,
    type: 'WRITING' as const,
    studentName: w.user?.fullName || 'Học viên',
    email: w.user?.email || '',
    title: w.prompt?.title || 'IELTS Writing Essay',
    submittedAt: w.submittedAt,
    link: '/admin/assessments?tab=writing',
    badge: w.prompt?.taskType === 'TASK_1' ? 'Writing Task 1' : 'Writing AI Task 2',
    actionText: 'Duyệt bài AI',
  }));

  const speakingItems = (data?.recentSubmissions?.speaking || []).map((s) => ({
    id: s.id,
    type: 'SPEAKING' as const,
    studentName: s.user?.fullName || 'Học viên',
    email: s.user?.email || '',
    title: s.prompt?.title || 'IELTS Speaking Recording',
    submittedAt: s.submittedAt,
    link: '/admin/assessments?tab=speaking',
    badge: 'Speaking Audio',
    actionText: 'Chấm Audio',
  }));

  const combinedSubmissions = [...writingItems, ...speakingItems]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 select-none">
      {/* 1. Admin Hero Banner (Synchronized with Student Banner Styling) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#11243B] via-[#1B64B0] to-[#257ad4] text-white p-6 sm:p-7 shadow-xl shadow-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-white/10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB547] text-[#14263D] text-[10.5px] font-black uppercase tracking-wider shadow-sm">
              <Crown className="w-3.5 h-3.5" />
              <span>LIVEKIT SFU ONLINE • WEBRTC CLASSROOM</span>
            </span>
            <span className="text-xs text-sky-100 font-medium">
              Chào {user?.fullName || 'Thầy Đông (Admin Master)'} • Trung tâm điều phối học viện
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Bảng Điều Khiển Quản Trị & Đào Tạo Trực Tuyến
          </h1>

          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            Học viện đang vận hành <strong className="text-white">{metrics.totalStudents} học viên Active</strong> và{' '}
            <strong className="text-white">{metrics.totalCourses || courses.length} khóa học</strong>. Đang có{' '}
            <strong className="text-[#FFB547]">{totalPending} bài nộp</strong> chờ xử lý và{' '}
            <strong className="text-[#FFB547]">{pendingEnrollments.length} giao dịch VietQR</strong> chờ đối soát.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link
            href="/admin/classroom"
            className="px-5 py-3 rounded-2xl bg-[#FFB547] hover:bg-[#FFA726] active:scale-95 text-[#14263D] font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Video className="w-4 h-4 text-[#14263D]" />
            <span>Vào lớp LiveKit (Host)</span>
          </Link>
          <Link
            href="/admin/courses"
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Quản lý khóa học</span>
          </Link>
        </div>
      </div>

      {/* 2. Four Operational Stat Cards (Matching Student Dashboard Tokens) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Active Students */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Học viên Active</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalStudents} <span className="text-xs font-bold text-slate-400">học viên</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>Phiên Single Session bảo mật</span>
            </p>
          </div>
        </div>

        {/* Stat 2: Total Courses & Modules */}
        <div className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Khóa học & Giáo trình</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalCourses || courses.length} <span className="text-xs font-bold text-slate-400">khóa</span>
            </div>
            <p className="text-[11px] text-muted mt-1">
              {metrics.totalLessons || 'Đa dạng'} bài học & học liệu số
            </p>
          </div>
        </div>

        {/* Stat 3: Pending Assessment Items (Writing + Speaking) */}
        <Link
          href="/admin/assessments?tab=writing"
          className="p-5 rounded-3xl bg-white border border-line hover:border-purple-300 shadow-xs transition space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Bài nộp chờ xử lý</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
              {totalPending} <span className="text-xs font-bold text-slate-400">bài</span>
            </div>
            <p className="text-[11px] text-muted mt-1 flex items-center justify-between">
              <span>{actionItems.pendingWritingApprovals} Writing • {actionItems.pendingSpeakingGradings} Speaking</span>
              <ArrowRight className="w-3 h-3 text-purple-500 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Stat 4: LiveKit Attendance Rate */}
        <Link
          href="/admin/attendance"
          className="p-5 rounded-3xl bg-white border border-line hover:border-emerald-300 shadow-xs transition space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Chuyên cần WebRTC</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {attendance.presentRate}%
            </div>
            <p className="text-[11px] text-muted mt-1 flex items-center justify-between">
              <span>{attendance.presentCount}/{attendance.totalRecords} lượt PRESENT &ge;80%</span>
              <Download className="w-3 h-3 text-emerald-600" />
            </p>
          </div>
        </Link>
      </div>

      {/* 3. Phân Hệ Quản Lý Đào Tạo Nhanh - 2 PHÂN HỆ ĐỘC LẬP (Curriculum & Tracks Hub) */}
      <div className="space-y-4">
        {/* Hub Header with quick action buttons */}
        <div className="bg-white rounded-3xl border border-line p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">
                  Hệ Thống Đào Tạo 2 Phân Hệ Độc Lập
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                  {courses.length} Tổng Khóa Học
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Vận hành song song 2 lộ trình chuyên biệt: Đào tạo Tiếng Anh & IELTS và Khóa học Phát triển cá nhân, Sư phạm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/courses?action=new"
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Khóa Học Mới</span>
            </Link>
            <Link
              href="/admin/courses"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Cây Giáo Trình</span>
            </Link>
            <Link
              href="/admin/library"
              className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Kho Học Liệu Watermark</span>
            </Link>
          </div>
        </div>

        {/* 2 Track Desks Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* TRACK 1: ĐÀO TẠO TIẾNG ANH & IELTS */}
          <div className="bg-white rounded-3xl border border-sky-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-sky-300 transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                      Đào Tạo Tiếng Anh & IELTS
                    </h4>
                    <p className="text-[11px] text-muted">IELTS 4 Kỹ Năng, Giao Tiếp, Business & Kids</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 text-[10px] font-black uppercase">
                  {courses.filter((c) => ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(c.category)).length} Khóa Học
                </span>
              </div>

              {/* English Subcategory Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    category: 'IELTS',
                    label: 'IELTS 4 Kỹ Năng',
                    sub: 'Academic & General',
                    icon: BookOpen,
                  },
                  {
                    category: 'ENGLISH',
                    label: 'General English',
                    sub: 'Giao tiếp & Ngữ pháp',
                    icon: GraduationCap,
                  },
                  {
                    category: 'BUSINESS',
                    label: 'Business English',
                    sub: 'Đàm phán thương mại',
                    icon: Briefcase,
                  },
                  {
                    category: 'KIDS',
                    label: 'Kids English',
                    sub: 'Tiếng Anh thiếu nhi',
                    icon: Baby,
                  },
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  const count = courses.filter((c) => c.category === pillar.category).length;
                  return (
                    <Link
                      key={pillar.category}
                      href={`/admin/courses?category=${pillar.category}`}
                      className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-300 transition space-y-1.5 block group shadow-2xs select-none"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#1B64B0] transition-colors" />
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-sky-50 group-hover:text-[#1B64B0] px-1.5 py-0.5 rounded-md transition-colors">
                          {count} khóa
                        </span>
                      </div>
                      <div>
                        <h5 className="text-[11.5px] font-black text-slate-800 group-hover:text-[#1B64B0] leading-tight truncate transition-colors">{pillar.label}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{pillar.sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Assessment Strip */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Khảo thí IELTS trực tuyến:
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/assessments?tab=writing"
                    className="text-[10.5px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                  >
                    Writing AI ({data?.actionItems?.pendingWritingApprovals ?? 0})
                  </Link>
                  <Link
                    href="/admin/assessments?tab=speaking"
                    className="text-[10.5px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                  >
                    Speaking ({data?.actionItems?.pendingSpeakingGradings ?? 0})
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <Link
                href="/admin/courses?track=english"
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition"
              >
                <span>Vào phân hệ Tiếng Anh & IELTS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/courses?action=new&track=english"
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 transition"
              >
                + Thêm Khóa Tiếng Anh
              </Link>
            </div>
          </div>

          {/* TRACK 2: PHÁT TRIỂN CÁ NHÂN & SƯ PHẠM */}
          <div className="bg-white rounded-3xl border border-purple-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                      Phát Triển Cá Nhân & Sư Phạm
                    </h4>
                    <p className="text-[11px] text-muted">Năng Lực Sư Phạm Hiện Đại, Kỹ Năng Sống & Kỹ Năng Mềm</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-[10px] font-black uppercase">
                  {courses.filter((c) => ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category)).length} Khóa Học
                </span>
              </div>

              {/* Dev Subcategory Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    category: 'PEDAGOGY',
                    label: 'Năng Lực Sư Phạm',
                    sub: 'Soạn giảng & Giảng dạy',
                    icon: Sparkles,
                  },
                  {
                    category: 'LIFE_SKILLS',
                    label: 'Kỹ Năng Sống',
                    sub: 'Thuyết trình & Nói',
                    icon: Compass,
                  },
                  {
                    category: 'SOFT_SKILLS',
                    label: 'Kỹ Năng Mềm',
                    sub: 'Teamwork & Đàm phán',
                    icon: Users,
                  },
                  {
                    category: 'PERSONAL_DEV',
                    label: 'Phát Triển Bản Thân',
                    sub: 'Lãnh đạo & Tư duy',
                    icon: TrendingUp,
                  },
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  const count = courses.filter((c) => c.category === pillar.category).length;
                  return (
                    <Link
                      key={pillar.category}
                      href={`/admin/courses?category=${pillar.category}`}
                      className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-300 transition space-y-1.5 block group shadow-2xs select-none"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#1B64B0] transition-colors" />
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-sky-50 group-hover:text-[#1B64B0] px-1.5 py-0.5 rounded-md transition-colors">
                          {count} khóa
                        </span>
                      </div>
                      <div>
                        <h5 className="text-[11.5px] font-black text-slate-800 group-hover:text-[#1B64B0] leading-tight truncate transition-colors">{pillar.label}</h5>
                        <p className="text-[10.5px] text-slate-400 truncate">{pillar.sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Special Features Strip */}
              <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Định dạng bài học:
                </span>
                <span className="text-[10.5px] font-semibold text-purple-700">
                  Video bài giảng HD + Quiz tình huống phản xạ
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <Link
                href="/admin/courses?track=personal_dev"
                className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition"
              >
                <span>Vào phân hệ Kỹ Năng & Sư Phạm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/courses?action=new&track=personal_dev"
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 transition"
              >
                + Thêm Khóa Kỹ Năng
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Operational Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Combined Submissions Queue (Writing AI + Speaking Audio) */}
        <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Hàng Đợi Bài Nộp Chờ Duyệt & Chấm Điểm
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
                {combinedSubmissions.length > 0 ? (
                  combinedSubmissions.map((sub) => (
                    <tr key={`${sub.type}-${sub.id}`} className="hover:bg-slate-50 transition">
                      <td className="py-3">
                        <span className="font-bold text-slate-900">{sub.studentName}</span>
                        {sub.email && (
                          <span className="block text-[10.5px] text-muted font-normal">{sub.email}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10.5px] ${
                            sub.type === 'WRITING'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.badge}
                        </span>
                      </td>
                      <td className="py-3 text-muted text-[11px]">
                        {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={sub.link}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs ${
                            sub.type === 'WRITING'
                              ? 'bg-primary hover:bg-primary-dark text-white'
                              : 'bg-[#FFB547] hover:bg-[#FFA726] text-[#14263D]'
                          }`}
                        >
                          {sub.actionText}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                      Hiện tại không có bài nộp nào đang chờ xử lý.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: LiveKit Attendance Overview Widget */}
        <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Chuyên Cần Phòng Học LiveKit
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
                Đồng bộ tự động từ LiveKit Webhook. Học viên tích lũy &ge; 80% thời lượng được ghi nhận trạng thái{' '}
                <strong className="text-slate-700">PRESENT</strong>.
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

      {/* 5. Pending VietQR Enrollments Desk */}
      {pendingEnrollments.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black">
                Có {pendingEnrollments.length} yêu cầu đăng ký khóa học đang chờ đối soát sao kê
              </h4>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                Học viên đã quét mã VietQR và gửi nội dung chuyển khoản. Vui lòng kiểm tra và kích hoạt khóa học.
              </p>
            </div>
          </div>

          <Link
            href="/admin/courses?tab=enrollments"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition whitespace-nowrap self-start sm:self-auto"
          >
            Vào Bàn Duyệt Đăng Ký
          </Link>
        </div>
      )}
    </div>
  );
}
