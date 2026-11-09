'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { quizzesService } from '@/services/quizzes.service';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Unlock,
  RefreshCw,
  Award,
} from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: { key: string; text: string }[];
  correct: string;
  explanation: string;
}

export default function StudentQuizPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const questions: Question[] = [
    {
      id: 1,
      text: 'Which sentence demonstrates the most formal academic tone for Task 2 introduction?',
      options: [
        { key: 'A', text: 'Lots of people think that fast food is really bad for you.' },
        { key: 'B', text: 'It is widely argued that the consumption of ultra-processed food exerts detrimental impacts on public health.' },
        { key: 'C', text: 'I feel that fast food should be banned everywhere because it sucks.' },
        { key: 'D', text: 'Fast food is no good for everyone living in modern cities.' },
      ],
      correct: 'B',
      explanation: 'Phương án B sử dụng thể bị động khách quan ("It is widely argued that") kết hợp cụm collocation học thuật ("exerts detrimental impacts on"), phù hợp nhất với tiêu chí Lexical Resource & Task Response.',
    },
    {
      id: 2,
      text: 'Identify the sentence containing correct subject-verb agreement with a complex subject:',
      options: [
        { key: 'A', text: 'The influx of international students have increased dramatically.' },
        { key: 'B', text: 'The influx of international students has increased dramatically.' },
        { key: 'C', text: 'The influx of international students are increasing dramatically.' },
        { key: 'D', text: 'The influx of international students were increased dramatically.' },
      ],
      correct: 'B',
      explanation: 'Chủ ngữ chính của câu là danh từ số ít "The influx" (sự tràn vào), do đó động từ chính phải chia số ít ở dạng hoàn thành "has increased".',
    },
    {
      id: 3,
      text: 'What is the minimum word count required for IELTS Writing Task 2?',
      options: [
        { key: 'A', text: '150 words' },
        { key: 'B', text: '200 words' },
        { key: 'C', text: '250 words' },
        { key: 'D', text: '300 words' },
      ],
      correct: 'C',
      explanation: 'Theo quy chế Cambridge IELTS, Task 2 yêu cầu tối thiểu 250 từ. Viết dưới 250 từ sẽ bị trừ điểm Task Response (TR).',
    },
  ];

  const handleSelectOption = (key: string) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: key,
    });
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    // Strict Sàn điểm >= 80% theo đặc tả BIZ-QZ-003
    return { correctCount, percentage, isPassed: percentage >= 80 };
  };

  const { correctCount, percentage, isPassed } = calculateScore();

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const answersPayload = questions.map((q, idx) => ({
        questionId: `q-${q.id}`,
        selectedOptionId: selectedAnswers[idx] || '',
      }));
      await quizzesService.submitQuiz('quiz-checkpoint-03', answersPayload);
    } catch {
      // Local evaluation fallback
    } finally {
      setSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quiz Checkpoint 03: End-of-Module Mastery (BIZ-QZ-003)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Sàn điểm đạt: <strong>≥ 80%</strong> để mở khóa Module 04 tiếp theo.
          </p>
        </div>

        {/* Timer Badge */}
        <div
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold ${
            timeLeft < 300
              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
              : 'bg-sky-50 text-primary border border-sky-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Thời gian còn: {formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Main Quiz Card */}
      {!isSubmitted ? (
        <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-sm space-y-6">
          {/* Question Navigation Bubbles */}
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="text-xs font-bold text-slate-700">
              Câu hỏi {currentIdx + 1} / {questions.length}
            </span>
            <div className="flex items-center space-x-2">
              {questions.map((_, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isCurrent = currentIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-primary text-white shadow-sm'
                        : isAnswered
                        ? 'bg-sky-100 text-primary'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {currentQ.text}
            </h2>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswers[currentIdx] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs transition flex items-start space-x-3.5 ${
                      isSelected
                        ? 'bg-sky-50/70 border-primary shadow-xs font-semibold'
                        : 'bg-white border-line hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="pt-0.5 text-slate-800">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-line">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="px-4 py-2 rounded-xl border border-line text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Câu Trước
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-sm"
              >
                Câu Tiếp Theo
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Nộp Bài Chấm Điểm (Instant)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Summary Card */
        <div className="bg-white rounded-3xl border border-line p-8 shadow-sm space-y-6 text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
              isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isPassed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <div className="space-y-1">
            <span
              className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${
                isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isPassed ? 'ĐÃ ĐẠT CHECKPOINT' : 'CHƯA ĐẠT SÀN ĐIỂM (CẦN LÀM LẠI)'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">
              Kết Quả: {percentage}% ({correctCount}/{questions.length} Câu Đúng)
            </h2>
            <p className="text-xs text-muted max-w-md mx-auto pt-1">
              {isPassed
                ? 'Chúc mừng! Bạn đã hoàn thành yêu cầu điểm sàn ≥ 80%. Module 04 đã được tự động mở khóa.'
                : 'Bạn cần đạt tối thiểu 80% điểm để mở khóa bài học tiếp theo. Hãy xem lại lời giải bên dưới và thử lại.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            {!isPassed && (
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSelectedAnswers({});
                  setCurrentIdx(0);
                  setTimeLeft(15 * 60);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm Lại Bài Thi</span>
              </button>
            )}
            <Link
              href="/student/courses"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center space-x-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Quay Về Danh Sách Khóa Học</span>
            </Link>
          </div>

          {/* Detailed Explanations */}
          <div className="text-left space-y-4 pt-6 border-t border-line">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>Giải Thích Đáp Án Chi Tiết:</span>
            </h3>

            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correct;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800">
                      Câu {idx + 1}: {q.text}
                    </span>
                    <span
                      className={`flex items-center space-x-1 ${
                        isCorrect ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đúng</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Sai</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Đáp án của bạn:{' '}
                    <strong>{selectedAnswers[idx] || 'Chưa chọn'}</strong> • Đáp án đúng:{' '}
                    <strong className="text-primary">{q.correct}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px] bg-white/70 p-2.5 rounded-xl border border-line">
                    💡 <strong>Giải thích:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
