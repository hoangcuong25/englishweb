'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Video, Mic, ArrowRight, Clock } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-sky-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-sky-200">
              EL
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800">EnglishHub</span>
              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full ml-2 font-medium">LMS & WebRTC</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-600 hidden sm:inline">
                  Xin chào, <strong className="text-slate-800">{user.fullName}</strong>
                </span>
                <Link
                  href={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
                >
                  Vào Dashboard ({user.role})
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-200 transition"
                >
                  Đăng ký học viên
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100/80 text-sky-700 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
          <span>Nền tảng Lớp Học WebRTC In-house & LMS 2 Roles</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Học Tiếng Anh Trực Tuyến <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Tương Tác Thời Gian Thực
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Luyện thi IELTS, Business English và tiếng Anh thiếu nhi với lớp học LiveKit siêu mượt, ngân hàng đề tự chấm và phòng thu âm Speaking chuyên nghiệp.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-lg shadow-sky-200 transition flex items-center justify-center space-x-2"
          >
            <span>Bắt đầu học ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition"
          >
            Đăng nhập tài khoản
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Lớp LiveKit SFU Tự Host</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Mô hình 1 Giáo viên (Admin) + 7 Học viên (Student). Âm thanh, hình ảnh chuẩn HD, độ trễ &lt;150ms cùng bảng viết tương tác thời gian thực.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Luyện Speaking & Chấm Band</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Thu âm trực tiếp trên trình duyệt bằng MediaRecorder API, nộp bài nhận phản hồi chi tiết và band điểm từ Admin theo 4 tiêu chí IELTS.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Điểm Danh Số Phút Tự Động</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Tích hợp LiveKit Webhook tự động ghi nhận chính xác từng phút học của học viên, phân loại Có mặt / Muộn / Vắng và xuất báo cáo Excel tiện lợi.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>© 2026 EnglishHub LMS & LiveKit WebRTC Platform. 2-Roles Model (Student & Admin).</p>
      </footer>
    </div>
  );
}
