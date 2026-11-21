'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomSelect from '@/components/ui/custom-select';
import RichTextEditor from '@/components/shared/rich-text-editor';
import { toast } from '@/components/ui/toast';
import { quizzesService, QuizQuestion as RemoteQuizQuestion } from '@/services/quizzes.service';
import { coursesService, Course } from '@/services/courses.service';
import { writingService } from '@/services/writing.service';
import { speakingService, SpeakingSubmission } from '@/services/speaking.service';
import { extractErrorMessage } from '@/lib/api-error';
import {
  Award,
  FileQuestion,
  FileCheck,
  Headphones,
  Mic,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Volume2,
  Search,
  X,
  RefreshCw,
  Send,
  BookOpen,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
  User,
  Eye,
  Sliders,
  Compass,
  GraduationCap,
  Briefcase,
  Baby,
  Users,
  TrendingUp,
  Globe,
  Target,
  Trophy,
  FileEdit,
  Download,
  Upload,
  Zap,
  FileCode,
  Check,
  Image as ImageIcon,
  MapPin,
  ListChecks,
} from 'lucide-react';

// ==========================================
// INTERFACES
// ==========================================

export interface TestSectionItem {
  part: number;
  title: string;
  passage?: string;
  audioUrl?: string;
  imageUrl?: string;
  instructions?: string;
  cueCard?: string;
  minWords?: number;
  suggestedMinutes?: number;
  questionRange?: string;
}

// Mock Test & Quiz Interfaces
interface QuizQuestion {
  id: string;
  quizId?: string;
  quizTitle?: string;
  part?: number;
  skill: string;
  type?: string;
  groupPrompt?: string;
  imageUrl?: string;
  audioUrl?: string;
  questionText: string;
  correctAnswer: string;
  explanation: string;
}

interface MockTestItem {
  id: string;
  title: string;
  description?: string;
  skill?: string;
  category?: string;
  quizType?: string;
  testType?: string;
  courseId?: string;
  courseTitle?: string;
  course?: { id: string; title: string };
  timeLimitMinutes?: number;
  passScore?: number;
  passage?: string;
  audioUrl?: string;
  sectionsPayload?: any;
  questionsCount?: number;
  submissionsCount?: number;
  questions?: RemoteQuizQuestion[];
}

// Writing Review Interfaces
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

// Speaking Interfaces
interface TimestampComment {
  id: string;
  timeSeconds: number;
  text: string;
}

function AssessmentHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Main Tab: 'mocktest' | 'writing' | 'speaking'
  const tabParam = searchParams.get('tab');
  const [activeHubTab, setActiveHubTab] = useState<'mocktest' | 'writing' | 'speaking'>(
    tabParam === 'writing' ? 'writing' : tabParam === 'speaking' ? 'speaking' : 'mocktest',
  );

  useEffect(() => {
    if (tabParam === 'personal_dev') {
      router.replace('/admin/pedagogy-assessments');
    } else if (tabParam === 'writing' || tabParam === 'speaking' || tabParam === 'mocktest') {
      setActiveHubTab(tabParam);
    }
  }, [tabParam, router]);

  const handleTabChange = (tab: 'mocktest' | 'writing' | 'speaking') => {
    setActiveHubTab(tab);
    router.replace(`/admin/assessments?tab=${tab}`);
  };

  const [notice, setNotice] = useState('');
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };
  // =========================================================================
  // 1. MOCK TEST & QUIZ STATE
  // =========================================================================
  const [mockTests, setMockTests] = useState<MockTestItem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizSearch, setQuizSearch] = useState('');
  const [filterTrack, setFilterTrack] = useState<'ALL' | 'ENGLISH' | 'PERSONAL_DEV'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterQuizType, setFilterQuizType] = useState<string>('ALL');
  const [filterSkill, setFilterSkill] = useState<string>('ALL');

  // Helper Domain / Skill options per Category (Pure IELTS & English)
  const getDomainOptions = (cat: string) => {
    switch (cat) {
      case 'BUSINESS':
        return [
          { value: 'READING', label: 'Business Reading (Đọc hiểu Báo cáo / Hợp đồng)' },
          { value: 'LISTENING', label: 'Business Listening (Nghe hiểu Cuộc họp / Đàm thoại)' },
          { value: 'WRITING', label: 'Business Writing (Soạn thảo Email / Báo cáo)' },
          { value: 'SPEAKING', label: 'Business Speaking (Thuyết trình & Đàm phán)' },
        ];
      case 'KIDS':
        return [
          { value: 'LISTENING', label: 'Listening (Nghe hiểu & Âm vần cơ bản)' },
          { value: 'READING', label: 'Reading (Đọc truyện tranh & Từ vựng)' },
          { value: 'SPEAKING', label: 'Speaking (Phản xạ đàm thoại cơ bản)' },
        ];
      case 'ENGLISH':
        return [
          { value: 'READING', label: 'Reading (Đọc hiểu Đời sống & Tin tức)' },
          { value: 'LISTENING', label: 'Listening (Nghe hiểu Podcast & Hội thoại)' },
          { value: 'WRITING', label: 'Writing (Viết câu & Đoạn văn giao tiếp)' },
          { value: 'SPEAKING', label: 'Speaking (Giao tiếp phản xạ đàm thoại)' },
        ];
      case 'IELTS':
      default:
        return [
          { value: 'READING', label: 'IELTS Reading (Đọc hiểu 3 Passage chuẩn Cambridge)' },
          { value: 'LISTENING', label: 'IELTS Listening (Nghe hiểu Section 1 - 4)' },
          { value: 'WRITING', label: 'IELTS Writing (Task 1 & Task 2)' },
          { value: 'SPEAKING', label: 'IELTS Speaking (Part 1, 2, 3)' },
        ];
    }
  };

  const getDefaultSectionsForSkill = (skill: string): TestSectionItem[] => {
    if (skill === 'READING') {
      return [
        {
          part: 1,
          title: 'Passage 1: Khoa học / Tự nhiên & Đời sống thực tế',
          passage: '',
          imageUrl: '',
          instructions: 'You should spend about 20 minutes on Questions 1-13, which are based on Reading Passage 1.',
          questionRange: 'Questions 1 - 13',
        },
        {
          part: 2,
          title: 'Passage 2: Lịch sử, Xã hội hoặc Đổi mới công nghệ',
          passage: '',
          imageUrl: '',
          instructions: 'You should spend about 20 minutes on Questions 14-26, which are based on Reading Passage 2.',
          questionRange: 'Questions 14 - 26',
        },
        {
          part: 3,
          title: 'Passage 3: Luận điểm nghiên cứu học thuật chuyên sâu',
          passage: '',
          imageUrl: '',
          instructions: 'You should spend about 20 minutes on Questions 27-40, which are based on Reading Passage 3.',
          questionRange: 'Questions 27 - 40',
        },
      ];
    }

    if (skill === 'LISTENING') {
      return [
        {
          part: 1,
          title: 'Section 1: Đàm thoại giao tiếp xã hội thường nhật (Form / Note Completion)',
          audioUrl: '',
          instructions: 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
          questionRange: 'Questions 1 - 10',
        },
        {
          part: 2,
          title: 'Section 2: Độc thoại đời sống & Hướng dẫn sơ đồ / bản đồ (Map & Diagram Labeling)',
          audioUrl: '',
          imageUrl: '',
          instructions: 'Label the map below. Choose the correct letter, A-H, next to Questions 11-15.',
          questionRange: 'Questions 11 - 20',
        },
        {
          part: 3,
          title: 'Section 3: Thảo luận học thuật giữa sinh viên & giảng viên (Academic Discussion)',
          audioUrl: '',
          instructions: 'Choose the correct letter, A, B or C for Questions 21-30.',
          questionRange: 'Questions 21 - 30',
        },
        {
          part: 4,
          title: 'Section 4: Bài giảng đại học chuyên đề liên tục (Academic Lecture & Note Completion)',
          audioUrl: '',
          instructions: 'Complete the summary notes below. Write NO MORE THAN TWO WORDS for each answer.',
          questionRange: 'Questions 31 - 40',
        },
      ];
    }

    if (skill === 'WRITING') {
      return [
        {
          part: 1,
          title: 'Task 1: Báo cáo phân tích dữ liệu trực quan (Biểu đồ / Bản đồ / Quy trình)',
          imageUrl: '',
          instructions: 'The chart below shows... Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
          minWords: 150,
          suggestedMinutes: 20,
          questionRange: 'Task 1 (Min 150 từ)',
        },
        {
          part: 2,
          title: 'Task 2: Bài luận nghị luận xã hội / học thuật (Academic Essay)',
          instructions: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
          minWords: 250,
          suggestedMinutes: 40,
          questionRange: 'Task 2 (Min 250 từ)',
        },
      ];
    }

    if (skill === 'SPEAKING') {
      return [
        {
          part: 1,
          title: 'Part 1: Giới thiệu & Phỏng vấn các chủ đề quen thuộc (Introduction & Interview)',
          instructions: 'Trả lời các câu hỏi ngắn về bản thân, công việc/học tập, sở thích và quê hương.',
          suggestedMinutes: 4,
          questionRange: 'Part 1 (4 - 5 phút)',
        },
        {
          part: 2,
          title: 'Part 2: Thuyết trình độc lập theo thẻ gợi ý (Individual Long Turn / Cue Card)',
          cueCard: 'Describe an ambitious project or goal you achieved.\nYou should say:\n- What it was\n- When and why you did it\n- What obstacles you faced\nand explain how you felt when you succeeded.',
          instructions: 'Học viên có 1 phút chuẩn bị ghi chú và 2 phút ghi âm liên tục.',
          suggestedMinutes: 3,
          questionRange: 'Part 2 (3 - 4 phút)',
        },
        {
          part: 3,
          title: 'Part 3: Thảo luận chuyên sâu 2 chiều (Two-way Discussion)',
          instructions: 'Trả lời các câu hỏi mang tính phân tích, trừu tượng mở rộng từ chủ đề Part 2.',
          suggestedMinutes: 5,
          questionRange: 'Part 3 (4 - 5 phút)',
        },
      ];
    }

    return [];
  };

  // Modal Mock Test & Quiz State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [activeSectionPart, setActiveSectionPart] = useState<number>(1);
  const [testSections, setTestSections] = useState<TestSectionItem[]>([]);
  const [testFormData, setTestFormData] = useState({
    title: '',
    description: '',
    track: 'ENGLISH' as 'ENGLISH' | 'PERSONAL_DEV',
    category: 'IELTS',
    quizType: 'FULL_MOCK_TEST',
    courseId: '',
    skill: 'READING',
    timeLimitMinutes: 60,
    passScore: 80,
    passage: '',
    audioUrl: '',
  });

  const updateActiveSection = (key: keyof TestSectionItem, value: any) => {
    setTestSections((prev) =>
      prev.map((s) => (s.part === activeSectionPart ? { ...s, [key]: value } : s))
    );
  };

  // Modal Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qFormData, setQFormData] = useState({
    targetQuizId: '',
    part: 1,
    skill: 'READING',
    type: 'SINGLE_CHOICE',
    groupPrompt: '',
    imageUrl: '',
    audioUrl: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    fillBlankAnswers: '',
    explanation: '',
  });

  // Assessment Studio Questions State
  const [studioQuestions, setStudioQuestions] = useState<any[]>([]);
  const [isLoadingStudioQuestions, setIsLoadingStudioQuestions] = useState(false);
  const [studioQuestionForm, setStudioQuestionForm] = useState({
    type: 'TRUE_FALSE_NOT_GIVEN',
    groupPrompt: '',
    questionText: '',
    imageUrl: '',
    audioUrl: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'TRUE',
    fillBlankAnswers: '',
    explanation: '',
  });

  const fetchQuizzesAndTests = async () => {
    setLoadingQuizzes(true);
    try {
      const response = (await quizzesService.getAllQuizzes({ limit: 100 })) as unknown;
      let rawList: any[] = [];
      if (Array.isArray(response)) {
        rawList = response;
      } else if (response && typeof response === 'object' && 'items' in (response as any)) {
        rawList = (response as any).items || [];
      }

      if (rawList.length === 0) {
        const skillsTests = (await quizzesService.getSkillsTests()) as unknown;
        rawList = Array.isArray(skillsTests) ? skillsTests : [];
      }

      const mappedTests: MockTestItem[] = rawList.map((item) => ({
        id: String(item.id || ''),
        title: String(item.title || ''),
        description: item.description,
        skill: item.skill || 'READING',
        category: item.category || item.course?.category || 'IELTS',
        quizType: item.quizType || item.testType || 'FULL_MOCK_TEST',
        testType: item.testType || item.quizType || 'FULL_MOCK_TEST',
        courseId: item.courseId || item.course?.id || '',
        courseTitle: item.course?.title || '',
        timeLimitMinutes: item.timeLimitMinutes ?? 45,
        passScore: item.passScore ?? 80,
        passage: item.passage,
        audioUrl: item.audioUrl,
        sectionsPayload: item.sectionsPayload,
        questionsCount:
          typeof item._count?.questions === 'number'
            ? item._count.questions
            : Array.isArray(item.questions)
            ? item.questions.length
            : 0,
        submissionsCount:
          typeof item._count?.submissions === 'number' ? item._count.submissions : 0,
        questions: item.questions,
      }));
      setMockTests(mappedTests);

      // Extract questions bank
      const extractedQuestions: QuizQuestion[] = [];
      mappedTests.forEach((test) => {
        if (Array.isArray(test.questions)) {
          test.questions.forEach((q: RemoteQuizQuestion) => {
            const options = q.options as { id: string; content: string; isCorrect?: boolean }[] | undefined;
            const correctOpt = options?.find((o) => o.isCorrect);
            const correctIdx = correctOpt && options ? options.indexOf(correctOpt) : 0;
            const correctLetter =
              correctOpt?.content ||
              (options && options.length > 0
                ? String.fromCharCode(65 + (correctIdx >= 0 ? correctIdx : 0))
                : 'Đáp án chuẩn');

            extractedQuestions.push({
              id: q.id,
              quizId: test.id,
              quizTitle: test.title,
              part: (q as any).part ?? 1,
              skill: q.skillType || test.skill || 'READING',
              type: q.type || 'SINGLE_CHOICE',
              groupPrompt: (q as any).groupPrompt,
              imageUrl: (q as any).imageUrl,
              audioUrl: (q as any).audioUrl,
              questionText: q.questionText || q.content || 'Nội dung câu hỏi',
              correctAnswer: correctLetter,
              explanation: q.explanation || 'Giải thích chuẩn theo tiêu chí đề thi.',
            });
          });
        }
      });
      setQuizQuestions(extractedQuestions);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleOpenCreateTestModal = (targetCourseId?: string, targetCategory?: string) => {
    setEditingTestId(null);
    setStudioQuestions([]);
    const cat = targetCategory || (filterCategory !== 'ALL' ? filterCategory : 'IELTS');
    const safeCat = ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(cat) ? cat : 'IELTS';
    const domainOpts = getDomainOptions(safeCat);
    const initialSkill = domainOpts[0]?.value || 'READING';
    const initialSections = getDefaultSectionsForSkill(initialSkill);

    setTestSections(initialSections);
    setActiveSectionPart(1);
    setTestFormData({
      title: '',
      description: '',
      track: 'ENGLISH',
      category: safeCat,
      quizType: 'FULL_MOCK_TEST',
      courseId: targetCourseId || '',
      skill: initialSkill,
      timeLimitMinutes: initialSkill === 'READING' ? 60 : initialSkill === 'LISTENING' ? 40 : initialSkill === 'SPEAKING' ? 15 : 60,
      passScore: 80,
      passage: '',
      audioUrl: '',
    });
    setStudioQuestionForm({
      type: initialSkill === 'READING' ? 'TRUE_FALSE_NOT_GIVEN' : 'SINGLE_CHOICE',
      groupPrompt: '',
      questionText: '',
      imageUrl: '',
      audioUrl: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: initialSkill === 'READING' ? 'TRUE' : 'A',
      fillBlankAnswers: '',
      explanation: '',
    });
    setIsTestModalOpen(true);
  };

  const handleEditMockTest = async (test: MockTestItem) => {
    setEditingTestId(test.id);
    const cat = test.category || 'IELTS';
    const skill = test.skill || 'READING';
    let loadedSections: TestSectionItem[] = [];

    if (Array.isArray(test.sectionsPayload) && test.sectionsPayload.length > 0) {
      loadedSections = test.sectionsPayload;
    } else {
      loadedSections = getDefaultSectionsForSkill(skill);
      if (test.passage && loadedSections[0]) {
        loadedSections[0].passage = test.passage;
      }
      if (test.audioUrl && loadedSections[0]) {
        loadedSections[0].audioUrl = test.audioUrl;
      }
    }

    setTestSections(loadedSections);
    setActiveSectionPart(1);

    setTestFormData({
      title: test.title,
      description: test.description || '',
      track: 'ENGLISH',
      category: cat,
      quizType: test.quizType || test.testType || 'FULL_MOCK_TEST',
      courseId: test.courseId || '',
      skill: skill,
      timeLimitMinutes: test.timeLimitMinutes ?? (skill === 'READING' ? 60 : skill === 'LISTENING' ? 40 : 60),
      passScore: 80,
      passage: test.passage || '',
      audioUrl: test.audioUrl || '',
    });

    setStudioQuestionForm({
      type: skill === 'READING' ? 'TRUE_FALSE_NOT_GIVEN' : skill === 'LISTENING' ? 'FILL_BLANK' : 'SINGLE_CHOICE',
      groupPrompt: '',
      questionText: '',
      imageUrl: '',
      audioUrl: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: skill === 'READING' ? 'TRUE' : 'A',
      fillBlankAnswers: '',
      explanation: '',
    });

    setIsTestModalOpen(true);

    // Fetch quiz questions
    setIsLoadingStudioQuestions(true);
    try {
      const fullQuiz = await quizzesService.getQuizById(test.id);
      if (fullQuiz && Array.isArray(fullQuiz.questions)) {
        setStudioQuestions(fullQuiz.questions);
      } else {
        setStudioQuestions([]);
      }
    } catch {
      setStudioQuestions([]);
    } finally {
      setIsLoadingStudioQuestions(false);
    }
  };

  const handleSaveMockTest = async (e?: React.FormEvent, keepOpenAfterSave = false): Promise<string | null> => {
    if (e) e.preventDefault();
    if (!testFormData.title.trim()) {
      showNotice('❌ Vui lòng nhập tiêu đề bài thi!');
      return null;
    }
    try {
      const firstReadingPassage = testSections.find((s) => s.passage)?.passage || testFormData.passage;
      const firstAudioUrl = testSections.find((s) => s.audioUrl)?.audioUrl || testFormData.audioUrl;

      const payload = {
        title: testFormData.title.trim(),
        description: testFormData.description?.trim() || undefined,
        category: testFormData.category,
        quizType: testFormData.quizType,
        testType: testFormData.quizType,
        courseId: testFormData.courseId || undefined,
        skill: testFormData.skill,
        timeLimitMinutes: Number(testFormData.timeLimitMinutes),
        passScore: 80,
        passage: firstReadingPassage?.trim() || undefined,
        audioUrl: firstAudioUrl?.trim() || undefined,
        sectionsPayload: testSections,
      };

      let savedId = editingTestId;
      if (editingTestId) {
        await quizzesService.updateQuiz(editingTestId, payload);
        showNotice(`✅ Đã cập nhật đề thi "${testFormData.title}"!`);
      } else {
        const created = await quizzesService.createQuiz(payload);
        savedId = created.id;
        setEditingTestId(created.id);
        showNotice(`🎉 Đã tạo đề thi "${testFormData.title}"! Bạn có thể thêm câu hỏi ngay.`);
      }
      await fetchQuizzesAndTests();
      if (!keepOpenAfterSave) {
        setIsTestModalOpen(false);
      }
      return savedId;
    } catch (err: unknown) {
      showNotice(`❌ Lỗi khi lưu đề thi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
      return null;
    }
  };

  const handleDeleteMockTest = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đề thi này?')) return;
    try {
      await quizzesService.deleteQuiz(id);
      showNotice('✅ Đã xóa đề thi thành công!');
      await fetchQuizzesAndTests();
    } catch {
      showNotice('❌ Lỗi khi xóa đề thi');
    }
  };

  const handleOpenAddQuestion = (quizId?: string, defaultPart?: number) => {
    const targetQuiz = mockTests.find((t) => t.id === quizId) || mockTests[0];
    const targetSkill = targetQuiz?.skill || 'READING';
    const initialPart = defaultPart || 1;

    setQFormData({
      targetQuizId: targetQuiz?.id || '',
      part: initialPart,
      skill: targetSkill,
      type:
        targetSkill === 'READING'
          ? 'TRUE_FALSE_NOT_GIVEN'
          : targetSkill === 'LISTENING' && initialPart === 2
          ? 'MAP_DIAGRAM_LABELING'
          : 'SINGLE_CHOICE',
      groupPrompt: '',
      imageUrl: '',
      audioUrl: '',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: targetSkill === 'READING' ? 'TRUE' : 'A',
      fillBlankAnswers: '',
      explanation: '',
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qFormData.targetQuizId || !qFormData.questionText.trim()) {
      showNotice('❌ Vui lòng chọn đề thi và nhập nội dung câu hỏi!');
      return;
    }

    try {
      let options: { content: string; isCorrect: boolean }[] = [];

      if (qFormData.type === 'TRUE_FALSE_NOT_GIVEN') {
        options = [
          { content: 'TRUE', isCorrect: qFormData.correctAnswer === 'TRUE' },
          { content: 'FALSE', isCorrect: qFormData.correctAnswer === 'FALSE' },
          { content: 'NOT GIVEN', isCorrect: qFormData.correctAnswer === 'NOT GIVEN' },
        ];
      } else if (qFormData.type === 'YES_NO_NOT_GIVEN') {
        options = [
          { content: 'YES', isCorrect: qFormData.correctAnswer === 'YES' },
          { content: 'NO', isCorrect: qFormData.correctAnswer === 'NO' },
          { content: 'NOT GIVEN', isCorrect: qFormData.correctAnswer === 'NOT GIVEN' },
        ];
      } else if (qFormData.type === 'MAP_DIAGRAM_LABELING') {
        options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => ({
          content: letter,
          isCorrect: qFormData.correctAnswer === letter,
        }));
      } else if (qFormData.type === 'FILL_BLANK' || qFormData.type === 'NOTE_COMPLETION' || qFormData.type === 'FORM_COMPLETION') {
        const parts = (qFormData.fillBlankAnswers || 'Đáp án mẫu').split('/').map((p) => p.trim()).filter(Boolean);
        options = parts.map((p) => ({ content: p, isCorrect: true }));
        if (options.length === 0) options = [{ content: 'Đáp án chuẩn', isCorrect: true }];
      } else {
        options = [
          { content: qFormData.optionA || 'Lựa chọn A', isCorrect: qFormData.correctAnswer === 'A' },
          { content: qFormData.optionB || 'Lựa chọn B', isCorrect: qFormData.correctAnswer === 'B' },
          { content: qFormData.optionC || 'Lựa chọn C', isCorrect: qFormData.correctAnswer === 'C' },
          { content: qFormData.optionD || 'Lựa chọn D', isCorrect: qFormData.correctAnswer === 'D' },
        ];
      }

      await quizzesService.createQuestion({
        quizId: qFormData.targetQuizId,
        questionText: qFormData.questionText,
        skillType: qFormData.skill,
        type: qFormData.type,
        explanation: qFormData.explanation,
        part: Number(qFormData.part) || 1,
        groupPrompt: qFormData.groupPrompt?.trim() || undefined,
        imageUrl: qFormData.imageUrl?.trim() || undefined,
        audioUrl: qFormData.audioUrl?.trim() || undefined,
        options,
      });

      showNotice(`✅ Đã thêm câu hỏi (${qFormData.type} • Part ${qFormData.part}) thành công!`);
      await fetchQuizzesAndTests();
      setIsQuestionModalOpen(false);
    } catch (err: unknown) {
      showNotice(`❌ Lỗi khi thêm câu hỏi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // ==========================================
  // ASSESSMENT STUDIO QUESTION AUTHORING LOGIC
  // ==========================================
  const handleSaveStudioQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioQuestionForm.questionText.trim()) {
      showNotice('❌ Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    try {
      let targetQuizId = editingTestId;
      if (!targetQuizId) {
        targetQuizId = await handleSaveMockTest(undefined, true);
        if (!targetQuizId) return;
      }

      let options: { content: string; isCorrect: boolean }[] = [];
      const qType = studioQuestionForm.type;

      if (qType === 'TRUE_FALSE_NOT_GIVEN') {
        options = [
          { content: 'TRUE', isCorrect: studioQuestionForm.correctAnswer === 'TRUE' },
          { content: 'FALSE', isCorrect: studioQuestionForm.correctAnswer === 'FALSE' },
          { content: 'NOT GIVEN', isCorrect: studioQuestionForm.correctAnswer === 'NOT GIVEN' },
        ];
      } else if (qType === 'YES_NO_NOT_GIVEN') {
        options = [
          { content: 'YES', isCorrect: studioQuestionForm.correctAnswer === 'YES' },
          { content: 'NO', isCorrect: studioQuestionForm.correctAnswer === 'NO' },
          { content: 'NOT GIVEN', isCorrect: studioQuestionForm.correctAnswer === 'NOT GIVEN' },
        ];
      } else if (qType === 'MAP_DIAGRAM_LABELING') {
        options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => ({
          content: letter,
          isCorrect: studioQuestionForm.correctAnswer === letter,
        }));
      } else if (
        qType === 'FILL_BLANK' ||
        qType === 'NOTE_COMPLETION' ||
        qType === 'FORM_COMPLETION' ||
        qType === 'SUMMARY_COMPLETION'
      ) {
        const parts = (studioQuestionForm.fillBlankAnswers || studioQuestionForm.correctAnswer || 'Đáp án')
          .split('/')
          .map((p) => p.trim())
          .filter(Boolean);
        options = parts.map((p) => ({ content: p, isCorrect: true }));
        if (options.length === 0) options = [{ content: 'Đáp án chuẩn', isCorrect: true }];
      } else if (qType === 'MATCHING_HEADINGS') {
        const headings = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
        options = headings.map((h) => ({
          content: h,
          isCorrect: studioQuestionForm.correctAnswer === h,
        }));
      } else {
        // SINGLE_CHOICE / MULTIPLE_CHOICE
        options = [
          { content: studioQuestionForm.optionA || 'Lựa chọn A', isCorrect: studioQuestionForm.correctAnswer === 'A' },
          { content: studioQuestionForm.optionB || 'Lựa chọn B', isCorrect: studioQuestionForm.correctAnswer === 'B' },
          { content: studioQuestionForm.optionC || 'Lựa chọn C', isCorrect: studioQuestionForm.correctAnswer === 'C' },
          { content: studioQuestionForm.optionD || 'Lựa chọn D', isCorrect: studioQuestionForm.correctAnswer === 'D' },
        ];
      }

      await quizzesService.createQuestion({
        quizId: targetQuizId,
        questionText: studioQuestionForm.questionText,
        skillType: testFormData.skill,
        type: qType,
        explanation: studioQuestionForm.explanation?.trim() || undefined,
        part: activeSectionPart,
        groupPrompt: studioQuestionForm.groupPrompt?.trim() || undefined,
        imageUrl: studioQuestionForm.imageUrl?.trim() || undefined,
        audioUrl: studioQuestionForm.audioUrl?.trim() || undefined,
        options,
      });

      showNotice('✅ Đã thêm câu hỏi vào Phần ' + activeSectionPart + ' thành công!');

      const full = await quizzesService.getQuizById(targetQuizId);
      if (full && Array.isArray(full.questions)) {
        setStudioQuestions(full.questions);
      }
      await fetchQuizzesAndTests();

      setStudioQuestionForm((prev) => ({
        ...prev,
        questionText: '',
        explanation: '',
        imageUrl: '',
        fillBlankAnswers: '',
      }));
    } catch (err) {
      showNotice('❌ Lỗi khi thêm câu hỏi: ' + extractErrorMessage(err, 'Thao tác thất bại'));
    }
  };

  const handleDeleteStudioQuestion = async (qId: string) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;
    try {
      await quizzesService.deleteQuestion(qId);
      setStudioQuestions((prev) => prev.filter((q) => q.id !== qId));
      showNotice('✅ Đã xóa câu hỏi!');
      await fetchQuizzesAndTests();
    } catch (err) {
      showNotice('❌ Lỗi khi xóa câu hỏi: ' + extractErrorMessage(err, 'Thất bại'));
    }
  };

  const filteredMockTests = useMemo(() => {
    return mockTests.filter((test) => {
      // Phân hệ Khảo Thí thuần túy dành riêng cho IELTS & Tiếng Anh
      const isEng = ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(test.category || 'IELTS');
      if (!isEng) return false;

      const matchCat = filterCategory === 'ALL' || (test.category || 'IELTS') === filterCategory;
      const matchQuizType =
        filterQuizType === 'ALL' ||
        test.quizType === filterQuizType ||
        test.testType === filterQuizType;
      const matchSkill = filterSkill === 'ALL' || test.skill === filterSkill;
      const matchSearch =
        !quizSearch.trim() ||
        test.title.toLowerCase().includes(quizSearch.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(quizSearch.toLowerCase()));

      return matchCat && matchQuizType && matchSkill && matchSearch;
    });
  }, [mockTests, filterCategory, filterQuizType, filterSkill, quizSearch]);

  // =========================================================================
  // 2. IELTS WRITING AI REVIEW STATE
  // =========================================================================
  const [writingSubmissions, setWritingSubmissions] = useState<WritingReviewItem[]>([]);
  const [loadingWriting, setLoadingWriting] = useState(false);
  const [activeWritingReview, setActiveWritingReview] = useState<WritingReviewItem | null>(null);
  const [scoreTR, setScoreTR] = useState(7.0);
  const [scoreCC, setScoreCC] = useState(7.0);
  const [scoreLR, setScoreLR] = useState(7.0);
  const [scoreGRA, setScoreGRA] = useState(7.0);
  const [writingFeedback, setWritingFeedback] = useState('');
  const [submittingWritingApproval, setSubmittingWritingApproval] = useState(false);

  const fetchWritingSubmissions = async () => {
    setLoadingWriting(true);
    try {
      const data = await writingService.getAdminSubmissions();
      if (Array.isArray(data)) {
        const mapped: WritingReviewItem[] = data.map((item: any) => ({
          id: item.id,
          studentName: item.user?.fullName || item.student?.fullName || 'Học viên',
          studentEmail: item.user?.email || item.student?.email || 'student@dong.edu.vn',
          taskTitle: item.prompt?.title || 'IELTS Writing Essay',
          taskType: item.prompt?.taskType || 'TASK_2',
          essayText: item.content,
          wordCount: item.wordCount,
          submittedAt: item.submittedAt
            ? new Date(item.submittedAt).toLocaleString('vi-VN')
            : 'Hôm nay',
          aiTR: item.taskAchievementScore ?? item.aiAnalysis?.taskResponse?.score ?? 7.0,
          aiCC: item.coherenceCohesionScore ?? item.aiAnalysis?.coherenceCohesion?.score ?? 7.0,
          aiLR: item.lexicalResourceScore ?? item.aiAnalysis?.lexicalResource?.score ?? 7.0,
          aiGRA: item.grammarScore ?? item.aiAnalysis?.grammaticalAccuracy?.score ?? 7.0,
          aiOverall: item.overallBand ?? item.aiScore ?? 7.0,
          status: item.status === 'APPROVED' ? 'APPROVED' : 'AI_EVALUATED',
        }));
        setWritingSubmissions(mapped);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingWriting(false);
    }
  };

  const handleOpenWritingReview = (sub: WritingReviewItem) => {
    setActiveWritingReview(sub);
    setScoreTR(sub.aiTR);
    setScoreCC(sub.aiCC);
    setScoreLR(sub.aiLR);
    setScoreGRA(sub.aiGRA);
    setWritingFeedback(
      'Bài viết có bố cục mạch lạc, từ vựng học thuật C1/C2 dùng chuẩn xác. Đã phê duyệt phát hành điểm chính thức.',
    );
  };

  const currentWritingOverall = useMemo(() => {
    const raw = (scoreTR + scoreCC + scoreLR + scoreGRA) / 4;
    return Math.round(raw * 2) / 2;
  }, [scoreTR, scoreCC, scoreLR, scoreGRA]);

  const handleQuickApproveWriting = async (sub: WritingReviewItem) => {
    try {
      await writingService.approveSubmission(sub.id, {
        adminOverrideBand: sub.aiOverall,
        adminFeedback: 'Phê duyệt chuẩn xác theo kết quả phân tích 4 tiêu chí của AI.',
        isApproved: true,
      });
      setWritingSubmissions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status: 'APPROVED' } : s)),
      );
      showNotice(`✅ Đã duyệt nhanh bài viết của học viên ${sub.studentName} (Band ${sub.aiOverall.toFixed(1)})!`);
    } catch {
      showNotice('❌ Không thể duyệt bài viết');
    }
  };

  const handleApproveAndPublishWriting = async () => {
    if (!activeWritingReview) return;
    setSubmittingWritingApproval(true);
    try {
      await writingService.approveSubmission(activeWritingReview.id, {
        adminOverrideBand: currentWritingOverall,
        adminFeedback: writingFeedback,
        isApproved: true,
      });
      setWritingSubmissions((prev) =>
        prev.map((s) => (s.id === activeWritingReview.id ? { ...s, status: 'APPROVED' } : s)),
      );
      showNotice(
        `✅ Đã phê duyệt bài viết của học viên ${activeWritingReview.studentName} (Band ${currentWritingOverall.toFixed(1)})!`,
      );
      setActiveWritingReview(null);
    } catch {
      showNotice('❌ Không thể phê duyệt bài viết');
    } finally {
      setSubmittingWritingApproval(false);
    }
  };

  // =========================================================================
  // 3. SPEAKING AUDIO GRADING STATE
  // =========================================================================
  const [speakingSubmissions, setSpeakingSubmissions] = useState<SpeakingSubmission[]>([]);
  const [selectedSpeakingId, setSelectedSpeakingId] = useState<string>('');
  const [loadingSpeaking, setLoadingSpeaking] = useState(false);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(120);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 4 Criteria Scores for Speaking
  const [scoreFC, setScoreFC] = useState(7.0);
  const [scoreSpeakingLR, setScoreSpeakingLR] = useState(7.0);
  const [scoreSpeakingGRA, setScoreSpeakingGRA] = useState(7.0);
  const [scorePR, setScorePR] = useState(7.0);
  const [speakingFeedback, setSpeakingFeedback] = useState(
    'Bài nói có độ trôi chảy tốt, phát âm chuẩn. Cần làm phong phú thêm từ vựng học thuật trong Part 3.',
  );
  const [speakingComments, setSpeakingComments] = useState<TimestampComment[]>([]);
  const [newSpeakingComment, setNewSpeakingComment] = useState('');
  const [submittingSpeaking, setSubmittingSpeaking] = useState(false);

  const fetchSpeakingSubmissions = async () => {
    setLoadingSpeaking(true);
    try {
      const data = await speakingService.getAdminSubmissions();
      if (Array.isArray(data) && data.length > 0) {
        setSpeakingSubmissions(data);
        if (!selectedSpeakingId || !data.some((s) => s.id === selectedSpeakingId)) {
          setSelectedSpeakingId(data[0].id);
        }
      } else {
        setSpeakingSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching speaking submissions:', err);
    } finally {
      setLoadingSpeaking(false);
    }
  };

  const currentSpeakingSub = useMemo(() => {
    return speakingSubmissions.find((s) => s.id === selectedSpeakingId) || speakingSubmissions[0] || null;
  }, [speakingSubmissions, selectedSpeakingId]);

  useEffect(() => {
    if (!currentSpeakingSub) return;
    if (currentSpeakingSub.fluencyScore) setScoreFC(currentSpeakingSub.fluencyScore);
    if (currentSpeakingSub.lexicalScore) setScoreSpeakingLR(currentSpeakingSub.lexicalScore);
    if (currentSpeakingSub.grammarScore) setScoreSpeakingGRA(currentSpeakingSub.grammarScore);
    if (currentSpeakingSub.pronunciationScore) setScorePR(currentSpeakingSub.pronunciationScore);
    if (currentSpeakingSub.feedback) setSpeakingFeedback(currentSpeakingSub.feedback);
    if (currentSpeakingSub.durationSeconds) setAudioDuration(currentSpeakingSub.durationSeconds);

    setSpeakingComments([
      { id: 'c1', timeSeconds: 12, text: 'Ngữ điệu tự nhiên, phản xạ câu hỏi tốt.' },
      { id: 'c2', timeSeconds: 40, text: 'Chú ý phát âm rõ ending sounds /s/ và /ed/.' },
    ]);

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setCurrentAudioTime(0);
  }, [selectedSpeakingId]);

  const currentSpeakingOverall = useMemo(() => {
    const raw = (scoreFC + scoreSpeakingLR + scoreSpeakingGRA + scorePR) / 4;
    return Math.round(raw * 2) / 2;
  }, [scoreFC, scoreSpeakingLR, scoreSpeakingGRA, scorePR]);

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setCurrentAudioTime(audioPlayerRef.current.currentTime);
    }
  };

  const handleAudioLoaded = () => {
    if (audioPlayerRef.current) {
      setAudioDuration(audioPlayerRef.current.duration || 120);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = speed;
    }
  };

  const handleAddSpeakingComment = () => {
    if (!newSpeakingComment.trim()) return;
    const newC: TimestampComment = {
      id: `comm-${Date.now()}`,
      timeSeconds: Math.floor(currentAudioTime),
      text: newSpeakingComment.trim(),
    };
    setSpeakingComments((prev) => [...prev, newC].sort((a, b) => a.timeSeconds - b.timeSeconds));
    setNewSpeakingComment('');
  };

  const handleSubmitSpeakingGrade = async () => {
    if (!currentSpeakingSub) return;
    setSubmittingSpeaking(true);
    try {
      await speakingService.gradeSubmission(currentSpeakingSub.id, {
        fluencyScore: scoreFC,
        lexicalScore: scoreSpeakingLR,
        grammarScore: scoreSpeakingGRA,
        pronunciationScore: scorePR,
        overallBand: currentSpeakingOverall,
        feedback: speakingFeedback,
        timestampFeedback: speakingComments.map((c) => ({
          timeSeconds: c.timeSeconds,
          text: c.text,
        })),
      });

      showNotice(
        `✅ Đã lưu điểm chấm Speaking cho học viên (Overall Band ${currentSpeakingOverall.toFixed(1)}) thành công!`,
      );
      await fetchSpeakingSubmissions();
    } catch {
      showNotice('❌ Không thể lưu điểm chấm Speaking');
    } finally {
      setSubmittingSpeaking(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchQuizzesAndTests();
    fetchWritingSubmissions();
    fetchSpeakingSubmissions();
    coursesService.getCourses().then((c) => {
      if (Array.isArray(c)) setCoursesList(c);
    }).catch(() => {});
  }, []);

  // Listen to deep-link search parameters (e.g. ?courseId=...&category=...)
  useEffect(() => {
    const courseIdParam = searchParams.get('courseId');
    const catParam = searchParams.get('category');
    const actionParam = searchParams.get('action');

    if (actionParam === 'new_quiz' || courseIdParam) {
      const initialCat = ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(catParam?.toUpperCase() || '')
        ? catParam!.toUpperCase()
        : 'IELTS';
      const domainOpts = getDomainOptions(initialCat);
      setTestFormData((prev) => ({
        ...prev,
        courseId: courseIdParam || '',
        track: 'ENGLISH',
        category: initialCat,
        quizType: 'FULL_MOCK_TEST',
        skill: domainOpts[0]?.value || 'READING',
      }));
      setIsTestModalOpen(true);
    }
  }, [searchParams]);

  const pendingWritingCount = useMemo(
    () => writingSubmissions.filter((s) => s.status !== 'APPROVED').length,
    [writingSubmissions],
  );

  const pendingSpeakingCount = useMemo(
    () => speakingSubmissions.filter((s) => (s as any).status !== 'GRADED').length,
    [speakingSubmissions],
  );

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>IELTS ASSESSMENT & TESTING SUITE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Trung Tâm Khảo Thí & Chấm Thi Học Viện</span>
            {(loadingQuizzes || loadingWriting || loadingSpeaking) && (
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            )}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Quản trị đề thi Mock Test, phê duyệt bài viết IELTS Writing AI và chấm điểm bài nói Speaking trực quan.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Three Unified Main Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto">
        {/* Tab 1: Mock Test & Quizzes */}
        <button
          onClick={() => handleTabChange('mocktest')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeHubTab === 'mocktest'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>1. Đề Thi Mock Test & Quizzes</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10.5px]">
            {mockTests.length}
          </span>
        </button>

        {/* Tab 2: Duyệt Bài Viết Writing AI */}
        <button
          onClick={() => handleTabChange('writing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeHubTab === 'writing'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>2. Duyệt Bài Viết IELTS Writing AI</span>
          {pendingWritingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10.5px] font-black animate-pulse">
              {pendingWritingCount} chờ duyệt
            </span>
          )}
        </button>

        {/* Tab 3: Chấm Bài Nói Speaking */}
        <button
          onClick={() => handleTabChange('speaking')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeHubTab === 'speaking'
              ? 'bg-[#FFB547] text-[#14263D] shadow-md shadow-amber-500/20 font-black'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>3. Chấm Bài Nói Speaking Studio</span>
          {pendingSpeakingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10.5px] font-black animate-pulse">
              {pendingSpeakingCount} cần chấm
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: MOCK TEST & QUIZ MANAGEMENT                                */}
      {/* ========================================================================= */}
      {activeHubTab === 'mocktest' && (
        <div className="space-y-5">
          {/* Header row: Title & Action */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Danh Sách Đề Thi Thử Cambridge & IELTS</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-primary border border-sky-200">
                  {mockTests.length} Đề thi
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Quản lý các đề thi chuẩn Cambridge IELTS 4 kỹ năng (Reading 3 Passages, Listening 4 Sections, Writing 2 Tasks, Speaking 3 Parts).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCreateTestModal()}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Soạn Đề Thi Mới</span>
              </button>
            </div>
          </div>

          {/* Filter Bar with Skill Switcher & IELTS Category Pills */}
          <div className="bg-white p-4 rounded-3xl border border-line shadow-xs space-y-3">
            {/* Primary Skill Filter & Quiz Type */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-line pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1">
                  Kỹ Năng:
                </span>
                {[
                  { id: 'ALL', label: 'Tất Cả Kỹ Năng', icon: Globe },
                  { id: 'READING', label: 'Reading (Đọc)', icon: BookOpen },
                  { id: 'LISTENING', label: 'Listening (Nghe)', icon: Headphones },
                  { id: 'WRITING', label: 'Writing (Viết)', icon: FileEdit },
                  { id: 'SPEAKING', label: 'Speaking (Nói)', icon: Mic },
                ].map((sk) => (
                  <button
                    key={sk.id}
                    onClick={() => setFilterSkill(sk.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      filterSkill === sk.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sk.icon && <sk.icon className="w-3.5 h-3.5 shrink-0" />}
                    <span>{sk.label}</span>
                  </button>
                ))}
              </div>

              {/* Quiz Type Quick Filter */}
              <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1">
                  Loại Bài:
                </span>
                {[
                  { id: 'ALL', label: 'Tất Cả Loại', icon: null },
                  { id: 'FULL_MOCK_TEST', label: 'Thi Thử (Mock)', icon: Trophy },
                  { id: 'PRACTICE_TEST', label: 'Luyện Tập (Practice)', icon: FileEdit },
                  { id: 'LESSON_QUIZ', label: 'Bài Học', icon: BookOpen },
                  { id: 'DIAGNOSTIC_TEST', label: 'Chẩn Đoán', icon: Target },
                ].map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => setFilterQuizType(tp.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      filterQuizType === tp.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tp.icon && <tp.icon className="w-3 h-3 shrink-0" />}
                    <span>{tp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Search & Category Strip */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tiêu đề hoặc nội dung bài thi IELTS..."
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {/* IELTS & English Category Pills */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
                {[
                  { id: 'ALL', label: 'Tất cả IELTS & Tiếng Anh' },
                  { id: 'IELTS', label: 'IELTS 4 Kỹ Năng' },
                  { id: 'ENGLISH', label: 'General English' },
                  { id: 'BUSINESS', label: 'Business English' },
                  { id: 'KIDS', label: 'Kids English' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilterCategory(c.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      filterCategory === c.id
                        ? 'bg-sky-100 text-primary border border-sky-200 font-black'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mock Tests Table */}
          <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-line text-slate-400 font-black uppercase text-[10.5px]">
                    <tr>
                      <th className="py-3 px-4">Tên Bài Quiz / Đề Thi</th>
                      <th className="py-3 px-4">Phân Hệ & Khóa Học</th>
                      <th className="py-3 px-4">Loại Quiz</th>
                      <th className="py-3 px-4">Lĩnh Vực / Kỹ Năng</th>
                      <th className="py-3 px-4">Thời Gian</th>
                      <th className="py-3 px-4">Cấu Trúc Đề</th>
                      <th className="py-3 px-4">Số Câu</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredMockTests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                          Chưa có đề thi hoặc bài quiz nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredMockTests.map((t) => {
                        const isPersonalDev = ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(t.category || '');
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                              <div>{t.title}</div>
                              {t.description && (
                                <div className="text-[11px] text-muted font-normal line-clamp-1 mt-0.5">
                                  {t.description}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-black ${
                                  isPersonalDev ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                                }`}>
                                  {isPersonalDev ? <Compass className="w-3 h-3 shrink-0" /> : <Globe className="w-3 h-3 shrink-0" />}
                                  <span>{t.category || 'IELTS'}</span>
                                </span>
                                {t.courseTitle && (
                                  <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[140px] flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{t.courseTitle}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-black ${
                                t.quizType === 'SITUATION_QUIZ'
                                  ? 'bg-purple-100 text-purple-800'
                                  : t.quizType === 'FULL_MOCK_TEST'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {t.quizType === 'SITUATION_QUIZ' ? (
                                  <>
                                    <Target className="w-3 h-3 shrink-0" />
                                    <span>Tình Huống</span>
                                  </>
                                ) : t.quizType === 'FULL_MOCK_TEST' ? (
                                  <>
                                    <Trophy className="w-3 h-3 shrink-0" />
                                    <span>Thi Thử</span>
                                  </>
                                ) : t.quizType === 'LESSON_QUIZ' ? (
                                  <>
                                    <BookOpen className="w-3 h-3 shrink-0" />
                                    <span>Bài Học</span>
                                  </>
                                ) : (
                                  <>
                                    <FileEdit className="w-3 h-3 shrink-0" />
                                    <span>Luyện Tập</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                                {t.skill || 'Tổng hợp'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                              {t.timeLimitMinutes} phút
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {t.skill === 'READING'
                                  ? '3 Passages'
                                  : t.skill === 'LISTENING'
                                  ? '4 Sections'
                                  : t.skill === 'WRITING'
                                  ? '2 Tasks'
                                  : t.skill === 'SPEAKING'
                                  ? '3 Parts'
                                  : 'IELTS Standard'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                              {t.questionsCount} câu
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleEditMockTest(t)}
                                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs transition inline-flex items-center gap-1.5 border border-sky-200 shadow-xs"
                                title="Soạn nội dung đề và quản lý câu hỏi trực tiếp"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Soạn Đề & Câu Hỏi</span>
                              </button>
                              <button
                                onClick={() => handleDeleteMockTest(t.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                                title="Xóa đề thi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 3: IELTS WRITING AI REVIEW WORKFLOW                           */}
      {/* ========================================================================= */}
      {activeHubTab === 'writing' && (
        <div className="space-y-5">
          <div className="p-4 rounded-3xl bg-purple-50/70 border border-purple-200 text-purple-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black">
                  Quy Trình Phê Duyệt & Override Điểm AI IELTS Writing
                </h4>
                <p className="text-[11px] text-purple-800/90 mt-0.5">
                  Điểm AI chấm là bản nháp sơ bộ (Draft). Điểm chính thức chỉ gửi về học viên sau khi Thầy Đông bấm duyệt.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-black shrink-0">
              {writingSubmissions.length} bài nộp
            </span>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-line text-slate-400 font-black uppercase text-[10.5px]">
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
                  {writingSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        Hiện tại không có bài viết nào cần duyệt.
                      </td>
                    </tr>
                  ) : (
                    writingSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{sub.studentName}</p>
                          <p className="text-[11px] text-muted">{sub.studentEmail}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                          {sub.taskTitle}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-primary">
                            {sub.taskType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {sub.wordCount} từ
                        </td>
                        <td className="py-3.5 px-4 font-bold text-primary">
                          Band {sub.aiOverall.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                              sub.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {sub.status === 'APPROVED' ? 'Đã duyệt' : 'AI nháp'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenWritingReview(sub)}
                            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-2xs transition"
                          >
                            Xem & Sửa điểm
                          </button>
                          {sub.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleQuickApproveWriting(sub)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition"
                            >
                              Duyệt nhanh
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 3: SPEAKING AUDIO GRADING STUDIO                              */}
      {/* ========================================================================= */}
      {activeHubTab === 'speaking' && (
        <div className="space-y-6">
          {/* Audio Player Element */}
          <audio
            ref={audioPlayerRef}
            src={currentSpeakingSub?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoaded}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Audio Waveform, Player & 4 Criteria Grading */}
            <div className="lg:col-span-2 space-y-5">
              {/* Audio Playback Studio Box */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span>Studio Nghe & Chấm Điểm Audio Speaking</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {Math.floor(currentAudioTime)}s / {Math.floor(audioDuration)}s
                  </span>
                </div>

                {/* Sub info */}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {currentSpeakingSub?.prompt?.title || 'IELTS Speaking Part 2: Describe a memorable journey'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Học viên: <strong className="text-white">{currentSpeakingSub?.user?.fullName || 'Học viên'}</strong> (
                    {currentSpeakingSub?.user?.email || 'student@dong.edu.vn'})
                  </p>
                </div>

                {/* Simulated Audio Waveform Bar */}
                <div className="space-y-2">
                  <div className="h-14 bg-slate-800/80 rounded-2xl flex items-center justify-between px-3 gap-1 overflow-hidden">
                    {Array.from({ length: 48 }).map((_, idx) => {
                      const barPercent = Math.min(100, (idx / 48) * 100);
                      const isPlayed = (currentAudioTime / audioDuration) * 100 >= barPercent;
                      const randomHeight = ((idx * 17) % 70) + 25;
                      return (
                        <div
                          key={idx}
                          style={{ height: `${randomHeight}%` }}
                          className={`w-1 rounded-full transition-all ${
                            isPlayed ? 'bg-[#FFB547]' : 'bg-slate-700'
                          }`}
                        ></div>
                      );
                    })}
                  </div>

                  {/* Seekbar */}
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 100}
                    value={currentAudioTime}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      setCurrentAudioTime(t);
                      if (audioPlayerRef.current) audioPlayerRef.current.currentTime = t;
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#FFB547]"
                  />
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-12 h-12 rounded-2xl bg-[#FFB547] text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {isPlayingAudio ? 'Đang phát bản ghi' : 'Tạm dừng'}
                      </p>
                      <p className="text-[11px] text-slate-400">Web Audio API Player</p>
                    </div>
                  </div>

                  {/* Playback Speed selector */}
                  <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
                    {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-2 py-1 rounded-lg transition ${
                          playbackSpeed === speed
                            ? 'bg-[#FFB547] text-slate-950 font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4 Criteria Scoring Sliders */}
              <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Đánh Giá 4 Tiêu Chí Chuẩn IELTS Speaking
                    </h3>
                    <p className="text-xs text-muted">
                      Chấm thang điểm 1.0 - 9.0 (bước nhảy 0.5) theo chuẩn British Council / IDP.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted font-bold block">OVERALL BAND</span>
                    <span className="text-2xl font-black text-amber-500">
                      Band {currentSpeakingOverall.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Criteria 1: FC */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-extrabold text-slate-800">
                      <span>Fluency & Coherence (FC)</span>
                      <span className="text-primary font-mono text-sm">{scoreFC.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="9.0"
                      step="0.5"
                      value={scoreFC}
                      onChange={(e) => setScoreFC(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Criteria 2: LR */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-extrabold text-slate-800">
                      <span>Lexical Resource (LR)</span>
                      <span className="text-primary font-mono text-sm">{scoreSpeakingLR.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="9.0"
                      step="0.5"
                      value={scoreSpeakingLR}
                      onChange={(e) => setScoreSpeakingLR(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Criteria 3: GRA */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-extrabold text-slate-800">
                      <span>Grammar Range & Accuracy (GRA)</span>
                      <span className="text-primary font-mono text-sm">{scoreSpeakingGRA.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="9.0"
                      step="0.5"
                      value={scoreSpeakingGRA}
                      onChange={(e) => setScoreSpeakingGRA(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Criteria 4: PR */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-extrabold text-slate-800">
                      <span>Pronunciation (PR)</span>
                      <span className="text-primary font-mono text-sm">{scorePR.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="9.0"
                      step="0.5"
                      value={scorePR}
                      onChange={(e) => setScorePR(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Timestamp Comments Box */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      Nhận Xét Kèm Timestamp Thời Gian
                    </h4>
                    <span className="text-[11px] text-muted">
                      Bấm vào mốc giây để nghe lại đúng thời điểm
                    </span>
                  </div>

                  {/* Add comment input */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-2 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700">
                      {Math.floor(currentAudioTime)}s
                    </span>
                    <input
                      type="text"
                      value={newSpeakingComment}
                      onChange={(e) => setNewSpeakingComment(e.target.value)}
                      placeholder="Ví dụ: Lỗi phát âm âm đuôi /t/, cần nâng giọng..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpeakingComment}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                    >
                      + Thêm mốc
                    </button>
                  </div>

                  {/* Comment list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {speakingComments.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-line text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (audioPlayerRef.current) {
                                audioPlayerRef.current.currentTime = c.timeSeconds;
                                setCurrentAudioTime(c.timeSeconds);
                              }
                            }}
                            className="px-2 py-0.5 rounded bg-sky-100 text-primary font-mono font-bold hover:bg-sky-200 transition"
                          >
                            {c.timeSeconds}s
                          </button>
                          <span className="text-slate-800">{c.text}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSpeakingComments((prev) => prev.filter((x) => x.id !== c.id))}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Teacher Feedback */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhận xét tổng thể của Thầy Đông
                  </label>
                  <textarea
                    rows={3}
                    value={speakingFeedback}
                    onChange={(e) => setSpeakingFeedback(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs text-slate-800 font-medium"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSubmitSpeakingGrade}
                    disabled={submittingSpeaking}
                    className="px-6 py-2.5 rounded-xl bg-[#FFB547] hover:bg-[#FFA726] text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2"
                  >
                    {submittingSpeaking && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>Lưu & Phát Hành Điểm Speaking</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Submissions Playlist */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-line p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Danh Sách Bài Nộp Audio ({speakingSubmissions.length})
                  </h3>
                  <button
                    onClick={fetchSpeakingSubmissions}
                    className="p-1 text-slate-400 hover:text-primary rounded"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[580px] overflow-y-auto">
                  {speakingSubmissions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      Chưa có bản ghi Speaking nào từ học viên.
                    </p>
                  ) : (
                    speakingSubmissions.map((s) => {
                      const isSelected = s.id === selectedSpeakingId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSpeakingId(s.id)}
                          className={`p-3 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                            isSelected
                              ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                              : 'bg-white border-line hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900">
                              {s.user?.fullName || 'Học viên'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (s as any).status === 'GRADED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800 animate-pulse'
                              }`}
                            >
                              {(s as any).status === 'GRADED' ? 'Đã chấm' : 'Chưa chấm'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            {s.prompt?.title || 'IELTS Speaking Topic'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                            <span>{s.durationSeconds ? `${s.durationSeconds}s` : '120s'}</span>
                            <span>{new Date(s.submittedAt || s.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN CAMBRIDGE ASSESSMENT AUTHORING STUDIO                          */}
      {/* ========================================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4 md:p-6">
          <div className="bg-white rounded-3xl w-full max-w-[96vw] h-[95vh] shadow-2xl border border-line flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* 1. FIXED STUDIO HEADER */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-line bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-primary flex items-center justify-center font-bold shrink-0">
                  {testFormData.skill === 'READING' ? (
                    <BookOpen className="w-5 h-5" />
                  ) : testFormData.skill === 'LISTENING' ? (
                    <Headphones className="w-5 h-5" />
                  ) : testFormData.skill === 'WRITING' ? (
                    <FileEdit className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-primary border border-sky-200">
                      Cambridge Assessment Studio
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Band 0 - 9.0 (Không điểm sàn %)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {testSections.length} Phần thi chuẩn
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate max-w-2xl mt-0.5">
                    {editingTestId
                      ? `Studio Chỉnh Sửa: ${testFormData.title || 'Đề Thi Cambridge'}`
                      : 'Studio Soạn Thảo Đề Thi Chuẩn Cambridge IELTS Mới'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSaveMockTest(undefined, true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Lưu Thông Tin Đề
                </button>
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE STUDIO BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/60">
              {/* BLOCK 1: TEST METADATA & CONFIGURATION */}
              <div className="bg-white rounded-2xl border border-line p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    1. Cấu Hình Cơ Bản Đề Thi
                  </h4>
                  <span className="text-[11px] text-muted font-medium">
                    Tùy chỉnh phân hệ và kỹ năng sẽ tự động thiết lập thời lượng và các phần thi tương ứng
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <CustomSelect
                    label="Phân hệ đào tạo *"
                    value={testFormData.category}
                    onChange={(val) => {
                      const domainOpts = getDomainOptions(val);
                      const newSkill = domainOpts[0]?.value || 'READING';
                      const newSecs = getDefaultSectionsForSkill(newSkill);
                      setTestSections(newSecs);
                      setActiveSectionPart(1);
                      setTestFormData({
                        ...testFormData,
                        category: val,
                        track: 'ENGLISH',
                        skill: newSkill,
                        timeLimitMinutes: newSkill === 'READING' ? 60 : newSkill === 'LISTENING' ? 40 : 60,
                      });
                    }}
                    options={[
                      { value: 'IELTS', label: 'IELTS Master (Academic & General)' },
                      { value: 'ENGLISH', label: 'General English (Giao tiếp & Ngữ pháp)' },
                      { value: 'BUSINESS', label: 'Business English (Thương mại)' },
                      { value: 'KIDS', label: 'Kids English (Thiếu nhi)' },
                    ]}
                  />

                  <CustomSelect
                    label="Kỹ năng khảo thí (Skill) *"
                    value={testFormData.skill}
                    onChange={(val) => {
                      const newSecs = getDefaultSectionsForSkill(val);
                      setTestSections(newSecs);
                      setActiveSectionPart(1);
                      setTestFormData({
                        ...testFormData,
                        skill: val,
                        timeLimitMinutes:
                          val === 'READING' ? 60 : val === 'LISTENING' ? 40 : val === 'SPEAKING' ? 15 : 60,
                      });
                    }}
                    options={getDomainOptions(testFormData.category)}
                  />

                  <CustomSelect
                    label="Loại bài thi (Test Type) *"
                    value={testFormData.quizType}
                    onChange={(val) => setTestFormData({ ...testFormData, quizType: val })}
                    options={[
                      { value: 'FULL_MOCK_TEST', label: 'Đề Thi Thử Hoàn Chỉnh (Full Mock Test chuẩn Cambridge)' },
                      { value: 'PRACTICE_TEST', label: 'Luyện tập chuyên đề / Mini-Test' },
                      { value: 'LESSON_QUIZ', label: 'Trắc nghiệm củng cố bài học' },
                      { value: 'DIAGNOSTIC_TEST', label: 'Bài đánh giá chẩn đoán năng lực đầu vào' },
                    ]}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời lượng làm bài (Phút) *
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      required
                      value={testFormData.timeLimitMinutes}
                      onChange={(e) =>
                        setTestFormData({ ...testFormData, timeLimitMinutes: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tiêu đề bài thi IELTS / Quiz <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={testFormData.title}
                      onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                      placeholder={
                        testFormData.skill === 'LISTENING'
                          ? 'Ví dụ: Cambridge IELTS 20 - Listening Test 1: Brookside Farm'
                          : testFormData.skill === 'WRITING'
                          ? 'Ví dụ: Cambridge IELTS 20 - Academic Writing Test 1'
                          : testFormData.skill === 'SPEAKING'
                          ? 'Ví dụ: IELTS Speaking Full Test: Technology & Daily Life'
                          : 'Ví dụ: Cambridge IELTS 20 - Academic Reading Test 1: Urban Microclimates'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <CustomSelect
                    label="Khóa học áp dụng (Tùy chọn)"
                    value={testFormData.courseId}
                    onChange={(val) => setTestFormData({ ...testFormData, courseId: val })}
                    options={[
                      { value: '', label: '-- Áp dụng chung toàn phân hệ --' },
                      ...coursesList
                        .filter((c) => c.category === testFormData.category || !c.category)
                        .map((c) => ({
                          value: c.id,
                          label: c.title,
                        })),
                    ]}
                  />
                </div>
              </div>

              {/* BLOCK 2: SECTION ARCHITECTURE NAVIGATOR TABS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {testSections.map((sec) => {
                  const partCount = studioQuestions.filter(
                    (q) => q.part === sec.part || (!q.part && sec.part === 1)
                  ).length;
                  const isActive = activeSectionPart === sec.part;

                  return (
                    <button
                      key={sec.part}
                      type="button"
                      onClick={() => setActiveSectionPart(sec.part)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 whitespace-nowrap border ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-slate-700 border-line hover:bg-slate-100'
                      }`}
                    >
                      <span>{sec.title?.split(':')[0] || `Phần ${sec.part}`}</span>
                      {sec.questionRange && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {sec.questionRange}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-white text-primary' : 'bg-sky-100 text-primary'
                        }`}
                      >
                        {partCount} câu
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* BLOCK 3: SIDE-BY-SIDE STUDIO WORKSPACE (CONTENT ON LEFT, QUESTIONS ON RIGHT) */}
              {testSections
                .filter((sec) => sec.part === activeSectionPart)
                .map((sec) => {
                  const partQuestions = studioQuestions.filter(
                    (q) => q.part === sec.part || (!q.part && sec.part === 1)
                  );

                  return (
                    <div key={sec.part} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      {/* LEFT COLUMN: DIGITAL LEARNING MATERIAL & SECTION MEDIA (7 Cols) */}
                      <div className="lg:col-span-7 bg-white rounded-2xl border border-line p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-line pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-sky-100 text-primary flex items-center justify-center font-bold text-xs">
                              {sec.part}
                            </span>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                              Nội Dung Học Liệu: {sec.title?.split(':')[0] || `Phần ${sec.part}`}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 font-bold">
                            {sec.questionRange || `Part ${sec.part}`}
                          </span>
                        </div>

                        {/* Section Title & Range */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tiêu đề phần ({sec.questionRange || `Part ${sec.part}`}) *
                            </label>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => updateActiveSection('title', e.target.value)}
                              placeholder="Ví dụ: Passage 1: Urban Microclimates and Resilient Cities"
                              className="w-full px-3 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Phạm vi câu hỏi
                            </label>
                            <input
                              type="text"
                              value={sec.questionRange || ''}
                              onChange={(e) => updateActiveSection('questionRange', e.target.value)}
                              placeholder="Ví dụ: Questions 1 - 13"
                              className="w-full px-3 py-2 rounded-xl border border-line text-xs font-mono font-bold text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Instructions */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chỉ dẫn làm bài của phần này (Instructions)
                          </label>
                          <input
                            type="text"
                            value={sec.instructions || ''}
                            onChange={(e) => updateActiveSection('instructions', e.target.value)}
                            placeholder="Ví dụ: Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer."
                            className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* SKILL: READING -> RichText Passage & Diagram Image */}
                        {testFormData.skill === 'READING' && (
                          <div className="space-y-3 pt-1 border-t border-line">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                  <span>Ảnh sơ đồ / biểu đồ minh họa đoạn đọc (Tùy chọn)</span>
                                </label>
                                {sec.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => updateActiveSection('imageUrl', '')}
                                    className="text-[11px] text-red-500 hover:underline"
                                  >
                                    Xóa ảnh
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={sec.imageUrl || ''}
                                onChange={(e) => updateActiveSection('imageUrl', e.target.value)}
                                placeholder="https://.../diagram.jpg (Sơ đồ kiến trúc, bản vẽ máy móc đi kèm bài đọc)"
                                className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                              />
                              {sec.imageUrl && (
                                <div className="mt-2 p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                                  <img
                                    src={sec.imageUrl}
                                    alt="Diagram preview"
                                    className="h-16 w-24 object-cover rounded-lg border border-line"
                                  />
                                  <div className="text-[11px] text-slate-600">
                                    <span className="font-bold text-emerald-600">✓ Đã nạp ảnh sơ đồ</span>
                                    <p className="text-slate-400 truncate max-w-sm">{sec.imageUrl}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <RichTextEditor
                              label={`Nội dung đoạn văn đọc hiểu (${sec.title?.split(':')[0] || `Passage ${sec.part}`})`}
                              value={sec.passage || ''}
                              onChange={(val) => updateActiveSection('passage', val)}
                              placeholder="Dán hoặc nhập nội dung bài đọc Cambridge IELTS (Paragraph A, B, C, D...)..."
                              minHeight="min-h-[220px]"
                              helperText="Định dạng rõ ràng các đoạn A, B, C, D để học viên dễ tra cứu và làm bài."
                            />
                          </div>
                        )}

                        {/* SKILL: LISTENING -> Audio URL Player & Map Diagram Image */}
                        {testFormData.skill === 'LISTENING' && (
                          <div className="space-y-3 pt-1 border-t border-line">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                <Volume2 className="w-3.5 h-3.5 text-primary" />
                                <span>URL File Audio / File nghe Section này *</span>
                              </label>
                              <input
                                type="text"
                                value={sec.audioUrl || ''}
                                onChange={(e) => updateActiveSection('audioUrl', e.target.value)}
                                placeholder="https://res.cloudinary.com/.../listening_section.mp3"
                                className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                              />
                              {sec.audioUrl && (
                                <div className="mt-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-3">
                                  <audio controls src={sec.audioUrl} className="w-full sm:w-80 h-9 rounded-lg" />
                                  <span className="text-[11px] text-emerald-700 font-bold">
                                    ✓ Đã kết nối âm thanh Section {sec.part}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                  <span>
                                    Bản đồ sơ đồ (Map / Diagram Labeling - Đặc biệt quan trọng ở Section 2)
                                  </span>
                                </label>
                                {sec.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => updateActiveSection('imageUrl', '')}
                                    className="text-[11px] text-red-500 hover:underline"
                                  >
                                    Xóa sơ đồ
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={sec.imageUrl || ''}
                                onChange={(e) => updateActiveSection('imageUrl', e.target.value)}
                                placeholder="https://.../map_layout.jpg (Bản đồ có các vị trí ký hiệu A-H để học viên nghe và chọn)"
                                className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                              />
                              {sec.imageUrl && (
                                <div className="mt-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                                  <img
                                    src={sec.imageUrl}
                                    alt="Map preview"
                                    className="h-24 w-36 object-cover rounded-lg border border-line shadow-xs"
                                  />
                                  <div className="text-[11px] text-slate-600">
                                    <span className="font-bold text-emerald-600">
                                      ✓ Đã nạp sơ đồ bản đồ Section {sec.part}
                                    </span>
                                    <p className="text-slate-400 truncate max-w-sm">{sec.imageUrl}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* SKILL: WRITING -> Task 1 & 2 */}
                        {testFormData.skill === 'WRITING' && (
                          <div className="space-y-3 pt-1 border-t border-line">
                            {sec.part === 1 && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                    <span>Ảnh biểu đồ / bản đồ / quy trình Task 1 (Chart Image URL) *</span>
                                  </label>
                                  {sec.imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => updateActiveSection('imageUrl', '')}
                                      className="text-[11px] text-red-500 hover:underline"
                                    >
                                      Xóa ảnh
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={sec.imageUrl || ''}
                                  onChange={(e) => updateActiveSection('imageUrl', e.target.value)}
                                  placeholder="https://.../ielts_task1_chart.png"
                                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                                />
                                {sec.imageUrl && (
                                  <div className="mt-2 p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                                    <img
                                      src={sec.imageUrl}
                                      alt="Task 1 Chart"
                                      className="h-24 w-36 object-cover rounded-lg border border-line shadow-xs"
                                    />
                                    <span className="text-[11px] text-emerald-600 font-bold">
                                      ✓ Đã nạp biểu đồ Task 1
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <RichTextEditor
                              label={`Đề bài yêu cầu (${sec.title?.split(':')[0] || `Task ${sec.part}`})`}
                              value={sec.passage || ''}
                              onChange={(val) => updateActiveSection('passage', val)}
                              placeholder="Nhập đề bài chi tiết (Ví dụ: The charts below show the percentage of...)"
                              minHeight="min-h-[160px]"
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Số từ tối thiểu quy định
                                </label>
                                <input
                                  type="number"
                                  value={sec.minWords || (sec.part === 1 ? 150 : 250)}
                                  onChange={(e) => updateActiveSection('minWords', Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Thời gian gợi ý (Phút)
                                </label>
                                <input
                                  type="number"
                                  value={sec.suggestedMinutes || (sec.part === 1 ? 20 : 40)}
                                  onChange={(e) => updateActiveSection('suggestedMinutes', Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-semibold"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SKILL: SPEAKING -> Part 1, 2, 3 */}
                        {testFormData.skill === 'SPEAKING' && (
                          <div className="space-y-3 pt-1 border-t border-line">
                            {sec.part === 2 ? (
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Thẻ gợi ý (Cue Card Topics & Bullet Points) *
                                </label>
                                <textarea
                                  rows={5}
                                  value={sec.cueCard || ''}
                                  onChange={(e) => updateActiveSection('cueCard', e.target.value)}
                                  placeholder="Describe an ambitious project you completed successfully.&#10;You should say:&#10;- What it was&#10;- Why you did it&#10;- What challenges you faced&#10;and explain how you felt when you achieved it."
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-mono font-medium focus:outline-none focus:border-primary"
                                ></textarea>
                                <p className="text-[11px] text-slate-400 mt-1">
                                  Học viên sẽ có 60 giây chuẩn bị và 120 giây nói liên tục có ghi âm giọng nói.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Danh sách câu hỏi gợi ý ({sec.part === 1 ? 'Part 1: Phỏng vấn' : 'Part 3: Thảo luận'})
                                </label>
                                <textarea
                                  rows={4}
                                  value={sec.instructions || ''}
                                  onChange={(e) => updateActiveSection('instructions', e.target.value)}
                                  placeholder="1. Do you prefer working individually or in a team?&#10;2. How has technology changed modern communication?"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                                ></textarea>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RIGHT COLUMN: INTEGRATED QUESTIONS MANAGER FOR THIS PART (5 Cols) */}
                      <div className="lg:col-span-5 space-y-4">
                        {/* FORM: ADD QUESTION SPECIFICALLY FOR THIS PART */}
                        <form
                          onSubmit={handleSaveStudioQuestion}
                          className="bg-white rounded-2xl border border-line p-5 shadow-xs space-y-3.5"
                        >
                          <div className="flex items-center justify-between border-b border-line pb-2.5">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-primary" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Thêm Câu Hỏi Cho {sec.title?.split(':')[0] || `Phần ${sec.part}`}
                              </h4>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-primary font-bold">
                              Part {sec.part}
                            </span>
                          </div>

                          {/* Question Type Selector */}
                          <CustomSelect
                            label="Dạng bài khảo thí *"
                            value={studioQuestionForm.type}
                            onChange={(val) => {
                              let defaultAns = 'TRUE';
                              if (val === 'YES_NO_NOT_GIVEN') defaultAns = 'YES';
                              if (val === 'MAP_DIAGRAM_LABELING') defaultAns = 'A';
                              if (val === 'SINGLE_CHOICE') defaultAns = 'A';
                              if (val === 'MATCHING_HEADINGS') defaultAns = 'i';
                              setStudioQuestionForm({
                                ...studioQuestionForm,
                                type: val,
                                correctAnswer: defaultAns,
                              });
                            }}
                            options={
                              testFormData.skill === 'READING'
                                ? [
                                    { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given' },
                                    { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given' },
                                    { value: 'MATCHING_HEADINGS', label: 'Matching Headings (Nối tiêu đề đoạn i-viii)' },
                                    { value: 'FILL_BLANK', label: 'Summary / Sentence Completion (Điền từ)' },
                                    { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm đơn (Single Choice A-D)' },
                                    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án (Multiple Choice)' },
                                  ]
                                : testFormData.skill === 'LISTENING'
                                ? [
                                    { value: 'MAP_DIAGRAM_LABELING', label: 'Gán nhãn sơ đồ / bản đồ (Map Labeling A-H)' },
                                    { value: 'FILL_BLANK', label: 'Form / Note Completion (Điền từ)' },
                                    { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm đơn (Single Choice A-D)' },
                                    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án (Multiple Choice)' },
                                  ]
                                : [
                                    { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm (Single Choice)' },
                                    { value: 'FILL_BLANK', label: 'Điền từ / Tự luận ngắn' },
                                  ]
                            }
                          />

                          {/* Group Prompt (Optional) */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Chỉ dẫn nhóm câu hỏi (Group Prompt - Tùy chọn)
                            </label>
                            <input
                              type="text"
                              value={studioQuestionForm.groupPrompt}
                              onChange={(e) =>
                                setStudioQuestionForm({ ...studioQuestionForm, groupPrompt: e.target.value })
                              }
                              placeholder="Ví dụ: Questions 1 - 5: Do the following statements agree..."
                              className="w-full px-3 py-1.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                            />
                          </div>

                          {/* Question Text */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Nội dung câu hỏi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={studioQuestionForm.questionText}
                              onChange={(e) =>
                                setStudioQuestionForm({ ...studioQuestionForm, questionText: e.target.value })
                              }
                              placeholder={
                                studioQuestionForm.type === 'MAP_DIAGRAM_LABELING'
                                  ? 'Ví dụ: Q11. Visitor Information Center'
                                  : 'Ví dụ: The temperature in concrete surfaces exceeds rural baselines.'
                              }
                              className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                            ></textarea>
                          </div>

                          {/* TAILORED ANSWER KEY INPUT ACCORDING TO QUESTION TYPE */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                              Đáp Án Đúng Chuẩn Xác
                            </label>

                            {/* DẠNG 1: TRUE_FALSE_NOT_GIVEN */}
                            {studioQuestionForm.type === 'TRUE_FALSE_NOT_GIVEN' && (
                              <div className="grid grid-cols-3 gap-2">
                                {['TRUE', 'FALSE', 'NOT GIVEN'].map((ans) => (
                                  <button
                                    key={ans}
                                    type="button"
                                    onClick={() =>
                                      setStudioQuestionForm({ ...studioQuestionForm, correctAnswer: ans })
                                    }
                                    className={`py-2 rounded-xl font-black text-xs transition border ${
                                      studioQuestionForm.correctAnswer === ans
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-line hover:bg-slate-100'
                                    }`}
                                  >
                                    {ans}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* DẠNG 2: YES_NO_NOT_GIVEN */}
                            {studioQuestionForm.type === 'YES_NO_NOT_GIVEN' && (
                              <div className="grid grid-cols-3 gap-2">
                                {['YES', 'NO', 'NOT GIVEN'].map((ans) => (
                                  <button
                                    key={ans}
                                    type="button"
                                    onClick={() =>
                                      setStudioQuestionForm({ ...studioQuestionForm, correctAnswer: ans })
                                    }
                                    className={`py-2 rounded-xl font-black text-xs transition border ${
                                      studioQuestionForm.correctAnswer === ans
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-line hover:bg-slate-100'
                                    }`}
                                  >
                                    {ans}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* DẠNG 3: MAP_DIAGRAM_LABELING (A to H) */}
                            {studioQuestionForm.type === 'MAP_DIAGRAM_LABELING' && (
                              <div>
                                <p className="text-[11px] text-slate-500 mb-2">
                                  Chọn chữ cái vị trí đúng trên bản đồ/sơ đồ cho câu hỏi này:
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => (
                                    <button
                                      key={letter}
                                      type="button"
                                      onClick={() =>
                                        setStudioQuestionForm({ ...studioQuestionForm, correctAnswer: letter })
                                      }
                                      className={`py-2 rounded-xl font-black text-xs transition border ${
                                        studioQuestionForm.correctAnswer === letter
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                          : 'bg-white text-slate-700 border-line hover:bg-slate-100'
                                      }`}
                                    >
                                      {letter}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* DẠNG 4: MATCHING_HEADINGS (i to viii) */}
                            {studioQuestionForm.type === 'MATCHING_HEADINGS' && (
                              <div>
                                <p className="text-[11px] text-slate-500 mb-2">
                                  Chọn số La Mã tiêu đề phù hợp (Heading):
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                                  {['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'].map((num) => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() =>
                                        setStudioQuestionForm({ ...studioQuestionForm, correctAnswer: num })
                                      }
                                      className={`py-2 rounded-xl font-mono font-black text-xs transition border ${
                                        studioQuestionForm.correctAnswer === num
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                          : 'bg-white text-slate-700 border-line hover:bg-slate-100'
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* DẠNG 5: FILL_BLANK */}
                            {(studioQuestionForm.type === 'FILL_BLANK' ||
                              studioQuestionForm.type === 'NOTE_COMPLETION' ||
                              studioQuestionForm.type === 'FORM_COMPLETION') && (
                              <div>
                                <input
                                  type="text"
                                  value={studioQuestionForm.fillBlankAnswers}
                                  onChange={(e) =>
                                    setStudioQuestionForm({ ...studioQuestionForm, fillBlankAnswers: e.target.value })
                                  }
                                  placeholder="Ví dụ: solar panels / solar energy (Dùng dấu / nếu có nhiều đáp án)"
                                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Hệ thống tự động bỏ qua viết hoa/thường khi chấm điểm.
                                </p>
                              </div>
                            )}

                            {/* DẠNG 6: SINGLE_CHOICE / ABCD */}
                            {studioQuestionForm.type === 'SINGLE_CHOICE' && (
                              <div className="space-y-2">
                                {[
                                  { key: 'A', field: 'optionA' },
                                  { key: 'B', field: 'optionB' },
                                  { key: 'C', field: 'optionC' },
                                  { key: 'D', field: 'optionD' },
                                ].map((opt) => (
                                  <div key={opt.key} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setStudioQuestionForm({ ...studioQuestionForm, correctAnswer: opt.key })
                                      }
                                      className={`w-7 h-7 rounded-lg text-xs font-black shrink-0 transition border ${
                                        studioQuestionForm.correctAnswer === opt.key
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-white text-slate-600 border-line hover:bg-slate-100'
                                      }`}
                                    >
                                      {opt.key}
                                    </button>
                                    <input
                                      type="text"
                                      value={(studioQuestionForm as any)[opt.field]}
                                      onChange={(e) =>
                                        setStudioQuestionForm({
                                          ...studioQuestionForm,
                                          [opt.field]: e.target.value,
                                        })
                                      }
                                      placeholder={`Nội dung lựa chọn ${opt.key}`}
                                      className="flex-1 px-3 py-1.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Submit Add Question Button */}
                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/20 transition flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Thêm Câu Hỏi Này Vào Phần {sec.part}</span>
                          </button>
                        </form>

                        {/* LIST: EXISTING QUESTIONS IN THIS PART */}
                        <div className="bg-white rounded-2xl border border-line p-5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-line pb-2.5">
                            <div className="flex items-center gap-2">
                              <ListChecks className="w-4 h-4 text-slate-500" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Danh Sách Câu Hỏi Đã Tạo ({partQuestions.length})
                              </h4>
                            </div>
                            <span className="text-[11px] text-muted font-mono font-bold">
                              Part {sec.part}
                            </span>
                          </div>

                          {isLoadingStudioQuestions ? (
                            <div className="py-6 text-center text-xs text-muted">
                              Đang tải danh sách câu hỏi...
                            </div>
                          ) : partQuestions.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400">
                              Chưa có câu hỏi nào trong phần này. Sử dụng form phía trên để thêm câu hỏi đầu tiên!
                            </div>
                          ) : (
                            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                              {partQuestions.map((q: any, idx: number) => {
                                const correctAns = Array.isArray(q.options)
                                  ? q.options
                                      .filter((o: any) => o.isCorrect)
                                      .map((o: any) => o.content)
                                      .join(' / ') || 'A'
                                  : 'A';

                                return (
                                  <div
                                    key={q.id || idx}
                                    className="p-3 rounded-xl border border-line bg-slate-50 hover:bg-white hover:border-slate-300 transition space-y-1.5 group"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-mono font-black text-[10px] flex items-center justify-center">
                                          #{idx + 1}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-primary">
                                          {q.type}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStudioQuestion(q.id)}
                                        className="text-slate-300 hover:text-red-500 transition p-1 rounded-md"
                                        title="Xóa câu hỏi"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {q.groupPrompt && (
                                      <p className="text-[10.5px] font-medium text-slate-500 italic truncate">
                                        {q.groupPrompt}
                                      </p>
                                    )}

                                    <p className="text-xs font-bold text-slate-800 line-clamp-2">
                                      {q.content || q.questionText}
                                    </p>

                                    <div className="pt-1 flex items-center gap-2">
                                      <span className="text-[10px] font-black text-slate-400 uppercase">
                                        Đáp án đúng:
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md font-mono font-black text-[11px] bg-emerald-100 text-emerald-800">
                                        ✓ {correctAns}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* 3. FIXED STUDIO FOOTER */}
            <div className="px-6 py-3.5 border-t border-line bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mọi thay đổi câu hỏi được lưu trực tiếp vào cơ sở dữ liệu</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Đóng Studio
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveMockTest(e, false)}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-black text-xs shadow-md shadow-primary/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTestId ? 'Lưu Thay Đổi Đề Thi' : 'Hoàn Tất Tạo Đề Thi'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT QUESTION TO MOCK TEST (CAMBRIDGE ACCURATE TYPES)        */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                  Ngân hàng câu hỏi
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Thêm Câu Hỏi Chuẩn Cambridge IELTS
                </h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Target Quiz & Part Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <CustomSelect
                  label="1. Đề thi áp dụng *"
                  value={qFormData.targetQuizId}
                  onChange={(val) => {
                    const selectedQuiz = mockTests.find((t) => t.id === val);
                    const qSkill = selectedQuiz?.skill || 'READING';
                    setQFormData({
                      ...qFormData,
                      targetQuizId: val,
                      skill: qSkill,
                      type: qSkill === 'READING' ? 'TRUE_FALSE_NOT_GIVEN' : 'SINGLE_CHOICE',
                    });
                  }}
                  options={mockTests.map((t) => ({
                    value: t.id,
                    label: t.title,
                    sublabel: `${t.skill} • ${t.timeLimitMinutes}m`,
                  }))}
                />

                <CustomSelect
                  label="2. Phần / Đoạn văn (Part) *"
                  value={String(qFormData.part)}
                  onChange={(val) => setQFormData({ ...qFormData, part: Number(val) })}
                  options={
                    qFormData.skill === 'READING'
                      ? [
                          { value: '1', label: 'Passage 1 (Questions 1 - 13)' },
                          { value: '2', label: 'Passage 2 (Questions 14 - 26)' },
                          { value: '3', label: 'Passage 3 (Questions 27 - 40)' },
                        ]
                      : qFormData.skill === 'LISTENING'
                      ? [
                          { value: '1', label: 'Section 1: Đàm thoại xã hội (Q1 - 10)' },
                          { value: '2', label: 'Section 2: Độc thoại & Bản đồ Map (Q11 - 20)' },
                          { value: '3', label: 'Section 3: Thảo luận học thuật (Q21 - 30)' },
                          { value: '4', label: 'Section 4: Bài giảng đại học (Q31 - 40)' },
                        ]
                      : [
                          { value: '1', label: 'Phần 1' },
                          { value: '2', label: 'Phần 2' },
                          { value: '3', label: 'Phần 3' },
                        ]
                  }
                />
              </div>

              {/* Question Type */}
              <CustomSelect
                label="3. Dạng bài câu hỏi (Question Type) *"
                value={qFormData.type}
                onChange={(val) => {
                  let defaultAns = 'A';
                  if (val === 'TRUE_FALSE_NOT_GIVEN') defaultAns = 'TRUE';
                  else if (val === 'YES_NO_NOT_GIVEN') defaultAns = 'YES';
                  else if (val === 'MAP_DIAGRAM_LABELING') defaultAns = 'A';
                  setQFormData({ ...qFormData, type: val, correctAnswer: defaultAns });
                }}
                options={[
                  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given (Reading Cambridge)' },
                  { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given (Reading Cambridge)' },
                  { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm 4 lựa chọn (A, B, C, D)' },
                  { value: 'MAP_DIAGRAM_LABELING', label: 'Gán nhãn bản đồ / sơ đồ (Map & Plan Labeling A - H)' },
                  { value: 'FILL_BLANK', label: 'Điền từ vào chỗ trống (Sentence / Note / Form Completion)' },
                ]}
              />

              {/* Group Prompt (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chỉ dẫn nhóm câu hỏi (Group Prompt - Tùy chọn)
                </label>
                <input
                  type="text"
                  value={qFormData.groupPrompt}
                  onChange={(e) => setQFormData({ ...qFormData, groupPrompt: e.target.value })}
                  placeholder="Ví dụ: Questions 1-5: Do the following statements agree with the information given in Passage 1?"
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {/* Image URL & Preview (for Map / Diagram) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Ảnh sơ đồ / Bản đồ Map Labeling (Tùy chọn)</span>
                  </label>
                  {qFormData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setQFormData({ ...qFormData, imageUrl: '' })}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={qFormData.imageUrl}
                  onChange={(e) => setQFormData({ ...qFormData, imageUrl: e.target.value })}
                  placeholder="https://.../map_image.jpg (Hiển thị bản đồ để học viên nhìn và chọn vị trí A-H)"
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                />
                {qFormData.imageUrl && (
                  <div className="mt-2 p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    <img
                      src={qFormData.imageUrl}
                      alt="Question map preview"
                      className="h-16 w-24 object-cover rounded-lg border border-line"
                    />
                    <span className="text-[11px] text-emerald-600 font-bold">✓ Đã nạp ảnh câu hỏi</span>
                  </div>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={qFormData.questionText}
                  onChange={(e) => setQFormData({ ...qFormData, questionText: e.target.value })}
                  placeholder={
                    qFormData.type === 'FILL_BLANK'
                      ? 'Ví dụ: Sustainable smart buildings utilize specialized ______ windows for insulation.'
                      : qFormData.type === 'MAP_DIAGRAM_LABELING'
                      ? 'Ví dụ: 11. Visitor Information Center'
                      : 'Ví dụ: According to paragraph 2, what is the main reason for...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              {/* Dynamic Answer Key Selector according to Type */}
              {qFormData.type === 'TRUE_FALSE_NOT_GIVEN' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chọn đáp án đúng chuẩn Cambridge <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQFormData({ ...qFormData, correctAnswer: opt })}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-black transition ${
                          qFormData.correctAnswer === opt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-line hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : qFormData.type === 'YES_NO_NOT_GIVEN' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chọn đáp án đúng chuẩn Cambridge <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['YES', 'NO', 'NOT GIVEN'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQFormData({ ...qFormData, correctAnswer: opt })}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-black transition ${
                          qFormData.correctAnswer === opt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-line hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : qFormData.type === 'MAP_DIAGRAM_LABELING' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chọn ký hiệu vị trí đúng trên bản đồ (A - H) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setQFormData({ ...qFormData, correctAnswer: letter })}
                        className={`py-2 px-1 rounded-xl border text-xs font-black transition text-center ${
                          qFormData.correctAnswer === letter
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                            : 'bg-slate-50 text-slate-700 border-line hover:bg-slate-100'
                        }`}
                      >
                        Vị trí {letter}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Học viên sẽ đối chiếu chữ cái này với các điểm mốc được in trên sơ đồ bản đồ.
                  </p>
                </div>
              ) : qFormData.type === 'FILL_BLANK' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Từ khóa đáp án đúng (Chấp nhận nhiều phương án, ngăn cách bằng dấu /) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={qFormData.fillBlankAnswers}
                    onChange={(e) => setQFormData({ ...qFormData, fillBlankAnswers: e.target.value })}
                    placeholder="Ví dụ: lithium-ion / solar / storage battery"
                    className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hệ thống sẽ đối chiếu tự động không phân biệt chữ hoa/thường khi học viên nộp bài.
                  </p>
                </div>
              ) : (
                /* Standard 4 Options MCQ */
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      4 Phương án lựa chọn (A, B, C, D) <span className="text-red-500">*</span>
                    </label>
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                      const key = `option${letter}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
                      return (
                        <div key={letter} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">
                            {letter}
                          </span>
                          <input
                            type="text"
                            required
                            value={qFormData[key]}
                            onChange={(e) => setQFormData({ ...qFormData, [key]: e.target.value })}
                            placeholder={`Nội dung lựa chọn ${letter}...`}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-line text-xs font-medium"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đáp án chuẩn xác <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                        <label
                          key={letter}
                          className={`flex-1 p-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition ${
                            qFormData.correctAnswer === letter
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs font-black'
                              : 'bg-white border-line text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={letter}
                            checked={qFormData.correctAnswer === letter}
                            onChange={() => setQFormData({ ...qFormData, correctAnswer: letter })}
                            className="hidden"
                          />
                          <span>Đáp án {letter}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giải thích chi tiết (Hiện sau khi nộp bài)
                </label>
                <textarea
                  rows={2}
                  value={qFormData.explanation}
                  onChange={(e) => setQFormData({ ...qFormData, explanation: e.target.value })}
                  placeholder="Trích dẫn câu/đoạn chứng minh hoặc giải thích bối cảnh đáp án..."
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-medium"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-line flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-black text-xs shadow-md shadow-primary/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Câu Hỏi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* MODAL: WRITING REVIEW & SCORE OVERRIDE                                    */}
      {/* ========================================================================= */}
      {activeWritingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Phê Duyệt Bài Viết: {activeWritingReview.studentName}
                </h3>
                <p className="text-xs text-muted">
                  {activeWritingReview.taskTitle} ({activeWritingReview.taskType}) • {activeWritingReview.wordCount} từ
                </p>
              </div>
              <button
                onClick={() => setActiveWritingReview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Essay Content */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto text-xs leading-relaxed font-serif text-slate-800">
              {activeWritingReview.essayText}
            </div>

            {/* 4 Criteria Scores */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Chỉnh Sửa 4 Tiêu Chí Chấm Điểm
                </h4>
                <span className="text-sm font-black text-primary">
                  Overall Band {currentWritingOverall.toFixed(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Task Response', val: scoreTR, set: setScoreTR },
                  { label: 'Coherence', val: scoreCC, set: setScoreCC },
                  { label: 'Lexical', val: scoreLR, set: setScoreLR },
                  { label: 'Grammar', val: scoreGRA, set: setScoreGRA },
                ].map((item) => (
                  <div key={item.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-600 block">{item.label}</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="9.0"
                      value={item.val}
                      onChange={(e) => item.set(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-line text-xs font-mono font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Feedback */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lời phê duyệt của Thầy Đông
              </label>
              <textarea
                rows={3}
                value={writingFeedback}
                onChange={(e) => setWritingFeedback(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-line text-xs"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setActiveWritingReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
              <button
                onClick={handleApproveAndPublishWriting}
                disabled={submittingWritingApproval}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                {submittingWritingApproval && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Phê Duyệt & Phát Hành Điểm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-muted">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-xs font-bold">Đang tải Trung Tâm Khảo Thí & Đánh Giá Năng Lực...</p>
        </div>
      }
    >
      <AssessmentHubContent />
    </Suspense>
  );
}
