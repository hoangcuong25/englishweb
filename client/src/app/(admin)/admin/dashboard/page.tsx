'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Video,
  FileCheck,
  Headphones,
  PlusCircle,
  TrendingUp,
  Server,
} from 'lucide-react';

export default function AdminDashboard() {

  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-primary-deep to-primary text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <span>👨‍🏫 Bảng Điều Khiển Quản Trị & Giảng Viên</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Teacher Dong Academy Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Hệ thống đang phục vụ <strong>185 học viên</strong> đang hoạt động với Uptime SFU đạt <strong>99.98%</strong>.
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
          <p className="text-3xl font-extrabold text-slate-900 mt-2">185</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12 học viên tuần này
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Writing chờ duyệt AI</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-purple-600 mt-2">6</p>
          <p className="text-[11px] text-muted mt-1">Cần Thầy duyệt trước khi phát hành</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Speaking chờ chấm</span>
            <Headphones className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">9</p>
          <p className="text-[11px] text-muted mt-1">Thầy chấm thủ công 100%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Uptime LiveKit SFU</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">99.98%</p>
          <p className="text-[11px] text-muted mt-1">Độ trễ TB: 42ms • Webhook Active</p>
        </div>
      </div>

      {/* Main Review Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Writing Approval Queue */}
        <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hàng Đợi Duyệt Bài Writing AI</h3>
                <p className="text-[11px] text-muted">Học viên chờ công bố kết quả</p>
              </div>
            </div>
            <Link
              href="/admin/writing-review"
              className="text-xs font-bold text-purple-600 hover:text-purple-800"
            >
              Xem tất cả (6)
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { id: 'sub-1', name: 'Trần Văn Nam', task: 'Task 2: Education & Technology', words: 285, aiBand: 6.5 },
              { id: 'sub-2', name: 'Lê Thị Mai', task: 'Task 1: Renewable Energy Chart', words: 172, aiBand: 7.0 },
              { id: 'sub-3', name: 'Hoàng Minh Tuấn', task: 'Task 2: Fast Food Taxes', words: 260, aiBand: 6.0 },
            ].map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl border border-line bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-slate-800">{sub.name}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                      AI Band {sub.aiBand}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sub.task} • {sub.words} từ</p>
                </div>
                <Link
                  href="/admin/writing-review"
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
                >
                  Duyệt điểm
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Speaking Grading Queue */}
        <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hàng Đợi Chấm Bài Speaking Thủ Công</h3>
                <p className="text-[11px] text-muted">Thầy chấm 100% kèm timestamp feedback</p>
              </div>
            </div>
            <Link
              href="/admin/speaking-grading"
              className="text-xs font-bold text-amber-600 hover:text-amber-800"
            >
              Xem tất cả (9)
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { id: 'sp-1', name: 'Đỗ Thùy Trang', part: 'Part 2: Describe a Journey', duration: '01:54' },
              { id: 'sp-2', name: 'Nguyễn Tiến Dũng', part: 'Part 1: Hometown & Hobbies', duration: '00:58' },
              { id: 'sp-3', name: 'Vũ Hải Yến', part: 'Part 3: Environmental Issues', duration: '02:30' },
            ].map((sp) => (
              <div
                key={sp.id}
                className="p-3.5 rounded-xl border border-line bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-slate-800">{sp.name}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                      {sp.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sp.part}</p>
                </div>
                <Link
                  href="/admin/speaking-grading"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition"
                >
                  Nghe & Chấm
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
