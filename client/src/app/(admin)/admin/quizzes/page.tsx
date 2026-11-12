'use client';

import React, { useState, useEffect } from 'react';
import CustomSelect from '@/components/ui/custom-select';
import {
  quizzesService,
  Quiz as RemoteQuiz,
  QuizQuestion as RemoteQuizQuestion,
  QuizQuestionOption,
} from '@/services/quizzes.service';
import {
  Plus,
  CheckCircle2,
  Trash2,
  X,
  BookOpen,
  Headphones,
  FileCode,
  PenTool,
  RefreshCw,
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  skill: string;
  questionText: string;
  correctAnswer: string;
  explanation: string;
}

export default function AdminQuizzesPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-1',
      skill: 'VOCABULARY',
      questionText: 'Which sentence demonstrates the most formal academic tone for Task 2 introduction?',
      correctAnswer: 'B',
      explanation: 'Sử dụng cấu trúc thể bị động khách quan và cụm collocation học thuật "exerts detrimental impacts on".',
    },
    {
      id: 'q-2',
      skill: 'GRAMMAR',
      questionText: 'Identify the sentence containing correct subject-verb agreement with a complex subject:',
      correctAnswer: 'B',
      explanation: 'Chủ ngữ chính "The influx" số ít đi cùng "has increased".',
    },
  ]);

  const [quizzes, setQuizzes] = useState<RemoteQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Question Form State (#questionBankModal - Form 9 in Plan)
  const [qFormData, setQFormData] = useState({
    skill: 'VOCABULARY',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
  });

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      let list = await quizzesService.getSkillsTests();
      if (!Array.isArray(list) || list.length === 0) {
        const all = await quizzesService.getAllQuizzes();
        list = Array.isArray(all) ? all : (all as { items?: unknown[] })?.items || [];
      }
      if (Array.isArray(list) && list.length > 0) {
        setQuizzes(list as RemoteQuiz[]);
        const loadedQuestions: QuizQuestion[] = [];
        (list as (RemoteQuiz & { skill?: string })[]).forEach((quiz) => {
          if (Array.isArray(quiz.questions)) {
            quiz.questions.forEach((q: RemoteQuizQuestion) => {
              const correctOpt = q.options?.find((o: QuizQuestionOption & { isCorrect?: boolean }) => o.isCorrect);
              const correctIdx = correctOpt ? q.options.indexOf(correctOpt) : 0;
              const correctLetter = String.fromCharCode(65 + (correctIdx >= 0 ? correctIdx : 0));
              loadedQuestions.push({
                id: q.id,
                skill: q.skillType || quiz.skill || 'VOCABULARY',
                questionText: q.content,
                correctAnswer: correctLetter,
                explanation: q.explanation || 'Đáp án chuẩn hóa theo ngân hàng đề thi.',
              });
            });
          }
        });
        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions);
        }
      }
    } catch (err) {
      console.warn('Could not load quizzes from backend, using local list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let targetQuizId = quizzes[0]?.id;
      if (!targetQuizId) {
        const createdQuiz = await quizzesService.createQuiz({
          title: 'Ngân hàng đề thi trắc nghiệm & 4 kỹ năng',
          passScore: 80,
          skill: qFormData.skill,
        });
        targetQuizId = createdQuiz.id;
      }

      const options = [
        { content: qFormData.optionA, isCorrect: qFormData.correctAnswer === 'A' },
        { content: qFormData.optionB, isCorrect: qFormData.correctAnswer === 'B' },
        { content: qFormData.optionC, isCorrect: qFormData.correctAnswer === 'C' },
        { content: qFormData.optionD, isCorrect: qFormData.correctAnswer === 'D' },
      ];

      await quizzesService.addQuestion(targetQuizId, {
        content: qFormData.questionText,
        skill: qFormData.skill,
        explanation: qFormData.explanation,
        options,
      });

      setNotice('Đã thêm câu hỏi mới vào Ngân hàng đề thành công trên máy chủ!');
      setIsQuestionModalOpen(false);
      setQFormData({
        skill: 'VOCABULARY',
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
      });
      await fetchQuizzes();
    } catch (err: unknown) {
      console.error('Failed to create question on server:', err);
      const newQ: QuizQuestion = {
        id: `q-${Date.now()}`,
        skill: qFormData.skill,
        questionText: qFormData.questionText,
        correctAnswer: qFormData.correctAnswer,
        explanation: qFormData.explanation,
      };
      setQuestions((prev) => [...prev, newQ]);
      setIsQuestionModalOpen(false);
      setNotice('Đã thêm câu hỏi vào ngân hàng đề cục bộ.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Bài Thi & Ngân Hàng Câu Hỏi (QZ-SCR-004, 005)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Quy tắc BIZ-QZ-003: Học viên đạt ≥ 80% sẽ tự động mở khóa Module bài học tiếp theo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchQuizzes()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-line bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Làm mới từ máy chủ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={() => setIsQuestionModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Soạn Câu Hỏi (#questionBankModal)</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Questions Bank List */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ngân hàng câu hỏi trắc nghiệm ({questions.length})
          </h3>
        </div>

        <div className="divide-y divide-line">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-5 space-y-2 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-primary">
                  {q.skill}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đáp án đúng: {q.correctAnswer}
                  </span>
                  <button
                    onClick={() => {
                      setQuestions(questions.filter((item) => item.id !== q.id));
                      setNotice('Đã xóa câu hỏi khỏi ngân hàng đề.');
                      setTimeout(() => setNotice(''), 3000);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Câu {idx + 1}: {q.questionText}
              </p>
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong>Giải thích:</strong> {q.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Question Bank Modal (#questionBankModal - Form 9 in Plan) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Soạn Thảo Câu Hỏi Mới (#questionBankModal)
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Kỹ năng kiểm tra"
                  value={qFormData.skill}
                  onChange={(val) => setQFormData({ ...qFormData, skill: val })}
                  options={[
                    {
                      value: 'VOCABULARY',
                      label: 'Vocabulary',
                      icon: <BookOpen className="w-4 h-4 text-sky-500" />,
                      badge: 'Lexis',
                      badgeColor: 'bg-sky-100 text-sky-700',
                    },
                    {
                      value: 'GRAMMAR',
                      label: 'Grammar',
                      icon: <PenTool className="w-4 h-4 text-emerald-500" />,
                      badge: 'Structure',
                      badgeColor: 'bg-emerald-100 text-emerald-700',
                    },
                    {
                      value: 'READING',
                      label: 'Reading',
                      icon: <FileCode className="w-4 h-4 text-purple-500" />,
                      badge: 'Academic',
                      badgeColor: 'bg-purple-100 text-purple-700',
                    },
                    {
                      value: 'LISTENING',
                      label: 'Listening',
                      icon: <Headphones className="w-4 h-4 text-amber-500" />,
                      badge: 'Audio',
                      badgeColor: 'bg-amber-100 text-amber-700',
                    },
                  ]}
                />

                <CustomSelect
                  label="Đáp án chính xác"
                  value={qFormData.correctAnswer}
                  onChange={(val) => setQFormData({ ...qFormData, correctAnswer: val })}
                  options={[
                    { value: 'A', label: 'Phương án A', colorDot: 'bg-emerald-500', badge: 'Key A', badgeColor: 'bg-emerald-50 text-emerald-700' },
                    { value: 'B', label: 'Phương án B', colorDot: 'bg-emerald-500', badge: 'Key B', badgeColor: 'bg-emerald-50 text-emerald-700' },
                    { value: 'C', label: 'Phương án C', colorDot: 'bg-emerald-500', badge: 'Key C', badgeColor: 'bg-emerald-50 text-emerald-700' },
                    { value: 'D', label: 'Phương án D', colorDot: 'bg-emerald-500', badge: 'Key D', badgeColor: 'bg-emerald-50 text-emerald-700' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={qFormData.questionText}
                  onChange={(e) => setQFormData({ ...qFormData, questionText: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi đề thi..."
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Phương án A"
                  value={qFormData.optionA}
                  onChange={(e) => setQFormData({ ...qFormData, optionA: e.target.value })}
                  className="p-2 rounded-lg border border-line text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Phương án B"
                  value={qFormData.optionB}
                  onChange={(e) => setQFormData({ ...qFormData, optionB: e.target.value })}
                  className="p-2 rounded-lg border border-line text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Phương án C"
                  value={qFormData.optionC}
                  onChange={(e) => setQFormData({ ...qFormData, optionC: e.target.value })}
                  className="p-2 rounded-lg border border-line text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Phương án D"
                  value={qFormData.optionD}
                  onChange={(e) => setQFormData({ ...qFormData, optionD: e.target.value })}
                  className="p-2 rounded-lg border border-line text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giải thích ngữ pháp chi tiết
                </label>
                <textarea
                  rows={2}
                  value={qFormData.explanation}
                  onChange={(e) => setQFormData({ ...qFormData, explanation: e.target.value })}
                  placeholder="Giải thích lý do đúng/sai cho học viên xem lại..."
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Đang lưu...' : 'Lưu Câu Hỏi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

