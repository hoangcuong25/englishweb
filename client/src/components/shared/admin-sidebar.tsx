'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useSidebar } from '@/lib/sidebar-context';
import {
  LayoutDashboard,
  GraduationCap,
  FolderLock,
  Video,
  CalendarCheck,
  Users,
  MessageSquare,
  Settings,
  Newspaper,
  Award,
  PanelLeftClose,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { isOpen, toggleSidebar } = useSidebar();

  const navSections = [
    {
      title: 'Quản Trị Đào Tạo',
      items: [
        { href: '/admin/dashboard', label: t('nav_admin_dashboard', 'Tổng quan hệ thống'), icon: LayoutDashboard },
        { href: '/admin/courses', label: t('nav_admin_courses', 'Khóa học & Cây giáo trình'), icon: GraduationCap },
        { href: '/admin/library', label: t('nav_admin_library', 'Kho học liệu số bảo mật'), icon: FolderLock },
        { href: '/admin/classroom', label: t('nav_admin_classroom', 'Lớp học trực tuyến LiveKit'), icon: Video },
      ],
    },
    {
      title: 'Khảo Thí & Chấm Thi IELTS',
      items: [
        { href: '/admin/assessments', label: t('nav_admin_assessments', 'Khảo thí & Chấm thi IELTS'), icon: Award },
      ],
    },
    {
      title: 'Học Viên & Vận Hành',
      items: [
        { href: '/admin/attendance', label: t('nav_admin_attendance', 'Điểm danh & Chuyên cần'), icon: CalendarCheck },
        { href: '/admin/users', label: t('nav_users', 'Quản lý học viên'), icon: Users },
        { href: '/admin/messages', label: t('nav_messages', 'Tin nhắn trực tiếp'), icon: MessageSquare },
        { href: '/admin/blogs', label: t('nav_admin_blogs', 'Quản lý bài viết Blog'), icon: Newspaper },
        { href: '/admin/account', label: t('nav_system_settings', 'Cài đặt hệ thống'), icon: Settings },
      ],
    },
  ];

  const allNavItems = navSections.flatMap((s) => s.items);

  // Eagerly prefetch all routes on mount so transitions are instant
  useEffect(() => {
    allNavItems.forEach((item) => {
      router.prefetch(item.href);
    });
  }, []);

  return (
    <aside
      className={`hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-hidden bg-slate-900 text-slate-300 transition-[width,border-color] duration-500 ease-in-out ${
        isOpen ? 'w-64 border-r border-slate-800' : 'w-0 border-r-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className="w-64 shrink-0 flex flex-col h-full transition-[transform,opacity] duration-500 ease-in-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
            {t('role_admin', 'Quản Trị Viên & Giảng Viên')}
          </span>
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Thu gọn sidebar (Slide)"
            aria-label="Thu gọn thanh bên"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {sec.title}
                </span>
              </div>

              {sec.items.map((item) => {
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
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* SFU Status indicator */}
        <div className="p-3 m-3 rounded-xl bg-slate-800 border border-slate-700 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-white">LiveKit SFU Online</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Uptime 99.98% • Latency 42ms</p>
        </div>
      </div>
    </aside>
  );
}
