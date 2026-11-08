module.exports = `
<!-- MODULE 6: IELTS SPEAKING STUDIO -->
<section id="tab-speaking" class="tab-pane">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
    <div>
      <h2 style="margin:0 0 4px;" data-i18n="speaking.title">IELTS Speaking Studio (Phòng thu âm & Chấm điểm)</h2>
      <p style="color:var(--text-soft); margin:0;" data-i18n="speaking.subtitle">Thu âm câu trả lời trực tiếp trong trình duyệt. Teacher Dong chấm điểm chi tiết theo 4 tiêu chí và ghim nhận xét theo mốc thời gian.</p>
    </div>
  </div>

  <div class="grid-2">
    <!-- Left Column: Student Speaking Prompt & Voice Recorder -->
    <div class="card">
      <div class="card-header" style="margin-bottom:14px;">
        <div>
          <span class="badge badge-amber">IELTS SPEAKING PART 2</span>
          <h3 style="margin:4px 0 0;">Describe a piece of technology you find difficult to use</h3>
        </div>
      </div>

      <!-- Cue Card Prompt -->
      <div style="background:var(--light-blue); border-left:4px solid var(--primary); padding:14px 18px; border-radius:0 14px 14px 0; margin-bottom:18px;">
        <strong style="color:var(--primary); display:block; margin-bottom:6px;">You should say:</strong>
        <p style="font-size:.88rem; margin:0; line-height:1.6;">
          • What the technology is and what it is used for<br>
          • When and where you encountered or used it<br>
          • Why you find it complicated or confusing to operate<br>
          • And explain how you feel about relying on this technology
        </p>
      </div>

      <!-- Live Web Audio Waveform Canvas Recorder -->
      <div style="background:#111e30; border-radius:var(--radius); padding:24px; text-align:center; color:#fff; margin-bottom:18px;">
        <div style="font-size:.85rem; color:#94a3b8; margin-bottom:6px;">TRẠNG THÁI PHÒNG THU ÂM</div>
        <div style="font-size:2rem; font-weight:800; font-family:monospace; margin-bottom:12px;" id="record-timer">00:00</div>

        <!-- Oscillating Audio Frequency Canvas -->
        <canvas id="speaking-record-canvas" width="480" height="70" style="width:100%; height:70px; background:rgba(255,255,255,.05); border-radius:12px; margin-bottom:18px; display:block;"></canvas>

        <!-- Recording Buttons -->
        <div style="display:flex; justify-content:center; align-items:center; gap:14px;">
          <!-- Record / Stop Button -->
          <button type="button" class="btn btn-danger" id="btn-toggle-record" onclick="toggleAudioRecording()">
            <svg class="ic" id="icon-record-state"><use href="#i-mic"/></svg>
            <span id="label-record-state">Bắt đầu thu âm</span>
          </button>

          <!-- Playback Recorded Audio Button -->
          <button type="button" class="btn btn-ghost" id="btn-playback-recording" onclick="playbackRecording()" style="color:#fff; border-color:rgba(255,255,255,.3);" disabled>
            <svg class="ic"><use href="#i-play"/></svg>
            <span>Nghe lại</span>
          </button>
        </div>
      </div>

      <!-- Submission Button -->
      <button type="button" class="btn btn-primary" id="btn-submit-speaking" onclick="submitSpeakingAudio()" style="width:100%; justify-content:center;">
        <svg class="ic"><use href="#i-send"/></svg>
        <span>Nộp bản ghi âm cho Teacher Dong chấm điểm</span>
      </button>
    </div>

    <!-- Right Column: Admin Timestamp Grading Studio & Criteria Scoring -->
    <div class="card" id="speaking-grading-panel">
      <div class="card-header" style="margin-bottom:14px;">
        <div>
          <span class="badge badge-green">STUDIO CHẤM BÀI CỦA TEACHER DONG</span>
          <h3 style="margin:4px 0 0;">Đánh giá bản ghi âm: Nguyễn Văn An</h3>
        </div>
        <div style="text-align:right;">
          <div style="font-size:.78rem; font-weight:700; color:var(--text-soft);">OVERALL BAND</div>
          <div style="font-size:2rem; font-weight:800; color:var(--primary); line-height:1;" id="speaking-overall-band">7.5</div>
        </div>
      </div>

      <!-- Audio Player with Waveform Scrubber & Skip Controls -->
      <div style="background:#F1F6FC; border-radius:var(--radius-sm); padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-ghost btn-sm" onclick="skipAudio(-5)" title="Lùi 5 giây" style="padding:4px 10px;">-5s</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-play-grade-audio" onclick="toggleGradingAudioPlay()" style="padding:4px 14px;">
              <svg class="ic"><use href="#i-play"/></svg>
              <span>Phát audio</span>
            </button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="skipAudio(5)" title="Tiến 5 giây" style="padding:4px 10px;">+5s</button>
          </div>
          <span style="font-size:.85rem; font-weight:700; color:var(--primary);" id="grading-audio-time">00:45 / 01:52</span>
        </div>

        <!-- Interactive Scrubber Timeline with Timestamp Pins -->
        <div style="position:relative; height:24px; background:#d9e6f4; border-radius:999px; cursor:pointer;" onclick="clickTimelineScrub(event)">
          <div id="timeline-progress-bar" style="width:40%; height:100%; background:var(--primary); border-radius:999px;"></div>
          <!-- Sample Timestamp Pin Markers -->
          <div style="position:absolute; left:20%; top:-4px; width:12px; height:32px; background:var(--accent); border-radius:4px; box-shadow:0 2px 6px rgba(0,0,0,.2);" title="Timestamp @00:22"></div>
          <div style="position:absolute; left:50%; top:-4px; width:12px; height:32px; background:var(--accent); border-radius:4px; box-shadow:0 2px 6px rgba(0,0,0,.2);" title="Timestamp @00:56"></div>
        </div>
      </div>

      <!-- Timestamped Comments List -->
      <div style="margin-bottom:16px;">
        <label style="font-weight:700; font-size:.88rem; display:block; margin-bottom:8px;">Nhận xét chi tiết tại các mốc thời gian (Timestamp Comments):</label>
        <div style="display:flex; flex-direction:column; gap:8px;" id="timestamp-comments-list">
          <div style="background:var(--bg); border:1px solid var(--line); border-radius:10px; padding:10px 14px; display:flex; align-items:flex-start; gap:10px;">
            <span class="badge badge-amber" style="cursor:pointer;" onclick="seekAudioTime(22)">@00:22</span>
            <div style="font-size:.85rem; flex:1;">
              <strong>Phát âm mở bài:</strong> "Mở bài trôi chảy, ngữ điệu tự nhiên khi giới thiệu chiếc máy ảnh cổ điển."
            </div>
          </div>
          <div style="background:var(--bg); border:1px solid var(--line); border-radius:10px; padding:10px 14px; display:flex; align-items:flex-start; gap:10px;">
            <span class="badge badge-amber" style="cursor:pointer;" onclick="seekAudioTime(56)">@00:56</span>
            <div style="font-size:.85rem; flex:1;">
              <strong>Trọng âm từ:</strong> "Lưu ý trọng âm từ <em>'sophisticated'</em> rơi vào âm tiết thứ hai."
            </div>
          </div>
        </div>
      </div>

      <!-- 4 IELTS Speaking Criteria Scoring Sliders -->
      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
        <!-- Fluency & Coherence -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:.85rem; font-weight:700; margin-bottom:2px;">
            <span>1. Fluency and Coherence (Độ trôi chảy)</span>
            <span style="color:var(--primary);" id="val-fc">7.5</span>
          </div>
          <input type="range" min="4.0" max="9.0" step="0.5" value="7.5" oninput="updateSpeakingScore('fc', this.value)" style="width:100%; cursor:pointer;">
        </div>

        <!-- Lexical Resource -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:.85rem; font-weight:700; margin-bottom:2px;">
            <span>2. Lexical Resource (Từ vựng học thuật)</span>
            <span style="color:var(--primary);" id="val-lr">7.0</span>
          </div>
          <input type="range" min="4.0" max="9.0" step="0.5" value="7.0" oninput="updateSpeakingScore('lr', this.value)" style="width:100%; cursor:pointer;">
        </div>

        <!-- Grammatical Range -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:.85rem; font-weight:700; margin-bottom:2px;">
            <span>3. Grammatical Range and Accuracy</span>
            <span style="color:var(--primary);" id="val-gra">7.5</span>
          </div>
          <input type="range" min="4.0" max="9.0" step="0.5" value="7.5" oninput="updateSpeakingScore('gra', this.value)" style="width:100%; cursor:pointer;">
        </div>

        <!-- Pronunciation -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:.85rem; font-weight:700; margin-bottom:2px;">
            <span>4. Pronunciation (Phát âm & Ngữ điệu)</span>
            <span style="color:var(--primary);" id="val-pr">7.0</span>
          </div>
          <input type="range" min="4.0" max="9.0" step="0.5" value="7.0" oninput="updateSpeakingScore('pr', this.value)" style="width:100%; cursor:pointer;">
        </div>
      </div>

      <!-- Publish Action -->
      <button type="button" class="btn btn-accent" onclick="publishSpeakingFeedback()" style="width:100%; justify-content:center;">
        <svg class="ic"><use href="#i-check"/></svg>
        <span>Lưu & Công bố kết quả chấm cho học viên</span>
      </button>
    </div>
  </div>
</section>
`;
