'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { quizzesService } from '@/services/quizzes.service';
import { RadarChart, RadarChartItem } from '@/components/ui/radar-chart';
import { toast } from '@/components/ui/toast';
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
  Headphones,
  Play,
  Pause,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE_NOT_GIVEN'
  | 'MATCHING_HEADINGS'
  | 'FILL_BLANK'
  | 'NOTE_COMPLETION';

export interface QuizQuestionData {
  id: string;
  type: QuestionType;
  typeLabel: string;
  text: string;
  options?: { key: string; text: string }[];
  matchingHeadingsList?: { id: string; title: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizTestData {
  id: string;
  title: string;
  skill: 'READING' | 'LISTENING' | 'GRAMMAR';
  timeLimitMinutes: number;
  passScore: number;
  passage?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  questions: QuizQuestionData[];
}

export default function StudentQuizPage() {
  // Test Selection State
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number>(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  // Keyword Highlighter States (for Reading Passage)
  const [highlightColor, setHighlightColor] = useState<'#fef08a' | '#a7f3d0' | '#fbcfe8'>('#fef08a');
  const passageContainerRef = useRef<HTMLDivElement>(null);
  const [activeHighlightsCount, setActiveHighlightsCount] = useState(0);

  // Listening Audio Player States (for Listening Exam)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(240); // default 4 mins
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // ==========================================
  // REALISTIC IELTS MOCK TESTS CATALOG
  // ==========================================
  const mockTestsList: QuizTestData[] = [
    {
      id: 'mock-reading-cambridge-academic',
      title: 'IELTS Academic Reading Mock Test: The Architecture of Sustainable Smart Cities',
      skill: 'READING',
      timeLimitMinutes: 20,
      passScore: 80,
      passage: `READING PASSAGE 1: THE ARCHITECTURE OF SUSTAINABLE SMART CITIES

Paragraph A: Over the past two decades, the conceptual paradigm of urban development has pivoted drastically towards environmental sustainability. Rapid demographic expansion in metropolitan centers has precipitated acute ecological strains, notably escalating carbon emissions, the creation of urban heat islands, and municipal water shortages. Contemporary urban planners argue that municipal viability in the late 21st century hinges upon "biophilic architecture" — an engineering philosophy that systematically incorporates living plant life, passive solar thermal regulation, and rainwater harvesting infrastructure directly into multi-tier residential complexes.

Paragraph B: One of the pioneering manifestations of this architectural evolution is the Bosco Verticale (Vertical Forest) in Milan, Italy. Designed by Stefano Boeri, the dual residential towers host over 900 trees and 15,000 perennial plants distributed along cantilevered concrete balconies. The vegetative perimeter acts as an organic microclimatic filter, sequestering approximately 30 tons of atmospheric carbon dioxide annually while diminishing indoor ambient temperatures by up to three degrees Celsius during summer heatwaves. Crucially, acoustic monitoring indicates that the foliage dampens external traffic resonance by approximately 25 decibels compared to adjacent conventional glass-clad towers.

Paragraph C: Despite these celebrated ecological dividends, structural engineers underscore substantial technical and logistical liabilities. Sustaining mature trees at elevations exceeding 100 meters necessitates specialized soil substrates capable of retaining nutrients without imposing catastrophic deadweight loads upon structural foundations. Furthermore, automated drip-irrigation networks, which recycle filtered greywater from residential sinks and showers, require redundant mechanical failsafes to forestall internal moisture infiltration and steel rebar oxidisation within the reinforced concrete frame.

Paragraph D: Economic analysts also caution against viewing vertical foliage as an immediate panacea for mass urban housing. The construction expenditures for biophilic skyscrapers are estimated to be 15 to 25 percent greater than traditional structural counterparts, largely attributable to structural steel reinforcement and complex aerodynamic wind-tunnel testing. Consequently, these developments have predominantly served affluent demographic strata, prompting critics to label them as "boutique greenwashing" unless municipal governments introduce statutory density bonuses and subsidies that mandate affordable units within such sustainable developments.`,
      questions: [
        {
          id: 'rq-1',
          type: 'MATCHING_HEADINGS',
          typeLabel: 'Matching Headings',
          text: 'Which heading corresponds to the main idea of Paragraph A?',
          matchingHeadingsList: [
            { id: 'i', title: 'i. Financial obstacles and equity challenges in green architecture' },
            { id: 'ii', title: 'ii. Urgent environmental pressures driving biological city planning' },
            { id: 'iii', title: 'iii. Maintenance hurdles and water system mechanics' },
            { id: 'iv', title: 'iv. Empirical ecological benefits of a landmark European project' },
            { id: 'v', title: 'v. Historical demolition of industrial districts' },
          ],
          correctAnswer: 'ii',
          explanation: 'Đoạn A khái quát các áp lực môi trường (carbon, đảo nhiệt, thiếu nước) và giới thiệu triết lý quy hoạch biophilic architecture -> Đáp án đúng là ii.',
        },
        {
          id: 'rq-2',
          type: 'MATCHING_HEADINGS',
          typeLabel: 'Matching Headings',
          text: 'Which heading corresponds to the main idea of Paragraph B?',
          matchingHeadingsList: [
            { id: 'i', title: 'i. Financial obstacles and equity challenges in green architecture' },
            { id: 'ii', title: 'ii. Urgent environmental pressures driving biological city planning' },
            { id: 'iii', title: 'iii. Maintenance hurdles and water system mechanics' },
            { id: 'iv', title: 'iv. Empirical ecological benefits of a landmark European project' },
            { id: 'v', title: 'v. Historical demolition of industrial districts' },
          ],
          correctAnswer: 'iv',
          explanation: 'Đoạn B đưa ra dẫn chứng cụ thể về dự án Vertical Forest tại Milan với các số liệu chứng minh (30 tấn CO2, giảm 3°C, giảm 25 dB tiếng ồn) -> Đáp án đúng là iv.',
        },
        {
          id: 'rq-3',
          type: 'TRUE_FALSE_NOT_GIVEN',
          typeLabel: 'True / False / Not Given',
          text: 'According to Paragraph B, the foliage on the Milan towers reduces incoming traffic noise by 25 decibels.',
          options: [
            { key: 'TRUE', text: 'TRUE' },
            { key: 'FALSE', text: 'FALSE' },
            { key: 'NOT GIVEN', text: 'NOT GIVEN' },
          ],
          correctAnswer: 'TRUE',
          explanation: 'Đoạn B nêu rõ: "foliage dampens external traffic resonance by approximately 25 decibels" -> Hoàn toàn khớp với bài đọc -> TRUE.',
        },
        {
          id: 'rq-4',
          type: 'TRUE_FALSE_NOT_GIVEN',
          typeLabel: 'True / False / Not Given',
          text: 'Stefano Boeri received funding from the United Nations to design the Vertical Forest.',
          options: [
            { key: 'TRUE', text: 'TRUE' },
            { key: 'FALSE', text: 'FALSE' },
            { key: 'NOT GIVEN', text: 'NOT GIVEN' },
          ],
          correctAnswer: 'NOT GIVEN',
          explanation: 'Bài đọc chỉ nhắc tên kiến trúc sư Stefano Boeri thiết kế dự án tại Milan, hoàn toàn không nói đến nguồn vốn tài trợ từ Liên Hợp Quốc -> NOT GIVEN.',
        },
        {
          id: 'rq-5',
          type: 'FILL_BLANK',
          typeLabel: 'Sentence Completion',
          text: 'Complete the sentence with ONE WORD from Paragraph C: "Irrigation systems recycle filtered _______ from household sinks to nourish vegetation."',
          correctAnswer: 'greywater',
          explanation: 'Đoạn C có câu: "automated drip-irrigation networks, which recycle filtered greywater from residential sinks..." -> Từ cần điền duy nhất là "greywater".',
        },
        {
          id: 'rq-6',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Multiple Choice',
          text: 'Why do critics describe some biophilic developments as "boutique greenwashing"?',
          options: [
            { key: 'A', text: 'Because the plants inevitably perish in winter conditions.' },
            { key: 'B', text: 'Because premium construction costs restrict access primarily to wealthy buyers.' },
            { key: 'C', text: 'Because municipal authorities refuse to connect them to the electric grid.' },
            { key: 'D', text: 'Because synthetic fertilizers damage local avian populations.' },
          ],
          correctAnswer: 'B',
          explanation: 'Đoạn D giải thích chi phí xây dựng cao hơn 15-25% khiến các công trình này chủ yếu phục vụ tầng lớp khá giả ("affluent demographic strata") -> Đáp án B.',
        },
      ],
    },
    {
      id: 'mock-listening-cambridge-section-1',
      title: 'IELTS Listening Mock Test: University Campus Accommodation & Facilities Registration',
      skill: 'LISTENING',
      timeLimitMinutes: 15,
      passScore: 80,
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room_tone.ogg',
      audioDurationSeconds: 180,
      questions: [
        {
          id: 'lq-1',
          type: 'NOTE_COMPLETION',
          typeLabel: 'Form / Note Completion',
          text: 'Complete the student registration card with NO MORE THAN TWO WORDS: "Hall of Residence preference: _______ Hall"',
          correctAnswer: 'Westlake',
          explanation: 'Sinh viên nêu rõ mong muốn đăng ký tại khu ký túc xá Westlake Hall gần thư viện trung tâm.',
        },
        {
          id: 'lq-2',
          type: 'NOTE_COMPLETION',
          typeLabel: 'Form / Note Completion',
          text: 'Complete the contact detail: "Student Emergency Contact Number: 07700 _______"',
          correctAnswer: '900482',
          explanation: 'Nhân viên lễ tân xác nhận dãy 6 số cuối của số điện thoại khẩn cấp là 900482.',
        },
        {
          id: 'lq-3',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Multiple Choice (Section 1)',
          text: 'Which dietary meal plan does the international student select?',
          options: [
            { key: 'A', text: 'Full Board (3 meals per day, 7 days a week)' },
            { key: 'B', text: 'Half Board (Breakfast and Dinner only)' },
            { key: 'C', text: 'Self-Catering (Shared kitchen facility access)' },
            { key: 'D', text: 'Weekend Brunch Package only' },
          ],
          correctAnswer: 'C',
          explanation: 'Sinh viên chọn phương án tự nấu ăn (Self-Catering) trong khu bếp chung để tiết kiệm chi phí và nấu đồ ăn theo chế độ riêng.',
        },
        {
          id: 'lq-4',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Multiple Choice (Section 2)',
          text: 'What time does the campus recreation center close on Friday evenings?',
          options: [
            { key: 'A', text: '19:00' },
            { key: 'B', text: '21:30' },
            { key: 'C', text: '22:00' },
            { key: 'D', text: 'Midnight' },
          ],
          correctAnswer: 'B',
          explanation: 'Theo thông báo của ban quản lý thể thao, thứ Sáu trung tâm thể thao đóng cửa lúc 21:30.',
        },
        {
          id: 'lq-5',
          type: 'FILL_BLANK',
          typeLabel: 'Short Answer Question',
          text: 'What item must students present at the security desk to obtain their electronic key fob?',
          correctAnswer: 'student ID',
          explanation: 'Học viên cần xuất trình thẻ sinh viên (student ID) cho bảo vệ để nhận chìa khóa từ.',
        },
      ],
    },
    {
      id: 'mock-checkpoint-grammar-academic',
      title: 'Module 03 Diagnostic Checkpoint: Formal Academic Register & Collocations',
      skill: 'GRAMMAR',
      timeLimitMinutes: 10,
      passScore: 80,
      questions: [
        {
          id: 'gq-1',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Multiple Choice',
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
          id: 'gq-2',
          type: 'FILL_BLANK',
          typeLabel: 'Fill In Blank',
          text: 'Fill in the blank with the appropriate academic preposition: "Children under 16 are particularly susceptible ___ peer pressure."',
          correctAnswer: 'to',
          explanation: 'Cấu trúc tính từ chuẩn là "be susceptible TO something" (dễ bị ảnh hưởng/tổn thương bởi cái gì).',
        },
      ],
    },
  ];

  const [testsList, setTestsList] = useState<QuizTestData[]>(mockTestsList);
  const activeQuiz = testsList[selectedQuizIndex] || testsList[0];
  const questions = activeQuiz.questions;
  const currentQuestion = questions[currentIdx] || questions[0];

  // Fetch real tests from Backend API on mount
  useEffect(() => {
    const fetchRealTests = async () => {
      try {
        const tests = await quizzesService.getSkillsTests();
        if (Array.isArray(tests) && tests.length > 0) {
          type RemoteOption = { id: string; content: string; isCorrect?: boolean };
          type RemoteQuestion = { id: string; content: string; type?: string; subCategory?: string; explanation?: string; options?: RemoteOption[] };
          type RemoteQuizItem = { id: string; title: string; skill?: string; timeLimitMinutes?: number; passScore?: number; passage?: string; audioUrl?: string; questions?: RemoteQuestion[] };

          const mapped: QuizTestData[] = (tests as RemoteQuizItem[]).map((t) => {
            const skillStr: 'READING' | 'LISTENING' | 'GRAMMAR' =
              t.skill === 'READING' || t.skill === 'LISTENING' ? t.skill : 'GRAMMAR';
            const defaultTemplate = mockTestsList.find((m) => m.skill === skillStr) || mockTestsList[0];

            const mappedQuestions: QuizQuestionData[] = (t.questions || []).map((q) => {
              const correctOpt = q.options?.find((o) => o.isCorrect);
              const qType = (q.type as QuestionType) || 'SINGLE_CHOICE';

              let typeLabel = 'Multiple Choice';
              if (qType === 'MATCHING_HEADINGS') typeLabel = 'Matching Headings';
              else if (qType === 'TRUE_FALSE_NOT_GIVEN') typeLabel = 'True / False / Not Given';
              else if (qType === 'NOTE_COMPLETION') typeLabel = 'Note Completion';
              else if (qType === 'FILL_BLANK') typeLabel = 'Fill In The Blank';

              return {
                id: q.id,
                type: qType,
                typeLabel,
                text: q.content,
                passageSnippet: q.subCategory,
                options: q.options?.map((o, oIdx: number) => ({
                  key: String.fromCharCode(65 + oIdx),
                  text: o.content,
                })),
                matchingHeadingsList:
                  qType === 'MATCHING_HEADINGS'
                    ? q.options?.map((o, oIdx: number) => ({
                        id: ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'][oIdx] || `h-${oIdx + 1}`,
                        title: o.content,
                      }))
                    : undefined,
                wordLimitNotice:
                  qType === 'NOTE_COMPLETION' || qType === 'FILL_BLANK'
                    ? 'NO MORE THAN TWO WORDS'
                    : undefined,
                correctAnswer: correctOpt?.content || (q.options?.[0]?.content ?? ''),
                explanation: q.explanation || 'Đáp án theo ngân hàng câu hỏi đề thi.',
              };
            });

            return {
              id: t.id,
              title: t.title,
              skill: skillStr,
              timeLimitMinutes: t.timeLimitMinutes || defaultTemplate.timeLimitMinutes,
              passScore: t.passScore || defaultTemplate.passScore,
              passage: t.passage || defaultTemplate.passage,
              audioUrl: t.audioUrl || defaultTemplate.audioUrl,
              questions: mappedQuestions.length > 0 ? mappedQuestions : defaultTemplate.questions,
            };
          });

          if (mapped.length > 0) {
            setTestsList(mapped);
          }
        }
      } catch (err) {
        console.warn('Could not load real tests from API, using default catalog:', err);
      }
    };

    fetchRealTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset exam on switch
  useEffect(() => {
    setTimeLeft(activeQuiz.timeLimitMinutes * 60);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedQuizIndex, activeQuiz.timeLimitMinutes]);

  // Exam Countdown Timer
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  // Audio Playback Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration || activeQuiz.audioDurationSeconds || 180);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeQuiz.audioDurationSeconds]);

  // Audio Controls
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + seconds));
  };

  const changePlaybackSpeed = (speed: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  // ==========================================
  // INTERACTIVE KEYWORD HIGHLIGHTER ENGINE
  // ==========================================
  const handleApplyHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      toast.info('Vui lòng bôi đen cụm từ khóa bạn muốn ghi nhớ trên bài đọc!');
      return;
    }

    const range = selection.getRangeAt(0);
    // Ensure selection is inside passage container
    if (!passageContainerRef.current || !passageContainerRef.current.contains(range.commonAncestorContainer)) {
      toast.info('Chỉ có thể bôi màu từ khóa trong phần Bài đọc Reading!');
      return;
    }

    try {
      const mark = document.createElement('mark');
      mark.style.backgroundColor = highlightColor;
      mark.style.color = '#0f172a';
      mark.style.padding = '1px 3px';
      mark.style.borderRadius = '3px';
      mark.style.fontWeight = '600';
      mark.className = 'ielts-keyword-mark shadow-sm transition';

      range.surroundContents(mark);
      selection.removeAllRanges();
      setActiveHighlightsCount((prev) => prev + 1);
      toast.success('Đã bôi màu từ khóa thành công!');
    } catch {
      toast.warning('Vui lòng chọn phạm vi từ khóa trong cùng một đoạn văn!');
    }
  }, [highlightColor]);

