"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Language = "vi" | "en" | "zh" | "ja" | "km";

interface Translations {
  [key: string]: {
    vi: string;
    en: string;
    zh: string;
    ja: string;
    km: string;
  };
}

export const translations: Translations = {
  // Navigation & Brand
  brand_title: {
    vi: "Teacher Dong Academy",
    en: "Teacher Dong Academy",
    zh: "董老师英语学院",
    ja: "ドンスクール英語アカデミー",
    km: "សាលា Teacher Dong Academy",
  },
  brand_subtitle: {
    vi: "Academy • Learn. Grow. Share. Inspire.",
    en: "Academy • Learn. Grow. Share. Inspire.",
    zh: "学院 • 学习 • 成长 • 分享 • 启发",
    ja: "アカデミー • 学び • 成長 • 共有 • 刺激",
    km: "បណ្ឌិត្យសភា • រៀន • រីកចម្រើន • ចែករំលែក • បំផុសគំនិត",
  },
  "nav.programs": {
    vi: "5 Trụ cột chương trình",
    en: "5 Core Pillars",
    zh: "5大核心课程",
    ja: "5つの主要プログラム",
    km: "សសរស្ដម្ភទាំង ៥ នៃកម្មវិធី",
  },
  "nav.about": {
    vi: "Về Teacher Dong",
    en: "About Teacher Dong",
    zh: "关于董老师",
    ja: "ドンスクールについて",
    km: "អំពីលោកគ្រូ Dong",
  },
  "nav.techPreview": {
    vi: "Học thử & Luyện thi AI",
    en: "Try Practice & AI",
    zh: "体验模考与 AI",
    ja: "模試＆AIを体験",
    km: "សាកល្បង Mock Test & AI",
  },
  "nav.consultation": {
    vi: "Liên hệ tư vấn",
    en: "Consultation",
    zh: "咨询预约",
    ja: "無料相談",
    km: "ទំនាក់ទំនងប្រឹក្សាយោបល់",
  },
  "nav.blog": {
    vi: "Blog & Chia sẻ",
    en: "Blog & Insights",
    zh: "博客分享",
    ja: "ブログ＆コラム",
    km: "ប្លុក & ការចែករំលែក",
  },
  "nav.login": {
    vi: "Đăng nhập",
    en: "Sign In",
    zh: "登录",
    ja: "ログイン",
    km: "ចូលប្រើប្រាស់",
  },
  "nav.register": {
    vi: "Đăng ký học viên",
    en: "Register",
    zh: "注册学员",
    ja: "受講生登録",
    km: "ចុះឈ្មោះសិស្ស",
  },
  "nav.loginAccount": {
    vi: "Đăng nhập tài khoản",
    en: "Sign In to Account",
    zh: "登录账号",
    ja: "アカウントにログイン",
    km: "ចូលគណនី",
  },
  "nav.registerStudent": {
    vi: "Đăng ký học viên mới",
    en: "Enroll as New Student",
    zh: "注册新学员",
    ja: "新規受講生登録",
    km: "ចុះឈ្មោះសិស្សថ្មី",
  },
  "nav.logout": {
    vi: "Đăng xuất",
    en: "Sign Out",
    zh: "退出登录",
    ja: "ログアウト",
    km: "ចាកចេញ",
  },

  // Student & Admin Sidebar Navigation
  nav_dashboard: {
    vi: "Tổng quan học tập",
    en: "Dashboard Overview",
    zh: "学习总览",
    ja: "ダッシュボード",
    km: "ទិដ្ឋភាពទូទៅនៃការសិក្សា",
  },
  nav_courses: {
    vi: "Khóa học của tôi",
    en: "My Courses",
    zh: "我的课程",
    ja: "マイコース",
    km: "វគ្គសិក្សារបស់ខ្ញុំ",
  },
  nav_homework: {
    vi: "Bài tập về nhà",
    en: "Homework & Assignments",
    zh: "课后作业",
    ja: "宿題・課題",
    km: "កិច្ចការផ្ទះ",
  },
  nav_admin_homework: {
    vi: "Giao bài tập về nhà",
    en: "Assign & Grade Homework",
    zh: "布置与批改作业",
    ja: "宿題の出題・採点",
    km: "ដាក់កិច្ចការផ្ទះ",
  },
  nav_ielts_hub: {
    vi: "IELTS 4 Kỹ Năng (Nghe • Nói • Đọc • Viết)",
    en: "IELTS 4 Skills (L • R • W • S)",
    zh: "雅思听说读写四项全能",
    ja: "IELTS 4技能総合演習",
    km: "ជំនាញ IELTS ទាំង ៤",
  },
  nav_library: {
    vi: "Học liệu & Đề thi số",
    en: "Course Materials & Exams",
    zh: "课程资料与试卷",
    ja: "教材・試験問題集",
    km: "ឯកសារសិក្សា & សុវត្ថិភាព",
  },
  nav_classroom: {
    vi: "Phòng học trực tuyến",
    en: "Interactive Classroom",
    zh: "在线互动教室",
    ja: "オンライン教室",
    km: "បន្ទប់រៀនអនឡាញ",
  },
  nav_writing: {
    vi: "Luyện viết IELTS AI",
    en: "AI Writing Studio",
    zh: "雅思AI写作工坊",
    ja: "AIライティング演習",
    km: "ហាត់សរសេរ IELTS AI",
  },
  nav_speaking: {
    vi: "Studio luyện nói IELTS",
    en: "Speaking Studio",
    zh: "雅思口语录音室",
    ja: "スピーキング録音室",
    km: "ស្ទូឌីយោហាត់និយាយ IELTS",
  },
  nav_quiz: {
    vi: "Ngân hàng bài tập Quiz",
    en: "Quizzes & Exercises",
    zh: "测验与随堂练习",
    ja: "クイズ・演習問題",
    km: "ធនាគារលំហាត់ Quiz",
  },
  nav_attendance: {
    vi: "Điểm danh & Chuyên cần",
    en: "Attendance & Progress",
    zh: "出勤与出勤记录",
    ja: "出席・出欠管理",
    km: "វត្តមាន & ភាពទៀងទាត់",
  },
  nav_messages: {
    vi: "Tin nhắn & Thảo luận",
    en: "Messages & Chat",
    zh: "消息与实时沟通",
    ja: "メッセージ・連絡",
    km: "សារ & ការពិភាក្សា",
  },
  nav_account: {
    vi: "Tài khoản cá nhân",
    en: "Personal Account",
    zh: "个人账户设置",
    ja: "アカウント設定",
    km: "គណនីផ្ទាល់ខ្លួន",
  },
  nav_users: {
    vi: "Quản lý học viên",
    en: "Users Management",
    zh: "学员与用户管理",
    ja: "受講生・ユーザー管理",
    km: "គ្រប់គ្រងសិស្ស",
  },
  nav_admin_blogs: {
    vi: "Quản lý bài viết Blog",
    en: "Blog Posts Management",
    zh: "博客文章管理",
    ja: "ブログ記事管理",
    km: "គ្រប់គ្រងអត្ថបទប្លុក",
  },
  nav_admin_dashboard: {
    vi: "Tổng quan quản trị",
    en: "Admin Dashboard",
    zh: "管理后台总览",
    ja: "管理者ダッシュボード",
    km: "ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល",
  },
  nav_admin_courses: {
    vi: "Quản lý Đào tạo",
    en: "Courses Management",
    zh: "课程与教学管理",
    ja: "講座・カリキュラム管理",
    km: "គ្រប់គ្រងការបណ្តុះបណ្តាល",
  },
  nav_admin_library: {
    vi: "Học liệu số & Bảo mật",
    en: "Secured Library",
    zh: "数字资料与安全",
    ja: "資料ライブラリ管理",
    km: "បណ្ណាល័យឌីជីថល & សុវត្ថិភាព",
  },
  nav_admin_classroom: {
    vi: "Lên lịch phòng học",
    en: "Schedule Classrooms",
    zh: "排课与在线教室",
    ja: "オンライン教室スケジュール",
    km: "កាលវិភាគបន្ទប់រៀន",
  },
  nav_writing_review: {
    vi: "Duyệt bài Writing AI",
    en: "AI Writing Review",
    zh: "审核AI写作评分",
    ja: "AIライティング採点承認",
    km: "អនុម័តពិន្ទុ Writing AI",
  },
  nav_speaking_grading: {
    vi: "Chấm bài Speaking",
    en: "Speaking Assessment",
    zh: "口语评分与批注",
    ja: "スピーキング評価・採点",
    km: "ដាក់ពិន្ទុ Speaking",
  },
  nav_admin_quizzes: {
    vi: "Đề thi Quiz & Mock Test",
    en: "Quiz & Mock Tests",
    zh: "题库与在线测验",
    ja: "問題バンク・小テスト",
    km: "ធនាគារវិញ្ញាសា & Quiz",
  },
  nav_admin_attendance: {
    vi: "Báo cáo Điểm danh",
    en: "Attendance Reports",
    zh: "出勤考勤报表",
    ja: "出席レポート出力",
    km: "របាយការណ៍វត្តមាន",
  },
  nav_system_settings: {
    vi: "Cài đặt hệ thống",
    en: "System Settings",
    zh: "系统设置",
    ja: "システム設定",
    km: "ការកំណត់ប្រព័ន្ធ",
  },

  // Announcement Bar
  "announcement.text": {
    vi: "✨ Khám phá phòng thi thử IELTS Mock Test như thi thật & Trợ lý chấm Writing AI độc quyền tại Teacher Dong Academy!",
    en: "✨ Explore authentic IELTS Mock Tests & exclusive AI IELTS Writing evaluation at Teacher Dong Academy!",
    zh: "✨ 探索董老师学院专属雅思全真机考模考与雅思写作 AI 智能批改系统！",
    ja: "✨ IELTS本番形式模試＆AIライティング添削を今すぐ体験！",
    km: "✨ ស្វែងយល់ពីការប្រឡងសាកល្បង IELTS Mock Test ដូចការប្រឡងពិត & ជំនួយការដាក់ពិន្ទុ IELTS Writing AI ផ្តាច់មុខ!",
  },

  // Hero Section
  "home.badge": {
    vi: "Learn. Grow. Share. Inspire.",
    en: "Learn. Grow. Share. Inspire.",
    zh: "学习 • 成长 • 分享 • 启发",
    ja: "学び • 成長 • 共有 • 刺激",
    km: "Learn. Grow. Share. Inspire.",
  },
  "home.heroTitle": {
    vi: "Học tiếng Anh để tự tin bước xa hơn",
    en: "Learn English to Step Further with Confidence",
    zh: "学习英语，自信迈向更远未来",
    ja: "英語を学び、自信を持ってさらなる一歩へ",
    km: "រៀនភាសាអង់គ្លេសដើម្បីបោះជំហានទៅមុខដោយទំនុកចិត្ត",
  },
  "home.heroTitleHighlight": {
    vi: "tự tin",
    en: "Confidence",
    zh: "自信",
    ja: "自信",
    km: "ទំនុកចិត្ត",
  },
  "home.heroSubtitle": {
    vi: "Teacher Dong Academy đồng hành cùng học sinh, sinh viên và người đi làm trên hành trình chinh phục tiếng Anh, luyện thi IELTS thực chiến và phát triển bản thân với hệ thống học tập hiện đại cùng trợ lý AI thông minh.",
    en: "Teacher Dong Academy accompanies students, graduates, and professionals to master English, excel in real-world IELTS exams, and unlock global potential with modern learning tools and smart AI assistance.",
    zh: "董老师英语学院致力于陪伴每一位学员提升英语能力、实战备考雅思与自我成长，提供现代化的学习系统与智能 AI 助教。",
    ja: "ドンスクール英語アカデミーは、実戦的なIELTS対策と英語力向上を通じて、受講生の目標達成と自己成長を力強く支援します。",
    km: "Teacher Dong Academy រួមដំណើរជាមួយសិស្ស និស្សិត និងបុគ្គលិកលើវិថីរៀនភាសាបរទេស ត្រៀមប្រឡង IELTS ជាក់ស្តែង និងអភិវឌ្ឍខ្លួនឯង។",
  },
  "home.exploreBtn": {
    vi: "Khám phá 5 Chương trình trọng tâm",
    en: "Explore 5 Core Programs",
    zh: "探索 5 大核心课程",
    ja: "5つの主要プログラムを見る",
    km: "ស្វែងយល់ពី ៥ កម្មវិធីស្នូល",
  },
  "home.registerBtn": {
    vi: "Đăng ký học viên mới",
    en: "Enroll as New Student",
    zh: "注册新学员",
    ja: "新規受講生登録",
    km: "ចុះឈ្មោះសិស្សថ្មី",
  },
  "home.demoBtn": {
    vi: "Trải nghiệm phòng học thử",
    en: "Experience Trial Classroom",
    zh: "体验试听教室",
    ja: "体験教室に参加",
    km: "ពិសោធន៍បន្ទប់រៀនសាកល្បង",
  },

  // 4 Core Values
  "values.learn.title": {
    vi: "Learn",
    en: "Learn",
    zh: "学习 (Learn)",
    ja: "学ぶ (Learn)",
    km: "រៀនសូត្រ (Learn)",
  },
  "values.learn.desc": {
    vi: "Học có phương pháp, lộ trình bài bản & mục tiêu rõ ràng.",
    en: "Methodical learning with structured roadmaps & clear milestones.",
    zh: "科学的学习方法、系统的规划与清晰的目标。",
    ja: "体系的な学習法と明確な目標設定。",
    km: "រៀនប្រកបដោយវិធីសាស្ត្រ ផែនការច្បាស់លាស់ & គោលដៅជាក់លាក់។",
  },
  "values.grow.title": {
    vi: "Grow",
    en: "Grow",
    zh: "成长 (Grow)",
    ja: "成長 (Grow)",
    km: "រីកចម្រើន (Grow)",
  },
  "values.grow.desc": {
    vi: "Phát triển năng lực ngôn ngữ, tư duy & sự tự tin.",
    en: "Grow linguistic proficiency, critical mindset & confidence.",
    zh: "提升语言技能、思维方式与自信心。",
    ja: "語学力、思考力、自信の育成。",
    km: "អភិវឌ្ឍសមត្ថភាពភាសា ការគិតពិចារណា & ភាពជឿជាក់លើខ្លួនឯង។",
  },
  "values.share.title": {
    vi: "Share",
    en: "Share",
    zh: "分享 (Share)",
    ja: "共有 (Share)",
    km: "ចែករំលែក (Share)",
  },
  "values.share.desc": {
    vi: "Chia sẻ tri thức, bài học kinh nghiệm quốc tế quý báu.",
    en: "Share knowledge, pedagogical lessons & international experience.",
    zh: "分享宝贵国际经验、教育教学体会与学问。",
    ja: "貴重な国際経験と知見の共有。",
    km: "ចែករំលែកចំណេះដឹង មេរៀនបទពិសោធន៍អន្តរជាតិដ៏មានតម្លៃ។",
  },
  "values.inspire.title": {
    vi: "Inspire",
    en: "Inspire",
    zh: "启发 (Inspire)",
    ja: "刺激 (Inspire)",
    km: "បំផុសគំនិត (Inspire)",
  },
  "values.inspire.desc": {
    vi: "Thắp sáng niềm đam mê học tập suốt đời và vươn ra thế giới.",
    en: "Ignite passion for lifelong learning and global reach.",
    zh: "点燃终身学习与走向世界的热情。",
    ja: "生涯学習への情熱を灯し世界へ。",
    km: "ដុតបំភ្លឺចំណង់ចំណូលចិត្តក្នុងការរៀនសូត្រពេញមួយជីវិត និងឈានទៅកាន់ពិភពលោក។",
  },

  // 5 Pillars Section
  "pillars.headingBadge": {
    vi: "CHƯƠNG TRÌNH ĐÀO TẠO CHÍNH THỨC",
    en: "OFFICIAL CURRICULUM",
    zh: "官方培养体系",
    ja: "公式トレーニングプログラム",
    km: "កម្មវិធីបណ្តុះបណ្តាលផ្លូវការ",
  },
  "pillars.title": {
    vi: "5 Trụ Cột Đào Tạo Trọng Tâm — Teacher Dong Academy",
    en: "5 Core Training Pillars — Teacher Dong Academy",
    zh: "5大核心教学支柱 — 董老师学院",
    ja: "5つの主要教育柱 — ドンスクールアカデミー",
    km: "សសរស្ដម្ភបណ្តុះបណ្តាលស្នូលទាំង ៥ — Teacher Dong Academy",
  },
  "pillars.subtitle": {
    vi: "Hệ sinh thái đào tạo toàn diện được thiết kế chuyên biệt, đáp ứng nhu cầu phát triển năng lực ngôn ngữ, chuyên môn sư phạm và kỹ năng sống cho mọi thế hệ người học.",
    en: "A comprehensive training ecosystem tailored to fulfill language proficiency, modern pedagogical mastery, and 21st-century life skills for every learner.",
    zh: "量身定制的全方位教学体系，满足各年龄段学习者在语言提升、教学专业和生活技能方面的需求。",
    ja: "語学力、指導法、21世紀型スキルを網羅した包括的な総合教育エコシステム。",
    km: "ប្រព័ន្ធអេកូឡូស៊ីបណ្តុះបណ្តាលដ៏ទូលំទូលាយត្រូវបានរៀបចំឡើងយ៉ាងពិសេស ដើម្បីឆ្លើយតបទៅនឹងតម្រូវការអភិវឌ្ឍសមត្ថភាពភាសា គរុកោសល្យ និងជំនាញជីវិតសម្រាប់អ្នកសិក្សាគ្រប់ជំនាន់។",
  },
  "pillars.filter.all": {
    vi: "Tất cả (5 Trụ Cột)",
    en: "All (5 Pillars)",
    zh: "全部 (5大支柱)",
    ja: "すべて (5つの柱)",
    km: "ទាំងអស់ (៥ សសរស្ដម្ភ)",
  },
  "pillars.filter.p1": {
    vi: "1. English Proficiency",
    en: "1. English Proficiency",
    zh: "1. 英语能力",
    ja: "1. 英語運用能力",
    km: "1. សមត្ថភាពភាសាអង់គ្លេស",
  },
  "pillars.filter.p2": {
    vi: "2. Professional Development",
    en: "2. Professional Development",
    zh: "2. 专业发展",
    ja: "2. 指導者専門開発",
    km: "2. ការអភិវឌ្ឍវិជ្ជាជីវៈ",
  },
  "pillars.filter.p3": {
    vi: "3. Life Skills",
    en: "3. Life Skills",
    zh: "3. 生活技能",
    ja: "3. ライフスキル",
    km: "3. ជំនាញជីវិត",
  },
  "pillars.filter.p4": {
    vi: "4. Life Experiences",
    en: "4. Life Experiences",
    zh: "4. 人生阅历",
    ja: "4. 人生経験",
    km: "4. បទពិសោធន៍ជីវិត",
  },
  "pillars.filter.p5": {
    vi: "5. Travel & Culture",
    en: "5. Travel & Culture",
    zh: "5. 旅行文化",
    ja: "5. 旅と文化",
    km: "5. ទេសចរណ៍ & វប្បធម៌",
  },
  "pillars.detailBtn": {
    vi: "Xem chi tiết & Đăng ký tư vấn",
    en: "View Details & Consult",
    zh: "查看详情与咨询",
    ja: "詳細を見る・相談予約",
    km: "មើលលម្អិត & ចុះឈ្មោះប្រឹក្សា",
  },
  "pillars.viewShowcase": {
    vi: "Tiêu điểm chi tiết",
    en: "Spotlight Showcase",
    zh: "深度焦点",
    ja: "スポットライト",
    km: "ការផ្តោតអារម្មណ៍ស៊ីជម្រៅ",
  },
  "pillars.viewGrid": {
    vi: "Toàn bộ 5 trụ cột",
    en: "All 5 Pillars Grid",
    zh: "全部5大支柱",
    ja: "5つの柱一覧",
    km: "ទិដ្ឋភាព ៥ សសរស្ដម្ភ",
  },

  // Tech Preview Section
  "tech.badge": {
    vi: "TRẢI NGHIỆM TƯƠNG TÁC MIỄN PHÍ",
    en: "FREE INTERACTIVE TRIAL",
    zh: "免费互动体验",
    ja: "無料インタラクティブ体験",
    km: "បទពិសោធន៍អន្តរកម្មឥតគិតថ្លៃ",
  },
  "tech.title": {
    vi: "Công Nghệ Giảng Dạy Đột Phá — Trải Nghiệm Thử Ngay",
    en: "Interactive Learning Experience — Try It Now",
    zh: "突破性教育科技 — 立即体验",
    ja: "革新的な教育技術 — 今すぐ体験",
    km: "បច្ចេកវិទ្យាបង្រៀនឈានមុខ — សាកល្បងភ្លាមៗ",
  },
  "tech.subtitle": {
    vi: "Teacher Dong Academy tích hợp phòng làm bài Mock Test như thi IELTS thật và Trí tuệ nhân tạo AI. Bạn có thể bấm trải nghiệm thử từng tính năng ngay dưới đây:",
    en: "Teacher Dong Academy integrates authentic IELTS Mock Tests and advanced AI learning tools. Experience each feature directly below:",
    zh: "董老师学院集成雅思全真机考模考系统与 AI 智能助教工具。您可以立即体验以下各项功能：",
    ja: "本番準拠のIELTS模擬試験システムとAI学習支援ツールを統合。以下の各機能を直接お試しいただけます：",
    km: "Teacher Dong Academy រួមបញ្ចូលការប្រឡងសាកល្បង IELTS Mock Test ដូចការប្រឡងពិត និង AI។ អ្នកអាចសាកល្បងមុខងារនីមួយៗនៅខាងក្រោម៖",
  },
  "tech.mocktest.title": {
    vi: "Làm Mock Test",
    en: "IELTS Mock Test",
    zh: "雅思全真机考模考",
    ja: "IELTS本番形式模試",
    km: "IELTS Mock Test ",
  },
  "tech.mocktest.desc": {
    vi: "Mô phỏng 100% kỳ thi IELTS trên máy tính, đồng hồ đếm ngược, chấm điểm tức thì và phân tích đáp án chi tiết.",
    en: "100% authentic computer-delivered IELTS exam simulation with real-time countdown timer, instant scoring, and explanations.",
    zh: "100% 还原雅思机考真实考场，倒计时实战、智能判分与详尽答案解析。",
    ja: "コンピューター形式のIELTS本番を完全再現。タイマー、自動採点、詳細解説付き。",
    km: "ត្រាប់តាមការប្រឡង IELTS លើកុំព្យូទ័រ 100% មាននាឡិការាប់ថយក្រោយ ដាក់ពិន្ទុភ្លាមៗ និងការពន្យល់លម្អិត។",
  },
  "tech.mocktest.btn": {
    vi: "Làm bài thi thử ngay",
    en: "Try Mock Test Now",
    zh: "立即开始模考",
    ja: "今すぐ模試を受ける",
    km: "ធ្វើតេស្តសាកល្បងឥឡូវនេះ",
  },
  "tech.livekit.title": {
    vi: "Lớp Học Trực Tuyến Tương Tác",
    en: "Interactive Online Classroom",
    zh: "实时互动在线教室",
    ja: "リアルタイム対話型教室",
    km: "បន្ទប់រៀនអន្តរកម្មផ្ទាល់",
  },
  "tech.livekit.desc": {
    vi: "1 Giảng viên + 7 Học viên, tương tác âm thanh & hình ảnh HD, bảng trắng trực tiếp thời gian thực.",
    en: "1 Host + 7 Students, HD audio/video interaction, live interactive canvas whiteboard.",
    zh: "1位教师 + 7位学员，高清音视频互动，实时协作电子白板。",
    ja: "講師1名＋受講生7名、HDオーディオ＆ビデオ通話、リアルタイムホワイトボード。",
    km: "គ្រូ ១ នាក់ + សិស្ស ៧ នាក់ អន្តរកម្មសំឡេង & រូបភាពកម្រិត HD ក្តារខៀនអន្តរកម្មផ្ទាល់ពេលវេលាជាក់ស្តែង។",
  },
  "tech.livekit.btn": {
    vi: "Thử phòng học trực tuyến",
    en: "Try Online Classroom",
    zh: "体验在线教室",
    ja: "オンライン教室を試す",
    km: "សាកល្បងបន្ទប់រៀនអនឡាញ",
  },
  "tech.writing.title": {
    vi: "AI Writing 4 Tiêu Chí",
    en: "AI Writing 4 Criteria",
    zh: "AI 写作 4 项标准评估",
    ja: "AI ライティング 4基準採点",
    km: "AI Writing ៤ លក្ខណៈវិនិច្ឆ័យ",
  },
  "tech.writing.desc": {
    vi: "Phân tích bài viết IELTS Task 1 & 2 tức thì, chấm điểm TR, CC, LR, GRA và gợi ý từ vựng C1/C2.",
    en: "Instant evaluation for IELTS Task 1 & 2, scoring TR, CC, LR, GRA with C1/C2 vocabulary suggestions.",
    zh: "即时分析雅思 Task 1 和 Task 2 作文，评分 TR、CC、LR、GRA 并推荐 C1/C2 高分词汇。",
    ja: "IELTS Task 1 & 2を即座に分析、4基準（TR, CC, LR, GRA）で採点しC1/C2表現を提案。",
    km: "វិភាគអត្ថបទ IELTS Task 1 & 2 ភ្លាមៗ ដាក់ពិន្ទុ TR, CC, LR, GRA និងស្នើពាក្យគន្លឹះកម្រិត C1/C2។",
  },
  "tech.writing.btn": {
    vi: "Thử chấm bài Writing AI",
    en: "Try AI Writing Grader",
    zh: "体验 AI 写作批改",
    ja: "AIライティングを試す",
    km: "សាកល្បងដាក់ពិន្ទុ Writing AI",
  },
  "tech.speaking.title": {
    vi: "Speaking Studio",
    en: "Speaking Studio",
    zh: "口语录音工作室",
    ja: "スピーキング録音スタジオ",
    km: "ស្ទូឌីយោ Speaking",
  },
  "tech.speaking.desc": {
    vi: "Phòng thu âm Web Audio trực tiếp trên trình duyệt, sóng âm trực quan và ghim nhận xét theo mốc thời gian.",
    en: "In-browser Web Audio recorder with live waveform visualization and timestamped feedback.",
    zh: "网页原生 Web Audio 录音室，实时声波显示与按时间戳精确定位评语。",
    ja: "Web Audio APIによるブラウザ録音、リアルタイム波形表示とタイムスタンプ添削。",
    km: "ស្ទូឌីយោថតសំឡេង Web Audio ផ្ទាល់លើកម្មវិធីរុករក បង្ហាញរលកសំឡេង និងមតិយោបល់តាមកំណត់ពេលជាក់លាក់។",
  },
  "tech.speaking.btn": {
    vi: "Thử phòng thu âm",
    en: "Try Audio Studio",
    zh: "体验口语录音室",
    ja: "録音スタジオを試す",
    km: "សាកល្បងស្ទូឌីយោថតសំឡេង",
  },
  "tech.library.title": {
    vi: "Bảo Mật Học Liệu Số",
    en: "Digital Library Security",
    zh: "数字资料安全保护",
    ja: "デジタル教材セキュリティ",
    km: "សុវត្ថិភាពឯកសារឌីជីថល",
  },
  "tech.library.desc": {
    vi: "Dynamic Watermark chuyển động chống quay lén, token ký số 15 phút và bảo vệ tài liệu tuyệt đối.",
    en: "Dynamic floating watermarks with student info, 15-minute signed URLs, preventing screen recording.",
    zh: "动态漂移水印防录屏，15分钟防盗链签名 URL，严密保护数字版权。",
    ja: "動的ウォーターマークによる録画防止、15分限定署名付きURLによる厳格な著作権保護。",
    km: "Dynamic Watermark ចលនាការពារការថតលួច តំណភ្ជាប់ Signed URL រយៈពេល ១៥ នាទី ការពារឯកសារយ៉ាងតឹងរ៉ឹង។",
  },
  "tech.library.btn": {
    vi: "Xem tài liệu bảo mật",
    en: "View Secured Materials",
    zh: "查看安全资料",
    ja: "安全な教材を閲覧",
    km: "មើលឯកសារសុវត្ថិភាព",
  },

  // About Teacher Dong
  "about.badge": {
    vi: "LỜI NGỎ TỪ GIẢNG VIÊN",
    en: "A WORD FROM TEACHER DONG",
    zh: "主讲导师寄语",
    ja: "専任講師からのメッセージ",
    km: "សារស្វាគមន៍ពីលោកគ្រូ",
  },
  "about.role": {
    vi: "FOUNDER & MASTER INSTRUCTOR",
    en: "FOUNDER & MASTER INSTRUCTOR",
    zh: "创始人兼主讲导师",
    ja: "創立者・主任講師",
    km: "ស្ថាបនិក & គ្រូបង្គោល",
  },
  "about.degree": {
    vi: "Thạc sĩ Sư phạm • 10+ Năm Giảng dạy Quốc tế",
    en: "Master of Education • 10+ Years International Teaching",
    zh: "教育学硕士 • 10年以上国际教学经验",
    ja: "教育学修士 • 10年以上の国際教育指導実績",
    km: "អនុបណ្ឌិតគរុកោសល្យ • បទពិសោធន៍បង្រៀនអន្តរជាតិ ១០+ ឆ្នាំ",
  },
  "about.quote": {
    vi: '"Học tiếng Anh để tự tin bước ra thế giới, chia sẻ để lan tỏa giá trị bền vững"',
    en: '"Learn English to step out into the world, share to spread lasting values"',
    zh: "“学英语以自信走向世界，乐分享以传递恒久价值”",
    ja: "「世界へ羽ばたく自信のために英語を学び、価値を分かち合う」",
    km: "“រៀនភាសាអង់គ្លេសដើម្បីឈានទៅកាន់ពិភពលោក ចែករំលែកដើម្បីផ្សព្វផ្សាយគុណតម្លៃយូរអង្វែង”",
  },
  "about.bio": {
    vi: "Chào bạn! Tôi thành lập Teacher Dong Academy với mong muốn tạo nên một không gian học tập thực sự khác biệt: nơi học viên không phải học vẹt hay sợ hãi khi nói sai, mà được khích lệ tư duy phản biện, làm chủ công nghệ hiện đại và mở rộng tầm nhìn toàn cầu.",
    en: "Welcome! I founded Teacher Dong Academy to build an authentic learning atmosphere where students do not cram or fear making mistakes, but are empowered to think critically, master cutting-edge technology, and broaden their global perspective.",
    zh: "你好！创立董老师英语学院的初衷，是打造一个真正与众不同的学习空间：在这里无需死记硬背，无需害怕犯错，而是鼓励批判性思维，拥抱现代科技，拓宽全球化视野。",
    ja: "ようこそ！間違いを恐れたり丸暗記することなく、受講生が批判的思考力を磨き、最新技術を使いこなし、世界へ視野を広げられる学びの場を提供します。",
    km: "សូមស្វាគមន៍! ខ្ញុំបានបង្កើត Teacher Dong Academy ឡើងដោយមានបំណងបង្កើតកន្លែងរៀនសូត្រដ៏ប្លែកមួយ៖ ជាកន្លែងដែលសិស្សមិនចាំបាច់រៀនទន្ទេញ ឬខ្លាចការនិយាយខុស តែត្រូវបានលើកទឹកចិត្តឱ្យគិតពិចារណា ធ្វើជាម្ចាស់លើបច្ចេកវិទ្យា និងពង្រីកទស្សនវិស័យសកល។",
  },
  "about.stat1.title": {
    vi: "100% Tận tâm",
    en: "100% Dedicated",
    zh: "100% 用心辅导",
    ja: "100% 専任指導",
    km: "១០០% ការយកចិត្តទុកដាក់",
  },
  "about.stat1.desc": {
    vi: "Trực tiếp theo sát & chấm bài học viên",
    en: "Personally grading and coaching each student",
    zh: "导师亲自批改作业与跟踪指导",
    ja: "全受講生の課題を直接添削指導",
    km: "តាមដាន និងកែសម្រួលលំហាត់ដោយផ្ទាល់សម្រាប់សិស្សម្នាក់ៗ",
  },
  "about.stat2.title": {
    vi: "Lớp học trực tuyến",
    en: "Max 7 Students / Class",
    zh: "精品小班 (最多7人)",
    ja: "少人数制（最大7名）",
    km: "ថ្នាក់រៀនអតិបរមា ៧ នាក់",
  },
  "about.stat2.desc": {
    vi: "Tương tác sâu, phản hồi tức thì",
    en: "High interaction & immediate feedback",
    zh: "深度互动与实时答疑反馈",
    ja: "密度の高い対話と即時フィードバック",
    km: "អន្តរកម្មស៊ីជម្រៅ ឆ្លើយតបមតិយោបល់ភ្លាមៗ",
  },
  "about.stat3.title": {
    vi: "Luyện Thi Thực Chiến",
    en: "Exam-Ready Training",
    zh: "实战化高效备考",
    ja: "実践的スコアアップ",
    km: "ការហ្វឹកហាត់ប្រឡងជាក់ស្តែង",
  },
  "about.stat3.desc": {
    vi: "Mock Test chuẩn thi thật & Trợ lý AI đồng hành",
    en: "Authentic Mock Tests & 24/7 AI-powered feedback",
    zh: "雅思全真模考机考与 AI 智能助教全程伴学",
    ja: "本番形式のIELTS模試とAIスマート添削サポート",
    km: "ការប្រឡងសាកល្បង Mock Test & ជំនួយការ AI 24/7",
  },
  "about.ctaJoin": {
    vi: "Đăng ký tham gia lớp học cùng Teacher Dong",
    en: "Join Teacher Dong’s Class",
    zh: "报名加入董老师的课程",
    ja: "ドンスクールのクラスに参加する",
    km: "ចុះឈ្មោះចូលរៀនជាមួយលោកគ្រូ Dong",
  },
  "about.ctaConsult": {
    vi: "Đặt lịch tư vấn 1:1 miễn phí",
    en: "Book Free 1-on-1 Consultation",
    zh: "预约 1对1 免费咨询",
    ja: "無料1対1相談を予約する",
    km: "កក់ការប្រឹក្សា ១:១ ដោយឥតគិតថ្លៃ",
  },

  // Consultation Form
  "consult.badge": {
    vi: "TƯ VẤN LỘ TRÌNH HỌC TẬP",
    en: "LEARNING ROADMAP CONSULTATION",
    zh: "个性化学习规划咨询",
    ja: "学習ロードマップ無料相談",
    km: "ការប្រឹក្សាផែនការសិក្សា",
  },
  "consult.title": {
    vi: "Nhận Tư Vấn Lộ Trình & Đăng Ký Kiểm Tra Đầu Vào",
    en: "Get Roadmap Consultation & Free Placement Test",
    zh: "获取学习规划咨询与免费入学水平测试",
    ja: "学習ロードマップ相談＆無料レベル診断",
    km: "ទទួលការប្រឹក្សាផែនការសិក្សា & តេស្តវាស់កម្រិតឥតគិតថ្លៃ",
  },
  "consult.subtitle": {
    vi: "Để lại thông tin bên cạnh, Teacher Dong Academy sẽ liên hệ trực tiếp với bạn trong vòng 24 giờ để đánh giá trình độ và xây dựng lộ trình học tập cá nhân hóa hoàn toàn miễn phí.",
    en: "Leave your details and Teacher Dong Academy will contact you within 24 hours to assess your English level and tailor your learning roadmap completely free.",
    zh: "填写右侧信息，董老师学院将在24小时内联系您，为您进行水平评估并量身定制专属学习规划，全程免费。",
    ja: "フォームよりご連絡ください。24時間以内にレベルチェックを行い、あなた専用の学習ロードマップを無料で作成します。",
    km: "សូមទុកព័ត៌មានរបស់អ្នក Teacher Dong Academy នឹងទាក់ទងមកអ្នកវិញក្នុងរយៈពេល ២៤ ម៉ោង ដើម្បីវាយតម្លៃកម្រិត និងបង្កើតផែនការសិក្សាផ្ទាល់ខ្លួនដោយឥតគិតថ្លៃ។",
  },
  "consult.benefit1": {
    vi: "Miễn phí kiểm tra 4 kỹ năng (Listening, Speaking, Reading, Writing)",
    en: "Free 4-skill assessment (Listening, Speaking, Reading, Writing)",
    zh: "免费 4 项技能诊断（听、说、读、写）",
    ja: "4技能（リスニング、スピーキング、リーディング、ライティング）の無料診断",
    km: "ឥតគិតថ្លៃធ្វើតេស្ត ៤ ជំនាញ (Listening, Speaking, Reading, Writing)",
  },
  "consult.benefit2": {
    vi: "Tư vấn trực tiếp 1:1 phù hợp theo 5 Trụ cột chương trình",
    en: "Direct 1-on-1 consultation tailored to the 5 Core Pillars",
    zh: "基于 5 大核心课程的 1对1 深度规划",
    ja: "5つの主要教育柱に基づく個別相談",
    km: "ប្រឹក្សាផ្ទាល់ ១:១ ស្របតាម ៥ សសរស្ដម្ភនៃកម្មវិធី",
  },
  "consult.benefit3": {
    vi: "Tặng 1 buổi học thử trực tiếp cùng giảng viên & phòng thi thử IELTS",
    en: "Complimentary trial session with instructor & authentic IELTS Mock Test",
    zh: "免费赠送 1 节名师互动体验课及雅思全真模考体验",
    ja: "専任講師による無料体験授業1回＆IELTS模試体験をプレゼント",
    km: "ជូនកាដូ ១ វគ្គរៀនសាកល្បងជាមួយគ្រូ & ធ្វើតេស្តសាកល្បង IELTS",
  },
  "consult.formTitle": {
    vi: "Thông tin đăng ký tư vấn",
    en: "Consultation Request Form",
    zh: "咨询预约表单",
    ja: "相談お申し込みフォーム",
    km: "ព័ត៌មានចុះឈ្មោះប្រឹក្សា",
  },
  "consult.nameLabel": {
    vi: "Họ và tên của bạn: *",
    en: "Full Name: *",
    zh: "您的姓名：*",
    ja: "お名前：*",
    km: "គោត្តនាម និងនាមរបស់អ្នក: *",
  },
  "consult.emailLabel": {
    vi: "Địa chỉ Email: *",
    en: "Email Address: *",
    zh: "电子邮箱：*",
    ja: "メールアドレス：*",
    km: "អាសយដ្ឋានអ៊ីមែល: *",
  },
  "consult.phoneLabel": {
    vi: "Số điện thoại: *",
    en: "Phone Number: *",
    zh: "联系电话：*",
    ja: "お電話番号：*",
    km: "លេខទូរស័ព្ទ: *",
  },
  "consult.programLabel": {
    vi: "Chương trình đào tạo quan tâm: *",
    en: "Interested Program: *",
    zh: "感兴趣的课程领域：*",
    ja: "ご希望のプログラム：*",
    km: "កម្មវិធីបណ្តុះបណ្តាលដែលចាប់អារម្មណ៍: *",
  },
  "consult.programSelectPlaceholder": {
    vi: "-- Chọn 1 trong 5 Trụ Cột Đào Tạo --",
    en: "-- Select 1 of 5 Core Pillars --",
    zh: "-- 选择 5 大核心支柱之一 --",
    ja: "-- 5つの柱から選択してください --",
    km: "-- ជ្រើសរើស ១ ក្នុងចំណោម ៥ សសរស្ដម្ភ --",
  },
  "consult.opt1": {
    vi: "1. English Proficiency (IELTS, Business, Giao tiếp, Thiếu nhi)",
    en: "1. English Proficiency (IELTS, Business, Conversational, Kids)",
    zh: "1. 英语能力 (雅思、商务、日常口语、少儿英语)",
    ja: "1. 英語運用能力 (IELTS、ビジネス、日常会話、キッズ)",
    km: "1. សមត្ថភាពភាសាអង់គ្លេស (IELTS, ពាណិជ្ជកម្ម, ទំនាក់ទំនង, កុមារ)",
  },
  "consult.opt2": {
    vi: "2. Professional Development (Sư phạm AI, Lãnh đạo, Nghiên cứu)",
    en: "2. Professional Development (AI Pedagogy, Leadership, Research)",
    zh: "2. 教师专业发展 (AI教育应用、领导力、学术研究)",
    ja: "2. 指導者専門開発 (AI教育、リーダーシップ、研究)",
    km: "2. ការអភិវឌ្ឍវិជ្ជាជីវៈ (គរុកោសល្យ AI, ភាពជាអ្នកដឹកនាំ, ការស្រាវជ្រាវ)",
  },
  "consult.opt3": {
    vi: "3. Life Skills & Personal Growth (Tư duy phản biện, Thuyết trình)",
    en: "3. Life Skills & Personal Growth (Critical Thinking, Public Speaking)",
    zh: "3. 生活技能与成长 (批判性思维、公众演讲、时间管理)",
    ja: "3. ライフスキル＆自己成長 (クリティカルシンキング、スピーチ)",
    km: "3. ជំនាញជីវិត & ការអភិវឌ្ឍខ្លួនឯង (ការគិតពិចារណា, ការថ្លែងសុន្ទរកថា)",
  },
  "consult.opt4": {
    vi: "4. Life Experiences & Inspiration (Tọa đàm, Kinh nghiệm quốc tế)",
    en: "4. Life Experiences & Inspiration (Talkshows, Overseas Experience)",
    zh: "4. 人生阅历与启发 (励志讲座、海外教学纪实)",
    ja: "4. 人生経験とインスピレーション (対談、海外経験談)",
    km: "4. បទពិសោធន៍ជីវិត & ការលើកទឹកចិត្ត (វេទិកាសន្ទនា, បទពិសោធន៍អន្តរជាតិ)",
  },
  "consult.opt5": {
    vi: "5. Travel & Culture Blog (Văn hóa, Khám phá Châu Á)",
    en: "5. Travel & Culture Blog (Cultural Awareness, Discovering Asia)",
    zh: "5. 旅行文化专栏 (跨文化理解、探索亚洲、语言人文)",
    ja: "5. 旅と文化ブログ (異文化理解、アジア探訪、言語と人間)",
    km: "5. ប្លុកទេសចរណ៍ & វប្បធម៌ (ការយល់ដឹងពីវប្បធម៌, ការរុករកអាស៊ី)",
  },
  "consult.notesLabel": {
    vi: "Mục tiêu hoặc câu hỏi của bạn:",
    en: "Your Goals or Questions:",
    zh: "学习目标或咨询问题：",
    ja: "学習目標またはご質問：",
    km: "គោលដៅ ឬសំណួររបស់អ្នក:",
  },
  "consult.notesPlaceholder": {
    vi: "Ví dụ: Em cần đạt IELTS 7.0 trong 6 tháng tới...",
    en: "e.g., I aim for IELTS 7.0 in the next 6 months...",
    zh: "例如：希望在未来6个月内考到雅思7.0分...",
    ja: "例：半年以内にIELTS 7.0の取得を目指しています...",
    km: "ឧទាហរណ៍៖ ខ្ញុំចង់ទទួលបាន IELTS 7.0 ក្នុងរយៈពេល ៦ ខែខាងមុខ...",
  },
  "consult.submitBtn": {
    vi: "Gửi thông tin đăng ký tư vấn",
    en: "Submit Consultation Request",
    zh: "提交咨询申请",
    ja: "無料相談を申し込む",
    km: "ផ្ញើព័ត៌មានចុះឈ្មោះប្រឹក្សា",
  },
  "consult.successMsg": {
    vi: "🎉 Cảm ơn bạn! Thông tin đã được gửi. Teacher Dong sẽ liên hệ với bạn trong vòng 24 giờ.",
    en: "🎉 Thank you! Your request is submitted. Teacher Dong will contact you within 24 hours.",
    zh: "🎉 感谢您的提交！董老师将在24小时内与您取得联系。",
    ja: "🎉 お申し込みありがとうございます。24時間以内にご連絡いたします。",
    km: "🎉 សូមអរគុណ! ព័ត៌មានត្រូវបានផ្ញើ។ លោកគ្រូ Dong នឹងទាក់ទងមកអ្នកក្នុងរយៈពេល ២៤ ម៉ោង។",
  },

  // Modal Detail
  "modal.objective": {
    vi: "Mục tiêu & Nội dung trọng tâm:",
    en: "Objectives & Core Focus:",
    zh: "目标与核心内容：",
    ja: "目標と主な内容：",
    km: "គោលបំណង & ខ្លឹមសារស្នូល:",
  },
  "modal.target": {
    vi: "Đối tượng học viên:",
    en: "Target Audience:",
    zh: "适合对象：",
    ja: "対象受講生：",
    km: "មុខសញ្ញាសិស្ស:",
  },
  "modal.format": {
    vi: "Hình thức đào tạo:",
    en: "Learning Format:",
    zh: "授课模式：",
    ja: "受講形態：",
    km: "ទម្រង់នៃការបណ្តុះបណ្តាល:",
  },
  "modal.close": {
    vi: "Đóng",
    en: "Close",
    zh: "关闭",
    ja: "閉じる",
    km: "បិទ",
  },
  "modal.enroll": {
    vi: "Đăng ký tư vấn khóa học này",
    en: "Consult for This Course",
    zh: "预约该课程咨询",
    ja: "この講座を相談予約する",
    km: "ចុះឈ្មោះប្រឹក្សាសម្រាប់វគ្គសិក្សានេះ",
  },

  // Footer
  "footer.desc": {
    vi: "Nền tảng đào tạo tiếng Anh học thuật & phát triển năng lực toàn diện. Tiên phong kết hợp mô hình lớp học chất lượng cao và Trí tuệ nhân tạo AI hỗ trợ học tập.",
    en: "Academic English and holistic capability development platform. Pioneering interactive high-quality classrooms and AI-powered learning assistance.",
    zh: "学术英语与综合素养培训平台，前沿融合高品质小班互动与 AI 智能学习支持。",
    ja: "アカデミック英語と総合的能力開発プラットフォーム。高品質な対話型クラスとAI技術を融合した教育環境。",
    km: "វេទិកាបណ្តុះបណ្តាលភាសាអង់គ្លេសសិក្សា និងអភិវឌ្ឍសមត្ថភាពទូលំទូលាយ ដោយរួមបញ្ចូលថ្នាក់រៀនអន្តរកម្មកម្រិតខ្ពស់ និង AI។",
  },
  "footer.colPrograms": {
    vi: "5 TRỤ CỘT ĐÀO TẠO",
    en: "5 CORE PILLARS",
    zh: "5大核心课程",
    ja: "5つの主要教育柱",
    km: "សសរស្ដម្ភបណ្តុះបណ្តាលទាំង ៥",
  },
  "footer.colTech": {
    vi: "CÔNG CỤ HỌC TẬP",
    en: "LEARNING TOOLS",
    zh: "学习与备考工具",
    ja: "学習・演習ツール",
    km: "ឧបករណ៍សិក្សា",
  },
  "footer.colContact": {
    vi: "KẾT NỐI VỚI CHÚNG TÔI",
    en: "CONNECT WITH US",
    zh: "联系与支持",
    ja: "お問い合わせ",
    km: "ភ្ជាប់ទំនាក់ទំនងជាមួយយើង",
  },
  "footer.support": {
    vi: "Hỗ trợ kỹ thuật: 24/7",
    en: "Technical Support: 24/7",
    zh: "技术支持：全天候 24/7",
    ja: "テクニカルサポート：24/7",
    km: "ជំនួយបច្ចេកទេស៖ ២៤/៧",
  },
  "footer.loginPortal": {
    vi: "Đăng nhập hệ thống học viên",
    en: "Sign In to Student Portal",
    zh: "登录学员系统",
    ja: "受講生ポータルにログイン",
    km: "ចូលទៅកាន់ប្រព័ន្ធសិស្ស",
  },
  "footer.rights": {
    vi: "© 2026 Teacher Dong Academy. Mọi quyền được bảo lưu.",
    en: "© 2026 Teacher Dong Academy. All rights reserved.",
    zh: "© 2026 董老师英语学院 版权所有。",
    ja: "© 2026 ドンスクール英語アカデミー All rights reserved.",
    km: "© 2026 Teacher Dong Academy. រក្សាសិទ្ធិគ្រប់យ៉ាង។",
  },

  // Common Buttons & Roles
  btn_login: {
    vi: "Đăng nhập",
    en: "Sign In",
    zh: "登录",
    ja: "ログイン",
    km: "ចូលប្រើប្រាស់",
  },
  btn_register: {
    vi: "Đăng ký học viên",
    en: "Register",
    zh: "注册学员",
    ja: "受講生登録",
    km: "ចុះឈ្មោះសិស្ស",
  },
  btn_logout: {
    vi: "Đăng xuất",
    en: "Sign Out",
    zh: "退出登录",
    ja: "ログアウト",
    km: "ចាកចេញ",
  },
  btn_consult: {
    vi: "Đăng ký tư vấn 1-1",
    en: "1-on-1 Consultation",
    zh: "1对1咨询预约",
    ja: "個別相談の予約",
    km: "ចុះឈ្មោះប្រឹក្សា ១-១",
  },
  btn_submit: {
    vi: "Xác nhận & Gửi",
    en: "Submit",
    zh: "提交",
    ja: "送信",
    km: "បញ្ជាក់ & ផ្ញើ",
  },
  btn_cancel: {
    vi: "Hủy bỏ",
    en: "Cancel",
    zh: "取消",
    ja: "キャンセル",
    km: "បោះបង់",
  },
  role_student: {
    vi: "Học viên",
    en: "Student",
    zh: "学员",
    ja: "受講生",
    km: "សិស្ស",
  },
  role_admin: {
    vi: "Quản trị viên / Giảng viên",
    en: "Admin / Teacher",
    zh: "管理员 / 讲师",
    ja: "管理者 / 講師",
    km: "អ្នកគ្រប់គ្រង / គ្រូបង្រៀន",
  },

  // Admin Writing Prompts & Review
  "admin.writing_prompts.title": {
    vi: "Ngân Hàng Đề Thi IELTS Writing",
    en: "IELTS Writing Prompt Bank",
    zh: "雅思写作题库管理",
    ja: "IELTSライティング問題バンク",
    km: "ធនាគារប្រធានវិញ្ញាសា IELTS Writing",
  },
  "admin.writing_prompts.subtitle": {
    vi: "Quản lý, biên soạn đề bài Task 1 & Task 2, cài đặt thời gian và số từ tối thiểu",
    en: "Manage and compile Task 1 & Task 2 prompts, configure time limits and minimum word counts",
    zh: "管理和编写 Task 1 和 Task 2 题目，设置考试时限及最少字数要求",
    ja: "Task 1およびTask 2の問題を管理・作成し、制限時間と最小語数を設定します",
    km: "គ្រប់គ្រង និងរៀបចំប្រធានបទ Task 1 & Task 2 កំណត់ពេល និងចំនួនពាក្យអប្បបរមា",
  },
  "admin.writing_prompts.btn_new": {
    vi: "Thêm đề bài mới",
    en: "Add New Prompt",
    zh: "添加新题目",
    ja: "新しい問題を追加",
    km: "បន្ថែមប្រធានបទថ្មី",
  },
  "admin.writing_prompts.search": {
    vi: "Tìm kiếm đề bài theo tiêu đề hoặc mô tả...",
    en: "Search prompts by title or description...",
    zh: "按标题或描述搜索题目...",
    ja: "タイトルまたは説明で問題を検索...",
    km: "ស្វែងរកប្រធានបទតាមចំណងជើង ឬការពិពណ៌នា...",
  },

  // Admin Speaking Prompts
  "admin.speaking_prompts.title": {
    vi: "Ngân Hàng Đề Thi IELTS Speaking",
    en: "IELTS Speaking Prompt Bank",
    zh: "雅思口语题库管理",
    ja: "IELTSスピーキング問題バンク",
    km: "ធនាគារប្រធានវិញ្ញាសា IELTS Speaking",
  },
  "admin.speaking_prompts.subtitle": {
    vi: "Quản lý chủ đề luyện nói Part 1, Part 2 & Part 3, cấu hình thời lượng ghi âm",
    en: "Manage speaking topics for Part 1, Part 2 & Part 3, configure recording durations",
    zh: "管理 Part 1、Part 2 和 Part 3 口语主题，配置录音时长",
    ja: "Part 1、Part 2、Part 3のスピーキングトピックを管理し、録音時間を設定します",
    km: "គ្រប់គ្រងប្រធានបទហាត់និយាយ Part 1, Part 2 & Part 3 កំណត់ថិរវេលាថតសំឡេង",
  },
  "admin.speaking_prompts.btn_new": {
    vi: "Thêm chủ đề nói mới",
    en: "Add New Speaking Topic",
    zh: "添加新口语主题",
    ja: "新しいスピーキングトピックを追加",
    km: "បន្ថែមប្រធានបទនិយាយថ្មី",
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("vi");

  useEffect(() => {
    // Check saved cookie or localStorage
    const saved = localStorage.getItem("preferred_lang") as Language;
    if (saved && ["vi", "en", "zh", "ja", "km"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_lang", newLang);
      document.cookie = `preferred_lang=${newLang}; path=/; max-age=31536000`;
      const token = localStorage.getItem("access_token");
      if (token && !token.startsWith("demo_")) {
        api
          .put("/auth/language", { language: newLang.toUpperCase() })
          .catch(() => {});
      }
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    if (translations[key] && translations[key]["vi"]) {
      return translations[key]["vi"];
    }
    return fallback || key;
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
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
