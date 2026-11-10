'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { livekitService, LivekitRoom } from '@/services/livekit.service';
import {
  Video,
  Clock,
  RefreshCw,
  Users,
  Calendar,
} from 'lucide-react';

export default function StudentClassroomSchedulePage() {
  const [rooms, setRooms] = useState<LivekitRoom[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchRooms();
  }, []);

  const activeRoom = rooms.find((r) => r.status === 'ACTIVE') || rooms[0];

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
          onClick={fetchRooms}
          className="p-2.5 rounded-xl bg-white border border-line hover:border-primary text-slate-600 hover:text-primary transition shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="Làm mới lịch học"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

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
            Danh Sách Các Ca Học Đang Mở & Sắp Diễn Ra ({rooms.length})
          </h3>
        </div>

        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => {
              const isLive = room.status === 'ACTIVE';
              const roomUrl = `/student/classroom/${encodeURIComponent(room.name)}`;

              return (
                <div
                  key={room.id || room.name}
                  className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-3.5 hover:border-primary/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isLive
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : 'bg-sky-100 text-primary'
                      }`}
                    >
                      {isLive ? 'ĐANG DIỄN RA' : 'ĐÃ LÊN LỊCH'}
                    </span>
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
    </div>
  );
}
