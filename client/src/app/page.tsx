'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useI18n, Language } from '@/lib/i18n-context';
import {
  Video,
  PenTool,
  Mic,
  Award,
  CheckCircle2,
  ArrowRight,
  Send,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { lang, setLang } = useI18n();

  // Consultation form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    interestedProgram: 'IELTS 6.5 - 7.5+ Intensive',
    currentLevel: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        interestedProgram: 'IELTS 6.5 - 7.5+ Intensive',
        currentLevel: '',
      });
    }, 4000);
  };

  const pillars = [
    {
      id: 'pillar-1',
      title: '1. English Proficiency',
      subtitle: 'Đào tạo Anh ngữ Chuyên sâu',
      badge: 'Trọng tâm',
      badgeColor: 'bg-primary text-white',
      desc: 'Lộ trình IELTS 6.5 - 8.5+, Business English doanh nghiệp, Kids English chuẩn quốc tế Cambridge.',
      items: ['IELTS Masterclass 7.5+ Intensive', 'Business Communication VIP', 'Young Learners Cambridge'],
    },
    {
      id: 'pillar-2',
      title: '2. Professional Development',
      subtitle: 'Năng lực Giảng dạy & Đào tạo',
      badge: 'Sư phạm',
      badgeColor: 'bg-purple-600 text-white',
      desc: 'Bồi dưỡng phương pháp giảng dạy TESOL hiện đại, quản lý lớp học và thiết kế giáo án tương tác.',
      items: ['TESOL Methodology Workshop', 'Lesson Planning & EdTech Integration', 'Classroom Management Mastery'],
    },
    {
      id: 'pillar-3',
      title: '3. Life Skills',
      subtitle: 'Kỹ năng Sống & Hội nhập',
      badge: 'Thực chiến',
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'Kỹ năng thuyết trình trước đám đông, tư duy phản biện (Critical Thinking) và đàm phán quốc tế.',
      items: ['Public Speaking in English', 'Critical Thinking & Academic Writing', 'Global Leadership & Debate'],
    },
    {
      id: 'pillar-4',
      title: '4. Life Experiences',
      subtitle: 'Trải nghiệm Học tập Thực tế',
      badge: 'Gắn kết',
      badgeColor: 'bg-amber-500 text-white',
      desc: 'Hoạt động ngoại khóa, câu lạc bộ trao đổi văn hóa và mô phỏng môi trường làm việc toàn cầu.',
      items: ['English Speaking Club Weekly', 'Mock Business Pitching', 'Cultural Exchange Sessions'],
    },
    {
      id: 'pillar-5',
      title: '5. Travel & Culture Blog',
      subtitle: 'Văn hóa & Ngôn ngữ Đời sống',
      badge: 'Mở rộng',
      badgeColor: 'bg-sky-500 text-white',
      desc: 'Khám phá văn hóa bản xứ các nước nói tiếng Anh, bí quyết du học và tiếng Anh du lịch ứng dụng.',
      items: ['Study Abroad Preparation Guide', 'Survival English for Travelers', 'Anglo-American Cultural Insights'],
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-primary-deep text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span>Khai giảng khóa IELTS Masterclass 7.5+ trực tuyến WebRTC — Giới hạn 8 học viên/lớp để kèm 1-1!</span>
      </div>

      {/* Main Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-primary/20">
              TD
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block">
                Teacher Dong Academy
              </span>
              <span className="text-[11px] font-semibold text-primary block -mt-1">
                LMS & WebRTC In-house Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-700">
            <a href="#pillars" className="hover:text-primary transition">5 Trụ Cột Đào Tạo</a>
            <a href="#tech" className="hover:text-primary transition">Học Thử WebRTC & AI</a>
            <a href="#founder" className="hover:text-primary transition">Về Teacher Dong (IELTS 8.5)</a>
            <a href="#consultation" className="hover:text-primary transition">Liên Hệ Tư Vấn</a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 text-[11px] font-bold">
              {(['vi', 'en', 'zh', 'ja'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 rounded uppercase transition ${
                    lang === l ? 'bg-white text-primary shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition shadow-md shadow-primary/20 flex items-center space-x-1.5"
              >
                <span>Vào Dashboard ({user.role})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-primary hover:bg-sky-50 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-dark transition text-slate-900 shadow-md shadow-accent/20"
                >
                  Đăng ký học viên
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-sky-50/50 via-bg to-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-primary text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Công nghệ EdTech Đột Phá: LiveKit SFU 1 Host + 8 SV & AI Writing Assessment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Nền Tảng Đào Tạo Anh Ngữ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Chuẩn EdTech Hiện Đại
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Học viện độc quyền của <strong>Teacher Dong (IELTS 8.5)</strong> kết hợp giữa lớp học trực tuyến WebRTC độ trễ thấp, AI chấm IELTS Writing 4 tiêu chí, Studio thu âm Speaking và bảo mật học liệu số Dynamic Watermark.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#consultation"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-accent hover:bg-accent-dark transition shadow-lg shadow-accent/20 flex items-center justify-center space-x-2"
            >
              <span>Nhận Tư Vấn Lộ Trình 1-1 Miễn Phí</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-line transition shadow-sm flex items-center justify-center space-x-2"
            >
              <Video className="w-4 h-4 text-primary" />
              <span>Trải nghiệm Phòng LiveKit</span>
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-primary">8.5</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">IELTS Founder & Trực tiếp giảng dạy</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-secondary">8 HV</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Quy mô tối đa mỗi lớp WebRTC</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">96.8%</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Tỷ lệ học viên đạt band cam kết</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-line shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-500">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Thầy chấm Speaking thủ công</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Pillars Section */}
      <section id="pillars" className="py-20 bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Chương trình đào tạo toàn diện
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              5 Trụ Cột Đào Tạo Độc Quyền
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Chương trình được thiết kế bài bản, kết hợp nâng cao năng lực ngôn ngữ và phát triển kỹ năng sống toàn cầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-2xl border border-line bg-surface p-6 shadow-sm hover:shadow-lg hover:border-primary/40 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">{pillar.subtitle}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pillar.badgeColor}`}>
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{pillar.desc}</p>

                  <div className="space-y-1.5 pt-3 border-t border-line">
                    {pillar.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line/60">
                  <a
                    href="#consultation"
                    className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
                  >
                    <span>Xem chi tiết lộ trình</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Showcase Section */}
      <section id="tech" className="py-20 bg-bg border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-secondary uppercase tracking-widest bg-sky-100 px-3 py-1 rounded-full">
              Hạ tầng công nghệ chuyên biệt
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Trải Nghiệm Học Tập Tương Tác Cao
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Ứng dụng các công nghệ WebRTC SFU, Web Audio API và AI Pipeline hiện đại hàng đầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tech 1: LiveKit WebRTC */}
            <div className="bg-white rounded-2xl p-6 border border-line shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">LiveKit SFU 1 Host + 8 SV</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Độ trễ dưới 50ms, âm thanh chống ồn thông minh, đồng bộ bảng trắng Canvas thời gian thực qua DataChannel.
              </p>
            </div>

            {/* Tech 2: AI Writing Assessment */}
            <div className="bg-white rounded-2xl p-6 border border-line shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">AI IELTS Writing Studio</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đếm từ realtime, phân tích 4 tiêu chí TR, CC, LR, GRA, gợi ý từ vựng C1/C2 và quy trình Giáo viên phê duyệt Human-in-the-Loop.
              </p>
            </div>

            {/* Tech 3: Speaking Studio */}
            <div className="bg-white rounded-2xl p-6 border border-line shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Speaking Studio & Timestamp</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hiển thị sóng âm thanh Web Audio API, Thầy chấm thủ công 100% kèm ghim nhận xét theo từng giây audio cụ thể.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section id="founder" className="py-20 bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-deep to-primary text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center gap-10">
            <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-5xl font-extrabold text-accent shadow-inner flex-shrink-0">
              TD
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>Người sáng lập kiêm Giảng viên Trưởng</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Thầy Đông (Teacher Dong) — IELTS 8.5
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                Với hơn 10 năm kinh nghiệm đào tạo học viên đạt chuẩn đầu ra du học và định cư, Thầy Đông trực tiếp thiết kế toàn bộ giáo trình, đứng lớp giảng dạy qua WebRTC LiveKit và trực tiếp chấm từng bài Speaking của học viên.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-lg font-extrabold text-accent">10+ Năm</p>
                  <p className="text-[11px] text-slate-300">Kinh nghiệm giảng dạy</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-accent">2,500+</p>
                  <p className="text-[11px] text-slate-300">Học viên đạt mục tiêu</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-accent">100% Kèm</p>
                  <p className="text-[11px] text-slate-300">Sát sao từng học viên</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Form Section (Form 18 in Plan) */}
      <section id="consultation" className="py-20 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-line shadow-lg">
            <div className="text-center mb-8">
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                Đăng Ký Tuyển Sinh & Tư Vấn
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Nhận Lộ Trình Học Tập 1-1 Cá Nhân Hóa
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                Để lại thông tin, đội ngũ học vụ của Thầy Đông sẽ liên hệ kiểm tra trình độ và tư vấn lộ trình phù hợp nhất cho bạn.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">Đăng Ký Thành Công!</h3>
                <p className="text-xs text-emerald-700">
                  Cảm ơn bạn. Chuyên viên học vụ của Teacher Dong Academy sẽ liên hệ với bạn trong vòng 24 giờ làm việc.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên của bạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số điện thoại liên hệ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912345678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa chỉ Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ban@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Khóa học quan tâm <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.interestedProgram}
                      onChange={(e) => setFormData({ ...formData, interestedProgram: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:outline-none focus:border-primary text-xs bg-white"
                    >
                      <option value="IELTS 6.5 - 7.5+ Intensive">IELTS 6.5 - 7.5+ Intensive</option>
                      <option value="Business English VIP">Business English VIP</option>
                      <option value="Kids English Cambridge">Kids English Cambridge</option>
                      <option value="Teacher Training TESOL">Teacher Training TESOL</option>
                      <option value="Kỹ Năng Sống & Thuyết Trình">Kỹ Năng Sống & Thuyết Trình</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trình độ hiện tại & Mục tiêu band điểm
                  </label>
                  <textarea
                    rows={3}
                    value={formData.currentLevel}
                    onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                    placeholder="Em đang ở band 5.5, mong muốn đạt 7.0 trong 4 tháng tới để du học..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line focus:outline-none focus:border-primary text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-primary/20 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Thông Tin Đăng Ký Tư Vấn</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-deep text-slate-300 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center">
                TD
              </div>
              <span className="font-extrabold text-white text-base">Teacher Dong Academy</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Nền tảng đào tạo trực tuyến chuẩn EdTech hiện đại: Lớp học WebRTC LiveKit, AI IELTS Writing, Speaking Studio và Hệ thống điểm danh tự động.
            </p>
            <p className="text-[11px] text-slate-500">
              © 2026 Teacher Dong Academy. All rights reserved. Strict 2-Role RBAC & Single Concurrent Session.
            </p>
          </div>

          <div>
            <p className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">5 Trụ Cột Đào Tạo</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>1. English Proficiency</li>
              <li>2. Professional Development</li>
              <li>3. Life Skills</li>
              <li>4. Life Experiences</li>
              <li>5. Travel & Culture Blog</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Bảo Mật & Hỗ Trợ</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>Single Concurrent Session</li>
              <li>Dynamic Watermark Protection</li>
              <li>LiveKit WebRTC 1 Host + 8 SV</li>
              <li>Hotline: 0987.654.321</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
