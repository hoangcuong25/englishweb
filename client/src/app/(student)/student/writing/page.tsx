'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function StudentWritingPage() {
  const [taskType, setTaskType] = useState<'TASK_1' | 'TASK_2'>('TASK_2');
  const [essayContent, setEssayContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    overallBand: number;
    tr: number;
    cc: number;
    lr: number;
    gra: number;
    status: 'AI_EVALUATED' | 'APPROVED';
    feedback: string;
    vocabSuggestions: string[];
    sampleModel: string;
  } | null>(null);

  // Word counter
  useEffect(() => {
    const trimmed = essayContent.trim();
    if (!trimmed) {
      setWordCount(0);
    } else {
      const words = trimmed.split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
    setIsAutoSaved(false);
    const saveTimeout = setTimeout(() => {
      setIsAutoSaved(true);
    }, 1500);
    return () => clearTimeout(saveTimeout);
  }, [essayContent]);

  // Timer
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTaskChange = (type: 'TASK_1' | 'TASK_2') => {
    setTaskType(type);
    setTimeLeft(type === 'TASK_1' ? 20 * 60 : 40 * 60);
    setEssayContent('');
    setEvaluationResult(null);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleSubmitEvaluation = () => {
    if (wordCount < 50) return;
    setIsSubmitting(true);
    // Simulate AI evaluation pipeline
    setTimeout(() => {
      setIsSubmitting(false);
      setEvaluationResult({
        overallBand: 7.0,
        tr: 7.0,
        cc: 7.0,
        lr: 7.5,
        gra: 6.5,
        status: 'AI_EVALUATED',
        feedback:
          'Bài viết phát triển luận điểm rõ ràng, có cấu trúc 4 đoạn chuẩn mực. Từ vựng học thuật phong phú nhưng cần chú ý một số cấu trúc câu phức với mệnh đề quan hệ để đạt 7.5 GRA.',
        vocabSuggestions: [
          'Thay thế "good" bằng "advantageous" hoặc "conducive"',
          'Thay thế "people think" bằng "it is widely asserted that"',
          'Bổ sung cụm "on the grounds that" để liên kết nguyên nhân',
        ],
        sampleModel:
          'In modern contemporary society, an increasing number of individuals assert that...',
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI IELTS Writing Studio</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Phòng Luyện Viết & Phân Tích 4 Tiêu Chí
          </h1>
        </div>

        {/* Task Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => handleTaskChange('TASK_1')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              taskType === 'TASK_1'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Task 1 (150 từ • 20m)
          </button>
          <button
            onClick={() => handleTaskChange('TASK_2')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              taskType === 'TASK_2'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Task 2 (250 từ • 40m)
          </button>
        </div>
      </div>

      {/* Main Workspace: Prompt & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Prompt Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Đề Bài Chính Thức
              </span>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                {taskType === 'TASK_1' ? 'Academic Report' : 'Opinion Essay'}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
              {taskType === 'TASK_2'
                ? 'Some people believe that university education should be free for all students regardless of their socioeconomic background. Others, however, argue that students should pay tuition fees. Discuss both views and give your own opinion.'
                : 'The chart below shows the percentage of electricity generated from clean renewable energy sources in four different countries between 2010 and 2024. Summarise the information by selecting and reporting the main features.'}
            </p>

            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 space-y-1">
              <p className="font-bold">Quy chuẩn chấm điểm:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Task Response / Achievement (TR): 25%</li>
                <li>Coherence & Cohesion (CC): 25%</li>
                <li>Lexical Resource (LR): 25%</li>
                <li>Grammatical Range & Accuracy (GRA): 25%</li>
              </ul>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Số từ đã viết</span>
              <span
                className={`text-sm font-extrabold ${
                  wordCount >= (taskType === 'TASK_2' ? 250 : 150)
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {wordCount} / {taskType === 'TASK_2' ? '250' : '150'} từ
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Tự động lưu nháp</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {isAutoSaved ? 'Đã lưu' : 'Đang lưu...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Full-Screen Editor & Evaluation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleStartTimer}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                    isTimerRunning
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timeLeft)}</span>
                  <span>{isTimerRunning ? '(Tạm dừng)' : '(Bấm giờ)'}</span>
                </button>
              </div>

              <button
                onClick={handleSubmitEvaluation}
                disabled={wordCount < 50 || isSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-purple-200 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <span>AI Đang Phân Tích 4 Tiêu Chí...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Nộp Bài Chấm Điểm AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Textarea Editor */}
            <textarea
              rows={16}
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
              placeholder="Start writing your essay here... (Minimum 250 words for Task 2, 150 words for Task 1)"
              className="w-full p-4 rounded-xl border border-line focus:outline-none focus:border-purple-500 font-sans text-xs sm:text-sm leading-relaxed resize-y"
            ></textarea>
          </div>

          {/* AI Evaluation Result Card */}
          {evaluationResult && (
            <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-lg space-y-5 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-lg">
                    {evaluationResult.overallBand}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Kết Quả Đánh Giá IELTS Writing (AI Assessment)
                    </h3>
                    <p className="text-xs text-muted">
                      Trạng thái:{' '}
                      <strong className="text-amber-600">
                        {evaluationResult.status === 'AI_EVALUATED'
                          ? 'Đã chấm qua AI — Chờ Thầy Đông duyệt kết quả cuối'
                          : 'Đã được Thầy Đông phê duyệt'}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Criteria Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-line">
                  <p className="text-[11px] font-bold text-muted">Task Response (TR)</p>
                  <p className="text-xl font-extrabold text-purple-600 mt-1">{evaluationResult.tr}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-line">
                  <p className="text-[11px] font-bold text-muted">Coherence (CC)</p>
                  <p className="text-xl font-extrabold text-purple-600 mt-1">{evaluationResult.cc}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-line">
                  <p className="text-[11px] font-bold text-muted">Lexical Resource (LR)</p>
                  <p className="text-xl font-extrabold text-purple-600 mt-1">{evaluationResult.lr}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-line">
                  <p className="text-[11px] font-bold text-muted">Grammar (GRA)</p>
                  <p className="text-xl font-extrabold text-purple-600 mt-1">{evaluationResult.gra}</p>
                </div>
              </div>

              {/* Detailed Feedback & Vocabulary Suggestions */}
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-50 border border-line">
                  <p className="font-bold text-slate-800 mb-1">Nhận xét chi tiết:</p>
                  <p className="text-slate-600">{evaluationResult.feedback}</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                  <p className="font-bold text-purple-900 mb-2">Gợi ý từ vựng nâng cao Band 8.0+ (C1/C2):</p>
                  <ul className="list-disc pl-5 space-y-1 text-purple-800">
                    {evaluationResult.vocabSuggestions.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