  const handleClearAllHighlights = () => {
    if (!passageContainerRef.current) return;
    const marks = passageContainerRef.current.querySelectorAll('.ielts-keyword-mark');
    marks.forEach((m) => {
      const parent = m.parentNode;
      while (m.firstChild) parent?.insertBefore(m.firstChild, m);
      parent?.removeChild(m);
    });
    setActiveHighlightsCount(0);
    toast.info('Đã xóa toàn bộ từ khóa đã đánh dấu.');
  };

  // Answer Selection
  const handleSelectOption = (qId: string, answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: answer,
    }));
  };

  // ==========================================
  // MULTI-DIMENSIONAL SPIDER/RADAR DIAGNOSTIC COMPUTATION
  // ==========================================
  const diagnosticResults = useMemo(() => {
    let correctCount = 0;
    const typeStats: Record<string, { label: string; total: number; correct: number }> = {};

    questions.forEach((q) => {
      const userAns = (selectedAnswers[q.id] || '').trim().toLowerCase();
      const rightAns = q.correctAnswer.trim().toLowerCase();
      const isRight = userAns === rightAns;

      if (isRight) correctCount++;

      if (!typeStats[q.type]) {
        typeStats[q.type] = {
          label: q.typeLabel,
          total: 0,
          correct: 0,
        };
      }
      typeStats[q.type].total += 1;
      if (isRight) typeStats[q.type].correct += 1;
    });

    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const isPassed = percentage >= activeQuiz.passScore;

    // Convert into Radar Chart items
    const radarData: RadarChartItem[] = Object.entries(typeStats).map(([, stat]) => {
      const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      return {
        label: stat.label,
        value: accuracy,
        maxValue: 100,
      };
    });

    // Ensure radar has at least 3 axes for aesthetic polygon rendering
    if (radarData.length === 1) {
      radarData.push({ label: 'Skimming Speed', value: 85, maxValue: 100 });
      radarData.push({ label: 'Keyword Mapping', value: 80, maxValue: 100 });
    } else if (radarData.length === 2) {
      radarData.push({ label: 'Accuracy Balance', value: 75, maxValue: 100 });
    }

    // Classify Weaknesses & Strengths
    const analyzedTypes = Object.entries(typeStats).map(([typeKey, stat]) => {
      const accuracy = Math.round((stat.correct / stat.total) * 100);
      const errorRate = 100 - accuracy;
      return {
        typeKey,
        label: stat.label,
        total: stat.total,
        correct: stat.correct,
        incorrect: stat.total - stat.correct,
        accuracy,
        errorRate,
      };
    });

    const weaknesses = analyzedTypes.filter((t) => t.accuracy < 70).sort((a, b) => b.errorRate - a.errorRate);
    const strengths = analyzedTypes.filter((t) => t.accuracy >= 70).sort((a, b) => b.accuracy - a.accuracy);

    return {
      correctCount,
      percentage,
      isPassed,
      radarData,
      weaknesses,
      strengths,
      analyzedTypes,
    };
  }, [questions, selectedAnswers, activeQuiz.passScore]);

  // Submit Handler
  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const answersPayload = questions.map((q) => {
        const val = selectedAnswers[q.id];
        const isTextQuestion = q.type === 'FILL_BLANK' || q.type === 'NOTE_COMPLETION';
        return {
          questionId: q.id,
          selectedOptionId: isTextQuestion ? undefined : val,
          textAnswer: val,
        };
      });
      const result = await quizzesService.submitQuiz(activeQuiz.id, answersPayload);
      if (result) {
        toast.success(`Đã nộp bài lên hệ thống thành công! Kết quả: ${result.score}%`);
      }
    } catch {
      // Local fallback calculation
    } finally {
      setSubmitting(false);
      setIsSubmitted(true);
      toast.success('Đã nộp bài thành công! Báo cáo chẩn đoán năng lực đã sẵn sàng.');
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(activeQuiz.timeLimitMinutes * 60);
    handleClearAllHighlights();
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isReadingSplitView = activeQuiz.skill === 'READING';
  const isListeningExam = activeQuiz.skill === 'LISTENING';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Quiz Category & Format Switcher Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-primary text-xs font-bold mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>IELTS Academic Mock Examination & Diagnostic Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{activeQuiz.title}</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Mô phỏng 100% định dạng thi máy tính Cambridge IELTS: Chia đôi màn hình Reading, Audio Stream Listening & Biểu đồ mạng nhện phân tích dạng bài.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
          {testsList.map((quiz, idx) => (
            <button
              key={quiz.id}
              onClick={() => setSelectedQuizIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                selectedQuizIndex === idx
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {quiz.skill === 'READING' ? (
                <Columns className="w-3.5 h-3.5" />
              ) : quiz.skill === 'LISTENING' ? (
                <Headphones className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{quiz.skill === 'READING' ? 'Reading Mock Test' : quiz.skill === 'LISTENING' ? 'Listening Mock Test' : 'Grammar Check'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Exam Info Bar with Question Matrix & Timer */}
      <div className="p-4 rounded-2xl bg-white border border-line shadow-sm flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center space-x-3 overflow-x-auto max-w-full pb-1">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 shrink-0">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Câu {currentIdx + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full scrollbar-none">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-7 h-7 shrink-0 rounded-lg text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
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

        {/* Timer Bar */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 font-mono font-bold text-xs text-slate-800 shrink-0">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* IELTS LISTENING AUDIO PLAYER TOOLBAR (FOR LISTENING SKILL) */}
      {/* ========================================================= */}
      {isListeningExam && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Audio Tag */}
          <audio ref={audioRef} src={activeQuiz.audioUrl} preload="metadata" />

          {/* Left: Playback controls */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={togglePlayAudio}
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition shadow-md shadow-primary/30"
              title={isPlaying ? 'Tạm dừng audio' : 'Phát audio bài nghe'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => seekRelative(-10)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center space-x-1 text-xs font-bold"
              title="Tua lùi 10 giây"
            >
              <RotateCcw className="w-4 h-4" />
              <span>-10s</span>
            </button>

            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300">
              <Headphones className="w-4 h-4 text-sky-400" />
              <span>
                {formatTimer(Math.floor(audioCurrentTime))} / {formatTimer(Math.floor(audioDuration))}
              </span>
            </div>
          </div>

          {/* Center: Audio timeline scrubber */}
          <div className="w-full md:flex-1 px-2">
            <input
              type="range"
              min="0"
              max={audioDuration || 180}
              value={audioCurrentTime}
              onChange={(e) => {
                const newT = parseFloat(e.target.value);
                setAudioCurrentTime(newT);
                if (audioRef.current) audioRef.current.currentTime = newT;
              }}
              className="w-full accent-primary h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Right: Playback Speed Control */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">Tốc độ:</span>
            {[0.8, 1.0, 1.2].map((spd) => (
              <button
                key={spd}
                onClick={() => changePlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  playbackSpeed === spd
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EXAM WORKSPACE (SPLIT-VIEW FOR READING / FULL FOR OTHERS) */}
      {/* ========================================================= */}
      <div className={`grid gap-6 ${isReadingSplitView ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: Interactive Reading Passage with Persistent Highlighter */}
        {isReadingSplitView && (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-line shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Passage Toolbar */}
            <div className="p-3.5 border-b border-line bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Reading Passage (Cuộn độc lập)</span>
              </div>

              {/* Highlighter Tool Palette */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Chọn màu:</span>
                <button
                  type="button"
                  onClick={() => setHighlightColor('#fef08a')}
                  className={`w-5 h-5 rounded-full bg-yellow-300 border transition ${
                    highlightColor === '#fef08a' ? 'border-primary ring-2 ring-primary/40' : 'border-slate-300'
                  }`}
                  title="Vàng dạ quang"
                />
                <button
                  type="button"
                  onClick={() => setHighlightColor('#a7f3d0')}
                  className={`w-5 h-5 rounded-full bg-emerald-300 border transition ${
                    highlightColor === '#a7f3d0' ? 'border-primary ring-2 ring-primary/40' : 'border-slate-300'
                  }`}
                  title="Xanh dạ quang"
                />
                <button
                  type="button"
                  onClick={() => setHighlightColor('#fbcfe8')}
                  className={`w-5 h-5 rounded-full bg-pink-300 border transition ${
                    highlightColor === '#fbcfe8' ? 'border-primary ring-2 ring-primary/40' : 'border-slate-300'
                  }`}
                  title="Hồng dạ quang"
                />

                <button
                  type="button"
                  onClick={handleApplyHighlight}
                  className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-dark text-white text-[11px] font-bold transition flex items-center space-x-1 shadow-sm"
                  title="Bôi màu cụm từ đang được chọn"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Bôi từ khóa</span>
                </button>

                {activeHighlightsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllHighlights}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Xóa tất cả từ khóa đã bôi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Reading Content */}
            <div
              ref={passageContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans select-text"
            >
              {activeQuiz.passage?.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Right Column (or Center): Interactive Questions Pane */}
        <div className={`${isReadingSplitView ? 'lg:col-span-5' : 'max-w-3xl mx-auto w-full'} space-y-5`}>
          <div className="bg-white rounded-3xl border border-line shadow-sm p-6 space-y-5">
            {/* Question Header & Type Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-sky-100 text-primary border border-sky-200">
                {currentQuestion.typeLabel}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">Câu #{currentIdx + 1} / {questions.length}</span>
            </div>

            {/* Question Text */}
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              {currentQuestion.text}
            </h2>

            {/* Render Specific IELTS Question Type Interface */}
            {currentQuestion.type === 'MATCHING_HEADINGS' ? (
              /* Dạng MATCHING HEADINGS */
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn tiêu đề đoạn văn tương ứng:
                </label>
                <div className="space-y-2">
                  {currentQuestion.matchingHeadingsList?.map((heading) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === heading.id;
                    return (
                      <button
                        key={heading.id}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(currentQuestion.id, heading.id)}
                        className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition flex items-center space-x-2.5 ${
                          isSelected
                            ? 'bg-sky-50 border-primary text-primary font-bold shadow-sm'
                            : 'bg-slate-50/60 border-line text-slate-700 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {heading.id}
                        </span>
                        <span>{heading.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : currentQuestion.type === 'TRUE_FALSE_NOT_GIVEN' ? (
              /* Dạng TRUE / FALSE / NOT GIVEN */
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {['TRUE', 'FALSE', 'NOT GIVEN'].map((optKey) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(currentQuestion.id, optKey)}
                      className={`py-3 px-2 rounded-2xl text-xs font-extrabold border transition ${
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
            ) : currentQuestion.type === 'FILL_BLANK' || currentQuestion.type === 'NOTE_COMPLETION' ? (
              /* Dạng FILL IN BLANKS & NOTE COMPLETION */
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">Điền từ cần điền vào ô trống:</label>
                  <span className="text-[10px] text-muted font-bold uppercase">NO MORE THAN TWO WORDS</span>
                </div>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={selectedAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleSelectOption(currentQuestion.id, e.target.value)}
                  placeholder="Gõ từ khóa chính xác vào đây..."
                  className="w-full px-4 py-3 rounded-xl border border-line text-sm font-semibold focus:outline-none focus:border-primary bg-slate-50 focus:bg-white transition"
                />
              </div>
            ) : (
              /* Dạng MULTIPLE CHOICE */
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
                        className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
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

            {/* In-depth Answer Key & Explanation after Submission */}
            {isSubmitted && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center space-x-2 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Đáp án chuẩn:{' '}
                    <span className="font-mono underline font-extrabold text-emerald-700">
                      {currentQuestion.correctAnswer}
                    </span>
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Pagination Controls */}
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
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-line bg-slate-50 hover:bg-slate-100 disabled:opacity-30 transition flex items-center space-x-1"
              >
                <span>Câu tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submission Action Bar */}
          <div className="bg-white rounded-3xl border border-line shadow-sm p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-medium">Tiến độ bài làm:</span>
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
                <span>Nộp Bài Chấm Tự Động</span>
              </button>
            ) : (
              <button
                onClick={handleResetQuiz}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm Lại Đề Này</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POST-SUBMISSION DETAILED DIAGNOSTIC & SPIDER/RADAR REPORT */}
      {/* ========================================================= */}
      {isSubmitted && (
        <div className="space-y-6 animate-fadeIn pt-4">
          {/* Header Summary Banner */}
          <div
            className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              diagnosticResults.isPassed
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center space-x-4">
              {diagnosticResults.isPassed ? (
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider opacity-75">
                  Báo cáo chẩn đoán năng lực tự động
                </span>
                <h3 className="text-xl font-extrabold">
                  {diagnosticResults.isPassed
                    ? 'Chúc mừng! Bạn đã đạt sàn điểm chuẩn Cambridge!'
                    : 'Chưa đạt sàn điểm tiêu chuẩn (Yêu cầu ≥ 80%)'}
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  Đúng {diagnosticResults.correctCount} / {questions.length} câu • Điểm số:{' '}
                  <span className="font-extrabold text-sm">{diagnosticResults.percentage}%</span>
                </p>
              </div>
            </div>

            {diagnosticResults.isPassed && (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                <Unlock className="w-4 h-4" />
                <span>Mở khóa thành công bài học tiếp theo</span>
              </div>
            )}
          </div>

          {/* SPIDER / RADAR CHART & QUESTION TYPES BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Spider/Radar Chart */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-line shadow-sm p-6 flex flex-col items-center justify-between">
              <div className="w-full text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-primary text-xs font-bold mb-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>Biểu Đồ Mạng Nhện (Spider Chart)</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Phân Tích Cân Bằng Đa Chiều Dạng Bài
                </h4>
                <p className="text-xs text-muted">
                  Đánh giá tỷ lệ chính xác (%) trực quan theo từng kiểu câu hỏi IELTS.
                </p>
              </div>

              {/* Pure SVG Spider Web */}
              <div className="py-4">
                <RadarChart
                  data={diagnosticResults.radarData}
                  size={320}
                  fillColor="rgba(2, 132, 199, 0.22)"
                  strokeColor="#0284c7"
                />
              </div>

              <div className="w-full pt-3 border-t border-line text-[11px] text-slate-500 text-center font-medium">
                Vùng lưới càng mở rộng về 100% phản ánh năng lực làm dạng bài đó càng vững vàng.
              </div>
            </div>

            {/* Right Card: Detailed Breakdown by Question Type */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-line shadow-sm p-6 space-y-6">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Phân Tích Dạng Bài Sai Nhiều & Đúng Nhiều</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Thống Kê Chi Tiết Từng Dạng Câu Hỏi
                </h4>
              </div>

              {/* Weaknesses List (Dạng bài sai nhiều) */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-700">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>DẠNG BÀI SAI NHIỀU (ĐIỂM YẾU CẦN KHẮC PHỤC):</span>
                </div>

                {diagnosticResults.weaknesses.length > 0 ? (
                  <div className="grid gap-2.5">
                    {diagnosticResults.weaknesses.map((w) => (
                      <div
                        key={w.typeKey}
                        className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-rose-900 text-sm">{w.label}</span>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            Sai {w.incorrect} / {w.total} câu • Tỷ lệ sai: {w.errorRate}%
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-extrabold text-xs font-mono">
                          {w.accuracy}% đúng
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Xuất sắc! Bạn không mắc sai sót đáng kể ở bất kỳ dạng bài nào.</span>
                  </div>
                )}
              </div>

              {/* Strengths List (Dạng bài đúng nhiều) */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>DẠNG BÀI LÀM TỐT NHẤT (THẾ MẠNH DUY TRÌ):</span>
                </div>

                {diagnosticResults.strengths.length > 0 ? (
                  <div className="grid gap-2.5">
                    {diagnosticResults.strengths.map((s) => (
                      <div
                        key={s.typeKey}
                        className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-emerald-950 text-sm">{s.label}</span>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Đúng {s.correct} / {s.total} câu ({s.accuracy}%)
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs font-mono">
                          Chuẩn Band 8.0+
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500 font-medium">
                    Hãy rèn luyện thêm để định hình các dạng bài thế mạnh vượt trội.
                  </div>
                )}
              </div>

              {/* Actionable Strategic Advice */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs space-y-1">
                <span className="font-bold text-sky-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Chiến thuật từ Thầy Đông Academy:</span>
                </span>
                <p className="text-sky-800 leading-relaxed">
                  Đối với dạng bài <span className="font-bold underline">{diagnosticResults.weaknesses[0]?.label || 'Matching / TFNG'}</span>, hãy rèn luyện phương pháp khoanh vùng đoạn chứa từ đồng nghĩa (Paraphrasing) thay vì đối chiếu từ vựng nguyên bản (Word-matching).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
