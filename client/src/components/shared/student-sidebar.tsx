'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
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
} from 'lucide-react';

interface StudentGoalItem {
  track: 'english' | 'skills' | 'pedagogy';
  label: string;
  badge: string;
  value: string;
  dotColor: string;
  textColor: string;
}

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

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

  const navItems = [
    { href: '/student/dashboard', label: t('nav_dashboard', 'Tổng quan học tập'), icon: LayoutDashboard },
    { href: '/student/courses', label: t('nav_courses', 'Khóa học của tôi'), icon: BookOpen },
    { href: '/student/ielts', label: t('nav_ielts_hub', 'IELTS 4 Kỹ Năng (Nghe • Nói • Đọc • Viết)'), icon: Award },
    { href: '/student/classroom', label: t('nav_classroom', 'Phòng học trực tuyến'), icon: Video },
    { href: '/student/library', label: t('nav_library', 'Học liệu số & Bảo mật'), icon: FolderLock },
    { href: '/student/attendance', label: t('nav_attendance', 'Điểm danh & Chuyên cần'), icon: CalendarCheck },
    { href: '/student/messages', label: t('nav_messages', 'Tin nhắn & Thảo luận'), icon: MessageSquare },
    { href: '/student/account', label: t('nav_account', 'Tài khoản cá nhân'), icon: UserCheck },
  ];

  // Eagerly prefetch all routes on mount so transitions are instant
  useEffect(() => {
    navItems.forEach((item) => {
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
    <aside className="hidden lg:flex w-64 bg-white border-r border-line flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
      <div className="p-4 border-b border-line/60">
        <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
          {t('role_student', 'Học viên')} (STUDENT)
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onMouseEnter={() => router.prefetch(item.href)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none active:scale-[0.98] ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-primary'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Target Personal Goal(s): Dynamically tailored to student's enrolled track(s) */}
      {activeGoals.length === 1 ? (
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
      )}
    </aside>
  );
}
