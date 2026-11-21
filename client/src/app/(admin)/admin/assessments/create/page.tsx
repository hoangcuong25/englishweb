'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomSelect from '@/components/ui/custom-select';
import RichTextEditor from '@/components/shared/rich-text-editor';
import { toast } from '@/components/ui/toast';
import { coursesService, Course } from '@/services/courses.service';
import { quizzesService } from '@/services/quizzes.service';
import { extractErrorMessage } from '@/lib/api-error';
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  FileEdit,
  Mic,
  Trophy,
  Sparkles,
  Zap,
  Send,
  Layers,
  Clock,
  Award,
  CheckCircle2,
  X,
  Search,
  Globe,
  Calendar,
  AlertCircle,
  Check,
  HelpCircle,
  FileText,
  Compass,
} from 'lucide-react';

// ==========================================
// SAMPLE QUESTION BANK FOR 4 SKILLS
// ==========================================
interface BankQuestion {
  id: string;
  skill: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
  type: string;
  questionText: string;
  correctAnswer: string;
  targetBand: string;
  explanation: string;
  passageSnippet?: string;
  options?: { content: string; isCorrect: boolean }[];
}

const SAMPLE_QUESTION_BANK: BankQuestion[] = [
  // READING
  {
    id: 'rd-01',
    skill: 'READING',
    type: 'TRUE_FALSE_NOT_GIVEN',
    questionText: 'According to paragraph 2, the extraction of lithium significantly depletes regional freshwater reserves.',
    correctAnswer: 'TRUE',
    targetBand: '6.5 - 7.5',
    explanation: 'Đoạn 2 nêu rõ hoạt động khai thác tiêu thụ hơn 500,000 gallon nước ngọt cho mỗi tấn lithium.',
    passageSnippet: 'Passage 1: Lithium Mining Dynamics',
  },
  {
    id: 'rd-02',
    skill: 'READING',
    type: 'MATCHING_HEADINGS',
    questionText: 'Choose the correct heading for Section B describing aerodynamic ventilation in high-rises.',
    correctAnswer: 'iv. Harnessing natural airflows in high-rises',
    targetBand: '7.0 - 8.0',
    explanation: 'Tiêu đề iv phản ánh chính xác cấu trúc luồng gió đối lưu tự nhiên của tòa tháp.',
    passageSnippet: 'Passage 2: The Future of Eco-Architecture',
  },
  {
    id: 'rd-03',
    skill: 'READING',
    type: 'FILL_BLANK',
    questionText: 'The ancient amphitheatres in Roman Gaul were fortified with specialized ______ to repel hostile invasions.',
    correctAnswer: 'parapets',
    targetBand: '6.5+',
    explanation: 'Từ trong văn bản ở dòng 44 là "parapets" (tường bao bảo vệ).',
    passageSnippet: 'Passage 1: Roman Amphitheatres in Gaul',
  },
  {
    id: 'rd-04',
    skill: 'READING',
    type: 'SINGLE_CHOICE',
    questionText: 'What is the primary conclusion regarding artificial intelligence and economic productivity?',
    correctAnswer: 'B',
    targetBand: '7.5+',
    explanation: 'Nghiên cứu kết luận năng suất tăng trưởng theo cấp số nhân nhưng đòi hỏi tái đào tạo nhân lực.',
    passageSnippet: 'Passage 3: Macroeconomics in the Age of Automation',
  },

  // LISTENING
  {
    id: 'ls-01',
    skill: 'LISTENING',
    type: 'NOTE_COMPLETION',
    questionText: 'Library Registration Form: Major field of graduate study: ______ Economics.',
    correctAnswer: 'behavioral',
    targetBand: '6.0 - 7.0',
    explanation: 'Người nói phát âm rõ: "I am enrolled in the Behavioral Economics master programme".',
    passageSnippet: 'Section 1: Student Library Registration',
  },
  {
    id: 'ls-02',
    skill: 'LISTENING',
    type: 'SINGLE_CHOICE',
    questionText: 'Where will the campus emergency evacuation briefing be conducted?',
    correctAnswer: 'C. North Lecture Hall 3C',
    targetBand: '6.5',
    explanation: 'Phát thanh viên lưu ý: "The emergency briefing will relocate to North Lecture Hall 3C".',
    passageSnippet: 'Section 2: Campus Orientation Guide',
  },
  {
    id: 'ls-03',
    skill: 'LISTENING',
    type: 'FILL_BLANK',
    questionText: 'Marine Biology Expedition: Participants must bring waterproof ______ and digital sound meters.',
    correctAnswer: 'notebooks',
    targetBand: '5.5 - 6.5',
    explanation: 'Người hướng dẫn yêu cầu sinh viên chuẩn bị "waterproof notebooks".',
    passageSnippet: 'Section 3: Field Research Preparation',
  },
  {
    id: 'ls-04',
    skill: 'LISTENING',
    type: 'FORM_COMPLETION',
    questionText: 'Accommodation Booking: Preferred lease duration: ______ months with option to extend.',
    correctAnswer: '6',
    targetBand: '6.0',
    explanation: 'Sinh viên đề xuất hợp đồng 6 tháng trước khi quyết định gia hạn.',
    passageSnippet: 'Section 1: Rental Inquiries',
  },

  // WRITING
  {
    id: 'wr-01',
    skill: 'WRITING',
    type: 'ESSAY_TASK_1',
    questionText: 'The bar chart illustrates the percentage of renewable energy production in six European countries between 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (At least 150 words).',
    correctAnswer: 'Tiêu chí chấm: Task Achievement (25%), Coherence & Cohesion (25%), Lexical Resource (25%), Grammatical Range (25%).',
    targetBand: '6.5 - 8.5',
    explanation: 'Phân tích tổng quan xu hướng tăng trưởng của Đan Mạch và Đức, so sánh với các quốc gia còn lại.',
    passageSnippet: 'Task 1: Academic Bar Chart Comparison',
  },
  {
    id: 'wr-02',
    skill: 'WRITING',
    type: 'ESSAY_TASK_2',
    questionText: 'Some people argue that technological automation will permanently eliminate more jobs than it creates. Others believe it will generate unprecedented new career opportunities. Discuss both views and give your own opinion. (At least 250 words).',
    correctAnswer: 'Đề bài dạng Discuss Both Views & Give Opinion. Cần 2 thân bài cân bằng và 1 kết luận sắc bén.',
    targetBand: '7.0 - 9.0',
    explanation: 'Yêu cầu lập luận đa chiều về tác động của trí tuệ nhân tạo và kinh tế tri thức.',
    passageSnippet: 'Task 2: Automation & Future Workforce',
  },

  // SPEAKING
  {
    id: 'sp-01',
    skill: 'SPEAKING',
    type: 'SPEAKING_PART_1',
    questionText: 'Part 1 (Hometown & Architecture): Do you think your hometown is a suitable place for young people to pursue their careers? Why or why not?',
    correctAnswer: 'Tiêu chí: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation.',
    targetBand: '6.0 - 7.5',
    explanation: 'Phản xạ trả lời tự nhiên từ 3-4 câu, dùng từ nối học thuật và từ vựng biểu cảm.',
    passageSnippet: 'Part 1: Interview & Everyday Situations',
  },
  {
    id: 'sp-02',
    skill: 'SPEAKING',
    type: 'SPEAKING_PART_2',
    questionText: 'Part 2 (Cue Card): Describe a memorable public lecture or presentation you attended. You should say: who the speaker was, what the topic was, why you attended, and explain how it influenced your perspective.',
    correctAnswer: 'Thời lượng: 1 phút chuẩn bị dàn ý + 2 phút nói liên tục ghi âm qua mic.',
    targetBand: '6.5 - 8.5',
    explanation: 'Xây dựng câu chuyện có bố cục mở - thân - kết, phát âm rõ âm đuôi và ngữ điệu tự nhiên.',
    passageSnippet: 'Part 2: Long Turn (Cue Card Presentation)',
  },
  {
    id: 'sp-03',
    skill: 'SPEAKING',
    type: 'SPEAKING_PART_3',
    questionText: 'Part 3 (Two-way Discussion): In what ways has remote digital communication transformed international business collaboration?',
    correctAnswer: 'Đánh giá năng lực phát triển lập luận trừu tượng, tư duy phản biện và tính linh hoạt từ vựng.',
    targetBand: '7.0 - 8.5',
    explanation: 'Đào sâu vào góc nhìn kinh tế số, rào cản múi giờ và sự biến đổi văn hóa làm việc.',
    passageSnippet: 'Part 3: In-depth Abstract Discussion',
  },
];

