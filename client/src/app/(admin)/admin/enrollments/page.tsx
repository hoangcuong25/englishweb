'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShieldCheck,
  Check,
  X,
  Users,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { coursesService, Course, CourseEnrollment } from '@/services/courses.service';
import { usersService, UserProfile } from '@/services/users.service';
import { extractErrorMessage } from '@/lib/api-error';
import { useCurrency } from '@/lib/currency-context';

function AdminEnrollmentsContent() {
  const router = useRouter();
  const { formatVnd, formatUsd, convertToUsd } = useCurrency();

  // Enrollments state
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Manual Enrollment modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<UserProfile[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [manualForm, setManualForm] = useState({
    courseId: '',
    userId: '',
    note: '',
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Fetch Enrollments and Courses
  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrollmentsRes, coursesRes] = await Promise.all([
        coursesService.getAdminEnrollments(),
        coursesService.getCourses(),
      ]);

      if (Array.isArray(enrollmentsRes)) {
        setEnrollments(enrollmentsRes);
      }
      if (Array.isArray(coursesRes)) {
        setCourses(coursesRes);
      }
    } catch (err) {
      toast.error(`Lỗi tải dữ liệu ghi danh: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Students List for Manual Enrollment
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await usersService.getUsers({ role: 'STUDENT', limit: 200 });
      const list = res.data || res.users || (Array.isArray(res) ? res : []);
      setStudentsList(list);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách học viên');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleOpenManualModal = () => {
    setManualForm({
      courseId: courses[0]?.id || '',
      userId: '',
      note: '',
    });
    setIsManualModalOpen(true);
    fetchStudents();
  };

  // Handle Approve
  const handleApprove = async (enrollmentId: string) => {
    setProcessingId(enrollmentId);
    try {
      const res = await coursesService.approveEnrollment(enrollmentId);
      toast.success(res.message || 'Đã xác nhận thanh toán & kích hoạt khóa học thành công!');
      await fetchData();
    } catch (err) {
      toast.error(`Lỗi phê duyệt: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject
  const handleReject = async (enrollmentId: string) => {
    const reason = prompt('Nhập lý do từ chối yêu cầu đăng ký (được gửi email thông báo cho học viên):', 'Nội dung chuyển khoản hoặc số tiền chưa khớp với học phí khóa học.');
    if (reason === null) return;

    setProcessingId(enrollmentId);
    try {
      const res = await coursesService.rejectEnrollment(enrollmentId, reason.trim() || undefined);
      toast.success(res.message || 'Đã từ chối yêu cầu đăng ký và gửi email thông báo.');
      await fetchData();
    } catch (err) {
      toast.error(`Lỗi từ chối: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Execute Manual Enrollment
  const handleExecuteManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.courseId || !manualForm.userId) {
      toast.error('Vui lòng chọn đầy đủ Khóa học và Học viên!');
      return;
    }

    setIsSubmittingManual(true);
    try {
      const res = await coursesService.manualEnroll({
        courseId: manualForm.courseId,
        userId: manualForm.userId,
        note: manualForm.note || undefined,
      });
      toast.success(res.message || 'Đã ghi danh học viên thành công!');
      setIsManualModalOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(`Lỗi khi ghi danh thủ công: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Counters
  const pendingCount = useMemo(() => enrollments.filter((e) => e.status === 'PENDING').length, [enrollments]);
  const activeCount = useMemo(() => enrollments.filter((e) => e.status === 'ACTIVE').length, [enrollments]);
  const rejectedCount = useMemo(() => enrollments.filter((e) => e.status === 'REJECTED').length, [enrollments]);

  // Filtered list
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
      if (courseFilter !== 'ALL' && e.courseId !== courseFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = (e.user?.fullName || '').toLowerCase();
        const studentEmail = (e.user?.email || '').toLowerCase();
        const studentPhone = (e.user?.phone || '').toLowerCase();
        const courseTitle = (e.course?.title || '').toLowerCase();
        const paymentNote = (e.paymentNote || '').toLowerCase();
        return (
          studentName.includes(q) ||
          studentEmail.includes(q) ||
          studentPhone.includes(q) ||
          courseTitle.includes(q) ||
          paymentNote.includes(q)
        );
      }
      return true;
    });
  }, [enrollments, filterStatus, courseFilter, searchQuery]);

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-16">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Payment & Enrollment Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              VietQR & USD Wire Đối Soát
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <span>Duyệt Thanh Toán & Ghi Danh Học Viên</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Đối soát các giao dịch chuyển khoản học phí VietQR / USD Wire từ học viên và phê duyệt mở quyền học tập tức thì.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-line hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenManualModal}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Ghi Danh Học Viên Thủ Công</span>
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tổng Lượt Ghi Danh
            </span>
            <span className="text-xl font-black text-slate-900">{enrollments.length}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl border shadow-xs flex items-center gap-3.5 transition ${
            pendingCount > 0
              ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-line'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <CreditCard className={`w-5 h-5 ${pendingCount > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Chờ Đối Soát
              </span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-600">{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                  Cần xử lý
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Đã Kích Hoạt
            </span>
            <span className="text-xl font-black text-emerald-600">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Đã Từ Chối
            </span>
            <span className="text-xl font-black text-slate-700">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white rounded-3xl border border-line p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Tất Cả', count: enrollments.length },
              { id: 'PENDING', label: 'Chờ Đối Soát', count: pendingCount, alert: pendingCount > 0 },
              { id: 'ACTIVE', label: 'Đã Kích Hoạt', count: activeCount },
              { id: 'REJECTED', label: 'Đã Từ Chối', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  filterStatus === tab.id
                    ? tab.alert
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                    : tab.alert
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <div className="text-[11.5px] text-slate-400">
            Hiển thị <strong className="text-slate-800">{filteredEnrollments.length}</strong> / {enrollments.length} lượt ghi danh
          </div>
        </div>

        {/* Search & Course Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-line">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học viên, email, số điện thoại, tên khóa học, mã sao kê..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-line text-xs font-medium bg-slate-50/50 focus:bg-white focus:outline-none focus:border-primary transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-64 shrink-0">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-line text-xs font-semibold bg-white focus:outline-none focus:border-primary"
            >
              <option value="ALL">Tất cả khóa học ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. ENROLLMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-muted">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            <p className="text-xs font-bold">Đang tải danh sách thanh toán & ghi danh...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="py-20 text-center text-muted space-y-2">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {filterStatus === 'PENDING'
                ? 'Không có yêu cầu chuyển khoản nào đang chờ đối soát.'
                : 'Không tìm thấy lượt ghi danh nào phù hợp với bộ lọc.'}
            </p>
            <p className="text-[11px] text-slate-400">
              {filterStatus === 'PENDING'
                ? 'Khi học viên quét mã QR VietQR hoặc chuyển khoản USD Wire, yêu cầu sẽ xuất hiện tại đây.'
                : 'Thử xóa từ khóa tìm kiếm hoặc chọn trạng thái khác.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Học Viên</th>
                  <th className="py-3.5 px-4">Khóa Học Đăng Ký</th>
                  <th className="py-3.5 px-4">Học Phí</th>
                  <th className="py-3.5 px-4">Nội Dung / Mã Chuyển Khoản</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {filteredEnrollments.map((en) => {
                  const paymentVnd = Number(en.paymentAmount || en.course?.price || 0);
                  const paymentUsd = convertToUsd(paymentVnd);
                  const isPending = en.status === 'PENDING';

                  return (
                    <tr
                      key={en.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isPending ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">
                            {en.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {en.user?.fullName || 'Học viên'}
                            </span>
                            <div className="flex items-center gap-2 text-[10.5px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {en.user?.email}
                              </span>
                              {en.user?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {en.user?.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 line-clamp-1 block">
                          {en.course?.title || 'Khóa học'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {en.course?.category || 'ACADEMY'}
                        </span>
                      </td>

                      {/* Payment Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <span className="font-black text-slate-900 block text-xs">
                          {formatVnd(paymentVnd)}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-semibold block">
                          ~ {formatUsd(paymentUsd)}
                        </span>
                      </td>

                      {/* Payment Note / Transaction Memo */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {en.paymentNote ? (
                          <div className="p-2 rounded-xl bg-slate-100 font-mono text-[11px] text-slate-800 break-all select-all border border-slate-200/80">
                            {en.paymentNote}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Không có ghi chú</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{en.enrolledAt ? new Date(en.enrolledAt).toLocaleDateString('vi-VN') : '—'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {en.enrolledAt ? new Date(en.enrolledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {en.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Chờ đối soát</span>
                          </span>
                        )}
                        {en.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã kích hoạt</span>
                          </span>
                        )}
                        {en.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Đã từ chối</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {en.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              disabled={processingId === en.id}
                              onClick={() => handleApprove(en.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {processingId === en.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>Kích Hoạt</span>
                            </button>
                            <button
                              type="button"
                              disabled={processingId === en.id}
                              onClick={() => handleReject(en.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Từ Chối</span>
                            </button>
                          </>
                        )}
                        {en.status === 'ACTIVE' && (
                          <button
                            type="button"
                            disabled={processingId === en.id}
                            onClick={() => handleReject(en.id)}
                            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-600 text-xs font-semibold hover:bg-rose-50 transition cursor-pointer"
                            title="Hủy quyền truy cập khóa học"
                          >
                            Hủy quyền
                          </button>
                        )}
                        {en.status === 'REJECTED' && (
                          <button
                            type="button"
                            disabled={processingId === en.id}
                            onClick={() => handleApprove(en.id)}
                            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition cursor-pointer"
                          >
                            Kích hoạt lại
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: GHI DANH HỌC VIÊN THỦ CÔNG */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-line">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Ghi Danh Học Viên Thủ Công
                  </h3>
                  <p className="text-xs text-muted">
                    Chủ động cấp quyền học tập cho học viên vào bất kỳ khóa học nào.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteManualEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Học Viên (Tài khoản đã tạo) <span className="text-red-500">*</span>
                </label>
                {loadingStudents ? (
                  <div className="py-2.5 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải danh sách học viên...</span>
                  </div>
                ) : (
                  <select
                    required
                    value={manualForm.userId}
                    onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Chọn học viên trong hệ thống --</option>
                    {studentsList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName || st.email} ({st.email}) {st.phone ? `— SĐT: ${st.phone}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Nếu học viên chưa có tài khoản, hãy tạo học viên tại menu &ldquo;Quản lý học viên&rdquo; trước.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Khóa Học Ghi Danh <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={manualForm.courseId}
                  onChange={(e) => setManualForm({ ...manualForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold bg-white focus:outline-none focus:border-primary"
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category} - {c.price ? `${Number(c.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú ghi danh (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={manualForm.note}
                  onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })}
                  placeholder="VD: Đã đóng tiền mặt tại trung tâm / Học bổng tài trợ 100% / Thanh toán PayPal..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Sau khi kích hoạt, học viên sẽ được mở khóa ngay lập tức toàn bộ bài học, video và tài liệu của khóa học này trên hệ thống.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-line hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingManual && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <Check className="w-4 h-4" />
                  <span>Kích Hoạt Ghi Danh Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEnrollmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-muted">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-xs font-bold">Đang tải danh sách ghi danh...</p>
        </div>
      }
    >
      <AdminEnrollmentsContent />
    </Suspense>
  );
}
