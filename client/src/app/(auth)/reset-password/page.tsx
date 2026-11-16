'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { handleApiError } from '@/lib/api-error';
import { toast } from '@/components/ui/toast';
import { Lock, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Mã xác thực không tồn tại hoặc liên kết đã bị hỏng. Vui lòng thử lại.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await authService.resetPassword(token, newPassword);
      setIsSuccess(true);
      toast.success('Mật khẩu của bạn đã được cập nhật thành công!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      const code = handleApiError(err, 'Không thể đặt lại mật khẩu');
      if (code === 'AUTH_RESET_TOKEN_EXPIRED') {
        setErrorMsg('Mã token khôi phục đã hết hạn (quá 15 phút). Vui lòng yêu cầu lại.');
      } else if (code === 'AUTH_WEAK_PASSWORD') {
        setErrorMsg('Mật khẩu quá ngắn hoặc không đủ độ bảo mật.');
      } else {
        setErrorMsg('Đã có lỗi xảy ra. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.');
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
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Đặt Lại Mật Khẩu</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {email ? `Tạo mật khẩu mới cho tài khoản ${email}` : 'Nhập mật khẩu mới an toàn cho tài khoản của bạn'}
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
            <h3 className="text-sm font-bold text-emerald-900">Đặt Lại Mật Khẩu Thành Công!</h3>
            <p className="text-xs text-emerald-700">
              Hệ thống đang chuyển hướng bạn về trang Đăng nhập...
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
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
                  <span>Đang Cập Nhật Mật Khẩu...</span>
                </>
              ) : (
                <span>Lưu & Đặt Lại Mật Khẩu</span>
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
            <span>Quay lại Đăng Nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-xs text-slate-400">Đang tải...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

