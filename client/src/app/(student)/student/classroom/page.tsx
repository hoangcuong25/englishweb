'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { livekitService, LivekitRoom } from '@/services/livekit.service';
import {
  Video,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function StudentClassroomSchedulePage() {
  const [rooms, setRooms] = useState<LivekitRoom[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const data = await livekitService.getRooms();
        if (data && data.length > 0) {
          setRooms(data);
        }
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const defaultRooms = [
    {
      id: 'ielts-masterclass-room',
      title: 'IELTS Speaking Part 2 Forecast — Intensive Mock Session',
      instructor: 'Thầy Đông (IELTS 8.5)',
      scheduledTime: '19:30 - 21:00 (Tối nay)',
      isLive: true,
      participants: '7/8 học viên',
      status: 'LIVE_NOW',
    },
    {
      id: 'room-writing-workshop',
      title: 'Writing Task 2 Academic Collocations Workshop',
      instructor: 'Thầy Đông (IELTS 8.5)',
      scheduledTime: '19:30 - 21:00 (Thứ Tư, 11/11/2026)',
      isLive: false,
      participants: '8/8 học viên',
      status: 'UPCOMING',
    },
    {
      id: 'room-pronunciation-clinic',
      title: 'Pronunciation & Intonation Clinic with Native Coach',
      instructor: 'Teacher Dong & Guest Coach',
      scheduledTime: '19:30 - 21:00 (Thứ Sáu, 13/11/2026)',
      isLive: false,
      participants: '6/8 học viên',
      status: 'UPCOMING',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Lịch Lớp Học Trực Tuyến LiveKit WebRTC</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Quy chuẩn phòng học 1 Host + 8 Học viên với độ trễ thấp và bảng trắng tương tác.
          </p>
        </div>
      </div>

      {/* Live Now Card */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-deep to-primary text-white p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>PHÒNG HỌC ĐANG MỞ (LIVE NOW)</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
            IELTS Speaking Part 2 Forecast — Intensive Mock Session
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Giảng viên: <strong>Thầy Đông (IELTS 8.5)</strong> • Quy mô: 7/8 học viên • Độ trễ WebRTC: &lt; 200ms
          </p>
          <div className="text-[11px] text-amber-300 bg-black/20 px-3 py-1 rounded-lg w-fit">
            💡 Lưu ý chuyên cần: Vào trước 19:45 để hệ thống tự động ghi nhận PRESENT.
          </div>
        </div>

        <Link
          href={`/student/classroom/${rooms[0]?.name || 'ielts-masterclass-room'}`}
          className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-slate-900 font-extrabold text-xs shadow-lg shadow-accent/20 transition flex items-center space-x-2 whitespace-nowrap"
        >
          <Video className="w-4 h-4" />
          <span>Vào Phòng Học Ngay</span>
        </Link>
      </div>

      {/* Upcoming Schedule List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Các Buổi Học Sắp Diễn Ra Trong Tuần
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultRooms.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl bg-white border border-line shadow-sm space-y-3 hover:border-primary/40 transition"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    room.isLive
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {room.status}
                </span>
                <span className="text-xs font-mono text-muted">{room.participants}</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{room.title}</h4>
                <p className="text-xs text-muted mt-0.5">Giảng viên: {room.instructor}</p>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center space-x-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{room.scheduledTime}</span>
                </span>

                <Link
                  href={`/student/classroom/${room.id}`}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-xs"
                >
                  {room.isLive ? 'Vào Phòng' : 'Xem Chi Tiết'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
