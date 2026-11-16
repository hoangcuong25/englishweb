'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { handleApiError } from '@/lib/api-error';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await authService.forgotPassword(email.trim());
      setIsSuccess(true);
    } catch (err) {
      const code = handleApiError(err, 'Không thể gửi yêu cầu đặt lại mật khẩu');
      if (code === 'AUTH_EMAIL_NOT_FOUND') {
        setErrorMsg('Địa chỉ email này chưa được đăng ký trong hệ thống.');
      } else if (code === 'AUTH_ACCOUNT_DEACTIVATED') {
        setErrorMsg('Tài khoản này đã bị tạm khóa. Vui lòng liên hệ giảng viên.');
      } else {
        setErrorMsg('Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-line p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-primary flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Quên Mật Khẩu?</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Nhập địa chỉ email đăng ký tài khoản của bạn. Hệ thống sẽ gửi một liên kết an toàn để đặt lại mật khẩu trong vòng 15 phút.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-emerald-900">Email Khôi Phục Đã Được Gửi!</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Chúng tôi đã gửi hướng dẫn tới <strong>{email}</strong>. Vui lòng kiểm tra hộp thư (kể cả mục Spam) và làm theo hướng dẫn.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@dong.edu.vn"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-primary/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang Gửi Yêu Cầu...</span>
                </>
              ) : (
                <>
                  <span>Gửi Liên Kết Khôi Phục</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Đăng Nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

