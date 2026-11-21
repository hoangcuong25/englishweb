'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { coursesService, Course } from '@/services/courses.service';
import {
  homeworkService,
  Homework,
  HomeworkSubmission,
  CreateHomeworkInput,
} from '@/services/homework.service';
import { toast } from '@/components/ui/toast';
import RichTextEditor from '@/components/shared/rich-text-editor';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  Trash2,
  Edit,
  ExternalLink,
  MessageSquare,
  Search,
  BookOpen,
  Send,
  X,
  Check,
} from 'lucide-react';

export default function AdminHomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [activeHomework, setActiveHomework] = useState<Homework | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<HomeworkSubmission | null>(null);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateHomeworkInput>({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
    attachmentUrl: '',
  });

  const [gradeForm, setGradeForm] = useState<{ score: number; feedback: string }>({
    score: 100,
    feedback: '',
  });

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [hwList, courseList] = await Promise.all([
        homeworkService.getAll(),
        coursesService.getCourses(),
      ]);
      setHomeworks(hwList);
      setCourses(courseList);
      if (courseList.length > 0 && !createForm.courseId) {
        setCreateForm((prev) => ({ ...prev, courseId: courseList[0].id }));
      }
    } catch (err: any) {
      toast.error('Không thể tải danh sách bài tập về nhà: ' + (err.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered Homeworks
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter((hw) => {
      const matchCourse = selectedCourseId === 'ALL' || hw.courseId === selectedCourseId;
      const matchSearch =
        searchQuery === '' ||
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.course?.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCourse && matchSearch;
    });
  }, [homeworks, selectedCourseId, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = homeworks.length;
    let totalSubs = 0;
    let pendingSubs = 0;
    let gradedSubs = 0;

    homeworks.forEach((h) => {
      totalSubs += h.stats?.totalSubmissions || 0;
      pendingSubs += h.stats?.pendingCount || 0;
      gradedSubs += h.stats?.gradedCount || 0;
    });

    return { total, totalSubs, pendingSubs, gradedSubs };
  }, [homeworks]);

  // Handle Create Homework
  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.courseId || !createForm.title.trim() || !createForm.description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin khóa học, tiêu đề và hướng dẫn bài tập.');
      return;
    }

    try {
      setSubmittingAction(true);
      await homeworkService.create({
        ...createForm,
        dueDate: createForm.dueDate ? new Date(createForm.dueDate).toISOString() : undefined,
      });
      toast.success('Đã giao bài tập thành công! Toàn bộ học viên của khóa học đã nhận thông báo.');
      setIsCreateOpen(false);
      setCreateForm({
        courseId: courses[0]?.id || '',
        title: '',
        description: '',
        dueDate: '',
        maxScore: 100,
        attachmentUrl: '',
      });
      await loadData();
    } catch (err: any) {
      toast.error('Lỗi khi giao bài tập: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Submissions View
  const handleViewSubmissions = async (hw: Homework) => {
    try {
      setLoading(true);
      const detail = await homeworkService.getById(hw.id);
      setActiveHomework(detail);
      setIsSubmissionsOpen(true);
    } catch (err: any) {
      toast.error('Không thể lấy danh sách bài nộp: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Homework
  const handleDeleteHomework = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài tập về nhà này? Tất cả bài nộp của học sinh sẽ bị xóa vĩnh viễn.')) {
      return;
    }
    try {
      await homeworkService.delete(id);
      toast.success('Đã xóa bài tập về nhà thành công.');
      await loadData();
    } catch (err: any) {
      toast.error('Lỗi xóa bài tập: ' + err.message);
    }
  };

  // Open Grade Modal
  const handleOpenGradeModal = (sub: HomeworkSubmission) => {
    setActiveSubmission(sub);
    setGradeForm({
      score: sub.score !== undefined && sub.score !== null ? sub.score : (activeHomework?.maxScore || 100),
      feedback: sub.feedback || '',
    });
    setIsGradeOpen(true);
  };

  // Submit Grade
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    try {
      setSubmittingAction(true);
      await homeworkService.grade(activeSubmission.id, {
        score: Number(gradeForm.score),
        feedback: gradeForm.feedback,
      });
      toast.success('Đã lưu điểm và gửi nhận xét sư phạm tới học viên!');
      setIsGradeOpen(false);
      // Reload active homework
      if (activeHomework) {
        const updatedHw = await homeworkService.getById(activeHomework.id);
        setActiveHomework(updatedHw);
      }
      await loadData();
    } catch (err: any) {
      toast.error('Lỗi lưu điểm: ' + err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý & Giao Bài Tập Về Nhà
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Giao bài tập theo từng khóa học, kiểm soát tiến độ làm bài của học viên và trực tiếp chấm điểm kèm lời phê sư phạm.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-[#154E8A] text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng bài tập</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-500">Đã giao trên toàn hệ thống</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Chờ Thầy chấm</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pendingSubs}</div>
          <p className="text-[11px] text-slate-500">Bài nộp đang đợi nhận xét</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Đã chấm điểm</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.gradedSubs}</div>
          <p className="text-[11px] text-slate-500">Học viên đã nhận phản hồi</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng lượt nộp</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalSubs}</div>
          <p className="text-[11px] text-slate-500">Lượt nộp của học sinh</p>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Course filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCourseId('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCourseId === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Tất cả khóa ({homeworks.length})
            </button>
            {courses.map((c) => {
              const count = homeworks.filter((h) => h.courseId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedCourseId === c.id
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{c.title}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* 4. Homework List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách bài tập về nhà...</p>
        </div>
      ) : filteredHomeworks.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có bài tập về nhà nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy bấm nút "Giao bài tập mới" để giao nhiệm vụ thực hành và bài tập về nhà cho học viên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHomeworks.map((hw) => {
            const isDuePassed = hw.dueDate ? new Date(hw.dueDate).getTime() < Date.now() : false;
            const pending = hw.stats?.pendingCount || 0;
            const graded = hw.stats?.gradedCount || 0;
            const total = hw.stats?.totalSubmissions || 0;

            return (
              <div
                key={hw.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
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
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug hover:text-primary transition-colors">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {hw.description}
                    </p>
                  </div>

                  {/* Attachment url if present */}
                  {hw.attachmentUrl && (
                    <a
                      href={hw.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Tài liệu đính kèm đề bài</span>
                    </a>
                  )}
                </div>

                {/* Bottom stats & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {/* Submission badges */}
                  <div className="flex items-center gap-2">
                    {pending > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{pending} bài chờ chấm</span>
                      </span>
                    )}
                    {graded > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{graded} đã chấm</span>
                      </span>
                    )}
                    {total === 0 && (
                      <span className="text-xs text-slate-400">Chưa có bài nộp</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewSubmissions(hw)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Bài nộp ({total})</span>
                    </button>
                    <button
                      onClick={() => handleDeleteHomework(hw.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Xóa bài tập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: CREATE HOMEWORK ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-slate-900">Giao Bài Tập Về Nhà Mới</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khóa học áp dụng: *</label>
                <select
                  required
                  value={createForm.courseId}
                  onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-primary font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài tập: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài tập tuần 1: Phân tích biểu đồ Bar Chart Task 1..."
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hạn chót nộp bài:</label>
                  <input
                    type="datetime-local"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thang điểm tối đa:</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={createForm.maxScore}
                    onChange={(e) => setCreateForm({ ...createForm, maxScore: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Yêu cầu đề bài & hướng dẫn chi tiết"
                required
                value={createForm.description}
                onChange={(val) => setCreateForm({ ...createForm, description: val })}
                placeholder="Ghi rõ các yêu cầu, tiêu chí hoàn thành, gợi ý tài liệu và các bước học viên cần làm..."
                minHeight="min-h-[160px]"
                helperText="Hỗ trợ in đậm, danh sách gạch đầu dòng, bảng tiêu chí và hộp lưu ý/mẹo học tập."
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link tài liệu đính kèm (nếu có):</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... hoặc link PDF đề bài"
                  value={createForm.attachmentUrl}
                  onChange={(e) => setCreateForm({ ...createForm, attachmentUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs hover:bg-[#154E8A] transition disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingAction ? 'Đang giao bài...' : 'Giao bài tập & Bắn thông báo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SUBMISSIONS LIST ================= */}
      {isSubmissionsOpen && activeHomework && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                  {activeHomework.course?.title}
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  Danh sách nộp bài: {activeHomework.title}
                </h3>
              </div>
              <button
                onClick={() => setIsSubmissionsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submissions List Body */}
            <div className="overflow-y-auto space-y-3 pr-1 grow">
              {(!activeHomework.submissions || activeHomework.submissions.length === 0) ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Chưa có học sinh nào nộp bài tập này.</p>
                </div>
              ) : (
                activeHomework.submissions.map((sub) => {
                  const isGraded = sub.status === 'GRADED';
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center shrink-0">
                            {sub.student?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 leading-tight">
                              {sub.student?.fullName || 'Học viên'}
                            </h4>
                            <p className="text-[11px] text-slate-400">{sub.student?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isGraded
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isGraded ? `Đã chấm: ${sub.score}/${activeHomework.maxScore}đ` : 'Chờ Thầy chấm'}
                          </span>
                          <button
                            onClick={() => handleOpenGradeModal(sub)}
                            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-[#154E8A] text-white font-bold text-xs transition cursor-pointer"
                          >
                            {isGraded ? 'Sửa điểm' : 'Chấm bài'}
                          </button>
                        </div>
                      </div>

                      {/* Content excerpt */}
                      {sub.content && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                          {sub.content}
                        </div>
                      )}

                      {/* Attached file if any */}
                      {sub.fileUrl && (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-bold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Xem tệp bài làm của học sinh</span>
                        </a>
                      )}

                      {/* Graded feedback if any */}
                      {isGraded && sub.feedback && (
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Lời phê của Thầy Đông:</span>
                          </div>
                          <p className="leading-relaxed">{sub.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: GRADE SUBMISSION ================= */}
      {isGradeOpen && activeSubmission && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Chấm Bài: {activeSubmission.student?.fullName}
                </h3>
                <p className="text-xs text-slate-500">Bài tập: {activeHomework?.title}</p>
              </div>
              <button
                onClick={() => setIsGradeOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Điểm số (Thang điểm {activeHomework?.maxScore || 100}): *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={activeHomework?.maxScore || 100}
                  step={0.5}
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời phê sư phạm & nhận xét chi tiết:
                </label>
                <textarea
                  rows={4}
                  placeholder="Ghi nhận xét khen ngợi, góp ý những điểm cần khắc phục và định hướng học tập cho học viên..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary leading-relaxed"
                ></textarea>
              </div>

              {/* Quick comment suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Gợi ý nhận xét nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Bài làm rất tốt, lập luận sắc bén!',
                    'Cần chú ý thêm lỗi dùng từ ngữ cảnh.',
                    'Dẫn chứng phong phú, tiếp tục phát huy!',
                    'Cần nộp bài đúng thời hạn hơn.',
                  ].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setGradeForm({ ...gradeForm, feedback: (gradeForm.feedback ? gradeForm.feedback + ' ' : '') + tip })}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 font-medium transition cursor-pointer"
                    >
                      + {tip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGradeOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition disabled:opacity-50 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{submittingAction ? 'Đang lưu...' : 'Lưu Điểm & Bắn Thông Báo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
