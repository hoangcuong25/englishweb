'use client';

import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendance.service';
import {
  Clock,
  RefreshCw,
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

export default function StudentAttendancePage() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogItem[]>([
    {
      id: 'att-1',
      sessionName: 'IELTS Speaking Part 2 Forecast — Ca 1',
      date: '08/11/2026',
      scheduledTime: '19:30 - 21:00 (90 phút)',
      joinedAt: '19:33',
      leftAt: '21:02',
      actualMinutes: 89,
      percentage: '98.8%',
      status: 'PRESENT',
      note: 'Vào đúng giờ (trong 15p đầu), tham gia đầy đủ buổi học.',
    },
    {
      id: 'att-2',
      sessionName: 'Writing Task 2 Academic Collocations Workshop',
      date: '05/11/2026',
      scheduledTime: '19:30 - 21:00 (90 phút)',
      joinedAt: '19:50',
      leftAt: '21:00',
      actualMinutes: 70,
      percentage: '77.7%',
      status: 'LATE',
      note: 'Tham gia sau 15 phút đầu do kẹt xe. Webhook LiveKit tự động tính LATE.',
    },
    {
      id: 'att-3',
      sessionName: 'Grammar Mastery: Inversion & Cleft Sentences',
      date: '02/11/2026',
      scheduledTime: '19:30 - 21:00 (90 phút)',
      joinedAt: '19:31',
      leftAt: '20:58',
      actualMinutes: 87,
      percentage: '96.6%',
      status: 'PRESENT',
      note: 'Admin kiểm duyệt: Có mặt đầy đủ.',
    },
    {
      id: 'att-4',
      sessionName: 'Pronunciation & Intonation Clinic with Native Coach',
      date: '29/10/2026',
      scheduledTime: '19:30 - 21:00 (90 phút)',
      joinedAt: '-',
      leftAt: '-',
      actualMinutes: 0,
      percentage: '0%',
      status: 'ABSENT',
      note: 'Vắng không phép. Đã gửi video bản ghi Cloud Recording qua email.',
    },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const records = await attendanceService.getMyAttendance();
        if (records && records.length > 0) {
          const mapped: AttendanceLogItem[] = records.map((r) => ({
            id: r.id,
            sessionName: 'Lớp Học Trực Tuyến WebRTC',
            date: r.joinedAt ? new Date(r.joinedAt).toLocaleDateString('vi-VN') : '08/11/2026',
            scheduledTime: '19:30 - 21:00 (90 phút)',
            joinedAt: r.joinedAt ? new Date(r.joinedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
            leftAt: r.leftAt ? new Date(r.leftAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
            actualMinutes: r.durationMinutes || 0,
            percentage: `${Math.round(((r.durationMinutes || 0) / 90) * 100)}%`,
            status: r.status,
            note: r.notes || 'Hệ thống tự động ghi nhận qua LiveKit Webhook.',
          }));
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

      {/* 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm space-y-1">
          <span className="text-muted text-xs font-semibold">Tỷ lệ chuyên cần tổng thể</span>
          <p className="text-2xl font-extrabold text-slate-900">85.7%</p>
          <p className="text-[11px] text-emerald-600 font-bold">✓ Đủ điều kiện dự thi Mock Test cuối khóa</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm space-y-1">
          <span className="text-muted text-xs font-semibold">Tổng số buổi đã tham gia</span>
          <p className="text-2xl font-extrabold text-slate-900">3 / 4 buổi</p>
          <p className="text-[11px] text-muted">2 buổi Present • 1 buổi Late</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-line shadow-sm space-y-1">
          <span className="text-muted text-xs font-semibold">Tổng thời lượng học trực tuyến</span>
          <p className="text-2xl font-extrabold text-slate-900">246 phút</p>
          <p className="text-[11px] text-primary font-bold">Tương đương ~4.1 giờ luyện tập trực tiếp</p>
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
              {attendanceLogs.map((log) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
