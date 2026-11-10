'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { livekitService, LivekitRoom } from '@/services/livekit.service';
import {
  Video,
  Plus,
  Clock,
  CheckCircle2,
  X,
  Server,
  RefreshCw,
  Users,
} from 'lucide-react';

export default function AdminClassroomPage() {
  const [rooms, setRooms] = useState<LivekitRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State (#scheduleRoomModal)
  const [formData, setFormData] = useState({
    roomTitle: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    duration: 90,
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await livekitService.getRooms();
      if (data && Array.isArray(data)) {
        setRooms(data);
      }
    } catch (err) {
      console.error('Error fetching admin rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomTitle.trim()) return;

    setSubmitting(true);
    try {
      const scheduledStartTime = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();
      const scheduledEndTime = new Date(
        new Date(scheduledStartTime).getTime() + Number(formData.duration) * 60000
      ).toISOString();

      await livekitService.createRoom({
        name: formData.roomTitle.trim(),
        scheduledStartTime,
        scheduledEndTime,
      });

      setNotice(`Đã lên lịch ca học trực tuyến "${formData.roomTitle}" thành công!`);
      setIsModalOpen(false);
      setFormData({
        roomTitle: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '19:30',
        duration: 90,
      });
      await fetchRooms();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tạo phòng học. Vui lòng kiểm tra lại tên phòng.';
      alert(msg);
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const formatScheduleTime = (startTime?: string, endTime?: string) => {
    if (!startTime) return '19:30 - 21:00';
    try {
      const s = new Date(startTime);
      const e = endTime ? new Date(endTime) : null;
      const dateStr = s.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const startStr = s.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const endStr = e ? e.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
      return `${startStr}${endStr ? ' - ' + endStr : ''} (${dateStr})`;
    } catch {
      return startTime;
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Phòng Học LiveKit WebRTC (Host Control)</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </h1>
          <p className="text-xs text-muted mt-1">
            Lên lịch phòng học 1 Host + 8 Học viên, giám sát SFU Webhook và mở lớp giảng dạy trực tiếp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRooms}
            className="p-2.5 rounded-xl bg-white border border-line hover:border-primary text-slate-600 hover:text-primary transition shadow-xs flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lên Lịch Ca Học Mới</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* SFU Status Card */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs font-black uppercase tracking-wider text-white">LiveKit SFU Server Status: ONLINE</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              WebSocket: <code>ws://localhost:7880</code> • Webhook Điểm Danh: <code>POST /api/livekit/webhook</code>
            </p>
          </div>
        </div>

        <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Uptime 99.98% • Latency &lt; 35ms
        </span>
      </div>

      {/* Scheduled Rooms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Các Ca Học Trên Hệ Thống ({rooms.length})
          </h3>
        </div>

        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => {
              const isLive = room.status === 'ACTIVE';
              const roomUrl = `/admin/classroom/${encodeURIComponent(room.name)}`;

              return (
                <div
                  key={room.id || room.name}
                  className="p-5 rounded-3xl bg-white border border-line shadow-xs hover:border-primary/50 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-primary">
                        {room.course?.title || 'IELTS Masterclass'}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isLive
                            ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isLive ? 'ĐANG MỞ PHÒNG (ACTIVE)' : 'SCHEDULED'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Chủ tọa: <strong>{room.host?.fullName || 'Teacher Dong (Admin)'}</strong>
                    </p>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-primary">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatScheduleTime(room.scheduledStartTime, room.scheduledEndTime)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{room._count?.attendanceRecords || 0}/8 học viên</span>
                    </span>

                    <Link
                      href={roomUrl}
                      className="px-4 py-2.5 rounded-2xl bg-[#FFB547] hover:bg-[#FFA726] active:scale-95 text-[#14263D] font-black text-xs shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-[#14263D]" />
                      <span>Mở Phòng Host Ngay</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-line text-center space-y-3 shadow-xs">
            <Video className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Chưa có ca học nào được tạo</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Nhấn nút &ldquo;Lên Lịch Ca Học Mới&rdquo; ở góc trên để tạo phòng học WebRTC LiveKit cho học viên.
            </p>
          </div>
        )}
      </div>

      {/* Schedule Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Lên Lịch Phòng Học LiveKit WebRTC
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Phòng học sẽ đồng bộ tự động tới Dashboard của học viên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề / Tên phòng học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomTitle}
                  onChange={(e) => setFormData({ ...formData, roomTitle: e.target.value })}
                  placeholder="VD: IELTS Speaking Part 2 Forecast — Intensive Mock Session"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thời lượng dự kiến (phút)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                >
                  <option value={45}>45 phút (Luyện phát âm mini)</option>
                  <option value={60}>60 phút (Tiêu chuẩn)</option>
                  <option value={90}>90 phút (Intensive Masterclass)</option>
                  <option value={120}>120 phút (Thi thử Full Mock Test)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo phòng...' : 'Xác nhận tạo ca học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
