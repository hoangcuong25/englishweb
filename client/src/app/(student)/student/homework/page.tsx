'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  homeworkService,
  Homework,
  HomeworkSubmission,
} from '@/services/homework.service';
import { toast } from '@/components/ui/toast';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Send,
  X,
  Upload,
  Calendar,
} from 'lucide-react';

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOT_SUBMITTED' | 'PENDING' | 'GRADED'>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Modal states
  const [activeHomework, setActiveHomework] = useState<Homework | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submit form state
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');

  // Load student homeworks
  const loadHomeworks = async () => {
    try {
      setLoading(true);
      const data = await homeworkService.getMyHomeworks();
      setHomeworks(data);
    } catch (err: any) {
      toast.error('Không thể tải danh sách bài tập về nhà: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeworks();
  }, []);

  // Filter list
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter((hw) => {
      const matchCourse = courseFilter === 'ALL' || hw.courseId === courseFilter;
      const matchStatus =
        statusFilter === 'ALL' || hw.submissionStatus === statusFilter;
      return matchCourse && matchStatus;
    });
  }, [homeworks, courseFilter, statusFilter]);

  // Unique courses for filter
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    homeworks.forEach((h) => {
      if (h.course) map.set(h.courseId, h.course.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [homeworks]);

  // Counts
  const counts = useMemo(() => {
    let notSubmitted = 0;
    let pending = 0;
    let graded = 0;

    homeworks.forEach((h) => {
      if (h.submissionStatus === 'NOT_SUBMITTED') notSubmitted++;
      else if (h.submissionStatus === 'PENDING') pending++;
      else if (h.submissionStatus === 'GRADED') graded++;
    });

    return { notSubmitted, pending, graded, total: homeworks.length };
  }, [homeworks]);

  // Open Submit Modal
  const handleOpenSubmit = (hw: Homework) => {
    setActiveHomework(hw);
    setSubmissionContent(hw.mySubmission?.content || '');
    setSubmissionFileUrl(hw.mySubmission?.fileUrl || '');
    setIsSubmitOpen(true);
  };

  // Open Feedback Modal
  const handleOpenFeedback = (hw: Homework) => {
    setActiveHomework(hw);
    setIsFeedbackOpen(true);
  };

  // Handle Submit Homework
  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHomework) return;
    if (!submissionContent.trim() && !submissionFileUrl.trim()) {
      toast.error('Vui lòng nhập bài làm dạng văn bản hoặc đính kèm link tệp bài làm.');
      return;
    }

    try {
      setSubmitting(true);
      await homeworkService.submit(activeHomework.id, {
        content: submissionContent,
        fileUrl: submissionFileUrl,
      });
      toast.success('🎉 Nộp bài tập về nhà thành công! Thầy Đông đã nhận được bài làm của bạn.');
      setIsSubmitOpen(false);
      await loadHomeworks();
    } catch (err: any) {
      toast.error('Lỗi khi nộp bài: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#154E8A] to-primary text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
            Học viên Teacher Dong Academy
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bài Tập Về Nhà Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed font-normal">
            Danh sách bài tập thực hành do Thầy Đông trực tiếp giao theo từng khóa học. Hoàn thành đầy đủ và đúng hạn để được nhận xét sư phạm chi tiết!
          </p>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setStatusFilter('NOT_SUBMITTED')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-2xs space-y-1 ${
            statusFilter === 'NOT_SUBMITTED' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cần làm / Chưa nộp</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{counts.notSubmitted}</div>
          <p className="text-[11px] text-slate-500">Bài tập đang chờ hoàn thành</p>
        </div>

        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-2xs space-y-1 ${
            statusFilter === 'PENDING' ? 'border-sky-400 ring-2 ring-sky-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Đã nộp - Chờ Thầy chấm</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600">{counts.pending}</div>
          <p className="text-[11px] text-slate-500">Đã gửi lên hệ thống</p>
        </div>

        <div
          onClick={() => setStatusFilter('GRADED')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-2xs space-y-1 ${
            statusFilter === 'GRADED' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Đã có điểm & Lời phê</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{counts.graded}</div>
          <p className="text-[11px] text-slate-500">Thầy Đông đã nhận xét</p>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: `Tất cả (${counts.total})` },
              { id: 'NOT_SUBMITTED', label: `Chưa nộp (${counts.notSubmitted})` },
              { id: 'PENDING', label: `Chờ chấm (${counts.pending})` },
              { id: 'GRADED', label: `Đã có điểm (${counts.graded})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Course filter select */}
          {uniqueCourses.length > 0 && (
            <div className="w-full sm:w-auto shrink-0">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full sm:w-60 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="ALL">Tất cả khóa học</option>
                {uniqueCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4. Homework Cards List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Đang tải bài tập về nhà của bạn...</p>
        </div>
      ) : filteredHomeworks.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Không có bài tập nào trong mục này</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bạn đã hoàn thành tốt các bài tập hoặc Thầy Đông chưa giao thêm nhiệm vụ mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHomeworks.map((hw) => {
            const isDuePassed = hw.dueDate ? new Date(hw.dueDate).getTime() < Date.now() : false;
            const sub = hw.mySubmission;
            const isGraded = hw.submissionStatus === 'GRADED';
            const isPending = hw.submissionStatus === 'PENDING';
            const isNotSubmitted = hw.submissionStatus === 'NOT_SUBMITTED';

            return (
              <div
                key={hw.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-[11px] font-bold">
                      {hw.course?.title || 'Khóa học'}
                    </span>
                    {hw.dueDate && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          isDuePassed
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {isDuePassed
                            ? 'Đã hết hạn'
                            : `Hạn: ${new Date(hw.dueDate).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}`}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {hw.description}
                    </p>
                  </div>

                  {/* Attached file link if any */}
                  {hw.attachmentUrl && (
                    <a
                      href={hw.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem tài liệu đính kèm đề bài</span>
                    </a>
                  )}
                </div>

                {/* Bottom status & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {/* Status Badge */}
                  <div>
                    {isGraded && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
                        <Award className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Điểm: {sub?.score}/{hw.maxScore}đ</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-sky-700" />
                        <span>Đã nộp - Chờ Thầy chấm</span>
                      </span>
                    )}
                    {isNotSubmitted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Chưa hoàn thành</span>
                      </span>
                    )}
                  </div>

                  {/* Action button */}
                  <div>
                    {isGraded && (
                      <button
                        onClick={() => handleOpenFeedback(hw)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Xem Lời Phê Của Thầy</span>
                      </button>
                    )}
                    {isPending && (
                      <button
                        onClick={() => handleOpenSubmit(hw)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xem / Nộp lại bài</span>
                      </button>
                    )}
                    {isNotSubmitted && (
                      <button
                        onClick={() => handleOpenSubmit(hw)}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-[#154E8A] text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Làm & Nộp bài</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: SUBMIT HOMEWORK ================= */}
      {isSubmitOpen && activeHomework && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                  {activeHomework.course?.title}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Nộp Bài: {activeHomework.title}
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assignment instructions box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 shrink-0">
              <span className="font-bold text-slate-900 block">Yêu cầu đề bài của Thầy Đông:</span>
              <p className="whitespace-pre-line leading-relaxed">{activeHomework.description}</p>
              {activeHomework.attachmentUrl && (
                <a
                  href={activeHomework.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở tài liệu đề bài đính kèm</span>
                </a>
              )}
            </div>

            <form onSubmit={handleSubmitAction} className="space-y-4 grow overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung bài làm (bài luận, câu trả lời, dàn ý...): *
                </label>
                <textarea
                  rows={8}
                  placeholder="Gõ trực tiếp bài làm của bạn vào đây..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary leading-relaxed"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường dẫn tệp đính kèm bài làm (Google Drive, Dropbox, Audio, PDF...):
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={submissionFileUrl}
                  onChange={(e) => setSubmissionFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs hover:bg-[#154E8A] transition disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Đang nộp bài...' : 'Nộp bài cho Thầy Đông'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TEACHER FEEDBACK ================= */}
      {isFeedbackOpen && activeHomework && activeHomework.mySubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Kết Quả Chấm Điểm
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {activeHomework.title}
                </h3>
              </div>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Showcase */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Điểm số đạt được
                </span>
                <div className="text-3xl sm:text-4xl font-black">
                  {activeHomework.mySubmission.score} <span className="text-lg font-bold text-emerald-200">/ {activeHomework.maxScore}</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <Award className="w-8 h-8" />
              </div>
            </div>

            {/* Teacher Dong Feedback Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-[10px] flex items-center justify-center">
                  TD
                </div>
                <span>Lời Phê Sư Phạm Từ Thầy Đông</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic whitespace-pre-line pl-8">
                "{activeHomework.mySubmission.feedback || 'Chúc mừng em đã hoàn thành tốt bài tập!'}"
              </p>
            </div>

            {/* Student's submitted work */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Bài làm bạn đã nộp:</span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {activeHomework.mySubmission.content || 'Đã nộp qua tệp đính kèm.'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
