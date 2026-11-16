'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  livekitService,
  LivekitRoom,
  StudentClassroomHistoryResponse,
  StudentClassroomHistoryItem,
} from '@/services/livekit.service';
import {
  Video,
  Clock,
  RefreshCw,
  Users,
  Calendar,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  BookOpen,
} from 'lucide-react';

export default function StudentClassroomSchedulePage() {
  const [activeTab, setActiveTab] = useState<'live_sessions' | 'history'>('live_sessions');
  const [rooms, setRooms] = useState<LivekitRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // History states
  const [historyData, setHistoryData] = useState<StudentClassroomHistoryResponse>({
    summary: { totalPastRooms: 0, joinedCount: 0, missedCount: 0, attendanceRate: 100 },
    history: [],
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'JOINED' | 'MISSED'>('ALL');
  const [historySearch, setHistorySearch] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await livekitService.getRooms();
      if (data && Array.isArray(data)) {
        setRooms(data);
      }
    } catch (err) {
      console.error('Error fetching student classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await livekitService.getStudentHistory();
      if (data && data.history) {
        setHistoryData(data);
      }
    } catch (err) {
      console.error('Error fetching student classroom history:', err);
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

  const activeRoom = validRooms.find((r) => r.status === 'ACTIVE') || validRooms[0];

  const formatScheduleTime = (startTime?: string, endTime?: string) => {
    if (!startTime) return '19:30 - 21:00 (Hôm nay)';
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

  const formatTimeOnly = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  // Filter history items
  const filteredHistory = historyData.history.filter((item) => {
    // Only show past or ended classrooms in the history tab
    if (!item.isPastOrEnded) return false;

    if (historyFilter === 'JOINED' && !item.hasJoined) return false;
    if (historyFilter === 'MISSED' && item.hasJoined) return false;

    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCourse = item.course?.title?.toLowerCase().includes(q);
      if (!matchName && !matchCourse) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Lịch Lớp Học Trực Tuyến LiveKit WebRTC</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </h1>
          <p className="text-xs text-muted mt-1">
            Quy chuẩn phòng học 1 Host + 8 Học viên với độ trễ siêu thấp &lt; 150ms và bảng trắng tương tác thời gian thực.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchRooms();
            fetchHistory();
          }}
          className="p-2.5 rounded-xl bg-white border border-line hover:border-primary text-slate-600 hover:text-primary transition shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="Làm mới lịch học"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || historyLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-3 border-b border-line pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('live_sessions')}
          className={`px-4 py-2.5 text-xs font-black rounded-2xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'live_sessions'
              ? 'bg-primary text-white shadow-sm shadow-primary/25'
              : 'bg-white border border-line text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Lớp Trực Tuyến & Sắp Diễn Ra</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'live_sessions'
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
          <span>Lịch Sử Lớp Học (Đã Join / Chưa Join)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'history'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {historyData.summary.totalPastRooms}
          </span>
        </button>
      </div>

      {activeTab === 'live_sessions' ? (
        <>
          {/* Live / Featured Room Card */}
          {activeRoom ? (
            <div className="rounded-3xl bg-gradient-to-r from-[#11243B] via-[#1B64B0] to-[#257ad4] text-white p-6 sm:p-7 shadow-xl shadow-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10.5px] font-black uppercase border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{activeRoom.status === 'ACTIVE' ? 'PHÒNG HỌC ĐANG MỞ (LIVE NOW)' : 'CA HỌC TIẾP THEO'}</span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
                  {activeRoom.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-200">
                  Giảng viên Host: <strong>{activeRoom.host?.fullName || 'Thầy Đông (IELTS 8.5)'}</strong> • Khóa học: <strong>{activeRoom.course?.title || 'IELTS Comprehensive Masterclass'}</strong>
                </p>

                <div className="text-[11px] text-amber-300 bg-black/25 px-3 py-1.5 rounded-xl w-fit flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Thời gian: {formatScheduleTime(activeRoom.scheduledStartTime, activeRoom.scheduledEndTime)}</span>
                </div>
              </div>

              <Link
                href={`/student/classroom/${encodeURIComponent(activeRoom.name)}`}
                className="shrink-0 px-6 py-3.5 rounded-2xl bg-[#FFB547] hover:bg-[#FFA726] active:scale-95 text-[#14263D] font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <Video className="w-4 h-4 text-[#14263D]" />
                <span>Vào Phòng Học Ngay</span>
              </Link>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-line text-center space-y-3 shadow-xs">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Chưa có ca học trực tuyến nào được lên lịch</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Thầy Đông sẽ sớm lên lịch các buổi học Speaking & Writing thảo luận. Vui lòng quay lại sau hoặc kiểm tra thông báo.
              </p>
            </div>
          )}

          {/* Upcoming Schedule List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Danh Sách Các Ca Học Đang Mở & Sắp Diễn Ra ({validRooms.length})
              </h3>
            </div>

            {validRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {validRooms.map((room) => {
                  const isLive = room.status === 'ACTIVE';
                  const roomUrl = `/student/classroom/${encodeURIComponent(room.name)}`;
                  const graceRemaining = getGracePeriodRemainingMins(room.scheduledEndTime);

                  return (
                    <div
                      key={room.id || room.name}
                      className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3.5 hover:border-primary/50 transition"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              isLive
                                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                                : 'bg-sky-100 text-primary'
                            }`}
                          >
                            {isLive ? 'ĐANG DIỄN RA' : 'ĐÃ LÊN LỊCH'}
                          </span>
                          {graceRemaining !== null && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse border border-amber-300">
                              Sắp đóng ({graceRemaining}p)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{room._count?.attendanceRecords || 0}/8 học viên</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">
                          {room.name}
                        </h4>
                        <p className="text-xs text-muted mt-0.5">
                          Giảng viên: <strong className="text-slate-700">{room.host?.fullName || 'Teacher Dong'}</strong>
                          {room.course?.title && ` • ${room.course.title}`}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-line flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center space-x-1.5 text-[11px] font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatScheduleTime(room.scheduledStartTime, room.scheduledEndTime)}</span>
                        </span>

                        <Link
                          href={roomUrl}
                          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-xs"
                        >
                          {isLive ? 'Vào Phòng Ngay' : 'Tham Gia Phòng'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        /* History Sub-tab View for Student */
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Tổng Ca Học Đã Qua</span>
              <p className="text-2xl font-black text-slate-900">{historyData.summary.totalPastRooms}</p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Đã Tham Gia (Joined)</span>
              <p className="text-2xl font-black text-emerald-600">{historyData.summary.joinedCount}</p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Chưa Tham Gia / Vắng</span>
              <p className="text-2xl font-black text-rose-600">{historyData.summary.missedCount}</p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-line shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase">Tỷ Lệ Chuyên Cần</span>
              <p className="text-2xl font-black text-primary">{historyData.summary.attendanceRate}%</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHistoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  historyFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-line text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả ({historyData.summary.totalPastRooms})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('JOINED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  historyFilter === 'JOINED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-line text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã tham gia ({historyData.summary.joinedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('MISSED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  historyFilter === 'MISSED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-line text-rose-700 hover:bg-rose-50'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Chưa tham gia ({historyData.summary.missedCount})</span>
              </button>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Tìm ca học, khóa học..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-line focus:outline-none focus:border-primary bg-white font-medium"
              />
            </div>
          </div>

          {/* History List */}
          {filteredHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => {
                const joined = item.hasJoined;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-3xl bg-white border shadow-xs space-y-3.5 transition ${
                      joined
                        ? 'border-emerald-200/80 hover:border-emerald-400'
                        : 'border-rose-200/80 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.course?.title || 'IELTS Masterclass'}
                      </span>

                      {joined ? (
                        <span className="text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            ĐÃ THAM GIA {item.attendanceStatus === 'LATE' ? '(VÀO MUỘN)' : '(ĐÚNG GIỜ)'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>CHƯA THAM GIA / VẮNG</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted mt-0.5">
                        Giảng viên Host: <strong className="text-slate-700">{item.host?.fullName || 'Teacher Dong'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span>{formatScheduleTime(item.scheduledStartTime, item.scheduledEndTime)}</span>
                    </div>

                    {/* Attendance Meta Details */}
                    <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                      {joined ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <span>Thời lượng học: <strong>{item.totalMinutes} phút</strong></span>
                          </span>
                          {item.firstJoinedAt && (
                            <p className="text-[10.5px] text-slate-500">
                              Vào: {formatTimeOnly(item.firstJoinedAt)} {item.lastLeftAt ? `• Rời: ${formatTimeOnly(item.lastLeftAt)}` : ''}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Chưa ghi nhận điểm danh (0 phút)</span>
                        </span>
                      )}

                      <span className="text-[10.5px] font-bold text-slate-400">
                        Đã kết thúc
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-line text-center space-y-3 shadow-xs">
              <History className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                {historyFilter === 'JOINED'
                  ? 'Bạn chưa tham gia ca học nào'
                  : historyFilter === 'MISSED'
                  ? 'Tuyệt vời! Bạn không bỏ lỡ ca học nào'
                  : 'Chưa có lịch sử ca học nào'}
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Khi các ca học trực tuyến hoàn thành, kết quả chuyên cần của bạn sẽ được tự động tổng hợp tại đây.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
