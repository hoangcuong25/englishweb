'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'vi' | 'en' | 'zh' | 'ja';

interface Translations {
  [key: string]: {
    vi: string;
    en: string;
    zh: string;
    ja: string;
  };
}

export const translations: Translations = {
  // Navigation & Brand
  brand_title: {
    vi: 'Teacher Dong Academy',
    en: 'Teacher Dong Academy',
    zh: '董老师英语学院',
    ja: 'ドンスクール英語アカデミー',
  },
  brand_subtitle: {
    vi: 'Đào tạo Anh ngữ & Kỹ năng sống EdTech',
    en: 'EdTech English & Life Skills Training',
    zh: 'EdTech 英语与生活技能培训',
    ja: 'EdTech 英語＆ライフスキルトレーニング',
  },
  nav_home: {
    vi: 'Trang chủ',
    en: 'Home',
    zh: '首页',
    ja: 'ホーム',
  },
  nav_courses: {
    vi: 'Khóa học',
    en: 'Courses',
    zh: '课程',
    ja: 'コース',
  },
  nav_library: {
    vi: 'Kho học liệu',
    en: 'Digital Library',
    zh: '数字图书馆',
    ja: 'デジタル資料庫',
  },
  nav_classroom: {
    vi: 'Lớp học LiveKit',
    en: 'Live Classroom',
    zh: '实时课堂',
    ja: 'ライブ教室',
  },
  nav_writing: {
    vi: 'IELTS Writing AI',
    en: 'IELTS Writing AI',
    zh: '雅思写作 AI',
    ja: 'IELTS ライティング AI',
  },
  nav_speaking: {
    vi: 'IELTS Speaking Studio',
    en: 'Speaking Studio',
    zh: '口语录音室',
    ja: 'スピーキングスタジオ',
  },
  nav_quiz: {
    vi: 'Quiz Checkpoint',
    en: 'Quiz Checkpoint',
    zh: '测验考核',
    ja: 'クイズチェック',
  },
  nav_attendance: {
    vi: 'Điểm danh chuyên cần',
    en: 'Attendance',
    zh: '考勤管理',
    ja: '出欠管理',
  },
  nav_messages: {
    vi: 'Tin nhắn hỗ trợ',
    en: 'Messages',
    zh: '在线消息',
    ja: 'メッセージ',
  },
  nav_users: {
    vi: 'Quản lý học viên',
    en: 'User Management',
    zh: '学员管理',
    ja: '受講生管理',
  },
  nav_account: {
    vi: 'Tài khoản & Phiên',
    en: 'Account & Sessions',
    zh: '账号与会话',
    ja: 'アカウント＆セッション',
  },

  // Actions & Buttons
  btn_login: {
    vi: 'Đăng nhập',
    en: 'Sign In',
    zh: '登录',
    ja: 'ログイン',
  },
  btn_register: {
    vi: 'Đăng ký học viên',
    en: 'Register',
    zh: '注册学员',
    ja: '受講生登録',
  },
  btn_logout: {
    vi: 'Đăng xuất',
    en: 'Sign Out',
    zh: '退出登录',
    ja: 'ログアウト',
  },
  btn_consult: {
    vi: 'Đăng ký tư vấn 1-1',
    en: '1-on-1 Consultation',
    zh: '1对1咨询预约',
    ja: '個別相談の予約',
  },
  btn_submit: {
    vi: 'Xác nhận & Gửi',
    en: 'Submit',
    zh: '提交',
    ja: '送信',
  },
  btn_cancel: {
    vi: 'Hủy bỏ',
    en: 'Cancel',
    zh: '取消',
    ja: 'キャンセル',
  },

  // Roles & Status
  role_student: {
    vi: 'Học viên',
    en: 'Student',
    zh: '学员',
    ja: '受講生',
  },
  role_admin: {
    vi: 'Quản trị viên / Giảng viên',
    en: 'Admin / Teacher',
    zh: '管理员 / 讲师',
    ja: '管理者 / 講師',
  },
  status_present: {
    vi: 'Đúng giờ',
    en: 'Present',
    zh: '准时出席',
    ja: '出席',
  },
  status_late: {
    vi: 'Đi muộn',
    en: 'Late',
    zh: '迟到',
    ja: '遅刻',
  },
  status_absent: {
    vi: 'Vắng mặt',
    en: 'Absent',
    zh: '缺席',
    ja: '欠席',
  },

  // Watermark warning
  watermark_security: {
    vi: 'Bản quyền tài liệu thuộc Teacher Dong Academy. Mọi hành vi chụp hoặc quay lén sẽ bị khóa tài khoản vĩnh viễn.',
    en: 'Document protected by Teacher Dong Academy. Screen recording is strictly prohibited.',
    zh: '版权归董老师英语学院所有。严禁录屏或非法翻录。',
    ja: '資料の著作権はドンスクール英語アカデミーに帰属します。無断転載・撮影を禁じます。',
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('vi');

  useEffect(() => {
    // Check saved cookie or localStorage
    const saved = localStorage.getItem('preferred_lang') as Language;
    if (saved && ['vi', 'en', 'zh', 'ja'].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('preferred_lang', newLang);
    document.cookie = `preferred_lang=${newLang}; path=/; max-age=31536000`;
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

