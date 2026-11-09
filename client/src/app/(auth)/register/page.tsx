'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetBand, setTargetBand] = useState('7.0');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản & Chính sách bảo mật của Teacher Dong Academy.');
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, password, phone });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký tài khoản không thành công. Email hoặc số điện thoại có thể đã được đăng ký.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-bg to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-line p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-dark to-primary text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              TD
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Đăng Ký Tài Khoản Học Viên
          </h1>
          <p className="text-xs text-muted">
            Tham gia lộ trình luyện thi IELTS & tiếng Anh tương tác WebRTC
          </p>
        </div>

        {/* Google OAuth Sign-Up Button */}
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="w-full py-3 px-4 rounded-xl border border-line bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-xs flex items-center justify-center space-x-3 group"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="group-hover:text-slate-900">Đăng ký nhanh bằng Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-line w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-muted uppercase">
            hoặc điền thông tin bên dưới
          </span>
          <div className="border-t border-line w-full"></div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên đầy đủ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenvana@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mục tiêu Band
              </label>
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-line text-xs bg-white font-bold"
              >
                <option value="6.0">Band 6.0</option>
                <option value="6.5">Band 6.5</option>
                <option value="7.0">Band 7.0</option>
                <option value="7.5">Band 7.5</option>
                <option value="8.0+">Band 8.0+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, gồm số & chữ hoa"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-primary focus:ring-0"
            />
            <span>
              Tôi đồng ý với Quy chế Đào tạo và Chính sách Bảo mật (Single Session & Watermark) của Teacher Dong Academy.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-dark disabled:opacity-50 text-slate-900 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-accent/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang Xử Lý Đăng Ký...</span>
            ) : (
              <>
                <span>Hoàn Tất Đăng Ký Học Viên</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
}
