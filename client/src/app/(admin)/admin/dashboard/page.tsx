'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Users,
  BookOpen,
  Mic,
  Video,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const sampleAttendance = [
    { id: 1, name: 'Nguyen Thi Mai', email: 'student@englishweb.com', joinTime: '19:30', duration: '58 phút', status: 'PRESENT' },
    { id: 2, name: 'Tran Van Bao', email: 'bao.tran@example.com', joinTime: '19:48', duration: '42 phút', status: 'LATE' },
    { id: 3, name: 'Le Hoang Nam', email: 'nam.le@example.com', joinTime: '-', duration: '0 phút', status: 'ABSENT' },
    { id: 4, name: 'Pham Thu Huong', email: 'huong.pham@example.com', joinTime: '19:31', duration: '59 phút', status: 'PRESENT' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-sky-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-700 text-white font-bold flex items-center justify-center shadow-sm">
              EL
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg">EnglishHub Admin</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-2 font-medium">
                Chủ Sở Hữu & Giảng Viên
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.fullName || 'Quản trị viên'}</p>
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Host Live Room Action Bar */}
        <div className="bg-white rounded-2xl border border-sky-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>WebRTC SFU Ready (VPS Ubuntu Docker)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Phòng Học Trực Tuyến LiveKit</h1>
            <p className="text-sm text-slate-500">
              Mô hình 1 Host (Admin) + 7 Học viên (Student), chia sẻ màn hình bài giảng và bảng vẽ Tldraw tương tác.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/classroom/ielts-speaking-live"
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-200 transition flex items-center space-x-2"
            >
              <Video className="w-5 h-5" />
              <span>Mở Phòng Học (Host)</span>
            </Link>
            <button
              onClick={() => alert('Xuất bảng điểm danh định dạng Excel...')}
              className="px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-xl border border-emerald-200 transition flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Xuất Báo Cáo Excel</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Tổng số học viên</p>
              <p className="text-2xl font-extrabold text-slate-800">18 Học viên</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Khóa học quản trị</p>
              <p className="text-2xl font-extrabold text-slate-800">3 Khóa</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Bài Speaking chờ chấm</p>
              <p className="text-2xl font-extrabold text-slate-800">5 Bài</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Tỷ lệ chuyên cần</p>
              <p className="text-2xl font-extrabold text-slate-800">92.5%</p>
            </div>
          </div>
        </div>

        {/* Attendance Live Table (SRS Module 6) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Điểm Danh Lớp Học Tự Động (Theo Phút Thực Tế)</h2>
              <p className="text-xs text-slate-500 mt-1">Dữ liệu đồng bộ trực tiếp từ LiveKit SFU Webhook</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-medium">
                Buổi: IELTS Masterclass - Lesson 1
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-6">Học Viên</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Thời Gian Vào</th>
                  <th className="py-3 px-6">Tổng Thời Gian</th>
                  <th className="py-3 px-6">Trạng Thái</th>
                  <th className="py-3 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleAttendance.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs">{item.email}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-mono">{item.joinTime}</td>
                    <td className="py-4 px-6 text-slate-700 font-semibold">{item.duration}</td>
                    <td className="py-4 px-6">
                      {item.status === 'PRESENT' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Có mặt
                        </span>
                      )}
                      {item.status === 'LATE' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          Muộn (&gt;15p)
                        </span>
                      )}
                      {item.status === 'ABSENT' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Vắng mặt
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => alert(`Sửa thủ công trạng thái cho: ${item.name}`)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
