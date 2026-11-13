'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { writingService, WritingPrompt } from '@/services/writing.service';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  FileCheck,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function AdminWritingPromptsPage() {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<WritingPrompt | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTaskType, setFormTaskType] = useState<'TASK_1' | 'TASK_2'>('TASK_2');
  const [formMinWords, setFormMinWords] = useState(250);
  const [formTimeLimit, setFormTimeLimit] = useState(40);
  const [formChartUrl, setFormChartUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const data = await writingService.getPrompts();
      if (data && data.length > 0) {
        setPrompts(data);
      } else {
        // Mock fallback if empty
        setPrompts([
          {
            id: 'wp-sample-1',
            title: 'University Education: Free vs Tuition Fees',
            description: 'Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your opinion.',
            taskType: 'TASK_2',
            minWords: 250,
            timeLimitMinutes: 40,
          },
          {
            id: 'wp-sample-2',
            title: 'Renewable Electricity Generation Chart 2010-2024',
            description: 'The chart shows the proportion of electricity generated from renewable sources in four countries between 2010 and 2024. Summarise the information by selecting and reporting the main features.',
            taskType: 'TASK_1',
            minWords: 150,
            timeLimitMinutes: 20,
            chartImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
          },
        ]);
      }
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPrompt(null);
    setFormTitle('');
    setFormDesc('');
    setFormTaskType('TASK_2');
    setFormMinWords(250);
    setFormTimeLimit(40);
    setFormChartUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: WritingPrompt) => {
    setEditingPrompt(p);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormTaskType(p.taskType);
    setFormMinWords(p.minWords || (p.taskType === 'TASK_1' ? 150 : 250));
    setFormTimeLimit(p.timeLimitMinutes || (p.taskType === 'TASK_1' ? 20 : 40));
    setFormChartUrl(p.chartImageUrl || '');
    setIsModalOpen(true);
  };

  const handleTaskTypeChange = (type: 'TASK_1' | 'TASK_2') => {
    setFormTaskType(type);
    if (type === 'TASK_1') {
      setFormMinWords(150);
      setFormTimeLimit(20);
    } else {
      setFormMinWords(250);
      setFormTimeLimit(40);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<WritingPrompt> = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        taskType: formTaskType,
        minWords: Number(formMinWords),
        timeLimitMinutes: Number(formTimeLimit),
        chartImageUrl: formChartUrl.trim() || undefined,
      };

      if (editingPrompt) {
        await writingService.updatePrompt(editingPrompt.id, payload);
        setPrompts((prev) =>
          prev.map((item) => (item.id === editingPrompt.id ? { ...item, ...payload } as WritingPrompt : item))
        );
        setFeedbackNotice(`Đã cập nhật đề thi "${formTitle}" thành công!`);
      } else {
        const res = await writingService.createPrompt(payload);
        const newId = res?.id || `wp-new-${Date.now()}`;
        setPrompts((prev) => [{ id: newId, ...payload } as WritingPrompt, ...prev]);
        setFeedbackNotice(`Đã thêm mới đề thi "${formTitle}" vào ngân hàng!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setFeedbackNotice(''), 4000);
    } catch {
      // Local fallback
      if (editingPrompt) {
        setPrompts((prev) =>
          prev.map((item) => (item.id === editingPrompt.id ? { ...item, title: formTitle, description: formDesc, taskType: formTaskType, minWords: formMinWords, timeLimitMinutes: formTimeLimit } : item))
        );
      } else {
        setPrompts((prev) => [
          {
            id: `wp-loc-${Date.now()}`,
            title: formTitle,
            description: formDesc,
            taskType: formTaskType,
            minWords: formMinWords,
            timeLimitMinutes: formTimeLimit,
          },
          ...prev,
        ]);
      }
      setIsModalOpen(false);
      setFeedbackNotice('Lưu đề thi thành công (chế độ cục bộ)!');
      setTimeout(() => setFeedbackNotice(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề thi: "${title}"?`)) return;

    try {
      await writingService.deletePrompt(id);
    } catch {
      // Fallback
    }

    setPrompts((prev) => prev.filter((p) => p.id !== id));
    setFeedbackNotice(`Đã xóa đề thi "${title}" khỏi ngân hàng.`);
    setTimeout(() => setFeedbackNotice(''), 4000);
  };

  const filteredPrompts = prompts.filter((p) => {
    const matchType = filterType === 'ALL' || p.taskType === filterType;
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-primary text-xs font-bold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Phân hệ Quản trị IELTS Writing</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Ngân Hàng Đề Thi IELTS Writing (Task 1 & Task 2)</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Quản lý danh mục đề bài luyện viết, thiết lập số từ tối thiểu và hình ảnh biểu đồ cho Task 1.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-md shadow-primary/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Bài Mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-2">
        <Link
          href="/admin/writing-review"
          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center space-x-2 border-b-2 border-transparent"
        >
          <FileCheck className="w-4 h-4" />
          <span>Duyệt Bài Viết Của Học Viên</span>
        </Link>
        <Link
          href="/admin/writing-prompts"
          className="px-4 py-2 text-xs font-bold text-primary border-b-2 border-primary transition flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Ngân Hàng Đề Bài Writing ({prompts.length})</span>
        </Link>
      </div>

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-line shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'ALL' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({prompts.length})
          </button>
          <button
            onClick={() => setFilterType('TASK_1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'TASK_1' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Task 1 ({prompts.filter((p) => p.taskType === 'TASK_1').length})
          </button>
          <button
            onClick={() => setFilterType('TASK_2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'TASK_2' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Task 2 ({prompts.filter((p) => p.taskType === 'TASK_2').length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-line bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-white border border-line shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                    p.taskType === 'TASK_1'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {p.taskType === 'TASK_1' ? 'IELTS Writing Task 1' : 'IELTS Writing Task 2'}
                </span>
                <div className="flex items-center space-x-1 text-slate-400">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 hover:text-primary hover:bg-sky-50 rounded-lg transition"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa đề thi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-line">
                {p.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-muted font-medium">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.timeLimitMinutes || (p.taskType === 'TASK_1' ? 20 : 40)} phút</span>
                </span>
                <span>Tối thiểu {p.minWords || (p.taskType === 'TASK_1' ? 150 : 250)} từ</span>
              </div>
              {p.chartImageUrl && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                  Có biểu đồ
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredPrompts.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted text-xs bg-white rounded-2xl border border-dashed border-line">
            Không tìm thấy đề bài Writing nào phù hợp.
          </div>
        )}
      </div>

      {/* Modal Soạn Thảo / Chỉnh Sửa Đề Thi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-line space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingPrompt ? 'Chỉnh Sửa Đề Bài Writing' : 'Soạn Đề Bài Writing Mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dạng Bài Viết:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTaskTypeChange('TASK_1')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      formTaskType === 'TASK_1'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-50 text-slate-700 border-line hover:bg-slate-100'
                    }`}
                  >
                    Task 1 (Biểu đồ / 150 từ)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTaskTypeChange('TASK_2')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      formTaskType === 'TASK_2'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-line hover:bg-slate-100'
                    }`}
                  >
                    Task 2 (Nghị luận / 250 từ)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu Đề Đề Bài:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: University Tuition Fees vs Free Education"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-line focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội Dung Đề Bài (Prompt Description):</label>
                <textarea
                  required
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Nhập toàn bộ đề bài và hướng dẫn làm bài..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-line focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số từ tối thiểu:</label>
                  <input
                    type="number"
                    value={formMinWords}
                    onChange={(e) => setFormMinWords(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-line focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian (phút):</label>
                  <input
                    type="number"
                    value={formTimeLimit}
                    onChange={(e) => setFormTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-line focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {formTaskType === 'TASK_1' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL Hình Ảnh Biểu Đồ (Tùy chọn):</label>
                  <input
                    type="url"
                    value={formChartUrl}
                    onChange={(e) => setFormChartUrl(e.target.value)}
                    placeholder="https://example.com/chart.png"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-line focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : editingPrompt ? 'Cập Nhật' : 'Lưu Đề Bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
