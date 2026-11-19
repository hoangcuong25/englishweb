'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/services/auth.service';
import { toast } from '@/components/ui/toast';
import SessionManagerDrawer from '@/components/modals/session-manager-drawer';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  Edit2,
  Check,
  X,
  Phone,
  UploadCloud,
  Hash,
} from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

export default function StudentAccountPage() {
  const { user, updateUser, refreshProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePwOtp, setChangePwOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Profile Edit State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.phone) {
      setPhoneInput(user.phone);
    }
  }, [user?.phone]);

  const handleSavePhone = async () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) {
      setErrorMessage('Số điện thoại không được để trống!');
      return;
    }
    // Basic phone validation (VN 10 digits or international)
    if (!/^[0-9+]{9,15}$/.test(trimmed)) {
      setErrorMessage('Số điện thoại không đúng định dạng (từ 9 đến 15 chữ số)!');
      return;
    }

    setSavingPhone(true);
    setErrorMessage('');
    setNotice('');

    try {
      const updated = await authService.updateProfile({ phone: trimmed });
      updateUser({ phone: updated.phone || trimmed });
      setIsEditingPhone(false);
      setNotice('Cập nhật số điện thoại thành công! Số điện thoại mới sẽ được dùng in Dynamic Watermark bảo mật.');
      setTimeout(() => setNotice(''), 5000);
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const rawMsg = errRes?.message;
      const friendlyMsg =
        rawMsg?.includes('refresh token') || rawMsg?.includes('token')
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'
          : (rawMsg || 'Không thể cập nhật số điện thoại. Vui lòng thử lại!');
      setErrorMessage(friendlyMsg);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage('');
    setNotice('');

    try {
      const updated = await authService.uploadAvatar(file);
      updateUser({ avatarUrl: updated.avatarUrl });
      setNotice('Cập nhật ảnh đại diện thành công!');
      setTimeout(() => setNotice(''), 5000);
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const rawMsg = errRes?.message;
      const friendlyMsg =
        rawMsg?.includes('refresh token') || rawMsg?.includes('token')
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'
          : (rawMsg || 'Không thể upload ảnh đại diện. Vui lòng thử lại!');
      setErrorMessage(friendlyMsg);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, text: '', color: '' };
    if (pwd.length < 8) return { level: 1, text: 'Quá yếu (Dưới 8 ký tự)', color: 'bg-red-500' };
    const hasNum = /\d/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    if (hasNum && hasUpper && hasSpecial && pwd.length >= 10) {
      return { level: 3, text: 'Rất mạnh', color: 'bg-emerald-500' };
    }
    if ((hasNum && hasUpper) || hasSpecial) {
      return { level: 2, text: 'Trung bình', color: 'bg-amber-500' };
    }
    return { level: 1, text: 'Yếu', color: 'bg-red-500' };
  };

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleRequestOtp = async () => {
    setRequestingOtp(true);
    setErrorMessage('');
    try {
      await authService.requestChangePasswordOtp();
      setOtpSent(true);
      setOtpCountdown(60);
      toast.success('Mã OTP xác thực đã được gửi đến email của bạn!');
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      setErrorMessage(errRes?.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setNotice('');

    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    if (otpSent && (!changePwOtp || changePwOtp.length < 6)) {
      setErrorMessage('Vui lòng nhập đầy đủ mã OTP 6 chữ số gửi qua email!');
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword({
        oldPassword: currentPassword,
        newPassword,
        otp: changePwOtp.trim() || undefined,
      });

      setNotice('Đổi mật khẩu thành công! Tất cả các phiên đăng nhập khác đã được thu hồi an toàn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangePwOtp('');
      setOtpSent(false);
      setTimeout(() => setNotice(''), 5000);
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      setErrorMessage(errRes?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại hoặc mã OTP!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    try {
      await authService.linkGoogle({
        idToken: `google_token_${Date.now()}`,
        email: user?.email,
        fullName: user?.fullName,
      });
      toast.success('Đã liên kết tài khoản Google thành công!');
      refreshProfile();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể liên kết Google lúc này');
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm('Bạn có chắc muốn hủy liên kết Google? Bạn sẽ cần mật khẩu để đăng nhập.')) return;
    setIsLinkingGoogle(true);
    try {
      await authService.unlinkGoogle();
      toast.success('Đã hủy liên kết tài khoản Google!');
      refreshProfile();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể hủy liên kết Google');
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Hồ Sơ & Bảo Mật Tài Khoản (AUTH-SCR-004, 005)
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Quản lý mật khẩu, ngôn ngữ mặc định và cơ chế bảo mật Single Concurrent Session.
        </p>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center space-x-4">
            {/* Avatar Display & Camera Button */}
            <div className="relative group shrink-0">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'Avatar'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-dark to-primary text-white font-black text-xl flex items-center justify-center shadow-sm">
                  {user?.fullName
                    ? user.fullName
                        .split(' ')
                        .filter(Boolean)
                        .slice(-2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                    : 'HV'}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 p-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-md transition cursor-pointer"
                title="Thay đổi ảnh hiển thị"
              >
                {uploadingAvatar ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {user?.fullName || 'Học viên'}
              </h3>
              <p className="text-xs text-muted mt-0.5">{user?.email || 'student@englishweb.com'}</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  HỌC VIÊN CHÍNH THỨC
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>{uploadingAvatar ? 'Đang cập nhật ảnh...' : 'Đổi ảnh đại diện'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <span>Chi Tiết Hồ Sơ Cá Nhân</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-line">
              <span className="text-muted text-[11px]">Họ và tên học viên</span>
              <p className="font-bold text-slate-800 mt-1">{user?.fullName || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-line">
              <span className="text-muted text-[11px]">Địa chỉ Email (Định danh)</span>
              <p className="font-bold text-slate-800 mt-1 truncate">{user?.email || 'nam.tran@gmail.com'}</p>
            </div>

            {/* Editable Phone Number Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-line flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary" />
                  <span>Số điện thoại (In Watermark)</span>
                </span>
                {!isEditingPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPhone(true);
                      setPhoneInput(user?.phone || '');
                    }}
                    className="text-primary hover:text-primary-dark font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                    title="Chỉnh sửa số điện thoại"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Sửa</span>
                  </button>
                )}
              </div>

              {isEditingPhone ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Nhập số điện thoại (VD: 0912345678)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-primary bg-white text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-dark text-white text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    >
                      {savingPhone ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Lưu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(false)}
                      disabled={savingPhone}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <p className="font-mono font-bold text-slate-800 text-sm">
                    {user?.phone || 'Chưa cập nhật'}
                  </p>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    Bảo mật
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Single Session Drawer Trigger Card */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Quản Lý Phiên Đăng Nhập (Single Concurrent Session)
            </h4>
            <p className="text-xs text-muted">
              Xem danh sách thiết bị đang đăng nhập tài khoản và thu hồi phiên từ xa.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSessionDrawerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs transition"
        >
          Quản Lý Thiết Bị Đang Kết Nối
        </button>
      </div>

      {/* Google Account Linking (FR-01) */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Tài Khoản Liên Kết Google</span>
        </h3>
        <p className="text-xs text-muted">
          Liên kết tài khoản Google giúp bạn đăng nhập một chạm nhanh chóng và thuận tiện vào hệ thống.
        </p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-line">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-line shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {user?.googleId ? 'Đã liên kết tài khoản Google' : 'Chưa liên kết tài khoản Google'}
              </p>
              <p className="text-[11px] text-muted">
                {user?.googleId ? user.email : 'Đăng nhập bảo mật nhanh chóng qua tài khoản Google'}
              </p>
            </div>
          </div>
          {user?.googleId ? (
            <button
              onClick={handleUnlinkGoogle}
              disabled={isLinkingGoogle}
              className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition disabled:opacity-50"
            >
              Hủy Liên Kết
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              disabled={isLinkingGoogle}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              Liên Kết Ngay
            </button>
          )}
        </div>
      </div>

      {/* Change Password Form (AUTH-SCR-004) */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <span>Thay Đổi Mật Khẩu (AUTH-SCR-004)</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Mã xác thực OTP (Email) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                disabled={otpCountdown > 0 || requestingOtp}
                onClick={handleRequestOtp}
                className="text-[11px] text-primary hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 font-semibold"
              >
                {requestingOtp ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Đang gửi mã...</span>
                  </>
                ) : otpCountdown > 0 ? (
                  <span>Gửi lại sau ({otpCountdown}s)</span>
                ) : (
                  <span>{otpSent ? 'Gửi lại OTP' : 'Gửi mã OTP về Email'}</span>
                )}
              </button>
            </div>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                maxLength={6}
                value={changePwOtp}
                onChange={(e) => setChangePwOtp(e.target.value.replace(/\D/g, ''))}
                placeholder={otpSent ? "Nhập 6 chữ số từ email" : "Bấm nút 'Gửi mã OTP về Email' ở trên"}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs tracking-widest font-mono font-bold focus:outline-none focus:border-primary"
              />
            </div>
            {otpSent && (
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Mã OTP đã gửi tới {user?.email}. Vui lòng kiểm tra hộp thư.</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự, gồm chữ hoa và số"
            />

            {/* Strength Meter */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.level / 3) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-muted font-semibold">
                  Độ mạnh mật khẩu: <strong>{strength.text}</strong>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          >
            {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{submitting ? 'Đang cập nhật...' : 'Xác Thực OTP & Lưu Mật Khẩu'}</span>
          </button>
        </form>
      </div>

      <SessionManagerDrawer
        isOpen={isSessionDrawerOpen}
        onClose={() => setIsSessionDrawerOpen(false)}
      />
    </div>
  );
}

