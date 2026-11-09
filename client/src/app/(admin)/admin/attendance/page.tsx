'use client';

import React, { useState } from 'react';
import {
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  sessionTitle: string;
  joinedAt: string;
  leftAt: string;
  totalMinutes: number;
  percentage: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  isManualOverride: boolean;
  auditNote?: string;
}

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([
    {
      id: 'rec-1',
      studentId: 'HV-0102',
      studentName: 'Trần Văn Nam',
      email: 'nam.tran@gmail.com',
      sessionTitle: 'IELTS Speaking Part 2 Forecast (90m)',
      joinedAt: '19:32',
      leftAt: '21:01',
      totalMinutes: 89,
      percentage: 98.8,
      status: 'PRESENT',
      isManualOverride: false,
    },
    {
      id: 'rec-2',
      studentId: 'HV-0105',
      studentName: 'Lê Thị Mai',
      email: 'mai.le@gmail.com',
      sessionTitle: 'IELTS Speaking Part 2 Forecast (90m)',
      joinedAt: '19:48',
      leftAt: '21:00',
      totalMinutes: 72,
      percentage: 80.0,
      status: 'LATE',
      isManualOverride: false,
    },
    {
      id: 'rec-3',
      studentId: 'HV-0110',
      studentName: 'Nguyễn Tiến Dũng',
      email: 'dung.nguyen@gmail.com',
      sessionTitle: 'IELTS Speaking Part 2 Forecast (90m)',
      joinedAt: '-',
      leftAt: '-',
      totalMinutes: 0,
      percentage: 0,
      status: 'ABSENT',
      isManualOverride: false,
    },
  ]);

  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'PRESENT' | 'LATE' | 'ABSENT'>('PRESENT');
  const [auditNote, setAuditNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [exportNotice, setExportNotice] = useState('');

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setOverrideStatus(rec.status);
    setAuditNote(rec.auditNote || '');
    setErrorMessage('');
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditNote.trim() || auditNote.trim().length < 10) {
      setErrorMessage('Quy tắc VAL-ATT-001: Lý do điều chỉnh điểm danh bắt buộc tối thiểu 10 ký tự để minh bạch dữ liệu.');
      return;
    }

    if (!editingRecord) return;

    setRecords((prev) =>
      prev.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              status: overrideStatus,
              isManualOverride: true,
              auditNote: auditNote.trim(),
            }
          : r
      )
    );

    setEditingRecord(null);
  };

  const handleExportExcel = () => {
    // Generate CSV UTF-8 BOM
    const headers = [
      'Mã Học Viên',
      'Họ và Tên',
      'Email',
      'Buổi Học',
      'Giờ Vào',
      'Giờ Ra',
      'Tổng Phút',
      'Tỷ Lệ (%)',
      'Trạng Thái',
      'Điều Chỉnh Thủ Công',
      'Lý Do Audit Note',
    ];

    const rows = records.map((r) => [
      r.studentId,
      `"${r.studentName}"`,
      r.email,
      `"${r.sessionTitle}"`,
      r.joinedAt,
      r.leftAt,
      r.totalMinutes,
      r.percentage,
      r.status,
      r.isManualOverride ? 'CÓ' : 'KHÔNG',
      `"${r.auditNote || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TeacherDong_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Đã xuất báo cáo chuyên cần (.csv UTF-8 BOM / Excel) thành công!');
    setTimeout(() => setExportNotice(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý & Báo Cáo Điểm Danh Chuyên Cần
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Dữ liệu ghi nhận tự động qua LiveKit Webhook và cho phép Admin điều chỉnh minh bạch.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel (.xlsx)</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách điểm danh buổi học gần nhất
          </h3>
          <span className="text-[11px] text-muted">Tổng: {records.length} học viên</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-line text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">Mã HV & Họ Tên</th>
                <th className="py-3 px-4">Giờ Vào / Ra</th>
                <th className="py-3 px-4">Tổng Phút</th>
                <th className="py-3 px-4">Tỷ Lệ %</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Lý Do Audit Note</th>
                <th className="py-3 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{rec.studentName}</p>
                    <span className="text-[11px] text-muted font-mono">{rec.studentId} • {rec.email}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {rec.joinedAt} ➔ {rec.leftAt}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">
                    {rec.totalMinutes} phút
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary">
                    {rec.percentage}%
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-700'
                            : rec.status === 'LATE'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                      {rec.isManualOverride && (
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                          Admin sửa
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs text-[11px]">
                    {rec.auditNote || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs transition inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override Modal (#attModal - Form 11 in Plan) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Điều Chỉnh Điểm Danh Chuyên Cần
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ tên học viên (Read-only)
                </label>
                <input
                  type="text"
                  readOnly
                  value={editingRecord.studentName}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-line text-xs font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thời lượng LiveKit ghi nhận (Phút)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${editingRecord.totalMinutes} phút (${editingRecord.percentage}%)`}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-line text-xs font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng thái điều chỉnh mới <span className="text-red-500">*</span>
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as 'PRESENT' | 'LATE' | 'ABSENT')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:outline-none focus:border-primary text-xs bg-white font-bold"
                >
                  <option value="PRESENT">PRESENT (Đúng giờ)</option>
                  <option value="LATE">LATE (Đi muộn)</option>
                  <option value="ABSENT">ABSENT (Vắng mặt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý do điều chỉnh (Audit Note bắt buộc $\ge 10$ ký tự) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Ví dụ: Học viên xin phép vào muộn 10 phút do kẹt xe hoặc gặp lỗi mạng cáp quang..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:outline-none focus:border-primary text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  Lưu & Cập Nhật Điểm Danh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

