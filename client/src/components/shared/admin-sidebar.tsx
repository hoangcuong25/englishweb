'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import {
  LayoutDashboard,
  GraduationCap,
  FolderLock,
  Video,
  FileCheck,
  Headphones,
  FileQuestion,
  CalendarCheck,
  Users,
  MessageSquare,
  Settings,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/admin/dashboard', label: t('nav_admin_dashboard'), icon: LayoutDashboard },
    { href: '/admin/courses', label: t('nav_admin_courses'), icon: GraduationCap },
    { href: '/admin/library', label: t('nav_admin_library'), icon: FolderLock },
    { href: '/admin/classroom', label: t('nav_admin_classroom'), icon: Video },
    { href: '/admin/writing-review', label: t('nav_writing_review'), icon: FileCheck },
    { href: '/admin/speaking-grading', label: t('nav_speaking_grading'), icon: Headphones },
    { href: '/admin/quizzes', label: t('nav_admin_quizzes'), icon: FileQuestion },
    { href: '/admin/attendance', label: t('nav_admin_attendance'), icon: CalendarCheck },
    { href: '/admin/users', label: t('nav_users'), icon: Users },
    { href: '/admin/messages', label: t('nav_messages'), icon: MessageSquare },
    { href: '/admin/account', label: t('nav_system_settings'), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
          Quản Trị Viên & Giảng Viên
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
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* SFU Status indicator */}
      <div className="p-3 m-3 rounded-xl bg-slate-800 border border-slate-700 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-white">LiveKit SFU Online</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Uptime 99.98% • Latency 42ms</p>
      </div>
    </aside>
  );
}

