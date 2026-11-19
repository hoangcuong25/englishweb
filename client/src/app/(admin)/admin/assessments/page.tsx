'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomSelect from '@/components/ui/custom-select';
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
          { value: 'CLASS_MANAGEMENT', label: 'Quản trị Lớp học & Tương tác EdTech' },
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
      const options = [
        { content: qFormData.optionA || 'Lựa chọn A', isCorrect: qFormData.correctAnswer === 'A' },
        { content: qFormData.optionB || 'Lựa chọn B', isCorrect: qFormData.correctAnswer === 'B' },
        { content: qFormData.optionC || 'Lựa chọn C', isCorrect: qFormData.correctAnswer === 'C' },
        { content: qFormData.optionD || 'Lựa chọn D', isCorrect: qFormData.correctAnswer === 'D' },
      ];

      await quizzesService.createQuestion({
        quizId: qFormData.targetQuizId,
        questionText: qFormData.questionText,
        skillType: qFormData.skill,
        type: qFormData.type,
        explanation: qFormData.explanation,
        options,
      });

      showNotice('✅ Đã thêm câu hỏi trắc nghiệm mới thành công!');
      await fetchQuizzesAndTests();
      setIsQuestionModalOpen(false);
    } catch (err: unknown) {
      showNotice(`❌ Lỗi khi thêm câu hỏi: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
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
                  { id: 'ALL', label: `Tất Cả (${mockTests.length})` },
                  {
                    id: 'ENGLISH',
                    label: `🇬🇧 Tiếng Anh & IELTS (${
                      mockTests.filter((t) =>
                        ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(t.category || 'IELTS'),
                      ).length
                    })`,
                  },
                  {
                    id: 'PERSONAL_DEV',
                    label: `🌟 Kỹ Năng & Sư Phạm (${
                      mockTests.filter((t) =>
                        ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(
                          t.category || '',
                        ),
                      ).length
                    })`,
                  },
                ].map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setFilterTrack(track.id as any);
                      setFilterCategory('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      filterTrack === track.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {track.label}
                  </button>
                ))}
              </div>

              {/* Quiz Type Quick Filter */}
              <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1">
                  Loại Bài:
                </span>
                {[
                  { id: 'ALL', label: 'Tất Cả Loại' },
                  { id: 'FULL_MOCK_TEST', label: '🏆 Thi Thử (Mock)' },
                  { id: 'SITUATION_QUIZ', label: '🎯 Tình Huống (Case)' },
                  { id: 'PRACTICE_TEST', label: '📝 Luyện Tập' },
                  { id: 'LESSON_QUIZ', label: '📖 Bài Học' },
                ].map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => setFilterQuizType(tp.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                      filterQuizType === tp.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tp.label}
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
                      { id: 'PEDAGOGY', label: '🌟 Sư Phạm EdTech' },
                      { id: 'LIFE_SKILLS', label: '🌟 Kỹ Năng Sống' },
                      { id: 'SOFT_SKILLS', label: '🌟 Kỹ Năng Mềm' },
                      { id: 'PERSONAL_DEV', label: '🌟 Bản Thân' },
                    ]
                  : filterTrack === 'ENGLISH'
                  ? [
                      { id: 'ALL', label: 'Tất cả Tiếng Anh' },
                      { id: 'IELTS', label: '🇬🇧 IELTS 4 Kỹ Năng' },
                      { id: 'ENGLISH', label: '🇬🇧 General English' },
                      { id: 'BUSINESS', label: '🇬🇧 Business English' },
                      { id: 'KIDS', label: '🇬🇧 Kids English' },
                    ]
                  : [
                      { id: 'ALL', label: 'Tất cả danh mục' },
                      { id: 'IELTS', label: '🇬🇧 IELTS' },
                      { id: 'ENGLISH', label: '🇬🇧 General' },
                      { id: 'BUSINESS', label: '🇬🇧 Business' },
                      { id: 'PEDAGOGY', label: '🌟 Sư Phạm' },
                      { id: 'LIFE_SKILLS', label: '🌟 Kỹ Năng Sống' },
                      { id: 'SOFT_SKILLS', label: '🌟 Kỹ Năng Mềm' },
                      { id: 'PERSONAL_DEV', label: '🌟 Bản Thân' },
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
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10.5px] font-black ${
                                  isPersonalDev ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                                }`}>
                                  {isPersonalDev ? '🌟 ' : '🇬🇧 '}
                                  {t.category || 'IELTS'}
                                </span>
                                {t.courseTitle && (
                                  <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[140px]">
                                    📚 {t.courseTitle}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-black ${
                                t.quizType === 'SITUATION_QUIZ'
                                  ? 'bg-purple-100 text-purple-800'
                                  : t.quizType === 'FULL_MOCK_TEST'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {t.quizType === 'SITUATION_QUIZ'
                                  ? '🎯 Tình Huống'
                                  : t.quizType === 'FULL_MOCK_TEST'
                                  ? '🏆 Thi Thử'
                                  : t.quizType === 'LESSON_QUIZ'
                                  ? '📖 Bài Học'
                                  : '📝 Luyện Tập'}
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
                    <span>🇬🇧 Tiếng Anh & IELTS</span>
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
                    <span>🌟 Phát Triển Cá Nhân & Sư Phạm</span>
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
                          { value: 'PEDAGOGY', label: '🌟 Năng Lực Sư Phạm EdTech' },
                          { value: 'LIFE_SKILLS', label: '🌟 Kỹ Năng Sống & Thuyết Trình' },
                          { value: 'SOFT_SKILLS', label: '🌟 Kỹ Năng Mềm Doanh Nghiệp' },
                          { value: 'PERSONAL_DEV', label: '🌟 Phát Triển Bản Thân & Lãnh Đạo' },
                        ]
                      : [
                          { value: 'IELTS', label: '🇬🇧 IELTS 4 Kỹ Năng Master' },
                          { value: 'ENGLISH', label: '🇬🇧 General English' },
                          { value: 'BUSINESS', label: '🇬🇧 Business English' },
                          { value: 'KIDS', label: '🇬🇧 Kids English' },
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
                    { value: 'SITUATION_QUIZ', label: '🎯 Trắc nghiệm Tình huống (Case Study)' },
                    { value: 'FULL_MOCK_TEST', label: '🏆 Đề Thi Thử Hoàn Chỉnh (Full Mock Test)' },
                    { value: 'PRACTICE_TEST', label: '📝 Mini-Test / Luyện tập chuyên đề' },
                    { value: 'LESSON_QUIZ', label: '📖 Trắc nghiệm củng cố bài học' },
                    { value: 'DIAGNOSTIC_TEST', label: '🔍 Bài đánh giá chẩn đoán năng lực' },
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả mục tiêu kiểm tra
                </label>
                <textarea
                  rows={2}
                  value={testFormData.description}
                  onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                  placeholder="Mô tả bối cảnh, năng lực trọng tâm cần đánh giá..."
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs"
                />
              </div>

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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {testFormData.track === 'PERSONAL_DEV'
                    ? 'Bối cảnh tình huống thực tế / Case Study (Scenario Text - Tùy chọn)'
                    : 'Đoạn văn đọc hiểu (Passage - Tùy chọn)'}
                </label>
                <textarea
                  rows={3}
                  value={testFormData.passage}
                  onChange={(e) => setTestFormData({ ...testFormData, passage: e.target.value })}
                  placeholder={
                    testFormData.track === 'PERSONAL_DEV'
                      ? 'Mô tả chi tiết tình huống thực tế (ví dụ: Trong một lớp học trực tuyến LiveKit, có 2 học viên liên tục mất tập trung...)'
                      : 'Nhập đoạn văn cho bài đọc Reading...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs"
                />
              </div>

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
                Thêm Câu Hỏi Trắc Nghiệm Mới
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={qFormData.questionText}
                  onChange={(e) => setQFormData({ ...qFormData, questionText: e.target.value })}
                  placeholder="Ví dụ: According to paragraph 2, what is the main reason for..."
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-semibold"
                ></textarea>
              </div>

              {/* 4 Options */}
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
