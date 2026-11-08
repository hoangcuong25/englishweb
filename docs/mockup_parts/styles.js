module.exports = `
<style>
/* ==========================================================
   Teacher Dong Academy — Complete Interactive Test Mockup
   Styles & Design System Tokens (Full Public Home + LMS)
   ========================================================== */
:root {
  --primary: #2868B2;
  --primary-dark: #1d4f8c;
  --primary-deep: #153a68;
  --secondary: #55B8E8;
  --accent: #FFB547;
  --accent-dark: #f29f22;
  --bg: #F7FAFE;
  --light-blue: #EAF4FF;
  --text: #26364A;
  --text-soft: #53647a;
  --white: #FFFFFF;
  --line: #d9e6f4;
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;

  --radius-sm: 14px;
  --radius: 20px;
  --radius-lg: 28px;
  --shadow-sm: 0 2px 10px rgba(40, 104, 178, .07);
  --shadow: 0 12px 32px rgba(40, 104, 178, .12);
  --shadow-lg: 0 22px 50px rgba(40, 104, 178, .2);
  --ease: cubic-bezier(.22, .61, .36, 1);
  --font: "Be Vietnam Pro", "Noto Sans SC", "Noto Sans JP", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font);
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}
img, svg { max-width: 100%; display: block; }
h1, h2, h3, h4 { margin: 0 0 .5em; font-weight: 800; letter-spacing: -.015em; line-height: 1.25; color: var(--text); }
h1 { font-size: 2.2rem; }
h2 { font-size: 1.6rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.05rem; }
p { margin: 0 0 .75em; }
ul { list-style: none; margin: 0; padding: 0; }
a { color: var(--primary); text-decoration: none; }
button, input, select, textarea { font-family: inherit; }

/* SVG Icon Helper */
.ic {
  width: 1.25em;
  height: 1.25em;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  display: inline-block;
  vertical-align: middle;
}

/* App Header & Top Bar */
.app-header {
  position: sticky;
  top: 37px;
  z-index: 100;
  background: rgba(247, 250, 254, 0.96);
  backdrop-filter: blur(12px);
  border-bottom: 1.5px solid var(--line);
  padding: 12px 0;
  transition: all .2s;
}
.header-container {
  width: min(1360px, 100% - 32px);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  color: #fff;
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: -.02em;
  box-shadow: 0 4px 14px rgba(40,104,178,.25);
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.brand-text strong {
  font-size: 1.15rem;
  color: var(--text);
}
.brand-text small {
  color: var(--primary);
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  font-size: .68rem;
}

/* Header Controls & Role Switcher */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.role-badge-box {
  display: flex;
  align-items: center;
  background: var(--white);
  border: 1.5px solid var(--line);
  padding: 4px 6px 4px 14px;
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
  gap: 10px;
}
.role-status-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.role-status-text .user-name {
  font-weight: 700;
  font-size: .88rem;
  color: var(--text);
}
.role-status-text .role-title {
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.role-student .role-title { color: var(--primary); }
.role-admin .role-title { color: #b26a00; }

.btn-switch-role {
  border: none;
  background: var(--light-blue);
  color: var(--primary);
  font-weight: 700;
  font-size: .78rem;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all .2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-switch-role:hover {
  background: var(--primary);
  color: #fff;
}

/* Lang Switch */
.lang-box {
  display: flex;
  align-items: center;
  background: var(--white);
  border: 1.5px solid var(--line);
  border-radius: 999px;
  padding: 4px 10px;
  color: var(--primary);
}
.lang-select {
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: .85rem;
  color: var(--text);
  padding: 4px;
  cursor: pointer;
  outline: none;
}

/* Quick Test Simulators Pill */
.btn-sim {
  border: 1px dashed var(--line);
  background: var(--white);
  color: var(--text-soft);
  font-size: .8rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all .2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-sim:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--light-blue);
}

/* Main Tab Navigation Bar */
.module-nav-bar {
  background: var(--white);
  border-bottom: 1.5px solid var(--line);
  padding: 6px 0;
  position: sticky;
  top: 95px;
  z-index: 90;
  box-shadow: 0 4px 16px rgba(40,104,178,.04);
}
.nav-scroll {
  width: min(1360px, 100% - 32px);
  margin-inline: auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 0;
}
.nav-scroll::-webkit-scrollbar { display: none; }
.tab-btn {
  border: none;
  background: transparent;
  color: var(--text-soft);
  font-size: .88rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all .2s var(--ease);
}
.tab-btn:hover {
  background: var(--light-blue);
  color: var(--primary);
}
.tab-btn.active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 12px rgba(40,104,178,.25);
}
.tab-btn .badge-count {
  background: var(--accent);
  color: var(--text);
  font-size: .7rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  margin-left: 2px;
}

/* Content Container */
.main-wrapper {
  width: min(1360px, 100% - 32px);
  margin: 24px auto 60px;
}

/* Cards & Generic Components */
.card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--line);
  box-shadow: var(--shadow-sm);
  padding: 24px;
  transition: transform .25s var(--ease), box-shadow .25s var(--ease);
}
.card:hover {
  box-shadow: var(--shadow);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}
.card-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 800;
}

/* 5 Pillars Specific Styling */
.pillar-block {
  transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s;
}
.pillar-block:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.pillar-sub-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #FAFDFE;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all .2s var(--ease);
  font-size: .88rem;
}
.pillar-sub-item:hover {
  background: var(--light-blue);
  border-color: var(--primary);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(40,104,178,.08);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-size: .92rem;
  padding: 10px 22px;
  border-radius: 999px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all .2s var(--ease);
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-sm {
  padding: 6px 14px;
  font-size: .82rem;
}
.btn-primary {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 6px 16px rgba(40,104,178,.25);
}
.btn-primary:hover {
  background: var(--primary-dark);
}
.btn-accent {
  background: var(--accent);
  color: var(--text);
  box-shadow: 0 6px 16px rgba(255,181,71,.35);
}
.btn-accent:hover {
  background: var(--accent-dark);
}
.btn-ghost {
  background: transparent;
  color: var(--primary);
  border-color: var(--primary);
}
.btn-ghost:hover {
  background: var(--primary);
  color: #fff;
}
.btn-danger {
  background: var(--danger);
  color: #fff;
}
.btn-success {
  background: var(--success);
  color: #fff;
}

/* Tiles & Badges */
.tile {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  flex: none;
}
.tile.t-blue  { background: var(--light-blue); color: var(--primary); }
.tile.t-sky   { background: #DDF3FC; color: #1b83b6; }
.tile.t-amber { background: #FFF0D3; color: #b26a00; }
.tile.t-green { background: #E6F8F0; color: #059669; }
.tile.t-red   { background: #FEE2E2; color: #DC2626; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: .76rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.badge-blue { background: var(--light-blue); color: var(--primary); }
.badge-amber { background: #FFF0D3; color: #b26a00; }
.badge-green { background: #D1FAE5; color: #065F46; }
.badge-red { background: #FEE2E2; color: #991B1B; }

/* Grid Layouts */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* Stat Cards */
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--white);
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--text);
}
.stat-label {
  font-size: .85rem;
  color: var(--text-soft);
  margin-top: 2px;
}

/* Banner Class Alert */
.live-class-banner {
  background: linear-gradient(135deg, var(--primary), var(--primary-deep));
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 24px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}
.live-class-banner::before {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: var(--secondary);
  opacity: .18;
  right: -50px;
  top: -100px;
}
.live-class-info h3 {
  color: #fff;
  margin: 0 0 6px;
}
.live-class-info p {
  color: #dbe9f8;
  margin: 0;
  font-size: .95rem;
}

/* Table Design */
.data-table-wrap {
  overflow-x: auto;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--white);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: .9rem;
}
.data-table th {
  background: #F1F6FC;
  color: var(--text);
  font-weight: 700;
  padding: 12px 16px;
  border-bottom: 1.5px solid var(--line);
}
.data-table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--line);
  color: var(--text);
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover { background: #FAFDFE; }

/* Form Controls */
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-weight: 600;
  font-size: .88rem;
  margin-bottom: 6px;
  color: var(--text);
}
.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--line);
  background: #FAFDFE;
  font-size: .92rem;
  color: var(--text);
  outline: none;
  transition: all .2s;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--primary);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(40,104,178,.15);
}

/* Whiteboard Canvas Styles */
.whiteboard-container {
  border: 2px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  background: #FFFFFF;
  position: relative;
  box-shadow: var(--shadow-sm);
}
.whiteboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #F1F6FC;
  border-bottom: 1.5px solid var(--line);
  gap: 10px;
  flex-wrap: wrap;
}
.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wb-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--text);
  cursor: pointer;
  transition: all .2s;
}
.wb-btn:hover { background: var(--light-blue); color: var(--primary); }
.wb-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--line);
  cursor: pointer;
  transition: transform .2s;
}
.color-dot.active { transform: scale(1.2); box-shadow: 0 0 0 2px var(--primary); }

/* Video Grid for LiveKit WebRTC */
.webrtc-stage {
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.host-video-card {
  background: #111e30;
  border-radius: var(--radius);
  overflow: hidden;
  aspect-ratio: 16 / 9;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  border: 3px solid var(--accent);
}
.students-video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-height: 480px;
  overflow-y: auto;
}
.student-video-card {
  background: #1c2c42;
  border-radius: 14px;
  aspect-ratio: 16 / 10;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(255,255,255,.1);
}
.video-overlay-info {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px);
  padding: 4px 8px;
  border-radius: 8px;
  color: #fff;
  font-size: .75rem;
  font-weight: 600;
}
.webrtc-controls-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--white);
  padding: 12px 24px;
  border-radius: 999px;
  border: 1.5px solid var(--line);
  box-shadow: var(--shadow);
  width: fit-content;
  margin: 0 auto;
}
.control-circle-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1.5px solid var(--line);
  background: #FAFDFE;
  color: var(--text);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all .2s;
}
.control-circle-btn:hover {
  background: var(--light-blue);
  color: var(--primary);
}
.control-circle-btn.muted, .control-circle-btn.danger {
  background: #FEE2E2;
  color: var(--danger);
  border-color: #FCA5A5;
}
.control-circle-btn.active-action {
  background: #FEF3C7;
  color: #b26a00;
  border-color: #FCD34D;
}

/* Dynamic Watermark for Secure PDF */
.pdf-viewer-box {
  background: #475569;
  border-radius: var(--radius);
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 540px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pdf-page-mock {
  width: min(720px, 100%);
  background: #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,.3);
  border-radius: 8px;
  padding: 40px;
  min-height: 600px;
  position: relative;
  overflow: hidden;
  user-select: none;
}
.dynamic-watermark {
  position: absolute;
  pointer-events: none;
  font-size: 1rem;
  font-weight: 800;
  color: rgba(40, 104, 178, 0.18);
  white-space: nowrap;
  transform: rotate(-25deg);
  z-index: 10;
  transition: all 3.5s ease-in-out;
}

/* Audio Player */
.audio-player-card {
  background: linear-gradient(135deg, #1b385e, var(--primary));
  border-radius: var(--radius);
  padding: 20px 26px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow);
}
.audio-wave-canvas {
  flex: 1;
  height: 48px;
  background: rgba(255,255,255,.08);
  border-radius: 10px;
  cursor: pointer;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 38, 61, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: grid;
  place-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity .25s ease;
  padding: 16px;
}
.modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}
.modal-content {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 30px;
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  transform: scale(0.95);
  transition: transform .25s var(--ease);
}
.modal-overlay.open .modal-content {
  transform: scale(1);
}

/* Toast Container */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
}
.toast {
  background: #1e293b;
  color: #fff;
  padding: 12px 20px;
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  font-size: .88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: toastIn .3s var(--ease);
  border-left: 4px solid var(--secondary);
}
.toast.toast-success { border-left-color: var(--success); }
.toast.toast-warning { border-left-color: var(--accent); }
.toast.toast-danger  { border-left-color: var(--danger); }
@keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* Live Chat Widget */
.chat-dock {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 800;
}
.chat-trigger-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: grid;
  place-items: center;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: transform .25s var(--ease);
  position: relative;
}
.chat-trigger-btn:hover { transform: scale(1.08); }
.chat-window {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: min(380px, calc(100vw - 32px));
  height: 520px;
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--line);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 800;
  display: none;
}
.chat-window.open { display: flex; }
.chat-header {
  background: var(--primary);
  color: #fff;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg);
}
.chat-msg {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: .88rem;
  line-height: 1.4;
}
.chat-msg.mine {
  align-self: flex-end;
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.chat-msg.theirs {
  align-self: flex-start;
  background: var(--white);
  color: var(--text);
  border: 1px solid var(--line);
  border-bottom-left-radius: 4px;
}
.chat-footer {
  padding: 10px 14px;
  background: var(--white);
  border-top: 1px solid var(--line);
  display: flex;
  gap: 8px;
}

/* Mock Test Multi-Language & Test Switcher */
.mocktest-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.mocktest-lang-bar {
  display: inline-flex;
  align-items: center;
  background: var(--light-blue);
  border: 1.5px solid var(--line);
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
}
.mocktest-lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: .82rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  transition: all .2s;
}
.mocktest-lang-btn:hover {
  color: var(--primary);
  background: rgba(40,104,178,.08);
}
.mocktest-lang-btn.active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(40,104,178,.25);
}
.mocktest-tabs-nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  margin-bottom: 18px;
  border-bottom: 1.5px solid var(--line);
}
.mocktest-tab-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px 12px 0 0;
  border: 1.5px solid transparent;
  border-bottom: none;
  background: #f4f8fd;
  color: var(--text-soft);
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
.mocktest-tab-item:hover {
  background: #eaf3fd;
  color: var(--primary);
}
.mocktest-tab-item.active {
  background: #fff;
  color: var(--primary);
  border-color: var(--line);
  border-bottom: 2px solid #fff;
  margin-bottom: -1.5px;
  box-shadow: 0 -2px 8px rgba(40,104,178,.06);
}
.vocab-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 6px;
  background: #eef6ff;
  color: var(--primary);
  font-weight: 600;
  font-size: .82rem;
  margin: 2px 4px 2px 0;
  border: 1px solid #cbe1f8;
}
.reading-trans-box {
  display: none;
  background: #fbfdff;
  border: 1.5px dashed var(--line);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-top: 10px;
  font-size: .86rem;
  line-height: 1.6;
  color: var(--text-soft);
}
.reading-trans-box.open {
  display: block;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-home-grid { grid-template-columns: 1fr !important; }
  .consult-grid { grid-template-columns: 1fr !important; }
  .about-dong-grid { grid-template-columns: 1fr !important; text-align: center; }
  .footer-grid { grid-template-columns: 1fr 1fr !important; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .webrtc-stage { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .footer-grid { grid-template-columns: 1fr !important; }
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .students-video-grid { grid-template-columns: 1fr; }
}
</style>
`;
