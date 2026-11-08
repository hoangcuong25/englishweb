module.exports = `
<!-- MODULE 4: WEBRTC LIVE CLASSROOM & WHITEBOARD -->
<section id="tab-classroom" class="tab-pane">
  <!-- Room Header -->
  <div style="background:var(--white); border:1.5px solid var(--line); border-radius:var(--radius); padding:16px 24px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; box-shadow:var(--shadow-sm);">
    <div style="display:flex; align-items:center; gap:14px;">
      <div class="tile t-blue"><svg class="ic"><use href="#i-video"/></svg></div>
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <h3 style="margin:0;">Lớp học LiveKit #101: IELTS Speaking & Whiteboard Practice</h3>
          <span class="badge" style="background:#EF4444; color:#fff; animation:pulse 2s infinite;">LIVE 00:24:18</span>
        </div>
        <p style="color:var(--text-soft); font-size:.85rem; margin:2px 0 0;">SFU Server: WebRTC LiveKit Node • Độ trễ SFU: <strong>42ms</strong> • Sĩ số: 8 người (1 Host + 7 Học viên)</p>
      </div>
    </div>

    <!-- Admin Host Controls Pill -->
    <div id="host-controls-pill" style="display:none; align-items:center; gap:8px; background:#FFF9EB; border:1.5px solid #FCD34D; border-radius:999px; padding:6px 14px;">
      <span style="font-size:.82rem; font-weight:800; color:#b26a00; display:flex; align-items:center; gap:4px;">
        <svg class="ic" style="width:16px; height:16px;"><use href="#i-crown"/></svg>
        HOST QUYỀN HẠN
      </span>
      <button type="button" class="btn btn-sm btn-ghost" onclick="muteAllStudents()" style="padding:3px 10px; font-size:.78rem;">Tắt mic cả lớp</button>
      <button type="button" class="btn btn-sm btn-ghost" onclick="toggleWhiteboardPermission()" id="btn-wb-perm" style="padding:3px 10px; font-size:.78rem;">Cho phép học viên vẽ</button>
    </div>
  </div>

  <!-- Stage: Host Video + 7 Students Grid -->
  <div class="webrtc-stage">
    <!-- Left: Host Video (Teacher Dong) -->
    <div class="host-video-card" id="host-tile">
      <div style="text-align:center; color:#fff;">
        <div style="width:88px; height:88px; border-radius:50%; background:linear-gradient(135deg, var(--secondary), var(--primary)); display:grid; place-items:center; font-size:2rem; font-weight:800; margin:0 auto 12px; box-shadow:0 0 24px rgba(85,184,232,.5); border:3px solid #fff;">
          TD
        </div>
        <h3 style="color:#fff; margin:0 0 4px;">Teacher Dong</h3>
        <span class="badge badge-amber" style="background:#FFB547; color:#153a68; font-weight:800;">
          <svg class="ic" style="width:14px; height:14px;"><use href="#i-crown"/></svg>
          HOST & MASTER INSTRUCTOR
        </span>
      </div>

      <!-- Overlay Status -->
      <div class="video-overlay-info">
        <span style="display:flex; align-items:center; gap:6px;">
          <svg class="ic" style="color:var(--success); width:14px; height:14px;"><use href="#i-mic"/></svg>
          Micro On (Đang nói...)
        </span>
        <span style="color:#38bdf8;">1080p 60fps • 42ms</span>
      </div>
    </div>

    <!-- Right: 7 Students Video Grid -->
    <div class="students-video-grid" id="students-grid">
      <!-- Student 1: Nguyễn Văn An (Current User) -->
      <div class="student-video-card" id="student-tile-an" style="border:2px solid var(--secondary);">
        <div style="text-align:center; color:#fff;">
          <div style="width:44px; height:44px; border-radius:50%; background:#2868b2; display:grid; place-items:center; font-weight:800; margin:0 auto 6px; font-size:1.1rem;">
            AN
          </div>
          <div style="font-size:.82rem; font-weight:700;">Nguyễn Văn An (Bạn)</div>
        </div>
        <div class="video-overlay-info">
          <span style="display:flex; align-items:center; gap:4px;" id="an-mic-indicator">
            <svg class="ic" style="color:var(--success); width:13px; height:13px;"><use href="#i-mic"/></svg>
            Mic
          </span>
          <span id="an-hand-indicator" style="display:none; color:var(--accent);">✋ Giơ tay</span>
        </div>
      </div>

      <!-- Student 2: Trần Thị Mai -->
      <div class="student-video-card">
        <div style="text-align:center; color:#fff;">
          <div style="width:44px; height:44px; border-radius:50%; background:#059669; display:grid; place-items:center; font-weight:800; margin:0 auto 6px; font-size:1.1rem;">TM</div>
          <div style="font-size:.82rem; font-weight:700;">Trần Thị Mai</div>
        </div>
        <div class="video-overlay-info">
          <span style="display:flex; align-items:center; gap:4px;"><svg class="ic" style="color:#ef4444; width:13px; height:13px;"><use href="#i-mic-off"/></svg> Mute</span>
          <span>48ms</span>
        </div>
      </div>

      <!-- Student 3: Lê Quốc Hoàng -->
      <div class="student-video-card">
        <div style="text-align:center; color:#fff;">
          <div style="width:44px; height:44px; border-radius:50%; background:#d97706; display:grid; place-items:center; font-weight:800; margin:0 auto 6px; font-size:1.1rem;">LH</div>
          <div style="font-size:.82rem; font-weight:700;">Lê Quốc Hoàng</div>
        </div>
        <div class="video-overlay-info">
          <span style="display:flex; align-items:center; gap:4px;"><svg class="ic" style="color:var(--success); width:13px; height:13px;"><use href="#i-mic"/></svg> Mic</span>
          <span>52ms</span>
        </div>
      </div>

      <!-- Student 4: Phạm Thu Thảo -->
      <div class="student-video-card">
        <div style="text-align:center; color:#fff;">
          <div style="width:44px; height:44px; border-radius:50%; background:#7c3aed; display:grid; place-items:center; font-weight:800; margin:0 auto 6px; font-size:1.1rem;">PT</div>
          <div style="font-size:.82rem; font-weight:700;">Phạm Thu Thảo</div>
        </div>
        <div class="video-overlay-info">
          <span style="display:flex; align-items:center; gap:4px;"><svg class="ic" style="color:#ef4444; width:13px; height:13px;"><use href="#i-mic-off"/></svg> Mute</span>
          <span>39ms</span>
        </div>
      </div>

      <!-- Student 5: Đỗ Quang Minh -->
      <div class="student-video-card">
        <div style="text-align:center; color:#fff;">
          <div style="width:44px; height:44px; border-radius:50%; background:#0891b2; display:grid; place-items:center; font-weight:800; margin:0 auto 6px; font-size:1.1rem;">DM</div>
          <div style="font-size:.82rem; font-weight:700;">Đỗ Quang Minh</div>
        </div>
        <div class="video-overlay-info">
          <span style="display:flex; align-items:center; gap:4px;"><svg class="ic" style="color:var(--success); width:13px; height:13px;"><use href="#i-mic"/></svg> Mic</span>
          <span>45ms</span>
        </div>
      </div>

      <!-- Student 6: Vũ Thanh Hưng -->
      <div class="student-video-card">
        <div style="text-align:center; color:#fff;">
          <div style="width:44px; height:44px; border-radius:50%; background:#e11d48; display:grid; place-items:center; font-weight:800; margin:0 auto 6px; font-size:1.1rem;">VH</div>
          <div style="font-size:.82rem; font-weight:700;">Vũ Thanh Hưng</div>
        </div>
        <div class="video-overlay-info">
          <span style="display:flex; align-items:center; gap:4px;"><svg class="ic" style="color:#ef4444; width:13px; height:13px;"><use href="#i-mic-off"/></svg> Mute</span>
          <span>60ms</span>
        </div>
      </div>

      <!-- Student 7: Bùi Khánh Linh -->
      <div class="student-video-card">
        <div style="text-align:center; color:#fff;">
          <div style="width:44px; height:44px; border-radius:50%; background:#4b5563; display:grid; place-items:center; font-weight:800; margin:0 auto 6px; font-size:1.1rem;">BL</div>
          <div style="font-size:.82rem; font-weight:700;">Bùi Khánh Linh</div>
        </div>
        <div class="video-overlay-info">
          <span style="display:flex; align-items:center; gap:4px;"><svg class="ic" style="color:var(--success); width:13px; height:13px;"><use href="#i-mic"/></svg> Mic</span>
          <span>50ms</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive WebRTC Controls Bar -->
  <div style="margin-bottom:28px;">
    <div class="webrtc-controls-bar">
      <!-- Mic Button -->
      <button type="button" class="control-circle-btn" id="btn-toggle-mic" onclick="toggleMyMic()" title="Bật/Tắt Microphone">
        <svg class="ic" id="icon-my-mic"><use href="#i-mic"/></svg>
      </button>

      <!-- Cam Button -->
      <button type="button" class="control-circle-btn" id="btn-toggle-cam" onclick="toggleMyCam()" title="Bật/Tắt Camera">
        <svg class="ic" id="icon-my-cam"><use href="#i-video"/></svg>
      </button>

      <!-- Raise Hand Button -->
      <button type="button" class="control-circle-btn" id="btn-toggle-hand" onclick="toggleRaiseHand()" title="Giơ tay phát biểu">
        <svg class="ic"><use href="#i-hand"/></svg>
      </button>

      <!-- Screen Share Button -->
      <button type="button" class="control-circle-btn" id="btn-toggle-screen" onclick="toggleScreenShare()" title="Chia sẻ màn hình">
        <svg class="ic"><use href="#i-screen"/></svg>
      </button>

      <!-- Whiteboard Scroll Button -->
      <button type="button" class="control-circle-btn" onclick="scrollToWhiteboard()" title="Cuộn tới Bảng trắng">
        <svg class="ic"><use href="#i-pen"/></svg>
      </button>

      <!-- Leave Room Button -->
      <button type="button" class="control-circle-btn danger" onclick="showToast('Rời phòng học WebRTC', 'info')" title="Rời phòng">
        <svg class="ic"><use href="#i-close"/></svg>
      </button>
    </div>
  </div>

  <!-- Interactive Collaborative Whiteboard (Tldraw / Canvas Engine) -->
  <div class="card" id="whiteboard-section">
    <div class="card-header" style="flex-wrap:wrap; margin-bottom:12px;">
      <div>
        <span class="badge badge-amber">INTERACTIVE WHITEBOARD</span>
        <h3 style="margin:4px 0 0;">Bảng trắng tương tác thời gian thực (LiveKit DataChannel)</h3>
        <p style="color:var(--text-soft); font-size:.85rem; margin:2px 0 0;">Vẽ, chú thích ngữ pháp, viết từ vựng trực tiếp cùng giảng viên Teacher Dong.</p>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="badge badge-green" id="wb-status-badge">Đồng bộ DataChannel: 42 nét vẽ</span>
        <button type="button" class="btn btn-ghost btn-sm" onclick="clearWhiteboard()">
          <svg class="ic"><use href="#i-clear"/></svg>
          <span>Xóa bảng</span>
        </button>
      </div>
    </div>

    <!-- Whiteboard Container & Canvas -->
    <div class="whiteboard-container">
      <!-- Toolbar -->
      <div class="whiteboard-toolbar">
        <!-- Tools -->
        <div class="tool-group">
          <button type="button" class="wb-btn active" id="tool-pen" onclick="setWbTool('pen')" title="Bút vẽ tự do">
            <svg class="ic"><use href="#i-pen"/></svg>
          </button>
          <button type="button" class="wb-btn" id="tool-highlighter" onclick="setWbTool('highlighter')" title="Bút dạ quang (Highlighter)">
            <svg class="ic"><use href="#i-highlighter"/></svg>
          </button>
          <button type="button" class="wb-btn" id="tool-rect" onclick="setWbTool('rect')" title="Vẽ hình chữ nhật">
            <svg class="ic"><use href="#i-rect"/></svg>
          </button>
          <button type="button" class="wb-btn" id="tool-circle" onclick="setWbTool('circle')" title="Vẽ hình tròn">
            <svg class="ic"><use href="#i-circle"/></svg>
          </button>
          <button type="button" class="wb-btn" id="tool-eraser" onclick="setWbTool('eraser')" title="Tẩy / Xóa nét">
            <svg class="ic"><use href="#i-eraser"/></svg>
          </button>
        </div>

        <!-- Color Palette -->
        <div class="tool-group">
          <span style="font-size:.8rem; font-weight:700; color:var(--text-soft); margin-right:4px;">Màu:</span>
          <div class="color-dot active" style="background:#2868B2;" onclick="setWbColor('#2868B2', this)" title="Teacher Dong Blue"></div>
          <div class="color-dot" style="background:#55B8E8;" onclick="setWbColor('#55B8E8', this)" title="Sky Blue"></div>
          <div class="color-dot" style="background:#FFB547;" onclick="setWbColor('#FFB547', this)" title="Warm Amber"></div>
          <div class="color-dot" style="background:#EF4444;" onclick="setWbColor('#EF4444', this)" title="Coral Red"></div>
          <div class="color-dot" style="background:#26364A;" onclick="setWbColor('#26364A', this)" title="Slate Navy"></div>
        </div>

        <!-- Stroke Width Slider -->
        <div class="tool-group">
          <span style="font-size:.8rem; font-weight:700; color:var(--text-soft);">Cỡ nét:</span>
          <input type="range" id="wb-stroke-size" min="2" max="24" value="4" onchange="setWbSize(this.value)" style="width:90px; cursor:pointer;">
        </div>
      </div>

      <!-- Real HTML5 Drawing Canvas -->
      <canvas id="whiteboard-canvas" width="1280" height="600" style="width:100%; height:460px; display:block; cursor:crosshair; background:#ffffff;"></canvas>
    </div>
  </div>
</section>
`;
