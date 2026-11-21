'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
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
} from 'lucide-react';

// ==========================================
// INTERFACES
// ==========================================

// Mock Test & Quiz Interfaces
interface QuizQuestion {
  id: string;
  quizId?: string;
  quizTitle?: string;
  skill: string;
  type?: string;
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
  timeLimitMinutes?: number;
  passScore?: number;
  passage?: string;
  audioUrl?: string;
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
    if (tabParam === 'writing' || tabParam === 'speaking' || tabParam === 'mocktest') {
      setActiveHubTab(tabParam);
    }
  }, [tabParam]);

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
  const [quizSubTab, setQuizSubTab] = useState<'tests' | 'questions'>('tests');
  const [mockTests, setMockTests] = useState<MockTestItem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizSearch, setQuizSearch] = useState('');
  const [filterTrack, setFilterTrack] = useState<'ALL' | 'ENGLISH' | 'PERSONAL_DEV'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterQuizType, setFilterQuizType] = useState<string>('ALL');
  const [filterSkill, setFilterSkill] = useState<string>('ALL');

  // Helper Domain / Skill options per Category
  const getDomainOptions = (cat: string) => {
    switch (cat) {
      case 'PEDAGOGY':
        return [
          { value: 'TEACHING_METHOD', label: 'Phương pháp Giảng dạy & Soạn giáo án' },
          { value: 'CLASS_MANAGEMENT', label: 'Quản trị Lớp học & Tương tác Trực Tuyến' },
          { value: 'SITUATION_HANDLING', label: 'Xử lý Tình huống Sư phạm Thực chiến' },
          { value: 'ASSESSMENT_RUBRICS', label: 'Kiểm tra Đánh giá & Tiêu chuẩn Sư phạm' },
        ];
      case 'LIFE_SKILLS':
        return [
          { value: 'PUBLIC_SPEAKING', label: 'Thuyết trình & Nói trước đám đông' },
          { value: 'CRITICAL_THINKING', label: 'Tư duy Phản biện & Giải quyết vấn đề' },
          { value: 'EMOTIONAL_CONTROL', label: 'Quản lý Cảm xúc & Vượt qua Stress' },
          { value: 'SELF_CONFIDENCE', label: 'Tự tin & Giao tiếp Đời sống' },
        ];
      case 'SOFT_SKILLS':
        return [
          { value: 'TEAMWORK', label: 'Làm việc Nhóm & Hợp tác Đa văn hóa' },
          { value: 'NEGOTIATION', label: 'Kỹ năng Đàm phán & Thuyết phục' },
          { value: 'CONFLICT_RESOLUTION', label: 'Giải quyết Xung đột & Thấu cảm' },
          { value: 'ACTIVE_LISTENING', label: 'Lắng nghe Tích cực & Phản hồi' },
        ];
      case 'PERSONAL_DEV':
        return [
          { value: 'SELF_LEADERSHIP', label: 'Lãnh đạo Bản thân & Kỷ luật thép' },
          { value: 'GOAL_SETTING', label: 'Thiết lập Mục tiêu & Thói quen nguyên tử' },
          { value: 'TIME_MANAGEMENT', label: 'Quản lý Thời gian & Năng suất' },
          { value: 'GROWTH_MINDSET', label: 'Tư duy Phát triển (Growth Mindset)' },
        ];
      case 'BUSINESS':
        return [
          { value: 'BUSINESS_EMAIL', label: 'Thư tín Thương mại & Email quốc tế' },
          { value: 'BUSINESS_NEGOTIATION', label: 'Đàm phán & Thương thảo Hợp đồng' },
          { value: 'BUSINESS_PRESENTATION', label: 'Thuyết trình Dự án & Báo cáo số liệu' },
          { value: 'BUSINESS_MEETING', label: 'Điều hành Cuộc họp & Phản xạ công sở' },
        ];
      case 'KIDS':
        return [
          { value: 'PHONICS', label: 'Phonics & Nhận diện Âm vần vui nhộn' },
          { value: 'VISUAL_VOCAB', label: 'Từ vựng Hình ảnh & Đồ vật' },
          { value: 'STORY_LISTENING', label: 'Nghe kể chuyện & Phản xạ tự nhiên' },
        ];
      case 'ENGLISH':
        return [
          { value: 'DAILY_COMMUNICATION', label: 'Giao tiếp Đời sống & Phản xạ đàm thoại' },
          { value: 'APPLIED_GRAMMAR', label: 'Ngữ pháp Ứng dụng & Cấu trúc câu' },
          { value: 'PRACTICAL_READING', label: 'Đọc hiểu Tin tức & Đời sống quốc tế' },
          { value: 'LISTENING_COMPREHENSION', label: 'Nghe hiểu Podcast & Hội thoại' },
        ];
      case 'IELTS':
      default:
        return [
          { value: 'READING', label: 'IELTS Reading (Đọc hiểu)' },
          { value: 'LISTENING', label: 'IELTS Listening (Nghe hiểu)' },
          { value: 'WRITING', label: 'IELTS Writing (Viết luận)' },
          { value: 'SPEAKING', label: 'IELTS Speaking (Nói & Phát âm)' },
          { value: 'GRAMMAR_VOCAB', label: 'Ngữ pháp & Từ vựng Chuyên sâu' },
        ];
    }
  };

  // Modal Mock Test & Quiz State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testFormData, setTestFormData] = useState({
    title: '',
    description: '',
    track: 'ENGLISH' as 'ENGLISH' | 'PERSONAL_DEV',
    category: 'IELTS',
    quizType: 'FULL_MOCK_TEST',
    courseId: '',
    skill: 'READING',
    timeLimitMinutes: 45,
    passScore: 80,
    passage: '',
    audioUrl: '',
  });

  // Modal Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qFormData, setQFormData] = useState({
    targetQuizId: '',
    skill: 'READING',
    type: 'SINGLE_CHOICE',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    fillBlankAnswers: '',
    explanation: '',
  });

  // Smart Cambridge Importer State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'create_new' | 'existing'>('create_new');
  const [newQuizTitle, setNewQuizTitle] = useState('Cambridge IELTS 20 - Academic Reading Test 1');
  const [newQuizSkill, setNewQuizSkill] = useState('READING');
  const [newQuizTimeLimit, setNewQuizTimeLimit] = useState(60);
  const [newQuizPassScore, setNewQuizPassScore] = useState(80);
  const [detectedPassage, setDetectedPassage] = useState('');
  const [showPassageEditor, setShowPassageEditor] = useState(false);
  const [detectedKeyCount, setDetectedKeyCount] = useState(0);
  const [importTargetQuizId, setImportTargetQuizId] = useState('');
  const [importTab, setImportTab] = useState<'text' | 'file'>('text');
  const [importText, setImportText] = useState('');
  const [importForcedType, setImportForcedType] = useState<string>('AUTO');
  const [parsedQuestions, setParsedQuestions] = useState<
    {
      orderIndex: number;
      type: string;
      content: string;
      options: { content: string; isCorrect: boolean }[];
      explanation?: string;
    }[]
  >([]);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);

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
              skill: q.skillType || test.skill || 'READING',
              type: q.type || 'SINGLE_CHOICE',
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
    const cat = targetCategory || (filterCategory !== 'ALL' ? filterCategory : 'IELTS');
    const isDev = ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(cat);
    const domainOpts = getDomainOptions(cat);

    setTestFormData({
      title: '',
      description: '',
      track: isDev ? 'PERSONAL_DEV' : 'ENGLISH',
      category: cat,
      quizType: isDev ? 'SITUATION_QUIZ' : 'FULL_MOCK_TEST',
      courseId: targetCourseId || '',
      skill: domainOpts[0]?.value || 'READING',
      timeLimitMinutes: isDev ? 30 : 60,
      passScore: 80,
      passage: '',
      audioUrl: '',
    });
    setIsTestModalOpen(true);
  };

  const handleSaveMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormData.title.trim()) {
      showNotice('❌ Vui lòng nhập tiêu đề bài Quiz/Test!');
      return;
    }
    try {
      const payload = {
        title: testFormData.title.trim(),
        description: testFormData.description?.trim() || undefined,
        category: testFormData.category,
        quizType: testFormData.quizType,
        testType: testFormData.quizType,
        courseId: testFormData.courseId || undefined,
        skill: testFormData.skill,
        timeLimitMinutes: Number(testFormData.timeLimitMinutes),
        passScore: Number(testFormData.passScore),
        passage: testFormData.passage?.trim() || undefined,
        audioUrl: testFormData.audioUrl?.trim() || undefined,
      };

      if (editingTestId) {
        await quizzesService.updateQuiz(editingTestId, payload);
        showNotice(`✅ Đã cập nhật đề thi "${testFormData.title}"!`);
      } else {
        await quizzesService.createQuiz(payload);
        showNotice(`✅ Đã tạo bài Quiz mới "${testFormData.title}" (${testFormData.category})!`);
      }
      await fetchQuizzesAndTests();
      setIsTestModalOpen(false);
    } catch (err: unknown) {
      showNotice(`❌ Lỗi khi lưu đề thi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
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

  const handleOpenAddQuestion = (quizId?: string) => {
    setQFormData({
      targetQuizId: quizId || mockTests[0]?.id || '',
      skill: 'READING',
      type: 'SINGLE_CHOICE',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
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
      } else if (qFormData.type === 'FILL_BLANK' || qFormData.type === 'NOTE_COMPLETION') {
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
        options,
      });

      showNotice(`✅ Đã thêm câu hỏi (${qFormData.type}) mới thành công!`);
      await fetchQuizzesAndTests();
      setIsQuestionModalOpen(false);
    } catch (err: unknown) {
      showNotice(`❌ Lỗi khi thêm câu hỏi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // ==========================================
  // SMART CAMBRIDGE IMPORTER LOGIC & PARSER
  // ==========================================
  const sampleCambridgeReadingText = `CAMBRIDGE IELTS 20 - ACADEMIC READING TEST 1

READING PASSAGE 1
You should spend about 20 minutes on Questions 1-13, which are based on Reading Passage 1 below.

URBAN MICROCLIMATES AND SUSTAINABLE ARCHITECTURE

Paragraph A
Over the past two decades, metropolitan hubs worldwide have experienced intensified microclimatic anomalies known as Urban Heat Islands (UHI). Dense concrete infrastructure, asphalt surfaces, and anthropogenic heat emissions cause metropolitan temperatures to exceed surrounding rural baselines by up to 5 to 8 degrees Celsius during peak summer seasons.

Paragraph B
To mitigate these climatic challenges, contemporary civil engineers and architects are pioneering "biophilic building engineering." A notable prototype is the vertical botanical facade, incorporating indigenous foliage directly onto cantilevered building balconies. Plants act as organic thermal insulators and evaporative cooling units, reducing ambient surface temperatures by absorbing solar radiation.

Paragraph C
Automated IoT sensor arrays placed across structural elevations continuously evaluate micro-environmental parameters, including relative humidity, particulate concentration, and ambient airflow. These sensors relay real-time telemetry to central municipal management platforms, dynamically controlling misting nozzles and solar louvers to stabilize local microclimates.

Paragraph D
Despite these demonstrated technological advantages, the broad-scale implementation of biophilic facades faces several hurdles. Chief among these is the ongoing maintenance cost associated with automated drip-irrigation networks, as well as structural considerations regarding the dynamic weight of hydrated soil and mature root networks.

Questions 1-5
Do the following statements agree with the information given in Reading Passage 1?
In boxes 1-5 on your answer sheet, write:
TRUE if the statement agrees with the information
FALSE if the statement contradicts the information
NOT GIVEN if there is no information on this

1. Urban Heat Islands cause metropolitan centers to be warmer than surrounding rural areas.
2. Vertical botanical facades utilize synthetic artificial foliage to reflect solar radiation.
3. Automated IoT sensors adjust misting nozzles and solar louvers based on real-time climate data.
4. The municipal government of Milan financed the entire vertical forest construction project.
5. High maintenance costs of drip-irrigation systems present a challenge to widespread adoption.

Questions 6-9
Choose the correct letter, A, B, C or D.
Write the correct letter in boxes 6-9 on your answer sheet.

6. What is the primary cause of Urban Heat Islands mentioned in Paragraph A?
A. Excessive use of residential air conditioning units
B. Dense concrete, asphalt surfaces and anthropogenic heat emissions
C. Increased rainfall in rural territories
D. Absence of underground public transit networks

7. How do biophilic facades achieve ambient cooling?
A. By reflecting sunlight using mirrored glass tiles
B. Through organic thermal insulation and evaporative plant cooling
C. By circulating chilled water through underground pipes
D. By blocking all natural air currents around the building

8. According to Paragraph C, what do structural IoT sensors monitor?
A. Pedestrian foot traffic and noise pollution
B. Energy consumption of individual residential apartments
C. Relative humidity, particulate concentration and ambient airflow
D. Structural seismic vibrations during earthquakes

9. What structural concern is noted regarding mature botanical installations?
A. The dynamic weight of hydrated soil and root systems
B. Fire risk posed by dry autumn leaves
C. Electrical interference caused by dense plant cover
D. High wind resistance during hurricane conditions

Questions 10-13
Complete the notes below.
Choose ONE WORD ONLY from the passage for each answer.
Write your answers in boxes 10-13 on your answer sheet.

Innovations in Urban Climate Management:
10. The temperature difference between cities and rural areas can reach up to 8 degrees ______ during peak periods.
11. Plants absorb solar ______ to reduce the heating effect on exterior walls.
12. Sensor networks transmit live ______ directly to municipal control platforms.
13. Building designs must account for the added weight of hydrated ______ and root systems.

ANSWER KEY
1. TRUE
2. FALSE
3. TRUE
4. NOT GIVEN
5. TRUE
6. B
7. B
8. C
9. A
10. Celsius
11. radiation
12. telemetry
13. soil`;

  const handleOpenImportModal = (quizId?: string) => {
    if (quizId) {
      setImportTargetQuizId(quizId);
      setImportMode('existing');
    } else {
      setImportTargetQuizId(mockTests[0]?.id || '');
      setImportMode('create_new');
    }
    setParsedQuestions([]);
    setDetectedPassage('');
    setDetectedKeyCount(0);
    setIsImportModalOpen(true);
  };

  const parseCambridgeRawText = (rawText: string, forcedType = 'AUTO') => {
    if (!rawText.trim()) {
      return { title: '', passage: '', questions: [], detectedKeyCount: 0 };
    }

    // 1. Extract ANSWER KEY section if placed at the end of the file
    const keyMap = new Map<number, string>();
    let textBody = rawText;
    const answerKeyRegex = /(?:^|\n)\s*(?:ANSWER\s*KEY|KEY|ĐÁP\s*ÁN|ANSWERS)[\s\:\r\n]+([\s\S]*)$/i;
    const answerKeyMatch = rawText.match(answerKeyRegex);

    if (answerKeyMatch) {
      const keySection = answerKeyMatch[1];
      textBody = rawText.slice(0, answerKeyMatch.index);
      const keyLineRegex = /(?:^|\n)\s*(\d+)[\.\:\)]\s*([A-Za-z0-9\s\/\-_,\.\'\"]+)/g;
      let m: RegExpExecArray | null;
      while ((m = keyLineRegex.exec(keySection)) !== null) {
        const qNum = parseInt(m[1], 10);
        const val = m[2].trim();
        if (!isNaN(qNum) && val) {
          keyMap.set(qNum, val);
        }
      }
    }

    // 2. Extract Title and Reading Passage if present
    let detectedTitle = '';
    let detectedPassage = '';
    const lines = textBody.split('\n').map((l) => l.trim()).filter(Boolean);

    if (lines.length > 0 && /CAMBRIDGE|IELTS|READING|PRACTICE|MOCK/i.test(lines[0])) {
      detectedTitle = lines[0];
    }

    let passageStartIndex = -1;
    let questionsStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (passageStartIndex === -1 && /^(?:READING\s+PASSAGE|PASSAGE)\s*([0-9A-Z]*)/i.test(line)) {
        passageStartIndex = i;
      }
      if (
        questionsStartIndex === -1 &&
        (/^Questions?\s+\d+/i.test(line) || /^(?:Question\s+|Q\s*)?1[\.\:\)]\s+/i.test(line))
      ) {
        questionsStartIndex = i;
        break;
      }
    }

    if (passageStartIndex !== -1 && questionsStartIndex > passageStartIndex) {
      const passageLines = lines.slice(passageStartIndex, questionsStartIndex);
      const contentLines: string[] = [];
      for (const pLine of passageLines) {
        if (/^(?:READING\s+PASSAGE|PASSAGE)\s*/i.test(pLine)) continue;
        if (/^You should spend about/i.test(pLine)) continue;
        contentLines.push(pLine);
      }
      if (contentLines.length > 0) {
        if (!detectedTitle) {
          detectedTitle = contentLines[0];
        }
        detectedPassage = contentLines.join('\n\n');
      }
    }

    // 3. Parse questions starting from questionsStartIndex (or line 0 if no passage)
    const questionLines = questionsStartIndex !== -1 ? lines.slice(questionsStartIndex) : lines;
    const questions: {
      orderIndex: number;
      type: string;
      content: string;
      options: { content: string; isCorrect: boolean }[];
      explanation?: string;
    }[] = [];

    const questionRegex = /^(?:Question\s+|Q\s*)?(\d+)[\.\:\)]\s*(.*)$/i;
    let currentQ: {
      number: number;
      text: string;
      options: { letter: string; text: string }[];
      answer?: string;
      explanation?: string;
    } | null = null;

    const processAndPush = (q: typeof currentQ) => {
      if (!q) return;

      // Map answer from Answer Key at end of file if not specified inline
      if (!q.answer && keyMap.has(q.number)) {
        q.answer = keyMap.get(q.number);
      }

      let type = forcedType !== 'AUTO' ? forcedType : 'SINGLE_CHOICE';
      const rawAns = (q.answer || '').trim();
      const ansUpper = rawAns.toUpperCase();

      if (forcedType === 'AUTO') {
        if (['TRUE', 'FALSE', 'NOT GIVEN'].includes(ansUpper) || q.text.toUpperCase().includes('TRUE/FALSE/NOT GIVEN')) {
          type = 'TRUE_FALSE_NOT_GIVEN';
        } else if (['YES', 'NO', 'NOT GIVEN'].includes(ansUpper) || q.text.toUpperCase().includes('YES/NO/NOT GIVEN')) {
          type = 'YES_NO_NOT_GIVEN';
        } else if (q.options.length >= 2) {
          type = 'SINGLE_CHOICE';
        } else if (/^[A-D]$/i.test(rawAns)) {
          type = 'SINGLE_CHOICE';
        } else {
          type = 'FILL_BLANK';
        }
      }

      let finalOptions: { content: string; isCorrect: boolean }[] = [];
      if (type === 'TRUE_FALSE_NOT_GIVEN') {
        finalOptions = [
          { content: 'TRUE', isCorrect: ansUpper === 'TRUE' },
          { content: 'FALSE', isCorrect: ansUpper === 'FALSE' },
          { content: 'NOT GIVEN', isCorrect: ansUpper === 'NOT GIVEN' },
        ];
      } else if (type === 'YES_NO_NOT_GIVEN') {
        finalOptions = [
          { content: 'YES', isCorrect: ansUpper === 'YES' },
          { content: 'NO', isCorrect: ansUpper === 'NO' },
          { content: 'NOT GIVEN', isCorrect: ansUpper === 'NOT GIVEN' },
        ];
      } else if (type === 'FILL_BLANK' || type === 'NOTE_COMPLETION' || type === 'SENTENCE_COMPLETION') {
        const parts = (rawAns || 'Đáp án mẫu').split('/');
        finalOptions = parts.map((p) => ({ content: p.trim(), isCorrect: true }));
      } else {
        // SINGLE_CHOICE
        finalOptions = q.options.map((opt) => ({
          content: opt.text ? `${opt.letter}. ${opt.text}` : opt.letter,
          isCorrect: opt.letter.toUpperCase() === ansUpper || opt.text.trim().toLowerCase() === rawAns.toLowerCase(),
        }));
        if (finalOptions.length === 0) {
          finalOptions = [
            { content: 'A', isCorrect: ansUpper === 'A' },
            { content: 'B', isCorrect: ansUpper === 'B' },
            { content: 'C', isCorrect: ansUpper === 'C' },
            { content: 'D', isCorrect: ansUpper === 'D' },
          ];
        }
      }

      questions.push({
        orderIndex: q.number,
        type,
        content: q.text,
        options: finalOptions,
        explanation:
          q.explanation ||
          (q.answer
            ? `Đáp án chính xác: ${q.answer} theo tài liệu khảo thí Cambridge.`
            : 'Theo bài đọc đề thi chuẩn Cambridge.'),
      });
    };

    for (let i = 0; i < questionLines.length; i++) {
      const line = questionLines[i];

      // Ignore instruction lines
      if (
        /^Questions?\s+\d+/i.test(line) ||
        /^Do the following/i.test(line) ||
        /^In boxes/i.test(line) ||
        /^Choose the correct/i.test(line) ||
        /^Complete the/i.test(line) ||
        /^Write your answers/i.test(line) ||
        /^Choose ONE WORD/i.test(line) ||
        /^Choose NO MORE/i.test(line)
      ) {
        continue;
      }

      const ansMatch = line.match(/^(?:Answer|Ans|Key|Đáp án)[\s\:\-]+([A-Za-z0-9\s\/\-_,\.\'\"]+)$/i);
      if (ansMatch && currentQ) {
        currentQ.answer = ansMatch[1].trim();
        continue;
      }

      const expMatch = line.match(/^(?:Explanation|Exp|Giải thích)[\s\:\-]+(.*)$/i);
      if (expMatch && currentQ) {
        currentQ.explanation = expMatch[1].trim();
        continue;
      }

      const optMatch = line.match(/^([A-D])[\.\:\)]\s*(.*)$/i);
      if (optMatch && currentQ) {
        currentQ.options.push({ letter: optMatch[1].toUpperCase(), text: optMatch[2].trim() });
        continue;
      }

      const qMatch = line.match(questionRegex);
      if (qMatch) {
        if (currentQ) processAndPush(currentQ);
        currentQ = { number: parseInt(qMatch[1], 10), text: qMatch[2].trim(), options: [] };
        continue;
      }

      if (currentQ && currentQ.options.length === 0) {
        currentQ.text += ' ' + line;
      }
    }

    if (currentQ) processAndPush(currentQ);

    return {
      title: detectedTitle,
      passage: detectedPassage,
      questions,
      detectedKeyCount: keyMap.size,
    };
  };

  const handleParseImportText = () => {
    if (!importText.trim()) {
      showNotice('❌ Vui lòng dán nội dung văn bản đề thi Cambridge vào khung bên dưới!');
      return;
    }
    const results = parseCambridgeRawText(importText, importForcedType);
    if (results.questions.length === 0) {
      showNotice('⚠️ Không tìm thấy câu hỏi nào hợp lệ. Vui lòng định dạng số thứ tự (ví dụ: 1. Câu hỏi...)');
      return;
    }
    setParsedQuestions(results.questions);
    if (results.title) setNewQuizTitle(results.title);
    if (results.passage) setDetectedPassage(results.passage);
    setDetectedKeyCount(results.detectedKeyCount);

    const keyNotice = results.detectedKeyCount > 0 ? ` • ${results.detectedKeyCount} đáp án từ Answer Key` : '';
    const passageNotice = results.passage ? ' • Bài đọc Passage tự động bóc tách' : '';
    showNotice(`🎉 Đã bóc tách thành công ${results.questions.length} câu hỏi chuẩn Cambridge${keyNotice}${passageNotice}!`);
  };

  const handleExecuteImport = async () => {
    if (parsedQuestions.length === 0) {
      showNotice('❌ Chưa có câu hỏi nào được phân tích để import!');
      return;
    }

    setIsSubmittingImport(true);
    try {
      let targetQuizId = importTargetQuizId;
      let targetSkill = 'READING';

      if (importMode === 'create_new') {
        const createdQuiz = await quizzesService.createQuiz({
          title: newQuizTitle.trim() || 'Cambridge IELTS Practice Test',
          skill: newQuizSkill,
          passage: detectedPassage.trim() || undefined,
          timeLimitMinutes: Number(newQuizTimeLimit) || 60,
          passScore: Number(newQuizPassScore) || 80,
          quizType: 'PRACTICE_TEST',
          testType: 'FULL_MOCK_TEST',
          category: 'IELTS',
        });
        targetQuizId = createdQuiz.id;
        targetSkill = newQuizSkill;
      } else {
        if (!targetQuizId) {
          showNotice('❌ Vui lòng chọn bài Quiz / Đề thi mục tiêu cần nạp câu hỏi!');
          setIsSubmittingImport(false);
          return;
        }
        const targetTest = mockTests.find((t) => t.id === targetQuizId);
        targetSkill = targetTest?.skill || 'READING';
      }

      const payload = parsedQuestions.map((q) => ({
        content: q.content,
        skill: targetSkill,
        type: q.type,
        explanation: q.explanation,
        orderIndex: q.orderIndex,
        options: q.options,
      }));

      await quizzesService.addQuestionsBulk(targetQuizId, payload);
      showNotice(
        importMode === 'create_new'
          ? `🎉 Đã tạo đề thi "${newQuizTitle}" và nạp thành công ${parsedQuestions.length} câu hỏi!`
          : `🎉 Đã nạp thành công ${parsedQuestions.length} câu hỏi chuẩn Cambridge vào đề thi!`
      );
      await fetchQuizzesAndTests();
      setIsImportModalOpen(false);
      setParsedQuestions([]);
      setImportText('');
      setDetectedPassage('');
      setDetectedKeyCount(0);
    } catch (err: unknown) {
      showNotice(`❌ Lỗi khi import câu hỏi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setIsSubmittingImport(false);
    }
  };

  const handleDownloadJsonTemplate = () => {
    const template = [
      {
        orderIndex: 1,
        type: 'TRUE_FALSE_NOT_GIVEN',
        content: 'The ancient Roman water supply system was built entirely above ground.',
        options: [
          { content: 'TRUE', isCorrect: false },
          { content: 'FALSE', isCorrect: true },
          { content: 'NOT GIVEN', isCorrect: false },
        ],
        explanation: 'Paragraph 1 states that majority was underground aqueducts.',
      },
      {
        orderIndex: 2,
        type: 'SINGLE_CHOICE',
        content: 'What is the primary purpose of the automated traffic grid?',
        options: [
          { content: 'To decrease parking fines', isCorrect: false },
          { content: 'To reduce carbon emissions during peak hours', isCorrect: true },
          { content: 'To replace all human drivers', isCorrect: false },
          { content: 'To encourage bike sharing programs', isCorrect: false },
        ],
        explanation: 'Paragraph 4 explains reduction of traffic jams and carbon emission.',
      },
      {
        orderIndex: 3,
        type: 'FILL_BLANK',
        content: 'Smart power grids rely heavily on specialized ______ batteries.',
        options: [
          { content: 'lithium-ion', isCorrect: true },
          { content: 'solar', isCorrect: true },
        ],
        explanation: 'Paragraph 6 mentions lithium-ion storage units.',
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cambridge_ielts_questions_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json)) {
            const validated = json.map((item, idx) => ({
              orderIndex: item.orderIndex || idx + 1,
              type: item.type || 'SINGLE_CHOICE',
              content: item.content || item.questionText || `Câu hỏi ${idx + 1}`,
              options: Array.isArray(item.options)
                ? item.options
                : [
                    { content: 'TRUE', isCorrect: true },
                    { content: 'FALSE', isCorrect: false },
                  ],
              explanation: item.explanation || 'Theo bài đọc Cambridge.',
            }));
            setParsedQuestions(validated);
            showNotice(`✅ Đã nạp thành công ${validated.length} câu hỏi từ file JSON!`);
          } else {
            showNotice('❌ Định dạng file JSON không hợp lệ (phải là danh sách mảng câu hỏi)');
          }
        } catch {
          showNotice('❌ Lỗi đọc file JSON: Nội dung không đúng cú pháp JSON');
        }
      };
      reader.readAsText(file);
    } else {
      // Handle .txt, .md, .csv Cambridge exam files
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        setImportText(text);
        const results = parseCambridgeRawText(text, importForcedType);
        if (results.questions.length === 0) {
          showNotice('⚠️ Không tìm thấy câu hỏi hợp lệ trong file. Vui lòng kiểm tra định dạng.');
          return;
        }
        setParsedQuestions(results.questions);
        if (results.title) setNewQuizTitle(results.title);
        if (results.passage) setDetectedPassage(results.passage);
        setDetectedKeyCount(results.detectedKeyCount);
        setImportTab('text');

        const keyNotice = results.detectedKeyCount > 0 ? ` • ${results.detectedKeyCount} đáp án từ Answer Key` : '';
        const passageNotice = results.passage ? ' • Đã bóc tách bài đọc' : '';
        showNotice(`🎉 Đã đọc file "${file.name}" và bóc tách ${results.questions.length} câu hỏi${keyNotice}${passageNotice}!`);
      };
      reader.readAsText(file);
    }
  };

  const filteredMockTests = useMemo(() => {
    return mockTests.filter((test) => {
      const isEng = ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(test.category || 'IELTS');
      const testTrack = isEng ? 'ENGLISH' : 'PERSONAL_DEV';

      const matchTrack = filterTrack === 'ALL' || testTrack === filterTrack;
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

      return matchTrack && matchCat && matchQuizType && matchSkill && matchSearch;
    });
  }, [mockTests, filterTrack, filterCategory, filterQuizType, filterSkill, quizSearch]);

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
      const isDev = ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(catParam?.toUpperCase() || '');
      const initialCat = catParam?.toUpperCase() || (isDev ? 'PEDAGOGY' : 'IELTS');
      const domainOpts = getDomainOptions(initialCat);
      setTestFormData((prev) => ({
        ...prev,
        courseId: courseIdParam || '',
        track: isDev ? 'PERSONAL_DEV' : 'ENGLISH',
        category: initialCat,
        quizType: isDev ? 'SITUATION_QUIZ' : 'FULL_MOCK_TEST',
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

        {/* Global Quick Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenCreateTestModal()}
            className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Đề Thi Mock Test</span>
          </button>
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
          {/* Sub-tab Switcher: Đề thi vs Ngân hàng câu hỏi */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuizSubTab('tests')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  quizSubTab === 'tests'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Danh Sách Đề Thi ({mockTests.length})
              </button>
              <button
                onClick={() => setQuizSubTab('questions')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  quizSubTab === 'questions'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ngân Hàng Câu Hỏi ({quizQuestions.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenImportModal()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Smart Import Cambridge</span>
              </button>
              <button
                onClick={() => handleOpenAddQuestion()}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs border border-sky-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Câu Hỏi Mới</span>
              </button>
              <button
                onClick={() => handleOpenCreateTestModal()}
                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tạo Bài Quiz / Đề Thi</span>
              </button>
            </div>
          </div>

          {/* Filter Bar with Track Switcher & Category Pills */}
          <div className="bg-white p-4 rounded-3xl border border-line shadow-xs space-y-3">
            {/* Primary Track Filter & Quiz Type */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-line pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1">
                  Lộ Trình:
                </span>
                {[
                  { id: 'ALL', label: `Tất Cả (${mockTests.length})`, icon: null },
                  {
                    id: 'ENGLISH',
                    label: `Tiếng Anh & IELTS (${
                      mockTests.filter((t) =>
                        ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(t.category || 'IELTS'),
                      ).length
                    })`,
                    icon: Globe,
                  },
                  {
                    id: 'PERSONAL_DEV',
                    label: `Kỹ Năng & Sư Phạm (${
                      mockTests.filter((t) =>
                        ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(
                          t.category || '',
                        ),
                      ).length
                    })`,
                    icon: Compass,
                  },
                ].map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setFilterTrack(track.id as any);
                      setFilterCategory('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      filterTrack === track.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {track.icon && <track.icon className="w-3.5 h-3.5 shrink-0" />}
                    <span>{track.label}</span>
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
                  { id: 'SITUATION_QUIZ', label: 'Tình Huống (Case)', icon: Target },
                  { id: 'PRACTICE_TEST', label: 'Luyện Tập', icon: FileEdit },
                  { id: 'LESSON_QUIZ', label: 'Bài Học', icon: BookOpen },
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
                  placeholder="Tìm tiêu đề hoặc nội dung bài Quiz..."
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category Pills matching the active track */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
                {(filterTrack === 'PERSONAL_DEV'
                  ? [
                      { id: 'ALL', label: 'Tất cả Kỹ Năng' },
                      { id: 'PEDAGOGY', label: 'Sư Phạm' },
                      { id: 'LIFE_SKILLS', label: 'Kỹ Năng Sống' },
                      { id: 'SOFT_SKILLS', label: 'Kỹ Năng Mềm' },
                      { id: 'PERSONAL_DEV', label: 'Bản Thân' },
                    ]
                  : filterTrack === 'ENGLISH'
                  ? [
                      { id: 'ALL', label: 'Tất cả Tiếng Anh' },
                      { id: 'IELTS', label: 'IELTS 4 Kỹ Năng' },
                      { id: 'ENGLISH', label: 'General English' },
                      { id: 'BUSINESS', label: 'Business English' },
                      { id: 'KIDS', label: 'Kids English' },
                    ]
                  : [
                      { id: 'ALL', label: 'Tất cả danh mục' },
                      { id: 'IELTS', label: 'IELTS' },
                      { id: 'ENGLISH', label: 'General' },
                      { id: 'BUSINESS', label: 'Business' },
                      { id: 'PEDAGOGY', label: 'Sư Phạm' },
                      { id: 'LIFE_SKILLS', label: 'Kỹ Năng Sống' },
                      { id: 'SOFT_SKILLS', label: 'Kỹ Năng Mềm' },
                      { id: 'PERSONAL_DEV', label: 'Bản Thân' },
                    ]
                ).map((c) => (
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

          {/* Subtab 1: Mock Tests Table */}
          {quizSubTab === 'tests' && (
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
                      <th className="py-3 px-4">Sàn Đạt</th>
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
                            <td className="py-3.5 px-4 font-bold text-emerald-600 whitespace-nowrap">
                              &ge; {t.passScore}%
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                              {t.questionsCount} câu
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenImportModal(t.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 transition inline-flex items-center gap-1"
                                title="Smart Import câu hỏi chuẩn Cambridge"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Import</span>
                              </button>
                              <button
                                onClick={() => handleOpenAddQuestion(t.id)}
                                className="px-2 py-1 rounded-lg bg-sky-50 text-primary font-bold text-[11px] hover:bg-sky-100 transition"
                              >
                                + Thêm câu
                              </button>
                              <button
                                onClick={() => handleDeleteMockTest(t.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition"
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
          )}

          {/* Subtab 2: Questions Bank */}
          {quizSubTab === 'questions' && (
            <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-line text-slate-400 font-black uppercase text-[10.5px]">
                    <tr>
                      <th className="py-3 px-4">Câu Hỏi</th>
                      <th className="py-3 px-4">Đề Thi Trực Thuộc</th>
                      <th className="py-3 px-4">Kỹ Năng</th>
                      <th className="py-3 px-4">Đáp Án Đúng</th>
                      <th className="py-3 px-4">Giải Thích Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {quizQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                          Chưa có câu hỏi nào trong ngân hàng đề.
                        </td>
                      </tr>
                    ) : (
                      quizQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm">
                            {q.questionText}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold">{q.quizTitle}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-primary">
                              {q.skill}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              {q.correctAnswer}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                            {q.explanation}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: IELTS WRITING AI REVIEW WORKFLOW                           */}
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
      {/* MODAL: CREATE / EDIT MOCK TEST                                            */}
      {/* ========================================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingTestId ? 'Sửa Đề Thi / Bài Quiz' : 'Tạo Bài Quiz / Đề Thi Mới'}
                </h3>
                <p className="text-xs text-muted">
                  Thiết lập bài trắc nghiệm hoặc tình huống thực chiến cho mọi phân hệ đào tạo.
                </p>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMockTest} className="space-y-4">
              {/* 1. Track Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Chọn Lộ Trình Đào Tạo <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const domainOpts = getDomainOptions('IELTS');
                      setTestFormData({
                        ...testFormData,
                        track: 'ENGLISH',
                        category: 'IELTS',
                        quizType: 'FULL_MOCK_TEST',
                        skill: domainOpts[0]?.value || 'READING',
                      });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      testFormData.track === 'ENGLISH'
                        ? 'bg-sky-50 border-primary text-primary shadow-xs'
                        : 'border-line text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>Tiếng Anh & IELTS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const domainOpts = getDomainOptions('PEDAGOGY');
                      setTestFormData({
                        ...testFormData,
                        track: 'PERSONAL_DEV',
                        category: 'PEDAGOGY',
                        quizType: 'SITUATION_QUIZ',
                        skill: domainOpts[0]?.value || 'TEACHING_METHOD',
                      });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      testFormData.track === 'PERSONAL_DEV'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                        : 'border-line text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span>Phát Triển Cá Nhân & Sư Phạm</span>
                  </button>
                </div>
              </div>

              {/* 2. Category & Course Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <CustomSelect
                  label="2. Phân hệ khóa học *"
                  value={testFormData.category}
                  onChange={(val) => {
                    const domainOpts = getDomainOptions(val);
                    setTestFormData({
                      ...testFormData,
                      category: val,
                      skill: domainOpts[0]?.value || 'READING',
                    });
                  }}
                  options={
                    testFormData.track === 'PERSONAL_DEV'
                      ? [
                          { value: 'PEDAGOGY', label: 'Năng Lực Sư Phạm & Giảng Dạy' },
                          { value: 'LIFE_SKILLS', label: 'Kỹ Năng Sống & Thuyết Trình' },
                          { value: 'SOFT_SKILLS', label: 'Kỹ Năng Mềm Doanh Nghiệp' },
                          { value: 'PERSONAL_DEV', label: 'Phát Triển Bản Thân & Lãnh Đạo' },
                        ]
                      : [
                          { value: 'IELTS', label: 'IELTS 4 Kỹ Năng Master' },
                          { value: 'ENGLISH', label: 'General English' },
                          { value: 'BUSINESS', label: 'Business English' },
                          { value: 'KIDS', label: 'Kids English' },
                        ]
                  }
                />

                <CustomSelect
                  label="3. Khóa học áp dụng (Tùy chọn)"
                  value={testFormData.courseId}
                  onChange={(val) => setTestFormData({ ...testFormData, courseId: val })}
                  options={[
                    { value: '', label: '-- Áp dụng chung cho phân hệ --' },
                    ...coursesList
                      .filter((c) => c.category === testFormData.category || (!c.category && testFormData.track === 'ENGLISH'))
                      .map((c) => ({
                        value: c.id,
                        label: c.title,
                      })),
                  ]}
                />
              </div>

              {/* 3. Quiz Type & Skill / Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <CustomSelect
                  label="4. Loại bài Quiz (Quiz Type) *"
                  value={testFormData.quizType}
                  onChange={(val) => setTestFormData({ ...testFormData, quizType: val })}
                  options={[
                    { value: 'SITUATION_QUIZ', label: 'Trắc nghiệm Tình huống (Case Study)' },
                    { value: 'FULL_MOCK_TEST', label: 'Đề Thi Thử Hoàn Chỉnh (Full Mock Test)' },
                    { value: 'PRACTICE_TEST', label: 'Mini-Test / Luyện tập chuyên đề' },
                    { value: 'LESSON_QUIZ', label: 'Trắc nghiệm củng cố bài học' },
                    { value: 'DIAGNOSTIC_TEST', label: 'Bài đánh giá chẩn đoán năng lực' },
                  ]}
                />

                <CustomSelect
                  label="5. Kỹ năng / Lĩnh vực khảo thí *"
                  value={testFormData.skill}
                  onChange={(val) => setTestFormData({ ...testFormData, skill: val })}
                  options={getDomainOptions(testFormData.category)}
                />
              </div>

              {/* 4. Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6. Tiêu đề bài Quiz / Đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testFormData.title}
                  onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                  placeholder={
                    testFormData.track === 'PERSONAL_DEV'
                      ? 'Ví dụ: Tình huống Sư phạm: Kích hoạt tương tác học sinh thụ động'
                      : 'Ví dụ: IELTS Reading Mock Test 01: Smart Cities'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <RichTextEditor
                label="Mô tả mục tiêu bài kiểm tra & yêu cầu"
                value={testFormData.description}
                onChange={(val) => setTestFormData({ ...testFormData, description: val })}
                placeholder="Mô tả bối cảnh, năng lực trọng tâm cần đánh giá, lưu ý khi làm bài..."
                minHeight="min-h-[120px]"
                helperText="Hỗ trợ in đậm, gạch đầu dòng, lưu ý quan trọng."
              />

              {/* Time Limit & Pass Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời lượng làm bài (Phút) <span className="text-red-500">*</span>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold"
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
                    value={testFormData.passScore}
                    onChange={(e) =>
                      setTestFormData({ ...testFormData, passScore: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Passage / Scenario Text */}
              <RichTextEditor
                label={
                  testFormData.track === 'PERSONAL_DEV'
                    ? 'Bối cảnh tình huống thực tế / Case Study (Scenario Text - Tùy chọn)'
                    : 'Đoạn văn đọc hiểu (Passage - Tùy chọn)'
                }
                value={testFormData.passage}
                onChange={(val) => setTestFormData({ ...testFormData, passage: val })}
                placeholder={
                  testFormData.track === 'PERSONAL_DEV'
                    ? 'Mô tả chi tiết tình huống thực tế (ví dụ: Trong một lớp học trực tuyến tương tác, có 2 học viên liên tục mất tập trung...)'
                    : 'Nhập đoạn văn cho bài đọc Reading Cambridge IELTS...'
                }
                minHeight="min-h-[160px]"
                helperText="Hỗ trợ đầy đủ định dạng: In đậm, gạch đầu dòng, trích dẫn bối cảnh và bảng dữ liệu."
              />

              {/* Audio URL (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL file Audio / File nghe (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={testFormData.audioUrl}
                  onChange={(e) => setTestFormData({ ...testFormData, audioUrl: e.target.value })}
                  placeholder="https://.../audio.mp3 (Dành cho bài nghe Listening hoặc video phân tích)"
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  {editingTestId ? 'Lưu Thay Đổi' : 'Tạo Bài Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD QUESTION TO MOCK TEST                                          */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Thêm Câu Hỏi Đề Thi
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5">
              <CustomSelect
                label="Đề thi áp dụng *"
                value={qFormData.targetQuizId}
                onChange={(val) => setQFormData({ ...qFormData, targetQuizId: val })}
                options={mockTests.map((t) => ({
                  value: t.id,
                  label: t.title,
                  sublabel: `${t.skill} • ${t.timeLimitMinutes}m`,
                }))}
              />

              <CustomSelect
                label="Dạng bài câu hỏi (Question Type) *"
                value={qFormData.type}
                onChange={(val) => {
                  let defaultAns = 'A';
                  if (val === 'TRUE_FALSE_NOT_GIVEN') defaultAns = 'TRUE';
                  else if (val === 'YES_NO_NOT_GIVEN') defaultAns = 'YES';
                  setQFormData({ ...qFormData, type: val, correctAnswer: defaultAns });
                }}
                options={[
                  { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm 4 lựa chọn (A, B, C, D)' },
                  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given (Cambridge Reading)' },
                  { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given (Cambridge Reading)' },
                  { value: 'FILL_BLANK', label: 'Điền từ vào chỗ trống (Sentence / Note Completion)' },
                ]}
              />

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
                      : 'Ví dụ: According to paragraph 2, what is the main reason for...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-semibold"
                ></textarea>
              </div>

              {/* Conditional Options Input according to Question Type */}
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
                    Hệ thống sẽ đối chiếu không phân biệt chữ hoa/thường khi học viên làm bài.
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
                    <div className="flex items-center gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                        <label
                          key={letter}
                          className={`flex-1 p-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition ${
                            qFormData.correctAnswer === letter
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                              : 'bg-white border-line text-slate-600'
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giải thích chi tiết (Hiện sau khi nộp bài)
                </label>
                <textarea
                  rows={2}
                  value={qFormData.explanation}
                  onChange={(e) => setQFormData({ ...qFormData, explanation: e.target.value })}
                  placeholder="Dẫn chứng từ đoạn văn chứng minh đáp án..."
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
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  Lưu Câu Hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SMART CAMBRIDGE IELTS IMPORTER                                     */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-line p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>⚡ Smart Import Đề Thi Cambridge IELTS</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Reading & Listening
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động nhận diện dạng bài, bóc tách câu hỏi và nạp 40 câu hỏi chỉ trong vài giây.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Import Mode Selector: Create New vs Existing Quiz */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setImportMode('create_new')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                    importMode === 'create_new'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚡ Tự động tạo Đề thi Cambridge mới (Khuyên dùng)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('existing')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                    importMode === 'existing'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  <span>Nạp vào Đề thi có sẵn trong kho</span>
                </button>
              </div>

              {/* Mode 1: Create New Quiz Fields */}
              {importMode === 'create_new' && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-extrabold text-slate-800">
                        Tiêu đề Đề thi mới *
                      </label>
                      <input
                        type="text"
                        value={newQuizTitle}
                        onChange={(e) => setNewQuizTitle(e.target.value)}
                        placeholder="VD: Cambridge IELTS 20 - Academic Reading Test 1"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-slate-800">
                        Kỹ năng bài thi *
                      </label>
                      <select
                        value={newQuizSkill}
                        onChange={(e) => setNewQuizSkill(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="READING">READING (Đọc hiểu)</option>
                        <option value="LISTENING">LISTENING (Nghe hiểu)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Thời gian làm bài (Phút)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={newQuizTimeLimit}
                        onChange={(e) => setNewQuizTimeLimit(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Điểm sàn đạt (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newQuizPassScore}
                        onChange={(e) => setNewQuizPassScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                      />
                    </div>
                  </div>

                  {/* Detected Passage Preview / Editor */}
                  {detectedPassage && (
                    <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            Đã bóc tách Bài đọc Passage ({detectedPassage.split(/\s+/).filter(Boolean).length} từ)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassageEditor(!showPassageEditor)}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                        >
                          {showPassageEditor ? 'Thu gọn bài đọc' : 'Xem & Chỉnh sửa bài đọc'}
                        </button>
                      </div>

                      {showPassageEditor && (
                        <textarea
                          rows={6}
                          value={detectedPassage}
                          onChange={(e) => setDetectedPassage(e.target.value)}
                          placeholder="Nội dung bài đọc Reading Passage..."
                          className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-sans leading-relaxed bg-white focus:outline-none focus:border-emerald-600"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Existing Quiz Selector */}
              {importMode === 'existing' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <CustomSelect
                    label="1. Chọn Đề thi / Quiz cần nạp câu hỏi *"
                    value={importTargetQuizId}
                    onChange={(val) => setImportTargetQuizId(val)}
                    options={mockTests.map((t) => ({
                      value: t.id,
                      label: t.title,
                      sublabel: `${t.category} • ${t.skill} • ${t.questionsCount || 0} câu hiện có`,
                    }))}
                  />

                  <CustomSelect
                    label="2. Định dạng câu hỏi (Auto / Chỉ định) *"
                    value={importForcedType}
                    onChange={(val) => setImportForcedType(val)}
                    options={[
                      { value: 'AUTO', label: 'Tự động nhận diện thông minh (Khuyên dùng)' },
                      { value: 'TRUE_FALSE_NOT_GIVEN', label: 'Ép dạng: True / False / Not Given' },
                      { value: 'YES_NO_NOT_GIVEN', label: 'Ép dạng: Yes / No / Not Given' },
                      { value: 'SINGLE_CHOICE', label: 'Ép dạng: Trắc nghiệm 4 lựa chọn (A, B, C, D)' },
                      { value: 'FILL_BLANK', label: 'Ép dạng: Điền từ vào chỗ trống' },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Tab switch: Raw Text Parser vs JSON File Upload */}
            <div className="flex items-center gap-2 border-b border-line pb-2">
              <button
                type="button"
                onClick={() => setImportTab('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  importTab === 'text'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dán Văn Bản Thô (Cambridge Text Parser)</span>
              </button>

              <button
                type="button"
                onClick={() => setImportTab('file')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  importTab === 'file'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Tải File Đề Thi (.txt, .md, .json, .csv)</span>
              </button>
            </div>

            {/* TAB 1: RAW TEXT PARSER */}
            {importTab === 'text' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Dán đề bài từ sách Cambridge (PDF / Word) vào đây:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImportText(sampleCambridgeReadingText);
                      showNotice('📋 Đã nạp đề mẫu Cambridge 20 Full Test (Passage + 13 câu + Answer Key)!');
                    }}
                    className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
                  >
                    <span>Dán đề mẫu Cambridge 20 thử nghiệm</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Dán nguyên vẹn nội dung đề thi Cambridge (bao gồm tiêu đề, Reading Passage, câu hỏi và Answer Key ở cuối file). Hệ thống sẽ tự động bóc tách toàn bộ!"
                  className="w-full px-4 py-3 rounded-2xl border border-line text-xs font-mono focus:outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white leading-relaxed"
                ></textarea>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500">
                    Hỗ trợ tự động: Bóc tách Reading Passage, TFNG/YNNG, Trắc nghiệm ABCD, Điền từ & Khớp Answer Key ở cuối sách!
                  </span>
                  <button
                    type="button"
                    onClick={handleParseImportText}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚡ Phân Tích & Bóc Tách Đề Thi</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: JSON/TXT/MD FILE UPLOAD & TEMPLATE */}
            {importTab === 'file' && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      Tải File Đề Thi Hoặc Mẫu Template Cấu Trúc
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hỗ trợ tệp văn bản Cambridge thô (.txt, .md) hoặc tệp JSON câu hỏi chuẩn hóa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadJsonTemplate}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-extrabold text-xs shadow-2xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tải File Template .JSON</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Tải lên file đề thi của bạn:
                  </label>
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white transition group">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span className="text-xs font-extrabold text-slate-700 mt-2">
                      Nhấp để chọn file hoặc kéo thả file đề thi vào đây
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Định dạng hỗ trợ: .txt, .md (Văn bản Cambridge), .json (Mảng câu hỏi), .csv
                    </span>
                    <input
                      type="file"
                      accept=".json,.txt,.md,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* LIVE PREVIEW SECTION */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-line">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900">
                      Kết Quả Bóc Tách (Live Preview):
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                      {parsedQuestions.length} câu hỏi hợp lệ
                    </span>
                    {detectedKeyCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                        {detectedKeyCount} đáp án Answer Key
                      </span>
                    )}
                    {detectedPassage && (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-black text-xs">
                        Bài đọc {detectedPassage.split(/\s+/).filter(Boolean).length} từ
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedQuestions([]);
                      setDetectedPassage('');
                      setDetectedKeyCount(0);
                    }}
                    className="text-xs text-slate-400 hover:text-red-500"
                  >
                    Xóa kết quả
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50">
                  {parsedQuestions.map((q, idx) => {
                    const correctOpt = q.options.find((o) => o.isCorrect);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-black flex items-center justify-center text-[11px]">
                              {q.orderIndex || idx + 1}
                            </span>
                            <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-100">
                              {q.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">Đáp án:</span>
                            <span className="px-2 py-0.5 rounded font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200">
                              {correctOpt?.content || 'Chưa nhận diện'}
                            </span>
                          </div>
                        </div>

                        <p className="font-semibold text-slate-800 line-clamp-2">
                          {q.content}
                        </p>

                        {q.options && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {q.options.map((opt, optIdx) => (
                              <span
                                key={optIdx}
                                className={`text-[10.5px] px-2 py-0.5 rounded border ${
                                  opt.isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {opt.content}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={parsedQuestions.length === 0 || isSubmittingImport}
                onClick={handleExecuteImport}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
              >
                {isSubmittingImport ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {isSubmittingImport
                    ? 'Đang import...'
                    : importMode === 'create_new'
                    ? `⚡ Tạo Đề Thi & Import ${parsedQuestions.length} Câu Hỏi`
                    : `Xác Nhận Lưu ${parsedQuestions.length} Câu Hỏi Vào Đề`}
                </span>
              </button>
            </div>
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
