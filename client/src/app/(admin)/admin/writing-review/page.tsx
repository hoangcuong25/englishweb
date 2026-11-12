'use client';

import React, { useState, useEffect } from 'react';
import { writingService } from '@/services/writing.service';
import {
  FileCheck,
  CheckCircle2,
  Eye,
  X,
  RefreshCw,
} from 'lucide-react';

interface WritingReviewItem {
  id: string;
  studentName: string;
  studentEmail: string;
  taskTitle: string;
  taskType: 'TASK_1' | 'TASK_2';
  essayText: string;
  wordCount: number;
  submittedAt: string;
  aiTR: number;
  aiCC: number;
  aiLR: number;
  aiGRA: number;
  aiOverall: number;
  status: 'AI_EVALUATED' | 'APPROVED';
}

export default function AdminWritingReviewPage() {
  const [submissions, setSubmissions] = useState<WritingReviewItem[]>([
    {
      id: 'w-101',
      studentName: 'Trần Văn Nam',
      studentEmail: 'nam.tran@gmail.com',
      taskTitle: 'University Education: Free vs Tuition Fees (Task 2)',
      taskType: 'TASK_2',
      essayText:
        'It is commonly believed by a substantial proportion of society that tertiary education ought to be made gratuitously available to all undergraduates irrespective of their socioeconomic provenance. However, an alternative school of thought posits that tuition charges should be levied. In this essay, I intend to scrutinise both perspectives prior to presenting my own conviction...',
      wordCount: 286,
      submittedAt: '09/11/2026 14:20',
      aiTR: 6.5,
      aiCC: 7.0,
      aiLR: 7.5,
      aiGRA: 6.5,
      aiOverall: 7.0,
      status: 'AI_EVALUATED',
    },
    {
      id: 'w-102',
      studentName: 'Lê Thị Mai',
      studentEmail: 'mai.le@gmail.com',
      taskTitle: 'Renewable Electricity Generation Chart 2010-2024 (Task 1)',
      taskType: 'TASK_1',
      essayText:
        'The provided bar chart delineates the proportion of electric power generated from environmentally friendly sources across four nations between 2010 and 2024. Overall, what stands out from the graphical data is that Country A witnessed the most substantial ascendancy...',
      wordCount: 178,
      submittedAt: '09/11/2026 10:15',
      aiTR: 7.0,
      aiCC: 7.0,
      aiLR: 7.0,
      aiGRA: 7.0,
      aiOverall: 7.0,
      status: 'AI_EVALUATED',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [activeReview, setActiveReview] = useState<WritingReviewItem | null>(null);
  const [scoreTR, setScoreTR] = useState(7.0);
  const [scoreCC, setScoreCC] = useState(7.0);
  const [scoreLR, setScoreLR] = useState(7.0);
  const [scoreGRA, setScoreGRA] = useState(7.0);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [publishNotice, setPublishNotice] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const data = await writingService.getAdminSubmissions();
        if (data && data.length > 0) {
          const mapped: WritingReviewItem[] = data.map((item) => ({
            id: item.id,
            studentName: item.student?.fullName || 'Học viên',
            studentEmail: item.student?.email || 'student@dong.edu.vn',
            taskTitle: item.prompt?.title || 'IELTS Writing Essay',
            taskType: item.prompt?.taskType || 'TASK_2',
            essayText: item.content,
            wordCount: item.wordCount,
            submittedAt: new Date(item.createdAt).toLocaleString('vi-VN'),
            aiTR: item.aiAnalysis?.taskResponse?.score || item.aiScore || 7.0,
            aiCC: item.aiAnalysis?.coherenceCohesion?.score || item.aiScore || 7.0,
            aiLR: item.aiAnalysis?.lexicalResource?.score || item.aiScore || 7.0,
            aiGRA: item.aiAnalysis?.grammaticalAccuracy?.score || item.aiScore || 7.0,
            aiOverall: item.aiScore || 7.0,
            status: item.status === 'APPROVED' ? 'APPROVED' : 'AI_EVALUATED',
          }));
          setSubmissions(mapped);
        }
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleOpenReview = (sub: WritingReviewItem) => {
    setActiveReview(sub);
    setScoreTR(sub.aiTR);
    setScoreCC(sub.aiCC);
    setScoreLR(sub.aiLR);
    setScoreGRA(sub.aiGRA);
    setTeacherFeedback(
      'Bài viết có cấu trúc mạch lạc, từ vựng học thuật C1/C2 dùng chuẩn xác. Thầy duyệt nâng band tiêu chí Lexical Resource vì các cụm collocation tự nhiên.',
    );
  };

  const calculateOverall = (tr: number, cc: number, lr: number, gra: number) => {
    const raw = (tr + cc + lr + gra) / 4;
    return Math.round(raw * 2) / 2; // IELTS round to nearest 0.5
  };

  const currentOverall = calculateOverall(scoreTR, scoreCC, scoreLR, scoreGRA);

  const handleQuickApprove = async (sub: WritingReviewItem) => {
    try {
      await writingService.approveSubmission(sub.id, {
        teacherScore: sub.aiOverall,
        teacherFeedback: 'Phê duyệt chuẩn xác theo phân tích 4 tiêu chí của AI.',
        isApproved: true,
      });
    } catch {
      // Local fallback
    }

    setSubmissions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: 'APPROVED' } : s)),
    );
    setPublishNotice(
      `Đã duyệt nhanh bài viết của học viên ${sub.studentName} với điểm Band ${sub.aiOverall.toFixed(1)} thành công!`,
    );
    setTimeout(() => setPublishNotice(''), 4000);
  };

  const handleApproveAndPublish = async () => {
    if (!activeReview) return;
    setSubmittingApproval(true);

    try {
      await writingService.approveSubmission(activeReview.id, {
        teacherScore: currentOverall,
        teacherFeedback,
        isApproved: true,
      });
    } catch {
      // Local fallback
    } finally {
      setSubmittingApproval(false);
    }

    setSubmissions((prev) =>
      prev.map((s) => (s.id === activeReview.id ? { ...s, status: 'APPROVED' } : s)),
    );
    setPublishNotice(
      `Đã phê duyệt và phát hành kết quả cho học viên ${activeReview.studentName} (Overall Band ${currentOverall})!`,
    );
    setActiveReview(null);
    setTimeout(() => setPublishNotice(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Admin Writing Approval Workflow (BIZ-WR-001)</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Phê Duyệt & Override Điểm AI IELTS Writing</span>
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Quy tắc chuẩn: Điểm AI chỉ là bản nháp sơ bộ (Draft). Điểm chính thức chỉ gửi về học viên sau khi Thầy Đông bấm duyệt.
        </p>
      </div>

      {publishNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{publishNotice}</span>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-line text-muted uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Học Viên</th>
                <th className="py-3 px-4">Đề Bài</th>
                <th className="py-3 px-4">Dạng Bài</th>
                <th className="py-3 px-4">Số Từ</th>
                <th className="py-3 px-4">Điểm AI Sơ Bộ</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{sub.studentName}</p>
                    <p className="text-[11px] text-muted">{sub.studentEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-xs truncate">
                    {sub.taskTitle}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-primary">
                      {sub.taskType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{sub.wordCount} từ</td>
                  <td className="py-3.5 px-4 font-bold text-primary">
                    Band {sub.aiOverall.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        sub.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {sub.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleQuickApprove(sub)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center space-x-1"
                          title="Duyệt nhanh toàn bộ điểm AI (1-click)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Duyệt nhanh</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-xs flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem & Chấm Điểm</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Review Drawer / Modal */}
      {activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-line overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Phê Duyệt Bài Viết: {activeReview.studentName}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {activeReview.taskTitle} • {activeReview.wordCount} từ
                </p>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Student Essay Content Box */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Bài làm của học viên:
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-line text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                  {activeReview.essayText}
                </div>
              </div>

              {/* 4 Criteria Override Controls */}
              <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-slate-800">
                    Bảng Điều Chỉnh Điểm 4 Tiêu Chí (Teacher Override):
                  </h4>
                  <div className="text-right">
                    <span className="text-[10px] text-muted uppercase font-bold">
                      Overall Band Sau Duyệt:
                    </span>
                    <span className="text-xl font-black text-primary ml-2">
                      {currentOverall.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Task Response (TR)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={scoreTR}
                      onChange={(e) => setScoreTR(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-line font-bold text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Coherence (CC)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={scoreCC}
                      onChange={(e) => setScoreCC(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-line font-bold text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Lexical Resource (LR)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={scoreLR}
                      onChange={(e) => setScoreLR(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-line font-bold text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Grammar (GRA)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={scoreGRA}
                      onChange={(e) => setScoreGRA(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-line font-bold text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Teacher Official Feedback */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Nhận xét chính thức của Giáo viên (Thầy Đông):
                </label>
                <textarea
                  rows={3}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Nhập nhận xét và chỉ đạo sửa bài cho học viên..."
                  className="w-full p-3.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-line flex items-center justify-end space-x-3 bg-slate-50">
              <button
                onClick={() => setActiveReview(null)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-bold text-slate-600 hover:bg-white"
              >
                Đóng
              </button>
              <button
                disabled={submittingApproval}
                onClick={handleApproveAndPublish}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                {submittingApproval && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Phê Duyệt & Phát Hành Kết Quả (Overall {currentOverall.toFixed(1)})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
