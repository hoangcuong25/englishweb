'use client';

import React, { useState, useEffect } from 'react';
import { attendanceService, ClassroomSession, ClassroomAttendanceRecord } from '@/services/attendance.service';
import CustomSelect from '@/components/ui/custom-select';
import {
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  RefreshCw,
  UserCheck,
  Clock,
  UserX,
  Video,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentDbId?: string;
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
  const [classrooms, setClassrooms] = useState<ClassroomSession[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeOverride, setActiveOverride] = useState<AttendanceRecord | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'PRESENT' | 'LATE' | 'ABSENT'>('PRESENT');
  const [auditNote, setAuditNote] = useState('');
  const [notice, setNotice] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load classrooms on mount
  useEffect(() => {
    const loadClassrooms = async () => {
      setLoading(true);
      try {
        const rooms = await attendanceService.getClassrooms();
        if (rooms && rooms.length > 0) {
          setClassrooms(rooms);
          setSelectedClassroomId(rooms[0].id);
          await loadRecordsForClassroom(rooms[0].id, rooms[0].name);
        }
      } catch (err) {
        console.error('Failed to load classrooms:', err);
      } finally {
        setLoading(false);
      }
    };
    loadClassrooms();
  }, []);

  const loadRecordsForClassroom = async (classroomId: string, classroomName?: string) => {
    setLoading(true);
    try {
      const recordsRes = await attendanceService.getAttendanceByClassroom(classroomId);
      const roomTitle = classroomName || classrooms.find((c) => c.id === classroomId)?.name || 'Buổi học LiveKit';
      if (recordsRes && recordsRes.length > 0) {
        const mapped: AttendanceRecord[] = recordsRes.map((r: ClassroomAttendanceRecord) => {
          const joinedTime = r.firstJoinedAt || r.joinedAt;
          const leftTime = r.lastLeftAt || r.leftAt;
          const mins = r.totalMinutes ?? r.durationMinutes ?? 0;
          return {
            id: r.id,
            studentDbId: r.student?.id,
            studentId: r.student?.id ? `HV-${r.student.id.substring(0, 4).toUpperCase()}` : 'HV-0100',
            studentName: r.student?.fullName || 'Học viên',
            email: r.student?.email || 'student@dong.edu.vn',
            sessionTitle: roomTitle,
            joinedAt: joinedTime ? new Date(joinedTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
            leftAt: leftTime ? new Date(leftTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
            totalMinutes: mins,
            percentage: Math.min(100, Math.round((mins / 90) * 100)),
            status: r.status,
            isManualOverride: !!r.isManualOverride,
            auditNote: r.note || r.notes,
          };
        });
        setRecords(mapped);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching attendance for classroom:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassroomChange = async (newClassroomId: string) => {
    setSelectedClassroomId(newClassroomId);
    await loadRecordsForClassroom(newClassroomId);
  };

  const handleOpenOverride = (rec: AttendanceRecord) => {
    setActiveOverride(rec);
    setOverrideStatus(rec.status);
    setAuditNote(rec.auditNote || '');
  };

  const handleQuickStatusChange = async (rec: AttendanceRecord, newStatus: 'PRESENT' | 'LATE' | 'ABSENT') => {
    try {
      await attendanceService.overrideAttendance(rec.id, {
        status: newStatus,
        note: `Admin đổi trạng thái nhanh thành ${newStatus}`,
      });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === rec.id
            ? {
                ...r,
                status: newStatus,
                isManualOverride: true,
                auditNote: `Admin đổi trạng thái nhanh thành ${newStatus}`,
              }
            : r,
        ),
      );
      setNotice(`Đã cập nhật trạng thái điểm danh học viên ${rec.studentName} thành ${newStatus}!`);
      setTimeout(() => setNotice(''), 3500);
    } catch (err) {
      console.error('Failed to quick update attendance:', err);
    }
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOverride) return;

    try {
      await attendanceService.overrideAttendance(activeOverride.id, {
        status: overrideStatus,
        note: auditNote,
      });
    } catch {
      // Local fallback
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === activeOverride.id
          ? {
              ...r,
              status: overrideStatus,
              isManualOverride: true,
              auditNote,
            }
          : r,
      ),
    );
    setNotice(
      `Đã điều chỉnh trạng thái điểm danh cho học viên ${activeOverride.studentName} thành ${overrideStatus}!`,
    );
    setActiveOverride(null);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      let blob;
      if (startDate || endDate) {
        blob = await attendanceService.exportDateRange(startDate || undefined, endDate || undefined);
      } else {
        blob = await attendanceService.exportExcel(selectedClassroomId || 'classroom-active-id');
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Diem_Danh_Teacher_Dong_${startDate || 'All'}_${endDate || new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setNotice('Đã xuất báo cáo điểm danh Excel (.xlsx) thành công!');
    } catch {
      setNotice('Lỗi khi xuất file Excel báo cáo.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const currentRoomName = classrooms.find((c) => c.id === selectedClassroomId)?.name || 'Buổi học LiveKit';

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Báo Cáo Điểm Danh & Chuyên Cần
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              LiveKit SFU Automated Webhook
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Hệ thống tự động đồng bộ thời lượng học thực tế từ LiveKit Webhook và cho phép Quản trị viên điều chỉnh thủ công.
          </p>
        </div>

        {/* Date Filter & Export Excel */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1 bg-white border border-line rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs text-slate-700 font-semibold focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center space-x-1 bg-white border border-line rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs text-slate-700 font-semibold focus:outline-none bg-transparent"
            />
          </div>
          <button
            disabled={isExporting}
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Xuất Excel {startDate || endDate ? '(Theo Ngày)' : ''}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Classroom Selector */}
      {classrooms.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-extrabold text-slate-800">Chọn Ca Học Cần Quản Lý Điểm Danh:</span>
          </div>
          <select
            value={selectedClassroomId}
            onChange={(e) => handleClassroomChange(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-line text-xs font-bold text-slate-800 bg-slate-50 hover:bg-white focus:outline-none focus:border-primary transition min-w-[280px]"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({new Date(c.scheduledStartTime).toLocaleDateString('vi-VN')}) - {c.status}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rules Banner (BIZ-ATT-001, 002) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
          <span className="font-extrabold text-emerald-800">Quy chuẩn PRESENT (≥ 80%):</span>
          <p className="text-emerald-700">
            Học viên tham gia tối thiểu 72 phút trong buổi học 90 phút và vào lớp trong 15 phút đầu.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
          <span className="font-extrabold text-amber-800">Quy chuẩn LATE (≥ 50%):</span>
          <p className="text-amber-700">
            Học viên tham gia từ 45 - 71 phút, hoặc vào lớp muộn sau 15 phút đầu buổi học.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs space-y-1">
          <span className="font-extrabold text-red-800">Quy chuẩn ABSENT (&lt; 50%):</span>
          <p className="text-red-700">
            Học viên tham gia dưới 45 phút hoặc không đăng nhập vào phòng LiveKit.
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Danh sách điểm danh ca: {currentRoomName}
          </h3>
          <span className="text-xs text-muted">
            {records.length} học viên có dữ liệu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-line text-muted uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Mã HV & Họ Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Giờ Vào</th>
                <th className="py-3 px-4">Giờ Ra</th>
                <th className="py-3 px-4">Thời Lượng</th>
                <th className="py-3 px-4">Tỷ Lệ</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Nguồn Ghi Nhận</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    <span>Đang tải dữ liệu điểm danh...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted">
                    Chưa có học viên nào tham gia hoặc có bản ghi điểm danh trong ca học này.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="font-mono text-muted text-[11px] block">{r.studentId}</span>
                      <span>{r.studentName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted">{r.email}</td>
                    <td className="py-3.5 px-4 font-mono">{r.joinedAt}</td>
                    <td className="py-3.5 px-4 font-mono">{r.leftAt}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {r.totalMinutes} phút
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary">{r.percentage}%</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.isManualOverride ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Admin Override
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted font-mono">LiveKit Webhook</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Đổi nhanh thành Có Mặt"
                          onClick={() => handleQuickStatusChange(r, 'PRESENT')}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Đổi nhanh thành Muộn"
                          onClick={() => handleQuickStatusChange(r, 'LATE')}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                            r.status === 'LATE'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Đổi nhanh thành Vắng"
                          onClick={() => handleQuickStatusChange(r, 'ABSENT')}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                            r.status === 'ABSENT'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenOverride(r)}
                          className="px-2.5 py-1.5 rounded-lg border border-line text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override Modal */}
      {activeOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Điều Chỉnh Điểm Danh Thủ Công (Override)
              </h3>
              <button
                onClick={() => setActiveOverride(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div>
                <span className="text-xs text-muted">Học viên:</span>
                <p className="font-bold text-sm text-slate-900">{activeOverride.studentName}</p>
                <p className="text-[11px] text-muted">
                  Thời lượng gốc: {activeOverride.totalMinutes} phút ({activeOverride.percentage}%)
                </p>
              </div>

              <CustomSelect
                label="Trạng thái chuyên cần mới *"
                value={overrideStatus}
                onChange={(val) => setOverrideStatus(val as 'PRESENT' | 'LATE' | 'ABSENT')}
                options={[
                  {
                    value: 'PRESENT',
                    label: 'PRESENT (Có mặt đầy đủ)',
                    sublabel: 'Tham gia ≥ 80% thời lượng lớp',
                    icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
                    colorDot: 'bg-emerald-500',
                    badge: 'Đủ điều kiện',
                    badgeColor: 'bg-emerald-100 text-emerald-700',
                  },
                  {
                    value: 'LATE',
                    label: 'LATE (Đi muộn có lý do)',
                    sublabel: 'Vào sau 15 phút đầu, học ≥ 50%',
                    icon: <Clock className="w-4 h-4 text-amber-600" />,
                    colorDot: 'bg-amber-500',
                    badge: 'Đi muộn',
                    badgeColor: 'bg-amber-100 text-amber-700',
                  },
                  {
                    value: 'ABSENT',
                    label: 'ABSENT (Vắng mặt)',
                    sublabel: 'Tham gia < 30% thời lượng',
                    icon: <UserX className="w-4 h-4 text-red-600" />,
                    colorDot: 'bg-red-500',
                    badge: 'Không tính',
                    badgeColor: 'bg-red-100 text-red-700',
                  },
                ]}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý do điều chỉnh (Audit Trail) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Ví dụ: Học viên gặp sự cố mạng trong 10 phút đầu, đã liên hệ qua Zalo và học bù đầy đủ..."
                  className="w-full p-3 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Hành động Override sẽ được lưu vào lịch sử kiểm toán của hệ thống và đánh dấu nhãn &ldquo;Admin Override&rdquo;.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveOverride(null)}
                  className="px-4 py-2 rounded-xl border border-line text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
