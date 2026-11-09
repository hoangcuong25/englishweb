'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useI18n, Language } from '@/lib/i18n-context';
import {
  Video,
  PenTool,
  Mic,
  BookOpen,
  Headphones,
  Briefcase,
  Target,
  Sparkles,
  Users,
  Award,
  Globe,
  Clock,
  CheckCircle2,
  ArrowRight,
  Send,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  GraduationCap,
  UserPlus,
} from 'lucide-react';

interface ProgramDetail {
  category: string;
  pillarId: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  targetAudience: string;
  format: string;
  icon: React.ElementType;
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();

  // Mobile menu & language dropdown states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  // Pillar filter state
  const [activePillarFilter, setActivePillarFilter] = useState<'all' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'>('all');

  // Program Detail Modal state
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);

  // Consultation form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interestedProgram: 'p1',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; tag: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', tag: 'VN', flag: '🇻🇳' },
    { code: 'en', label: 'English', tag: 'EN', flag: '🇬🇧' },
    { code: 'zh', label: '简体中文', tag: 'CN', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', tag: 'JP', flag: '🇯🇵' },
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  // Localized 20 Sub-items data across 5 pillars
  const getPillarsData = (currentLang: Language) => {
    const isEn = currentLang === 'en';
    const isZh = currentLang === 'zh';
    const isJa = currentLang === 'ja';

    return [
      {
        id: 'p1',
        title: isEn
          ? '1. English Proficiency Course'
          : isZh
          ? '1. 英语综合能力提升课程'
          : isJa
          ? '1. 英語運用能力総合コース'
          : '1. English Proficiency Course',
        code: isEn ? 'PILLAR 01' : isZh ? '核心支柱 01' : isJa ? '教育の柱 01' : 'TRỤ CỘT 01',
        badge: isEn ? '4 COURSES' : isZh ? '4 门精选课' : isJa ? '4つの講座' : '4 KHÓA HỌC',
        borderColor: 'border-t-[#1B64B0]',
        tagColor: 'text-[#1B64B0]',
        desc: isEn
          ? 'Comprehensive English training covering business communication, Cambridge IELTS test preparation, and communicative English.'
          : isZh
          ? '全方位英语能力提升体系，涵盖商务沟通、雅思考试冲分、日常流利口语及少儿英语启蒙。'
          : isJa
          ? 'ビジネス英語、IELTS試験対策、日常英会話からキッズ英語まで網羅した包括的な語学トレーニング。'
          : 'Chương trình phát triển năng lực tiếng Anh toàn diện, từ tiếng Anh công sở, luyện thi chứng chỉ quốc tế IELTS đến tiếng Anh giao tiếp và thiếu nhi.',
        programs: [
          {
            category: '1. English Proficiency Course',
            pillarId: 'p1',
            title: 'Business English for Communication',
            badge: isEn ? 'Corporate' : isZh ? '商务职场' : isJa ? 'ビジネス' : 'Doanh nghiệp',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Professional business English: contract negotiations, cross-border emails, project presentations, and online meeting facilitation.'
              : isZh
              ? '专业商务英语：商业合同谈判、跨国电子邮件书写、项目演示及线上国际会议主持。'
              : isJa
              ? '実践ビジネス英語：契約交渉、英文メール作成、プレゼンテーション、国際オンライン会議の進行。'
              : 'Tiếng Anh thương mại chuyên nghiệp: kỹ năng đàm phán hợp đồng, soạn thảo email đối tác quốc tế, thuyết trình dự án và chủ trì cuộc họp trực tuyến.',
            targetAudience: isEn ? 'Working Professionals, Managers' : isZh ? '职场人士、企业管理者' : isJa ? '社会人・マネージャー' : 'Người đi làm, Quản lý, Nhân viên văn phòng',
            format: 'LiveKit WebRTC 1:7 + LMS',
            icon: Briefcase,
          },
          {
            category: '1. English Proficiency Course',
            pillarId: 'p1',
            title: 'IELTS – Test Preparation',
            badge: 'Band 6.5 - 7.5+',
            badgeColor: 'bg-amber-100 text-amber-800',
            description: isEn
              ? 'Accelerated IELTS Academic Band 6.5 -> 7.5+: featuring instant 4-criteria AI writing evaluation and timestamped speaking feedback from Teacher Dong.'
              : isZh
              ? '雅思学术类 6.5 -> 7.5+ 冲刺课程：内置 AI 4项评分标准写作批改系统与导师时间戳精确定位口语点评。'
              : isJa
              ? 'IELTSアカデミック Band 6.5→7.5+ 突破コース：AIによる4基準ライティング即時添削と講師によるタイムスタンプ付きスピーキング指導。'
              : 'Lộ trình bứt phá IELTS Academic Band 6.5 -> 7.5+: tích hợp chấm Writing AI 4 tiêu chí chuẩn Cambridge và phòng Speaking Studio ghim nhận xét theo mốc thời gian từ Teacher Dong.',
            targetAudience: isEn ? 'High School & University Students' : isZh ? '高中生、大学生、留学生' : isJa ? '高校生・大学生・留学生' : 'Học sinh cấp 3, Sinh viên, Du học sinh',
            format: 'WebRTC LiveKit + AI Writing Engine',
            icon: Target,
          },
          {
            category: '1. English Proficiency Course',
            pillarId: 'p1',
            title: 'Conversational English',
            badge: isEn ? 'Fluency' : isZh ? '日常流利' : isJa ? '流暢な会話' : 'Phản xạ giao tiếp',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Master natural listening and speaking reflexes, standard IPA pronunciation, intonation, and real-life conversational confidence.'
              : isZh
              ? '培养纯正自然的听说反应，精细纠正国际音标 (IPA) 发音与语调，让实际交流从容自信。'
              : isJa
              ? '自然なリスニング＆スピーキングの反射神経を養成。IPA発音記号や抑揚を修正し、自信を持って話せる力を培います。'
              : 'Rèn luyện phản xạ nghe nói tiếng Anh tự nhiên, chỉnh sửa phát âm chuẩn IPA, làm chủ ngữ điệu và giao tiếp tự tin trong đời sống thực tế.',
            targetAudience: isEn ? 'All Ages Seeking Speaking Confidence' : isZh ? '所有渴望流利表达的学习者' : isJa ? '英会話に自信を持ちたいすべての年代' : 'Mọi lứa tuổi muốn tự tin nói tiếng Anh',
            format: 'Live Interactive SFU Classroom',
            icon: Headphones,
          },
          {
            category: '1. English Proficiency Course',
            pillarId: 'p1',
            title: 'English for Early Childhood',
            badge: isEn ? 'Kids (4-10)' : isZh ? '少儿启蒙' : isJa ? 'キッズ (4-10歳)' : 'Thiếu nhi (4-10t)',
            badgeColor: 'bg-amber-100 text-amber-800',
            description: isEn
              ? 'Natural language immersion for preschool & primary kids (ages 4-10) through interactive games, storytelling, and colorful whiteboard visuals.'
              : isZh
              ? '为 4-10 岁幼少儿设计的自然语言浸润法，融合趣味互动游戏、生动绘本故事与彩色白板。'
              : isJa
              ? '4〜10歳向けの自然な言語習得メソッド。インタラクティブなゲーム、絵本の読み聞かせ、カラフルなホワイトボードで楽しく学びます。'
              : 'Phương pháp thẩm thấu ngôn ngữ tự nhiên dành cho trẻ mầm non & tiểu học (4-10 tuổi) qua trò chơi, câu chuyện kể và bảng trắng trực quan nhiều màu sắc.',
            targetAudience: isEn ? 'Children aged 4 - 10' : isZh ? '4 - 10 岁学龄前及小学儿童' : isJa ? '4〜10歳の幼児・小学生' : 'Trẻ em từ 4 - 10 tuổi',
            format: 'Fun & Engaging LiveKit Classroom',
            icon: Sparkles,
          },
        ],
      },
      {
        id: 'p2',
        title: '2. Professional Development',
        code: isEn ? 'PILLAR 02' : isZh ? '核心支柱 02' : isJa ? '教育の柱 02' : 'TRỤ CỘT 02',
        badge: isEn ? '6 TOPICS' : isZh ? '6 项师资专题' : isJa ? '6つの教育テーマ' : '6 CHỦ ĐỀ SƯ PHẠM',
        borderColor: 'border-t-[#1B83B6]',
        tagColor: 'text-[#1B83B6]',
        desc: isEn
          ? 'Pedagogical training, modern teaching methodologies, embracing AI in education, and international career pathway guidance.'
          : isZh
          ? '现代教学法师资赋能，拥抱人工智能 (AI) 智慧教育浪潮，提供国际化职业生涯指引。'
          : isJa
          ? '現代的な教授法、教育現場におけるAI活用法、国際的なキャリア形成を支援する専門的トレーニング。'
          : 'Đào tạo chuyên môn sư phạm, kỹ năng giảng dạy hiện đại, đón đầu làn sóng Trí tuệ nhân tạo (AI) trong giáo dục và định hướng nghề nghiệp quốc tế.',
        programs: [
          {
            category: '2. Professional Development',
            pillarId: 'p2',
            title: 'AI Integration in Education',
            badge: 'AI EdTech',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            description: isEn
              ? 'Leverage AI (ChatGPT, Claude, Prompt Engineering, Canva AI) to generate automated lesson plans, smart quizzes, and 5x pedagogical productivity.'
              : isZh
              ? '深度应用生成式 AI 工具进行自动化备课、智能生成测验，助力教学效率提升 5 倍。'
              : isJa
              ? '生成AIを活用した授業設計の自動化、スマートテスト作成、指導効率の劇的な向上を図る実践講座。'
              : 'Ứng dụng AI đột phá (ChatGPT, Claude, Prompt Engineering, Canva AI) để thiết kế bài giảng tự động, tạo đề kiểm tra thông minh và nâng cao hiệu suất sư phạm gấp 5 lần.',
            targetAudience: isEn ? 'Teachers, Instructors, Content Creators' : isZh ? '大中小学教师、教育内容创作者' : isJa ? '教員・講師・教育コンテンツ制作者' : 'Giáo viên, Giảng viên, Nhà sáng tạo nội dung giáo dục',
            format: 'Hands-on AI Workshop',
            icon: Sparkles,
          },
          {
            category: '2. Professional Development',
            pillarId: 'p2',
            title: 'Career Guidance',
            badge: isEn ? 'Career' : isZh ? '职业规划' : isJa ? 'キャリア' : 'Định hướng',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Roadmap planning for careers in education, international scholarship strategies, and interview coaching for global institutions.'
              : isZh
              ? '国际教育行业求职规划、国际奖学金申请策略与国际学校应聘模拟面试。'
              : isJa
              ? '国際教育業界へのキャリア戦略、海外奨学金獲得ノウハウ、国際機関面接対策。'
              : 'Định hướng lộ trình nghề nghiệp trong ngành giáo dục & ngôn ngữ, chiến lược săn học bổng quốc tế và kỹ năng phỏng vấn tuyển dụng trường quốc tế.',
            targetAudience: isEn ? 'Education Students, Career Changers' : isZh ? '师范生、教育转型人才' : isJa ? '教育学部生・キャリアチェンジ希望者' : 'Sinh viên sư phạm, Người chuyển ngành giáo dục',
            format: '1-on-1 Mentoring',
            icon: Target,
          },
          {
            category: '2. Professional Development',
            pillarId: 'p2',
            title: 'Classroom Management',
            badge: isEn ? 'Management' : isZh ? '课堂组织' : isJa ? '学級運営' : 'Quản lý lớp',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Dynamic classroom facilitation, positive discipline, encouraging student engagement, and resolving classroom challenges smoothly.'
              : isZh
              ? '线上线下智慧课堂管理艺术、积极管教法、激发学员主动互动与突发状况应对。'
              : isJa
              ? '対面およびオンラインでの授業マネジメント、ポジティブな規律指導、生徒の自発的参加を促す実践技術。'
              : 'Nghệ thuật tổ chức, điều phối lớp học thông minh (trực tiếp & trực tuyến), kỷ luật tích cực, khích lệ học sinh chủ động tương tác và xử lý tình huống sư phạm khéo léo.',
            targetAudience: isEn ? 'All Educators & Teaching Assistants' : isZh ? '一线教师、助教团队' : isJa ? 'すべての指導者・ティーチングアシスタント' : 'Giáo viên các cấp, Trợ giảng',
            format: 'Practical Field Methods',
            icon: Users,
          },
          {
            category: '2. Professional Development',
            pillarId: 'p2',
            title: 'Leadership and Management',
            badge: isEn ? 'Leadership' : isZh ? '领导力' : isJa ? 'リーダーシップ' : 'Quản lý',
            badgeColor: 'bg-amber-100 text-amber-800',
            description: isEn
              ? 'Educational leadership, academic department coordination, professional workplace culture, and managing international standards.'
              : isZh
              ? '学术教研团队管理、国际化教育项目协调与跨文化团队领导力塑造。'
              : isJa
              ? '教育機関におけるマネジメント、学科コーディネート、組織文化の構築と国際標準プロジェクト運営。'
              : 'Năng lực lãnh đạo giáo dục, quản lý tổ bộ môn, xây dựng văn hóa làm việc chuyên nghiệp và điều phối dự án đào tạo chuẩn quốc tế.',
            targetAudience: isEn ? 'Department Heads & Academic Leaders' : isZh ? '学科带头人、教研主管' : isJa ? '主任教諭・教育機関管理者' : 'Tổ trưởng chuyên môn, Quản lý học thuật',
            format: 'Educational Leadership Lab',
            icon: Award,
          },
          {
            category: '2. Professional Development',
            pillarId: 'p2',
            title: 'Research Mentorship',
            badge: isEn ? 'Academic' : isZh ? '学术科研' : isJa ? '学術研究' : 'Học thuật',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Educational research methodology, qualitative/quantitative analysis, thesis mentoring, and international journal publishing.'
              : isZh
              ? '教育科学研究方法、定性与定量分析指导、硕博学位论文修改及国际期刊发表。'
              : isJa
              ? '教育研究法、質的・量的データ分析指導、修士・博士論文メンタリングおよび国際学術誌への投稿支援。'
              : 'Cố vấn phương pháp nghiên cứu khoa học giáo dục, kỹ năng phân tích định lượng/định tính, viết luận văn thạc sĩ/tiến sĩ và công bố bài báo quốc tế.',
            targetAudience: isEn ? 'Graduate Students & Researchers' : isZh ? '硕博研究生、学术学者' : isJa ? '大学院生・教育研究者' : 'Học viên cao học, Nhà nghiên cứu',
            format: 'Advanced Academic Advisory',
            icon: BookOpen,
          },
          {
            category: '2. Professional Development',
            pillarId: 'p2',
            title: 'Teaching Methodology',
            badge: isEn ? 'Pedagogy' : isZh ? '教学教法' : isJa ? '教授法' : 'Sư phạm',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'World-class pedagogical frameworks: Communicative Language Teaching (CLT), Task-Based Learning (TBL), and Flipped Classrooms.'
              : isZh
              ? '国际领先语言教学法：交际教学法 (CLT)、任务型教学 (TBL) 与翻转课堂深度实践。'
              : isJa
              ? '世界水準の教授理論：コミュニカティブ・アプローチ（CLT）、タスク中心指導法（TBL）、反転授業の実践。'
              : 'Phương pháp giảng dạy hiện đại chuẩn quốc tế: Communicative Language Teaching (CLT), Task-Based Learning (TBL), Flipped Classroom và dạy học tương tác.',
            targetAudience: isEn ? 'English Language Instructors' : isZh ? '英语专职教师' : isJa ? '英語指導者' : 'Giáo viên tiếng Anh',
            format: 'Interactive Pedagogy Suite',
            icon: PenTool,
          },
        ],
      },
      {
        id: 'p3',
        title: '3. Life Skills and Personal Growth',
        code: isEn ? 'PILLAR 03' : isZh ? '核心支柱 03' : isJa ? '教育の柱 03' : 'TRỤ CỘT 03',
        badge: isEn ? '3 CORE SKILLS' : isZh ? '3 大核心技能' : isJa ? '3つの重要スキル' : '3 KỸ NĂNG VÀNG',
        borderColor: 'border-t-[#FFB547]',
        tagColor: 'text-[#B26A00]',
        desc: isEn
          ? 'Integrating English with essential 21st-century capabilities: sharpening critical thinking, confident public speaking, and thriving under pressure.'
          : isZh
          ? '将语言学习融入 21 世纪核心素养：锤炼批判性思考、攻克公众演讲恐惧并善于在高压下高效产出。'
          : isJa
          ? '21世紀型スキルと英語の融合：論理的思考力の深化、堂々たるパブリックスピーチ、プレッシャー下での成果創出。'
          : 'Học tiếng Anh gắn liền với bộ kỹ năng thế kỷ 21: mài sắc tư duy phản biện, làm chủ nghệ thuật thuyết trình trước công chúng và làm việc hiệu quả dưới áp lực cao.',
        programs: [
          {
            category: '3. Life Skills and Personal Growth',
            pillarId: 'p3',
            title: 'Critical Thinking and Problem Solving',
            badge: isEn ? 'Critical Mind' : isZh ? '批判思维' : isJa ? '思考力' : 'Tư duy phản biện',
            badgeColor: 'bg-amber-100 text-amber-800',
            description: isEn
              ? 'Train habits of rigorous logical questioning, identifying cognitive fallacies, multidimensional data analysis, and innovative solutions.'
              : isZh
              ? '训练严密逻辑思维习惯，识别常见认知谬误，掌握多维度数据剖析与创造性问题求解。'
              : isJa
              ? '論理的推論習慣を身につけ、認知の歪みを回避。多角的なデータ分析と創造的課題解決力を養成します。'
              : 'Rèn luyện thói quen tư duy phản biện, nhận diện bẫy ngụy biện logic, phân tích dữ liệu đa chiều và đưa ra giải pháp sáng tạo cho các thách thức thực tế.',
            targetAudience: isEn ? 'Students & Working Adults' : isZh ? '青年学生、职场人士' : isJa ? '学生・ビジネスパーソン' : 'Học sinh, Sinh viên, Người đi làm',
            format: 'Interactive Problem Labs',
            icon: Sparkles,
          },
          {
            category: '3. Life Skills and Personal Growth',
            pillarId: 'p3',
            title: 'Public Speaking and Presentation Skills',
            badge: isEn ? 'Oratory' : isZh ? '公众演讲' : isJa ? 'スピーチ' : 'Thuyết trình',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Conquer stage fright, master compelling storytelling, vocal modulation, body language dynamics, and audience engagement.'
              : isZh
              ? '克服当众发言恐惧，精通引人入胜的故事讲述法 (Storytelling)，掌控声音抑扬顿挫与肢体语言。'
              : isJa
              ? '人前での緊張を克服し、聴衆を惹きつけるストーリーテリング、声のトーンコントロール、身体言語を習得。'
              : 'Khắc phục nỗi sợ nói trước đám đông, nghệ thuật kể chuyện (Storytelling), kiểm soát cao độ giọng nói, ngôn ngữ hình thể và thiết kế bài thuyết trình cuốn hút.',
            targetAudience: isEn ? 'Anyone Aspiring to Speak Powerfully' : isZh ? '全年龄段学习者' : isJa ? 'すべての希望者' : 'Mọi lứa tuổi',
            format: 'Live Stage Practice',
            icon: Mic,
          },
          {
            category: '3. Life Skills and Personal Growth',
            pillarId: 'p3',
            title: 'Time Management and Working Under Pressure',
            badge: isEn ? 'Time Mastery' : isZh ? '时间管理' : isJa ? '時間管理' : 'Quản trị thời gian',
            badgeColor: 'bg-amber-100 text-amber-800',
            description: isEn
              ? 'Productivity frameworks (Eisenhower Matrix, Pomodoro), sustained focus training, stress mitigation, and performance endurance.'
              : isZh
              ? '艾森豪威尔矩阵与番茄工作法实践，保持高度专注、有效管理压力并在紧迫期限下维持顶尖表现。'
              : isJa
              ? 'アイゼンハワー・マトリクスやポモドーロ法による生産性向上。集中力維持とストレス耐性の強化。'
              : 'Phương pháp quản trị thời gian tối ưu (Eisenhower Matrix, Pomodoro), giữ vững sự tập trung cao độ, quản trị căng thẳng và duy trì phong độ dưới áp lực thời gian.',
            targetAudience: isEn ? 'Exam Takers & Busy Professionals' : isZh ? '备考生、高负荷工作者' : isJa ? '受験生・多忙なビジネスパーソン' : 'Học sinh ôn thi, Nhân sự bận rộn',
            format: 'Actionable Life Coaching',
            icon: Clock,
          },
        ],
      },
      {
        id: 'p4',
        title: '4. Life Experiences and Inspiration',
        code: isEn ? 'PILLAR 04' : isZh ? '核心支柱 04' : isJa ? '教育の柱 04' : 'TRỤ CỘT 04',
        badge: isEn ? '4 THEMES' : isZh ? '4 项启发专题' : isJa ? '4つの体験談' : '4 CHUYÊN ĐỀ',
        borderColor: 'border-t-[#E11D48]',
        tagColor: 'text-[#E11D48]',
        desc: isEn
          ? 'Real-world stories, transformative insights, and international teaching journeys shared directly by Teacher Dong.'
          : isZh
          ? '真切生动的跨国经历、海外从教感悟以及董老师数十年沉淀的育人哲学与人生体悟。'
          : isJa
          ? '専任講師ドンの長年の海外指導経験、異文化での生活、人生の転機となった実話を共有。'
          : 'Những chia sẻ người thật việc thật, câu chuyện truyền cảm hứng và bài học xương máu đúc kết từ quá trình giảng dạy, sinh sống và lập nghiệp tại các quốc gia.',
        programs: [
          {
            category: '4. Life Experiences and Inspiration',
            pillarId: 'p4',
            title: 'Inspirational Talks',
            badge: isEn ? 'Talks' : isZh ? '励志讲座' : isJa ? '対談' : 'Tọa đàm',
            badgeColor: 'bg-rose-100 text-rose-800',
            description: isEn
              ? 'Monthly talk series igniting aspirations, overcoming language anxiety, shaping personal purpose, and cultivating positivity.'
              : isZh
              ? '每月名师系列讲座，点亮学习信念，突破心理自卑，树立人生愿景并传递积极力量。'
              : isJa
              ? '毎月の特別対談。語学への苦手意識を克服し、志を高く持ち、前向きなエネルギーを育む場。'
              : 'Chuỗi tọa đàm thắp sáng khát vọng học hỏi, vượt qua rào cản tự ti ngôn ngữ, định hình lý tưởng sống và tiếp thêm năng lượng tích cực.',
            targetAudience: isEn ? 'Learners & Readers Community' : isZh ? '广大学员与读者群体' : isJa ? '受講生およびコミュニティ読者' : 'Cộng đồng học viên & Độc giả',
            format: 'Monthly Interactive Talkshow',
            icon: Star,
          },
          {
            category: '4. Life Experiences and Inspiration',
            pillarId: 'p4',
            title: 'Lessons from Teaching Abroad',
            badge: isEn ? 'Global' : isZh ? '海外教学' : isJa ? '海外教育' : 'Quốc tế',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Authentic reflections on classroom cultural dynamics, pedagogy contrasts, and pedagogical growth across diverse foreign institutions.'
              : isZh
              ? '多年海外执教的真实回忆、多元文化课堂的碰撞与教学智慧沉淀。'
              : isJa
              ? '海外教育現場での実体験、多文化クラスにおける指導の工夫、異文化理解の教訓録。'
              : 'Những trải nghiệm chân thực, sự khác biệt văn hóa lớp học và bài học sư phạm đúc rút từ nhiều năm trực tiếp giảng dạy tại các môi trường quốc tế.',
            targetAudience: isEn ? 'Educators & Global Dreamers' : isZh ? '青年教育工作者、留学者' : isJa ? '教育関係者・海外進出を目指す若者' : 'Giáo viên, Giới trẻ đam mê giáo dục',
            format: 'Memoir & Masterclasses',
            icon: Globe,
          },
          {
            category: '4. Life Experiences and Inspiration',
            pillarId: 'p4',
            title: 'Living and Working Overseas',
            badge: isEn ? 'Integration' : isZh ? '海外求职' : isJa ? '海外生活' : 'Hội nhập',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'Survival guides, cross-border job searches, cultural adaptation, and thriving in multinational workspaces abroad.'
              : isZh
              ? '海外求职实战指南、跨国公司职场生存法则与融入异国社区的核心策略。'
              : isJa
              ? '海外での就労・生活サバイバルガイド。異国でのコミュニティ適応と多国籍職場での活躍術。'
              : 'Cẩm nang sinh tồn, kinh nghiệm tìm kiếm việc làm, hòa nhập cộng đồng và làm việc hiệu quả trong môi trường đa quốc gia ở nước ngoài.',
            targetAudience: isEn ? 'Overseas Students & Expats' : isZh ? '海外学子、新移民群体' : isJa ? '留学生・海外移住者' : 'Du học sinh, Người định cư',
            format: 'Field Guides & Workshops',
            icon: Briefcase,
          },
          {
            category: '4. Life Experiences and Inspiration',
            pillarId: 'p4',
            title: 'Personal Stories and Reflections',
            badge: isEn ? 'Reflections' : isZh ? '导师心声' : isJa ? 'エッセイ' : 'Tự sự Teacher Dong',
            badgeColor: 'bg-amber-100 text-amber-800',
            description: isEn
              ? 'Poignant essays and philosophical reflections on education, mentorship, and building Teacher Dong Academy.'
              : isZh
              ? '董老师亲笔随笔，关于教育情怀、生活哲思以及创立学院背后的温暖初心。'
              : isJa
              ? '教育への想い、日々の思索、そしてアカデミー設立に込めた情熱を綴るエッセイ集。'
              : 'Tản văn và những chiêm nghiệm sâu sắc của Teacher Dong về cuộc sống, triết lý giáo dục nhân văn và hành trình gầy dựng Teacher Dong Academy.',
            targetAudience: isEn ? 'All Readers' : isZh ? '所有心系教育的读者' : isJa ? 'すべての読者' : 'Tất cả bạn đọc',
            format: 'Literary Essays & Reflections',
            icon: BookOpen,
          },
        ],
      },
      {
        id: 'p5',
        title: '5. Travel and Culture Blog',
        code: isEn ? 'PILLAR 05' : isZh ? '核心支柱 05' : isJa ? '教育の柱 05' : 'TRỤ CỘT 05',
        badge: isEn ? '3 BLOG SERIES' : isZh ? '3 大文化专栏' : isJa ? '3つの文化連載' : '3 CHỦ ĐỀ BLOG',
        borderColor: 'border-t-[#10B981]',
        tagColor: 'text-[#059669]',
        desc: isEn
          ? 'Cross-cultural exploration: discovering Asian heritage, culinary art, local dialects, and fostering a global citizen mindset.'
          : isZh
          ? '多民族文化交流窗口：探索亚洲名胜精粹、民间语言掌故与全球公民视野的启迪。'
          : isJa
          ? '異文化理解の窓：アジア各地の歴史や食文化、現地言語の魅力、地球市民としての教養の育成。'
          : 'Không gian văn hóa đa sắc tộc: khám phá vẻ đẹp danh lam thắng cảnh Châu Á, câu chuyện ngôn ngữ bản địa và nuôi dưỡng tư duy công dân toàn cầu.',
        programs: [
          {
            category: '5. Travel and Culture Blog',
            pillarId: 'p5',
            title: 'Cultural Awareness',
            badge: isEn ? 'Culture' : isZh ? '跨文化' : isJa ? '異文化理解' : 'Nhận thức văn hóa',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            description: isEn
              ? 'Expanding cultural empathy, respecting global customs, non-verbal etiquette, and cosmopolitan communication graces.'
              : isZh
              ? '拓宽文化共情能力、尊重多元风俗习俗、掌握非语言社交礼仪与国际交往规范。'
              : isJa
              ? '文化的共感力、各国の慣習や非言語コミュニケーションのマナー、国際社会での洗練された立ち振る舞い。'
              : 'Mở rộng nhận thức văn hóa, tôn trọng phong tục đa quốc gia, nghi thức giao tiếp phi ngôn ngữ và kỹ năng ứng xử tinh tế trong thế giới phẳng.',
            targetAudience: isEn ? 'Culture Lovers & Travelers' : isZh ? '文化爱好者、背包客' : isJa ? '文化探訪を愛するすべての人' : 'Mọi người yêu thích văn hóa',
            format: 'Essays & Cultural Guides',
            icon: Globe,
          },
          {
            category: '5. Travel and Culture Blog',
            pillarId: 'p5',
            title: 'Discovering Asia',
            badge: isEn ? 'Asia Travel' : isZh ? '探索亚洲' : isJa ? 'アジア探訪' : 'Khám phá Châu Á',
            badgeColor: 'bg-amber-100 text-amber-800',
            description: isEn
              ? 'Adventures through heritage landmarks, culinary gems, and cultural depth across Japan, China, Southeast Asia, and beyond.'
              : isZh
              ? '走读日本、中国及东南亚各地的历史名胜古迹与舌尖上的传统美食。'
              : isJa
              ? '日本、中国、東南アジアの歴史遺産、郷土の味、奥深い歴史探訪記。'
              : 'Hành trình trải nghiệm danh lam thắng cảnh, ẩm thực tinh hoa và chiều sâu lịch sử của các quốc gia Châu Á (Nhật Bản, Trung Quốc, Đông Nam Á...).',
            targetAudience: isEn ? 'Explorers & World Travelers' : isZh ? '热爱旅行探索的旅人' : isJa ? '旅を愛する旅行者' : 'Người yêu du lịch & khám phá',
            format: 'Travel Journals',
            icon: Star,
          },
          {
            category: '5. Travel and Culture Blog',
            pillarId: 'p5',
            title: 'Language and People',
            badge: isEn ? 'Linguistics' : isZh ? '语言人文' : isJa ? '言語と人間' : 'Ngôn ngữ & Con người',
            badgeColor: 'bg-[#DDF3FC] text-[#1B64B0]',
            description: isEn
              ? 'The magic of local dialects, historical origins of quirky idioms, and touching everyday encounters with native peoples.'
              : isZh
              ? '方言俚语的独特魅力、趣闻成语的演变历史与平凡质朴的人情故事。'
              : isJa
              ? '方言の豊かな響き、成句・慣用句の語源、心温まる人々の日常の物語。'
              : 'Sự kỳ diệu của ngôn ngữ bản xứ, nguồn gốc thú vị của các thành ngữ địa phương và những câu chuyện con người bình dị, ấm áp.',
            targetAudience: isEn ? 'Linguistics & Humanity Enthusiasts' : isZh ? '语言学与人文研究爱好者' : isJa ? '言語・人文科学ファン' : 'Người say mê ngôn ngữ học',
            format: 'Linguistic Chronicles',
            icon: Users,
          },
        ],
      },
    ];
  };

  const pillarsData = getPillarsData(lang);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        interestedProgram: 'p1',
        message: '',
      });
    }, 4000);
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openProgramModalFromPillar = (program: ProgramDetail) => {
    setSelectedProgram(program);
  };

  const handleEnrollFromModal = () => {
    if (selectedProgram) {
      setFormData((prev) => ({
        ...prev,
        interestedProgram: selectedProgram.pillarId,
      }));
      setSelectedProgram(null);
      scrollToSection('consultation-section');
    }
  };

  const filteredPillars = activePillarFilter === 'all'
    ? pillarsData
    : pillarsData.filter((p) => p.id === activePillarFilter);

  return (
    <div className="min-h-screen bg-[#F7FAFD] text-[#14263D] font-sans antialiased overflow-x-hidden selection:bg-[#DDF3FC] selection:text-[#1B64B0]">
      {/* 1. TOP NAVY BORDER BAR */}
      <div className="h-1.5 sm:h-2 bg-[#1B64B0] w-full"></div>

      {/* 2. MAIN HEADER / NAVBAR (Zero-Shift 3-Zone Layout) */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur border-b border-[#E1EBF5] shadow-xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Logo & Title (Fixed min-width, never shifts) */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1B64B0] text-white font-black text-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              TD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-lg sm:text-2xl text-[#14263D] tracking-tight leading-none group-hover:text-[#1B64B0] transition-colors truncate">
                Teacher Dong
              </span>
              <span className="text-[11px] sm:text-[11.5px] text-[#55687D] font-medium leading-tight mt-1 hidden sm:block truncate">
                Academy • Learn. Grow. Share. Inspire.
              </span>
            </div>
          </Link>

          {/* Zone 2: Desktop Nav Links (Hidden on mobile/tablet, centered) */}
          <nav className="hidden xl:flex items-center justify-center gap-6 2xl:gap-8 flex-1 px-4">
            <button
              type="button"
              onClick={() => scrollToSection('home-programs-section')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer whitespace-nowrap"
            >
              {t('nav.programs')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about-teacher-dong')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer whitespace-nowrap"
            >
              {t('nav.about')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tech-preview-section')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer whitespace-nowrap"
            >
              {t('nav.techPreview')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('consultation-section')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer whitespace-nowrap"
            >
              {t('nav.consultation')}
            </button>
          </nav>

          {/* Zone 3: Right Controls (Language Selector, Login, Register) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-4 shrink-0">
            {/* Language Selector Pill with Fixed Width (w-[136px] prevents layout jump) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="w-[128px] sm:w-[138px] flex items-center justify-between px-3 sm:px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:border-[#1B64B0] transition-all cursor-pointer shadow-2xs"
                aria-label="Language Selector"
              >
                <span className="text-[11px] sm:text-[11.5px] font-black text-[#64748B] tracking-wider uppercase shrink-0">
                  {currentLangObj.tag}
                </span>
                <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#1E293B] truncate px-1 text-center">
                  {currentLangObj.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E1EBF5] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm text-left hover:bg-[#F8FAFC] transition-colors ${
                        lang === l.code ? 'font-black text-[#1B64B0] bg-[#DDF3FC]/40' : 'text-[#1E293B] font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#64748B] uppercase">{l.tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Auth Buttons (Hidden on mobile < 640px, available in mobile drawer) */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/student'}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#DDF3FC] text-[#1B64B0] text-xs sm:text-sm font-bold hover:bg-[#1B64B0] hover:text-white transition-all shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="max-w-[110px] truncate">{user.fullName || user.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-2 text-[#55687D] hover:text-rose-600 rounded-full transition-colors"
                  title={t('nav.logout')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                {/* Đăng nhập */}
                <Link
                  href="/login"
                  className="px-2 py-2 text-[14px] font-extrabold text-[#1B64B0] hover:text-[#0c4a6e] transition-colors whitespace-nowrap min-w-[70px] text-center"
                >
                  {t('nav.login')}
                </Link>

                {/* Đăng ký học viên */}
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-extrabold text-[#14263D] bg-[#FFB547] hover:bg-[#FFA726] rounded-full transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4 text-[#14263D]" />
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}

            {/* Mobile/Tablet Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-[#55687D] hover:text-[#1B64B0] hover:bg-[#F7FAFD] rounded-lg cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-[#E1EBF5] bg-white px-5 py-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => scrollToSection('home-programs-section')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              {t('nav.programs')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about-teacher-dong')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              {t('nav.about')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tech-preview-section')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              {t('nav.techPreview')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('consultation-section')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              {t('nav.consultation')}
            </button>
            <div className="pt-3 border-t border-[#E1EBF5] flex flex-col gap-2">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-extrabold text-[#1B64B0] bg-[#DDF3FC] rounded-full"
                  >
                    🔑 {t('nav.loginAccount')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-extrabold text-[#14263D] bg-[#FFB547] rounded-full shadow-sm"
                  >
                    ✨ {t('nav.registerStudent')}
                  </Link>
                </>
              ) : (
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/student'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-extrabold text-white bg-[#1B64B0] rounded-full"
                >
                  🚀 {user.role === 'ADMIN' ? 'Admin Portal' : 'Student Dashboard'}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-14 sm:space-y-20">
        {/* ================= 3. HERO SECTION ================= */}
        <section className="relative rounded-3xl border border-[#E1EBF5] bg-white p-5 sm:p-10 lg:p-14 shadow-sm overflow-hidden bg-[radial-gradient(800px_420px_at_85%_0%,rgba(85,184,232,0.25),transparent_65%),radial-gradient(520px_320px_at_0%_40%,rgba(255,181,71,0.2),transparent_65%)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: Headline, CTAs, Hashtags */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#DDF3FC] text-[#1B64B0] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-wider uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB547] animate-pulse"></span>
                <span>{t('home.badge')}</span>
              </div>

              {/* H1 Main Heading */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#14263D] tracking-tight leading-[1.2] break-words">
                {lang === 'vi' ? (
                  <>
                    Học tiếng Anh để{' '}
                    <span className="text-[#1B64B0] relative inline-block">
                      tự tin
                      <span className="absolute left-0 right-0 bottom-1 h-3.5 bg-[#FFB547]/40 rounded-sm -z-10"></span>
                    </span>{' '}
                    bước xa hơn
                  </>
                ) : (
                  t('home.heroTitle')
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-[#55687D] text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
                {t('home.heroSubtitle')}
              </p>

              {/* 3 Action Buttons (Full width on mobile, inline on desktop) */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('home-programs-section')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1B64B0] text-white font-extrabold text-sm sm:text-base hover:bg-[#154E8A] transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>{t('home.exploreBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FFB547] text-[#14263D] font-extrabold text-sm sm:text-base hover:bg-[#FFA726] transition-all shadow-md hover:shadow-lg text-center"
                >
                  <Users className="w-4 h-4" />
                  <span>{t('home.registerBtn')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToSection('tech-preview-section')}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-[#E1EBF5] bg-white/90 text-[#1B64B0] font-extrabold text-sm sm:text-base hover:bg-[#DDF3FC]/50 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>{t('home.demoBtn')}</span>
                </button>
              </div>

              {/* Pillar Hashtag Tags */}
              <div className="flex flex-wrap gap-2 pt-2 text-xs font-bold text-[#55687D]">
                <span className="bg-[#F7FAFD] border border-[#E1EBF5] px-3.5 py-1.5 rounded-full text-[#1B64B0]">
                  # English Proficiency
                </span>
                <span className="bg-[#F7FAFD] border border-[#E1EBF5] px-3.5 py-1.5 rounded-full text-[#1B83B6]">
                  # Professional Development
                </span>
                <span className="bg-[#F7FAFD] border border-[#E1EBF5] px-3.5 py-1.5 rounded-full text-[#B26A00]">
                  # Life Skills
                </span>
                <span className="bg-[#F7FAFD] border border-[#E1EBF5] px-3.5 py-1.5 rounded-full text-[#E11D48]">
                  # Inspiration
                </span>
                <span className="bg-[#F7FAFD] border border-[#E1EBF5] px-3.5 py-1.5 rounded-full text-[#059669]">
                  # Travel & Culture
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Frame & Adaptive Chips */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[300px] sm:max-w-[360px]">
                {/* Arch Frame with Gradient */}
                <div className="aspect-[5/6] rounded-t-full rounded-b-3xl bg-gradient-to-br from-[#1B83B6] via-[#1B64B0] to-[#154E8A] flex flex-col items-center justify-center text-center p-6 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-10 right-6 w-32 h-32 rounded-full bg-[#FFB547] opacity-80 blur-xs"></div>
                  <div className="absolute bottom-6 left-4 w-44 h-44 rounded-full bg-white/10 blur-sm"></div>

                  <div className="relative z-10 space-y-3">
                    <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-white text-[#1B64B0] font-black text-4xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-white/30">
                      TD
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-white tracking-tight">Teacher Dong</h3>
                      <p className="text-sm text-sky-100 font-semibold">M.Ed • International Educator</p>
                    </div>
                  </div>
                </div>

                {/* Desktop Floating Skill Chips (Visible on xl screens only, prevents mobile overflow) */}
                <div className="hidden xl:flex absolute top-[12%] -left-8 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D] animate-bounce duration-1000">
                  <span className="w-7 h-7 rounded-full bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </span>
                  <span>Listening</span>
                </div>

                <div className="hidden xl:flex absolute top-[36%] -right-8 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D]">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </span>
                  <span>Speaking</span>
                </div>

                <div className="hidden xl:flex absolute bottom-[24%] -left-10 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D]">
                  <span className="w-7 h-7 rounded-full bg-sky-100 text-[#1B83B6] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span>Reading</span>
                </div>

                <div className="hidden xl:flex absolute bottom-[8%] -right-6 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D]">
                  <span className="w-7 h-7 rounded-full bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </span>
                  <span>Writing AI</span>
                </div>
              </div>

              {/* Mobile/Tablet Inline Skill Chips (Neat 2x2 grid, NO horizontal overflow) */}
              <div className="xl:hidden grid grid-cols-2 gap-2 mt-4 w-full max-w-[340px]">
                <div className="bg-white px-3 py-2 rounded-2xl font-bold text-xs shadow-xs border border-[#E1EBF5] flex items-center gap-2 text-[#14263D]">
                  <span className="w-6 h-6 rounded-full bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center shrink-0">
                    <Headphones className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate">Listening</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl font-bold text-xs shadow-xs border border-[#E1EBF5] flex items-center gap-2 text-[#14263D]">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Mic className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate">Speaking</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl font-bold text-xs shadow-xs border border-[#E1EBF5] flex items-center gap-2 text-[#14263D]">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-[#1B83B6] flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate">Reading</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl font-bold text-xs shadow-xs border border-[#E1EBF5] flex items-center gap-2 text-[#14263D]">
                  <span className="w-6 h-6 rounded-full bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center shrink-0">
                    <PenTool className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate">Writing AI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. BỐN GIÁ TRỊ CỐT LÕI ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E1EBF5] rounded-2xl p-5 flex items-center gap-4 shadow-xs hover:border-[#1B64B0] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <strong className="text-base font-black text-[#14263D] block">{t('values.learn.title')}</strong>
              <span className="text-xs text-[#55687D] leading-tight block">{t('values.learn.desc')}</span>
            </div>
          </div>

          <div className="bg-white border border-[#E1EBF5] rounded-2xl p-5 flex items-center gap-4 shadow-xs hover:border-[#1B83B6] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#1B83B6] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <strong className="text-base font-black text-[#14263D] block">{t('values.grow.title')}</strong>
              <span className="text-xs text-[#55687D] leading-tight block">{t('values.grow.desc')}</span>
            </div>
          </div>

          <div className="bg-white border border-[#E1EBF5] rounded-2xl p-5 flex items-center gap-4 shadow-xs hover:border-[#FFB547] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <strong className="text-base font-black text-[#14263D] block">{t('values.share.title')}</strong>
              <span className="text-xs text-[#55687D] leading-tight block">{t('values.share.desc')}</span>
            </div>
          </div>

          <div className="bg-white border border-[#E1EBF5] rounded-2xl p-5 flex items-center gap-4 shadow-xs hover:border-rose-400 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-[#E11D48] flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <strong className="text-base font-black text-[#14263D] block">{t('values.inspire.title')}</strong>
              <span className="text-xs text-[#55687D] leading-tight block">{t('values.inspire.desc')}</span>
            </div>
          </div>
        </section>

        {/* ================= 5. 5 TRỤ CỘT ĐÀO TẠO TRỌNG TÂM ================= */}
        <section id="home-programs-section" className="scroll-mt-24 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#DDF3FC] text-[#1B64B0] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFB547]"></span>
              <span>{t('pillars.headingBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#14263D] tracking-tight">
              {t('pillars.title')}
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#55687D] leading-relaxed">
              {t('pillars.subtitle')}
            </p>
          </div>

          {/* Filter Bar with Horizontal Scroll for Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 sm:justify-center">
            <button
              type="button"
              onClick={() => setActivePillarFilter('all')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePillarFilter === 'all'
                  ? 'bg-[#1B64B0] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              {t('pillars.filter.all')}
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p1')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePillarFilter === 'p1'
                  ? 'bg-[#1B64B0] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              {t('pillars.filter.p1')}
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p2')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePillarFilter === 'p2'
                  ? 'bg-[#1B83B6] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              {t('pillars.filter.p2')}
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p3')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePillarFilter === 'p3'
                  ? 'bg-[#FFB547] text-[#14263D] shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              {t('pillars.filter.p3')}
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p4')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePillarFilter === 'p4'
                  ? 'bg-[#E11D48] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              {t('pillars.filter.p4')}
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p5')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activePillarFilter === 'p5'
                  ? 'bg-[#10B981] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              {t('pillars.filter.p5')}
            </button>
          </div>

          {/* Pillars Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPillars.map((pillar) => (
              <div
                key={pillar.id}
                className={`bg-white rounded-3xl border border-[#E1EBF5] border-t-5 ${pillar.borderColor} p-5 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className={`text-[11px] font-black tracking-wider uppercase ${pillar.tagColor}`}>
                        {pillar.code}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-[#14263D] mt-0.5">
                        {pillar.title}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10.5px] sm:text-[11px] font-black bg-[#DDF3FC] text-[#1B64B0] shrink-0">
                      {pillar.badge}
                    </span>
                  </div>

                  <p className="text-xs text-[#55687D] leading-relaxed mb-5 font-normal">
                    {pillar.desc}
                  </p>

                  {/* 20 Sub-items clickable list */}
                  <div className="space-y-2 mb-6">
                    {pillar.programs.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => openProgramModalFromPillar(item)}
                          className="flex items-center justify-between p-3 rounded-2xl border border-[#E1EBF5] hover:border-[#1B64B0] hover:bg-[#F7FAFD] transition-all cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-[#F7FAFD] text-[#1B64B0] group-hover:bg-[#DDF3FC] flex items-center justify-center shrink-0 transition-colors">
                              <IconComp className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-bold text-[#14263D] group-hover:text-[#1B64B0] truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2 ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, interestedProgram: pillar.id }));
                    scrollToSection('consultation-section');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#E1EBF5] text-xs font-extrabold text-[#1B64B0] hover:bg-[#DDF3FC]/40 transition-colors cursor-pointer"
                >
                  <span>{t('pillars.detailBtn')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 6. TRẢI NGHIỆM CÔNG NGHỆ EDTECH ĐỘC QUYỀN ================= */}
        <section id="tech-preview-section" className="scroll-mt-24 rounded-3xl bg-[#F1F6FC] border border-[#E1EBF5] p-5 sm:p-10 lg:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-black bg-[#DDF3FC] text-[#1B64B0]">
              {t('tech.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14263D]">
              {t('tech.title')}
            </h2>
            <p className="text-xs sm:text-sm text-[#55687D] leading-relaxed">
              {t('tech.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* LiveKit SFU */}
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-5 sm:p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center">
                  <Video className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-extrabold text-sm text-[#14263D]">{t('tech.livekit.title')}</h4>
                <p className="text-xs text-[#55687D] leading-relaxed">{t('tech.livekit.desc')}</p>
              </div>
              <Link
                href="/student/classroom"
                className="mt-6 w-full py-2.5 rounded-full bg-[#1B64B0] text-white text-xs font-extrabold hover:bg-[#154E8A] transition-colors shadow-sm"
              >
                {t('tech.livekit.btn')}
              </Link>
            </div>

            {/* AI Writing */}
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-5 sm:p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <PenTool className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-extrabold text-sm text-[#14263D]">{t('tech.writing.title')}</h4>
                <p className="text-xs text-[#55687D] leading-relaxed">{t('tech.writing.desc')}</p>
              </div>
              <Link
                href="/student/writing"
                className="mt-6 w-full py-2.5 rounded-full bg-[#FFB547] text-[#14263D] text-xs font-extrabold hover:bg-[#FFA726] transition-colors shadow-sm"
              >
                {t('tech.writing.btn')}
              </Link>
            </div>

            {/* Speaking Studio */}
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-5 sm:p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-rose-100 text-[#E11D48] flex items-center justify-center">
                  <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-extrabold text-sm text-[#14263D]">{t('tech.speaking.title')}</h4>
                <p className="text-xs text-[#55687D] leading-relaxed">{t('tech.speaking.desc')}</p>
              </div>
              <Link
                href="/student/speaking"
                className="mt-6 w-full py-2.5 rounded-full bg-[#1B64B0] text-white text-xs font-extrabold hover:bg-[#154E8A] transition-colors shadow-sm"
              >
                {t('tech.speaking.btn')}
              </Link>
            </div>

            {/* Watermark Security */}
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-5 sm:p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-sky-100 text-[#1B83B6] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-extrabold text-sm text-[#14263D]">{t('tech.library.title')}</h4>
                <p className="text-xs text-[#55687D] leading-relaxed">{t('tech.library.desc')}</p>
              </div>
              <Link
                href="/student/library"
                className="mt-6 w-full py-2.5 rounded-full border border-[#E1EBF5] text-[#1B64B0] text-xs font-extrabold hover:bg-[#DDF3FC]/50 transition-colors"
              >
                {t('tech.library.btn')}
              </Link>
            </div>
          </div>
        </section>

        {/* ================= 7. ABOUT TEACHER DONG ================= */}
        <section id="about-teacher-dong" className="scroll-mt-24 rounded-3xl bg-gradient-to-br from-[#154E8A] to-[#1B64B0] text-white p-6 sm:p-10 lg:p-14 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Avatar Column */}
            <div className="lg:col-span-4 text-center space-y-3">
              <div className="w-32 h-32 sm:w-38 sm:h-38 rounded-full bg-gradient-to-br from-[#1B83B6] to-white text-[#1B64B0] font-black text-4xl sm:text-5xl flex items-center justify-center mx-auto ring-6 ring-[#FFB547] shadow-2xl">
                TD
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Teacher Dong</h3>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black bg-[#FFB547] text-[#14263D]">
                {t('about.role')}
              </span>
              <p className="text-xs text-sky-100 font-medium">{t('about.degree')}</p>
            </div>

            {/* Story & Commitments */}
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1 rounded-full text-xs font-bold text-white">
                {t('about.badge')}
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                {t('about.quote')}
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed font-normal">
                {t('about.bio')}
              </p>

              {/* 3 Pillars of Commitment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                  <strong className="text-sm font-black text-[#FFB547] block mb-0.5">
                    {t('about.stat1.title')}
                  </strong>
                  <span className="text-xs text-slate-200">{t('about.stat1.desc')}</span>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                  <strong className="text-sm font-black text-[#FFB547] block mb-0.5">
                    {t('about.stat2.title')}
                  </strong>
                  <span className="text-xs text-slate-200">{t('about.stat2.desc')}</span>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                  <strong className="text-sm font-black text-[#FFB547] block mb-0.5">
                    {t('about.stat3.title')}
                  </strong>
                  <span className="text-xs text-slate-200">{t('about.stat3.desc')}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 pt-2">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FFB547] text-[#14263D] font-black text-xs sm:text-sm hover:bg-[#FFA726] transition-all shadow-md text-center"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('about.ctaJoin')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToSection('consultation-section')}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-extrabold text-xs sm:text-sm hover:bg-white/10 transition-colors cursor-pointer text-center"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('about.ctaConsult')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 8. FORM ĐĂNG KÝ TƯ VẤN ================= */}
        <section id="consultation-section" className="scroll-mt-24 rounded-3xl bg-white border border-[#E1EBF5] p-5 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left: Commitments & Value */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <span className="inline-block px-4 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                {t('consult.badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14263D] tracking-tight">
                {t('consult.title')}
              </h2>
              <p className="text-xs sm:text-sm text-[#55687D] leading-relaxed font-normal">
                {t('consult.subtitle')}
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-[#14263D]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{t('consult.benefit1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{t('consult.benefit2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{t('consult.benefit3')}</span>
                </li>
              </ul>
            </div>

            {/* Right: Consultation Form */}
            <div className="lg:col-span-6">
              <form
                onSubmit={handleConsultSubmit}
                className="bg-[#F7FAFD] border border-[#E1EBF5] rounded-3xl p-5 sm:p-8 space-y-4 shadow-2xs"
              >
                <h3 className="text-base font-black text-[#14263D] mb-1">
                  {t('consult.formTitle')}
                </h3>

                {formSubmitted && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in">
                    {t('consult.successMsg')}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#14263D] mb-1.5">
                    {t('consult.nameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn An"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E1EBF5] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#1B64B0] focus:ring-1 focus:ring-[#1B64B0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#14263D] mb-1.5">
                      {t('consult.emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E1EBF5] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#1B64B0] focus:ring-1 focus:ring-[#1B64B0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#14263D] mb-1.5">
                      {t('consult.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0987 654 321"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#E1EBF5] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#1B64B0] focus:ring-1 focus:ring-[#1B64B0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263D] mb-1.5">
                    {t('consult.programLabel')}
                  </label>
                  <select
                    value={formData.interestedProgram}
                    onChange={(e) => setFormData({ ...formData, interestedProgram: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E1EBF5] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#1B64B0]"
                  >
                    <option value="p1">{t('consult.opt1')}</option>
                    <option value="p2">{t('consult.opt2')}</option>
                    <option value="p3">{t('consult.opt3')}</option>
                    <option value="p4">{t('consult.opt4')}</option>
                    <option value="p5">{t('consult.opt5')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263D] mb-1.5">
                    {t('consult.notesLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('consult.notesPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E1EBF5] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#1B64B0]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#FFB547] text-[#14263D] font-black text-xs sm:text-sm hover:bg-[#FFA726] transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('consult.submitBtn')}</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 9. FOOTER ================= */}
      <footer className="bg-[#14263D] text-[#C3D1E2] pt-14 pb-8 border-t border-[#E1EBF5]/20 mt-16">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Col 1: Brand */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#1B64B0] text-white font-black text-lg flex items-center justify-center">
                  TD
                </div>
                <div>
                  <strong className="text-white text-lg font-black block">Teacher Dong Academy</strong>
                  <span className="text-[10.5px] text-[#1B83B6] font-bold uppercase tracking-wider">
                    Learn. Grow. Share. Inspire.
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">
                {t('footer.desc')}
              </p>
              <div className="text-xs text-[#FFB547] font-semibold">
                {t('footer.rights')}
              </div>
            </div>

            {/* Col 2: 5 Programs */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                {t('footer.colPrograms')}
              </h4>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p1');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t('pillars.filter.p1')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p2');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t('pillars.filter.p2')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p3');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t('pillars.filter.p3')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p4');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t('pillars.filter.p4')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p5');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {t('pillars.filter.p5')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: EdTech Ecosystem */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                {t('footer.colTech')}
              </h4>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <Link href="/student/classroom" className="hover:text-white transition-colors">
                    WebRTC LiveKit Class
                  </Link>
                </li>
                <li>
                  <Link href="/student/writing" className="hover:text-white transition-colors">
                    AI Writing Evaluator
                  </Link>
                </li>
                <li>
                  <Link href="/student/speaking" className="hover:text-white transition-colors">
                    Speaking Audio Studio
                  </Link>
                </li>
                <li>
                  <Link href="/student/library" className="hover:text-white transition-colors">
                    Digital Secure Library
                  </Link>
                </li>
                <li>
                  <Link href="/student/quizzes" className="hover:text-white transition-colors">
                    Interactive Quiz Engine
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Portal */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                {t('footer.colContact')}
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Hotline / Zalo: <strong className="text-white">0987 654 321</strong>
                <br />
                Email: <strong className="text-white">contact@teacherdong.academy</strong>
                <br />
                {t('footer.support')}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#FFB547] text-[#14263D] font-black text-xs hover:bg-[#FFA726] transition-all shadow-sm"
              >
                <span>{t('footer.loginPortal')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-xs text-[#94A3B8]">
            Teacher Dong Academy • Next.js 14 App Router & LiveKit WebRTC Monorepo Architecture.
          </div>
        </div>
      </footer>

      {/* ================= 10. PROGRAM DETAIL MODAL ================= */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E1EBF5] shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#DDF3FC] text-[#1B64B0]">
                  {selectedProgram.category}
                </span>
                <h3 className="text-xl font-black text-[#14263D] mt-2">
                  {selectedProgram.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 rounded-full text-[#55687D] hover:bg-[#F7FAFD] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="bg-[#F7FAFD] border border-[#E1EBF5] rounded-2xl p-4">
              <h4 className="text-xs font-black text-[#1B64B0] uppercase tracking-wider mb-1">
                {t('modal.objective')}
              </h4>
              <p className="text-xs sm:text-sm text-[#14263D] leading-relaxed">
                {selectedProgram.description}
              </p>
            </div>

            {/* Meta tags */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAFDFE] border border-[#E1EBF5] rounded-2xl p-3.5">
                <span className="text-[#55687D] block mb-0.5">{t('modal.target')}</span>
                <strong className="text-[#14263D] font-bold">{selectedProgram.targetAudience}</strong>
              </div>
              <div className="bg-[#FAFDFE] border border-[#E1EBF5] rounded-2xl p-3.5">
                <span className="text-[#55687D] block mb-0.5">{t('modal.format')}</span>
                <strong className="text-[#1B64B0] font-bold">{selectedProgram.format}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-5 py-2.5 rounded-full text-xs font-extrabold text-[#55687D] hover:bg-[#F7FAFD]"
              >
                {t('modal.close')}
              </button>
              <button
                type="button"
                onClick={handleEnrollFromModal}
                className="px-6 py-2.5 rounded-full text-xs font-black bg-[#FFB547] text-[#14263D] hover:bg-[#FFA726] shadow-sm transition-all"
              >
                {t('modal.enroll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
