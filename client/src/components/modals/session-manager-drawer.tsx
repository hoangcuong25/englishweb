'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor, ShieldAlert, LogOut, X, CheckCircle } from 'lucide-react';

interface SessionItem {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile';
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionManagerDrawer({ isOpen, onClose }: SessionManagerDrawerProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: 'sess-1',
      deviceName: 'Chrome 128 on Windows 11',
      deviceType: 'desktop',
      ipAddress: '113.190.234.12 (Hà Nội, VN)',
      lastActive: 'Đang hoạt động (Phiên này)',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      deviceName: 'Safari Mobile on iPhone 15 Pro',
      deviceType: 'mobile',
      ipAddress: '14.161.42.88 (TP. Hồ Chí Minh, VN)',
      lastActive: 'Hoạt động 45 phút trước',
      isCurrent: false,
    },
  ]);

  const [message, setMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleRevokeOne = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setMessage('Đã chấm dứt phiên đăng nhập từ xa thành công.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRevokeAllOther = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setMessage('Đã thu hồi tất cả các phiên đăng nhập khác. Tài khoản của bạn hiện là phiên duy nhất!');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-primary flex items-center justify-center font-bold">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Quản Lý Phiên Đăng Nhập</h2>
              <span className="text-xs text-muted">Cơ chế Single Concurrent Session</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert Banner */}
        <div className="my-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Chính sách bảo mật tài khoản:</strong> Mỗi tài khoản học viên chỉ được phép đăng nhập trên <strong>1 thiết bị</strong> tại một thời điểm. Mọi phiên đăng nhập mới sẽ tự động đăng xuất thiết bị cũ.
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Thiết bị đang kết nối ({sessions.length})
          </h3>

          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-4 rounded-xl border transition ${
                sess.isCurrent
                  ? 'bg-sky-50/50 border-sky-200 shadow-sm'
                  : 'bg-white border-line hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 ${
                      sess.deviceType === 'desktop'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {sess.deviceType === 'desktop' ? (
                      <Monitor className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-slate-800">{sess.deviceName}</p>
                      {sess.isCurrent && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                          Thiết bị này
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{sess.ipAddress}</p>
                    <p className="text-[11px] text-muted mt-1">{sess.lastActive}</p>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleRevokeOne(sess.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    title="Thu hồi phiên này"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-line space-y-2">
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOther}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold text-xs flex items-center justify-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tất cả các thiết bị khác</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}

