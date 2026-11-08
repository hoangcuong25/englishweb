module.exports = `
<!-- MODULE 3: DIGITAL LIBRARY & SECURE CONTENT PROTECTION -->
<section id="tab-library" class="tab-pane">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
    <div>
      <h2 style="margin:0 0 4px;" data-i18n="lib.title">Kho học liệu số bảo mật (Content Protection)</h2>
      <p style="color:var(--text-soft); margin:0;" data-i18n="lib.subtitle">Bảo vệ tài liệu PDF và Audio bằng Dynamic Watermark, Signed Token 15 phút và chặn tải file gốc.</p>
    </div>
    
    <!-- Token Expiration Countdown Bar -->
    <div style="background:var(--white); border:1.5px solid var(--line); border-radius:999px; padding:6px 16px; display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-sm);">
      <svg class="ic" style="color:var(--primary);"><use href="#i-shield"/></svg>
      <div style="font-size:.85rem; font-weight:700;">
        <span>Token ký số bảo mật: </span>
        <span id="token-countdown" style="color:var(--primary);">14:59</span>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" onclick="refreshToken()" style="padding:4px 10px; font-size:.78rem;">
        <svg class="ic" style="width:12px; height:12px;"><use href="#i-refresh"/></svg>
        <span>Làm mới Token</span>
      </button>
    </div>
  </div>

  <!-- Document & Audio Tabs -->
  <div class="grid-2" style="margin-bottom:24px;">
    <!-- PDF Document Viewer with Dynamic Watermark -->
    <div class="card" style="padding:20px;">
      <div class="card-header" style="margin-bottom:12px;">
        <div>
          <span class="badge badge-blue">TÀI LIỆU PDF BẢO MẬT</span>
          <h3 style="margin:4px 0 0;">IELTS_Writing_Task2_Masterclass_Band_8.pdf</h3>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="testCopyProtection()">
          <svg class="ic"><use href="#i-lock"/></svg>
          <span>Test Chặn Tải / In</span>
        </button>
      </div>

      <!-- PDF Canvas Container with Floating Dynamic Watermark -->
      <div class="pdf-viewer-box" id="pdf-container" oncontextmenu="return false;">
        <div class="pdf-page-mock" id="pdf-page">
          <!-- Dynamic Bouncing Watermark -->
          <div class="dynamic-watermark" id="watermark-element">
            <span id="wm-student-name">Nguyễn Văn An</span> • 
            <span id="wm-student-id">TD-STU-8821</span> • 
            <span>0987***321</span> • 
            <span id="wm-timestamp">2026-11-08 19:30</span>
          </div>

          <!-- Document Mock Content -->
          <div style="border-bottom:2px solid var(--primary); padding-bottom:14px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h2 style="color:var(--primary); margin:0;">Teacher Dong Academy</h2>
              <small style="color:var(--text-soft); font-weight:700;">IELTS ACADEMIC WRITING TASK 2 — ESSAY ARCHITECTURE</small>
            </div>
            <span style="font-weight:700; color:var(--text-soft); font-size:.85rem;">Trang 1 / 14</span>
          </div>

          <h3 style="margin-bottom:10px;">1. Standard 4-Paragraph Essay Structure for Band 8.0+</h3>
          <p style="font-size:.9rem; color:var(--text-soft); line-height:1.7;">
            In order to attain a score of 8.0 or above in Task Achievement and Coherence & Cohesion, candidates must present a lucid and fully developed response with well-structured supporting points.
          </p>

          <div style="background:var(--light-blue); border-left:4px solid var(--primary); padding:12px 16px; border-radius:0 12px 12px 0; margin-bottom:18px;">
            <strong>Paragraph 1: Introduction (2 sentences)</strong>
            <p style="font-size:.88rem; margin:4px 0 0;">
              • Sentence 1: Paraphrase the prompt using academic synonyms.<br>
              • Sentence 2: Clear thesis statement outlining the author's viewpoint and key arguments.
            </p>
          </div>

          <div style="background:#FFF9EB; border-left:4px solid var(--accent); padding:12px 16px; border-radius:0 12px 12px 0; margin-bottom:18px;">
            <strong>Paragraph 2 & 3: Body Paragraphs (PEEL Formula)</strong>
            <p style="font-size:.88rem; margin:4px 0 0;">
              • Point: Topic sentence with clear main idea.<br>
              • Explanation: Substantive elaboration of underlying causes.<br>
              • Example: Tangible illustration or empirical evidence.<br>
              • Link: Concluding sentence tying back to the thesis.
            </p>
          </div>

          <p style="font-size:.8rem; color:#94a3b8; text-align:center; margin-top:30px;">
            — Bản quyền thuộc về Teacher Dong Academy • Không sao chép hoặc phân phối trái phép —
          </p>
        </div>
      </div>
    </div>

    <!-- Audio MP3 Player & Security Rules -->
    <div style="display:flex; flex-direction:column; gap:20px;">
      <!-- Secure Audio Player -->
      <div class="card" style="padding:20px;">
        <div class="card-header" style="margin-bottom:14px;">
          <div>
            <span class="badge badge-amber">FILE AUDIO MP3 BẢO MẬT</span>
            <h3 style="margin:4px 0 0;">IELTS_Listening_Lecture_Cambridge_18_Test_2.mp3</h3>
          </div>
          <span style="font-size:.85rem; color:var(--text-soft); font-weight:700;">Thời lượng: 05:40</span>
        </div>

        <div class="audio-player-card">
          <button type="button" class="btn btn-accent btn-sm" id="audio-play-btn" onclick="toggleAudioMock(this)" style="width:44px; height:44px; border-radius:50%; padding:0;">
            <svg class="ic" id="audio-play-icon" style="width:20px; height:20px;"><use href="#i-play"/></svg>
          </button>
          
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; font-size:.8rem; color:#dbe9f8; margin-bottom:6px;">
              <span id="audio-current-time">01:45</span>
              <span>Giọng đọc bản xứ (UK Academic)</span>
              <span>05:40</span>
            </div>
            <!-- Animated Audio Wave Canvas -->
            <canvas class="audio-wave-canvas" id="audio-visualizer-canvas" width="400" height="48"></canvas>
          </div>
        </div>

        <!-- Audio Speed & Volume Controls -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:14px; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:.85rem; font-weight:600; color:var(--text-soft);">Tốc độ phát:</span>
            <button type="button" class="btn btn-ghost btn-sm speed-btn active" onclick="setAudioSpeed(1.0, this)" style="padding:4px 10px;">1.0x</button>
            <button type="button" class="btn btn-ghost btn-sm speed-btn" onclick="setAudioSpeed(1.25, this)" style="padding:4px 10px;">1.25x</button>
            <button type="button" class="btn btn-ghost btn-sm speed-btn" onclick="setAudioSpeed(1.5, this)" style="padding:4px 10px;">1.5x</button>
          </div>
          <span class="badge badge-green">STREAMING MÃ HÓA</span>
        </div>
      </div>

      <!-- Content Protection Specification Overview Card -->
      <div class="card" style="background:#FAFDFE;">
        <h4 style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <svg class="ic" style="color:var(--primary);"><use href="#i-shield"/></svg>
          <span>Quy chế bảo vệ nội dung số (Digital Content Protection)</span>
        </h4>
        <ul style="display:flex; flex-direction:column; gap:10px; font-size:.88rem; color:var(--text-soft);">
          <li style="display:flex; align-items:flex-start; gap:8px;">
            <svg class="ic" style="color:var(--success); width:18px; height:18px; margin-top:2px;"><use href="#i-check"/></svg>
            <span><strong>Dynamic Watermark:</strong> Tự động nhúng họ tên, mã học viên và SĐT mờ trên toàn bộ trang PDF, vị trí thay đổi liên tục để chống chụp ảnh / quay màn hình.</span>
          </li>
          <li style="display:flex; align-items:flex-start; gap:8px;">
            <svg class="ic" style="color:var(--success); width:18px; height:18px; margin-top:2px;"><use href="#i-check"/></svg>
            <span><strong>Presigned URL 15 phút:</strong> Liên kết truy cập file được cấp token ký số mã hóa, tự động hết hiệu lực sau 15 phút.</span>
          </li>
          <li style="display:flex; align-items:flex-start; gap:8px;">
            <svg class="ic" style="color:var(--success); width:18px; height:18px; margin-top:2px;"><use href="#i-check"/></svg>
            <span><strong>Chặn tải trực tiếp:</strong> Vô hiệu hóa chuột phải, chặn phím tắt Ctrl+S/Ctrl+P, bảo vệ tuyệt đối bản quyền học liệu.</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
`;
