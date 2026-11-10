'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useI18n, Language } from '@/lib/i18n-context';
import SessionManagerDrawer from '../modals/session-manager-drawer';
import { Globe, Shield, LogOut, Bell, ChevronDown } from 'lucide-react';

interface AppTopbarProps {
  currentPortal: 'student' | 'admin';
  pageTitle?: string;
}

export default function AppTopbar({ currentPortal, pageTitle }: AppTopbarProps) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文 (简体)', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

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
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-line hover:border-slate-300 text-xs font-semibold text-slate-700 transition"
              title="Chuyển ngôn ngữ"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span className="uppercase">{lang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-line py-1 z-50 animate-in fade-in-50 duration-150">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center space-x-2 hover:bg-slate-50 transition ${
                      lang === l.code ? 'font-bold text-primary bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
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

          {/* Notifications */}
          <button
            className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition relative"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

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

