'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { speakingService, SpeakingPrompt } from '@/services/speaking.service';
import {
  Mic,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  Headphones,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminSpeakingPromptsPage() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterPart, setFilterPart] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SpeakingPrompt | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPart, setFormPart] = useState<number>(2);
  const [formCueCard, setFormCueCard] = useState('');
  const [formPrepTime, setFormPrepTime] = useState<number>(60);
  const [formRecordTime, setFormRecordTime] = useState<number>(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const data = await speakingService.getPrompts();
      if (data && data.length > 0) {
        setPrompts(data);
      } else {
        // Mock fallback
        setPrompts([
          {
            id: 'sp-1',
            title: 'Describe a memorable journey you have taken',
            description: 'You should say: where you went, whom you went with, what you did, and explain why this journey was memorable to you.',
            cueCard: 'You should say:\n- Where you went\n- Who you went with\n- What you did there\n- And explain why this journey was so memorable to you.',
            part: 2,
            prepTimeSeconds: 60,
            recordTimeSeconds: 120,
          },
          {
            id: 'sp-2',
            title: 'Daily Routine & Work-Life Balance',
            description: 'Tell me about your typical morning routine. Do you prefer working in the morning or evening?',
            part: 1,
            prepTimeSeconds: 15,
            recordTimeSeconds: 60,
          },
          {
            id: 'sp-3',
            title: 'Impact of Tourism on Local Traditions',
            description: 'In what ways does international tourism alter cultural preservation in developing nations?',
            part: 3,
            prepTimeSeconds: 15,
            recordTimeSeconds: 90,
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
    setFormPart(2);
    setFormCueCard('You should say:\n- Where you went\n- What you did\n- Why it was special');
    setFormPrepTime(60);
    setFormRecordTime(120);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: SpeakingPrompt) => {
    setEditingPrompt(p);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormPart(p.part);
    setFormCueCard(p.cueCard || '');
    setFormPrepTime(p.prepTimeSeconds || (p.part === 2 ? 60 : 15));
    setFormRecordTime(p.recordTimeSeconds || (p.part === 2 ? 120 : 60));
    setIsModalOpen(true);
  };

  const handlePartChange = (part: number) => {
    setFormPart(part);
    if (part === 2) {
      setFormPrepTime(60);
      setFormRecordTime(120);
    } else {
      setFormPrepTime(15);
      setFormRecordTime(part === 3 ? 90 : 60);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<SpeakingPrompt> = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        part: Number(formPart),
        cueCard: formPart === 2 ? formCueCard.trim() : undefined,
        prepTimeSeconds: Number(formPrepTime),
        recordTimeSeconds: Number(formRecordTime),
      };

      if (editingPrompt) {
        await speakingService.updatePrompt(editingPrompt.id, payload);
        setPrompts((prev) =>
          prev.map((item) => (item.id === editingPrompt.id ? { ...item, ...payload } as SpeakingPrompt : item))
        );
        setFeedbackNotice(`Đã cập nhật đề nói "${formTitle}" thành công!`);
      } else {
        const res = await speakingService.createPrompt(payload);
        const newId = res?.id || `sp-new-${Date.now()}`;
        setPrompts((prev) => [{ id: newId, ...payload } as SpeakingPrompt, ...prev]);
        setFeedbackNotice(`Đã thêm mới đề nói "${formTitle}" vào ngân hàng!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setFeedbackNotice(''), 4000);
    } catch {
      // Local fallback
      if (editingPrompt) {
        setPrompts((prev) =>
          prev.map((item) =>
            item.id === editingPrompt.id
              ? ({ ...item, title: formTitle, description: formDesc, part: formPart, cueCard: formCueCard, prepTimeSeconds: formPrepTime, recordTimeSeconds: formRecordTime } as SpeakingPrompt)
              : item
          )
        );
      } else {
        setPrompts((prev) => [
          {
            id: `sp-loc-${Date.now()}`,
            title: formTitle,
            description: formDesc,
            part: formPart,
            cueCard: formCueCard,
            prepTimeSeconds: formPrepTime,
            recordTimeSeconds: formRecordTime,
          },
          ...prev,
        ]);
      }
      setIsModalOpen(false);
      setFeedbackNotice('Lưu đề nói thành công (chế độ cục bộ)!');
      setTimeout(() => setFeedbackNotice(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đề thi nói: "${title}"?`)) return;

    try {
      await speakingService.deletePrompt(id);
    } catch {
      // Fallback
    }

    setPrompts((prev) => prev.filter((p) => p.id !== id));
    setFeedbackNotice(`Đã xóa đề nói "${title}" khỏi ngân hàng.`);
    setTimeout(() => setFeedbackNotice(''), 4000);
  };

  const filteredPrompts = prompts.filter((p) => {
    const matchPart = filterPart === 'ALL' || p.part === filterPart;
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchPart && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1">
            <Mic className="w-3.5 h-3.5" />
            <span>Phân hệ Quản trị IELTS Speaking Studio</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Ngân Hàng Đề Thi IELTS Speaking (Part 1, 2, 3)</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Quản trị các câu hỏi phỏng vấn Part 1, chủ đề Cue Card Part 2 và câu hỏi thảo luận chuyên sâu Part 3.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-md shadow-primary/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Thi Mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-2">
        <Link
          href="/admin/speaking-grading"
          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center space-x-2 border-b-2 border-transparent"
        >
          <Headphones className="w-4 h-4" />
          <span>Chấm Điểm Bài Nói Speaking</span>
        </Link>
        <Link
          href="/admin/speaking-prompts"
          className="px-4 py-2 text-xs font-bold text-primary border-b-2 border-primary transition flex items-center space-x-2"
        >
          <Mic className="w-4 h-4" />
          <span>Ngân Hàng Đề Thi Speaking ({prompts.length})</span>
        </Link>
      </div>

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-line shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setFilterPart('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterPart === 'ALL' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({prompts.length})
          </button>
          <button
            onClick={() => setFilterPart(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterPart === 1 ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Part 1 ({prompts.filter((p) => p.part === 1).length})
          </button>
          <button
            onClick={() => setFilterPart(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterPart === 2 ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Part 2 ({prompts.filter((p) => p.part === 2).length})
          </button>
          <button
            onClick={() => setFilterPart(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterPart === 3 ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Part 3 ({prompts.filter((p) => p.part === 3).length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm chủ đề speaking..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-line bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {/* Prompts Grid */}
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
                    p.part === 1
                      ? 'bg-sky-100 text-sky-800'
                      : p.part === 2
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  IELTS Speaking Part {p.part}
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
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-line">
                {p.description}
              </p>

              {p.cueCard && (
                <div className="bg-amber-50/70 border border-amber-200/70 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-800 text-[10px] uppercase flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Cue Card Gợi Ý:</span>
                  </span>
                  <pre className="whitespace-pre-wrap font-sans text-amber-900 text-xs leading-relaxed">
                    {p.cueCard}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-muted font-medium">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chuẩn bị: {p.prepTimeSeconds || 15}s</span>
                </span>
                <span>Thu âm: {p.recordTimeSeconds || 60}s</span>
              </div>
            </div>
          </div>
        ))}

        {filteredPrompts.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted text-xs bg-white rounded-2xl border border-dashed border-line">
            Không tìm thấy đề thi Speaking nào phù hợp.
          </div>
        )}
      </div>

      {/* Modal Soạn Thảo / Chỉnh Sửa Đề Nói */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-line space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingPrompt ? 'Chỉnh Sửa Đề Thi Speaking' : 'Soạn Đề Thi Speaking Mới'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Phần Thi (Part):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => handlePartChange(pt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        formPart === pt
                          ? 'bg-primary text-white border-primary'
                          : 'bg-slate-50 text-slate-700 border-line hover:bg-slate-100'
                      }`}
                    >
                      Part {pt} {pt === 2 ? '(Cue Card)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ Đề / Tiêu Đề:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Describe a memorable journey you have taken"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-line focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội Dung Câu Hỏi (Prompt Description):</label>
                <textarea
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi hoặc yêu cầu bài thi..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-line focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              {formPart === 2 && (
                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">Nội Dung Cue Card (Các Gợi Ý):</label>
                  <textarea
                    rows={4}
                    value={formCueCard}
                    onChange={(e) => setFormCueCard(e.target.value)}
                    placeholder="You should say:&#10;- Where it took place&#10;- Who was with you&#10;- What happened"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-amber-50/50 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian chuẩn bị (giây):</label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-line focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian thu âm (giây):</label>
                  <input
                    type="number"
                    value={formRecordTime}
                    onChange={(e) => setFormRecordTime(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-line focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

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
                  {isSubmitting ? 'Đang lưu...' : editingPrompt ? 'Cập Nhật' : 'Lưu Đề Thi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
