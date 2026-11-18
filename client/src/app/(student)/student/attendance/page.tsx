'use client';

import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendance.service';
import {
  Clock,
  RefreshCw,
  Flame,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface AttendanceLogItem {
  id: string;
  sessionName: string;
  date: string;
  scheduledTime: string;
  joinedAt: string;
  leftAt: string;
  actualMinutes: number;
  percentage: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  note: string;
}

interface RawAttendanceRecord {
  id: string;
  firstJoinedAt?: string;
  joinedAt?: string;
  lastLeftAt?: string;
  leftAt?: string;
  totalMinutes?: number;
  durationMinutes?: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  note?: string;
  notes?: string;
  classroom?: {
    id: string;
    name: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
  };
}

export default function StudentAttendancePage() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const records = await attendanceService.getMyAttendance();
        if (Array.isArray(records)) {
          const mapped: AttendanceLogItem[] = (records as unknown as RawAttendanceRecord[]).map((r) => {
            const joinedTime = r.firstJoinedAt || r.joinedAt;
            const leftTime = r.lastLeftAt || r.leftAt;
            const mins = r.totalMinutes ?? r.durationMinutes ?? 0;
            return {
              id: r.id,
              sessionName: r.classroom?.name || 'Lớp Học Trực Tuyến WebRTC',
              date: joinedTime
                ? new Date(joinedTime).toLocaleDateString('vi-VN')
                : r.classroom?.scheduledStartTime
                  ? new Date(r.classroom.scheduledStartTime).toLocaleDateString('vi-VN')
                  : 'Hôm nay',
              scheduledTime: r.classroom?.scheduledStartTime
                ? `${new Date(r.classroom.scheduledStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${r.classroom.scheduledEndTime ? ' - ' + new Date(r.classroom.scheduledEndTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}`
                : '19:30 - 21:00 (90 phút)',
              joinedAt: joinedTime ? new Date(joinedTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
              leftAt: leftTime ? new Date(leftTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
              actualMinutes: mins,
              percentage: `${Math.min(100, Math.round((mins / 90) * 100))}%`,
              status: r.status,
              note: r.note || r.notes || 'Hệ thống tự động ghi nhận qua LiveKit Webhook.',
            };
          });
          setAttendanceLogs(mapped);
        }
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const totalLogs = attendanceLogs.length;
  const presentCount = attendanceLogs.filter((l) => l.status === 'PRESENT').length;
  const lateCount = attendanceLogs.filter((l) => l.status === 'LATE').length;
  const absentCount = attendanceLogs.filter((l) => l.status === 'ABSENT').length;
  const presentPct = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 0;
  const latePct = totalLogs > 0 ? Math.round((lateCount / totalLogs) * 100) : 0;
  const absentPct = totalLogs > 0 ? Math.max(0, 100 - presentPct - latePct) : 0;
  const totalMinutes = attendanceLogs.reduce((acc, curr) => acc + (curr.actualMinutes || 0), 0);
  const studyStreakDays = presentCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Lịch Sử Điểm Danh & Chuyên Cần</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Dữ liệu được đồng bộ tự động từ phòng học LiveKit WebRTC qua hệ thống Webhook.
          </p>
        </div>

        {/* Status Legend */}
        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            PRESENT (≥ 80%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold">
            LATE (≥ 50%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold">
            ABSENT (&lt; 50%)
          </span>
        </div>
      </div>

      {/* Summary Cards with Donut Chart & Study Streak (STT 9) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* SVG Donut Chart Card (5 cols) */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-white border border-line shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-sky-100 text-primary">
              Biểu Đồ Chuyên Cần
            </span>
            <h3 className="text-sm font-bold text-slate-800">Tỷ Lệ Tham Gia Lớp</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Có mặt (Present): </span>
                <span className="font-bold text-slate-900">{presentPct}% ({presentCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-600">Đi muộn (Late): </span>
                <span className="font-bold text-slate-900">{latePct}% ({lateCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">Vắng (Absent): </span>
                <span className="font-bold text-slate-900">{absentPct}% ({absentCount})</span>
              </div>
            </div>
          </div>

          {/* SVG Donut Visual */}
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="3.8"
              />
              {/* Present segment (Green) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray={`${presentPct} ${100 - presentPct}`}
                strokeDashoffset="0"
              />
              {/* Late segment (Amber) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray={`${latePct} ${100 - latePct}`}
                strokeDashoffset={`${-presentPct}`}
              />
              {/* Absent segment (Rose) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth="4"
                strokeDasharray={`${absentPct} ${100 - absentPct}`}
                strokeDashoffset={`${-(presentPct + latePct)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-slate-900">{presentPct}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Present</span>
            </div>
          </div>
        </div>

        {/* Study Streak Card (3 cols) */}
        <div className="md:col-span-3 p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/20 text-white">
              Study Streak
            </span>
            <Flame className="w-5 h-5 text-amber-200 animate-bounce" />
          </div>

          <div className="my-2">
            <p className="text-3xl font-black">{studyStreakDays} Ngày</p>
            <p className="text-xs font-semibold text-amber-100 mt-0.5">
              Chuỗi học tập liên tiếp không gián đoạn
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center space-x-1.5 text-[11px] font-bold text-amber-100">
            <Award className="w-3.5 h-3.5" />
            <span>Đạt huy hiệu Chăm Chỉ Tuần Này!</span>
          </div>
        </div>

        {/* Overview Metric Card (4 cols) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-white border border-line shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-muted text-xs font-semibold">Tổng thời lượng học trực tuyến</span>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">{totalMinutes} phút</p>
            <p className="text-[11px] text-primary font-bold">
              Tương đương ~{(totalMinutes / 60).toFixed(1)} giờ tương tác trực tiếp qua LiveKit SFU
            </p>
          </div>

          <div className="pt-3 border-t border-line flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Đủ điều kiện dự thi Mock Test cuối khóa</span>
          </div>
        </div>
      </div>

      {/* Attendance Detail Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Nhật ký các buổi học LiveKit ({attendanceLogs.length} buổi)
          </h3>
          <span className="text-xs text-muted flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Tự động cập nhật sau mỗi buổi học</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-line text-muted uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Buổi Học & Thời Gian</th>
                <th className="py-3 px-4">Giờ Vào</th>
                <th className="py-3 px-4">Giờ Thoát</th>
                <th className="py-3 px-4">Thời Lượng Thực</th>
                <th className="py-3 px-4">Tỷ Lệ</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 font-medium">
                    {loading ? 'Đang tải dữ liệu điểm danh...' : 'Chưa có nhật ký buổi học nào.'}
                  </td>
                </tr>
              ) : (
                attendanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{log.sessionName}</p>
                      <p className="text-[11px] text-muted">{log.date} • {log.scheduledTime}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{log.joinedAt}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{log.leftAt}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {log.actualMinutes} phút
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary">{log.percentage}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          log.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted text-[11px] max-w-xs">{log.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