export default function CreateExamPage() {
  const router = useRouter();

  // Selected Exam Skill
  const [selectedSkill, setSelectedSkill] = useState<'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING' | 'FULL_MOCK_TEST'>('READING');

  // Form State
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: 'IELTS Academic Reading Mock Test: Environmental Innovations',
    track: 'ENGLISH' as 'ENGLISH' | 'PERSONAL_DEV',
    category: 'IELTS',
    courseId: '',
    durationMinutes: 60,
    passScore: 75,
    description: '<p>Bài kiểm tra đánh giá năng lực thực chiến theo đúng định dạng khảo thí IELTS Quốc tế. Học viên cần hoàn thành và nộp bài trước thời hạn quy định.</p>',
    
    // Reading Passages
    passage1Title: 'Passage 1: Lithium Mining Dynamics in Modern Energy Systems',
    passage1Content: '<p>Lithium has emerged as the cornerstone element powering global electrification initiatives. However, the extraction methodology deployed across arid salars presents severe hydrological challenges...</p>',
    passage2Title: 'Passage 2: The Future of Aerodynamic High-Rise Architecture',
    passage2Content: '<p>Modern civil engineers are turning to aerodynamic sculpting to mitigate extreme vortex shedding forces on supertall skyscrapers...</p>',
    passage3Title: 'Passage 3: Macroeconomic Modeling of Post-Labor Societies',
    passage3Content: '<p>The theoretical paradigm shift from wage-labor productivity to autonomous capital generates urgent inquiries into resource distribution mechanisms...</p>',

    // Listening Sections Audio
    section1AudioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    section2AudioUrl: '',
    section3AudioUrl: '',
    section4AudioUrl: '',

    // Writing Tasks
    writingTask1Prompt: 'The bar chart below shows the renewable energy generation across six EU nations from 2015 to 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    writingTask1ImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    writingTask2Prompt: 'Some people argue that technological automation will permanently eliminate more jobs than it creates. Others believe it will generate unprecedented new career opportunities. Discuss both views and give your own opinion.',

    // Speaking Prompts
    speakingPart1Prompt: 'Let\'s talk about your hometown. Do you prefer living in a bustling city or peaceful countryside? Why?',
    speakingPart2Prompt: 'Describe a memorable public lecture or presentation you attended. You should say: who the speaker was, what the topic was, why you attended, and explain how it influenced your perspective.',
    speakingPart3Prompt: 'How has remote digital communication transformed international business collaboration in recent years?',

    // Direct Assignment Options
    assignDirectly: true,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    allowReview: true,
    sendNotification: true,
    sendEmailNotification: true,
  });

  // Active step inside page
  const [activeStep, setActiveStep] = useState<'skill_and_info' | 'context_content' | 'question_bank' | 'assignment'>('skill_and_info');

  // Question Bank Picker State
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(['rd-01', 'rd-02', 'rd-03', 'rd-04']);
  const [bankSearch, setBankSearch] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState('ALL');

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await coursesService.getCourses();
        if (Array.isArray(res)) {
          setCoursesList(res);
          if (res.length > 0 && !formData.courseId) {
            setFormData((prev) => ({ ...prev, courseId: res[0].id }));
          }
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // When skill changes, update default parameters
  const handleSelectSkill = (skill: typeof selectedSkill) => {
    setSelectedSkill(skill);
    let defaultTime = 60;
    let defaultTitle = '';
    let defaultQuestionIds: string[] = [];

    switch (skill) {
      case 'READING':
        defaultTime = 60;
        defaultTitle = 'IELTS Academic Reading Mock Test: Environmental Innovations';
        defaultQuestionIds = SAMPLE_QUESTION_BANK.filter((q) => q.skill === 'READING').map((q) => q.id);
        break;
      case 'LISTENING':
        defaultTime = 40;
        defaultTitle = 'IELTS Listening Practice Test: University Campus Orientation';
        defaultQuestionIds = SAMPLE_QUESTION_BANK.filter((q) => q.skill === 'LISTENING').map((q) => q.id);
        break;
      case 'WRITING':
        defaultTime = 60;
        defaultTitle = 'IELTS Writing Task 1 & Task 2: Energy & Automation';
        defaultQuestionIds = SAMPLE_QUESTION_BANK.filter((q) => q.skill === 'WRITING').map((q) => q.id);
        break;
      case 'SPEAKING':
        defaultTime = 15;
        defaultTitle = 'IELTS Speaking Full 3 Parts: Urbanization & Travel';
        defaultQuestionIds = SAMPLE_QUESTION_BANK.filter((q) => q.skill === 'SPEAKING').map((q) => q.id);
        break;
      case 'FULL_MOCK_TEST':
        defaultTime = 175;
        defaultTitle = 'IELTS Full Mock Test 4 Kỹ Năng: Cambridge Simulation 2026';
        defaultQuestionIds = SAMPLE_QUESTION_BANK.map((q) => q.id);
        break;
    }

    setFormData((prev) => ({
      ...prev,
      durationMinutes: defaultTime,
      title: defaultTitle,
    }));
    setSelectedQuestionIds(defaultQuestionIds);
  };

  // Auto Matrix Generator
  const handleAutoPickMatrix = () => {
    let matching = SAMPLE_QUESTION_BANK;
    if (selectedSkill !== 'FULL_MOCK_TEST') {
      matching = SAMPLE_QUESTION_BANK.filter((q) => q.skill === selectedSkill);
    }
    const ids = matching.map((q) => q.id);
    setSelectedQuestionIds(ids);
    toast.success(`⚡ Đã tự động bốc ${ids.length} câu hỏi theo chuẩn ma trận đề thi IELTS!`);
  };

  const handleToggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Submit Handler
  const handlePublishExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề đề thi!');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Quiz / Test on backend
      const payload = {
        title: formData.title.trim(),
        description: formData.description,
        category: formData.category,
        quizType: selectedSkill === 'FULL_MOCK_TEST' ? 'FULL_MOCK_TEST' : 'PRACTICE_TEST',
        testType: selectedSkill === 'FULL_MOCK_TEST' ? 'FULL_MOCK_TEST' : 'PRACTICE_TEST',
        courseId: formData.courseId || undefined,
        skill: selectedSkill === 'FULL_MOCK_TEST' ? 'READING' : selectedSkill,
        timeLimitMinutes: Number(formData.durationMinutes),
        passScore: Number(formData.passScore),
        passage:
          selectedSkill === 'READING'
            ? `${formData.passage1Title}\n${formData.passage1Content}`
            : selectedSkill === 'WRITING'
            ? `${formData.writingTask1Prompt}\n\n${formData.writingTask2Prompt}`
            : undefined,
        audioUrl: selectedSkill === 'LISTENING' ? formData.section1AudioUrl : undefined,
      };

      const res: any = await quizzesService.createQuiz(payload);
      const newQuizId = res?.id || res?.data?.id;

      // 2. Attach selected bank questions in bulk if available
      if (newQuizId && selectedQuestionIds.length > 0) {
        const questionsToAttach = SAMPLE_QUESTION_BANK
          .filter((q) => selectedQuestionIds.includes(q.id))
          .map((q, idx) => ({
            content: q.questionText,
            skill: q.skill,
            type: q.type,
            points: 1.0,
            orderIndex: idx + 1,
            explanation: q.explanation,
            options: [
              { content: q.correctAnswer, isCorrect: true },
              { content: 'Phương án đối chiếu 1', isCorrect: false },
              { content: 'Phương án đối chiếu 2', isCorrect: false },
            ],
          }));

        try {
          await quizzesService.addQuestionsBulk(newQuizId, questionsToAttach);
        } catch (bulkErr) {
          console.warn('Could not bulk attach questions:', bulkErr);
        }
      }

      toast.success(`🎉 Đã tạo đề thi "${formData.title}" thành công!`);
      if (formData.assignDirectly && newQuizId) {
        try {
          const assignRes: any = await quizzesService.assignQuiz(newQuizId, {
            courseId: formData.courseId || undefined,
            dueDate: formData.dueDate,
            sendNotification: formData.sendNotification,
            sendEmail: formData.sendEmailNotification,
          });
          const notiMsg = assignRes?.emailSentCount > 0
            ? `Đã gửi thông báo đến ${assignRes?.notifiedCount || 0} học viên & ${assignRes?.emailSentCount} email thành công!`
            : `Đã tự động gửi thông báo chuông đến ${assignRes?.notifiedCount || 0} học viên trong lớp.`;
          toast.success(notiMsg);
        } catch (assignErr) {
          console.warn('Could not auto assign test:', assignErr);
          toast.info('Đã lưu đề thi. Bạn có thể bấm giao đề bất kỳ lúc nào tại danh sách đợt thi.');
        }
      }

      // Navigate back to assessment hub
      router.push('/admin/assessments?tab=mocktest');
    } catch (err: unknown) {
      toast.error(`Lỗi khi tạo đề thi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* ========================================================================= */}
      {/* TOP STICKY HEADER & BREADCRUMB                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/assessments?tab=mocktest"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay Lại Danh Sách Đề</span>
            </Link>
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10.5px] font-black uppercase tracking-wider">
                  IELTS Exam Studio
                </span>
                <span className="text-xs text-slate-400 font-medium hidden md:inline">
                  Teacher Dong Academy
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                Tạo Đề Thi IELTS Chuyên Sâu & Bốc Câu Hỏi Từ Ngân Hàng
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleAutoPickMatrix}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Tự động bốc đề theo chuẩn ma trận đề thi"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bốc Đề Tự Động</span>
            </button>
            <button
              onClick={handlePublishExam}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-[#154E8A] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Đang tạo đề...' : 'Xuất Bản & Giao Đề'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER                                                            */}
      {/* ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Step Indicator Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'skill_and_info', label: '1. Chọn Kỹ Năng & Cấu Hình', icon: Globe },
            { id: 'context_content', label: '2. Học Liệu (Passage / Audio)', icon: FileText },
            { id: 'question_bank', label: `3. Ngân Hàng Đề (${selectedQuestionIds.length} câu)`, icon: Layers },
            { id: 'assignment', label: '4. Giao Bài & Hạn Nộp', icon: Send },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStep(st.id as any)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeStep === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <st.icon className="w-4 h-4 shrink-0" />
              <span>{st.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: CHỌN KỸ NĂNG VÀ THÔNG TIN ĐỀ                                      */}
        {/* ========================================================================= */}
        {activeStep === 'skill_and_info' && (
          <div className="space-y-6">
            {/* 4 Skills Selector Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Chọn Kỹ Năng Khảo Thí Chuẩn IELTS
                  </h2>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ đầy đủ 4 kỹ năng độc lập hoặc đề thi thử hoàn chỉnh 4 kỹ năng.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                  Đang chọn: <strong>{selectedSkill}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. READING */}
                <div
                  onClick={() => handleSelectSkill('READING')}
                  className={`p-4 rounded-3xl border-2 transition cursor-pointer space-y-2.5 ${
                    selectedSkill === 'READING'
                      ? 'bg-sky-50/80 border-primary shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-primary flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">IELTS Reading</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Đọc hiểu 3 Passage, 40 câu trắc nghiệm & điền từ, 60 phút.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    Tự động chấm /40
                  </span>
                </div>

                {/* 2. LISTENING */}
                <div
                  onClick={() => handleSelectSkill('LISTENING')}
                  className={`p-4 rounded-3xl border-2 transition cursor-pointer space-y-2.5 ${
                    selectedSkill === 'LISTENING'
                      ? 'bg-amber-50/80 border-amber-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">IELTS Listening</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Nghe hiểu 4 Section kèm Audio MP3, 40 câu hỏi, 30-40 phút.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Tự động chấm /40
                  </span>
                </div>

                {/* 3. WRITING */}
                <div
                  onClick={() => handleSelectSkill('WRITING')}
                  className={`p-4 rounded-3xl border-2 transition cursor-pointer space-y-2.5 ${
                    selectedSkill === 'WRITING'
                      ? 'bg-purple-50/80 border-purple-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">IELTS Writing</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Task 1 (Biểu đồ 150 từ) + Task 2 (Nghị luận 250 từ), 60 phút.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                    AI gợi ý + Thầy duyệt
                  </span>
                </div>

                {/* 4. SPEAKING */}
                <div
                  onClick={() => handleSelectSkill('SPEAKING')}
                  className={`p-4 rounded-3xl border-2 transition cursor-pointer space-y-2.5 ${
                    selectedSkill === 'SPEAKING'
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">IELTS Speaking</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Ghi âm trực tiếp 3 Part: Q&A, Cue Card (2m), Thảo luận (5m).
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Thầy nghe & chấm 4 tiêu chí
                  </span>
                </div>

                {/* 5. FULL MOCK TEST */}
                <div
                  onClick={() => handleSelectSkill('FULL_MOCK_TEST')}
                  className={`p-4 rounded-3xl border-2 transition cursor-pointer space-y-2.5 ${
                    selectedSkill === 'FULL_MOCK_TEST'
                      ? 'bg-gradient-to-br from-indigo-50 to-sky-50 border-indigo-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Full Mock Test</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Đề thi thử hoàn chỉnh 4 kỹ năng mô phỏng thi máy tính IELTS.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    Tổng điểm Overall Band
                  </span>
                </div>
              </div>
            </div>

            {/* General Info Form Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Cấu Hình & Thông Tin Bài Thi
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập thông tin tiêu đề, thời lượng làm bài và phân bổ khóa học áp dụng.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề bài thi / Đề kiểm tra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ví dụ: Cambridge IELTS 19 - Academic Reading Practice Test 1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Khóa học áp dụng *"
                    value={formData.courseId}
                    onChange={(val) => setFormData({ ...formData, courseId: val })}
                    options={[
                      { value: '', label: '-- Toàn bộ học viên phân hệ IELTS --' },
                      ...coursesList.map((c) => ({
                        value: c.id,
                        label: c.title,
                      })),
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thời gian thi (Phút) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="240"
                        required
                        value={formData.durationMinutes}
                        onChange={(e) =>
                          setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sàn điểm đạt (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        required
                        value={formData.passScore}
                        onChange={(e) =>
                          setFormData({ ...formData, passScore: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  label="Mô tả mục tiêu bài kiểm tra & hướng dẫn làm bài"
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  placeholder="Ghi rõ lưu ý thời gian làm bài, tiêu chí hoàn thành..."
                  minHeight="min-h-[120px]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep('context_content')}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-black text-xs hover:bg-[#154E8A] transition cursor-pointer flex items-center gap-2"
                >
                  <span>Tiếp tục: Nhập Học Liệu ({selectedSkill})</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: NHẬP HỌC LIỆU NGỮ CẢNH THEO KỸ NĂNG (PASSAGE / AUDIO / IMAGE)     */}
        {/* ========================================================================= */}
        {activeStep === 'context_content' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Học Liệu & Ngữ Cảnh Đề Thi: {selectedSkill}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cung cấp bài đọc, file audio hoặc hình ảnh biểu đồ tương ứng với bài thi.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800">
                  {selectedSkill}
                </span>
              </div>

              {/* Conditional Editors per Skill */}
              {selectedSkill === 'READING' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
                    <span className="font-black">📘 Cấu trúc IELTS Academic Reading chuẩn:</span>
                    <p>Gồm 3 Passage phân cấp từ dễ đến khó (Passage 1: 13 câu; Passage 2: 13 câu; Passage 3: 14 câu = 40 câu tổng cộng).</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Đoạn văn đọc hiểu Passage 1:
                    </label>
                    <input
                      type="text"
                      value={formData.passage1Title}
                      onChange={(e) => setFormData({ ...formData, passage1Title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      placeholder="Tiêu đề bài đọc 1..."
                    />
                    <RichTextEditor
                      label="Nội dung bài đọc Passage 1"
                      value={formData.passage1Content}
                      onChange={(val) => setFormData({ ...formData, passage1Content: val })}
                      minHeight="min-h-[160px]"
                    />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      Đoạn văn đọc hiểu Passage 2:
                    </label>
                    <input
                      type="text"
                      value={formData.passage2Title}
                      onChange={(e) => setFormData({ ...formData, passage2Title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      placeholder="Tiêu đề bài đọc 2..."
                    />
                    <RichTextEditor
                      label="Nội dung bài đọc Passage 2"
                      value={formData.passage2Content}
                      onChange={(val) => setFormData({ ...formData, passage2Content: val })}
                      minHeight="min-h-[160px]"
                    />
                  </div>
                </div>
              )}

              {selectedSkill === 'LISTENING' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-black">🎧 Cấu trúc IELTS Listening chuẩn:</span>
                    <p>Gồm 4 Section audio hội thoại & độc thoại học thuật. Học viên nghe và điền từ / trắc nghiệm trực tiếp.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL tệp Audio Listening (Section 1 - 4): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.section1AudioUrl}
                      onChange={(e) => setFormData({ ...formData, section1AudioUrl: e.target.value })}
                      placeholder="https://.../cambridge-listening-test-1.mp3"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hỗ trợ link MP3/WAV trực tiếp từ Cloudinary, Google Cloud Storage hoặc S3.
                    </p>
                  </div>
                </div>
              )}

              {selectedSkill === 'WRITING' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                    <span className="font-black">✍️ Cấu trúc IELTS Writing chuẩn:</span>
                    <p>Task 1 (Báo cáo biểu đồ tối thiểu 150 từ - 20 phút) + Task 2 (Bài luận tối thiểu 250 từ - 40 phút).</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Task 1: Đề bài & URL Hình Ảnh Biểu Đồ
                    </label>
                    <input
                      type="url"
                      value={formData.writingTask1ImageUrl}
                      onChange={(e) => setFormData({ ...formData, writingTask1ImageUrl: e.target.value })}
                      placeholder="URL ảnh biểu đồ Task 1 (Bar Chart / Line Graph / Map / Process)..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={formData.writingTask1Prompt}
                      onChange={(e) => setFormData({ ...formData, writingTask1Prompt: e.target.value })}
                      placeholder="Nhập yêu cầu đề bài Task 1..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      Task 2: Đề Bài Luận Nghị Luận (Essay Prompt)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.writingTask2Prompt}
                      onChange={(e) => setFormData({ ...formData, writingTask2Prompt: e.target.value })}
                      placeholder="Nhập yêu cầu đề bài Task 2..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              )}

              {selectedSkill === 'SPEAKING' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-black">🎙️ Cấu trúc IELTS Speaking chuẩn:</span>
                    <p>Part 1 (Phỏng vấn cá nhân 4-5m) + Part 2 (Thuyết trình Cue Card 3-4m) + Part 3 (Thảo luận 4-5m). Học viên bấm ghi âm qua mic trên web.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800">Part 1 (Introduction & Interview)</label>
                    <textarea
                      rows={2}
                      value={formData.speakingPart1Prompt}
                      onChange={(e) => setFormData({ ...formData, speakingPart1Prompt: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">Part 2 (Cue Card & 1-Minute Prep)</label>
                    <textarea
                      rows={3}
                      value={formData.speakingPart2Prompt}
                      onChange={(e) => setFormData({ ...formData, speakingPart2Prompt: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">Part 3 (Two-Way Discussion)</label>
                    <textarea
                      rows={2}
                      value={formData.speakingPart3Prompt}
                      onChange={(e) => setFormData({ ...formData, speakingPart3Prompt: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedSkill === 'FULL_MOCK_TEST' && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-2">
                  <span className="font-black">🏆 Đề thi thử hoàn chỉnh 4 kỹ năng:</span>
                  <p>Hệ thống tự động liên kết học liệu 3 Passage Reading, 4 Section Listening, 2 Task Writing và 3 Part Speaking vào bài thi tổng hợp.</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep('skill_and_info')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Quay lại bước 1
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('question_bank')}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-black text-xs hover:bg-[#154E8A] transition cursor-pointer flex items-center gap-2"
                >
                  <span>Tiếp tục: Bốc Câu Hỏi Ngân Hàng ({selectedQuestionIds.length} câu)</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BỐC CÂU HỎI TỪ NGÂN HÀNG ĐỀ (QUESTION BANK SELECTOR)              */}
        {/* ========================================================================= */}
        {activeStep === 'question_bank' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Ngân Hàng Câu Hỏi: Bốc Câu Cho Đề {selectedSkill}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chọn câu hỏi thủ công hoặc sử dụng thuật toán bốc tự động theo ma trận đề thi IELTS.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoPickMatrix}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Tự Động Bốc Đề Chuẩn IELTS</span>
                </button>
              </div>

              {/* Filters Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm câu hỏi, dạng bài..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs font-black text-slate-800">
                    Đã chọn: <span className="text-primary">{selectedQuestionIds.length}</span> câu hỏi
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = SAMPLE_QUESTION_BANK.filter(
                        (q) => selectedSkill === 'FULL_MOCK_TEST' || q.skill === selectedSkill,
                      ).map((q) => q.id);
                      setSelectedQuestionIds(allIds);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionIds([])}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Bank Questions List */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {SAMPLE_QUESTION_BANK.filter(
                  (q) => selectedSkill === 'FULL_MOCK_TEST' || q.skill === selectedSkill,
                )
                  .filter(
                    (q) =>
                      bankSearch === '' ||
                      q.questionText.toLowerCase().includes(bankSearch.toLowerCase()) ||
                      q.type.toLowerCase().includes(bankSearch.toLowerCase()),
                  )
                  .map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleToggleQuestion(q.id)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-sky-50/80 border-primary shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0"
                        />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-100 text-sky-800">
                              {q.skill}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {q.type}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Target Band: {q.targetBand}
                            </span>
                            {q.passageSnippet && (
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                📌 {q.passageSnippet}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {q.questionText}
                          </p>
                          <p className="text-xs text-slate-600">
                            Đáp án chuẩn: <strong className="text-emerald-700">{q.correctAnswer}</strong>
                            {q.explanation && ` • ${q.explanation}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep('context_content')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Quay lại bước 2
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('assignment')}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-black text-xs hover:bg-[#154E8A] transition cursor-pointer flex items-center gap-2"
                >
                  <span>Tiếp tục: Cấu Hình Giao Bài Cho Khóa Học</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: CẤU HÌNH GIAO BÀI & HẠN NỘP (DIRECT ASSIGNMENT)                    */}
        {/* ========================================================================= */}
        {activeStep === 'assignment' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Cấu Hình Giao Đề Cho Học Viên Làm Bài Trên Web
                </h3>
                <p className="text-xs text-slate-500">
                  Sau khi Thầy xuất bản, đề thi sẽ hiển thị trong tài khoản học viên để làm bài trực tiếp.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignDirectly}
                      onChange={(e) => setFormData({ ...formData, assignDirectly: e.target.checked })}
                      className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-black text-sky-950">
                      Giao đề thi ngay cho học viên sau khi tạo thành công
                    </span>
                  </label>
                  <p className="text-[11px] text-sky-800/90 pl-6">
                    Hệ thống sẽ tự động kích hoạt đợt thi và gửi thông báo chuông (Notification) đến toàn bộ học viên trong khóa học.
                  </p>
                </div>

                {formData.assignDirectly && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hạn chót nộp bài (Deadline) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Thời gian làm bài đếm ngược (Phút) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="240"
                          required
                          value={formData.durationMinutes}
                          onChange={(e) =>
                            setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <span className="text-xs font-extrabold text-slate-800 block">
                        Tùy chọn bảo mật & chấm bài
                      </span>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.sendNotification}
                          onChange={(e) =>
                            setFormData({ ...formData, sendNotification: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                        />
                        <span>Tự động bắn thông báo chuông (In-app Notification) cho học viên trong lớp</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.allowReview}
                          onChange={(e) =>
                            setFormData({ ...formData, allowReview: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                        />
                        <span>Cho phép học viên xem lại đáp án và giải thích chi tiết sau khi Thầy hoàn tất chấm bài</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Final Summary Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tóm tắt cấu hình đề thi chuẩn bị xuất bản:</span>
                  </div>
                  <ul className="text-xs text-emerald-950 space-y-1 list-disc pl-5 font-medium">
                    <li>Kỹ năng khảo thí: <strong>{selectedSkill}</strong></li>
                    <li>Tiêu đề: <strong>{formData.title}</strong></li>
                    <li>Số lượng câu hỏi bốc từ Ngân hàng đề: <strong>{selectedQuestionIds.length} câu hỏi</strong></li>
                    <li>Thời lượng làm bài: <strong>{formData.durationMinutes} phút</strong> (Sàn đạt: {formData.passScore}%)</li>
                    {formData.assignDirectly && (
                      <li>Hạn nộp bài: <strong>{formData.dueDate.replace('T', ' ')}</strong> (Tự động gửi thông báo)</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep('question_bank')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Quay lại bước 3
                </button>
                <button
                  type="button"
                  onClick={handlePublishExam}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-primary hover:bg-[#154E8A] text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Đang xuất bản đề thi...' : 'Hoàn Tất: Xuất Bản & Giao Đề Thi'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
