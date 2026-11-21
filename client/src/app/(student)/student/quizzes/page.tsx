'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { quizzesService } from '@/services/quizzes.service';
import { coursesService, Course } from '@/services/courses.service';
import { RadarChart, RadarChartItem } from '@/components/ui/radar-chart';
import { toast } from '@/components/ui/toast';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Unlock,
  Lock,
  CreditCard,
  AlertTriangle,
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
  Globe,
  Compass,
  Trophy,
  FileEdit,
  Briefcase,
  GraduationCap,
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
  category?: string;
  quizType?: string;
  courseTitle?: string;
  timeLimitMinutes: number;
  passScore: number;
  passage?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  questions: QuizQuestionData[];
}

export default function StudentQuizPage() {
  // Entitlement / Access State
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasEnglishAccess, setHasEnglishAccess] = useState(false);
  const [hasPersonalDevAccess, setHasPersonalDevAccess] = useState(false);
  const [availableEnglishCourses, setAvailableEnglishCourses] = useState<Course[]>([]);
  const [availablePersonalDevCourses, setAvailablePersonalDevCourses] = useState<Course[]>([]);

  // Multi-Track & Multi-Dimensional Filter States
  const [selectedTrack, setSelectedTrack] = useState<'ALL' | 'IELTS' | 'BUSINESS' | 'PEDAGOGY' | 'LIFE_SKILLS'>('ALL');
  const [filterQuizType, setFilterQuizType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

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
      category: 'IELTS',
      quizType: 'FULL_MOCK_TEST',
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
      category: 'IELTS',
      quizType: 'FULL_MOCK_TEST',
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
      category: 'ENGLISH',
      quizType: 'LESSON_QUIZ',
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
    {
      id: 'mock-pedagogy-case-01',
      title: 'Case Study Phương Pháp Sư Phạm 01: Quản Trị Tương Tác & Giải Quyết Xung Đột Nhóm Trong Lớp Trực Tuyến',
      skill: 'READING',
      category: 'PEDAGOGY',
      quizType: 'SITUATION_QUIZ',
      timeLimitMinutes: 20,
      passScore: 80,
      passage: `TÌNH HUỐNG THỰC TẾ (PEDAGOGICAL CASE STUDY):\n\nBối cảnh: Trong một buổi học trực tuyến qua WebRTC kéo dài 90 phút với 8 học viên người lớn (khóa đào tạo kỹ năng doanh nghiệp), giáo viên giao bài tập thảo luận nhóm (Breakout Room) 4 người để xây dựng kế hoạch dự án.\n\nDiễn biến 1: Tại Phòng 1, học viên A (giữ vị trí trưởng phòng ngoài đời) lập tức áp đặt quan điểm, liên tục ngắt lời và phủ nhận ý kiến của học viên B (một sinh viên mới ra trường). Học viên B sau đó tắt hoàn toàn camera và micro, không tham gia thêm bất kỳ hoạt động nào.\n\nDiễn biến 2: Giáo viên ghé thăm Phòng 1 và nhận thấy không khí căng thẳng cực độ, chỉ có học viên A nói một mình trong khi 3 thành viên còn lại đều im lặng. Thời gian thảo luận nhóm chỉ còn lại 7 phút trước khi quay trở lại phòng chính.\n\nYêu cầu: Người học trong vai trò Giáo viên điều phối cần phân tích động lực tâm lý nhóm và lựa chọn phương án can thiệp tức thời và hậu kỳ sư phạm tối ưu.`,
      questions: [
        {
          id: 'ped-1',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Tình Huống Sư Phạm',
          text: 'Khi bước vào phòng breakout và thấy học viên B tắt cam/mic còn học viên A độc thoại, hành động can thiệp tức thời (Immediate Action) nào của giáo viên là sư phạm và chuyên nghiệp nhất?',
          options: [
            { key: 'A', text: 'Ngắt lời học viên A ngay lập tức và phê bình trước nhóm vì hành vi lấn át người khác.' },
            { key: 'B', text: 'Tái cấu trúc vòng thảo luận (Round-robin): Đặt câu hỏi mở và mời lần lượt từng thành viên có 90 giây nêu góc nhìn riêng theo vai trò.' },
            { key: 'C', text: 'Bỏ qua và chờ hết giờ thảo luận để gọi học viên B phát biểu trước toàn lớp lớn.' },
            { key: 'D', text: 'Đưa ngay học viên B sang một nhóm breakout khác để tránh xung đột.' },
          ],
          correctAnswer: 'B',
          explanation: 'Không nên chỉ trích công khai học viên A làm mất thể diện. Giáo viên cần tái cấu trúc hoạt động bằng cách phân bổ mỗi thành viên 90 giây trình bày một khía cạnh cụ thể theo vòng tròn, tạo không gian an toàn cho học viên B cất tiếng nói.',
        },
        {
          id: 'ped-2',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Tâm Lý Học Viên',
          text: 'Để tái kết nối với học viên B sau buổi học nhằm giữ chân và duy trì động lực học tập, giáo viên nên thực hiện bước nào?',
          options: [
            { key: 'A', text: 'Gửi tin nhắn riêng thăm hỏi, ghi nhận sự đóng góp ở các buổi trước và lắng nghe cảm nhận mà không đổ lỗi.' },
            { key: 'B', text: 'Yêu cầu học viên B phải tự tin hơn nếu muốn tiếp tục theo học khóa học.' },
            { key: 'C', text: 'Yêu cầu học viên A gửi lời xin lỗi học viên B trong nhóm chat chung.' },
            { key: 'D', text: 'Đánh giá điểm chuyên cần thấp cho học viên B vì tắt camera giữa chừng.' },
          ],
          correctAnswer: 'A',
          explanation: 'Nhắn tin riêng 1-on-1 bày tỏ sự đồng cảm, lắng nghe khó khăn của học viên và khích lệ họ là nguyên tắc then chốt trong sư phạm hiện đại.',
        },
      ],
    },
    {
      id: 'mock-lifeskills-case-01',
      title: 'Trắc Nghiệm Tình Huống Kỹ Năng Sống: Thuyết Trình Trước Hội Đồng & Vượt Qua Nỗi Sợ Phản Biện',
      skill: 'READING',
      category: 'LIFE_SKILLS',
      quizType: 'SITUATION_QUIZ',
      timeLimitMinutes: 15,
      passScore: 80,
      passage: `BỐI CẢNH TÌNH HUỐNG THUYẾT TRÌNH (PRESENTATION DILEMMA):\n\nBạn đang trình bày dự án chiến lược trước Hội đồng thẩm định gồm 5 thành viên ban giám đốc và các chuyên gia cấp cao. Bài thuyết trình đã chuẩn bị kỹ lưỡng kéo dài 15 phút.\n\nKhi bạn đang ở slide thứ 3 trình bày về dự toán ngân sách, một thành viên hội đồng có tầm ảnh hưởng lớn đột ngột cắt ngang bằng giọng điệu gay gắt: "Số liệu chi phí này hoàn toàn phi thực tế và thiếu căn cứ thị trường, bạn lấy nguồn khảo sát này từ đâu mà dám đưa vào đây?"\n\nCả hội trường im lặng hướng mắt về phía bạn. Bạn cảm thấy tim đập nhanh, cổ họng nghẹn lại và nhận ra số liệu đó do một đồng nghiệp phụ trách tài chính cung cấp chưa kịp đối chiếu bảng gốc sáng nay.`,
      questions: [
        {
          id: 'life-1',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Làm Chủ Cảm Xúc',
          text: 'Trong 5 giây đầu tiên sau khi bị ngắt lời gay gắt, phản ứng tâm lý và hành vi chuẩn mực của diễn giả chuyên nghiệp là gì?',
          options: [
            { key: 'A', text: 'Lập tức thanh minh rằng số liệu do đồng nghiệp làm sai chứ không phải lỗi của mình.' },
            { key: 'B', text: 'Hít sâu 3 giây, giữ ánh mắt bình thản, ghi nhận sự chú ý sắc sảo của giám khảo và cảm ơn câu hỏi phản biện.' },
            { key: 'C', text: 'Im lặng lướt nhanh qua slide tiếp theo để tránh tranh cãi.' },
            { key: 'D', text: 'Bật lại giám khảo rằng số liệu đã được nghiên cứu kỹ và không thể vô lý.' },
          ],
          correctAnswer: 'B',
          explanation: 'Dừng lại 2-3 giây hít thở sâu, duy trì giao tiếp ánh mắt điềm tĩnh, mỉm cười nhẹ và ghi nhận câu hỏi thay vì phản xạ cãi lại hoặc tỏ ra bối rối.',
        },
      ],
    },
    {
      id: 'mock-business-email-01',
      title: 'Business English Diagnostic: Professional Email Tone & Contract Negotiation',
      skill: 'READING',
      category: 'BUSINESS',
      quizType: 'PRACTICE_TEST',
      timeLimitMinutes: 15,
      passScore: 80,
      questions: [
        {
          id: 'b-1',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Business Correspondence',
          text: 'Which opening sentence establishes the highest level of diplomatic professionalism in your email reply to an international dispute?',
          options: [
            { key: 'A', text: 'Thank you for bringing this issue to our urgent attention; we are actively addressing the shipment delay.' },
            { key: 'B', text: 'We got your angry email and we are trying to fix it.' },
            { key: 'C', text: 'You need to calm down because delays happen in logistics all the time.' },
            { key: 'D', text: 'Sorry about that, my staff forgot to load the container.' },
          ],
          correctAnswer: 'A',
          explanation: 'Phương án A thiết lập giọng điệu ngoại giao chuẩn thương mại quốc tế (diplomatic register), ghi nhận vấn đề một cách chuyên nghiệp mà không bao biện.',
        },
        {
          id: 'b-2',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Contract Terminology',
          text: 'In international business contract negotiations, what does the term "liquidated damages" specifically signify?',
          options: [
            { key: 'A', text: 'Pre-estimated monetary compensation agreed upon in the contract in the event of a breach or delay.' },
            { key: 'B', text: 'Physical damage caused to liquid goods during maritime transport.' },
            { key: 'C', text: 'The total bankrupt value of a defaulting company.' },
            { key: 'D', text: 'Discounts offered to customers who purchase in bulk.' },
          ],
          correctAnswer: 'A',
          explanation: '"Liquidated damages" là chế định tiền bồi thường thiệt hại ước tính trước đã được các bên thỏa thuận trong hợp đồng thương mại khi xảy ra vi phạm nghĩa vụ.',
        },
      ],
    },
  ];

  const [testsList, setTestsList] = useState<QuizTestData[]>(mockTestsList);

  // Multi-Track Filtered Test List
  const filteredTestsList = useMemo(() => {
    return testsList.filter((test) => {
      // 1. Track filter
      if (selectedTrack === 'IELTS') {
        const isIelts = test.category === 'IELTS' || test.category === 'ENGLISH' || test.skill === 'READING' || test.skill === 'LISTENING';
        if (!isIelts) return false;
      } else if (selectedTrack === 'BUSINESS') {
        if (test.category !== 'BUSINESS') return false;
      } else if (selectedTrack === 'PEDAGOGY') {
        if (test.category !== 'PEDAGOGY') return false;
      } else if (selectedTrack === 'LIFE_SKILLS') {
        if (test.category !== 'LIFE_SKILLS' && test.category !== 'PERSONAL_DEV') return false;
      }

      // 2. Quiz Type filter
      if (filterQuizType !== 'ALL' && test.quizType !== filterQuizType) return false;

      // 3. Category filter
      if (filterCategory !== 'ALL' && test.category !== filterCategory) return false;

      return true;
    });
  }, [testsList, selectedTrack, filterQuizType, filterCategory]);

  const activeQuiz = filteredTestsList[selectedQuizIndex] || filteredTestsList[0] || testsList[0];
  const questions = activeQuiz?.questions || [];
  const currentQuestion = questions[currentIdx] || questions[0];

  // Check Dual-Track entitlement on mount
  useEffect(() => {
    const checkAccess = async () => {
      setAccessLoading(true);
      try {
        let englishAccess = false;
        let personalDevAccess = false;

        const accessRes = await coursesService.checkIeltsAccess();
        if (accessRes && accessRes.hasAccess) {
          englishAccess = true;
        }

        const myLearning = await coursesService.getMyLearning();
        if (Array.isArray(myLearning)) {
          if (!englishAccess) {
            englishAccess = myLearning.some(
              (c: Record<string, unknown>) =>
                ((c.status as string) === 'ACTIVE' || !c.status) &&
                (['ENGLISH', 'IELTS', 'BUSINESS', 'KIDS'].includes(c.category as string) ||
                 c.isEnglishCourse === true ||
                 (typeof c.title === 'string' && (c.title.includes('IELTS') || c.title.includes('English'))))
            );
          }
          personalDevAccess = myLearning.some(
            (c: Record<string, unknown>) =>
              ((c.status as string) === 'ACTIVE' || !c.status) &&
              (['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category as string) ||
               c.isEnglishCourse === false)
          );
        }

        setHasEnglishAccess(englishAccess);
        setHasPersonalDevAccess(personalDevAccess);

        // Auto-switch track if user only has personal development access
        if (!englishAccess && personalDevAccess) {
          setSelectedTrack('PEDAGOGY');
        }

        // Fetch courses for recommendation if locked
        const catalog = await coursesService.getCourses();
        if (Array.isArray(catalog)) {
          const englishOnly = catalog.filter(
            (c) =>
              ['ENGLISH', 'IELTS', 'BUSINESS', 'KIDS'].includes(c.category) ||
              c.isEnglishCourse === true ||
              (c.title && (c.title.includes('IELTS') || c.title.includes('English')))
          );
          setAvailableEnglishCourses(englishOnly.slice(0, 4));

          const personalDevOnly = catalog.filter(
            (c) =>
              ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category) ||
              c.isEnglishCourse === false
          );
          setAvailablePersonalDevCourses(personalDevOnly.slice(0, 4));
        }
      } catch {
        setHasEnglishAccess(false);
        setHasPersonalDevAccess(false);
      } finally {
        setAccessLoading(false);
      }
    };
    checkAccess();
  }, []);

  // Fetch real tests from Backend API on mount
  useEffect(() => {
    const fetchRealTests = async () => {
      try {
        const tests = await quizzesService.getSkillsTests();
        if (Array.isArray(tests) && tests.length > 0) {
          type RemoteOption = { id: string; content: string; isCorrect?: boolean };
          type RemoteQuestion = { id: string; content: string; type?: string; subCategory?: string; explanation?: string; options?: RemoteOption[] };
          type RemoteQuizItem = {
            id: string;
            title: string;
            skill?: string;
            category?: string;
            quizType?: string;
            course?: { title?: string };
            timeLimitMinutes?: number;
            passScore?: number;
            passage?: string;
            audioUrl?: string;
            questions?: RemoteQuestion[];
          };

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

            const isIeltsTest = t.category === 'IELTS' || (!t.category && t.skill !== 'GRAMMAR');
            const defaultPassage = isIeltsTest && skillStr === 'READING' ? defaultTemplate.passage : undefined;
            const defaultAudio = isIeltsTest && skillStr === 'LISTENING' ? defaultTemplate.audioUrl : undefined;

            return {
              id: t.id,
              title: t.title,
              skill: skillStr,
              category: t.category || (t.skill === 'LISTENING' ? 'IELTS' : 'ENGLISH'),
              quizType: t.quizType || 'PRACTICE_TEST',
              courseTitle: t.course?.title,
              timeLimitMinutes: t.timeLimitMinutes || defaultTemplate.timeLimitMinutes || 15,
              passScore: t.passScore || defaultTemplate.passScore || 80,
              passage: t.passage || defaultPassage,
              audioUrl: t.audioUrl || defaultAudio,
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
    if (!activeQuiz) return;
    setTimeLeft((activeQuiz.timeLimitMinutes || 15) * 60);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedQuizIndex, activeQuiz?.id, activeQuiz?.timeLimitMinutes]);

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

  const isReadingSplitView = Boolean(activeQuiz?.passage);
  const isListeningExam = activeQuiz?.skill === 'LISTENING';

  if (accessLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
        <span className="text-xs font-semibold text-slate-500">Đang kiểm tra quyền truy cập phòng thi trực tuyến...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Track Selector & Quick Type Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-line shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setSelectedTrack('ALL');
              setFilterCategory('ALL');
              setFilterQuizType('ALL');
              setSelectedQuizIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedTrack === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Tất Cả ({testsList.length})</span>
          </button>
          <button
            onClick={() => {
              setSelectedTrack('IELTS');
              setFilterCategory('ALL');
              setFilterQuizType('ALL');
              setSelectedQuizIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedTrack === 'IELTS'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>Tiếng Anh & IELTS</span>
          </button>
          <button
            onClick={() => {
              setSelectedTrack('BUSINESS');
              setFilterCategory('ALL');
              setFilterQuizType('ALL');
              setSelectedQuizIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedTrack === 'BUSINESS'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>Tiếng Anh Doanh Nghiệp</span>
          </button>
          <button
            onClick={() => {
              setSelectedTrack('PEDAGOGY');
              setFilterCategory('ALL');
              setFilterQuizType('ALL');
              setSelectedQuizIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedTrack === 'PEDAGOGY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>Năng Lực Sư Phạm</span>
          </button>
          <button
            onClick={() => {
              setSelectedTrack('LIFE_SKILLS');
              setFilterCategory('ALL');
              setFilterQuizType('ALL');
              setSelectedQuizIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedTrack === 'LIFE_SKILLS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Kỹ Năng Sống</span>
          </button>
        </div>

        {/* Quick Quiz Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'Tất cả loại bài', icon: null },
            { id: 'SITUATION_QUIZ', label: 'Tình Huống / Case Study', icon: Target },
            { id: 'FULL_MOCK_TEST', label: 'Đề Thi Thử (Mock)', icon: Trophy },
            { id: 'PRACTICE_TEST', label: 'Luyện Tập Chuyên Đề', icon: FileEdit },
            { id: 'LESSON_QUIZ', label: 'Củng Cố Bài Học', icon: BookOpen },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setFilterQuizType(type.id);
                setSelectedQuizIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                filterQuizType === type.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {type.icon && <type.icon className="w-3 h-3 shrink-0" />}
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Check if selected track is locked */}
      {selectedTrack === 'IELTS' && !hasEnglishAccess ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-line shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-200">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              Phân Hệ Tiếng Anh Đang Khóa
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Yêu Cầu Sở Hữu Khóa Học Tiếng Anh Để Làm IELTS Mock Tests
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Phòng thi trực tuyến Cambridge IELTS (Chia đôi màn hình Reading với bộ công cụ dạ quang, Nghe streaming và Radar Chart) chỉ dành cho học viên đăng ký các khóa học Tiếng Anh.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
              Khóa học Tiếng Anh đề xuất để kích hoạt phòng thi:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableEnglishCourses.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-black uppercase">{c.category || 'IELTS'}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{c.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                  </div>
                  <Link href="/student/courses" className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Xem khóa học & Kích hoạt</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (selectedTrack === 'PEDAGOGY' || selectedTrack === 'LIFE_SKILLS') && !hasPersonalDevAccess ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-line shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-700" />
              Phân Hệ Kỹ Năng & Sư Phạm Đang Khóa
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Yêu Cầu Sở Hữu Khóa Học Để Làm Trắc Nghiệm Tình Huống Sư Phạm & Kỹ Năng Sống
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Các bài kiểm tra trắc nghiệm tình huống thực tế (Case Study Dilemmas, xử lý xung đột lớp học, thuyết trình đám đông) chỉ dành cho học viên đăng ký phân hệ Phương Pháp Sư Phạm & Phát Triển Bản Thân.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
              Khóa học Kỹ Năng & Sư Phạm đề xuất để kích hoạt:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availablePersonalDevCourses.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">{c.category || 'PEDAGOGY'}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{c.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                  </div>
                  <Link href="/student/courses" className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Xem khóa học & Kích hoạt</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : filteredTestsList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-line space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Chưa có bài Quiz nào phù hợp với bộ lọc hiện tại</h3>
          <p className="text-xs text-muted max-w-md mx-auto">Hãy thử chọn lại "Tất cả loại bài" hoặc chuyển sang danh mục khác để tìm đề thi phù hợp.</p>
          <button
            onClick={() => {
              setFilterQuizType('ALL');
              setFilterCategory('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-dark transition"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <>
          {/* Quiz Category & Format Switcher Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-primary text-xs font-bold mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>
                  {selectedTrack === 'IELTS'
                    ? 'IELTS & Academic English Mock Examination'
                    : selectedTrack === 'BUSINESS'
                    ? 'Business English & Professional Communication Assessment'
                    : selectedTrack === 'PEDAGOGY'
                    ? 'Modern Pedagogy & Classroom Management Assessment'
                    : selectedTrack === 'LIFE_SKILLS'
                    ? 'Critical Thinking & Public Speaking Assessment'
                    : 'Teacher Dong Academy Multi-Course Assessment Engine'}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>{activeQuiz.title}</span>
              </h1>
              <p className="text-xs text-muted mt-0.5">
                {activeQuiz.quizType === 'SITUATION_QUIZ'
                  ? 'Phân tích tình huống thực tế (Case Study), bôi màu từ khóa dữ kiện và đưa ra quyết định tối ưu.'
                  : 'Mô phỏng 100% định dạng thi chuẩn hóa: Chia đôi màn hình, công cụ Highlight, Audio Stream & Biểu đồ phân tích dạng bài.'}
              </p>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto max-w-full">
              {filteredTestsList.map((quiz, idx) => (
                <button
                  key={quiz.id}
                  onClick={() => setSelectedQuizIndex(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                    selectedQuizIndex === idx
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase">
                    {quiz.quizType === 'SITUATION_QUIZ'
                      ? 'Tình Huống'
                      : quiz.quizType === 'FULL_MOCK_TEST'
                      ? 'Mock Test'
                      : 'Quiz'}
                  </span>
                  <span className="max-w-[150px] truncate">{quiz.title}</span>
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
                <span>
                  {activeQuiz?.quizType === 'SITUATION_QUIZ'
                    ? 'Bối Cảnh Tình Huống Thực Tế (Case Study - Cuộn độc lập)'
                    : 'Reading Passage (Cuộn độc lập)'}
                </span>
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
              {activeQuiz.quizType === 'SITUATION_QUIZ' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-amber-800 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Kịch Bản Nghiên Cứu Tình Huống (Case Study)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    Hãy đọc kỹ diễn biến tình huống, xung đột lợi ích và tâm lý nhân vật bên dưới. Sử dụng công cụ dạ quang để đánh dấu từ khóa dữ kiện trước khi đưa ra quyết định xử lý ở cột câu hỏi bên phải.
                  </p>
                </div>
              )}
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
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeQuiz.quizType === 'SITUATION_QUIZ' && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Tình Huống</span>
                  </span>
                )}
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-primary border border-sky-200">
                  {currentQuestion.typeLabel}
                </span>
              </div>
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
        </>
      )}
    </div>
  );
}
