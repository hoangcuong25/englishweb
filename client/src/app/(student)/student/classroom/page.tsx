'use client';

import React from 'react';
import Link from 'next/link';
import {
  Video,
  Clock,
} from 'lucide-react';

export default function StudentClassroomSchedulePage() {
  const rooms = [
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
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Lịch Lớp Học Trực Tuyến LiveKit WebRTC
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Quy chuẩn phòng học 1 Host + 8 Học viên với độ trễ thấp và bảng trắng tương tác.
        </p>
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
          <p className="text-xs text-slate-200">
            Giảng viên: <strong>Thầy Đông (IELTS 8.5)</strong> • Thời lượng: 90 phút • Đã có 7 bạn trong phòng.
          </p>
          <div className="text-[11px] text-amber-300 font-semibold pt-1">
            * Nhớ vào phòng trong vòng 15 phút đầu để được tính điểm danh PRESENT!
          </div>
        </div>

        <Link
          href="/student/classroom/ielts-masterclass-room"
          className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-slate-900 font-extrabold text-xs shadow-lg shadow-accent/20 transition flex items-center justify-center space-x-2"
        >
          <Video className="w-4 h-4" />
          <span>Vào Phòng Học Ngay</span>
        </Link>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden space-y-4 p-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Lịch học WebRTC các buổi tiếp theo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-xl border border-line bg-slate-50/50 hover:bg-white hover:border-primary/40 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-primary">
                    1 Host + 8 SV
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {room.participants}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {room.title}
                </h4>
                <p className="text-xs text-slate-600">
                  Chủ tọa: <strong>{room.instructor}</strong>
                </p>
                <div className="flex items-center space-x-1.5 text-xs text-primary font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{room.scheduledTime}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-between">
                <span className="text-[11px] text-muted">Bảo mật Token ngắn hạn</span>
                <Link
                  href={`/student/classroom/${room.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs transition"
                >
                  {room.isLive ? 'Vào Phòng Ngay' : 'Đăng Ký Tham Gia'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

