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

  // 20 Sub-items data across 5 pillars
  const pillarsData = [
    {
      id: 'p1',
      title: '1. English Proficiency Course',
      code: 'TRỤ CỘT 01',
      badge: '4 KHÓA HỌC',
      borderColor: 'border-t-[#2868B2]',
      tagColor: 'text-[#2868B2]',
      desc: 'Chương trình phát triển năng lực tiếng Anh toàn diện, từ tiếng Anh công sở, luyện thi chứng chỉ quốc tế IELTS đến tiếng Anh giao tiếp và thiếu nhi.',
      programs: [
        {
          category: '1. English Proficiency Course',
          pillarId: 'p1',
          title: 'Business English for Communication',
          badge: 'Doanh nghiệp',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Tiếng Anh thương mại chuyên nghiệp: kỹ năng đàm phán hợp đồng, soạn thảo email đối tác quốc tế, thuyết trình dự án và chủ trì cuộc họp trực tuyến.',
          targetAudience: 'Người đi làm, Quản lý, Nhân viên văn phòng',
          format: 'LiveKit WebRTC 1:7 + LMS',
          icon: Briefcase,
        },
        {
          category: '1. English Proficiency Course',
          pillarId: 'p1',
          title: 'IELTS – Test Preparation',
          badge: 'Band 6.5 - 7.5+',
          badgeColor: 'bg-amber-100 text-amber-800',
          description: 'Lộ trình bứt phá IELTS Academic Band 6.5 -> 7.5+: tích hợp chấm Writing AI 4 tiêu chí chuẩn Cambridge và phòng Speaking Studio ghim nhận xét theo mốc thời gian từ Teacher Dong.',
          targetAudience: 'Học sinh cấp 3, Sinh viên, Du học sinh',
          format: 'WebRTC LiveKit + AI Writing Engine',
          icon: Target,
        },
        {
          category: '1. English Proficiency Course',
          pillarId: 'p1',
          title: 'Conversational English',
          badge: 'Phản xạ giao tiếp',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Rèn luyện phản xạ nghe nói tiếng Anh tự nhiên, chỉnh sửa phát âm chuẩn IPA, làm chủ ngữ điệu và giao tiếp tự tin trong đời sống thực tế.',
          targetAudience: 'Mọi lứa tuổi muốn tự tin nói tiếng Anh',
          format: 'Lớp tương tác thời gian thực',
          icon: Headphones,
        },
        {
          category: '1. English Proficiency Course',
          pillarId: 'p1',
          title: 'English for Early Childhood',
          badge: 'Thiếu nhi (4-10t)',
          badgeColor: 'bg-amber-100 text-amber-800',
          description: 'Phương pháp thẩm thấu ngôn ngữ tự nhiên dành cho trẻ mầm non & tiểu học (4-10 tuổi) qua trò chơi, câu chuyện kể và bảng trắng trực quan nhiều màu sắc.',
          targetAudience: 'Trẻ em từ 4 - 10 tuổi',
          format: 'Lớp học vui nhộn LiveKit',
          icon: Sparkles,
        },
      ],
    },
    {
      id: 'p2',
      title: '2. Professional Development',
      code: 'TRỤ CỘT 02',
      badge: '6 CHỦ ĐỀ SƯ PHẠM',
      borderColor: 'border-t-[#1B83B6]',
      tagColor: 'text-[#1B83B6]',
      desc: 'Đào tạo chuyên môn sư phạm, kỹ năng giảng dạy hiện đại, đón đầu làn sóng Trí tuệ nhân tạo (AI) trong giáo dục và định hướng nghề nghiệp quốc tế.',
      programs: [
        {
          category: '2. Professional Development',
          pillarId: 'p2',
          title: 'AI Integration in Education',
          badge: 'AI Xu hướng',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          description: 'Ứng dụng AI đột phá (ChatGPT, Claude, Prompt Engineering, Canva AI) để thiết kế bài giảng tự động, tạo đề kiểm tra thông minh và nâng cao hiệu suất sư phạm gấp 5 lần.',
          targetAudience: 'Giáo viên, Giảng viên, Nhà sáng tạo nội dung giáo dục',
          format: 'Chuyên đề thực hành AI',
          icon: Sparkles,
        },
        {
          category: '2. Professional Development',
          pillarId: 'p2',
          title: 'Career Guidance',
          badge: 'Định hướng',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Định hướng lộ trình nghề nghiệp trong ngành giáo dục & ngôn ngữ, chiến lược săn học bổng quốc tế và kỹ năng phỏng vấn tuyển dụng trường quốc tế.',
          targetAudience: 'Sinh viên sư phạm, Người chuyển ngành giáo dục',
          format: 'Mentoring 1:1',
          icon: Target,
        },
        {
          category: '2. Professional Development',
          pillarId: 'p2',
          title: 'Classroom Management',
          badge: 'Quản lý lớp',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Nghệ thuật tổ chức, điều phối lớp học thông minh (trực tiếp & trực tuyến), kỷ luật tích cực, khích lệ học sinh chủ động tương tác và xử lý tình huống sư phạm khéo léo.',
          targetAudience: 'Giáo viên các cấp, Trợ giảng',
          format: 'Phương pháp thực chiến',
          icon: Users,
        },
        {
          category: '2. Professional Development',
          pillarId: 'p2',
          title: 'Leadership and Management',
          badge: 'Quản lý',
          badgeColor: 'bg-amber-100 text-amber-800',
          description: 'Năng lực lãnh đạo giáo dục, quản lý tổ bộ môn, xây dựng văn hóa làm việc chuyên nghiệp và điều phối dự án đào tạo chuẩn quốc tế.',
          targetAudience: 'Tổ trưởng chuyên môn, Quản lý học thuật',
          format: 'Lãnh đạo giáo dục',
          icon: Award,
        },
        {
          category: '2. Professional Development',
          pillarId: 'p2',
          title: 'Research Mentorship',
          badge: 'Học thuật',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Cố vấn phương pháp nghiên cứu khoa học giáo dục, kỹ năng phân tích định lượng/định tính, viết luận văn thạc sĩ/tiến sĩ và công bố bài báo quốc tế.',
          targetAudience: 'Học viên cao học, Nhà nghiên cứu',
          format: 'Cố vấn chuyên sâu',
          icon: BookOpen,
        },
        {
          category: '2. Professional Development',
          pillarId: 'p2',
          title: 'Teaching Methodology',
          badge: 'Sư phạm',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Phương pháp giảng dạy hiện đại chuẩn quốc tế: Communicative Language Teaching (CLT), Task-Based Learning (TBL), Flipped Classroom và dạy học tương tác.',
          targetAudience: 'Giáo viên tiếng Anh',
          format: 'Phương pháp',
          icon: PenTool,
        },
      ],
    },
    {
      id: 'p3',
      title: '3. Life Skills and Personal Growth',
      code: 'TRỤ CỘT 03',
      badge: '3 KỸ NĂNG VÀNG',
      borderColor: 'border-t-[#FFB547]',
      tagColor: 'text-[#B26A00]',
      desc: 'Học tiếng Anh gắn liền với bộ kỹ năng thế kỷ 21: mài sắc tư duy phản biện, làm chủ nghệ thuật thuyết trình trước công chúng và làm việc hiệu quả dưới áp lực cao.',
      programs: [
        {
          category: '3. Life Skills and Personal Growth',
          pillarId: 'p3',
          title: 'Critical Thinking and Problem Solving',
          badge: 'Tư duy phản biện',
          badgeColor: 'bg-amber-100 text-amber-800',
          description: 'Rèn luyện thói quen tư duy phản biện, nhận diện bẫy ngụy biện logic, phân tích dữ liệu đa chiều và đưa ra giải pháp sáng tạo cho các thách thức thực tế.',
          targetAudience: 'Học sinh, Sinh viên, Người đi làm',
          format: 'Workshop tương tác',
          icon: Sparkles,
        },
        {
          category: '3. Life Skills and Personal Growth',
          pillarId: 'p3',
          title: 'Public Speaking and Presentation Skills',
          badge: 'Thuyết trình',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Khắc phục nỗi sợ nói trước đám đông, nghệ thuật kể chuyện (Storytelling), kiểm soát cao độ giọng nói, ngôn ngữ hình thể và thiết kế bài thuyết trình cuốn hút.',
          targetAudience: 'Mọi lứa tuổi',
          format: 'Thực hành sân khấu trực tiếp',
          icon: Mic,
        },
        {
          category: '3. Life Skills and Personal Growth',
          pillarId: 'p3',
          title: 'Time Management and Working Under Pressure',
          badge: 'Quản trị thời gian',
          badgeColor: 'bg-amber-100 text-amber-800',
          description: 'Phương pháp quản trị thời gian tối ưu (Eisenhower Matrix, Pomodoro), giữ vững sự tập trung cao độ, quản trị căng thẳng và duy trì phong độ dưới áp lực thời gian.',
          targetAudience: 'Học sinh ôn thi, Nhân sự bận rộn',
          format: 'Kỹ năng sống thực chiến',
          icon: Clock,
        },
      ],
    },
    {
      id: 'p4',
      title: '4. Life Experiences and Inspiration',
      code: 'TRỤ CỘT 04',
      badge: '4 CHUYÊN ĐỀ',
      borderColor: 'border-t-[#E11D48]',
      tagColor: 'text-[#E11D48]',
      desc: 'Những chia sẻ người thật việc thật, câu chuyện truyền cảm hứng và bài học xương máu đúc kết từ quá trình giảng dạy, sinh sống và lập nghiệp tại các quốc gia.',
      programs: [
        {
          category: '4. Life Experiences and Inspiration',
          pillarId: 'p4',
          title: 'Inspirational Talks',
          badge: 'Tọa đàm',
          badgeColor: 'bg-rose-100 text-rose-800',
          description: 'Chuỗi tọa đàm thắp sáng khát vọng học hỏi, vượt qua rào cản tự ti ngôn ngữ, định hình lý tưởng sống và tiếp thêm năng lượng tích cực.',
          targetAudience: 'Cộng đồng học viên & Độc giả',
          format: 'Talkshow hàng tháng',
          icon: Star,
        },
        {
          category: '4. Life Experiences and Inspiration',
          pillarId: 'p4',
          title: 'Lessons from Teaching Abroad',
          badge: 'Quốc tế',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Những trải nghiệm chân thực, sự khác biệt văn hóa lớp học và bài học sư phạm đúc rút từ nhiều năm trực tiếp giảng dạy tại các môi trường quốc tế.',
          targetAudience: 'Giáo viên, Giới trẻ đam mê giáo dục',
          format: 'Hồi ký & Chia sẻ',
          icon: Globe,
        },
        {
          category: '4. Life Experiences and Inspiration',
          pillarId: 'p4',
          title: 'Living and Working Overseas',
          badge: 'Hội nhập',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Cẩm nang sinh tồn, kinh nghiệm tìm kiếm việc làm, hòa nhập cộng đồng và làm việc hiệu quả trong môi trường đa quốc gia ở nước ngoài.',
          targetAudience: 'Du học sinh, Người định cư',
          format: 'Cẩm nang thực tế',
          icon: Briefcase,
        },
        {
          category: '4. Life Experiences and Inspiration',
          pillarId: 'p4',
          title: 'Personal Stories and Reflections',
          badge: 'Tự sự Teacher Dong',
          badgeColor: 'bg-amber-100 text-amber-800',
          description: 'Tản văn và những chiêm nghiệm sâu sắc của Teacher Dong về cuộc sống, triết lý giáo dục nhân văn và hành trình gầy dựng Teacher Dong Academy.',
          targetAudience: 'Tất cả bạn đọc',
          format: 'Tản văn & Tự sự',
          icon: BookOpen,
        },
      ],
    },
    {
      id: 'p5',
      title: '5. Travel and Culture Blog',
      code: 'TRỤ CỘT 05',
      badge: '3 CHỦ ĐỀ BLOG',
      borderColor: 'border-t-[#10B981]',
      tagColor: 'text-[#059669]',
      desc: 'Không gian văn hóa đa sắc tộc: khám phá vẻ đẹp danh lam thắng cảnh Châu Á, câu chuyện ngôn ngữ bản địa và nuôi dưỡng tư duy công dân toàn cầu.',
      programs: [
        {
          category: '5. Travel and Culture Blog',
          pillarId: 'p5',
          title: 'Cultural Awareness',
          badge: 'Nhận thức văn hóa',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          description: 'Mở rộng nhận thức văn hóa, tôn trọng phong tục đa quốc gia, nghi thức giao tiếp phi ngôn ngữ và kỹ năng ứng xử tinh tế trong thế giới phẳng.',
          targetAudience: 'Mọi người yêu thích văn hóa',
          format: 'Blog & Ký sự',
          icon: Globe,
        },
        {
          category: '5. Travel and Culture Blog',
          pillarId: 'p5',
          title: 'Discovering Asia',
          badge: 'Khám phá Châu Á',
          badgeColor: 'bg-amber-100 text-amber-800',
          description: 'Hành trình trải nghiệm danh lam thắng cảnh, ẩm thực tinh hoa và chiều sâu lịch sử của các quốc gia Châu Á (Nhật Bản, Trung Quốc, Đông Nam Á...).',
          targetAudience: 'Người yêu du lịch & khám phá',
          format: 'Cẩm nang du lịch',
          icon: Star,
        },
        {
          category: '5. Travel and Culture Blog',
          pillarId: 'p5',
          title: 'Language and People',
          badge: 'Ngôn ngữ & Con người',
          badgeColor: 'bg-[#DDF3FC] text-[#2868B2]',
          description: 'Sự kỳ diệu của ngôn ngữ bản xứ, nguồn gốc thú vị của các thành ngữ địa phương và những câu chuyện con người bình dị, ấm áp.',
          targetAudience: 'Người say mê ngôn ngữ học',
          format: 'Tản văn & Ngôn ngữ',
          icon: Users,
        },
      ],
    },
  ];

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
    <div className="min-h-screen bg-[#F7FAFD] text-[#14263D] font-sans antialiased selection:bg-[#DDF3FC] selection:text-[#2868B2]">
      {/* 1. TOP NAVY BORDER BAR (Theo chuẩn ảnh mockup) */}
      <div className="h-2 bg-[#1B64B0] w-full"></div>

      {/* 2. MAIN HEADER / NAVBAR (Pixel-perfect matching user image) */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur border-b border-[#E1EBF5] shadow-xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#1B64B0] text-white font-black text-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              TD
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl text-[#14263D] tracking-tight leading-none group-hover:text-[#1B64B0] transition-colors">
                Teacher Dong
              </span>
              <span className="text-[11.5px] text-[#55687D] font-medium leading-tight mt-1 hidden sm:block">
                Academy • Learn. Grow. Share.<br className="lg:hidden" /> Inspire.
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Guest) - Đặt ở giữa, canh hàng đẹp và rõ ràng */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <button
              type="button"
              onClick={() => scrollToSection('home-programs-section')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer"
            >
              5 Trụ cột chương<br />trình
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about-teacher-dong')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer"
            >
              Về Teacher<br />Dong
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tech-preview-section')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer"
            >
              Học thử WebRTC<br />& AI
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('consultation-section')}
              className="text-center font-bold text-[13.5px] text-[#334155] hover:text-[#1B64B0] transition-colors leading-tight cursor-pointer"
            >
              Liên hệ tư<br />vấn
            </button>
          </nav>

          {/* Header Right Actions (Language Pill, Login Text, Register Amber Pill) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Language Selector Pill Button (Theo đúng ảnh: VN Tiếng Việt v) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:border-[#1B64B0] transition-all cursor-pointer shadow-2xs"
                aria-label="Language Selector"
              >
                <span className="text-[11.5px] font-black text-[#64748B] tracking-wider uppercase">
                  {currentLangObj.tag}
                </span>
                <span className="text-[13.5px] font-bold text-[#1E293B]">
                  {currentLangObj.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
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

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/student'}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#DDF3FC] text-[#1B64B0] text-xs sm:text-sm font-bold hover:bg-[#1B64B0] hover:text-white transition-all shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
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
              <div className="flex items-center gap-3">
                {/* Đăng nhập (Text Link đậm màu xanh) */}
                <Link
                  href="/login"
                  className="px-2 py-2 text-[14px] font-extrabold text-[#1B64B0] hover:text-[#0c4a6e] transition-colors"
                >
                  {t('nav.login')}
                </Link>

                {/* Đăng ký học viên (Nút Amber Pill tròn viền theo ảnh) */}
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-extrabold text-[#14263D] bg-[#FFB547] hover:bg-[#FFA726] rounded-full transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                >
                  <UserPlus className="w-4 h-4 text-[#14263D]" />
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#55687D] hover:text-[#1B64B0] hover:bg-[#F7FAFD] rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E1EBF5] bg-white px-5 py-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => scrollToSection('home-programs-section')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              5 Trụ cột chương trình
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about-teacher-dong')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              Về Teacher Dong
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tech-preview-section')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              Học thử WebRTC & AI
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('consultation-section')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#14263D] hover:bg-[#F7FAFD]"
            >
              Liên hệ tư vấn
            </button>
            <div className="pt-3 border-t border-[#E1EBF5] flex flex-col gap-2">
              {!user && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-extrabold text-[#1B64B0] bg-[#DDF3FC] rounded-full"
                  >
                    🔑 Đăng nhập tài khoản
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-extrabold text-[#14263D] bg-[#FFB547] rounded-full shadow-sm"
                  >
                    ✨ Đăng ký học viên mới
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20">
        {/* ================= 3. HERO SECTION DÀNH CHO KHÁCH MỚI ================= */}
        <section className="relative rounded-3xl border border-[#E1EBF5] bg-white p-6 sm:p-10 lg:p-14 shadow-sm overflow-hidden bg-[radial-gradient(800px_420px_at_85%_0%,rgba(85,184,232,0.25),transparent_65%),radial-gradient(520px_320px_at_0%_40%,rgba(255,181,71,0.2),transparent_65%)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left: Headline, Subtitle, 3 CTAs & Hashtags */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#DDF3FC] text-[#1B64B0] px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-wider uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB547] animate-pulse"></span>
                <span>{t('home.badge')}</span>
              </div>

              {/* H1 Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#14263D] tracking-tight leading-[1.18]">
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
              <p className="text-[#55687D] text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                {t('home.heroSubtitle')}
              </p>

              {/* 3 Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('home-programs-section')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1B64B0] text-white font-extrabold text-sm sm:text-base hover:bg-[#154E8A] transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>{t('home.exploreBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFB547] text-[#14263D] font-extrabold text-sm sm:text-base hover:bg-[#FFA726] transition-all shadow-md hover:shadow-lg"
                >
                  <Users className="w-4 h-4" />
                  <span>{t('home.registerBtn')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToSection('tech-preview-section')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-[#E1EBF5] bg-white/90 text-[#1B64B0] font-extrabold text-sm sm:text-base hover:bg-[#DDF3FC]/50 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>{t('home.demoBtn')}</span>
                </button>
              </div>

              {/* Pillar Tags */}
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

            {/* Right: Hero Visual Frame & Floating Skill Chips */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[390px]">
                {/* Arch frame with gradient */}
                <div className="aspect-[5/6] rounded-t-full rounded-b-3xl bg-gradient-to-br from-[#1B83B6] via-[#1B64B0] to-[#154E8A] flex flex-col items-center justify-center text-center p-6 text-white shadow-2xl relative overflow-hidden">
                  {/* Decorative background circles */}
                  <div className="absolute top-10 right-6 w-36 h-36 rounded-full bg-[#FFB547] opacity-80 blur-xs"></div>
                  <div className="absolute bottom-6 left-4 w-48 h-48 rounded-full bg-white/10 blur-sm"></div>

                  {/* Core Avatar Badge */}
                  <div className="relative z-10 space-y-3">
                    <div className="w-26 h-26 rounded-full bg-white text-[#1B64B0] font-black text-4xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-white/30">
                      TD
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-white tracking-tight">Teacher Dong</h3>
                      <p className="text-sm text-sky-100 font-semibold">M.Ed • International Educator</p>
                    </div>
                  </div>
                </div>

                {/* Floating Skill Chips (desktop absolute, mobile friendly) */}
                <div className="hidden sm:flex absolute top-[12%] -left-8 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D] animate-bounce duration-1000">
                  <span className="w-7 h-7 rounded-full bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </span>
                  <span>Listening</span>
                </div>

                <div className="hidden sm:flex absolute top-[36%] -right-8 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D]">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </span>
                  <span>Speaking</span>
                </div>

                <div className="hidden sm:flex absolute bottom-[24%] -left-10 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D]">
                  <span className="w-7 h-7 rounded-full bg-sky-100 text-[#1B83B6] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span>Reading</span>
                </div>

                <div className="hidden sm:flex absolute bottom-[8%] -right-6 bg-white px-3.5 py-2 rounded-full font-bold text-xs shadow-md border border-[#E1EBF5] items-center gap-2 text-[#14263D]">
                  <span className="w-7 h-7 rounded-full bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </span>
                  <span>Writing AI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. BỐN GIÁ TRỊ CỐT LÕI (BRAND PILLARS) ================= */}
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

        {/* ================= 5. MAIN SECTION: 5 TRỤ CỘT ĐÀO TẠO TRỌNG TÂM ================= */}
        <section id="home-programs-section" className="scroll-mt-24 space-y-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#DDF3FC] text-[#1B64B0] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFB547]"></span>
              <span>{t('pillars.headingBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#14263D] tracking-tight">
              {t('pillars.title')}
            </h2>
            <p className="text-sm sm:text-base text-[#55687D] leading-relaxed">
              {t('pillars.subtitle')}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setActivePillarFilter('all')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
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
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activePillarFilter === 'p1'
                  ? 'bg-[#1B64B0] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              1. English Proficiency
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p2')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activePillarFilter === 'p2'
                  ? 'bg-[#1B83B6] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              2. Professional Development
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p3')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activePillarFilter === 'p3'
                  ? 'bg-[#FFB547] text-[#14263D] shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              3. Life Skills
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p4')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activePillarFilter === 'p4'
                  ? 'bg-[#E11D48] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              4. Life Experiences
            </button>
            <button
              type="button"
              onClick={() => setActivePillarFilter('p5')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activePillarFilter === 'p5'
                  ? 'bg-[#10B981] text-white shadow-md'
                  : 'bg-white border border-[#E1EBF5] text-[#55687D] hover:bg-[#F7FAFD]'
              }`}
            >
              5. Travel & Culture
            </button>
          </div>

          {/* Pillars Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPillars.map((pillar) => (
              <div
                key={pillar.id}
                className={`bg-white rounded-3xl border border-[#E1EBF5] border-t-5 ${pillar.borderColor} p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className={`text-[11px] font-black tracking-wider uppercase ${pillar.tagColor}`}>
                        {pillar.code}
                      </span>
                      <h3 className="text-lg font-black text-[#14263D] mt-0.5">
                        {pillar.title}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#DDF3FC] text-[#1B64B0] shrink-0">
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
        <section id="tech-preview-section" className="scroll-mt-24 rounded-3xl bg-[#F1F6FC] border border-[#E1EBF5] p-6 sm:p-10 lg:p-12 space-y-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* LiveKit SFU */}
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center">
                  <Video className="w-7 h-7" />
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
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <PenTool className="w-7 h-7" />
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
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-[#E11D48] flex items-center justify-center">
                  <Mic className="w-7 h-7" />
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
            <div className="bg-white rounded-2xl border border-[#E1EBF5] p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-[#1B83B6] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
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

        {/* ================= 7. ABOUT TEACHER DONG (GIỚI THIỆU GIẢNG VIÊN CHỦ NHIỆM) ================= */}
        <section id="about-teacher-dong" className="scroll-mt-24 rounded-3xl bg-gradient-to-br from-[#154E8A] to-[#1B64B0] text-white p-6 sm:p-10 lg:p-14 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Avatar Column */}
            <div className="lg:col-span-4 text-center space-y-3">
              <div className="w-38 h-38 rounded-full bg-gradient-to-br from-[#1B83B6] to-white text-[#1B64B0] font-black text-5xl flex items-center justify-center mx-auto ring-6 ring-[#FFB547] shadow-2xl">
                TD
              </div>
              <h3 className="text-2xl font-black text-white">Teacher Dong</h3>
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
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
              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFB547] text-[#14263D] font-black text-xs sm:text-sm hover:bg-[#FFA726] transition-all shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('about.ctaJoin')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToSection('consultation-section')}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-extrabold text-xs sm:text-sm hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('about.ctaConsult')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 8. FORM ĐĂNG KÝ TƯ VẤN & NHẬN LỘ TRÌNH ================= */}
        <section id="consultation-section" className="scroll-mt-24 rounded-3xl bg-white border border-[#E1EBF5] p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Commitments & Value */}
            <div className="lg:col-span-6 space-y-5">
              <span className="inline-block px-4 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                {t('consult.badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#14263D] tracking-tight">
                {t('consult.title')}
              </h2>
              <p className="text-xs sm:text-sm text-[#55687D] leading-relaxed font-normal">
                {t('consult.subtitle')}
              </p>

              <ul className="space-y-3.5 text-xs sm:text-sm text-[#14263D]">
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
                className="bg-[#F7FAFD] border border-[#E1EBF5] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs"
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
                    <option value="p1">1. English Proficiency (IELTS, Business, Giao tiếp, Thiếu nhi)</option>
                    <option value="p2">2. Professional Development (Sư phạm AI, Lãnh đạo, Nghiên cứu)</option>
                    <option value="p3">3. Life Skills & Personal Growth (Tư duy phản biện, Thuyết trình)</option>
                    <option value="p4">4. Life Experiences & Inspiration (Tọa đàm, Kinh nghiệm quốc tế)</option>
                    <option value="p5">5. Travel & Culture Blog (Văn hóa, Khám phá Châu Á)</option>
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

      {/* ================= 9. FOOTER CHUẨN TEACHER DONG ACADEMY ================= */}
      <footer className="bg-[#14263D] text-[#C3D1E2] pt-14 pb-8 border-t border-[#E1EBF5]/20 mt-16">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Col 1: Brand (4 cols) */}
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

            {/* Col 2: 5 Programs (3 cols) */}
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
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    1. English Proficiency
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p2');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    2. Professional Development
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p3');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    3. Life Skills & Growth
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p4');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    4. Life Experiences
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePillarFilter('p5');
                      scrollToSection('home-programs-section');
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    5. Travel & Culture
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: EdTech Ecosystem (2 cols) */}
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

            {/* Col 4: Contact & Portal (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                {t('footer.colContact')}
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Hotline / Zalo: <strong className="text-white">0987 654 321</strong>
                <br />
                Email: <strong className="text-white">contact@teacherdong.academy</strong>
                <br />
                Hỗ trợ kỹ thuật: 24/7
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#FFB547] text-[#14263D] font-black text-xs hover:bg-[#FFA726] transition-all shadow-sm"
              >
                <span>Đăng nhập hệ thống học viên</span>
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
                Mục tiêu & Nội dung trọng tâm:
              </h4>
              <p className="text-xs sm:text-sm text-[#14263D] leading-relaxed">
                {selectedProgram.description}
              </p>
            </div>

            {/* Meta tags */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAFDFE] border border-[#E1EBF5] rounded-2xl p-3.5">
                <span className="text-[#55687D] block mb-0.5">Đối tượng học viên:</span>
                <strong className="text-[#14263D] font-bold">{selectedProgram.targetAudience}</strong>
              </div>
              <div className="bg-[#FAFDFE] border border-[#E1EBF5] rounded-2xl p-3.5">
                <span className="text-[#55687D] block mb-0.5">Hình thức đào tạo:</span>
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
                Đóng
              </button>
              <button
                type="button"
                onClick={handleEnrollFromModal}
                className="px-6 py-2.5 rounded-full text-xs font-black bg-[#FFB547] text-[#14263D] hover:bg-[#FFA726] shadow-sm transition-all"
              >
                Đăng ký tư vấn khóa học này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
