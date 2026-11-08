module.exports = `
<!-- TOP TESTER SWITCHER BAR (Cho phép kiểm thử mọi trạng thái người dùng) -->
<div style="background:#153a68; color:#dbe9f8; padding:8px 16px; font-size:.82rem; border-bottom:1px solid rgba(255,255,255,.12); position:sticky; top:0; z-index:200;">
  <div style="width:min(1360px, 100% - 32px); margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
    <div style="display:flex; align-items:center; gap:8px;">
      <span class="badge" style="background:var(--accent); color:#153a68; font-weight:800; font-size:.7rem;" data-i18n="tester.badge">KIỂM THỬ TRẢI NGHIỆM</span>
      <span data-i18n="tester.viewingAs">Đang xem ở trạng thái:</span>
      <strong id="tester-current-mode-label" style="color:#fff;" data-i18n="tester.modeGuest">🌐 Khách mới chưa có tài khoản (Trang Home)</strong>
    </div>

    <!-- Mode Quick Buttons -->
    <div style="display:flex; align-items:center; gap:6px;">
      <button type="button" class="btn btn-sm btn-ghost tester-mode-btn active" id="btn-mode-guest" onclick="setAppMode('GUEST')" style="color:#fff; border-color:rgba(255,255,255,.3); padding:3px 12px; font-size:.78rem;" data-i18n="tester.btnGuest">
        🌐 1. Khách mới (Trang Home)
      </button>
      <button type="button" class="btn btn-sm btn-ghost tester-mode-btn" id="btn-mode-student" onclick="setAppMode('STUDENT')" style="color:#fff; border-color:rgba(255,255,255,.3); padding:3px 12px; font-size:.78rem;" data-i18n="tester.btnStudent">
        🎓 2. Học viên đã đăng nhập
      </button>
      <button type="button" class="btn btn-sm btn-ghost tester-mode-btn" id="btn-mode-admin" onclick="setAppMode('ADMIN')" style="color:#fff; border-color:rgba(255,255,255,.3); padding:3px 12px; font-size:.78rem;" data-i18n="tester.btnAdmin">
        👨‍🏫 3. Giảng viên / Admin
      </button>
    </div>
  </div>
</div>

<!-- MAIN APP HEADER -->
<header class="app-header" style="top:37px;">
  <div class="header-container">
    <!-- Brand Logo -->
    <div class="brand" onclick="goToHome()">
      <div class="brand-mark">TD</div>
      <div class="brand-text">
        <strong>Teacher Dong</strong>
        <small>Academy • Learn. Grow. Share. Inspire.</small>
      </div>
    </div>

    <!-- Navigation for GUEST (Khách chưa đăng nhập) -->
    <nav id="guest-nav-links" style="display:flex; align-items:center; gap:8px;">
      <a href="#home-programs-section" class="btn btn-ghost btn-sm" onclick="scrollToPrograms()" data-i18n="nav.programs">5 Trụ cột chương trình</a>
      <a href="#about-teacher-dong" class="btn btn-ghost btn-sm" onclick="scrollToAboutDong()" data-i18n="nav.about">Về Teacher Dong</a>
      <a href="#tech-preview-section" class="btn btn-ghost btn-sm" onclick="scrollToTech()" data-i18n="nav.techPreview">Học thử WebRTC & AI</a>
      <a href="#consultation-section" class="btn btn-ghost btn-sm" onclick="scrollToContact()" data-i18n="nav.consultation">Liên hệ tư vấn</a>
    </nav>

    <!-- Header Actions (Role status, Lang, Auth) -->
    <div class="header-actions">
      <!-- Language Selector -->
      <div class="lang-box">
        <svg class="ic"><use href="#i-globe"/></svg>
        <select class="lang-select" id="lang-select" onchange="changeLanguage(this.value)">
          <option value="vi">🇻🇳 Tiếng Việt</option>
          <option value="en">🇬🇧 English</option>
          <option value="zh">🇨🇳 简体中文</option>
          <option value="ja">🇯🇵 日本語</option>
        </select>
      </div>

      <!-- GUEST BUTTONS (Khi chưa đăng nhập) -->
      <div id="guest-auth-buttons" style="display:flex; align-items:center; gap:8px;">
        <button type="button" class="btn btn-ghost btn-sm" onclick="openLoginModal()" data-i18n="nav.login">
          Đăng nhập
        </button>
        <button type="button" class="btn btn-accent btn-sm" onclick="openRegisterModal()">
          <svg class="ic" style="width:14px; height:14px;"><use href="#i-users"/></svg>
          <span data-i18n="nav.register">Đăng ký học viên</span>
        </button>
      </div>

      <!-- LOGGED-IN CONTROLS (Khi đã đăng nhập Học viên hoặc Admin) -->
      <div id="logged-in-controls" style="display:none; align-items:center; gap:10px;">
        <div class="role-badge-box role-student" id="role-box">
          <span class="tile t-blue" style="width:30px; height:30px; border-radius:50%;" id="role-avatar-tile">
            <svg class="ic" id="role-icon"><use href="#i-users"/></svg>
          </span>
          <div class="role-status-text">
            <span class="user-name" id="user-display-name">Nguyễn Văn An</span>
            <span class="role-title" id="user-role-title">Học viên (STUDENT)</span>
          </div>
          <button type="button" class="btn-switch-role" onclick="toggleRole()" title="Chuyển đổi vai trò">
            <svg class="ic" style="width:14px; height:14px;"><use href="#i-refresh"/></svg>
            <span id="btn-role-label">Đổi sang Admin</span>
          </button>
        </div>

        <!-- Quick Simulators -->
        <button type="button" class="btn-sim" onclick="openSingleSessionModal()" title="Kiểm tra cơ chế chặn đăng nhập đồng thời">
          <svg class="ic" style="color:#d97706;"><use href="#i-lock"/></svg>
          <span>Single Session</span>
        </button>

        <button type="button" class="btn-sim" onclick="openGoogleModal()" title="Google OAuth 2.0">
          <svg class="ic"><use href="#i-google"/></svg>
          <span>Google</span>
        </button>

        <!-- Logout button -->
        <button type="button" class="btn btn-ghost btn-sm" onclick="logoutToGuest()" title="Đăng xuất về Trang Home">
          <svg class="ic"><use href="#i-close"/></svg>
          <span data-i18n="nav.logout">Đăng xuất</span>
        </button>
      </div>
    </div>
  </div>
</header>

<!-- STICKY MODULE TAB NAVIGATION (Hiển thị khi đăng nhập để truy cập 9 phân hệ) -->
<nav class="module-nav-bar" id="app-module-nav" style="display:none; top:95px;">
  <div class="nav-scroll">
    <button type="button" class="tab-btn" data-tab="home" onclick="switchTab('home')">
      <svg class="ic"><use href="#i-sprout"/></svg>
      <span data-i18n="nav.home">🏠 Trang chủ (Home)</span>
    </button>
    <button type="button" class="tab-btn active" data-tab="dashboard" onclick="switchTab('dashboard')">
      <svg class="ic"><use href="#i-chart"/></svg>
      <span data-i18n="nav.dashboard">1. Tổng quan Dashboard</span>
    </button>
    <button type="button" class="tab-btn" data-tab="lms" onclick="switchTab('lms')">
      <svg class="ic"><use href="#i-book"/></svg>
      <span data-i18n="nav.lms">2. Khóa học LMS</span>
    </button>
    <button type="button" class="tab-btn" data-tab="library" onclick="switchTab('library')">
      <svg class="ic"><use href="#i-shield"/></svg>
      <span data-i18n="nav.library">3. Học liệu số & Watermark</span>
    </button>
    <button type="button" class="tab-btn" data-tab="classroom" onclick="switchTab('classroom')">
      <svg class="ic"><use href="#i-video"/></svg>
      <span data-i18n="nav.classroom">4. Lớp học WebRTC & Whiteboard</span>
      <span class="badge-count" style="background:#ef4444; color:#fff;">LIVE</span>
    </button>
    <button type="button" class="tab-btn" data-tab="writing" onclick="switchTab('writing')">
      <svg class="ic"><use href="#i-edit"/></svg>
      <span data-i18n="nav.writing">5. Chấm IELTS Writing AI</span>
    </button>
    <button type="button" class="tab-btn" data-tab="speaking" onclick="switchTab('speaking')">
      <svg class="ic"><use href="#i-mic"/></svg>
      <span data-i18n="nav.speaking">6. IELTS Speaking Studio</span>
    </button>
    <button type="button" class="tab-btn" data-tab="quiz" onclick="switchTab('quiz')">
      <svg class="ic"><use href="#i-clipboard"/></svg>
      <span data-i18n="nav.quiz">7. Thi thử Mock Test & Quiz</span>
    </button>
    <button type="button" class="tab-btn" data-tab="attendance" onclick="switchTab('attendance')">
      <svg class="ic"><use href="#i-clock"/></svg>
      <span data-i18n="nav.attendance">8. Điểm danh tự động & Excel</span>
    </button>
    <button type="button" class="tab-btn" data-tab="chat" onclick="switchTab('chat')">
      <svg class="ic"><use href="#i-chat"/></svg>
      <span data-i18n="nav.chat">9. Nhắn tin trực tuyến</span>
      <span class="badge-count" id="nav-chat-unread">2</span>
    </button>
  </div>
</nav>
`;
