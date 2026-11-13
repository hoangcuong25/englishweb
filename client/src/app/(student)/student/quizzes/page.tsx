'use client';

import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Highlighter,
  Columns,
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export type QuestionType = 'SINGLE_CHOICE' | 'TRUE_FALSE_NOT_GIVEN' | 'FILL_BLANK';

export interface QuizQuestionData {
  id: string;
  type: QuestionType;
  text: string;
  options?: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizTestData {
  id: string;
  title: string;
  skill: string;
  timeLimitMinutes: number;
  passScore: number;
  passage?: string;
  questions: QuizQuestionData[];
}

export default function StudentQuizPage() {
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number>(1); // Default to Split-View Reading exam
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [highlightColor, setHighlightColor] = useState<string>('yellow');
  const [passageText, setPassageText] = useState<string>('');

  const quizzesList: QuizTestData[] = [
    {
      id: 'quiz-checkpoint-03',
      title: 'Module 03 Checkpoint Quiz: Formal Academic Style',
      skill: 'WRITING_GRAMMAR',
      timeLimitMinutes: 15,
      passScore: 80,
      questions: [
        {
          id: 'q1',
          type: 'SINGLE_CHOICE',
          text: 'Which sentence demonstrates the most formal academic tone for Task 2 introduction?',
          options: [
            { key: 'A', text: 'Lots of people think that fast food is really bad for you.' },
            { key: 'B', text: 'It is widely argued that the consumption of ultra-processed food exerts detrimental impacts on public health.' },
            { key: 'C', text: 'I feel that fast food should be banned everywhere because it sucks.' },
            { key: 'D', text: 'Fast food is no good for everyone living in modern cities.' },
          ],
          correctAnswer: 'B',
          explanation: 'Phương án B dùng cấu trúc khách quan "It is widely argued that" kết hợp collocation "exerts detrimental impacts on", chuẩn academic register.',
        },
        {
          id: 'q2',
          type: 'SINGLE_CHOICE',
          text: 'Identify the sentence containing correct subject-verb agreement with a complex subject:',
          options: [
            { key: 'A', text: 'The influx of international students have increased dramatically.' },
            { key: 'B', text: 'The influx of international students has increased dramatically.' },
            { key: 'C', text: 'The influx of international students are increasing dramatically.' },
            { key: 'D', text: 'The influx of international students were increased dramatically.' },
          ],
          correctAnswer: 'B',
          explanation: 'Chủ ngữ chính "The influx" là danh từ số ít, do đó động từ chính phải chia "has increased".',
        },
        {
          id: 'q3',
          type: 'FILL_BLANK',
          text: 'Fill in the blank with the appropriate academic preposition: "Children under 16 are particularly susceptible ___ peer pressure."',
          correctAnswer: 'to',
          explanation: 'Cấu trúc tính từ chuẩn là "be susceptible TO something" (dễ bị ảnh hưởng/tổn thương bởi cái gì).',
        },
      ],
    },
    {
      id: 'quiz-reading-cambridge-01',
      title: 'IELTS Academic Reading: The Future of Renewable Energy (Split-View Exam)',
      skill: 'READING',
      timeLimitMinutes: 20,
      passScore: 80,
      passage: `READING PASSAGE 1: THE ACCELERATION OF CLEAN ENERGY TRANSITION

Paragraph A: Over the past decade, the global energy landscape has witnessed unprecedented transformations. What once appeared as marginal technologies — predominantly photovoltaic solar cells and onshore wind turbines — have undergone cost reductions of exponential proportions. According to statistical indicators from the International Renewable Energy Agency (IRENA), the levelised cost of solar photovoltaic electricity declined by approximately 88 percent between 2010 and 2023.

Paragraph B: This phenomenal decrease in capital expenditures has overturned longstanding economic assumptions. For decades, fossil fuel proponents contended that deep decarbonisation would induce economic recessions and destabilise electric grids. Today, in over two-thirds of the world's populated territories, erecting newly commissioned renewable generation plants is demonstrably cheaper than sustaining existing coal and gas infrastructure.

Paragraph C: Nevertheless, substantial obstacles remain. The intrinsic intermittency of wind and solar requires massive investments in advanced grid storage solutions, notably lithium-iron-phosphate (LFP) battery systems, pumped-storage hydroelectric installations, and green hydrogen electrolysers. Furthermore, regulatory hurdles and antiquated grid connection queues have prolonged transition timetables in numerous industrialised economies.`,
      questions: [
        {
          id: 'r1',
          type: 'TRUE_FALSE_NOT_GIVEN',
          text: 'According to IRENA, the cost of solar energy dropped by almost 90% between 2010 and 2023.',
          options: [
            { key: 'TRUE', text: 'TRUE' },
            { key: 'FALSE', text: 'FALSE' },
            { key: 'NOT GIVEN', text: 'NOT GIVEN' },
          ],
          correctAnswer: 'TRUE',
          explanation: 'Đoạn A nêu: "the levelised cost of solar photovoltaic electricity declined by approximately 88 percent", xấp xỉ 90% -> Đáp án TRUE.',
        },
        {
          id: 'r2',
          type: 'TRUE_FALSE_NOT_GIVEN',
          text: 'Fossil fuel companies have completely halted oil exploration in developing nations.',
          options: [
            { key: 'TRUE', text: 'TRUE' },
            { key: 'FALSE', text: 'FALSE' },
            { key: 'NOT GIVEN', text: 'NOT GIVEN' },
          ],
          correctAnswer: 'NOT GIVEN',
          explanation: 'Bài đọc không hề đề cập tới việc các công ty hóa thạch đã dừng hoàn toàn khai thác dầu mỏ hay chưa -> Đáp án NOT GIVEN.',
        },
        {
          id: 'r3',
          type: 'FILL_BLANK',
          text: 'Complete the sentence with ONE WORD from Paragraph C: "The inherent _______ of wind and solar energy presents a major technical hurdle."',
          correctAnswer: 'intermittency',
          explanation: 'Đoạn C có câu: "The intrinsic intermittency of wind and solar requires massive investments..." -> Từ cần điền là "intermittency".',
        },
        {
          id: 'r4',
          type: 'SINGLE_CHOICE',
          text: 'What is the main finding regarding renewable energy cost compared to fossil fuels in populated areas?',
          options: [
            { key: 'A', text: 'Renewable plants are now cheaper to construct than continuing to operate existing fossil infrastructure.' },
            { key: 'B', text: 'Renewable plants require higher annual operational subsidies.' },
            { key: 'C', text: 'Coal and gas plants will completely cease operation by next year.' },
            { key: 'D', text: 'Nuclear fusion has superseded solar photovoltaic arrays.' },
          ],
          correctAnswer: 'A',
          explanation: 'Đoạn B khẳng định: "erecting newly commissioned renewable generation plants is demonstrably cheaper than sustaining existing coal and gas infrastructure".',
        },
      ],
    },
  ];

  const activeQuiz = quizzesList[selectedQuizIndex];
  const questions = activeQuiz.questions;
  const currentQuestion = questions[currentIdx] || questions[0];

  useEffect(() => {
    setTimeLeft(activeQuiz.timeLimitMinutes * 60);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setPassageText(activeQuiz.passage || '');
  }, [selectedQuizIndex, activeQuiz.timeLimitMinutes, activeQuiz.passage]);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleSelectOption = (qId: string, answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: answer,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const userAns = (selectedAnswers[q.id] || '').trim().toLowerCase();
      const rightAns = q.correctAnswer.trim().toLowerCase();
      if (userAns === rightAns) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    return {
      correctCount,
      percentage,
      isPassed: percentage >= activeQuiz.passScore,
    };
  };

  const { correctCount, percentage, isPassed } = calculateScore();

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: q.type === 'FILL_BLANK' ? undefined : selectedAnswers[q.id],
        textAnswer: q.type === 'FILL_BLANK' ? selectedAnswers[q.id] : undefined,
      }));
      await quizzesService.submitQuiz(activeQuiz.id, answersPayload);
    } catch {
      // Local fallback
    } finally {
      setSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(activeQuiz.timeLimitMinutes * 60);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSplitView = Boolean(activeQuiz.passage);

  return (
    <div className="space-y-6">
      {/* Header and Quiz Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-primary text-xs font-bold mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>IELTS Diagnostic & Checkpoint Engine (BIZ-QZ-001)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{activeQuiz.title}</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Sàn điểm đạt: &ge; {activeQuiz.passScore}% để mở khóa bài học tiếp theo. Hỗ trợ giao diện chia đôi màn hình chuẩn Cambridge.
          </p>
        </div>

        {/* Quiz Select buttons */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl">
          {quizzesList.map((quiz, idx) => (
            <button
              key={quiz.id}
              onClick={() => setSelectedQuizIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedQuizIndex === idx
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {quiz.passage ? <Columns className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{quiz.passage ? 'Reading Split-View' : 'Grammar Checkpoint'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Exam Info Bar */}
      <div className="p-4 rounded-2xl bg-white border border-line shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Câu {currentIdx + 1} / {questions.length}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition ${
                    isCurrent
                      ? 'bg-primary text-white shadow-sm'
                      : isAnswered
                      ? 'bg-sky-100 text-primary border border-sky-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 font-mono font-bold text-xs text-slate-800">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Main Exam Area (Split-View for Reading, or Single View for Grammar) */}
      <div className={`grid gap-6 ${isSplitView ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: Reading Passage with Highlighter (For Split-View) */}
        {isSplitView && (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-line shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Passage Toolbar */}
            <div className="p-3.5 border-b border-line bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Reading Passage (Cuộn độc lập)</span>
              </div>

              {/* Highlighter Tools */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                  <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dạ quang:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setHighlightColor('yellow')}
                  className={`w-5 h-5 rounded-full bg-yellow-300 border transition ${
                    highlightColor === 'yellow' ? 'border-primary ring-2 ring-primary/40' : 'border-slate-300'
                  }`}
                  title="Vàng dạ quang"
                />
                <button
                  type="button"
                  onClick={() => setHighlightColor('green')}
                  className={`w-5 h-5 rounded-full bg-emerald-300 border transition ${
                    highlightColor === 'green' ? 'border-primary ring-2 ring-primary/40' : 'border-slate-300'
                  }`}
                  title="Xanh dạ quang"
                />
              </div>
            </div>

            {/* Scrollable Passage Text */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans select-text">
              <pre
                className={`whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed p-2 rounded-xl transition ${
                  highlightColor === 'green' ? 'selection:bg-emerald-200' : 'selection:bg-yellow-200'
                } text-slate-800`}
              >
                {passageText}
              </pre>
            </div>
          </div>
        )}

        {/* Right Column (or Center): Interactive Questions Pane */}
        <div className={`${isSplitView ? 'lg:col-span-5' : 'max-w-3xl mx-auto w-full'} space-y-5`}>
          <div className="bg-white rounded-3xl border border-line shadow-sm p-6 space-y-5">
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-sky-100 text-primary">
                {currentQuestion.type === 'TRUE_FALSE_NOT_GIVEN'
                  ? 'True / False / Not Given'
                  : currentQuestion.type === 'FILL_BLANK'
                  ? 'Fill In The Blank (Điền từ)'
                  : 'Multiple Choice'}
              </span>
              <span className="text-xs font-bold text-slate-400">Câu #{currentIdx + 1}</span>
            </div>

            {/* Question Text */}
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              {currentQuestion.text}
            </h2>

            {/* Render by Question Type */}
            {currentQuestion.type === 'FILL_BLANK' ? (
              /* Fill-In-The-Blank Input */
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Nhập câu trả lời của bạn:
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={selectedAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleSelectOption(currentQuestion.id, e.target.value)}
                  placeholder="Gõ từ cần điền vào đây..."
                  className="w-full px-4 py-3 rounded-xl border border-line text-sm font-semibold focus:outline-none focus:border-primary bg-slate-50 focus:bg-white transition"
                />
              </div>
            ) : currentQuestion.type === 'TRUE_FALSE_NOT_GIVEN' ? (
              /* True / False / Not Given Chips */
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {['TRUE', 'FALSE', 'NOT GIVEN'].map((optKey) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(currentQuestion.id, optKey)}
                      className={`py-3 px-3 rounded-2xl text-xs font-extrabold border transition ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                          : 'bg-slate-50 text-slate-700 border-line hover:bg-slate-100'
                      }`}
                    >
                      {optKey}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Multiple Choice 4 Options */
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options?.map((opt) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-sky-50 border-primary text-primary font-bold shadow-sm'
                          : 'bg-slate-50/60 border-line text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Explanation when submitted */}
            {isSubmitted && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center space-x-2 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Đáp án đúng:{' '}
                    <span className="font-mono underline font-extrabold text-emerald-700">
                      {currentQuestion.correctAnswer}
                    </span>
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Pagination between questions */}
            <div className="flex items-center justify-between pt-4 border-t border-line">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-line bg-slate-50 hover:bg-slate-100 disabled:opacity-30 transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <button
                type="button"
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-line bg-slate-50 hover:bg-slate-100 disabled:opacity-30 transition flex items-center space-x-1"
              >
                <span>Câu tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Submission Card */}
          <div className="bg-white rounded-3xl border border-line shadow-sm p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium">Đã trả lời:</span>
              <p className="text-sm font-extrabold text-slate-800">
                {Object.keys(selectedAnswers).length} / {questions.length} câu
              </p>
            </div>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-primary/20 flex items-center space-x-1.5"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Nộp Bài Chấm Tức Thì</span>
              </button>
            ) : (
              <button
                onClick={handleResetQuiz}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm Lại Đề Thi</span>
              </button>
            )}
          </div>

          {/* Submission Result Feedback */}
          {isSubmitted && (
            <div
              className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
                isPassed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isPassed ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-extrabold">
                    {isPassed
                      ? 'Chúc mừng! Bạn đã đạt sàn điểm checkpoint!'
                      : 'Chưa đạt sàn điểm yêu cầu (≥ 80%)'}
                  </h3>
                  <p className="text-xs opacity-90">
                    Điểm số: {percentage}% ({correctCount}/{questions.length} câu đúng).
                  </p>
                </div>
              </div>

              {isPassed ? (
                <div className="pt-2 flex items-center space-x-2 text-xs font-bold text-emerald-800">
                  <Unlock className="w-4 h-4" />
                  <span>Bài học tiếp theo trong cây giáo trình đã được tự động mở khóa.</span>
                </div>
              ) : (
                <p className="text-xs text-rose-700">
                  Theo quy chuẩn đào tạo nghiêm ngặt, bạn cần xem lại lời giải chi tiết và làm lại bài kiểm tra để đạt từ 80% trở lên.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
