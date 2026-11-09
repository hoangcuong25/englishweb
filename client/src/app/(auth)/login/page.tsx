'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (role: 'STUDENT' | 'ADMIN') => {
    if (role === 'ADMIN') {
      setEmail('admin@dong.edu.vn');
      setPassword('Admin@DongAcademy2026');
    } else {
      setEmail('student@dong.edu.vn');
      setPassword('Student@DongAcademy2026');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-bg to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-line p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-dark to-primary text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              TD
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Teacher Dong Academy
          </h1>
          <p className="text-xs text-muted">
            Đăng nhập hệ thống đào tạo (Cổng Học Viên hoặc Quản Trị Viên)
          </p>
        </div>

        {/* Demo Fast Account Selector */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-2.5 text-xs">
          <p className="font-bold text-primary flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vào xem trải nghiệm ngay (1-Click Demo):</span>
            </span>
            <span className="text-[10px] text-muted font-normal">Không cần backend DB</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginDemo('STUDENT')}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-sky-100/70 border border-sky-200 font-extrabold text-primary shadow-xs transition text-center"
              title="Vào thẳng trang Học viên để xem khóa học, studio viết/nói và thư viện"
            >
              🎓 Cổng Học Viên
            </button>
            <button
              type="button"
              onClick={() => loginDemo('ADMIN')}
              className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-xs transition text-center"
              title="Vào thẳng trang Quản trị để xem dashboard, chấm bài và quản lý phòng học"
            >
              👨‍🏫 Cổng Quản Trị
            </button>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px] text-muted">
            <span>Hoặc điền form bên dưới:</span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => handleFillDemo('STUDENT')}
                className="hover:text-primary underline font-medium"
              >
                Mẫu HV
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('ADMIN')}
                className="hover:text-primary underline font-medium"
              >
                Mẫu Admin
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@dong.edu.vn"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
              <span className="text-[11px] text-primary hover:underline cursor-pointer">
                Quên mật khẩu?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Single Session Security Notice */}
          <div className="flex items-center space-x-2 text-[11px] text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Cơ chế Single Session: Đăng nhập sẽ tự động đăng xuất thiết bị cũ.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-primary/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang Xác Thực...</span>
            ) : (
              <>
                <span>Đăng Nhập Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Chưa có tài khoản học viên?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Đăng ký tham gia ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
