'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { handleApiError } from '@/lib/api-error';
import { toast } from '@/components/ui/toast';
import { ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Mail, Hash, RefreshCw } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOtp = async () => {
    if (!email) {
      setErrorMsg('Vui lòng nhập địa chỉ email để nhận lại mã OTP.');
      return;
    }
    setResending(true);
    setErrorMsg('');
    try {
      await authService.forgotPassword(email.trim());
      setCountdown(60);
      toast.success('Mã OTP mới đã được gửi đến email của bạn!');
    } catch (err) {
      handleApiError(err, 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token && (!otp || otp.length < 6)) {
      setErrorMsg('Vui lòng nhập đầy đủ mã xác thực OTP 6 chữ số được gửi qua email.');
      return;
    }

    if (!token && !email) {
      setErrorMsg('Vui lòng cung cấp địa chỉ email tài khoản của bạn.');
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
      if (otp && email) {
        await authService.resetPasswordWithOtp({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        });
      } else if (token) {
        await authService.resetPassword(token, newPassword);
      }
      setIsSuccess(true);
      toast.success('Mật khẩu của bạn đã được cập nhật thành công!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      const code = handleApiError(err, 'Không thể đặt lại mật khẩu');
      if (code === 'AUTH_RESET_TOKEN_EXPIRED') {
        setErrorMsg('Mã OTP hoặc liên kết khôi phục đã hết hạn. Vui lòng yêu cầu lại.');
      } else if (code === 'AUTH_RESET_TOKEN_INVALID') {
        setErrorMsg('Mã OTP không đúng hoặc không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (code === 'AUTH_WEAK_PASSWORD') {
        setErrorMsg('Mật khẩu quá ngắn hoặc không đủ độ bảo mật.');
      } else {
        setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại.');
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
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Xác Thực & Đặt Lại Mật Khẩu</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {token
              ? 'Xác thực qua liên kết bảo mật để đặt lại mật khẩu mới'
              : 'Nhập mã OTP 6 chữ số gửi qua email để thiết lập mật khẩu mới'}
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
            {!token && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Mã xác thực OTP (6 chữ số) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      disabled={countdown > 0 || resending}
                      onClick={handleResendOtp}
                      className="text-[11px] text-primary hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 font-semibold"
                    >
                      {resending ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : countdown > 0 ? (
                        <span>Gửi lại sau ({countdown}s)</span>
                      ) : (
                        <span>Gửi lại OTP</span>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="VD: 839201"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs tracking-widest font-mono font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
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
                <span>Xác Thực & Đặt Lại Mật Khẩu</span>
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
