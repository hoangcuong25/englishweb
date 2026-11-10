'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import {
  LayoutDashboard,
  BookOpen,
  FolderLock,
  Video,
  PenTool,
  Mic,
  HelpCircle,
  CalendarCheck,
  MessageSquare,
  UserCheck,
} from 'lucide-react';

export default function StudentSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/student/dashboard', label: t('nav_dashboard', 'Tổng quan học tập'), icon: LayoutDashboard },
    { href: '/student/courses', label: t('nav_courses', 'Khóa học của tôi'), icon: BookOpen },
    { href: '/student/library', label: t('nav_library', 'Học liệu số & Bảo mật'), icon: FolderLock },
    { href: '/student/classroom', label: t('nav_classroom', 'Phòng học trực tuyến'), icon: Video },
    { href: '/student/writing', label: t('nav_writing', 'Luyện viết IELTS AI'), icon: PenTool },
    { href: '/student/speaking', label: t('nav_speaking', 'Studio luyện nói IELTS'), icon: Mic },
    { href: '/student/quizzes', label: t('nav_quiz', 'Ngân hàng bài tập Quiz'), icon: HelpCircle },
    { href: '/student/attendance', label: t('nav_attendance', 'Điểm danh & Chuyên cần'), icon: CalendarCheck },
    { href: '/student/messages', label: t('nav_messages', 'Tin nhắn & Thảo luận'), icon: MessageSquare },
    { href: '/student/account', label: t('nav_account', 'Tài khoản cá nhân'), icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-line flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 border-b border-line/60">
        <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
          Cổng Học Viên (STUDENT)
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
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-primary'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Target Band status */}
      <div className="p-3 m-3 rounded-xl bg-sky-50 border border-sky-100 text-xs">
        <p className="font-bold text-primary">Mục tiêu cá nhân</p>
        <p className="text-slate-600 mt-0.5">IELTS Band: <strong className="text-primary font-bold">7.0+</strong></p>
      </div>
    </aside>
  );
}

