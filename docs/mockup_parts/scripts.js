module.exports = `
<script>
/* ==========================================================
   Teacher Dong Academy — Complete Interactive Test Mockup
   Application JavaScript & State Management
   Includes Public Home (Guest), Student & Admin Modes
   ========================================================== */

(function() {
  "use strict";

  // --- 1. Global State ---
  const state = {
    mode: "GUEST",   // 'GUEST' (Trang Home) | 'STUDENT' | 'ADMIN'
    role: "STUDENT", // 'STUDENT' | 'ADMIN'
    lang: "vi",      // 'vi' | 'en' | 'zh' | 'ja'
    activeTab: "home",
    tokenSeconds: 899,
    tokenTimerId: null,
    isRecording: false,
    recordSeconds: 0,
    recordTimerId: null,
    audioAnimId: null,
    myMicOn: true,
    myCamOn: true,
    handRaised: false,
    isScreenSharing: false,
    googleLinked: true,
    courseProgress: 68,
    selectedCategoryForEnroll: "",
    wb: {
      tool: "pen",
      color: "#2868B2",
      size: 4,
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      syncCount: 42
    },
    speakingScores: {
      fc: 7.5,
      lr: 7.0,
      gra: 7.5,
      pr: 7.0
    },
    activeMockTest: 1,
    quizSubmitted: false,
    quizScore: 0,
    quizBand: "",
    quizTimerSeconds: 585,
    quizTimerRunning: true,
    quizTimerId: null
  };

  // --- 2. i18n Translations Dictionary (4 Ngôn ngữ: VI, EN, ZH, JA) ---
  const i18n = {
    vi: {
      // Tester Bar
      "tester.badge": "KIỂM THỬ TRẢI NGHIỆM",
      "tester.viewingAs": "Đang xem ở trạng thái:",
      "tester.modeGuest": "🌐 Khách mới chưa có tài khoản (Trang Home)",
      "tester.modeStudent": "🎓 Học viên đã đăng nhập (Nguyễn Văn An)",
      "tester.modeAdmin": "👨‍🏫 Giảng viên / Quản trị viên (Teacher Dong)",
      "tester.btnGuest": "🌐 1. Khách mới (Trang Home)",
      "tester.btnStudent": "🎓 2. Học viên đã đăng nhập",
      "tester.btnAdmin": "👨‍🏫 3. Giảng viên / Admin",

      // Navigation Header
      "nav.programs": "5 Trụ cột chương trình",
      "nav.about": "Về Teacher Dong",
      "nav.techPreview": "Học thử WebRTC & AI",
      "nav.consultation": "Liên hệ tư vấn",
      "nav.login": "Đăng nhập",
      "nav.register": "Đăng ký học viên",
      "nav.logout": "Đăng xuất",

      // Module Navigation Tabs
      "nav.home": "🏠 Trang chủ (Home)",
      "nav.dashboard": "1. Tổng quan Dashboard",
      "nav.lms": "2. Khóa học LMS",
      "nav.library": "3. Học liệu số & Watermark",
      "nav.classroom": "4. Lớp học WebRTC & Whiteboard",
      "nav.writing": "5. Chấm IELTS Writing AI",
      "nav.speaking": "6. IELTS Speaking Studio",
      "nav.quiz": "7. Thi thử Mock Test & Quiz",
      "nav.attendance": "8. Điểm danh tự động & Excel",
      "nav.chat": "9. Nhắn tin trực tuyến",

      // Home Page Sections
      "home.heroTitle": "Học tiếng Anh để <span style='color:var(--primary); position:relative;'>tự tin<span style='position:absolute; left:0; right:0; bottom:4px; height:12px; background:var(--accent); opacity:.4; border-radius:6px; z-index:-1;'></span></span> bước xa hơn",
      "home.heroSubtitle": "Teacher Dong Academy đồng hành cùng học sinh, sinh viên và người đi làm trên hành trình học ngoại ngữ, nâng tầm chuyên môn và phát triển bản thân với nền tảng LMS và phòng học WebRTC LiveKit độc quyền.",
      "home.exploreBtn": "Khám phá 5 Chương trình trọng tâm",
      "home.registerBtn": "Đăng ký học viên mới",
      "home.demoBtn": "Trải nghiệm phòng học thử",
      "home.pillarsTitle": "5 Trụ Cột Đào Tạo Trọng Tâm — Teacher Dong Academy",
      "home.pillarsSubtitle": "Hệ sinh thái đào tạo toàn diện được thiết kế chuyên biệt, đáp ứng nhu cầu phát triển năng lực ngôn ngữ, chuyên môn sư phạm và kỹ năng sống cho mọi thế hệ người học.",
      "home.techTitle": "Công Nghệ Giảng Dạy Đột Phá — Trải Nghiệm Thử Ngay",
      "home.techSubtitle": "Teacher Dong Academy tích hợp công nghệ LiveKit SFU WebRTC độ trễ &lt; 150ms và Trí tuệ nhân tạo AI. Bạn có thể bấm thử nghiệm trực tiếp từng tính năng ngay dưới đây:",
      "home.consultTitle": "Nhận Tư Vấn Lộ Trình & Đăng Ký Kiểm Tra Đầu Vào",
      "home.consultSubtitle": "Để lại thông tin bên cạnh, Teacher Dong Academy sẽ liên hệ trực tiếp với bạn trong vòng 24 giờ để đánh giá trình độ và xây dựng lộ trình học tập cá nhân hóa hoàn toàn miễn phí.",
      "home.submitConsultBtn": "Gửi thông tin đăng ký tư vấn",

      // Dashboard
      "dash.liveClassTitle": "IELTS Speaking & Discussion — Room #101",
      "dash.liveClassDesc": "Giảng viên Host: <strong>Teacher Dong</strong> • Sĩ số: 7/8 học viên đã vào phòng",
      "dash.joinNow": "Vào phòng học ngay (1 chạm)",
      "dash.coursesEnrolled": "Khóa học đang học",
      "dash.hoursLearned": "Tổng giờ học tích lũy",
      "dash.currentBand": "Điểm IELTS ước tính",
      "dash.quizzesPassed": "Quiz đã vượt qua",
      "dash.continueLearning": "Khóa học đang tiếp tục",
      "dash.tasksAndFeedback": "Nhiệm vụ & Phản hồi giảng viên",

      // Other Modules Titles
      "lms.catalogTitle": "Chương trình đào tạo & Khóa học",
      "lms.catalogSubtitle": "Lộ trình học chuẩn quốc tế: IELTS, Business English, Tiếng Anh trẻ em và Năng lực sư phạm AI.",
      "lib.title": "Kho học liệu số bảo mật (Content Protection)",
      "lib.subtitle": "Bảo vệ tài liệu PDF và Audio bằng Dynamic Watermark, Signed Token 15 phút và chặn tải file gốc.",
      "webrtc.title": "Phòng học WebRTC LiveKit & Bảng trắng tương tác",
      "webrtc.subtitle": "Hệ thống SFU in-house đáp ứng 1 Host + 7 Học viên, độ trễ &lt; 150ms. Tích hợp bảng vẽ collaborative thời gian thực.",
      "writing.title": "Luyện viết & Chấm điểm IELTS Writing bằng AI",
      "writing.subtitle": "Đánh giá chuyên sâu 4 tiêu chí chuẩn IELTS: TR, CC, LR, GRA kèm gợi ý từ vựng C1/C2.",
      "speaking.title": "IELTS Speaking Studio (Phòng thu âm & Chấm điểm)",
      "speaking.subtitle": "Thu âm câu trả lời trực tiếp trong trình duyệt. Teacher Dong chấm điểm chi tiết theo 4 tiêu chí và ghim nhận xét theo mốc thời gian.",
      "att.title": "Điểm danh tự động qua LiveKit Webhook & Báo cáo Excel",
      "att.subtitle": "Tự động tính phút học thực tế từ sự kiện kết nối/ngắt kết nối SFU. Phân loại PRESENT, LATE, ABSENT.",
      "chat.title": "Nhắn tin trực tuyến (Live Chat Socket.IO)",
      "chat.subtitle": "Kênh trao đổi riêng tư giữa học viên và Teacher Dong. Hỗ trợ thông báo thời gian thực và lưu trữ lịch sử hội thoại.",

      // MOCK TEST & QUIZ ENGINE (TOÀN DIỆN 4 NGÔN NGỮ)
      "quiz.engineTag": "EdTech In-house Testing Suite",
      "quiz.title": "Hệ thống bài thi thử & Trắc nghiệm (Mock Test & Quiz Engine)",
      "quiz.subtitle": "Hỗ trợ 4 ngôn ngữ (Anh, Trung, Việt, Nhật), mô phỏng kỳ thi IELTS & Business English chuẩn quốc tế. Chấm điểm tức thì, giải thích chi tiết và tự động mở khóa bài học.",
      "quiz.langSelectLabel": "Ngôn ngữ bài thi:",
      "quiz.timeLeftLabel": "Thời gian còn:",
      "quiz.timerPause": "Tạm dừng",
      "quiz.timerResume": "Tiếp tục",
      "quiz.timerReset": "Đặt lại",

      // Tabs
      "quiz.tab1": "📘 Mock Test 1: IELTS Reading & Từ vựng",
      "quiz.tab2": "🎧 Mock Test 2: IELTS Listening & Hội thoại",
      "quiz.tab3": "💼 Mock Test 3: Business English & Đàm phán",

      // Test 1 (Reading)
      "quiz.t1Badge": "IELTS ACADEMIC MOCK TEST #1",
      "quiz.t1Heading": "Reading Comprehension & Lexical Cohesion",
      "quiz.threshold": "3 CÂU HỎI • ĐẠT: &ge; 80%",
      "quiz.readingTitle": "Đoạn văn đọc hiểu (Reading Extract):",
      "quiz.readingTransToggle": "Bản dịch & Phân tích ngữ cảnh",
      "quiz.readingTransHeading": "📖 Bản dịch tham khảo ngữ cảnh:",
      "quiz.readingTransText": "« Khả năng nhận thức được gọi là trí nhớ làm việc (working memory) đóng vai trò then chốt trong việc tiếp thu ngôn ngữ. Các nghiên cứu chẩn đoán hình ảnh thần kinh gần đây làm sáng tỏ rằng những cá nhân có dung lượng trí nhớ làm việc cao thể hiện khả năng nhận thức ngữ pháp vượt trội và ghi nhớ từ vựng nâng cao khi chịu áp lực nhận thức. »",
      "quiz.vocabLabel": "Từ vựng học thuật C1:",

      "quiz.q1Prompt": "(Chọn một đáp án) Theo đoạn trích, vai trò của trí nhớ làm việc (working memory) là gì?",
      "quiz.q1OptA": "A. Thay thế hoàn toàn cơ chế lưu trữ dài hạn trong não bộ",
      "quiz.q1OptB": "B. Đóng vai trò then chốt trong việc tiếp thu ngôn ngữ và nhận thức ngữ pháp",
      "quiz.q1OptC": "C. Gây cản trở khả năng truy xuất từ vựng trong điều kiện căng thẳng",

      "quiz.q2Prompt": "(Chọn 2 đáp án) Hai đặc điểm nào sau đây gắn liền với người có dung lượng trí nhớ làm việc cao?",
      "quiz.q2OptA": "A. Khả năng nhận thức ngữ pháp vượt trội",
      "quiz.q2OptB": "B. Triệt tiêu hoàn toàn sự can thiệp từ tiếng mẹ đẻ",
      "quiz.q2OptC": "C. Khả năng gợi nhớ từ vựng nâng cao khi chịu áp lực nhận thức",

      "quiz.q3Prompt": "(Điền từ khuyết) Điền từ chính xác từ đoạn trích vào chỗ trống:",
      "quiz.q3Prefix": "« Recent neuroimaging investigations elucidate that individuals demonstrate superior ",
      "quiz.q3Suffix": " discernment. »",
      "quiz.q3Placeholder": "Nhập từ chính xác...",
      "quiz.q3Hint": "Gợi ý: Tính từ bắt đầu bằng chữ 'g...' (nghĩa: grammatical)",

      // Test 2 (Listening)
      "quiz.t2Badge": "IELTS LISTENING MOCK TEST #2",
      "quiz.t2Heading": "Academic Lecture: Renewable Microgrids & Energy Transition",
      "quiz.t2AudioTitle": "Trình phát audio hội thoại bài nghe:",
      "quiz.t2AudioTrack": "Lecture 04: Microgrid Decentralization.mp3",
      "quiz.t2TranscriptExcerpt": "<em>Tóm tắt đoạn nghe: Giáo sư Smith nhấn mạnh việc tích hợp năng lượng mặt trời cục bộ đòi hỏi giải pháp lưu trữ pin (battery storage) để giải quyết tính không liên tục của phụ tải.</em>",
      "quiz.t2q1Prompt": "(Chọn một) Theo bài giảng, thách thức lớn nhất của năng lượng tái tạo phân tán là gì?",
      "quiz.t2q1OptA": "A. Tính bất ổn định và thiếu khả năng lưu trữ liên tục (intermittency)",
      "quiz.t2q1OptB": "B. Chi phí bảo trì đường dây tải điện cao áp",
      "quiz.t2q2Prompt": "(Chọn 2 đáp án) Hai giải pháp công nghệ nào được Giáo sư khuyến nghị?",
      "quiz.t2q2OptA": "A. Hệ thống pin lưu trữ phân tán (Battery Energy Storage)",
      "quiz.t2q2OptB": "B. Thuật toán điều phối phụ tải thông minh theo thời gian thực",
      "quiz.t2q3Prompt": "(Điền từ khuyết) Điền thuật ngữ tiếng Anh thích hợp:",
      "quiz.t2q3Prefix": "« The decentralized grid heavily relies on ",
      "quiz.t2q3Suffix": " storage solutions to stabilize peak loads. »",
      "quiz.t2q3Hint": "Gợi ý: Từ bắt đầu bằng 'b...' (nghĩa: battery)",

      // Test 3 (Business English)
      "quiz.t3Badge": "BUSINESS ENGLISH MOCK TEST #3",
      "quiz.t3Heading": "Service Level Agreement (SLA) & Contract Governance",
      "quiz.t3ContractTitle": "Điều khoản hợp đồng SLA quốc tế mẫu:",
      "quiz.t3q1Prompt": "(Chọn một) Theo điều khoản 8.4, chế tài bồi thường được áp dụng là gì?",
      "quiz.t3q1OptA": "A. Hoàn trả tín dụng dịch vụ 10% (10% service credit)",
      "quiz.t3q1OptB": "B. Hủy bỏ ngay lập tức toàn bộ hợp đồng mà không báo trước",
      "quiz.t3q2Prompt": "(Chọn 2 đáp án) Hai yếu tố pháp lý bắt buộc trong điều khoản tranh chấp là gì?",
      "quiz.t3q2OptA": "A. Trọng tài có giá trị ràng buộc (Binding arbitration)",
      "quiz.t3q2OptB": "B. Địa điểm phân xử tài phán tại Singapore",
      "quiz.t3q3Prompt": "(Điền từ khuyết) Điền từ pháp lý thích hợp:",
      "quiz.t3q3Prefix": "« All disputes shall be settled via binding ",
      "quiz.t3q3Suffix": " administered in Singapore. »",
      "quiz.t3q3Hint": "Gợi ý: Từ bắt đầu bằng 'a...' (nghĩa: arbitration)",

      // Action Buttons & Evaluation Panel
      "quiz.submitBtn": "Nộp bài & Chấm điểm tự động",
      "quiz.resetBtn": "Làm lại bài thi",
      "quiz.resultCardTitle": "Kết quả đánh giá tức thì",
      "quiz.badgePending": "CHỜ NỘP BÀI",
      "quiz.badgePass": "ĐẠT TIÊU CHUẨN",
      "quiz.badgeFail": "CHƯA ĐẠT",
      "quiz.bandPending": "IELTS Band: Chưa chấm • CEFR: --",
      "quiz.initialVerdictTitle": "Vui lòng hoàn thành các câu hỏi bên trái",
      "quiz.initialVerdictDesc": "Hệ thống yêu cầu &ge; 80% để mở khóa bài học kế tiếp.",
      "quiz.passVerdictTitle": "XUẤT SẮC! BẠN ĐÃ VƯỢT QUA BÀI MOCK TEST",
      "quiz.passVerdictDesc": "Bạn đã đủ điều kiện để mở khóa và học tiếp bài học tiếp theo.",
      "quiz.failVerdictTitle": "CHƯA ĐỦ ĐIỂM ĐẠT (Yêu cầu &ge; 80%)",
      "quiz.failVerdictDesc": "Vui lòng đọc lại bài khóa và làm lại câu hỏi chưa chính xác.",
      "quiz.congratsTitle": "CHÚC MỪNG! BẠN ĐÃ ĐẠT TIÊU CHUẨN",
      "quiz.unlockDesc": "Bài học tiếp theo <strong>'Unit 5: Complex Argumentation in IELTS Writing'</strong> đã được tự động mở khóa.",
      "quiz.nextLessonBtn": "Chuyển tới bài học mới",
      "quiz.explanationTitle": "Giải thích chi tiết đáp án:",
      "quiz.expQ1Label": "Câu 1:",
      "quiz.expQ2Label": "Câu 2:",
      "quiz.expQ3Label": "Câu 3:",
      "quiz.expQ1": "Đáp án B đúng trực tiếp từ câu: <em>'working memory plays a pivotal role in language assimilation'</em>.",
      "quiz.expQ2": "Phương án A và C đúng: <em>'demonstrate superior grammatical discernment and enhanced lexical recall'</em>.",
      "quiz.expQ3": "Từ cần điền là <code>grammatical</code> (tính từ đứng trước danh từ discernment).",
      "quiz.strategyTitle": "💡 Chiến thuật làm bài IELTS từ Teacher Dong:",
      "quiz.strategyDesc": "Đối với dạng bài điền từ khuyết (Summary Completion), hãy luôn xác định loại từ cần điền (danh/tính/động/trạng) và tìm các từ đồng nghĩa (synonyms) trong bài khóa."
    },

    en: {
      // Tester Bar
      "tester.badge": "EXPERIENCE TESTER",
      "tester.viewingAs": "Viewing mode:",
      "tester.modeGuest": "🌐 Guest Visitor (Home Page)",
      "tester.modeStudent": "🎓 Logged-in Student (Nguyễn Văn An)",
      "tester.modeAdmin": "👨‍🏫 Instructor / Admin (Teacher Dong)",
      "tester.btnGuest": "🌐 1. Guest (Home Page)",
      "tester.btnStudent": "🎓 2. Student Mode",
      "tester.btnAdmin": "👨‍🏫 3. Teacher / Admin",

      // Navigation Header
      "nav.programs": "5 Key Pillars",
      "nav.about": "About Teacher Dong",
      "nav.techPreview": "Try WebRTC & AI",
      "nav.consultation": "Admissions & Contact",
      "nav.login": "Log In",
      "nav.register": "Register as Student",
      "nav.logout": "Log Out",

      // Module Navigation Tabs
      "nav.home": "🏠 Home Page",
      "nav.dashboard": "1. Dashboard Overview",
      "nav.lms": "2. LMS & Courses",
      "nav.library": "3. Secure Library & Watermark",
      "nav.classroom": "4. WebRTC Classroom & Whiteboard",
      "nav.writing": "5. AI IELTS Writing Assessment",
      "nav.speaking": "6. IELTS Speaking Studio",
      "nav.quiz": "7. Mock Test & Quiz Suite",
      "nav.attendance": "8. Automated Attendance & Excel",
      "nav.chat": "9. Live Chat Messaging",

      // Home Page Sections
      "home.heroTitle": "Master English to <span style='color:var(--primary); position:relative;'>confidently<span style='position:absolute; left:0; right:0; bottom:4px; height:12px; background:var(--accent); opacity:.4; border-radius:6px; z-index:-1;'></span></span> go further",
      "home.heroSubtitle": "Teacher Dong Academy empowers students, graduates, and professionals with world-class English training, pedagogical excellence, and an exclusive LiveKit WebRTC interactive platform.",
      "home.exploreBtn": "Explore 5 Core Pillars",
      "home.registerBtn": "Enroll as New Student",
      "home.demoBtn": "Experience Demo Room",
      "home.pillarsTitle": "5 Educational Pillars — Teacher Dong Academy",
      "home.pillarsSubtitle": "A comprehensive pedagogical ecosystem tailored to cultivate English fluency, teaching methodologies, and essential life skills for global learners.",
      "home.techTitle": "Next-Gen EdTech — Try Interactive Tools Now",
      "home.techSubtitle": "Powered by ultra-low latency LiveKit SFU WebRTC (&lt;150ms) and AI evaluation models. Test each module live below:",
      "home.consultTitle": "Get Free Learning Roadmap & Diagnostic Test",
      "home.consultSubtitle": "Leave your contact details and Teacher Dong Academy will reach out within 24 hours to conduct a free 4-skills assessment and design your customized pathway.",
      "home.submitConsultBtn": "Request Personalized Consultation",

      // Dashboard
      "dash.liveClassTitle": "IELTS Speaking & Discussion — Room #101",
      "dash.liveClassDesc": "Host Instructor: <strong>Teacher Dong</strong> • Attendance: 7/8 students inside",
      "dash.joinNow": "Join Live Room Now (1-Click)",
      "dash.coursesEnrolled": "Enrolled Courses",
      "dash.hoursLearned": "Total Study Hours",
      "dash.currentBand": "Estimated IELTS Band",
      "dash.quizzesPassed": "Quizzes Passed",
      "dash.continueLearning": "Continue Learning",
      "dash.tasksAndFeedback": "Tasks & Instructor Feedback",

      // Other Modules Titles
      "lms.catalogTitle": "Training Programs & Courses",
      "lms.catalogSubtitle": "International curriculum: IELTS, Business English, Kids English, and Pedagogical AI.",
      "lib.title": "Secure Digital Library & Content Protection",
      "lib.subtitle": "Protecting PDF & Audio via Dynamic Watermarks, 15-minute Presigned Tokens, and anti-download shields.",
      "webrtc.title": "LiveKit WebRTC Classroom & Collaborative Whiteboard",
      "webrtc.subtitle": "In-house SFU hosting 1 Host + 7 Students with &lt;150ms latency. Includes real-time collaborative canvas.",
      "writing.title": "IELTS Writing Practice & AI Assessment",
      "writing.subtitle": "In-depth scoring on 4 IELTS criteria: TR, CC, LR, GRA with C1/C2 lexical upgrades.",
      "speaking.title": "IELTS Speaking Studio (Recording & Grading)",
      "speaking.subtitle": "Record responses in-browser. Teacher Dong provides 4-criteria scores and timestamped audio notes.",
      "att.title": "Automated Attendance via LiveKit Webhooks",
      "att.subtitle": "Calculates active classroom minutes from SFU events. Categorizes PRESENT, LATE, ABSENT.",
      "chat.title": "Live Chat & Real-Time Messaging",
      "chat.subtitle": "Private communication between students and Teacher Dong powered by Socket.IO.",

      // MOCK TEST & QUIZ ENGINE (ENGLISH)
      "quiz.engineTag": "EdTech In-house Testing Suite",
      "quiz.title": "Mock Test & Interactive Quiz Engine",
      "quiz.subtitle": "Supports 4 languages (EN, ZH, VI, JA), simulating international IELTS & Business English exams. Instant scoring, in-depth explanations, and automated lesson unlocking.",
      "quiz.langSelectLabel": "Exam Language:",
      "quiz.timeLeftLabel": "Time Left:",
      "quiz.timerPause": "Pause",
      "quiz.timerResume": "Resume",
      "quiz.timerReset": "Reset",

      // Tabs
      "quiz.tab1": "📘 Mock Test 1: IELTS Reading & Lexicon",
      "quiz.tab2": "🎧 Mock Test 2: IELTS Listening & Dialogue",
      "quiz.tab3": "💼 Mock Test 3: Business English & Negotiation",

      // Test 1 (Reading)
      "quiz.t1Badge": "IELTS ACADEMIC MOCK TEST #1",
      "quiz.t1Heading": "Reading Comprehension & Lexical Cohesion",
      "quiz.threshold": "3 QUESTIONS • PASS: &ge; 80%",
      "quiz.readingTitle": "Reading Passage Extract:",
      "quiz.readingTransToggle": "Bilingual Context & Translation",
      "quiz.readingTransHeading": "📖 Bilingual Reference & Context:",
      "quiz.readingTransText": "« The cognitive faculty known as working memory plays a pivotal role in language assimilation. Recent neuroimaging investigations elucidate that individuals with elevated working memory capacity demonstrate superior grammatical discernment and enhanced lexical recall under cognitive strain. »",
      "quiz.vocabLabel": "Key C1 Lexical Terms:",

      "quiz.q1Prompt": "(Single Choice) According to the passage, what is the role of working memory?",
      "quiz.q1OptA": "A. It completely replaces long-term storage mechanisms in the brain",
      "quiz.q1OptB": "B. It plays a pivotal role in language assimilation and grammatical discernment",
      "quiz.q1OptC": "C. It impairs lexical retrieval under stressful conditions",

      "quiz.q2Prompt": "(Multiple Choice) Which TWO features are associated with high working memory capacity?",
      "quiz.q2OptA": "A. Superior grammatical discernment",
      "quiz.q2OptB": "B. Total elimination of linguistic interference from the mother tongue",
      "quiz.q2OptC": "C. Enhanced lexical recall under cognitive strain",

      "quiz.q3Prompt": "(Fill in the Blank) Complete the sentence with the exact word from the text:",
      "quiz.q3Prefix": "« Recent neuroimaging investigations elucidate that individuals demonstrate superior ",
      "quiz.q3Suffix": " discernment. »",
      "quiz.q3Placeholder": "Enter exact word...",
      "quiz.q3Hint": "Hint: Adjective starting with 'g...' (meaning: grammatical)",

      // Test 2 (Listening)
      "quiz.t2Badge": "IELTS LISTENING MOCK TEST #2",
      "quiz.t2Heading": "Academic Lecture: Renewable Microgrids & Energy Transition",
      "quiz.t2AudioTitle": "Listening Lecture Audio Player:",
      "quiz.t2AudioTrack": "Lecture 04: Microgrid Decentralization.mp3",
      "quiz.t2TranscriptExcerpt": "<em>Lecture summary: Professor Smith highlights that integrating local solar requires battery storage solutions to address intermittency.</em>",
      "quiz.t2q1Prompt": "(Single Choice) According to the lecture, what is the core challenge of decentralized renewable energy?",
      "quiz.t2q1OptA": "A. Power generation intermittency and continuous storage deficiency",
      "quiz.t2q1OptB": "B. Maintenance costs of high-voltage transmission lines",
      "quiz.t2q2Prompt": "(Multiple Choice) Which TWO technological solutions did the Professor recommend?",
      "quiz.t2q2OptA": "A. Decentralized battery energy storage systems",
      "quiz.t2q2OptB": "B. Real-time smart load dispatching algorithms",
      "quiz.t2q3Prompt": "(Fill in the Blank) Fill in the missing technical term:",
      "quiz.t2q3Prefix": "« The decentralized grid heavily relies on ",
      "quiz.t2q3Suffix": " storage solutions to stabilize peak loads. »",
      "quiz.t2q3Hint": "Hint: Word begins with 'b...' (meaning: battery)",

      // Test 3 (Business English)
      "quiz.t3Badge": "BUSINESS ENGLISH MOCK TEST #3",
      "quiz.t3Heading": "Service Level Agreement (SLA) & Contract Governance",
      "quiz.t3ContractTitle": "Standard International SLA Clause Excerpt:",
      "quiz.t3q1Prompt": "(Single Choice) Under section 8.4, what remedy is issued for excessive downtime?",
      "quiz.t3q1OptA": "A. Issuance of a 10% service credit",
      "quiz.t3q1OptB": "B. Immediate contract termination without notice",
      "quiz.t3q2Prompt": "(Multiple Choice) Which TWO mandatory legal elements are specified in the dispute clause?",
      "quiz.t3q2OptA": "A. Legally binding arbitration",
      "quiz.t3q2OptB": "B. Arbitration administered in Singapore",
      "quiz.t3q3Prompt": "(Fill in the Blank) Fill in the required legal term:",
      "quiz.t3q3Prefix": "« All disputes shall be settled via binding ",
      "quiz.t3q3Suffix": " administered in Singapore. »",
      "quiz.t3q3Hint": "Hint: Word begins with 'a...' (meaning: arbitration)",

      // Action Buttons & Evaluation Panel
      "quiz.submitBtn": "Submit Test & Auto Grade",
      "quiz.resetBtn": "Retake / Reset Test",
      "quiz.resultCardTitle": "Instant Assessment Result",
      "quiz.badgePending": "PENDING SUBMISSION",
      "quiz.badgePass": "QUALIFIED / PASSED",
      "quiz.badgeFail": "NOT QUALIFIED",
      "quiz.bandPending": "IELTS Band: Pending • CEFR: --",
      "quiz.initialVerdictTitle": "Please complete the questions on the left",
      "quiz.initialVerdictDesc": "Requires &ge; 80% score to automatically unlock the next lesson.",
      "quiz.passVerdictTitle": "EXCELLENT! YOU PASSED THE MOCK TEST",
      "quiz.passVerdictDesc": "You have fulfilled all requirements to unlock the upcoming learning module.",
      "quiz.failVerdictTitle": "DID NOT PASS (Requires &ge; 80%)",
      "quiz.failVerdictDesc": "Please review the passage carefully and retake the incorrect questions.",
      "quiz.congratsTitle": "CONGRATULATIONS! YOU QUALIFIED",
      "quiz.unlockDesc": "Next lesson <strong>'Unit 5: Complex Argumentation in IELTS Writing'</strong> has been unlocked.",
      "quiz.nextLessonBtn": "Proceed to Next Lesson",
      "quiz.explanationTitle": "Detailed Answer Explanations:",
      "quiz.expQ1Label": "Question 1:",
      "quiz.expQ2Label": "Question 2:",
      "quiz.expQ3Label": "Question 3:",
      "quiz.expQ1": "Option B is directly confirmed by: <em>'working memory plays a pivotal role in language assimilation'</em>.",
      "quiz.expQ2": "Options A and C are correct: <em>'demonstrate superior grammatical discernment and enhanced lexical recall'</em>.",
      "quiz.expQ3": "The exact word is <code>grammatical</code> (adjective modifying discernment).",
      "quiz.strategyTitle": "💡 IELTS Test Strategy from Teacher Dong:",
      "quiz.strategyDesc": "For Summary Completion questions, always identify the required part of speech (noun/adj/verb/adv) and scan for contextual synonyms in the passage."
    },

    zh: {
      // Tester Bar
      "tester.badge": "体验与功能测试",
      "tester.viewingAs": "当前浏览身份:",
      "tester.modeGuest": "🌐 访客模式 (官网首页)",
      "tester.modeStudent": "🎓 已登录学员 (阮文安)",
      "tester.modeAdmin": "👨‍🏫 主讲教师 / 管理员 (Teacher Dong)",
      "tester.btnGuest": "🌐 1. 访客 (首页)",
      "tester.btnStudent": "🎓 2. 学员模式",
      "tester.btnAdmin": "👨‍🏫 3. 教师 / 管理员",

      // Navigation Header
      "nav.programs": "5大核心体系",
      "nav.about": "关于 Teacher Dong",
      "nav.techPreview": "体验 WebRTC 与 AI",
      "nav.consultation": "咨询与报名",
      "nav.login": "登录",
      "nav.register": "学员注册",
      "nav.logout": "退出登录",

      // Module Navigation Tabs
      "nav.home": "🏠 官网首页",
      "nav.dashboard": "1. 控制面板总览",
      "nav.lms": "2. 课程体系 (LMS)",
      "nav.library": "3. 安全数字学习资源库",
      "nav.classroom": "4. WebRTC 在线课堂与白板",
      "nav.writing": "5. AI 雅思写作批改",
      "nav.speaking": "6. 雅思口语录音室",
      "nav.quiz": "7. 全真模考与测验 (Mock Test)",
      "nav.attendance": "8. 自动考勤与 Excel 报表",
      "nav.chat": "9. 在线即时沟通",

      // Home Page Sections
      "home.heroTitle": "学好英语，以<span style='color:var(--primary); position:relative;'>自信<span style='position:absolute; left:0; right:0; bottom:4px; height:12px; background:var(--accent); opacity:.4; border-radius:6px; z-index:-1;'></span></span>走得更远",
      "home.heroSubtitle": "Teacher Dong 学院为学员打造全方位英语提升方案，结合自主研发 LMS 与专属 LiveKit WebRTC 超低延迟互动课堂，助力学术与职业双飞跃。",
      "home.exploreBtn": "探索 5 大核心课程支柱",
      "home.registerBtn": "注册成为新学员",
      "home.demoBtn": "体验在线互动课堂",
      "home.pillarsTitle": "5 大核心教学支柱 — Teacher Dong 学院",
      "home.pillarsSubtitle": "针对语言能力、职业发展、生活技能与跨文化视野量身打造的全方位教育生态系统。",
      "home.techTitle": "突破性教育科技 — 立即免费在线体验",
      "home.techSubtitle": "依托延迟低于 150ms 的 LiveKit SFU 架构与专业 AI 算法，欢迎直接点击体验各项功能：",
      "home.consultTitle": "获取免费学习规划与入学水平测试",
      "home.consultSubtitle": "在右侧留下您的联系方式，Teacher Dong 团队将在24小时内为您安排一对一水平诊断并定制专属学习方案。",
      "home.submitConsultBtn": "提交咨询申请",

      // Dashboard
      "dash.liveClassTitle": "雅思口语与讨论课堂 — 房间 #101",
      "dash.liveClassDesc": "主讲老师: <strong>Teacher Dong</strong> • 出勤: 7/8 位学员已进入",
      "dash.joinNow": "立即进入课堂 (一键加入)",
      "dash.coursesEnrolled": "正在学习课程",
      "dash.hoursLearned": "累计学习时长",
      "dash.currentBand": "雅思预估分数",
      "dash.quizzesPassed": "已通过测验",
      "dash.continueLearning": "继续学习",
      "dash.tasksAndFeedback": "待办任务与教师反馈",

      // Other Modules Titles
      "lms.catalogTitle": "培训体系与精品课程",
      "lms.catalogSubtitle": "国际标准课程: 雅思全阶, 商务英语, 少儿英语, 及 AI 教学赋能。",
      "lib.title": "安全加密数字资源库",
      "lib.subtitle": "通过动态水印、15分钟限时签名令牌及防下载技术保护教学资源。",
      "webrtc.title": "LiveKit WebRTC 实时音视频课堂与互动白板",
      "webrtc.subtitle": "自研 SFU 架构支持 1 位教师 + 7 位学员低延迟互动，内置多人协同电子白板。",
      "writing.title": "雅思写作训练与 AI 深度批改",
      "writing.subtitle": "基于雅思 4 项标准 (TR, CC, LR, GRA) 综合评分及 C1/C2 高级词汇升级。",
      "speaking.title": "雅思口语录音室与教师评分",
      "speaking.subtitle": "浏览器直接录音, Teacher Dong 亲自分段评分并精准标注时间轴反馈。",
      "att.title": "LiveKit 自动考勤与 Excel 导出",
      "att.subtitle": "根据 SFU 进出事件精准统计在课分钟, 自动划分出勤状态。",
      "chat.title": "在线实时聊天沟通",
      "chat.subtitle": "学员与 Teacher Dong 之间的加密实时互动沟通渠道。",

      // MOCK TEST & QUIZ ENGINE (CHINESE)
      "quiz.engineTag": "EdTech 自研全真测评套件",
      "quiz.title": "模考系统与智能测验引擎 (Mock Test & Quiz)",
      "quiz.subtitle": "支持4种语言（中、英、越、日），全真模拟国际雅思与商务英语考试。即时判分、深度解析并自动解锁进阶课程。",
      "quiz.langSelectLabel": "考试界面语言:",
      "quiz.timeLeftLabel": "剩余时间:",
      "quiz.timerPause": "暂停",
      "quiz.timerResume": "继续",
      "quiz.timerReset": "重置",

      // Tabs
      "quiz.tab1": "📘 模考 1: 雅思学术阅读与高阶词汇",
      "quiz.tab2": "🎧 模考 2: 雅思听力理解与场景对话",
      "quiz.tab3": "💼 模考 3: 商务英语沟通与商务谈判",

      // Test 1 (Reading)
      "quiz.t1Badge": "雅思学术类全真模考 #1",
      "quiz.t1Heading": "阅读理解与词汇衔接 (Reading & Lexical Cohesion)",
      "quiz.threshold": "3道题目 • 及格标准: &ge; 80%",
      "quiz.readingTitle": "阅读精读材料 (Reading Extract):",
      "quiz.readingTransToggle": "参考译文与上下文解析",
      "quiz.readingTransHeading": "📖 参考译文与语境对照:",
      "quiz.readingTransText": "« 被称为工作记忆（working memory）的认知能力在语言习得中起着举足轻重的作用。近期神经影像学研究表明，工作记忆容量较高的人群在承受认知压力时，能表现出卓越的语法辨析力与更强的词汇检索记忆能力。 »",
      "quiz.vocabLabel": "C1 核心学术词汇:",

      "quiz.q1Prompt": "(单选题) 根据短文内容，工作记忆（working memory）的核心作用是什么？",
      "quiz.q1OptA": "A. 它完全取代大脑的长期记忆存储机制",
      "quiz.q1OptB": "B. 在语言习得同化与语法结构辨析中起关键决定作用",
      "quiz.q1OptC": "C. 在压力条件下会严重妨碍词汇的提取与应用",

      "quiz.q2Prompt": "(多选题) 以下哪两项特征与具有较高工作记忆容量的人群直接相关？",
      "quiz.q2OptA": "A. 卓越的语法辨识与逻辑分析能力",
      "quiz.q2OptB": "B. 完全消除母语干扰与语言冲突",
      "quiz.q2OptC": "C. 在高认知负荷状态下依然具备更强的词汇回忆能力",

      "quiz.q3Prompt": "(填空题) 根据文章原词，将正确的单词填入空白处:",
      "quiz.q3Prefix": "« Recent neuroimaging investigations elucidate that individuals demonstrate superior ",
      "quiz.q3Suffix": " discernment. »",
      "quiz.q3Placeholder": "输入准确单词...",
      "quiz.q3Hint": "提示: 以字母 'g...' 开头的形容词 (意为'语法的': grammatical)",

      // Test 2 (Listening)
      "quiz.t2Badge": "雅思听力全真模考 #2",
      "quiz.t2Heading": "学术讲座: 可再生微电网与能源转型",
      "quiz.t2AudioTitle": "听力材料音频播放器:",
      "quiz.t2AudioTrack": "讲座 04: 微电网去中心化.mp3",
      "quiz.t2TranscriptExcerpt": "<em>听力摘要: 史密斯教授强调，整合局部太阳能必须依赖电池储能方案（battery storage）以解决负荷波动与间歇性。</em>",
      "quiz.t2q1Prompt": "(单选题) 根据讲座内容，分布式可再生能源的核心挑战是什么？",
      "quiz.t2q1OptA": "A. 发电的间歇性波动与储能不足 (intermittency)",
      "quiz.t2q1OptB": "B. 特高压输电线路的高昂维护费用",
      "quiz.t2q2Prompt": "(多选题) 教授推荐了哪两项关键技术解决方案？",
      "quiz.t2q2OptA": "A. 分布式电池储能系统 (Battery Energy Storage)",
      "quiz.t2q2OptB": "B. 实时智能负荷调度算法",
      "quiz.t2q3Prompt": "(填空题) 填入正确的英文专业术语:",
      "quiz.t2q3Prefix": "« The decentralized grid heavily relies on ",
      "quiz.t2q3Suffix": " storage solutions to stabilize peak loads. »",
      "quiz.t2q3Hint": "提示: 以字母 'b...' 开头的单词 (意为'电池': battery)",

      // Test 3 (Business English)
      "quiz.t3Badge": "商务英语全真模考 #3",
      "quiz.t3Heading": "服务级别协议 (SLA) 与涉外商务合同治理",
      "quiz.t3ContractTitle": "国际标准商务合同 SLA 核心条款摘录:",
      "quiz.t3q1Prompt": "(单选题) 根据第 8.4 条款，系统停机超标时适用的补偿方案是什么？",
      "quiz.t3q1OptA": "A. 提供 10% 服务积分抵扣 (10% service credit)",
      "quiz.t3q1OptB": "B. 无需预先通知即可直接单方面解约",
      "quiz.t3q2Prompt": "(多选题) 争议解决条款中明确约定的两项强制性法律要件是什么？",
      "quiz.t3q2OptA": "A. 具有法律约束力的仲裁 (Binding arbitration)",
      "quiz.t3q2OptB": "B. 仲裁由新加坡管辖裁决 (Singapore)",
      "quiz.t3q3Prompt": "(填空题) 填入正确的法律英文术语:",
      "quiz.t3q3Prefix": "« All disputes shall be settled via binding ",
      "quiz.t3q3Suffix": " administered in Singapore. »",
      "quiz.t3q3Hint": "提示: 以字母 'a...' 开头的单词 (意为'仲裁': arbitration)",

      // Action Buttons & Evaluation Panel
      "quiz.submitBtn": "提交答卷并立即评分",
      "quiz.resetBtn": "重新作答 / 重置",
      "quiz.resultCardTitle": "即时测评与判分报告",
      "quiz.badgePending": "等待交卷",
      "quiz.badgePass": "达到合格标准",
      "quiz.badgeFail": "未达到标准",
      "quiz.bandPending": "雅思预估分: 待测评 • CEFR: --",
      "quiz.initialVerdictTitle": "请先完成左侧所有考题",
      "quiz.initialVerdictDesc": "系统要求得分 &ge; 80% 即可自动解锁下一章节课程。",
      "quiz.passVerdictTitle": "成绩优异！您已成功通过本次模拟考试",
      "quiz.passVerdictDesc": "您已满足学习要求，下一核心课程模块已为您顺利开放。",
      "quiz.failVerdictTitle": "未达及格线 (要求得分 &ge; 80%)",
      "quiz.failVerdictDesc": "请仔细重读材料，并重新解答错误题目。",
      "quiz.congratsTitle": "祝贺！您已达到考核标准",
      "quiz.unlockDesc": "下一课程模块 <strong>'Unit 5: 雅思写作中的高级论证技巧'</strong> 已自动为您解锁。",
      "quiz.nextLessonBtn": "立即前往新课程",
      "quiz.explanationTitle": "试题深度答案解析:",
      "quiz.expQ1Label": "第1题:",
      "quiz.expQ2Label": "第2题:",
      "quiz.expQ3Label": "第3题:",
      "quiz.expQ1": "选项 B 正确，直接对应原文: <em>'working memory plays a pivotal role in language assimilation'</em>。",
      "quiz.expQ2": "选项 A 与 C 正确，对应原文: <em>'demonstrate superior grammatical discernment and enhanced lexical recall'</em>。",
      "quiz.expQ3": "正确填空词汇为 <code>grammatical</code> (修饰 discernment 的形容词)。",
      "quiz.strategyTitle": "💡 Teacher Dong 雅思应试名师点拨:",
      "quiz.strategyDesc": "针对摘要填空题（Summary Completion），务必预先判断所需词性（名词/形容词/动词/副词），并在原文中迅速定位同义置换表达（synonyms）。"
    },

    ja: {
      // Tester Bar
      "tester.badge": "機能体験テスト",
      "tester.viewingAs": "現在の表示モード:",
      "tester.modeGuest": "🌐 ゲスト訪問者 (ホームページ)",
      "tester.modeStudent": "🎓 ログイン中の受講生 (グエン・ヴァン・アン)",
      "tester.modeAdmin": "👨‍🏫 担当講師・管理者 (Teacher Dong)",
      "tester.btnGuest": "🌐 1. ゲスト (ホーム)",
      "tester.btnStudent": "🎓 2. 受講生モード",
      "tester.btnAdmin": "👨‍🏫 3. 講師・管理者",

      // Navigation Header
      "nav.programs": "5つの教育の柱",
      "nav.about": "Teacher Dong について",
      "nav.techPreview": "WebRTC・AI 無料体験",
      "nav.consultation": "受講相談・お問い合わせ",
      "nav.login": "ログイン",
      "nav.register": "生徒新規登録",
      "nav.logout": "ログアウト",

      // Module Navigation Tabs
      "nav.home": "🏠 ホーム",
      "nav.dashboard": "1. ダッシュボード概要",
      "nav.lms": "2. LMS コース管理",
      "nav.library": "3. セキュア教材ライブラリ",
      "nav.classroom": "4. WebRTC 教室・ホワイトボード",
      "nav.writing": "5. AI IELTS ライティング採点",
      "nav.speaking": "6. IELTS スピーキングスタジオ",
      "nav.quiz": "7. 模試・クイズ (Mock Test)",
      "nav.attendance": "8. 自動出席管理・Excel出力",
      "nav.chat": "9. リアルタイムチャット",

      // Home Page Sections
      "home.heroTitle": "英語を身につけ、<span style='color:var(--primary); position:relative;'>自信を持って<span style='position:absolute; left:0; right:0; bottom:4px; height:12px; background:var(--accent); opacity:.4; border-radius:6px; z-index:-1;'></span></span>世界へ踏み出そう",
      "home.heroSubtitle": "Teacher Dong Academy は、独自開発の LMS と WebRTC LiveKit 超低遅延オンライン教室を通じて、実践的な語学力・国際的な指導法・生きるスキルの成長を伴走します。",
      "home.exploreBtn": "5つの重点カリキュラムを見る",
      "home.registerBtn": "新規受講生として登録する",
      "home.demoBtn": "模擬レッスンを体験する",
      "home.pillarsTitle": "5 つの教育の柱 — Teacher Dong Academy",
      "home.pillarsSubtitle": "あらゆる学習者の言語運用能力、教育専門性、ライフスキルの向上を網羅する総合的なEdTech教育エコシステム。",
      "home.techTitle": "最先端 EdTech テクノロジー — 今すぐ無料体験",
      "home.techSubtitle": "遅延 150ms 未満の LiveKit SFU WebRTC と高精度 AI 採点エンジンを搭載。以下の機能をお気軽にお試しください：",
      "home.consultTitle": "個別学習ロードマップ＆無料診断テストのお申込み",
      "home.consultSubtitle": "必要情報をご入力いただければ、24時間以内に専門チームより最適な学習ロードマップをご案内いたします。",
      "home.submitConsultBtn": "無料カウンセリングを申し込む",

      // Dashboard
      "dash.liveClassTitle": "IELTS スピーキング＆ディスカッション — Room #101",
      "dash.liveClassDesc": "担当講師: <strong>Teacher Dong</strong> • 出席: 7/8 名入室中",
      "dash.joinNow": "今すぐ入室 (ワンクリック)",
      "dash.coursesEnrolled": "受講中コース",
      "dash.hoursLearned": "累計学習時間",
      "dash.currentBand": "想定 IELTS スコア",
      "dash.quizzesPassed": "合格クイズ数",
      "dash.continueLearning": "学習を再開する",
      "dash.tasksAndFeedback": "課題と講師フィードバック",

      // Other Modules Titles
      "lms.catalogTitle": "トレーニングプログラム・コース一覧",
      "lms.catalogSubtitle": "IELTS、ビジネス英語、子ども英語、指導者向け AI 応用。",
      "lib.title": "著作権保護セキュアライブラリ",
      "lib.subtitle": "動的透かし、15分期限付き署名トークン、ダウンロード防止機能。",
      "webrtc.title": "LiveKit WebRTC オンライン教室＆ホワイトボード",
      "webrtc.subtitle": "自社SFUによる1対7受講生グリッド、遅延150ms未満。リアルタイム双方向ホワイトボード完備。",
      "writing.title": "IELTS ライティング AI 診断",
      "writing.subtitle": "IELTS 4基準 (TR, CC, LR, GRA) に基づく高精度採点と C1/C2 語彙提案。",
      "speaking.title": "IELTS スピーキングスタジオ",
      "speaking.subtitle": "ブラウザ録音対応。Teacher Dong がタイムスタンプ付きで詳細講評。",
      "att.title": "LiveKit 出席自動集計・Excel出力",
      "att.subtitle": "SFU イベントから受講分数を自動集計。出席・遅刻・欠席を自動判定。",
      "chat.title": "リアルタイムチャット相談",
      "chat.subtitle": "生徒と Teacher Dong の双方向安全メッセージング。",

      // MOCK TEST & QUIZ ENGINE (JAPANESE)
      "quiz.engineTag": "EdTech 自社開発模試システム",
      "quiz.title": "模試・インタラクティブクイズエンジン (Mock Test)",
      "quiz.subtitle": "4言語（日・英・中・越）完全対応、IELTSおよびビジネス英語の国際標準模試を再現。即時自動採点、詳細解説、次章アンロックを完備。",
      "quiz.langSelectLabel": "試験表示言語:",
      "quiz.timeLeftLabel": "残り時間:",
      "quiz.timerPause": "一時停止",
      "quiz.timerResume": "再開",
      "quiz.timerReset": "リセット",

      // Tabs
      "quiz.tab1": "📘 模試 1: IELTS アカデミック読解・語彙",
      "quiz.tab2": "🎧 模試 2: IELTS リスニング・会話理解",
      "quiz.tab3": "💼 模試 3: ビジネス英語・国際交渉",

      // Test 1 (Reading)
      "quiz.t1Badge": "IELTS アカデミック本番模試 #1",
      "quiz.t1Heading": "読解問題と語彙の一致 (Reading & Lexical Cohesion)",
      "quiz.threshold": "3問 • 合格基準: &ge; 80%",
      "quiz.readingTitle": "読解抜粋テキスト (Reading Extract):",
      "quiz.readingTransToggle": "参考訳・文脈アナライザー",
      "quiz.readingTransHeading": "📖 参考訳と文脈の解説:",
      "quiz.readingTransText": "« ワーキングメモリ（作業記憶）として知られる認知機能は、言語の習得・内在化において極めて重要な役割を果たします。最新の脳神経画像研究により、作業記憶容量が大きい個人は認知的負荷の状況下でも優れた文法認識力と高い語彙想起力を発揮することが明らかになっています。 »",
      "quiz.vocabLabel": "C1 重要アカデミック語彙:",

      "quiz.q1Prompt": "(単一選択) 本文によると、作業記憶（working memory）の主な役割は何ですか？",
      "quiz.q1OptA": "A. 脳内の長期記憶メカニズムを完全に代替する",
      "quiz.q1OptB": "B. 言語の習得・内在化と文法認識において極めて重要な役割を果たす",
      "quiz.q1OptC": "C. ストレス下での語彙想起能力を阻害・低下させる",

      "quiz.q2Prompt": "(複数選択) 作業記憶容量が高い個人に関連付けられている2つの特徴はどれですか？",
      "quiz.q2OptA": "A. 優れた文法識別・分析能力",
      "quiz.q2OptB": "B. 母語による言語的干渉の完全な排除",
      "quiz.q2OptC": "C. 認知的負荷がかかる状況でも高い語彙想起力を維持・発揮する",

      "quiz.q3Prompt": "(穴埋め問題) 本文から正確な単語を抜き出して空欄を埋めてください:",
      "quiz.q3Prefix": "« Recent neuroimaging investigations elucidate that individuals demonstrate superior ",
      "quiz.q3Suffix": " discernment. »",
      "quiz.q3Placeholder": "正確な単語を入力...",
      "quiz.q3Hint": "ヒント: 'g...' で始まる形容詞 (文法に関する: grammatical)",

      // Test 2 (Listening)
      "quiz.t2Badge": "IELTS リスニング本番模試 #2",
      "quiz.t2Heading": "学術講義: 再生可能マイクログリッドとエネルギー転換",
      "quiz.t2AudioTitle": "リスニング音声プレイヤー:",
      "quiz.t2AudioTrack": "講義 04: マイクログリッド分散化.mp3",
      "quiz.t2TranscriptExcerpt": "<em>講義要約: スミス教授は、局所的な太陽光発電の統合には負荷の断続性を補う蓄電ソリューション（battery storage）が不可欠であると強調しています。</em>",
      "quiz.t2q1Prompt": "(単一選択) 講義によると、分散型再生可能エネルギーの最大の課題は何ですか？",
      "quiz.t2q1OptA": "A. 発電の断続性・不安定性と蓄電機能の不足 (intermittency)",
      "quiz.t2q1OptB": "B. 高圧送電線の維持管理コスト",
      "quiz.t2q2Prompt": "(複数選択) 教授が推奨した2つの技術的ソリューションはどれですか？",
      "quiz.t2q2OptA": "A. 分散型バッテリー蓄電システム (Battery Energy Storage)",
      "quiz.t2q2OptB": "B. リアルタイム・スマート負荷ディスパッチアルゴリズム",
      "quiz.t2q3Prompt": "(穴埋め問題) 適切な英単語を空欄に記入してください:",
      "quiz.t2q3Prefix": "« The decentralized grid heavily relies on ",
      "quiz.t2q3Suffix": " storage solutions to stabilize peak loads. »",
      "quiz.t2q3Hint": "ヒント: 'b...' で始まる単語 (バッテリー: battery)",

      // Test 3 (Business English)
      "quiz.t3Badge": "ビジネス英語本番模試 #3",
      "quiz.t3Heading": "サービス水準合意（SLA）と国際契約ガバナンス",
      "quiz.t3ContractTitle": "国際標準SLA契約条項抜粋:",
      "quiz.t3q1Prompt": "(単一選択) 第8.4項によると、ダウンタイム超過時に適用される補償は何ですか？",
      "quiz.t3q1OptA": "A. 10% のサービスクレジットの発行",
      "quiz.t3q1OptB": "B. 事前通知なしでの即時契約解除",
      "quiz.t3q2Prompt": "(複数選択) 紛争解決条項に規定されている2つの必須法的要件はどれですか？",
      "quiz.t3q2OptA": "A. 法的拘束力を持つ仲裁 (Binding arbitration)",
      "quiz.t3q2OptB": "B. シンガポールにおける仲裁手続きの実施",
      "quiz.t3q3Prompt": "(穴埋め問題) 適切な法的用語を記入してください:",
      "quiz.t3q3Prefix": "« All disputes shall be settled via binding ",
      "quiz.t3q3Suffix": " administered in Singapore. »",
      "quiz.t3q3Hint": "ヒント: 'a...' で始まる単語 (仲裁: arbitration)",

      // Action Buttons & Evaluation Panel
      "quiz.submitBtn": "答案を提出して自動採点",
      "quiz.resetBtn": "もう一度受験・リセット",
      "quiz.resultCardTitle": "即時判定・評価リザルト",
      "quiz.badgePending": "未提出",
      "quiz.badgePass": "合格水準達成",
      "quiz.badgeFail": "基準未達",
      "quiz.bandPending": "想定 IELTS: 未判定 • CEFR: --",
      "quiz.initialVerdictTitle": "左側の全問題に回答してください",
      "quiz.initialVerdictDesc": "次のレッスンをアンロックするには 80% 以上のスコアが必要です。",
      "quiz.passVerdictTitle": "おめでとうございます！模試に合格しました",
      "quiz.passVerdictDesc": "合格基準をクリアしました。次の学習モジュールが自動的にアンロックされました。",
      "quiz.failVerdictTitle": "不合格です（80%以上が必要です）",
      "quiz.failVerdictDesc": "解説と本文をよく確認し、間違えた問題を再挑戦してください。",
      "quiz.congratsTitle": "おめでとうございます！基準を達成しました",
      "quiz.unlockDesc": "次のレッスン <strong>'Unit 5: IELTSライティングにおける高度な論証法'</strong> がアンロックされました。",
      "quiz.nextLessonBtn": "新しいレッスンへ進む",
      "quiz.explanationTitle": "正解と詳細解説:",
      "quiz.expQ1Label": "第1問:",
      "quiz.expQ2Label": "第2問:",
      "quiz.expQ3Label": "第3問:",
      "quiz.expQ1": "選択肢 B が正解。本文の「<em>working memory plays a pivotal role in language assimilation</em>」に直接対応します。",
      "quiz.expQ2": "選択肢 A と C が正解。本文の「<em>demonstrate superior grammatical discernment and enhanced lexical recall</em>」に基づきます。",
      "quiz.expQ3": "正解単語は <code>grammatical</code>（discernment を修飾する形容詞）。",
      "quiz.strategyTitle": "💡 Teacher Dong からの受験アドバイス:",
      "quiz.strategyDesc": "要約穴埋め問題（Summary Completion）では、あらかじめ必要な品詞（名詞/形容詞/動詞/副詞）を特定し、本文中の同義表現（パラフレーズ）を正確に探すことが最大のポイントです。"
    }
  };\n\n  // --- 3. UI Helpers & Toast ---
  window.showToast = function(msg, type = "info") {
    const box = document.getElementById("toast-box");
    if (!box) return;
    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.innerHTML = \`<svg class="ic" style="width:18px; height:18px;"><use href="#i-\${type === 'danger' ? 'close' : type === 'warning' ? 'alert' : 'check'}"/></svg><span>\${msg}</span>\`;
    box.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all .3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // --- 4. APP MODE CONTROLLER (GUEST vs STUDENT vs ADMIN) ---
  window.setAppMode = function(mode) {
    state.mode = mode;

    // Update Tester Bar Buttons
    document.querySelectorAll(".tester-mode-btn").forEach(btn => btn.classList.remove("active"));
    const labelEl = document.getElementById("tester-current-mode-label");

    const guestNav = document.getElementById("guest-nav-links");
    const guestAuth = document.getElementById("guest-auth-buttons");
    const loggedControls = document.getElementById("logged-in-controls");
    const appModuleNav = document.getElementById("app-module-nav");

    if (mode === "GUEST") {
      document.getElementById("btn-mode-guest").classList.add("active");
      if (labelEl) labelEl.innerText = "🌐 Khách mới chưa có tài khoản (Trang Home)";
      
      guestNav.style.display = "flex";
      guestAuth.style.display = "flex";
      loggedControls.style.display = "none";
      appModuleNav.style.display = "none";

      switchTab("home");
      showToast("Đang ở giao diện Trang Home dành cho khách mới chưa đăng nhập.", "info");
    } else if (mode === "STUDENT") {
      document.getElementById("btn-mode-student").classList.add("active");
      if (labelEl) labelEl.innerText = "🎓 Học viên đã đăng nhập (Nguyễn Văn An)";
      
      state.role = "STUDENT";
      guestNav.style.display = "none";
      guestAuth.style.display = "none";
      loggedControls.style.display = "flex";
      appModuleNav.style.display = "block";

      applyRoleUI("STUDENT");
      switchTab("dashboard");
      showToast("Đã đăng nhập vai trò Học viên: Nguyễn Văn An (TD-STU-8821)", "success");
    } else if (mode === "ADMIN") {
      document.getElementById("btn-mode-admin").classList.add("active");
      if (labelEl) labelEl.innerText = "👨‍🏫 Giảng viên / Admin (Teacher Dong)";
      
      state.role = "ADMIN";
      guestNav.style.display = "none";
      guestAuth.style.display = "none";
      loggedControls.style.display = "flex";
      appModuleNav.style.display = "block";

      applyRoleUI("ADMIN");
      switchTab("dashboard");
      showToast("Đã đăng nhập vai trò Quản trị viên & Giảng viên: Teacher Dong", "success");
    }
  };

  function applyRoleUI(role) {
    const roleBox = document.getElementById("role-box");
    const nameEl = document.getElementById("user-display-name");
    const titleEl = document.getElementById("user-role-title");
    const btnLabel = document.getElementById("btn-role-label");
    const roleIcon = document.getElementById("role-icon");
    const avatarTile = document.getElementById("role-avatar-tile");

    if (role === "STUDENT") {
      roleBox.className = "role-badge-box role-student";
      nameEl.innerText = "Nguyễn Văn An";
      titleEl.innerText = "Học viên (STUDENT) — TD-STU-8821";
      btnLabel.innerText = "Đổi sang Admin";
      avatarTile.className = "tile t-blue";
      roleIcon.querySelector("use").setAttribute("href", "#i-users");
      document.getElementById("student-dashboard-view").style.display = "block";
      document.getElementById("admin-dashboard-view").style.display = "none";
      document.getElementById("student-lms-view").style.display = "block";
      document.getElementById("admin-lms-view").style.display = "none";
      document.getElementById("host-controls-pill").style.display = "none";
      document.getElementById("admin-writing-override-box").style.display = "none";
    } else {
      roleBox.className = "role-badge-box role-admin";
      nameEl.innerText = "Teacher Dong";
      titleEl.innerText = "Giảng viên & Admin (ADMIN)";
      btnLabel.innerText = "Đổi sang Học viên";
      avatarTile.className = "tile t-amber";
      roleIcon.querySelector("use").setAttribute("href", "#i-crown");
      document.getElementById("student-dashboard-view").style.display = "none";
      document.getElementById("admin-dashboard-view").style.display = "block";
      document.getElementById("student-lms-view").style.display = "none";
      document.getElementById("admin-lms-view").style.display = "block";
      document.getElementById("host-controls-pill").style.display = "inline-flex";
      document.getElementById("admin-writing-override-box").style.display = "block";
    }
  }

  window.toggleRole = function() {
    if (state.role === "STUDENT") {
      setAppMode("ADMIN");
    } else {
      setAppMode("STUDENT");
    }
  };

  window.logoutToGuest = function() {
    setAppMode("GUEST");
    showToast("Đã đăng xuất tài khoản. Quay về Trang Home công khai.", "info");
  };

  window.goToHome = function() {
    if (state.mode !== "GUEST") {
      switchTab("home");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- 5. Navigation & Tab Switcher ---
  window.switchTab = function(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === "tab-" + tabId);
      pane.style.display = pane.id === "tab-" + tabId ? "block" : "none";
    });

    if (tabId === "classroom") {
      setTimeout(initWhiteboard, 50);
    } else if (tabId === "library") {
      setTimeout(initWatermarkMovement, 50);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- 6. Smooth Scroll on Home ---
  window.scrollToPrograms = function() {
    if (state.activeTab !== "home") switchTab("home");
    setTimeout(() => {
      const el = document.getElementById("home-programs-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  window.scrollToAboutDong = function() {
    if (state.activeTab !== "home") switchTab("home");
    setTimeout(() => {
      const el = document.getElementById("about-teacher-dong");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  window.scrollToTech = function() {
    if (state.activeTab !== "home") switchTab("home");
    setTimeout(() => {
      const el = document.getElementById("tech-preview-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  window.scrollToContact = function() {
    if (state.activeTab !== "home") switchTab("home");
    setTimeout(() => {
      const el = document.getElementById("consultation-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // --- 7. Filter 5 Pillars on Home ---
  window.filterHomePillars = function(pillarKey, btn) {
    document.querySelectorAll(".home-filter-btn").forEach(b => {
      b.className = "btn btn-sm btn-ghost home-filter-btn";
    });
    if (btn) btn.className = "btn btn-sm btn-primary home-filter-btn";

    document.querySelectorAll(".pillar-block").forEach(block => {
      if (pillarKey === "all" || block.getAttribute("data-pillar") === pillarKey) {
        block.style.display = "flex";
      } else {
        block.style.display = "none";
      }
    });

    showToast("Đã lọc danh mục trụ cột đào tạo: " + pillarKey.toUpperCase(), "info");
  };

  // --- 8. Interactive Program Detail Modal ---
  window.openProgramDetail = function(title, cat, desc, target, format) {
    document.getElementById("pmodal-title").innerText = title;
    document.getElementById("pmodal-category").innerText = cat;
    document.getElementById("pmodal-desc").innerText = desc;
    document.getElementById("pmodal-target").innerText = target;
    document.getElementById("pmodal-format").innerText = format;
    document.getElementById("program-detail-modal").classList.add("open");
  };
  window.closeProgramDetail = function() {
    document.getElementById("program-detail-modal").classList.remove("open");
  };
  window.enrollProgramFromModal = function() {
    closeProgramDetail();
    if (state.mode === "GUEST") {
      openRegisterModal();
    } else {
      switchTab("lms");
      showToast("Đang mở giáo trình chi tiết trong hệ thống LMS...", "success");
    }
  };
  window.openEnrollForCategory = function(catName) {
    state.selectedCategoryForEnroll = catName;
    scrollToContact();
    const sel = document.getElementById("cf-guest-program");
    if (sel) {
      if (catName.includes("English")) sel.value = "p1";
      else if (catName.includes("Professional")) sel.value = "p2";
      else if (catName.includes("Life Skills")) sel.value = "p3";
      else if (catName.includes("Experiences")) sel.value = "p4";
      else if (catName.includes("Travel")) sel.value = "p5";
    }
    showToast("Đã chọn chuyên mục: " + catName + ". Mời bạn để lại thông tin tư vấn!", "info");
  };

  // --- 9. Feature Trial From Home (Direct Sandbox) ---
  window.testFeatureFromHome = function(targetTab) {
    // Auto switch into Student mode to test
    setAppMode("STUDENT");
    switchTab(targetTab);
    showToast("Đã mở môi trường kiểm thử tương tác: " + targetTab.toUpperCase() + "!", "success");
  };

  // --- 10. Consultation Form Handler ---
  window.handleConsultationSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById("cf-guest-name").value || "Bạn";
    const phone = document.getElementById("cf-guest-phone").value || "";
    showToast("Cảm ơn " + name + " (" + phone + ")! Teacher Dong Academy đã ghi nhận thông tin tư vấn và sẽ liên hệ trong 24h.", "success");
    e.target.reset();
  };

  // --- 11. Auth Modal (Login / Register) ---
  window.openLoginModal = function() {
    setAuthTab("login");
    document.getElementById("auth-modal").classList.add("open");
  };
  window.openRegisterModal = function() {
    setAuthTab("register");
    document.getElementById("auth-modal").classList.add("open");
  };
  window.closeAuthModal = function() {
    document.getElementById("auth-modal").classList.remove("open");
  };
  window.setAuthTab = function(tab) {
    const btnLogin = document.getElementById("tab-auth-login");
    const btnReg = document.getElementById("tab-auth-register");
    const groupName = document.getElementById("group-fullname");
    const btnSubmit = document.getElementById("btn-auth-submit");
    const title = document.getElementById("auth-modal-title");

    if (tab === "login") {
      btnLogin.className = "btn btn-sm";
      btnLogin.style.background = "var(--white)";
      btnLogin.style.boxShadow = "0 2px 6px rgba(0,0,0,.08)";
      btnReg.className = "btn btn-sm btn-ghost";
      btnReg.style.background = "transparent";
      btnReg.style.boxShadow = "none";
      groupName.style.display = "none";
      btnSubmit.innerText = "Đăng nhập ngay";
      title.innerText = "Đăng nhập tài khoản";
    } else {
      btnReg.className = "btn btn-sm";
      btnReg.style.background = "var(--white)";
      btnReg.style.boxShadow = "0 2px 6px rgba(0,0,0,.08)";
      btnLogin.className = "btn btn-sm btn-ghost";
      btnLogin.style.background = "transparent";
      btnLogin.style.boxShadow = "none";
      groupName.style.display = "block";
      btnSubmit.innerText = "Đăng ký học viên mới";
      title.innerText = "Tạo tài khoản học viên";
    }
  };

  window.loginWithGoogleMock = function() {
    closeAuthModal();
    const role = document.getElementById("auth-role-select").value || "STUDENT";
    setAppMode(role);
    showToast("Google OAuth 2.0: Đăng nhập 1 chạm thành công qua tài khoản Google!", "success");
  };

  window.handleAuthSubmit = function(e) {
    e.preventDefault();
    closeAuthModal();
    const role = document.getElementById("auth-role-select").value || "STUDENT";
    setAppMode(role);
    showToast("Đăng nhập thành công! Chào mừng bạn đến với hệ thống Teacher Dong Academy.", "success");
  };

  // --- 12. i18n Language Switcher (Đa Ngôn Ngữ 4 Tiếng: VI, EN, ZH, JA) ---
  window.changeLanguage = function(langCode) {
    if (!['vi', 'en', 'zh', 'ja'].includes(langCode)) langCode = 'vi';
    state.lang = langCode;
    try {
      localStorage.setItem('td_lang', langCode);
    } catch(e) {}

    // 1. Sync header dropdown
    const sel = document.getElementById("lang-select");
    if (sel && sel.value !== langCode) sel.value = langCode;

    // 2. Sync mock test language buttons
    document.querySelectorAll(".mocktest-lang-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === langCode);
    });

    const dict = i18n[langCode] || i18n.vi;

    // 3. Update all [data-i18n] via innerHTML
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // 4. Update all placeholders [data-i18n-ph]
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const key = el.getAttribute("data-i18n-ph");
      if (dict[key] !== undefined) {
        el.placeholder = dict[key];
      }
    });

    // 5. Update dynamic components
    updateDynamicTranslations(langCode);

    const toastMsgs = {
      vi: "Đã chuyển sang Tiếng Việt",
      en: "Switched to English",
      zh: "已切换至简体中文",
      ja: "日本語に切り替えました"
    };
    showToast(toastMsgs[langCode] || toastMsgs.vi, "info");
  };

  function updateDynamicTranslations(langCode) {
    const dict = i18n[langCode] || i18n.vi;

    // A. Tester bar mode label
    const labelEl = document.getElementById("tester-current-mode-label");
    if (labelEl) {
      if (state.mode === "GUEST") {
        labelEl.innerHTML = dict["tester.modeGuest"] || "🌐 Khách mới chưa có tài khoản (Trang Home)";
      } else if (state.mode === "STUDENT") {
        labelEl.innerHTML = dict["tester.modeStudent"] || "🎓 Học viên đã đăng nhập (Nguyễn Văn An)";
      } else {
        labelEl.innerHTML = dict["tester.modeAdmin"] || "👨‍🏫 Giảng viên / Quản trị viên (Teacher Dong)";
      }
    }

    // B. Role status & toggle button in header
    const titleEl = document.getElementById("user-role-title");
    const btnRoleLabel = document.getElementById("btn-role-label");
    if (titleEl && btnRoleLabel) {
      if (state.role === "STUDENT") {
        titleEl.innerText = langCode === 'en' ? "Student (STUDENT) — TD-STU-8821" :
                            langCode === 'zh' ? "学员 (STUDENT) — TD-STU-8821" :
                            langCode === 'ja' ? "受講生 (STUDENT) — TD-STU-8821" :
                            "Học viên (STUDENT) — TD-STU-8821";
        btnRoleLabel.innerText = langCode === 'en' ? "Switch to Admin" :
                                 langCode === 'zh' ? "切换为管理员" :
                                 langCode === 'ja' ? "管理者へ切替" :
                                 "Đổi sang Admin";
      } else {
        titleEl.innerText = langCode === 'en' ? "Instructor & Admin (ADMIN)" :
                            langCode === 'zh' ? "主讲老师与管理员 (ADMIN)" :
                            langCode === 'ja' ? "講師・管理者 (ADMIN)" :
                            "Giáo viên & Admin (ADMIN)";
        btnRoleLabel.innerText = langCode === 'en' ? "Switch to Student" :
                                 langCode === 'zh' ? "切换为学员" :
                                 langCode === 'ja' ? "受講生へ切替" :
                                 "Đổi sang Học viên";
      }
    }

    // C. Timer Pause/Resume button
    const timerBtn = document.getElementById("btn-quiz-timer-toggle");
    if (timerBtn) {
      timerBtn.innerText = state.quizTimerRunning ? dict["quiz.timerPause"] : dict["quiz.timerResume"];
    }

    // D. Mock Test Result Panel
    const badge = document.getElementById("quiz-status-badge");
    const verdict = document.getElementById("quiz-verdict-title");
    const desc = document.getElementById("quiz-verdict-desc");
    const bandDisplay = document.getElementById("quiz-band-display");

    if (!state.quizSubmitted) {
      if (badge) badge.innerText = dict["quiz.badgePending"];
      if (verdict) verdict.innerText = dict["quiz.initialVerdictTitle"];
      if (desc) desc.innerText = dict["quiz.initialVerdictDesc"];
      if (bandDisplay) bandDisplay.innerText = dict["quiz.bandPending"];
    } else {
      if (state.quizScore >= 80) {
        if (badge) badge.innerText = dict["quiz.badgePass"];
        if (verdict) verdict.innerText = dict["quiz.passVerdictTitle"];
        if (desc) desc.innerText = dict["quiz.passVerdictDesc"];
      } else {
        if (badge) badge.innerText = dict["quiz.badgeFail"];
        if (verdict) verdict.innerText = dict["quiz.failVerdictTitle"];
        if (desc) desc.innerText = dict["quiz.failVerdictDesc"];
      }
      if (bandDisplay) bandDisplay.innerText = state.quizBand;
    }
  }

  // --- 13. Single Concurrent Session Simulator ---
  window.openSingleSessionModal = function() {
    document.getElementById("single-session-modal").classList.add("open");
  };
  window.closeSingleSessionModal = function() {
    document.getElementById("single-session-modal").classList.remove("open");
  };
  window.simulateReLogin = function() {
    closeSingleSessionModal();
    showToast("Đã khởi tạo phiên đăng nhập mới thành công cho thiết bị này!", "success");
  };

  // --- 14. Google OAuth Simulator ---
  window.openGoogleModal = function() {
    document.getElementById("google-modal").classList.add("open");
  };
  window.closeGoogleModal = function() {
    document.getElementById("google-modal").classList.remove("open");
  };
  window.toggleGoogleLink = function() {
    state.googleLinked = !state.googleLinked;
    const badge = document.getElementById("google-link-badge");
    const btn = document.getElementById("btn-toggle-google");
    const emailDisp = document.getElementById("google-email-display");
    if (state.googleLinked) {
      badge.className = "badge badge-green";
      badge.innerText = "ĐÃ LIÊN KẾT";
      emailDisp.innerText = "nguyenvanan.ielts@gmail.com";
      btn.className = "btn btn-danger btn-sm";
      btn.innerText = "Hủy liên kết tài khoản Google";
      showToast("Đã liên kết tài khoản Google thành công!", "success");
    } else {
      badge.className = "badge badge-red";
      badge.innerText = "CHƯA LIÊN KẾT";
      emailDisp.innerText = "(Chưa liên kết)";
      btn.className = "btn btn-primary btn-sm";
      btn.innerText = "Liên kết tài khoản Google ngay";
      showToast("Đã hủy liên kết Google OAuth!", "warning");
    }
  };

  // --- 15. Presigned Token 15-Minute Countdown ---
  function startTokenTimer() {
    state.tokenTimerId = setInterval(() => {
      if (state.tokenSeconds > 0) {
        state.tokenSeconds--;
        const m = String(Math.floor(state.tokenSeconds / 60)).padStart(2, "0");
        const s = String(state.tokenSeconds % 60).padStart(2, "0");
        const el = document.getElementById("token-countdown");
        if (el) el.innerText = \`\${m}:\${s}\`;
      } else {
        showToast("Token bảo mật đã hết hạn. Đang làm mới...", "warning");
        refreshToken();
      }
    }, 1000);
  }
  window.refreshToken = function() {
    state.tokenSeconds = 900;
    const el = document.getElementById("token-countdown");
    if (el) el.innerText = "15:00";
    showToast("Token bảo mật AWS S3 đã được gia hạn thêm 15 phút!", "success");
  };

  // --- 16. Dynamic Bouncing Watermark Engine ---
  let wmInterval = null;
  function initWatermarkMovement() {
    if (wmInterval) clearInterval(wmInterval);
    const wm = document.getElementById("watermark-element");
    const container = document.getElementById("pdf-page");
    if (!wm || !container) return;

    function moveWatermark() {
      const maxX = container.clientWidth - 320;
      const maxY = container.clientHeight - 80;
      const rx = Math.max(20, Math.floor(Math.random() * maxX));
      const ry = Math.max(40, Math.floor(Math.random() * maxY));
      wm.style.left = rx + "px";
      wm.style.top = ry + "px";
    }
    moveWatermark();
    wmInterval = setInterval(moveWatermark, 4000);
  }
  window.testCopyProtection = function() {
    showToast("ĐÃ CHẶN: Bản quyền tài liệu thuộc Teacher Dong Academy. Chức năng sao chép và in đã bị vô hiệu hóa.", "danger");
  };

  // --- 17. Audio MP3 Visualizer & Playback ---
  let audioPlaying = false;
  window.toggleAudioMock = function(btn) {
    audioPlaying = !audioPlaying;
    const icon = document.getElementById("audio-play-icon");
    if (audioPlaying) {
      icon.querySelector("use").setAttribute("href", "#i-pause");
      startAudioVisualizer();
      showToast("Đang phát audio bài giảng IELTS Listening...", "info");
    } else {
      icon.querySelector("use").setAttribute("href", "#i-play");
      stopAudioVisualizer();
    }
  };
  function startAudioVisualizer() {
    const canvas = document.getElementById("audio-visualizer-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function render() {
      if (!audioPlaying) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 40;
      const w = canvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const h = Math.random() * (canvas.height - 10) + 6;
        ctx.fillStyle = i % 2 === 0 ? "#55B8E8" : "#FFB547";
        ctx.fillRect(i * w + 2, (canvas.height - h) / 2, w - 4, h);
      }
      state.audioAnimId = requestAnimationFrame(render);
    }
    render();
  }
  function stopAudioVisualizer() {
    if (state.audioAnimId) cancelAnimationFrame(state.audioAnimId);
  }
  window.setAudioSpeed = function(spd, btn) {
    document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showToast("Tốc độ phát audio: " + spd + "x", "info");
  };

  // --- 18. Interactive Whiteboard (HTML5 Canvas) ---
  function initWhiteboard() {
    const canvas = document.getElementById("whiteboard-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw initial teacher annotations
    ctx.strokeStyle = "#2868B2";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.font = "bold 20px 'Be Vietnam Pro', sans-serif";
    ctx.fillStyle = "#2868B2";
    ctx.fillText("Welcome to Teacher Dong IELTS Masterclass!", 40, 50);

    ctx.fillStyle = "#53647a";
    ctx.font = "14px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("Topic: Key Collocations & Argument Mapping for Task 2", 40, 80);

    ctx.strokeStyle = "#FFB547";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 100, 480, 110);
    ctx.fillStyle = "#1e293b";
    ctx.font = "13px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("• Point 1: Empirical evidence in pedagogy", 50, 130);
    ctx.fillText("• Point 2: Irreplaceable value of human empathy", 50, 160);
    ctx.fillText("• Point 3: Synthesis & conclusion strategy", 50, 190);

    function getPos(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function startDraw(e) {
      state.wb.isDrawing = true;
      const p = getPos(e);
      state.wb.lastX = p.x;
      state.wb.lastY = p.y;
    }

    function doDraw(e) {
      if (!state.wb.isDrawing) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(state.wb.lastX, state.wb.lastY);

      if (state.wb.tool === "eraser") {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = state.wb.size * 3;
        ctx.globalAlpha = 1.0;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else if (state.wb.tool === "highlighter") {
        ctx.strokeStyle = state.wb.color;
        ctx.lineWidth = state.wb.size * 2.5;
        ctx.globalAlpha = 0.35;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        ctx.strokeStyle = state.wb.color;
        ctx.lineWidth = state.wb.size;
        ctx.globalAlpha = 1.0;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      state.wb.lastX = p.x;
      state.wb.lastY = p.y;
      state.wb.syncCount++;
      const badge = document.getElementById("wb-status-badge");
      if (badge) badge.innerText = \`Đồng bộ DataChannel: \${state.wb.syncCount} nét vẽ\`;
    }

    function endDraw() {
      state.wb.isDrawing = false;
    }

    canvas.onmousedown = startDraw;
    canvas.onmousemove = doDraw;
    canvas.onmouseup = endDraw;
    canvas.ontouchstart = startDraw;
    canvas.ontouchmove = doDraw;
    canvas.ontouchend = endDraw;
  }

  window.setWbTool = function(tool) {
    state.wb.tool = tool;
    document.querySelectorAll(".wb-btn").forEach(b => b.classList.remove("active"));
    const btn = document.getElementById("tool-" + tool);
    if (btn) btn.classList.add("active");
  };
  window.setWbColor = function(color, el) {
    state.wb.color = color;
    document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
    if (el) el.classList.add("active");
  };
  window.setWbSize = function(val) {
    state.wb.size = parseInt(val, 10);
  };
  window.clearWhiteboard = function() {
    const canvas = document.getElementById("whiteboard-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showToast("Đã xóa bảng trắng LiveKit!", "info");
  };
  window.scrollToWhiteboard = function() {
    const el = document.getElementById("whiteboard-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // --- 19. WebRTC Controls ---
  window.toggleMyMic = function() {
    state.myMicOn = !state.myMicOn;
    const btn = document.getElementById("btn-toggle-mic");
    const icon = document.getElementById("icon-my-mic");
    const indicator = document.getElementById("an-mic-indicator");
    if (state.myMicOn) {
      btn.classList.remove("muted");
      icon.querySelector("use").setAttribute("href", "#i-mic");
      if (indicator) indicator.innerHTML = \`<svg class="ic" style="color:var(--success); width:13px; height:13px;"><use href="#i-mic"/></svg> Mic\`;
      showToast("Đã bật Microphone", "success");
    } else {
      btn.classList.add("muted");
      icon.querySelector("use").setAttribute("href", "#i-mic-off");
      if (indicator) indicator.innerHTML = \`<svg class="ic" style="color:#ef4444; width:13px; height:13px;"><use href="#i-mic-off"/></svg> Mute\`;
      showToast("Đã tắt Microphone", "warning");
    }
  };

  window.toggleMyCam = function() {
    state.myCamOn = !state.myCamOn;
    const btn = document.getElementById("btn-toggle-cam");
    const icon = document.getElementById("icon-my-cam");
    if (state.myCamOn) {
      btn.classList.remove("muted");
      icon.querySelector("use").setAttribute("href", "#i-video");
      showToast("Đã bật Camera", "success");
    } else {
      btn.classList.add("muted");
      icon.querySelector("use").setAttribute("href", "#i-video-off");
      showToast("Đã tắt Camera", "warning");
    }
  };

  window.toggleRaiseHand = function() {
    state.handRaised = !state.handRaised;
    const btn = document.getElementById("btn-toggle-hand");
    const indicator = document.getElementById("an-hand-indicator");
    if (state.handRaised) {
      btn.classList.add("active-action");
      if (indicator) indicator.style.display = "inline";
      showToast("Bạn đã giơ tay phát biểu! Host Teacher Dong đã nhận thông báo.", "warning");
    } else {
      btn.classList.remove("active-action");
      if (indicator) indicator.style.display = "none";
      showToast("Đã hạ tay", "info");
    }
  };

  window.toggleScreenShare = function() {
    state.isScreenSharing = !state.isScreenSharing;
    const btn = document.getElementById("btn-toggle-screen");
    if (state.isScreenSharing) {
      btn.classList.add("active-action");
      showToast("Bắt đầu chia sẻ màn hình qua LiveKit WebRTC!", "success");
    } else {
      btn.classList.remove("active-action");
      showToast("Đã dừng chia sẻ màn hình", "info");
    }
  };

  window.muteAllStudents = function() {
    showToast("HOST: Đã tắt Microphone của toàn bộ 7 học viên trong phòng!", "warning");
  };

  window.toggleWhiteboardPermission = function() {
    const btn = document.getElementById("btn-wb-perm");
    if (btn.innerText.includes("Cho phép")) {
      btn.innerText = "Khóa bảng (Chỉ Host)";
      showToast("HOST: Đã mở quyền vẽ bảng trắng cho tất cả học viên!", "success");
    } else {
      btn.innerText = "Cho phép học viên vẽ";
      showToast("HOST: Đã khóa quyền vẽ bảng trắng (Chỉ Teacher Dong có thể vẽ)", "info");
    }
  };

  // --- 20. AI IELTS Writing Evaluator ---
  window.updateWordCount = function(text) {
    const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
    const badge = document.getElementById("word-count-badge");
    if (words >= 250) {
      badge.style.color = "var(--success)";
      badge.innerText = \`\${words} từ (Đạt chuẩn &ge; 250 từ)\`;
    } else {
      badge.style.color = "var(--danger)";
      badge.innerText = \`\${words} từ (Chưa đủ chuẩn 250 từ)\`;
    }
  };

  window.changeWritingPrompt = function(val) {
    const title = document.getElementById("prompt-task-title");
    const desc = document.getElementById("prompt-task-desc");
    if (val === "task1_energy") {
      title.innerText = "WRITING TASK 1 (Line Graph)";
      desc.innerText = '"The line graph illustrates the percentage of energy consumption from renewable sources across five countries from 2010 to 2025. Summarise the information by selecting and reporting the main features."';
    } else {
      title.innerText = "WRITING TASK 2 (Opinion Essay)";
      desc.innerText = '"Some people believe that advances in Artificial Intelligence will soon render human teachers obsolete in classrooms. To what extent do you agree or disagree? Give reasons and relevant examples."';
    }
  };

  window.submitToAIEvaluator = function() {
    const btn = document.getElementById("btn-submit-ai");
    const textEl = document.getElementById("btn-ai-text");
    textEl.innerText = "AI đang phân tích 4 tiêu chí...";
    btn.disabled = true;

    setTimeout(() => {
      btn.disabled = false;
      textEl.innerText = "Chấm điểm ngay bằng AI";
      document.getElementById("score-tr").innerText = "7.5";
      document.getElementById("score-cc").innerText = "7.0";
      document.getElementById("score-lr").innerText = "8.0";
      document.getElementById("score-gra").innerText = "7.5";
      document.getElementById("ai-overall-band").innerText = "7.5";
      showToast("Đã hoàn tất phân tích bài viết! Overall Band: 7.5", "success");
    }, 1200);
  };

  window.approveWritingSubmission = function() {
    const adjustedBand = document.getElementById("admin-adjust-band-input").value;
    document.getElementById("ai-overall-band").innerText = adjustedBand;
    showToast("TEACHER DONG: Đã phê duyệt và phát hành kết quả Band " + adjustedBand + " cho học viên!", "success");
  };

  // --- 21. Speaking Studio ---
  window.toggleAudioRecording = function() {
    state.isRecording = !state.isRecording;
    const btn = document.getElementById("btn-toggle-record");
    const lbl = document.getElementById("label-record-state");
    const icon = document.getElementById("icon-record-state");
    const playbackBtn = document.getElementById("btn-playback-recording");

    if (state.isRecording) {
      btn.className = "btn btn-danger";
      lbl.innerText = "Dừng thu âm";
      icon.querySelector("use").setAttribute("href", "#i-stop");
      playbackBtn.disabled = true;
      state.recordSeconds = 0;
      startRecordTimer();
      startRecordWaveform();
      showToast("Đang thu âm qua Micro...", "info");
    } else {
      btn.className = "btn btn-primary";
      lbl.innerText = "Thu âm lại";
      icon.querySelector("use").setAttribute("href", "#i-mic");
      playbackBtn.disabled = false;
      stopRecordTimer();
      stopRecordWaveform();
      showToast("Đã lưu bản thu âm hoàn chỉnh!", "success");
    }
  };

  function startRecordTimer() {
    state.recordTimerId = setInterval(() => {
      state.recordSeconds++;
      const m = String(Math.floor(state.recordSeconds / 60)).padStart(2, "0");
      const s = String(state.recordSeconds % 60).padStart(2, "0");
      const el = document.getElementById("record-timer");
      if (el) el.innerText = \`\${m}:\${s}\`;
      if (state.recordSeconds >= 120) {
        toggleAudioRecording();
        showToast("Đã đạt thời lượng tối đa 2 phút của IELTS Speaking Part 2", "warning");
      }
    }, 1000);
  }

  function stopRecordTimer() {
    if (state.recordTimerId) clearInterval(state.recordTimerId);
  }

  let waveAnimId = null;
  function startRecordWaveform() {
    const canvas = document.getElementById("speaking-record-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function loop() {
      if (!state.isRecording) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = 50;
      const w = canvas.width / cols;
      for (let i = 0; i < cols; i++) {
        const h = Math.random() * (canvas.height - 12) + 4;
        ctx.fillStyle = "#FFB547";
        ctx.fillRect(i * w + 2, (canvas.height - h) / 2, w - 3, h);
      }
      waveAnimId = requestAnimationFrame(loop);
    }
    loop();
  }

  function stopRecordWaveform() {
    if (waveAnimId) cancelAnimationFrame(waveAnimId);
  }

  window.playbackRecording = function() {
    showToast("Đang phát lại bản ghi âm câu trả lời của bạn...", "info");
  };

  window.submitSpeakingAudio = function() {
    showToast("Bản ghi âm đã được gửi thành công đến Teacher Dong để chấm điểm!", "success");
  };

  window.updateSpeakingScore = function(type, val) {
    state.speakingScores[type] = parseFloat(val);
    document.getElementById("val-" + type).innerText = val;
    const overall = (state.speakingScores.fc + state.speakingScores.lr + state.speakingScores.gra + state.speakingScores.pr) / 4;
    const rounded = Math.round(overall * 2) / 2;
    document.getElementById("speaking-overall-band").innerText = rounded.toFixed(1);
  };

  window.publishSpeakingFeedback = function() {
    const band = document.getElementById("speaking-overall-band").innerText;
    showToast("TEACHER DONG: Đã lưu nhận xét và phát hành kết quả Speaking Band " + band + " cho học viên!", "success");
  };

  window.seekAudioTime = function(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    document.getElementById("grading-audio-time").innerText = \`\${m}:\${s} / 01:52\`;
    document.getElementById("timeline-progress-bar").style.width = ((sec / 112) * 100) + "%";
    showToast("Đã tua tới mốc nhận xét @" + m + ":" + s, "info");
  };

  window.clickTimelineScrub = function(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const totalSec = 112;
    const cur = Math.floor(pct * totalSec);
    seekAudioTime(cur);
  };

  window.skipAudio = function(delta) {
    showToast(\`\${delta > 0 ? 'Tiến' : 'Lùi'} 5 giây\`, "info");
  };

  let gradePlaying = false;
  window.toggleGradingAudioPlay = function() {
    gradePlaying = !gradePlaying;
    const btn = document.getElementById("btn-play-grade-audio");
    if (gradePlaying) {
      btn.innerHTML = \`<svg class="ic"><use href="#i-pause"/></svg><span>Tạm dừng</span>\`;
      showToast("Đang phát audio bài nói của học viên...", "info");
    } else {
      btn.innerHTML = \`<svg class="ic"><use href="#i-play"/></svg><span>Phát audio</span>\`;
    }
  };

  // --- 22. Mock Test & Quiz Engine (Đa Đề Thi & 4 Ngôn Ngữ) ---
  window.switchMockTest = function(testNum) {
    state.activeMockTest = testNum;
    for (let i = 1; i <= 3; i++) {
      const tabBtn = document.getElementById("tab-btn-mtest" + i);
      const pane = document.getElementById("mtest-pane-" + i);
      if (tabBtn) tabBtn.classList.toggle("active", i === testNum);
      if (pane) pane.style.display = i === testNum ? "block" : "none";
    }

    const toastMsgs = {
      vi: "Đã chuyển sang Mock Test " + testNum,
      en: "Switched to Mock Test " + testNum,
      zh: "已切换至全真模考 " + testNum,
      ja: "模試 " + testNum + " に切り替えました"
    };
    showToast(toastMsgs[state.lang] || toastMsgs.vi, "info");
  };

  window.toggleReadingTranslation = function() {
    const box = document.getElementById("reading-trans-box");
    if (box) box.classList.toggle("open");
  };

  let mockAudioPlaying = false;
  window.toggleMockAudio = function(btn) {
    mockAudioPlaying = !mockAudioPlaying;
    if (mockAudioPlaying) {
      btn.innerHTML = '<svg class="ic" style="width:16px; height:16px;"><use href="#i-pause"/></svg>';
      const toastMsgs = {
        vi: "Đang phát audio bài giảng hội thoại...",
        en: "Playing simulated lecture audio...",
        zh: "正在播放听力模拟音频...",
        ja: "リスニング模擬音声を再生中..."
      };
      showToast(toastMsgs[state.lang] || toastMsgs.vi, "info");
    } else {
      btn.innerHTML = '<svg class="ic" style="width:16px; height:16px;"><use href="#i-play"/></svg>';
    }
  };

  // Timer Countdown Controller
  function startQuizTimer() {
    if (state.quizTimerId) clearInterval(state.quizTimerId);
    state.quizTimerId = setInterval(() => {
      if (!state.quizTimerRunning) return;
      if (state.quizTimerSeconds > 0) {
        state.quizTimerSeconds--;
        const m = String(Math.floor(state.quizTimerSeconds / 60)).padStart(2, "0");
        const s = String(state.quizTimerSeconds % 60).padStart(2, "0");
        const el = document.getElementById("quiz-countdown");
        if (el) el.innerText = m + ":" + s;
      } else {
        clearInterval(state.quizTimerId);
        submitQuiz();
        const timeoutMsgs = {
          vi: "Hết giờ làm bài! Hệ thống tự động thu bài và chấm điểm.",
          en: "Time's up! System auto-submitted your mock test.",
          zh: "考试时间到！系统已为您自动交卷并判分。",
          ja: "制限時間終了！システムが自動採点を行いました。"
        };
        showToast(timeoutMsgs[state.lang] || timeoutMsgs.vi, "warning");
      }
    }, 1000);
  }

  window.toggleQuizTimer = function() {
    state.quizTimerRunning = !state.quizTimerRunning;
    const btn = document.getElementById("btn-quiz-timer-toggle");
    const dict = i18n[state.lang] || i18n.vi;
    if (btn) btn.innerText = state.quizTimerRunning ? dict["quiz.timerPause"] : dict["quiz.timerResume"];
  };

  window.resetQuizTimer = function() {
    state.quizTimerSeconds = 585; // 09:45
    const el = document.getElementById("quiz-countdown");
    if (el) el.innerText = "09:45";
  };

  window.resetCurrentQuiz = function() {
    state.quizSubmitted = false;
    state.quizScore = 0;
    state.quizBand = "";

    // Clear Test 1
    const q1Radio = document.querySelector('input[name="mtest1_q1"]:checked');
    if (q1Radio) q1Radio.checked = false;
    document.querySelectorAll('input[name="mtest1_q2"]').forEach(cb => cb.checked = false);
    const q3Blank = document.getElementById("q3-blank");
    if (q3Blank) q3Blank.value = "";

    // Clear Test 2
    const t2q1Radio = document.querySelector('input[name="mtest2_q1"]:checked');
    if (t2q1Radio) t2q1Radio.checked = false;
    document.querySelectorAll('input[name="mtest2_q2"]').forEach(cb => cb.checked = false);
    const t2q3Blank = document.getElementById("t2q3-blank");
    if (t2q3Blank) t2q3Blank.value = "";

    // Clear Test 3
    const t3q1Radio = document.querySelector('input[name="mtest3_q1"]:checked');
    if (t3q1Radio) t3q1Radio.checked = false;
    document.querySelectorAll('input[name="mtest3_q2"]').forEach(cb => cb.checked = false);
    const t3q3Blank = document.getElementById("t3q3-blank");
    if (t3q3Blank) t3q3Blank.value = "";

    // Reset Result Card
    document.getElementById("quiz-score-display").innerText = "-- / 100";
    document.getElementById("quiz-score-display").style.color = "var(--primary)";
    document.getElementById("quiz-unlock-box").style.display = "none";
    document.getElementById("quiz-explanation-box").style.display = "none";

    updateDynamicTranslations(state.lang);

    const resetMsgs = {
      vi: "Đã đặt lại bài thi thử thành công!",
      en: "Mock test has been reset successfully!",
      zh: "模考已重置，您可以重新作答！",
      ja: "模試がリセットされました。再回答が可能です。"
    };
    showToast(resetMsgs[state.lang] || resetMsgs.vi, "info");
  };

  window.submitQuiz = function() {
    let score = 0;
    const testNum = state.activeMockTest || 1;

    if (testNum === 1) {
      // Test 1: IELTS Reading
      const q1B = document.getElementById("q1-correct");
      const q2A = document.getElementById("q2-optA");
      const q2C = document.getElementById("q2-optC");
      const q3Val = (document.getElementById("q3-blank").value || "").trim().toLowerCase();

      if (q1B && q1B.checked) score += 34;
      if (q2A && q2A.checked && q2C && q2C.checked) score += 33;
      if (q3Val === "grammatical") score += 33;
    } else if (testNum === 2) {
      // Test 2: IELTS Listening
      const t2q1 = document.getElementById("t2q1-correct");
      const t2q2A = document.getElementById("t2q2-optA");
      const t2q2B = document.getElementById("t2q2-optB");
      const t2q3Val = (document.getElementById("t2q3-blank").value || "").trim().toLowerCase();

      if (t2q1 && t2q1.checked) score += 34;
      if (t2q2A && t2q2A.checked && t2q2B && t2q2B.checked) score += 33;
      if (t2q3Val === "battery" || t2q3Val === "batteries") score += 33;
    } else {
      // Test 3: Business English
      const t3q1 = document.getElementById("t3q1-correct");
      const t3q2A = document.getElementById("t3q2-optA");
      const t3q2B = document.getElementById("t3q2-optB");
      const t3q3Val = (document.getElementById("t3q3-blank").value || "").trim().toLowerCase();

      if (t3q1 && t3q1.checked) score += 34;
      if (t3q2A && t3q2A.checked && t3q2B && t3q2B.checked) score += 33;
      if (t3q3Val === "arbitration") score += 33;
    }

    state.quizSubmitted = true;
    state.quizScore = score;

    // Estimate IELTS Band & CEFR
    let band = "";
    if (score === 100) band = "IELTS Band 8.5 • CEFR C2";
    else if (score >= 80) band = "IELTS Band 7.5 • CEFR C1";
    else if (score >= 60) band = "IELTS Band 6.5 • CEFR B2";
    else if (score >= 30) band = "IELTS Band 5.5 • CEFR B1";
    else band = "IELTS Band 4.5 • CEFR A2";

    state.quizBand = band;

    const display = document.getElementById("quiz-score-display");
    const verdict = document.getElementById("quiz-verdict-title");
    const desc = document.getElementById("quiz-verdict-desc");
    const badge = document.getElementById("quiz-status-badge");
    const bandEl = document.getElementById("quiz-band-display");
    const unlockBox = document.getElementById("quiz-unlock-box");
    const expBox = document.getElementById("quiz-explanation-box");

    display.innerText = score + " / 100";
    if (bandEl) bandEl.innerText = band;
    expBox.style.display = "block";

    const dict = i18n[state.lang] || i18n.vi;

    if (score >= 80) {
      badge.className = "badge badge-green";
      badge.innerText = dict["quiz.badgePass"];
      display.style.color = "var(--success)";
      verdict.innerText = dict["quiz.passVerdictTitle"];
      verdict.style.color = "var(--success)";
      desc.innerText = dict["quiz.passVerdictDesc"];
      unlockBox.style.display = "block";

      const toastSuccessMsgs = {
        vi: "Chúc mừng! Đạt " + score + "% (" + band + ") — Đã mở khóa bài học tiếp theo!",
        en: "Congratulations! Scored " + score + "% (" + band + ") — Next lesson unlocked!",
        zh: "恭喜！成绩达到 " + score + "% (" + band + ") — 已成功解锁进阶课程！",
        ja: "合格！スコア " + score + "% (" + band + ") — 次のレッスンがアンロックされました！"
      };
      showToast(toastSuccessMsgs[state.lang] || toastSuccessMsgs.vi, "success");
    } else {
      badge.className = "badge badge-red";
      badge.innerText = dict["quiz.badgeFail"];
      display.style.color = "var(--danger)";
      verdict.innerText = dict["quiz.failVerdictTitle"];
      verdict.style.color = "var(--danger)";
      desc.innerText = dict["quiz.failVerdictDesc"];
      unlockBox.style.display = "none";

      const toastWarningMsgs = {
        vi: "Điểm số: " + score + "% (" + band + ") — Chưa đạt yêu cầu sàn 80%",
        en: "Score: " + score + "% (" + band + ") — Below 80% passing threshold",
        zh: "本次得分: " + score + "% (" + band + ") — 未达 80% 及格线",
        ja: "スコア: " + score + "% (" + band + ") — 80%の合格基準に達していません"
      };
      showToast(toastWarningMsgs[state.lang] || toastWarningMsgs.vi, "warning");
    }
  };

  // --- 23. Attendance & Excel Export ---
  window.simulateIncomingWebhook = function() {
    const stream = document.getElementById("webhook-log-stream");
    const counter = document.getElementById("webhook-counter-badge");
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");
    const newEntry = document.createElement("div");
    newEntry.innerText = \`[\${timeStr}] participant_joined: TD-STU-8828 (Hoàng Tuấn Anh) -> Join via LiveKit Webhook at 19:55 (LATE)\`;
    stream.prepend(newEntry);
    counter.innerText = "5 Sự kiện ghi nhận";
    showToast("LiveKit Webhook: Nhận sự kiện participant_joined mới thành công!", "info");
  };

  window.openEditAttendanceModal = function(name, id, status) {
    document.getElementById("edit-att-name").value = name + " (" + id + ")";
    document.getElementById("edit-att-status").value = status;
    document.getElementById("attendance-edit-modal").classList.add("open");
  };
  window.closeAttendanceEditModal = function() {
    document.getElementById("attendance-edit-modal").classList.remove("open");
  };
  window.saveAttendanceEdit = function() {
    closeAttendanceEditModal();
    showToast("Đã cập nhật trạng thái chuyên cần và ghi nhận lý do vào hệ thống!", "success");
  };

  window.exportAttendanceToExcel = function() {
    const rows = [
      ["Họ và tên", "Mã học viên", "Giờ vào", "Giờ ra", "Số phút học", "Tổng thời lượng", "Tỷ lệ %", "Trạng thái", "Ghi chú"],
      ["Nguyễn Văn An", "TD-STU-8821", "19:28", "21:00", "90", "90", "100%", "PRESENT", "Tham gia từ đầu, phát biểu tích cực"],
      ["Trần Thị Mai", "TD-STU-8822", "19:35", "21:00", "85", "90", "94.4%", "PRESENT", "Tham gia trong 15p đầu"],
      ["Lê Quốc Hoàng", "TD-STU-8823", "19:32", "20:50", "78", "90", "86.7%", "PRESENT", "Đạt chuẩn thời lượng >= 80%"],
      ["Phạm Thu Thảo", "TD-STU-8824", "19:48", "21:00", "72", "90", "80.0%", "LATE", "Vào muộn sau 18 phút"],
      ["Đỗ Quang Minh", "TD-STU-8825", "19:30", "21:00", "90", "90", "100%", "PRESENT", "Tham gia đầy đủ"],
      ["Vũ Thanh Hưng", "TD-STU-8826", "19:30", "20:10", "40", "90", "44.4%", "ABSENT", "Rời phòng sớm, < 80% thời lượng"],
      ["Bùi Khánh Linh", "TD-STU-8827", "19:30", "21:00", "90", "90", "100%", "PRESENT", "Tham gia đầy đủ"]
    ];

    let csvContent = "\\uFEFF"; // UTF-8 BOM
    rows.forEach(r => {
      csvContent += r.map(c => \`"\${c}"\`).join(",") + "\\r\\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Teacher_Dong_Academy_Attendance_Room101.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã tải xuống file báo cáo chuyên cần Excel (.csv) thành công!", "success");
  };

  // --- 24. Live Chat Socket.IO Simulator ---
  window.handleChatSubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById("chat-text-input");
    const msg = (input.value || "").trim();
    if (!msg) return;
    input.value = "";
    sendChatMessage(msg);
  };

  window.sendQuickReply = function(text) {
    sendChatMessage(text);
  };

  function sendChatMessage(msg) {
    const body = document.getElementById("main-chat-body");
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

    const msgEl = document.createElement("div");
    msgEl.className = "chat-msg mine";
    msgEl.innerHTML = \`\${msg}<div style="font-size:.7rem; color:#dbe9f8; text-align:right; margin-top:4px;">\${timeStr} • Đã gửi</div>\`;
    body.appendChild(msgEl);
    body.scrollTop = body.scrollHeight;

    const typing = document.getElementById("chat-typing-indicator");
    if (typing) typing.style.display = "block";

    setTimeout(() => {
      if (typing) typing.style.display = "none";
      const replyEl = document.createElement("div");
      replyEl.className = "chat-msg theirs";
      replyEl.innerHTML = \`Cảm ơn em đã gửi tin nhắn! Thầy đã ghi nhận và sẽ phản hồi chi tiết cho em ngay trong buổi học nhé.<div style="font-size:.7rem; color:#94a3b8; text-align:right; margin-top:4px;">\${timeStr}</div>\`;
      body.appendChild(replyEl);
      body.scrollTop = body.scrollHeight;
      showToast("Teacher Dong đã trả lời tin nhắn của bạn!", "info");
    }, 1500);
  }

  window.toggleFloatingChat = function() {
    const win = document.getElementById("floating-chat-window");
    win.classList.toggle("open");
  };

  window.handleFloatChatSubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById("float-chat-input");
    const msg = (input.value || "").trim();
    if (!msg) return;
    input.value = "";

    const body = document.getElementById("float-chat-body");
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

    const msgEl = document.createElement("div");
    msgEl.className = "chat-msg mine";
    msgEl.innerHTML = \`\${msg}<div style="font-size:.68rem; color:#dbe9f8; text-align:right; margin-top:2px;">\${timeStr}</div>\`;
    body.appendChild(msgEl);
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
      const rep = document.createElement("div");
      rep.className = "chat-msg theirs";
      rep.innerHTML = \`Thầy đã nhận được tin nhắn! Thầy hẹn em trong phòng học LiveKit nhé.<div style="font-size:.68rem; color:#94a3b8; text-align:right; margin-top:2px;">\${timeStr}</div>\`;
      body.appendChild(rep);
      body.scrollTop = body.scrollHeight;
    }, 1200);
  };

  // --- LMS Helpers ---
  window.filterCourses = function(cat, btn) {
    document.querySelectorAll(".filter-chip").forEach(b => {
      b.className = "btn btn-sm btn-ghost filter-chip";
    });
    btn.className = "btn btn-sm btn-primary filter-chip";
    showToast("Đã lọc khóa học theo danh mục: " + cat.toUpperCase(), "info");
  };

  window.markLessonComplete = function() {
    state.courseProgress = Math.min(100, state.courseProgress + 5);
    document.getElementById("dash-progress-text").innerText = state.courseProgress + "%";
    document.getElementById("dash-progress-bar").style.width = state.courseProgress + "%";
    document.getElementById("lms-percent").innerText = state.courseProgress + "%";
    showToast("Tuyệt vời! Đã hoàn thành Lesson 1.2. Tiến độ khóa học tăng lên " + state.courseProgress + "%!", "success");
  };

  window.toggleMockVideo = function(btn) {
    showToast("Đang phát video bài giảng: Describing Trends & Paraphrasing (1080p HD)", "info");
  };

  window.openNewCourseModal = function() {
    document.getElementById("new-course-modal").classList.add("open");
  };
  window.closeNewCourseModal = function() {
    document.getElementById("new-course-modal").classList.remove("open");
  };
  window.saveNewCourse = function() {
    const title = document.getElementById("new-course-title").value || "Khóa học mới";
    closeNewCourseModal();
    showToast("TEACHER DONG: Đã tạo và xuất bản khóa học mới '" + title + "' vào cơ sở dữ liệu MySQL!", "success");
  };

  // --- Initializer on Page Load ---
  window.addEventListener("DOMContentLoaded", () => {
    startTokenTimer();
    startQuizTimer();
    initWatermarkMovement();
    setAppMode("GUEST"); // Default to Guest Home page!

    // Check saved language or browser preference
    let savedLang = "vi";
    try {
      savedLang = localStorage.getItem('td_lang') || "vi";
    } catch(e) {}
    changeLanguage(savedLang);

    console.log("Teacher Dong Academy Public Home + LMS Testbench with 4-Language Mock Test ready.");
  });

})();
</script>
`;
