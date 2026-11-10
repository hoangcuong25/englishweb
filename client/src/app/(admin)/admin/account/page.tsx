'use client';

import React, { useState } from 'react';
import SessionManagerDrawer from '@/components/modals/session-manager-drawer';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default function AdminAccountPage() {
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    setNotice('Đã cập nhật mật khẩu quản trị viên thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setNotice(''), 4000);
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

      {/* Admin Profile */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <User className="w-4 h-4 text-primary" />
          <span>Hồ Sơ Giảng Viên Trưởng & Quản Trị Viên</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-line">
            <span className="text-muted text-[11px]">Họ và tên</span>
            <p className="font-bold text-slate-800 mt-1">Thầy Đông (Teacher Dong)</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-line">
            <span className="text-muted text-[11px]">Email quản trị</span>
            <p className="font-bold text-slate-800 mt-1">admin@dong.edu.vn</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-line">
            <span className="text-muted text-[11px]">Vai trò hệ thống</span>
            <p className="font-bold text-purple-700 mt-1">ADMIN / INSTRUCTOR (Strict 2-Role)</p>
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
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition"
          >
            Cập Nhật Mật Khẩu
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

