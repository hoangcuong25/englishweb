'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/services/auth.service';
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
  Phone,
  UploadCloud,
} from 'lucide-react';

export default function AdminAccountPage() {
  const { user, updateUser } = useAuth();
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
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
      setNotice('Cập nhật số điện thoại thành công!');
      setTimeout(() => setNotice(''), 4000);
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
      setNotice('Cập nhật ảnh đại diện quản trị viên thành công!');
      setTimeout(() => setNotice(''), 4000);
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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

    setSubmitting(true);
    try {
      await authService.changePassword({
        oldPassword: currentPassword,
        newPassword,
      });

      setNotice('Đã cập nhật mật khẩu quản trị viên thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      setErrorMessage(errRes?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Cài Đặt Hệ Thống & Tài Khoản Quản Trị
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Quản lý tài khoản Giảng viên Trưởng Teacher Dong và cấu hình bảo mật nền tảng.
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

      {/* Admin Profile */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center space-x-4">
            {/* Avatar Display & Camera Button */}
            <div className="relative group shrink-0">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'Admin Avatar'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-primary text-white font-black text-xl flex items-center justify-center shadow-sm">
                  TD
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition cursor-pointer"
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
                {user?.fullName || 'Thầy Đông (Teacher Dong)'}
              </h3>
              <p className="text-xs text-muted mt-0.5">{user?.email || 'admin@dong.edu.vn'}</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  ADMIN / INSTRUCTOR (Strict 2-Role)
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-[11px] font-semibold text-purple-600 hover:underline cursor-pointer flex items-center space-x-1"
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
            <span>Chi Tiết Hồ Sơ Quản Trị</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-line">
              <span className="text-muted text-[11px]">Họ và tên</span>
              <p className="font-bold text-slate-800 mt-1">{user?.fullName || 'Thầy Đông (Teacher Dong)'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-line">
              <span className="text-muted text-[11px]">Email quản trị</span>
              <p className="font-bold text-slate-800 mt-1 truncate">{user?.email || 'admin@dong.edu.vn'}</p>
            </div>

            {/* Editable Phone Number Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-line flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-muted text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary" />
                  <span>Số điện thoại liên hệ</span>
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
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                    Quản trị
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Sessions */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Kiểm Soát Phiên Đăng Nhập Quản Trị
            </h4>
            <p className="text-xs text-muted">
              Giám sát và thu hồi các phiên truy cập quản trị hệ thống.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSessionDrawerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs transition"
        >
          Mở Cửa Sổ Phiên Đăng Nhập
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <span>Thay Đổi Mật Khẩu Quản Trị</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu quản trị hiện tại <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          >
            {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{submitting ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
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

