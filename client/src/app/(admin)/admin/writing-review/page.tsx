'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';

interface WritingSubmission {
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
  const [submissions, setSubmissions] = useState<WritingSubmission[]>([
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

  const [activeReview, setActiveReview] = useState<WritingSubmission | null>(null);
  const [scoreTR, setScoreTR] = useState(7.0);
  const [scoreCC, setScoreCC] = useState(7.0);
  const [scoreLR, setScoreLR] = useState(7.0);
  const [scoreGRA, setScoreGRA] = useState(7.0);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [publishNotice, setPublishNotice] = useState('');

  const handleOpenReview = (sub: WritingSubmission) => {
    setActiveReview(sub);
    setScoreTR(sub.aiTR);
    setScoreCC(sub.aiCC);
    setScoreLR(sub.aiLR);
    setScoreGRA(sub.aiGRA);
    setTeacherFeedback(
      'Bài viết có cấu trúc mạch lạc, từ vựng học thuật C1/C2 dùng chuẩn xác. Thầy cộng thêm 0.5 điểm cho tiêu chí Lexical Resource vì các cụm collocation tự nhiên.'
    );
  };

  const calculateOverall = (tr: number, cc: number, lr: number, gra: number) => {
    const raw = (tr + cc + lr + gra) / 4;
    return Math.round(raw * 2) / 2; // IELTS round to nearest 0.5
  };

  const currentOverall = calculateOverall(scoreTR, scoreCC, scoreLR, scoreGRA);

  const handleApproveAndPublish = () => {
    if (!activeReview) return;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === activeReview.id ? { ...s, status: 'APPROVED' } : s))
    );
    setPublishNotice(
      `Đã phê duyệt và phát hành kết quả cho học viên ${activeReview.studentName} (Overall Band ${currentOverall})!`
    );
    setActiveReview(null);
    setTimeout(() => setPublishNotice(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Hàng Đợi Duyệt Điểm IELTS Writing AI (Human-in-the-Loop)
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Quy trình bắt buộc: Admin/Giáo viên kiểm tra phân tích của AI, điều chỉnh điểm số và phê duyệt trước khi công bố cho học viên.
        </p>
      </div>

      {publishNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{publishNotice}</span>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Bài viết đang chờ phê duyệt ({submissions.filter((s) => s.status === 'AI_EVALUATED').length})
          </h3>
        </div>

        <div className="divide-y divide-line">
          {submissions.map((sub) => (
            <div key={sub.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">{sub.studentName}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    AI Band: {sub.aiOverall}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sub.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {sub.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{sub.taskTitle}</p>
                <p className="text-[11px] text-muted">
                  {sub.wordCount} từ • Nộp lúc: {sub.submittedAt}
                </p>
              </div>

              <button
                onClick={() => handleOpenReview(sub)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem & Duyệt Điểm</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal Dialog */}
      {activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-line">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Phê Duyệt Bài Viết: {activeReview.studentName}
                </h3>
                <p className="text-[11px] text-slate-400">{activeReview.taskTitle}</p>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Essay Content */}
              <div className="p-4 rounded-xl bg-slate-50 border border-line space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Nội dung bài viết ({activeReview.wordCount} từ)
                </span>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                  {activeReview.essayText}
                </p>
              </div>

              {/* 4-Criteria Override Sliders / Selects */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Điểm 4 Tiêu Chí (Gợi ý AI vs Giáo Viên Quyết Định)
                  </h4>
                  <span className="text-xs font-extrabold text-primary bg-sky-50 px-2.5 py-1 rounded-lg">
                    Overall Band Dự Kiến: {currentOverall}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Task Response (TR)
                    </label>
                    <select
                      value={scoreTR}
                      onChange={(e) => setScoreTR(parseFloat(e.target.value))}
                      className="w-full p-2 rounded-lg border border-line text-xs font-bold bg-white"
                    >
                      {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                        <option key={v} value={v}>Band {v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Coherence (CC)
                    </label>
                    <select
                      value={scoreCC}
                      onChange={(e) => setScoreCC(parseFloat(e.target.value))}
                      className="w-full p-2 rounded-lg border border-line text-xs font-bold bg-white"
                    >
                      {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                        <option key={v} value={v}>Band {v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Lexical (LR)
                    </label>
                    <select
                      value={scoreLR}
                      onChange={(e) => setScoreLR(parseFloat(e.target.value))}
                      className="w-full p-2 rounded-lg border border-line text-xs font-bold bg-white"
                    >
                      {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                        <option key={v} value={v}>Band {v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Grammar (GRA)
                    </label>
                    <select
                      value={scoreGRA}
                      onChange={(e) => setScoreGRA(parseFloat(e.target.value))}
                      className="w-full p-2 rounded-lg border border-line text-xs font-bold bg-white"
                    >
                      {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                        <option key={v} value={v}>Band {v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Teacher Custom Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhận xét của Giáo viên (Bắt buộc $\ge 20$ ký tự)
                </label>
                <textarea
                  rows={4}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-line text-xs focus:outline-none focus:border-purple-600"
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-line flex items-center justify-end space-x-3">
              <button
                onClick={() => setActiveReview(null)}
                className="px-4 py-2 rounded-xl bg-white border border-line text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApproveAndPublish}
                disabled={teacherFeedback.length < 20}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Phê Duyệt & Công Bố Kết Quả Cho Học Viên</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

