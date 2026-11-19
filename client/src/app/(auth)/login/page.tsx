'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

export default function LoginPage() {
  const { login } = useAuth();
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
            Đăng Nhập Cổng Học Viên
          </h1>
          <p className="text-xs text-muted">
            Truy cập hệ thống đào tạo, luyện thi IELTS & phòng học WebRTC
          </p>
        </div>

        {/* Google OAuth Sign-In Button */}
        <GoogleSignInButton mode="login" />

        <div className="relative flex items-center justify-center py-1">
          <div className="flex-1 border-t border-line"></div>
          <span className="shrink-0 bg-white px-3 text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">
            Hoặc bằng email
          </span>
          <div className="flex-1 border-t border-line"></div>
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
              <Link href="/forgot-password" className="text-[11px] text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
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

        <div className="pt-3 border-t border-line/70 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition group"
          >
            <span>Bạn là Quản trị viên & Giảng viên?</span>
            <span className="font-bold text-primary group-hover:underline">Vào Cổng Admin →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
