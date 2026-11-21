'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import CustomSelect from '@/components/ui/custom-select';
import { toast } from '@/components/ui/toast';
import { quizzesService, QuizQuestion as RemoteQuizQuestion } from '@/services/quizzes.service';
import { coursesService, Course } from '@/services/courses.service';
import { extractErrorMessage } from '@/lib/api-error';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Search,
  X,
  RefreshCw,
  Check,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Compass,
  Users,
  Target,
  GraduationCap,
  Layers,
  PenTool,
  ListChecks,
} from 'lucide-react';

interface PersonalDevTestItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  quizType?: string;
  testType?: string;
  courseId?: string;
  course?: { id: string; title: string };
  timeLimitMinutes?: number;
  passScore?: number;
  passage?: string;
  questionsCount?: number;
  questions?: RemoteQuizQuestion[];
}

function PersonalDevAssessmentsContent() {
  const [tests, setTests] = useState<PersonalDevTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PERSONAL_DEV' | 'SOFT_SKILLS' | 'LIFE_SKILLS' | 'PEDAGOGY'>('ALL');
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [expandedTestIds, setExpandedTestIds] = useState<Record<string, boolean>>({});

  // Modal 1: Create / Edit Test
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testForm, setTestForm] = useState({
    title: '',
    category: 'PERSONAL_DEV' as 'PERSONAL_DEV' | 'SOFT_SKILLS' | 'LIFE_SKILLS' | 'PEDAGOGY',
    courseId: '',
    timeLimitMinutes: 30,
    passScore: 80,
    scenarioContext: '',
    description: '',
  });

  // Modal 2: Add Question to Test (Only 2 types: SINGLE_CHOICE or SHORT_ANSWER)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [targetQuizId, setTargetQuizId] = useState('');
  const [targetQuizTitle, setTargetQuizTitle] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    type: 'SINGLE_CHOICE' as 'SINGLE_CHOICE' | 'SHORT_ANSWER',
    questionText: '',
    // For SINGLE_CHOICE:
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctOpt: 'A' as 'A' | 'B' | 'C' | 'D',
    // For SHORT_ANSWER:
    wordLimitGuide: '150 - 250 từ',
    // Shared:
    explanation: '', // Rationale for MCQ or Rubric/Hướng dẫn chấm for Paragraph
  });

  // Fetch Tests
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await quizzesService.getAllQuizzes({ limit: 100 });
      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && typeof res === 'object' && 'items' in (res as any)) {
        rawList = (res as any).items || [];
      }

      const pdevFiltered = rawList.filter((t: any) =>
        ['PERSONAL_DEV', 'SOFT_SKILLS', 'LIFE_SKILLS', 'PEDAGOGY'].includes(t.category)
      );

      const mapped: PersonalDevTestItem[] = pdevFiltered.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category || 'PERSONAL_DEV',
        quizType: item.quizType,
        testType: item.testType,
        courseId: item.courseId,
        course: item.course,
        timeLimitMinutes: item.timeLimitMinutes || 30,
        passScore: item.passScore || 80,
        passage: item.passage,
        questionsCount:
          typeof item._count?.questions === 'number'
            ? item._count.questions
            : Array.isArray(item.questions)
            ? item.questions.length
            : 0,
        questions: item.questions,
      }));

      setTests(mapped);
    } catch (err) {
      console.error('Error fetching personal dev tests:', err);
      toast.error('Lỗi nạp danh sách đề thi phát triển cá nhân!');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Courses
  useEffect(() => {
    fetchTests();
    coursesService.getCourses().then((data: any) => {
      if (Array.isArray(data)) setCoursesList(data);
    }).catch(() => {});
  }, [fetchTests]);

  // Filter tests
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchSearch =
        !search.trim() ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        (t.passage && t.passage.toLowerCase().includes(search.toLowerCase()));

      const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [tests, search, categoryFilter]);

  // Open Create Test Modal
  const handleOpenCreateTest = () => {
    setEditingTestId(null);
    setTestForm({
      title: '',
      category: 'PERSONAL_DEV',
      courseId: '',
      timeLimitMinutes: 30,
      passScore: 80,
      scenarioContext: '',
      description: '',
    });
    setIsTestModalOpen(true);
  };

  // Open Edit Test Modal
  const handleOpenEditTest = (item: PersonalDevTestItem) => {
    setEditingTestId(item.id);
    setTestForm({
      title: item.title,
      category: (item.category as any) || 'PERSONAL_DEV',
      courseId: item.courseId || '',
      timeLimitMinutes: item.timeLimitMinutes || 30,
      passScore: item.passScore || 80,
      scenarioContext: item.passage || '',
      description: item.description || '',
    });
    setIsTestModalOpen(true);
  };

  // Save Test
  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài thi phát triển cá nhân!');
      return;
    }

    setSubmittingTest(true);
    try {
      const payload = {
        title: testForm.title.trim(),
        description: testForm.description.trim() || undefined,
        category: testForm.category,
        quizType: 'SITUATION_QUIZ',
        testType: 'SITUATION_QUIZ',
        courseId: testForm.courseId || undefined,
        timeLimitMinutes: Number(testForm.timeLimitMinutes) || 30,
        passScore: Number(testForm.passScore) || 80,
        passage: testForm.scenarioContext.trim() || undefined,
      };

      if (editingTestId) {
        await quizzesService.updateQuiz(editingTestId, payload);
        toast.success(`✓ Đã cập nhật đề thi "${testForm.title}" thành công!`);
      } else {
        await quizzesService.createQuiz(payload);
        toast.success('✓ Đã tạo đề thi đánh giá phát triển cá nhân mới!');
      }
      setIsTestModalOpen(false);
      await fetchTests();
    } catch (err) {
      toast.error(`❌ Lỗi lưu đề: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmittingTest(false);
    }
  };

  // Delete Test
  const handleDeleteTest = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đề thi phát triển cá nhân "${title}"?`)) return;
    try {
      await quizzesService.deleteQuiz(id);
      toast.success('✓ Đã xóa đề thi thành công!');
      await fetchTests();
    } catch (err) {
      toast.error(`❌ Lỗi xóa đề: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // Open Add Question Modal
  const handleOpenAddQuestion = (test: PersonalDevTestItem) => {
    setTargetQuizId(test.id);
    setTargetQuizTitle(test.title);
    setQuestionForm({
      type: 'SINGLE_CHOICE',
      questionText: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctOpt: 'A',
      wordLimitGuide: '150 - 250 từ',
      explanation: '',
    });
    setIsQuestionModalOpen(true);
  };

  // Save Question (Supporting 2 Types: SINGLE_CHOICE and SHORT_ANSWER)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi / đề bài!');
      return;
    }

    setSubmittingQuestion(true);
    try {
      if (questionForm.type === 'SINGLE_CHOICE') {
        if (!questionForm.optA.trim() || !questionForm.optB.trim()) {
          toast.error('Vui lòng nhập tối thiểu 2 phương án lựa chọn (A và B)!');
          setSubmittingQuestion(false);
          return;
        }

        const options = [
          { content: questionForm.optA.trim(), isCorrect: questionForm.correctOpt === 'A' },
          { content: questionForm.optB.trim(), isCorrect: questionForm.correctOpt === 'B' },
        ];
        if (questionForm.optC.trim()) {
          options.push({ content: questionForm.optC.trim(), isCorrect: questionForm.correctOpt === 'C' });
        }
        if (questionForm.optD.trim()) {
          options.push({ content: questionForm.optD.trim(), isCorrect: questionForm.correctOpt === 'D' });
        }

        await quizzesService.addQuestion(targetQuizId, {
          content: questionForm.questionText.trim(),
          type: 'SINGLE_CHOICE',
          explanation: questionForm.explanation.trim() || undefined,
          options,
        });

        toast.success('✓ Đã thêm câu hỏi trắc nghiệm chọn đáp án vào đề thi!');
      } else {
        // SHORT_ANSWER: Viết đoạn văn
        await quizzesService.addQuestion(targetQuizId, {
          content: questionForm.questionText.trim(),
          type: 'SHORT_ANSWER',
          groupPrompt: questionForm.wordLimitGuide.trim() || 'Viết đoạn văn phân tích',
          explanation: questionForm.explanation.trim() || undefined,
          options: [],
        });

        toast.success('✓ Đã thêm câu hỏi viết đoạn văn (tự luận) vào đề thi!');
      }

      setIsQuestionModalOpen(false);
      await fetchTests();
      setExpandedTestIds((prev) => ({ ...prev, [targetQuizId]: true }));
    } catch (err) {
      toast.error(`❌ Lỗi thêm câu hỏi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await quizzesService.deleteQuestion(questionId);
      toast.success('✓ Đã xóa câu hỏi thành công!');
      await fetchTests();
    } catch (err) {
      toast.error(`❌ Lỗi xóa câu hỏi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // Toggle Test Questions Expand
  const toggleExpandTest = async (testId: string) => {
    const nextState = !expandedTestIds[testId];
    setExpandedTestIds((prev) => ({ ...prev, [testId]: nextState }));

    if (nextState) {
      try {
        const fullQuiz = await quizzesService.getQuizById(testId);
        if (fullQuiz && Array.isArray(fullQuiz.questions)) {
          setTests((prev) =>
            prev.map((t) => (t.id === testId ? { ...t, questions: fullQuiz.questions } : t))
          );
        }
      } catch (err) {
        console.error('Error expanding quiz:', err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* 1. PAGE HEADER */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phân Hệ Khảo Thí & Đánh Giá Phát Triển Cá Nhân</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              Khảo Thí Phát Triển Cá Nhân
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hệ thống khảo thí đánh giá năng lực, kỹ năng mềm, kỹ năng sống, tư duy lãnh đạo và tình huống thực tế chuyên sâu. Hỗ trợ 2 dạng câu hỏi chuẩn hóa: <strong>Chọn đáp án (Trắc nghiệm)</strong> và <strong>Viết đoạn văn (Tự luận / Tình huống mở)</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateTest}
            className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tạo Đề Đánh Giá Mới</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Tổng số đề thi</span>
            <div className="text-xl font-black text-white">{tests.length} Đề</div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-indigo-300 uppercase tracking-wider">Lãnh đạo & Bản thân</span>
            <div className="text-xl font-black text-indigo-400">
              {tests.filter((t) => t.category === 'PERSONAL_DEV').length} Đề
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-sky-300 uppercase tracking-wider">Kỹ năng mềm</span>
            <div className="text-xl font-black text-sky-400">
              {tests.filter((t) => t.category === 'SOFT_SKILLS').length} Đề
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-amber-300 uppercase tracking-wider">Kỹ năng sống & Khác</span>
            <div className="text-xl font-black text-amber-400">
              {tests.filter((t) => t.category === 'LIFE_SKILLS' || t.category === 'PEDAGOGY').length} Đề
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl border border-line p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'ALL', label: 'Tất Cả' },
            { key: 'PERSONAL_DEV', label: '🌟 Phát triển bản thân & Lãnh đạo' },
            { key: 'SOFT_SKILLS', label: '🤝 Kỹ năng mềm' },
            { key: 'LIFE_SKILLS', label: '🧭 Kỹ năng sống' },
            { key: 'PEDAGOGY', label: '🎓 Nghiệp vụ sư phạm' },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setCategoryFilter(pill.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === pill.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, bối cảnh tình huống..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* 3. TEST LIST */}
      {loading ? (
        <div className="py-24 text-center text-muted bg-white rounded-3xl border border-line">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="text-xs font-bold text-slate-500">Đang tải danh sách khảo thí phát triển cá nhân...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-line p-12 text-center space-y-3">
          <Target className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có bài thi phát triển cá nhân nào</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Nhấn vào nút &quot;+ Tạo Đề Đánh Giá Mới&quot; ở trên để thiết lập bài khảo thí đánh giá năng lực hoặc tình huống thực tế cho học viên.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateTest}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Đề Đầu Tiên</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test) => {
            const isExpanded = !!expandedTestIds[test.id];
            const questions = test.questions || [];

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden hover:border-indigo-300 transition-all"
              >
                {/* Test Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          test.category === 'PERSONAL_DEV'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : test.category === 'SOFT_SKILLS'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : test.category === 'LIFE_SKILLS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {test.category === 'PERSONAL_DEV'
                          ? '🌟 Phát triển Bản thân & Lãnh đạo'
                          : test.category === 'SOFT_SKILLS'
                          ? '🤝 Kỹ năng mềm'
                          : test.category === 'LIFE_SKILLS'
                          ? '🧭 Kỹ năng sống'
                          : '🎓 Sư phạm & Giảng dạy'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        ⏱️ {test.timeLimitMinutes || 30} phút
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Sàn đạt &ge; {test.passScore || 80}%
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {test.questionsCount || questions.length} Câu hỏi
                      </span>
                      {test.course && (
                        <span className="text-[11px] font-bold text-primary truncate max-w-xs">
                          Khóa: {test.course.title}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 leading-snug">{test.title}</h3>

                    {test.description && (
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">{test.description}</p>
                    )}

                    {test.passage && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-line text-xs text-slate-700 line-clamp-3">
                        <strong className="text-slate-900 block mb-0.5 font-bold">📜 Bối cảnh tình huống thực tế:</strong>
                        {test.passage}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenAddQuestion(test)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Câu Hỏi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpandTest(test.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem câu hỏi ({test.questionsCount || questions.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditTest(test)}
                      className="p-2 text-slate-400 hover:text-primary rounded-xl hover:bg-slate-100 transition cursor-pointer"
                      title="Chỉnh sửa đề"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTest(test.id, test.title)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                      title="Xóa đề"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Questions List */}
                {isExpanded && (
                  <div className="border-t border-line bg-slate-50/70 p-5 space-y-3.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Danh sách câu hỏi đánh giá ({questions.length})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleOpenAddQuestion(test)}
                        className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm câu hỏi vào đề này
                      </button>
                    </div>

                    {questions.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted border border-dashed border-line rounded-xl bg-white">
                        Đề thi chưa có câu hỏi nào. Nhấn &quot;+ Thêm Câu Hỏi&quot; ở trên để tạo câu hỏi trắc nghiệm chọn đáp án hoặc viết đoạn văn tự luận.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {questions.map((q: any, qIdx: number) => {
                          const isEssay = q.type === 'SHORT_ANSWER';
                          const options = (q.options as { id?: string; content: string; isCorrect?: boolean }[]) || [];

                          return (
                            <div
                              key={q.id || qIdx}
                              className="p-4 rounded-xl bg-white border border-line shadow-2xs space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 flex-1">
                                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                                    {qIdx + 1}
                                  </span>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      {isEssay ? (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                          <PenTool className="w-3 h-3" />
                                          <span>Viết đoạn văn (Tự luận)</span>
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                          <ListChecks className="w-3 h-3" />
                                          <span>Chọn đáp án (Trắc nghiệm)</span>
                                        </span>
                                      )}
                                      {q.groupPrompt && (
                                        <span className="text-[10.5px] font-semibold text-slate-500">
                                          📝 {q.groupPrompt}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 leading-relaxed">
                                      {q.content || q.questionText}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                  title="Xóa câu hỏi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Question Body Depending on Type */}
                              {isEssay ? (
                                <div className="p-3 rounded-lg bg-purple-50/40 border border-purple-100 text-xs text-slate-700 space-y-1">
                                  <span className="text-[10.5px] font-bold text-purple-800 uppercase tracking-wider block">
                                    ✍️ Hướng dẫn bài làm của học viên:
                                  </span>
                                  <p className="text-slate-600 italic">
                                    Học viên sẽ nhập trực tiếp bài viết đoạn văn vào khung soạn thảo văn bản khi làm bài.
                                  </p>
                                </div>
                              ) : (
                                /* 4 MCQ Options */
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {options.map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                        opt.isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                          : 'bg-slate-50 border-line text-slate-700'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded-md text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                                          opt.isCorrect
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span className="truncate flex-1">{opt.content}</span>
                                      {opt.isCorrect && (
                                        <span className="text-[10px] text-emerald-700 font-black shrink-0">
                                          ✓ Đáp án tối ưu
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Explanation / Rubric */}
                              {q.explanation && (
                                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11.5px] text-amber-900">
                                  <strong>
                                    {isEssay ? '💡 Hướng dẫn chấm & Tiêu chí đánh giá:' : '💡 Căn cứ & Phân tích giải pháp:'}
                                  </strong>{' '}
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT PERSONAL DEV TEST                                  */}
      {/* ========================================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 my-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingTestId ? 'Chỉnh Sửa Đề Thi Phát Triển Cá Nhân' : 'Tạo Đề Đánh Giá Phát Triển Cá Nhân Mới'}
                  </h3>
                  <p className="text-[11px] text-muted">
                    Khảo thí đánh giá năng lực, kỹ năng mềm, kỹ năng sống & lãnh đạo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề bài thi / bài đánh giá <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  placeholder="Ví dụ: Đánh Giá Năng Lực Đàm Phán & Giải Quyết Xung Đột Nhóm Đa Văn Hóa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Phân hệ năng lực *"
                  value={testForm.category}
                  onChange={(val) => setTestForm({ ...testForm, category: val as any })}
                  options={[
                    { value: 'PERSONAL_DEV', label: '🌟 Phát triển Bản thân & Lãnh đạo' },
                    { value: 'SOFT_SKILLS', label: '🤝 Kỹ năng Mềm (Đàm phán, Giao tiếp)' },
                    { value: 'LIFE_SKILLS', label: '🧭 Kỹ năng Sống & Xã hội' },
                    { value: 'PEDAGOGY', label: '🎓 Nghiệp vụ Sư phạm & Giảng dạy' },
                  ]}
                />

                <CustomSelect
                  label="Khóa học áp dụng (Tùy chọn)"
                  value={testForm.courseId}
                  onChange={(val) => setTestForm({ ...testForm, courseId: val })}
                  options={[
                    { value: '', label: '🌐 Không giới hạn (Đề độc lập)' },
                    ...coursesList.map((c) => ({ value: c.id, label: c.title })),
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời lượng làm bài (Phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    required
                    value={testForm.timeLimitMinutes}
                    onChange={(e) => setTestForm({ ...testForm, timeLimitMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sàn điểm đạt (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={testForm.passScore}
                    onChange={(e) => setTestForm({ ...testForm, passScore: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả mục tiêu đánh giá
                </label>
                <textarea
                  rows={2}
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Mô tả các năng lực, kỹ năng trọng tâm cần đo lường trong bài thi này..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bối cảnh tình huống thực tế (Scenario Case Study)
                </label>
                <textarea
                  rows={4}
                  value={testForm.scenarioContext}
                  onChange={(e) => setTestForm({ ...testForm, scenarioContext: e.target.value })}
                  placeholder="Mô tả chi tiết bối cảnh môi trường công sở, tình huống đời sống hoặc xung đột phát sinh..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-indigo-600"
                />
                <span className="text-[10.5px] text-muted block mt-1">
                  * Bối cảnh này sẽ hiển thị ở đầu bài thi để học viên đọc và phân tích trước khi trả lời câu hỏi.
                </span>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingTest}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2"
                >
                  {submittingTest && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Check className="w-4 h-4" />
                  <span>{editingTestId ? 'Lưu Thay Đổi' : 'Tạo Đề Thi Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD QUESTION (CHỌN ĐÁP ÁN HOẶC VIẾT ĐOẠN VĂN)                   */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 my-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Thêm Câu Hỏi Đánh Giá Năng Lực</h3>
                <p className="text-[11px] text-muted truncate max-w-sm">Đề thi: {targetQuizTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Type Switcher: 2 LOẠI DUY NHẤT */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuestionForm({ ...questionForm, type: 'SINGLE_CHOICE' })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  questionForm.type === 'SINGLE_CHOICE'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                <span>1. Chọn Đáp Án (Trắc Nghiệm)</span>
              </button>
              <button
                type="button"
                onClick={() => setQuestionForm({ ...questionForm, type: 'SHORT_ANSWER' })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  questionForm.type === 'SHORT_ANSWER'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>2. Viết Đoạn Văn (Tự Luận)</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {questionForm.type === 'SINGLE_CHOICE'
                    ? 'Câu hỏi / Yêu cầu xử lý tình huống'
                    : 'Đề bài / Yêu cầu viết đoạn văn phân tích'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder={
                    questionForm.type === 'SINGLE_CHOICE'
                      ? 'Ví dụ: Trong tình huống này, giải pháp đàm phán tối ưu nhất mà người lãnh đạo nên thực hiện là gì?'
                      : 'Ví dụ: Hãy viết một đoạn văn (khoảng 150 - 250 từ) phân tích nguyên nhân dẫn đến xung đột trên và đề xuất 3 bước xử lý cụ thể...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* DẠNG 1: CHỌN ĐÁP ÁN (4 Options A, B, C, D) */}
              {questionForm.type === 'SINGLE_CHOICE' ? (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Các phương án giải quyết (A, B, C, D) & Phương án tối ưu nhất:
                  </label>

                  {[
                    { key: 'A', field: 'optA', label: 'Phương án A' },
                    { key: 'B', field: 'optB', label: 'Phương án B' },
                    { key: 'C', field: 'optC', label: 'Phương án C' },
                    { key: 'D', field: 'optD', label: 'Phương án D' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="correctPdevOpt"
                          checked={questionForm.correctOpt === item.key}
                          onChange={() => setQuestionForm({ ...questionForm, correctOpt: item.key as any })}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center">
                          {item.key}
                        </span>
                      </label>
                      <input
                        type="text"
                        required={item.key === 'A' || item.key === 'B'}
                        value={(questionForm as any)[item.field]}
                        onChange={(e) => setQuestionForm({ ...questionForm, [item.field]: e.target.value })}
                        placeholder={`Nhập nội dung ${item.label}...`}
                        className="flex-1 px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  ))}
                  <span className="text-[10.5px] text-muted block italic">
                    * Tích chọn nút tròn radio ở phương án đúng/tối ưu nhất.
                  </span>
                </div>
              ) : (
                /* DẠNG 2: VIẾT ĐOẠN VĂN */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gợi ý số từ / Giới hạn độ dài đoạn văn
                    </label>
                    <input
                      type="text"
                      value={questionForm.wordLimitGuide}
                      onChange={(e) => setQuestionForm({ ...questionForm, wordLimitGuide: e.target.value })}
                      placeholder="Ví dụ: 150 - 250 từ hoặc Tối thiểu 100 từ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-purple-600"
                    />
                    <span className="text-[10.5px] text-muted block mt-1">
                      * Chỉ dẫn này sẽ hiển thị bên cạnh câu hỏi để học viên căn chỉnh dung lượng bài viết.
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900">
                    <span className="font-bold block mb-0.5">ℹ️ Cơ chế trả lời của học viên:</span>
                    Học viên sẽ có khung soạn thảo văn bản trực tiếp để viết bài tự luận, đếm số từ thời gian thực và nộp bài để Admin/Giảng viên chấm điểm.
                  </div>
                </div>
              )}

              {/* Rationale / Rubric */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {questionForm.type === 'SINGLE_CHOICE'
                    ? 'Căn cứ lý luận & Phân tích giải pháp tối ưu'
                    : 'Hướng dẫn chấm & Tiêu chí đánh giá (Rubric)'}
                </label>
                <textarea
                  rows={2}
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder={
                    questionForm.type === 'SINGLE_CHOICE'
                      ? 'Giải thích vì sao phương án này mang lại hiệu quả cao nhất...'
                      : 'Liệt kê các luận điểm trọng tâm, tiêu chí đạt yêu cầu để giảng viên đối chiếu khi chấm bài...'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestion}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  {submittingQuestion && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu Câu Hỏi Đánh Giá</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PersonalDevAssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-muted">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="text-xs font-bold text-slate-500">Đang nạp dữ liệu khảo thí phát triển cá nhân...</p>
        </div>
      }
    >
      <PersonalDevAssessmentsContent />
    </Suspense>
  );
}
