'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Unlock,
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
    return { correctCount, percentage, isPassed: percentage >= 70 };
  };

  const { correctCount, percentage, isPassed } = calculateScore();

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded">
            Checkpoint 03 • Module Assessment
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Kiểm Tra Kiến Thức Cuối Module 03 (Grammar & Vocabulary)
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {!isSubmitted && (
            <button
              onClick={() => setIsSubmitted(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-sm"
            >
              Nộp Bài Thi
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Navigation Palette & Question Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Palette */}
        <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Bảng điều hướng câu hỏi
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurrent = currentIdx === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    isCurrent
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  } ${
                    isSubmitted
                      ? selectedAnswers[idx] === q.correct
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                      : isAnswered
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Câu {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-line text-[11px] text-muted space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-primary"></span>
              <span>Đã trả lời</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
              <span>Chưa trả lời</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span>
              <span>Đáp án đúng ($\ge 70\%$ đạt)</span>
            </div>
          </div>
        </div>

        {/* Right Question Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-bold text-primary">
                CÂU HỎI {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-[11px] text-muted">Trắc nghiệm chọn 1 đáp án</span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {questions[currentIdx].text}
            </h2>

            {/* 4 Options */}
            <div className="space-y-3">
              {questions[currentIdx].options.map((opt) => {
                const isSelected = selectedAnswers[currentIdx] === opt.key;
                const isCorrect = questions[currentIdx].correct === opt.key;

                let optClass = 'bg-white border-line hover:border-slate-300';
                if (isSubmitted) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-red-50 border-red-300 text-red-900';
                  }
                } else if (isSelected) {
                  optClass = 'bg-sky-50 border-primary text-primary font-bold';
                }

                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-start space-x-3 text-xs sm:text-sm ${optClass}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="flex-1 mt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation when submitted */}
            {isSubmitted && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 animate-in fade-in-50">
                <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span>Giải thích ngữ pháp chi tiết:</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {questions[currentIdx].explanation}
                </p>
              </div>
            )}
          </div>

          {/* Result Card when Submitted */}
          {isSubmitted && (
            <div className="bg-white rounded-2xl border border-line p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom duration-200">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isPassed ? 'Chúc Mừng! Bạn Đã Vượt Qua Checkpoint' : 'Chưa Đạt Điểm Yêu Cầu'}
                  </h3>
                </div>
                <p className="text-xs text-muted">
                  Kết quả: <strong>{correctCount}/{questions.length}</strong> câu đúng ({percentage}%).
                  {isPassed
                    ? ' Quy tắc BIZ-QZ-003: Module 04 đã được tự động mở khóa thành công!'
                    : ' Bạn cần đạt tối thiểu 70% để mở khóa bài học tiếp theo.'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {!isPassed && (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSelectedAnswers({});
                      setTimeLeft(15 * 60);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm Lại Bài Thi</span>
                  </button>
                )}
                <Link
                  href="/student/courses"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Về Đề Cương Khóa Học</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

