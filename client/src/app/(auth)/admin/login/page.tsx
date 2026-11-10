'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Mail, Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
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
      await login({ email, password }, 'ADMIN');
    } catch (err: unknown) {
      const errorMsg =
        (err as Error)?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc quyền Quản trị viên.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 select-none">
      <div className="max-w-md w-full bg-slate-900/95 backdrop-blur border border-slate-800/90 rounded-3xl shadow-2xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-block group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              TD
            </div>
          </Link>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10.5px] font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal • Cổng Quản Trị</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Quản Trị Viên & Giảng Viên
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Hệ thống quản lý đào tạo, LiveKit Host & chấm thi chuyên sâu
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login Admin */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Email Quản Trị Viên
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@englishweb.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Mật khẩu quản trị
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Đang Xác Thực Quyền Quản Trị...</span>
            ) : (
              <>
                <span>Đăng Nhập Cổng Quản Trị</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group"
          >
            <span>← Quay lại</span>
            <span className="font-bold text-sky-400 group-hover:underline">Cổng Học Viên</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
