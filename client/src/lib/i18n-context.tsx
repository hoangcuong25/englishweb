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
    vi: 'Academy • Learn. Grow. Share. Inspire.',
    en: 'Academy • Learn. Grow. Share. Inspire.',
    zh: '学院 • 学习 • 成长 • 分享 • 启发',
    ja: 'アカデミー • 学び • 成長 • 共有 • 刺激',
  },
  'nav.programs': {
    vi: '5 Trụ cột chương trình',
    en: '5 Core Pillars',
    zh: '5大核心课程',
    ja: '5つの主要プログラム',
  },
  'nav.about': {
    vi: 'Về Teacher Dong',
    en: 'About Teacher Dong',
    zh: '关于董老师',
    ja: 'ドンスクールについて',
  },
  'nav.techPreview': {
    vi: 'Học thử WebRTC & AI',
    en: 'Try WebRTC & AI',
    zh: '体验 WebRTC 与 AI',
    ja: 'WebRTC＆AIを体験',
  },
  'nav.consultation': {
    vi: 'Liên hệ tư vấn',
    en: 'Consultation',
    zh: '咨询预约',
    ja: '無料相談',
  },
  'nav.login': {
    vi: 'Đăng nhập',
    en: 'Sign In',
    zh: '登录',
    ja: 'ログイン',
  },
  'nav.register': {
    vi: 'Đăng ký học viên',
    en: 'Register',
    zh: '注册学员',
    ja: '受講生登録',
  },
  'nav.loginAccount': {
    vi: 'Đăng nhập tài khoản',
    en: 'Sign In to Account',
    zh: '登录账号',
    ja: 'アカウントにログイン',
  },
  'nav.registerStudent': {
    vi: 'Đăng ký học viên mới',
    en: 'Enroll as New Student',
    zh: '注册新学员',
    ja: '新規受講生登録',
  },
  'nav.logout': {
    vi: 'Đăng xuất',
    en: 'Sign Out',
    zh: '退出登录',
    ja: 'ログアウト',
  },

  // Student & Admin Sidebar Navigation
  nav_dashboard: {
    vi: 'Tổng quan học tập',
    en: 'Dashboard Overview',
    zh: '学习总览',
    ja: 'ダッシュボード',
  },
  nav_courses: {
    vi: 'Khóa học của tôi',
    en: 'My Courses',
    zh: '我的课程',
    ja: 'マイコース',
  },
  nav_library: {
    vi: 'Học liệu số & Bảo mật',
    en: 'Digital Library',
    zh: '数字图书馆',
    ja: 'デジタル資料館',
  },
  nav_classroom: {
    vi: 'Phòng học trực tuyến',
    en: 'LiveKit Classroom',
    zh: '在线互动教室',
    ja: 'オンライン教室',
  },
  nav_writing: {
    vi: 'Luyện viết IELTS AI',
    en: 'AI Writing Studio',
    zh: '雅思AI写作工坊',
    ja: 'AIライティング演習',
  },
  nav_speaking: {
    vi: 'Studio luyện nói IELTS',
    en: 'Speaking Studio',
    zh: '雅思口语录音室',
    ja: 'スピーキング録音室',
  },
  nav_quiz: {
    vi: 'Ngân hàng bài tập Quiz',
    en: 'Quizzes & Exercises',
    zh: '测验与随堂练习',
    ja: 'クイズ・演習問題',
  },
  nav_attendance: {
    vi: 'Điểm danh & Chuyên cần',
    en: 'Attendance & Progress',
    zh: '出勤与出勤记录',
    ja: '出席・出欠管理',
  },
  nav_messages: {
    vi: 'Tin nhắn & Thảo luận',
    en: 'Messages & Chat',
    zh: '消息与实时沟通',
    ja: 'メッセージ・連絡',
  },
  nav_account: {
    vi: 'Tài khoản cá nhân',
    en: 'Personal Account',
    zh: '个人账户设置',
    ja: 'アカウント設定',
  },
  nav_users: {
    vi: 'Quản lý học viên',
    en: 'Users Management',
    zh: '学员与用户管理',
    ja: '受講生・ユーザー管理',
  },
  nav_admin_dashboard: {
    vi: 'Tổng quan quản trị',
    en: 'Admin Dashboard',
    zh: '管理后台总览',
    ja: '管理者ダッシュボード',
  },
  nav_admin_courses: {
    vi: 'Quản lý Đào tạo',
    en: 'Courses Management',
    zh: '课程与教学管理',
    ja: '講座・カリキュラム管理',
  },
  nav_admin_library: {
    vi: 'Học liệu số & Bảo mật',
    en: 'Secured Library',
    zh: '数字资料与安全',
    ja: '資料ライブラリ管理',
  },
  nav_admin_classroom: {
    vi: 'Lên lịch WebRTC',
    en: 'WebRTC Classrooms',
    zh: '实时课堂排课',
    ja: 'WebRTC教室スケジュール',
  },
  nav_writing_review: {
    vi: 'Duyệt bài Writing AI',
    en: 'AI Writing Review',
    zh: '审核AI写作评分',
    ja: 'AIライティング採点承認',
  },
  nav_speaking_grading: {
    vi: 'Chấm bài Speaking',
    en: 'Speaking Assessment',
    zh: '口语评分与批注',
    ja: 'スピーキング評価・採点',
  },
  nav_admin_quizzes: {
    vi: 'Ngân hàng đề & Quiz',
    en: 'Quiz Bank & Tests',
    zh: '题库与在线测验',
    ja: '問題バンク・小テスト',
  },
  nav_admin_attendance: {
    vi: 'Báo cáo Điểm danh',
    en: 'Attendance Reports',
    zh: '出勤考勤报表',
    ja: '出席レポート出力',
  },
  nav_system_settings: {
    vi: 'Cài đặt hệ thống',
    en: 'System Settings',
    zh: '系统设置',
    ja: 'システム設定',
  },

  // Announcement Bar
  'announcement.text': {
    vi: '✨ Khám phá phòng học trực tuyến LiveKit WebRTC & Trợ lý chấm IELTS Writing AI độc quyền tại Teacher Dong Academy!',
    en: '✨ Explore exclusive LiveKit WebRTC interactive classrooms & AI IELTS Writing evaluation at Teacher Dong Academy!',
    zh: '✨ 探索董老师学院专属 LiveKit WebRTC 实时教室与雅思写作 AI 智能批改系统！',
    ja: '✨ ドンスクール専任講師によるLiveKit WebRTCリアル教室とAI IELTSライティング添削を体験！',
  },

  // Hero Section
  'home.badge': {
    vi: 'Learn. Grow. Share. Inspire.',
    en: 'Learn. Grow. Share. Inspire.',
    zh: '学习 • 成长 • 分享 • 启发',
    ja: '学び • 成長 • 共有 • 刺激',
  },
  'home.heroTitle': {
    vi: 'Học tiếng Anh để tự tin bước xa hơn',
    en: 'Learn English to Step Further with Confidence',
    zh: '学习英语，自信迈向更远未来',
    ja: '英語を学び、自信を持ってさらなる一歩へ',
  },
  'home.heroTitleHighlight': {
    vi: 'tự tin',
    en: 'Confidence',
    zh: '自信',
    ja: '自信',
  },
  'home.heroSubtitle': {
    vi: 'Teacher Dong Academy đồng hành cùng học sinh, sinh viên và người đi làm trên hành trình học ngoại ngữ, nâng tầm chuyên môn và phát triển bản thân với nền tảng LMS và phòng học WebRTC LiveKit độc quyền.',
    en: 'Teacher Dong Academy accompanies students, graduates, and professionals to master English, elevate pedagogical expertise, and grow life skills through modern LMS and exclusive WebRTC classrooms.',
    zh: '董老师英语学院致力于陪伴每一位学员提升英语能力、教学素养与生活技能，提供专属的 LMS 和 LiveKit 实时互动课堂。',
    ja: 'ドンスクール英語アカデミーは、専用LMSとLiveKitリアルタイム教室を通じて、受講生の英語力向上と自己成長を力強く支援します。',
  },
  'home.exploreBtn': {
    vi: 'Khám phá 5 Chương trình trọng tâm',
    en: 'Explore 5 Core Programs',
    zh: '探索 5 大核心课程',
    ja: '5つの主要プログラムを見る',
  },
  'home.registerBtn': {
    vi: 'Đăng ký học viên mới',
    en: 'Enroll as New Student',
    zh: '注册新学员',
    ja: '新規受講生登録',
  },
  'home.demoBtn': {
    vi: 'Trải nghiệm phòng học thử',
    en: 'Experience Trial Classroom',
    zh: '体验试听教室',
    ja: '体験教室に参加',
  },

  // 4 Core Values
  'values.learn.title': {
    vi: 'Learn',
    en: 'Learn',
    zh: '学习 (Learn)',
    ja: '学ぶ (Learn)',
  },
  'values.learn.desc': {
    vi: 'Học có phương pháp, lộ trình bài bản & mục tiêu rõ ràng.',
    en: 'Methodical learning with structured roadmaps & clear milestones.',
    zh: '科学的学习方法、系统的规划与清晰的目标。',
    ja: '体系的な学習法と明確な目標設定。',
  },
  'values.grow.title': {
    vi: 'Grow',
    en: 'Grow',
    zh: '成长 (Grow)',
    ja: '成長 (Grow)',
  },
  'values.grow.desc': {
    vi: 'Phát triển năng lực ngôn ngữ, tư duy & sự tự tin.',
    en: 'Grow linguistic proficiency, critical mindset & confidence.',
    zh: '提升语言技能、思维方式与自信心。',
    ja: '語学力、思考力、自信の育成。',
  },
  'values.share.title': {
    vi: 'Share',
    en: 'Share',
    zh: '分享 (Share)',
    ja: '共有 (Share)',
  },
  'values.share.desc': {
    vi: 'Chia sẻ tri thức, bài học kinh nghiệm quốc tế quý báu.',
    en: 'Share knowledge, pedagogical lessons & international experience.',
    zh: '分享宝贵国际经验、教育教学体会与学问。',
    ja: '貴重な国際経験と知見の共有。',
  },
  'values.inspire.title': {
    vi: 'Inspire',
    en: 'Inspire',
    zh: '启发 (Inspire)',
    ja: '刺激 (Inspire)',
  },
  'values.inspire.desc': {
    vi: 'Thắp sáng niềm đam mê học tập suốt đời và vươn ra thế giới.',
    en: 'Ignite passion for lifelong learning and global reach.',
    zh: '点燃终身学习与走向世界的热情。',
    ja: '生涯学習への情熱を灯し世界へ。',
  },

  // 5 Pillars Section
  'pillars.headingBadge': {
    vi: 'CHƯƠNG TRÌNH ĐÀO TẠO CHÍNH THỨC',
    en: 'OFFICIAL CURRICULUM',
    zh: '官方培养体系',
    ja: '公式トレーニングプログラム',
  },
  'pillars.title': {
    vi: '5 Trụ Cột Đào Tạo Trọng Tâm — Teacher Dong Academy',
    en: '5 Core Training Pillars — Teacher Dong Academy',
    zh: '5大核心教学支柱 — 董老师学院',
    ja: '5つの主要教育柱 — ドンスクールアカデミー',
  },
  'pillars.subtitle': {
    vi: 'Hệ sinh thái đào tạo toàn diện được thiết kế chuyên biệt, đáp ứng nhu cầu phát triển năng lực ngôn ngữ, chuyên môn sư phạm và kỹ năng sống cho mọi thế hệ người học.',
    en: 'A comprehensive training ecosystem tailored to fulfill language proficiency, modern pedagogical mastery, and 21st-century life skills for every learner.',
    zh: '量身定制的全方位教学体系，满足各年龄段学习者在语言提升、教学专业和生活技能方面的需求。',
    ja: '語学力、指導法、21世紀型スキルを網羅した包括的な総合教育エコシステム。',
  },
  'pillars.filter.all': {
    vi: 'Tất cả (5 Trụ Cột)',
    en: 'All (5 Pillars)',
    zh: '全部 (5大支柱)',
    ja: 'すべて (5つの柱)',
  },
  'pillars.filter.p1': {
    vi: '1. English Proficiency',
    en: '1. English Proficiency',
    zh: '1. 英语能力',
    ja: '1. 英語運用能力',
  },
  'pillars.filter.p2': {
    vi: '2. Professional Development',
    en: '2. Professional Development',
    zh: '2. 专业发展',
    ja: '2. 指導者専門開発',
  },
  'pillars.filter.p3': {
    vi: '3. Life Skills',
    en: '3. Life Skills',
    zh: '3. 生活技能',
    ja: '3. ライフスキル',
  },
  'pillars.filter.p4': {
    vi: '4. Life Experiences',
    en: '4. Life Experiences',
    zh: '4. 人生阅历',
    ja: '4. 人生経験',
  },
  'pillars.filter.p5': {
    vi: '5. Travel & Culture',
    en: '5. Travel & Culture',
    zh: '5. 旅行文化',
    ja: '5. 旅と文化',
  },
  'pillars.detailBtn': {
    vi: 'Xem chi tiết & Đăng ký tư vấn',
    en: 'View Details & Consult',
    zh: '查看详情与咨询',
    ja: '詳細を見る・相談予約',
  },

  // Tech Preview Section
  'tech.badge': {
    vi: 'TRẢI NGHIỆM TƯƠNG TÁC MIỄN PHÍ',
    en: 'FREE INTERACTIVE TRIAL',
    zh: '免费互动体验',
    ja: '無料インタラクティブ体験',
  },
  'tech.title': {
    vi: 'Công Nghệ Giảng Dạy Đột Phá — Trải Nghiệm Thử Ngay',
    en: 'Breakthrough EdTech — Experience It Now',
    zh: '突破性教育科技 — 立即体验',
    ja: '革新的な教育技術 — 今すぐ体験',
  },
  'tech.subtitle': {
    vi: 'Teacher Dong Academy tích hợp công nghệ LiveKit SFU WebRTC độ trễ < 150ms và Trí tuệ nhân tạo AI. Bạn có thể bấm trải nghiệm thử từng tính năng ngay dưới đây:',
    en: 'Integrating LiveKit SFU WebRTC latency < 150ms and AI intelligence. Test out each cutting-edge feature directly below:',
    zh: '集成低延迟（<150ms）LiveKit SFU WebRTC 实时音视频及 AI 智能。立即体验各项功能：',
    ja: '遅延150ms未満のLiveKit SFU WebRTCとAI技術を統合。以下の各機能を直接お試しいただけます：',
  },
  'tech.livekit.title': {
    vi: 'Lớp Học LiveKit SFU',
    en: 'LiveKit SFU Classroom',
    zh: 'LiveKit SFU 互动教室',
    ja: 'LiveKit SFU リアルタイム教室',
  },
  'tech.livekit.desc': {
    vi: '1 Host + 7 Students, tương tác âm thanh & hình ảnh HD, bảng trắng trực tiếp thời gian thực.',
    en: '1 Host + 7 Students, HD audio/video interaction, live interactive canvas whiteboard.',
    zh: '1位教师 + 7位学员，高清音视频互动，实时协作电子白板。',
    ja: '講師1名＋受講生7名、HDオーディオ＆ビデオ通話、リアルタイムホワイトボード。',
  },
  'tech.livekit.btn': {
    vi: 'Thử phòng học WebRTC',
    en: 'Try WebRTC Classroom',
    zh: '体验 WebRTC 教室',
    ja: 'WebRTC教室を試す',
  },
  'tech.writing.title': {
    vi: 'AI Writing 4 Tiêu Chí',
    en: 'AI Writing 4 Criteria',
    zh: 'AI 写作 4 项标准评估',
    ja: 'AI ライティング 4基準採点',
  },
  'tech.writing.desc': {
    vi: 'Phân tích bài viết IELTS Task 1 & 2 tức thì, chấm điểm TR, CC, LR, GRA và gợi ý từ vựng C1/C2.',
    en: 'Instant evaluation for IELTS Task 1 & 2, scoring TR, CC, LR, GRA with C1/C2 vocabulary suggestions.',
    zh: '即时分析雅思 Task 1 和 Task 2 作文，评分 TR、CC、LR、GRA 并推荐 C1/C2 高分词汇。',
    ja: 'IELTS Task 1 & 2を即座に分析、4基準（TR, CC, LR, GRA）で採点しC1/C2表現を提案。',
  },
  'tech.writing.btn': {
    vi: 'Thử chấm bài Writing AI',
    en: 'Try AI Writing Grader',
    zh: '体验 AI 写作批改',
    ja: 'AIライティングを試す',
  },
  'tech.speaking.title': {
    vi: 'Speaking Studio',
    en: 'Speaking Studio',
    zh: '口语录音工作室',
    ja: 'スピーキング録音スタジオ',
  },
  'tech.speaking.desc': {
    vi: 'Phòng thu âm Web Audio trực tiếp trên trình duyệt, sóng âm trực quan và ghim nhận xét theo mốc thời gian.',
    en: 'In-browser Web Audio recorder with live waveform visualization and timestamped feedback.',
    zh: '网页原生 Web Audio 录音室，实时声波显示与按时间戳精确定位评语。',
    ja: 'Web Audio APIによるブラウザ録音、リアルタイム波形表示とタイムスタンプ添削。',
  },
  'tech.speaking.btn': {
    vi: 'Thử phòng thu âm',
    en: 'Try Audio Studio',
    zh: '体验口语录音室',
    ja: '録音スタジオを試す',
  },
  'tech.library.title': {
    vi: 'Bảo Mật Học Liệu Số',
    en: 'Digital Library Security',
    zh: '数字资料安全保护',
    ja: 'デジタル教材セキュリティ',
  },
  'tech.library.desc': {
    vi: 'Dynamic Watermark chuyển động chống quay lén, token ký số 15 phút và bảo vệ tài liệu tuyệt đối.',
    en: 'Dynamic floating watermarks with student info, 15-minute signed URLs, preventing screen recording.',
    zh: '动态漂移水印防录屏，15分钟防盗链签名 URL，严密保护数字版权。',
    ja: '動的ウォーターマークによる録画防止、15分限定署名付きURLによる厳格な著作権保護。',
  },
  'tech.library.btn': {
    vi: 'Xem tài liệu bảo mật',
    en: 'View Secured Materials',
    zh: '查看安全资料',
    ja: '安全な教材を閲覧',
  },

  // About Teacher Dong
  'about.badge': {
    vi: 'LỜI NGỎ TỪ GIẢNG VIÊN',
    en: 'A WORD FROM TEACHER DONG',
    zh: '主讲导师寄语',
    ja: '専任講師からのメッセージ',
  },
  'about.role': {
    vi: 'FOUNDER & MASTER INSTRUCTOR',
    en: 'FOUNDER & MASTER INSTRUCTOR',
    zh: '创始人兼主讲导师',
    ja: '創立者・主任講師',
  },
  'about.degree': {
    vi: 'Thạc sĩ Sư phạm • 10+ Năm Giảng dạy Quốc tế',
    en: 'Master of Education • 10+ Years International Teaching',
    zh: '教育学硕士 • 10年以上国际教学经验',
    ja: '教育学修士 • 10年以上の国際教育指導実績',
  },
  'about.quote': {
    vi: '"Học tiếng Anh để tự tin bước ra thế giới, chia sẻ để lan tỏa giá trị bền vững"',
    en: '"Learn English to step out into the world, share to spread lasting values"',
    zh: '“学英语以自信走向世界，乐分享以传递恒久价值”',
    ja: '「世界へ羽ばたく自信のために英語を学び、価値を分かち合う」',
  },
  'about.bio': {
    vi: 'Chào bạn! Tôi thành lập Teacher Dong Academy với mong muốn tạo nên một không gian học tập thực sự khác biệt: nơi học viên không phải học vẹt hay sợ hãi khi nói sai, mà được khích lệ tư duy phản biện, làm chủ công nghệ hiện đại và mở rộng tầm nhìn toàn cầu.',
    en: 'Welcome! I founded Teacher Dong Academy to build an authentic learning atmosphere where students do not cram or fear making mistakes, but are empowered to think critically, master cutting-edge technology, and broaden their global perspective.',
    zh: '你好！创立董老师英语学院的初衷，是打造一个真正与众不同的学习空间：在这里无需死记硬背，无需害怕犯错，而是鼓励批判性思维，拥抱现代科技，拓宽全球化视野。',
    ja: 'ようこそ！間違いを恐れたり丸暗記することなく、受講生が批判的思考力を磨き、最新技術を使いこなし、世界へ視野を広げられる学びの場を提供します。',
  },
  'about.stat1.title': { vi: '100% Tận tâm', en: '100% Dedicated', zh: '100% 用心辅导', ja: '100% 専任指導' },
  'about.stat1.desc': { vi: 'Trực tiếp theo sát & chấm bài học viên', en: 'Personally grading and coaching each student', zh: '导师亲自批改作业与跟踪指导', ja: '全受講生の課題を直接添削指導' },
  'about.stat2.title': { vi: 'Lớp Tối Đa 7 Học Viên', en: 'Max 7 Students / Class', zh: '精品小班 (最多7人)', ja: '少人数制（最大7名）' },
  'about.stat2.desc': { vi: 'Tương tác sâu, phản hồi tức thì', en: 'High interaction & immediate feedback', zh: '深度互动与实时答疑反馈', ja: '密度の高い対話と即時フィードバック' },
  'about.stat3.title': { vi: 'EdTech Tiên Phong', en: 'EdTech Pioneer', zh: '前沿教育科技', ja: '先端EdTech環境' },
  'about.stat3.desc': { vi: 'WebRTC SFU & Trợ lý Writing AI', en: 'WebRTC SFU & AI Writing Assistant', zh: 'WebRTC SFU 与 AI 写作辅导', ja: 'WebRTC SFUとAIライティング支援' },
  'about.ctaJoin': {
    vi: 'Đăng ký tham gia lớp học cùng Teacher Dong',
    en: 'Join Teacher Dong’s Class',
    zh: '报名加入董老师的课程',
    ja: 'ドンスクールのクラスに参加する',
  },
  'about.ctaConsult': {
    vi: 'Đặt lịch tư vấn 1:1 miễn phí',
    en: 'Book Free 1-on-1 Consultation',
    zh: '预约 1对1 免费咨询',
    ja: '無料1対1相談を予約する',
  },

  // Consultation Form
  'consult.badge': {
    vi: 'TƯ VẤN LỘ TRÌNH HỌC TẬP',
    en: 'LEARNING ROADMAP CONSULTATION',
    zh: '个性化学习规划咨询',
    ja: '学習ロードマップ無料相談',
  },
  'consult.title': {
    vi: 'Nhận Tư Vấn Lộ Trình & Đăng Ký Kiểm Tra Đầu Vào',
    en: 'Get Roadmap Consultation & Free Placement Test',
    zh: '获取学习规划咨询与免费入学水平测试',
    ja: '学習ロードマップ相談＆無料レベル診断',
  },
  'consult.subtitle': {
    vi: 'Để lại thông tin bên cạnh, Teacher Dong Academy sẽ liên hệ trực tiếp với bạn trong vòng 24 giờ để đánh giá trình độ và xây dựng lộ trình học tập cá nhân hóa hoàn toàn miễn phí.',
    en: 'Leave your details and Teacher Dong Academy will contact you within 24 hours to assess your English level and tailor your learning roadmap completely free.',
    zh: '填写右侧信息，董老师学院将在24小时内联系您，为您进行水平评估并量身定制专属学习规划，全程免费。',
    ja: 'フォームよりご連絡ください。24時間以内にレベルチェックを行い、あなた専用の学習ロードマップを無料で作成します。',
  },
  'consult.benefit1': {
    vi: 'Miễn phí kiểm tra 4 kỹ năng (Listening, Speaking, Reading, Writing)',
    en: 'Free 4-skill assessment (Listening, Speaking, Reading, Writing)',
    zh: '免费 4 项技能诊断（听、说、读、写）',
    ja: '4技能（リスニング、スピーキング、リーディング、ライティング）の無料診断',
  },
  'consult.benefit2': {
    vi: 'Tư vấn trực tiếp 1:1 phù hợp theo 5 Trụ cột chương trình',
    en: 'Direct 1-on-1 consultation tailored to the 5 Core Pillars',
    zh: '基于 5 大核心课程的 1对1 深度规划',
    ja: '5つの主要教育柱に基づく個別相談',
  },
  'consult.benefit3': {
    vi: 'Tặng 1 buổi học thử lớp trực tuyến LiveKit WebRTC tương tác',
    en: 'Complimentary trial session in our interactive LiveKit classroom',
    zh: '免费赠送 1 节 LiveKit 实时在线体验课',
    ja: 'LiveKitリアルタイム教室での無料体験授業を1回プレゼント',
  },
  'consult.formTitle': {
    vi: 'Thông tin đăng ký tư vấn',
    en: 'Consultation Request Form',
    zh: '咨询预约表单',
    ja: '相談お申し込みフォーム',
  },
  'consult.nameLabel': { vi: 'Họ và tên của bạn: *', en: 'Full Name: *', zh: '您的姓名：*', ja: 'お名前：*' },
  'consult.emailLabel': { vi: 'Địa chỉ Email: *', en: 'Email Address: *', zh: '电子邮箱：*', ja: 'メールアドレス：*' },
  'consult.phoneLabel': { vi: 'Số điện thoại: *', en: 'Phone Number: *', zh: '联系电话：*', ja: 'お電話番号：*' },
  'consult.programLabel': { vi: 'Chương trình đào tạo quan tâm: *', en: 'Interested Program: *', zh: '感兴趣的课程领域：*', ja: 'ご希望のプログラム：*' },
  'consult.programSelectPlaceholder': { vi: '-- Chọn 1 trong 5 Trụ Cột Đào Tạo --', en: '-- Select 1 of 5 Core Pillars --', zh: '-- 选择 5 大核心支柱之一 --', ja: '-- 5つの柱から選択してください --' },
  'consult.opt1': {
    vi: '1. English Proficiency (IELTS, Business, Giao tiếp, Thiếu nhi)',
    en: '1. English Proficiency (IELTS, Business, Conversational, Kids)',
    zh: '1. 英语能力 (雅思、商务、日常口语、少儿英语)',
    ja: '1. 英語運用能力 (IELTS、ビジネス、日常会話、キッズ)',
  },
  'consult.opt2': {
    vi: '2. Professional Development (Sư phạm AI, Lãnh đạo, Nghiên cứu)',
    en: '2. Professional Development (AI Pedagogy, Leadership, Research)',
    zh: '2. 教师专业发展 (AI教育应用、领导力、学术研究)',
    ja: '2. 指導者専門開発 (AI教育、リーダーシップ、研究)',
  },
  'consult.opt3': {
    vi: '3. Life Skills & Personal Growth (Tư duy phản biện, Thuyết trình)',
    en: '3. Life Skills & Personal Growth (Critical Thinking, Public Speaking)',
    zh: '3. 生活技能与成长 (批判性思维、公众演讲、时间管理)',
    ja: '3. ライフスキル＆自己成長 (クリティカルシンキング、スピーチ)',
  },
  'consult.opt4': {
    vi: '4. Life Experiences & Inspiration (Tọa đàm, Kinh nghiệm quốc tế)',
    en: '4. Life Experiences & Inspiration (Talkshows, Overseas Experience)',
    zh: '4. 人生阅历与启发 (励志讲座、海外教学纪实)',
    ja: '4. 人生経験とインスピレーション (対談、海外経験談)',
  },
  'consult.opt5': {
    vi: '5. Travel & Culture Blog (Văn hóa, Khám phá Châu Á)',
    en: '5. Travel & Culture Blog (Cultural Awareness, Discovering Asia)',
    zh: '5. 旅行文化专栏 (跨文化理解、探索亚洲、语言人文)',
    ja: '5. 旅と文化ブログ (異文化理解、アジア探訪、言語と人間)',
  },
  'consult.notesLabel': { vi: 'Mục tiêu hoặc câu hỏi của bạn:', en: 'Your Goals or Questions:', zh: '学习目标或咨询问题：', ja: '学習目標またはご質問：' },
  'consult.notesPlaceholder': { vi: 'Ví dụ: Em cần đạt IELTS 7.0 trong 6 tháng tới...', en: 'e.g., I aim for IELTS 7.0 in the next 6 months...', zh: '例如：希望在未来6个月内考到雅思7.0分...', ja: '例：半年以内にIELTS 7.0の取得を目指しています...' },
  'consult.submitBtn': {
    vi: 'Gửi thông tin đăng ký tư vấn',
    en: 'Submit Consultation Request',
    zh: '提交咨询申请',
    ja: '無料相談を申し込む',
  },
  'consult.successMsg': {
    vi: '🎉 Cảm ơn bạn! Thông tin đã được gửi. Teacher Dong sẽ liên hệ với bạn trong vòng 24 giờ.',
    en: '🎉 Thank you! Your request is submitted. Teacher Dong will contact you within 24 hours.',
    zh: '🎉 感谢您的提交！董老师将在24小时内与您取得联系。',
    ja: '🎉 お申し込みありがとうございます。24時間以内にご連絡いたします。',
  },

  // Modal Detail
  'modal.objective': {
    vi: 'Mục tiêu & Nội dung trọng tâm:',
    en: 'Objectives & Core Focus:',
    zh: '目标与核心内容：',
    ja: '目標と主な内容：',
  },
  'modal.target': {
    vi: 'Đối tượng học viên:',
    en: 'Target Audience:',
    zh: '适合对象：',
    ja: '対象受講生：',
  },
  'modal.format': {
    vi: 'Hình thức đào tạo:',
    en: 'Learning Format:',
    zh: '授课模式：',
    ja: '受講形態：',
  },
  'modal.close': {
    vi: 'Đóng',
    en: 'Close',
    zh: '关闭',
    ja: '閉じる',
  },
  'modal.enroll': {
    vi: 'Đăng ký tư vấn khóa học này',
    en: 'Consult for This Course',
    zh: '预约该课程咨询',
    ja: 'この講座を相談予約する',
  },

  // Footer
  'footer.desc': {
    vi: 'Nền tảng đào tạo tiếng Anh học thuật & phát triển năng lực toàn diện. Tiên phong ứng dụng WebRTC SFU và Trí tuệ nhân tạo AI trong giảng dạy trực tuyến.',
    en: 'Academic English and holistic capability development platform. Pioneering WebRTC SFU classrooms and AI intelligence in modern education.',
    zh: '学术英语与综合素养培训平台，前沿运用 WebRTC SFU 实时音视频与人工智能赋能在线教学。',
    ja: 'アカデミック英語と総合的能力開発プラットフォーム。WebRTC SFUリアルタイム教室とAI技術を融合した最先端の教育環境。',
  },
  'footer.colPrograms': { vi: '5 TRỤ CỘT ĐÀO TẠO', en: '5 CORE PILLARS', zh: '5大核心课程', ja: '5つの主要教育柱' },
  'footer.colTech': { vi: 'HỆ SINH THÁI EDTECH', en: 'EDTECH ECOSYSTEM', zh: '教育科技生态', ja: 'EDTECHエコシステム' },
  'footer.colContact': { vi: 'KẾT NỐI VỚI CHÚNG TÔI', en: 'CONNECT WITH US', zh: '联系与支持', ja: 'お問い合わせ' },
  'footer.support': {
    vi: 'Hỗ trợ kỹ thuật: 24/7',
    en: 'Technical Support: 24/7',
    zh: '技术支持：全天候 24/7',
    ja: 'テクニカルサポート：24/7',
  },
  'footer.loginPortal': {
    vi: 'Đăng nhập hệ thống học viên',
    en: 'Sign In to Student Portal',
    zh: '登录学员系统',
    ja: '受講生ポータルにログイン',
  },
  'footer.rights': {
    vi: '© 2026 Teacher Dong Academy. Mọi quyền được bảo lưu.',
    en: '© 2026 Teacher Dong Academy. All rights reserved.',
    zh: '© 2026 董老师英语学院 版权所有。',
    ja: '© 2026 ドンスクール英語アカデミー All rights reserved.',
  },

  // Common Buttons & Roles
  btn_login: { vi: 'Đăng nhập', en: 'Sign In', zh: '登录', ja: 'ログイン' },
  btn_register: { vi: 'Đăng ký học viên', en: 'Register', zh: '注册学员', ja: '受講生登録' },
  btn_logout: { vi: 'Đăng xuất', en: 'Sign Out', zh: '退出登录', ja: 'ログアウト' },
  btn_consult: { vi: 'Đăng ký tư vấn 1-1', en: '1-on-1 Consultation', zh: '1对1咨询预约', ja: '個別相談の予約' },
  btn_submit: { vi: 'Xác nhận & Gửi', en: 'Submit', zh: '提交', ja: '送信' },
  btn_cancel: { vi: 'Hủy bỏ', en: 'Cancel', zh: '取消', ja: 'キャンセル' },
  role_student: { vi: 'Học viên', en: 'Student', zh: '学员', ja: '受講生' },
  role_admin: { vi: 'Quản trị viên / Giảng viên', en: 'Admin / Teacher', zh: '管理员 / 讲师', ja: '管理者 / 講師' },
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
