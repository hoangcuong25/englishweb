'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useI18n, Language } from '@/lib/i18n-context';
import SessionManagerDrawer from '../modals/session-manager-drawer';
import { 
  Globe, 
  Shield, 
  LogOut, 
  Bell, 
  ChevronDown, 
  CheckCheck, 
  FileText, 
  Video, 
  Mic, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  X 
} from 'lucide-react';

interface AppTopbarProps {
  currentPortal: 'student' | 'admin';
  pageTitle?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'writing' | 'speaking' | 'live' | 'quiz' | 'system';
  unread: boolean;
  link?: string;
}

export default function AppTopbar({ currentPortal, pageTitle }: AppTopbarProps) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const notiRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const studentNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Bài viết IELTS Writing đã duyệt',
      desc: 'Giáo viên đã phê duyệt bài Task 2 "Technology in Education" của bạn đạt Band 7.0!',
      time: '10 phút trước',
      type: 'writing',
      unread: true,
      link: '/student/writing',
    },
    {
      id: '2',
      title: 'Lớp học trực tuyến sắp bắt đầu',
      desc: 'Buổi học LiveKit IELTS Speaking của Thầy Đông sẽ diễn ra lúc 19:30 tối nay.',
      time: '1 giờ trước',
      type: 'live',
      unread: true,
      link: '/student/classroom',
    },
    {
      id: '3',
      title: 'Nhận xét bài thu âm Speaking',
      desc: 'Thầy Đông đã thêm nhận xét chi tiết và timestamp feedback cho bài nói Part 2 của bạn.',
      time: '3 giờ trước',
      type: 'speaking',
      unread: false,
      link: '/student/speaking',
    },
    {
      id: '4',
      title: 'Đạt điểm sàn bài kiểm tra Quiz',
      desc: 'Chúc mừng bạn đạt 9/10 câu hỏi bài Quiz Lesson 1, hệ thống đã mở khóa bài học tiếp theo.',
      time: 'Hôm qua',
      type: 'quiz',
      unread: false,
      link: '/student/quizzes',
    },
  ];

  const adminNotifications: NotificationItem[] = [
    {
      id: 'a1',
      title: 'Bài viết Writing mới chờ duyệt',
      desc: 'Học viên Nguyen Thi Mai vừa nộp bài Task 1, AI đã chấm gợi ý cần bạn phê duyệt.',
      time: '5 phút trước',
      type: 'writing',
      unread: true,
      link: '/admin/writing-review',
    },
    {
      id: 'a2',
      title: 'Bài nói Speaking mới cần chấm',
      desc: 'Học viên Tran Van Bao đã gửi bản ghi âm Speaking Part 1 chờ bạn nghe và cho điểm.',
      time: '25 phút trước',
      type: 'speaking',
      unread: true,
      link: '/admin/speaking-grading',
    },
    {
      id: 'a3',
      title: 'Báo cáo điểm danh sẵn sàng',
      desc: 'Dữ liệu chuyên cần buổi học LiveKit gần nhất đã tự động đồng bộ và sẵn sàng xuất Excel.',
      time: '2 giờ trước',
      type: 'live',
      unread: false,
      link: '/admin/attendance',
    },
    {
      id: 'a4',
      title: 'Học viên hoàn thành chẩn đoán 4 kỹ năng',
      desc: 'Học viên Le Hoang Nam đã hoàn thành bài thi thử, xem biểu đồ phân tích kỹ năng yếu.',
      time: 'Hôm qua',
      type: 'quiz',
      unread: false,
      link: '/admin/quizzes',
    },
  ];

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    currentPortal === 'admin' ? adminNotifications : studentNotifications
  );

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setHasUnread(false);
  };

  const getNotiIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'writing':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'speaking':
        return <Mic className="w-4 h-4 text-purple-600" />;
      case 'live':
        return <Video className="w-4 h-4 text-sky-600" />;
      case 'quiz':
        return <CheckCircle2 className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const getNotiBadgeBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'writing':
        return 'bg-emerald-50 border-emerald-100';
      case 'speaking':
        return 'bg-purple-50 border-purple-100';
      case 'live':
        return 'bg-sky-50 border-sky-100';
      case 'quiz':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  const languages: { code: Language; label: string; tag: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', tag: 'VN', flag: '🇻🇳' },
    { code: 'en', label: 'English', tag: 'US', flag: '🇺🇸' },
    { code: 'zh', label: '中文 (简体)', tag: 'CN', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', tag: 'JP', flag: '🇯🇵' },
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <>
      <header className="bg-white border-b border-line sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Left: Brand or Page Title */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              TD
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                Teacher Dong Academy
              </span>
              <span
                className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentPortal === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {currentPortal === 'admin' ? 'GIẢNG VIÊN & ADMIN' : 'HỌC VIÊN'}
              </span>
            </div>
          </Link>

          {pageTitle && (
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-line text-xs font-semibold text-muted">
              <span>/</span>
              <span className="text-slate-700 font-bold">{pageTitle}</span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Language Switcher with exact matching popup width */}
          <div className="relative w-36 sm:w-40" ref={langRef}>
            <button
              type="button"
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                if (!showLangMenu) setShowNotifications(false);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-line hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
              title="Chuyển ngôn ngữ"
            >
              <div className="flex items-center space-x-2 truncate">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate font-bold text-slate-800">
                  {currentLangObj.label}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
              <div className="absolute left-0 right-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-line py-1 z-50 animate-in fade-in-50 duration-150 overflow-hidden">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                      lang === l.code ? 'font-bold text-primary bg-sky-50/70' : 'text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase px-1 py-0.5 rounded bg-slate-100 shrink-0">
                        {l.tag}
                      </span>
                      <span className="truncate">{l.label}</span>
                    </div>
                    {lang === l.code && (
                      <CheckCheck className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session Manager Shield Icon */}
          <button
            onClick={() => setShowSessionDrawer(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-primary text-xs font-bold transition"
            title="Quản lý phiên đăng nhập Single Session"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phiên đơn</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notiRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  setShowLangMenu(false);
                }
              }}
              className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition relative"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              {hasUnread && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-line overflow-hidden z-50 animate-in fade-in-50 duration-150">
                {/* Header */}
                <div className="p-3.5 border-b border-line flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-slate-800">Thông báo hệ thống</span>
                    {hasUnread && (
                      <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                        {notifications.filter((n) => n.unread).length} mới
                      </span>
                    )}
                  </div>
                  {hasUnread && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-primary hover:text-primary-dark transition flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Đọc tất cả</span>
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link || '#'}
                      onClick={() => setShowNotifications(false)}
                      className={`p-3.5 block transition hover:bg-sky-50/40 ${
                        item.unread ? 'bg-sky-50/20' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getNotiBadgeBg(
                            item.type
                          )}`}
                        >
                          {getNotiIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs truncate ${
                                item.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.unread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-1.5"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                          <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-line bg-slate-50/50 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">
                    Hệ thống thông báo đồng bộ tự động từ LiveKit, LMS & AI
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Info & Avatar */}
          <div className="flex items-center space-x-3 pl-2 border-l border-line">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-bold text-slate-800 leading-tight">
                {user?.fullName || (currentPortal === 'admin' ? 'Teacher Dong' : 'Học Viên')}
              </p>
              <p className="text-[11px] text-muted">{user?.email || 'user@dong.edu.vn'}</p>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title={t('btn_logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Single Session Drawer */}
      <SessionManagerDrawer
        isOpen={showSessionDrawer}
        onClose={() => setShowSessionDrawer(false)}
      />
    </>
  );
}

