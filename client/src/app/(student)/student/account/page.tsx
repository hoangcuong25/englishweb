'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import SessionManagerDrawer from '@/components/modals/session-manager-drawer';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default function StudentAccountPage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const [notice, setNotice] = useState('');

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

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    setNotice('Đổi mật khẩu thành công! Tất cả các phiên đăng nhập khác đã được thu hồi tự động.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setNotice(''), 4000);
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

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <User className="w-4 h-4 text-primary" />
          <span>Thông Tin Cá Nhân</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-line">
            <span className="text-muted text-[11px]">Họ và tên học viên</span>
            <p className="font-bold text-slate-800 mt-1">{user?.fullName || 'Trần Văn Nam'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-line">
            <span className="text-muted text-[11px]">Địa chỉ Email</span>
            <p className="font-bold text-slate-800 mt-1">{user?.email || 'nam.tran@gmail.com'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-line">
            <span className="text-muted text-[11px]">Số điện thoại (In Watermark)</span>
            <p className="font-mono font-bold text-slate-800 mt-1">{user?.phone || '0912345678'}</p>
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
              placeholder="Tối thiểu 8 ký tự, gồm chữ hoa và số"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
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
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition"
          >
            Lưu Mật Khẩu Mới
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

