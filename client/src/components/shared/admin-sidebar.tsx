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
  PanelLeftOpen,
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
      className={`hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-hidden bg-slate-900 text-slate-300 border-r border-slate-800 transition-[width] duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      aria-label="Thanh điều hướng Quản trị"
    >
      {/* Header with Title and Toggle Button on the Right */}
      <div className={`p-4 border-b border-slate-800 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <>
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider truncate">
              {t('role_admin', 'Quản Trị Viên & Giảng Viên')}
            </span>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
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
            className="p-2 rounded-xl text-amber-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
              <div className="px-3 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate block">
                  {sec.title}
                </span>
              </div>
            ) : sIdx > 0 ? (
              <div className="my-2 border-t border-slate-800/80 mx-1" />
            ) : null}

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

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
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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

      {/* SFU Status indicator */}
      {isOpen ? (
        <div className="p-3 m-3 rounded-xl bg-slate-800 border border-slate-700 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-bold text-white truncate">LiveKit SFU Online</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">Uptime 99.98% • Latency 42ms</p>
        </div>
      ) : (
        <div
          className="p-2 my-3 mx-auto rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center cursor-pointer"
          title="LiveKit SFU Online • Uptime 99.98% • Latency 42ms"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      )}
    </aside>
  );
}
