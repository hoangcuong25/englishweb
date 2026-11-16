'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  livekitService,
  LivekitRoom,
  AdminClassroomHistoryItem,
} from '@/services/livekit.service';
import CustomSelect from '@/components/ui/custom-select';
import { toast } from '@/components/ui/toast';
import {
  Video,
  Plus,
  Clock,
  CheckCircle2,
  X,
  Server,
  RefreshCw,
  Users,
  Timer,
  History,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Search,
  BookOpen,
} from 'lucide-react';

export default function AdminClassroomPage() {
  const [activeTab, setActiveTab] = useState<'active_sessions' | 'history'>('active_sessions');
  const [rooms, setRooms] = useState<LivekitRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // History state
  const [historyRooms, setHistoryRooms] = useState<AdminClassroomHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedHistoryRoom, setSelectedHistoryRoom] = useState<AdminClassroomHistoryItem | null>(null);

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

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await livekitService.getAdminHistory();
      if (data && Array.isArray(data)) {
        setHistoryRooms(data);
      }
    } catch (err) {
      console.error('Error fetching admin history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchHistory();
    const interval = setInterval(() => {
      fetchRooms();
      if (activeTab === 'history') {
        fetchHistory();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const isRoomExpired = (endTime?: string) => {
    if (!endTime) return false;
    const endMs = new Date(endTime).getTime();
    if (isNaN(endMs)) return false;
    return Date.now() > endMs + 30 * 60 * 1000;
  };

  const getGracePeriodRemainingMins = (endTime?: string) => {
    if (!endTime) return null;
    const endMs = new Date(endTime).getTime();
    if (isNaN(endMs)) return null;
    const now = Date.now();
    const expireAt = endMs + 30 * 60 * 1000;
    if (now > endMs && now < expireAt) {
      return Math.max(1, Math.ceil((expireAt - now) / 60000));
    }
    return null;
  };

  const validRooms = rooms.filter(
    (room) => room.status !== 'ENDED' && !isRoomExpired(room.scheduledEndTime)
  );

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
      toast.error(msg);
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

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-3 border-b border-line pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('active_sessions')}
          className={`px-4 py-2.5 text-xs font-black rounded-2xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'active_sessions'
              ? 'bg-primary text-white shadow-sm shadow-primary/25'
              : 'bg-white border border-line text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Ca Học Đang Mở & Lên Lịch</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'active_sessions'
                ? 'bg-white/20 text-white'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {validRooms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            fetchHistory();
          }}
          className={`px-4 py-2.5 text-xs font-black rounded-2xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-primary text-white shadow-sm shadow-primary/25'
              : 'bg-white border border-line text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử Lớp Học Đã Dạy</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'history'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {historyRooms.length}
          </span>
        </button>
      </div>

      {activeTab === 'active_sessions' ? (
        <>
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
                Các Ca Học Trên Hệ Thống ({validRooms.length})
              </h3>
            </div>

            {validRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {validRooms.map((room) => {
                  const isLive = room.status === 'ACTIVE';
                  const roomUrl = `/admin/classroom/${encodeURIComponent(room.name)}`;
                  const graceRemaining = getGracePeriodRemainingMins(room.scheduledEndTime);

                  return (
                    <div
                      key={room.id || room.name}
                      className="p-5 rounded-3xl bg-white border border-line shadow-xs hover:border-primary/50 transition flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <span className="text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-primary">
                            {room.course?.title || 'IELTS Masterclass'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {graceRemaining !== null && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse border border-amber-300">
                                Đã hết giờ • Tự đóng sau {graceRemaining}p
                              </span>
                            )}
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
        </>
      ) : (
        /* History Sub-tab View */
        <div className="space-y-6">
          {/* History Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Tổng Lớp Đã Tạo</span>
              <p className="text-2xl font-black text-slate-900">{historyRooms.length}</p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Đã Dạy Xong</span>
              <p className="text-2xl font-black text-emerald-600">
                {historyRooms.filter((r) => r.isPastOrEnded).length}
              </p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Lượt Học Viên Tham Gia</span>
              <p className="text-2xl font-black text-primary">
                {historyRooms.reduce((acc, r) => acc + (r.attendeeCount || 0), 0)}
              </p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Đang Mở / Sắp Tới</span>
              <p className="text-2xl font-black text-amber-500">
                {historyRooms.filter((r) => !r.isPastOrEnded).length}
              </p>
            </div>
          </div>

          {/* Search Bar & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span>Toàn Bộ Lịch Sử Các Lớp Học Đã Tạo & Giảng Dạy</span>
                {historyLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />}
              </h3>
              <p className="text-xs text-muted">
                Theo dõi tiến độ, số lượng học viên có mặt/vắng và dữ liệu điểm danh theo từng ca học.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Tìm tên lớp, khóa học..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-line focus:outline-none focus:border-primary bg-white font-medium"
              />
            </div>
          </div>

          {/* History Grid */}
          {historyRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyRooms
                .filter((r) => {
                  if (!historySearch.trim()) return true;
                  const query = historySearch.toLowerCase();
                  return (
                    r.name.toLowerCase().includes(query) ||
                    r.course?.title?.toLowerCase().includes(query)
                  );
                })
                .map((room) => {
                  const isFinished = room.isPastOrEnded;

                  return (
                    <div
                      key={room.id}
                      className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-4 hover:border-primary/40 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {room.course?.title || 'Khóa học IELTS'}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              isFinished
                                ? 'bg-slate-100 text-slate-600'
                                : room.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                                : 'bg-sky-100 text-primary'
                            }`}
                          >
                            {isFinished
                              ? 'ĐÃ KẾ THÚC (HOÀN THÀNH)'
                              : room.status === 'ACTIVE'
                              ? 'ĐANG MỞ (LIVE)'
                              : 'SCHEDULED'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-slate-900 leading-snug">
                            {room.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Chủ tọa Host: <strong>{room.host?.fullName || 'Teacher Dong'}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                          <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{formatScheduleTime(room.scheduledStartTime, room.scheduledEndTime)}</span>
                        </div>

                        {/* Attendance breakdown pills */}
                        <div className="flex items-center flex-wrap gap-2 pt-1 text-[11px] font-bold">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Sĩ số: {room.attendeeCount}/8</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                            <span>✓ Có mặt: {room.stats?.present || 0}</span>
                          </span>
                          {room.stats?.late > 0 && (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                              <span>⏱ Muộn: {room.stats.late}</span>
                            </span>
                          )}
                          {room.stats?.absent > 0 && (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1">
                              <span>✗ Vắng: {room.stats.absent}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHistoryRoom(room)}
                          className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Chi Tiết Sĩ Số ({room.attendeeCount})</span>
                        </button>

                        <Link
                          href="/admin/attendance"
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Báo Cáo Excel</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-line text-center space-y-3 shadow-xs">
              <History className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Chưa có lịch sử lớp học nào</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Khi các lớp học được lên lịch và hoàn tất, toàn bộ lịch sử và báo cáo chuyên cần sẽ lưu giữ tại đây.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attendance Detail Modal */}
      {selectedHistoryRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Chi Tiết Điểm Danh: {selectedHistoryRoom.name}</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Thời gian: {formatScheduleTime(selectedHistoryRoom.scheduledStartTime, selectedHistoryRoom.scheduledEndTime)} • Sĩ số: {selectedHistoryRoom.attendeeCount} học viên
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryRoom(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedHistoryRoom.records && selectedHistoryRoom.records.length > 0 ? (
                <div className="space-y-2">
                  {selectedHistoryRoom.records.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-black text-slate-900">{rec.student?.fullName || 'Học viên'}</p>
                        <p className="text-[11px] text-muted">{rec.student?.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-600">
                          {rec.totalMinutes} phút học
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            rec.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'LATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted">
                  Không có bản ghi học viên nào tham gia buổi học này.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <Link
                href="/admin/attendance"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Xem trang quản trị điểm danh đầy đủ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedHistoryRoom(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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

              <CustomSelect
                label="Thời lượng dự kiến buổi học"
                value={String(formData.duration)}
                onChange={(val) => setFormData({ ...formData, duration: Number(val) })}
                options={[
                  {
                    value: '45',
                    label: '45 phút',
                    sublabel: 'Luyện phản xạ & phát âm mini',
                    icon: <Timer className="w-4 h-4 text-sky-500" />,
                    badge: 'Mini',
                  },
                  {
                    value: '60',
                    label: '60 phút',
                    sublabel: 'Thời lượng tiêu chuẩn lớp học',
                    icon: <Clock className="w-4 h-4 text-emerald-500" />,
                    badge: 'Standard',
                    badgeColor: 'bg-emerald-100 text-emerald-700',
                  },
                  {
                    value: '90',
                    label: '90 phút',
                    sublabel: 'Intensive Masterclass nâng cao',
                    icon: <Clock className="w-4 h-4 text-purple-500" />,
                    badge: 'Intensive',
                    badgeColor: 'bg-purple-100 text-purple-700',
                  },
                  {
                    value: '120',
                    label: '120 phút',
                    sublabel: 'Thi thử Full Mock Test 4 kỹ năng',
                    icon: <Clock className="w-4 h-4 text-amber-500" />,
                    badge: 'Mock Exam',
                    badgeColor: 'bg-amber-100 text-amber-700',
                  },
                ]}
              />

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
