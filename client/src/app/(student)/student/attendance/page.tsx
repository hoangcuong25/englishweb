'use client';

import React from 'react';
import {
  Clock,
} from 'lucide-react';

export default function StudentAttendancePage() {
  const attendanceLogs = [
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Lịch Sử Điểm Danh Chuyên Cần Cá Nhân
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Ghi nhận thời gian thực qua LiveKit Webhook và thuật toán tính phút tự động.
        </p>
      </div>

      {/* Rules Notice Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs leading-relaxed text-slate-700 flex items-start space-x-3">
        <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-primary font-bold">Quy tắc tính chuyên cần chuẩn (attendance-sync):</strong>
          <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-slate-600">
            <li><strong>PRESENT:</strong> Tham gia phòng LiveKit trong vòng <strong>15 phút đầu</strong> và thời lượng học đạt $\ge 80\%$.</li>
            <li><strong>LATE:</strong> Tham gia sau 15 phút đầu kể từ giờ bắt đầu buổi học.</li>
            <li><strong>ABSENT:</strong> Không tham gia hoặc thời lượng học dưới $30\%$.</li>
          </ul>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <span className="text-xs font-semibold text-muted">Tổng buổi học</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">24</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <span className="text-xs font-semibold text-muted">Đúng giờ (PRESENT)</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">21</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <span className="text-xs font-semibold text-muted">Muộn (LATE)</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">2</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
          <span className="text-xs font-semibold text-muted">Vắng (ABSENT)</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">1</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Chi tiết các buổi học WebRTC gần nhất
          </h3>
          <span className="text-[11px] text-muted">Tự động đồng bộ LiveKit SFU</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-line text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">Buổi Học & Ngày</th>
                <th className="py-3 px-4">Giờ Vào / Ra</th>
                <th className="py-3 px-4">Thời Lượng (Phút)</th>
                <th className="py-3 px-4">Tỷ Lệ %</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {attendanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{log.sessionName}</p>
                    <span className="text-[11px] text-muted">{log.date} • {log.scheduledTime}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {log.joinedAt} ➔ {log.leftAt}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">
                    {log.actualMinutes} phút
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary">
                    {log.percentage}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        log.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.status === 'LATE'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs text-[11px]">
                    {log.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

