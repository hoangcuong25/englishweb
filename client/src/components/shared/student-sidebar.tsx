'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useSidebar } from '@/lib/sidebar-context';
import { coursesService } from '@/services/courses.service';
import {
  LayoutDashboard,
  BookOpen,
  FolderLock,
  Video,
  CalendarCheck,
  MessageSquare,
  UserCheck,
  Award,
  Target,
  Compass,
  GraduationCap,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface StudentGoalItem {
  track: 'english' | 'skills' | 'pedagogy';
  label: string;
  badge: string;
  value: string;
  dotColor: string;
  textColor: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exactTrack?: string | boolean;
}

interface NavSection {
  title: string;
  badge?: string;
  badgeColor?: string;
  items: NavItem[];
}

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { isOpen, toggleSidebar } = useSidebar();
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setCurrentTrack(params.get('track'));
    }
  }, [pathname]);

  const [activeGoals, setActiveGoals] = useState<StudentGoalItem[]>([
    {
      track: 'english',
      label: 'IELTS Band',
      badge: 'Tiếng Anh',
      value: '7.5+ Academic',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-600',
    },
  ]);

  const navSections: NavSection[] = [
    {
      title: 'Học Tập & Chung',
      items: [
        { href: '/student/dashboard', label: t('nav_dashboard', 'Tổng quan học tập'), icon: LayoutDashboard },
        { href: '/student/courses', label: t('nav_courses', 'Khóa học của tôi'), icon: BookOpen, exactTrack: false },
        { href: '/student/classroom', label: t('nav_classroom', 'Lớp trực tuyến WebRTC'), icon: Video },
        { href: '/student/library', label: t('nav_library', 'Học liệu số & Bảo mật'), icon: FolderLock },
      ],
    },
    {
      title: 'Đào Tạo Tiếng Anh & IELTS',
      badge: 'Chuyên Sâu',
      badgeColor: 'bg-sky-100 text-sky-800',
      items: [
        { href: '/student/ielts', label: 'IELTS 4 Kỹ Năng Master', icon: Award },
        { href: '/student/courses?track=english', label: 'Khóa Học Tiếng Anh', icon: Sparkles, exactTrack: 'english' },
      ],
    },
    {
      title: 'Phát Triển Cá Nhân & Sư Phạm',
      badge: 'Kỹ Năng Sống',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      items: [
        { href: '/student/courses?track=personal_dev', label: 'Khóa Kỹ Năng & Sư Phạm', icon: Compass, exactTrack: 'personal_dev' },
      ],
    },
    {
      title: 'Tài Khoản & Tương Tác',
      items: [
        { href: '/student/attendance', label: t('nav_attendance', 'Điểm danh & Chuyên cần'), icon: CalendarCheck },
        { href: '/student/messages', label: t('nav_messages', 'Tin nhắn & Thảo luận'), icon: MessageSquare },
        { href: '/student/account', label: t('nav_account', 'Tài khoản cá nhân'), icon: UserCheck },
      ],
    },
  ];

  const allNavItems = useMemo(() => navSections.flatMap((s) => s.items), [navSections]);

  // Eagerly prefetch all routes on mount so transitions are instant
  useEffect(() => {
    allNavItems.forEach((item) => {
      router.prefetch(item.href);
    });

    let isMounted = true;
    coursesService.getMyLearning()
      .then((courses) => {
        if (!isMounted || !Array.isArray(courses)) return;

        const goals: StudentGoalItem[] = [];

        const hasEnglish = courses.some(
          (c: Record<string, unknown>) =>
            ['ENGLISH', 'IELTS', 'BUSINESS', 'KIDS'].includes(c.category as string) ||
            c.isEnglishCourse === true ||
            (typeof c.title === 'string' && (c.title.includes('IELTS') || c.title.includes('English'))),
        );
        if (hasEnglish) {
          goals.push({
            track: 'english',
            label: 'IELTS Band',
            badge: 'Tiếng Anh',
            value: '7.5+ Academic',
            dotColor: 'bg-amber-500',
            textColor: 'text-amber-600',
          });
        }

        const hasSkills = courses.some(
          (c: Record<string, unknown>) =>
            ['LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category as string) ||
            (typeof c.title === 'string' &&
              (c.title.includes('Kỹ Năng') || c.title.includes('Skills') || c.title.includes('Sống'))),
        );
        if (hasSkills) {
          goals.push({
            track: 'skills',
            label: 'Kỹ Năng Sống',
            badge: 'Kỹ Năng Mềm',
            value: '≥ 90đ (Xuất Sắc ⭐)',
            dotColor: 'bg-emerald-500',
            textColor: 'text-emerald-600',
          });
        }

        const hasPedagogy = courses.some(
          (c: Record<string, unknown>) =>
            c.category === 'PEDAGOGY' ||
            (typeof c.title === 'string' &&
              (c.title.includes('Sư Phạm') || c.title.includes('Giảng Dạy') || c.title.includes('Pedagogy'))),
        );
        if (hasPedagogy) {
          goals.push({
            track: 'pedagogy',
            label: 'Nghiệp Vụ',
            badge: 'Sư Phạm',
            value: 'Chứng chỉ Giỏi ⭐',
            dotColor: 'bg-blue-500',
            textColor: 'text-blue-600',
          });
        }

        if (goals.length > 0) {
          setActiveGoals(goals);
        } else if (courses.length > 0) {
          setActiveGoals([
            {
              track: 'skills',
              label: 'Năng Lực',
              badge: 'Khóa Học',
              value: 'Hoàn Thành Xuất Sắc ⭐',
              dotColor: 'bg-emerald-500',
              textColor: 'text-emerald-600',
            },
          ]);
        } else {
          setActiveGoals([
            {
              track: 'skills',
              label: 'Mục Tiêu',
              badge: 'Học Tập',
              value: 'Tích Lũy Kỹ Năng ⭐',
              dotColor: 'bg-primary',
              textColor: 'text-primary',
            },
          ]);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside
      className={`hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-hidden bg-white text-slate-800 border-r border-line transition-[width] duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      aria-label="Thanh điều hướng Học viên"
    >
      {/* Header with Title and Toggle Button on the Right */}
      <div className={`p-4 border-b border-line/60 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <>
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider truncate">
              {t('role_student', 'Học viên')} (STUDENT)
            </span>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
              title="Thu gọn sidebar (Chế độ Icon)"
              aria-label="Thu gọn thanh bên"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-primary hover:bg-sky-50 transition cursor-pointer"
            title="Mở rộng sidebar (Chi tiết)"
            aria-label="Mở rộng thanh bên"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List: Icon + Text when open, Centered Icons when collapsed */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 overflow-x-hidden">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {isOpen ? (
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                  {sec.title}
                </span>
                {sec.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${sec.badgeColor} shrink-0`}>
                    {sec.badge}
                  </span>
                )}
              </div>
            ) : sIdx > 0 ? (
              <div className="my-2 border-t border-slate-100 mx-1" />
            ) : null}

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isBaseActive = pathname.startsWith(item.href.split('?')[0]);
              let isActive = false;
              if (item.exactTrack) {
                isActive = pathname === '/student/courses' && currentTrack === item.exactTrack;
              } else if (item.href === '/student/courses') {
                isActive = pathname === '/student/courses' && !currentTrack;
              } else {
                isActive = isBaseActive;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(item.href)}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs font-semibold transition cursor-pointer select-none active:scale-[0.98] ${
                    isOpen ? 'space-x-3 px-3.5 py-2.5' : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-primary'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Target Personal Goal(s): Full card when open, Icon badge when collapsed */}
      {isOpen ? (
        activeGoals.length === 1 ? (
          <div className="p-3 m-3 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-primary text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>Mục tiêu cá nhân</span>
              </p>
              <span className="text-[9.5px] font-black text-sky-800 bg-sky-100/90 px-1.5 py-0.5 rounded-md">
                {activeGoals[0].badge}
              </span>
            </div>
            <p className="text-slate-600 text-[11.5px] pt-0.5">
              {activeGoals[0].label}: <strong className={`font-black ${activeGoals[0].textColor}`}>{activeGoals[0].value}</strong>
            </p>
          </div>
        ) : (
          <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-sky-50/90 to-slate-50 border border-sky-100/90 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-sky-100/70 pb-1.5">
              <p className="font-extrabold text-primary text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>Mục tiêu cá nhân</span>
              </p>
              <span className="text-[9.5px] font-black text-sky-800 bg-sky-100/90 px-1.5 py-0.5 rounded-md">
                {activeGoals.length} Lộ Trình
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {activeGoals.map((g, idx) => (
                <div key={idx} className="p-1.5 rounded-lg bg-white/90 border border-sky-100/70 flex items-center justify-between shadow-2xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${g.dotColor} shrink-0`}></span>
                    <span>{g.label}:</span>
                  </span>
                  <span className={`font-black ${g.textColor}`}>{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div
          className="p-2.5 my-3 mx-auto rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center cursor-pointer text-primary"
          title={`Mục tiêu cá nhân: ${activeGoals[0]?.value || 'IELTS 7.5+'}`}
        >
          <Target className="w-5 h-5 text-primary" />
        </div>
      )}
    </aside>
  );
}
