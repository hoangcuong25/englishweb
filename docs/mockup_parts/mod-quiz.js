module.exports = `
<!-- MODULE 7: INTERACTIVE MOCK TEST & QUIZ ENGINE -->
<section id="tab-quiz" class="tab-pane">
  <!-- Top Mock Test Header & Multi-Language Quick Bar -->
  <div class="mocktest-header-bar">
    <div>
      <div style="display:inline-flex; align-items:center; gap:8px; background:var(--light-blue); color:var(--primary); padding:4px 14px; border-radius:999px; font-size:.76rem; font-weight:800; text-transform:uppercase; margin-bottom:6px;">
        <svg class="ic" style="width:14px; height:14px;"><use href="#i-clipboard"/></svg>
        <span data-i18n="quiz.engineTag">EdTech In-house Testing Suite</span>
      </div>
      <h2 style="margin:0 0 4px;" data-i18n="quiz.title">Hệ thống bài thi thử & Trắc nghiệm (Mock Test & Quiz Engine)</h2>
      <p style="color:var(--text-soft); margin:0;" data-i18n="quiz.subtitle">Hỗ trợ 4 ngôn ngữ (Anh, Trung, Việt, Nhật), mô phỏng kỳ thi IELTS & Business English chuẩn quốc tế. Chấm điểm tức thì, giải thích chi tiết và tự động mở khóa bài học.</p>
    </div>

    <!-- 4 Languages Quick Switcher Bar & Live Countdown Timer -->
    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
      <!-- Language Quick Switcher -->
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:.8rem; font-weight:700; color:var(--text-soft);" data-i18n="quiz.langSelectLabel">Ngôn ngữ bài thi:</span>
        <div class="mocktest-lang-bar">
          <button type="button" class="mocktest-lang-btn active" data-lang="vi" onclick="changeLanguage('vi')">🇻🇳 Tiếng Việt</button>
          <button type="button" class="mocktest-lang-btn" data-lang="en" onclick="changeLanguage('en')">🇬🇧 English</button>
          <button type="button" class="mocktest-lang-btn" data-lang="zh" onclick="changeLanguage('zh')">🇨🇳 简体中文</button>
          <button type="button" class="mocktest-lang-btn" data-lang="ja" onclick="changeLanguage('ja')">🇯🇵 日本語</button>
        </div>
      </div>

      <!-- Live Countdown Timer -->
      <div style="background:var(--white); border:1.5px solid var(--line); border-radius:999px; padding:5px 16px; display:inline-flex; align-items:center; gap:10px; box-shadow:var(--shadow-sm);">
        <svg class="ic" style="color:#ef4444; width:16px; height:16px;"><use href="#i-clock"/></svg>
        <span style="font-size:.82rem; font-weight:700;" data-i18n="quiz.timeLeftLabel">Thời gian còn:</span>
        <span id="quiz-countdown" style="font-size:1.15rem; font-weight:800; color:#ef4444; font-variant-numeric:tabular-nums;">09:45</span>
        <button type="button" class="btn btn-ghost btn-sm" onclick="toggleQuizTimer()" id="btn-quiz-timer-toggle" style="padding:2px 8px; font-size:.75rem;" data-i18n="quiz.timerPause">Tạm dừng</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="resetQuizTimer()" style="padding:2px 8px; font-size:.75rem;" data-i18n="quiz.timerReset">Đặt lại</button>
      </div>
    </div>
  </div>

  <!-- Mock Test Navigation Tabs (Cho phép đổi giữa 3 bộ đề thi thử) -->
  <div class="mocktest-tabs-nav">
    <button type="button" class="mocktest-tab-item active" id="tab-btn-mtest1" onclick="switchMockTest(1)">
      <svg class="ic" style="width:16px; height:16px;"><use href="#i-book"/></svg>
      <span data-i18n="quiz.tab1">📘 Mock Test 1: IELTS Reading & Từ vựng</span>
    </button>
    <button type="button" class="mocktest-tab-item" id="tab-btn-mtest2" onclick="switchMockTest(2)">
      <svg class="ic" style="width:16px; height:16px;"><use href="#i-mic"/></svg>
      <span data-i18n="quiz.tab2">🎧 Mock Test 2: IELTS Listening & Hội thoại</span>
    </button>
    <button type="button" class="mocktest-tab-item" id="tab-btn-mtest3" onclick="switchMockTest(3)">
      <svg class="ic" style="width:16px; height:16px;"><use href="#i-chart"/></svg>
      <span data-i18n="quiz.tab3">💼 Mock Test 3: Business English & Đàm phán</span>
    </button>
  </div>

  <div class="grid-2">
    <!-- LEFT COLUMN: MOCK TEST QUESTIONS -->
    <div>
      <!-- TEST 1 PANE (IELTS Reading & Lexicon) -->
      <div class="card" id="mtest-pane-1" style="display:block;">
        <div class="card-header" style="margin-bottom:14px;">
          <div>
            <span class="badge badge-blue" data-i18n="quiz.t1Badge">IELTS ACADEMIC MOCK TEST #1</span>
            <h3 style="margin:4px 0 0;" data-i18n="quiz.t1Heading">Reading Comprehension & Lexical Cohesion</h3>
          </div>
          <span class="badge badge-amber" data-i18n="quiz.threshold">3 CÂU HỎI • ĐẠT: &ge; 80%</span>
        </div>

        <!-- Reading Excerpt Box with Bilingual Assistant & Vocabulary Chips -->
        <div style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:16px; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <strong style="color:var(--text); font-size:.9rem;" data-i18n="quiz.readingTitle">Đoạn văn đọc hiểu (Reading Extract):</strong>
            <button type="button" class="btn btn-ghost btn-sm" onclick="toggleReadingTranslation()" style="padding:3px 10px; font-size:.78rem; border:1px solid var(--line);">
              <svg class="ic" style="width:14px; height:14px;"><use href="#i-globe"/></svg>
              <span data-i18n="quiz.readingTransToggle">Bản dịch & Phân tích ngữ cảnh</span>
            </button>
          </div>

          <div style="font-size:.88rem; line-height:1.65; color:var(--text-soft); font-style:italic; background:#fff; padding:12px; border-radius:8px; border:1px solid var(--line); margin-bottom:10px;">
            "The cognitive faculty known as working memory plays a pivotal role in language assimilation. Recent neuroimaging investigations elucidate that individuals with elevated working memory capacity demonstrate superior grammatical discernment and enhanced lexical recall under cognitive strain."
          </div>

          <!-- Bilingual Reference Translation Assistant -->
          <div class="reading-trans-box" id="reading-trans-box">
            <strong style="color:var(--primary); display:block; margin-bottom:4px;" data-i18n="quiz.readingTransHeading">📖 Bản dịch tham khảo ngữ cảnh:</strong>
            <span data-i18n="quiz.readingTransText">« Khả năng nhận thức được gọi là trí nhớ làm việc (working memory) đóng vai trò then chốt trong việc tiếp thu ngôn ngữ. Các nghiên cứu chẩn đoán hình ảnh thần kinh gần đây làm sáng tỏ rằng những cá nhân có dung lượng trí nhớ làm việc cao thể hiện khả năng nhận thức ngữ pháp vượt trội và ghi nhớ từ vựng nâng cao khi chịu áp lực nhận thức. »</span>
          </div>

          <!-- Key Academic Vocabulary Chips -->
          <div style="margin-top:10px; display:flex; flex-wrap:wrap; align-items:center; gap:4px;">
            <span style="font-size:.75rem; font-weight:700; color:var(--text-soft); margin-right:4px;" data-i18n="quiz.vocabLabel">Từ vựng học thuật C1:</span>
            <span class="vocab-chip" title="Năng lực nhận thức">cognitive faculty</span>
            <span class="vocab-chip" title="Vai trò then chốt">pivotal role</span>
            <span class="vocab-chip" title="Tiếp thu ngôn ngữ">language assimilation</span>
            <span class="vocab-chip" title="Nhận thức ngữ pháp">grammatical discernment</span>
            <span class="vocab-chip" title="Truy xuất từ vựng">lexical recall</span>
          </div>
        </div>

        <!-- Question 1: Single Choice (Radio) -->
        <div style="border-bottom:1.5px solid var(--line); padding-bottom:18px; margin-bottom:18px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-blue" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">1</span>
            <span data-i18n="quiz.q1Prompt">(Chọn một đáp án) Theo đoạn trích, vai trò của trí nhớ làm việc (working memory) là gì?</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:.88rem; padding-left:32px;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="radio" name="mtest1_q1" value="A">
              <span data-i18n="quiz.q1OptA">A. Thay thế hoàn toàn cơ chế lưu trữ dài hạn trong não bộ</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="radio" name="mtest1_q1" value="B" id="q1-correct">
              <span data-i18n="quiz.q1OptB">B. Đóng vai trò then chốt trong việc tiếp thu ngôn ngữ và nhận thức ngữ pháp</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="radio" name="mtest1_q1" value="C">
              <span data-i18n="quiz.q1OptC">C. Gây cản trở khả năng truy xuất từ vựng trong điều kiện căng thẳng</span>
            </label>
          </div>
        </div>

        <!-- Question 2: Multiple Choice (Checkboxes) -->
        <div style="border-bottom:1.5px solid var(--line); padding-bottom:18px; margin-bottom:18px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-sky" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">2</span>
            <span data-i18n="quiz.q2Prompt">(Chọn 2 đáp án) Hai đặc điểm nào sau đây gắn liền với người có dung lượng trí nhớ làm việc cao?</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:.88rem; padding-left:32px;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" name="mtest1_q2" value="A" id="q2-optA">
              <span data-i18n="quiz.q2OptA">A. Khả năng nhận thức ngữ pháp vượt trội</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" name="mtest1_q2" value="B">
              <span data-i18n="quiz.q2OptB">B. Triệt tiêu hoàn toàn sự can thiệp từ tiếng mẹ đẻ</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" name="mtest1_q2" value="C" id="q2-optC">
              <span data-i18n="quiz.q2OptC">C. Khả năng gợi nhớ từ vựng nâng cao khi chịu áp lực nhận thức</span>
            </label>
          </div>
        </div>

        <!-- Question 3: Fill in the Blank (Input) -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-amber" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">3</span>
            <span data-i18n="quiz.q3Prompt">(Điền từ khuyết) Điền từ chính xác từ đoạn trích vào chỗ trống:</span>
          </div>
          <p style="font-size:.88rem; margin:0 0 8px 32px; line-height:1.7;">
            <span data-i18n="quiz.q3Prefix">« Recent neuroimaging investigations elucidate that individuals demonstrate superior </span>
            <input type="text" id="q3-blank" placeholder="Nhập từ chính xác..." data-i18n-ph="quiz.q3Placeholder" style="padding:5px 12px; border-radius:8px; border:1.5px solid var(--line); width:170px; font-weight:700; color:var(--primary); outline:none;">
            <span data-i18n="quiz.q3Suffix"> discernment. »</span>
          </p>
          <small style="color:var(--text-soft); display:block; margin-left:32px;" data-i18n="quiz.q3Hint">Gợi ý: Tính từ bắt đầu bằng chữ "g..." (nghĩa: grammatical)</small>
        </div>
      </div>

      <!-- TEST 2 PANE (IELTS Listening & Dialogue) -->
      <div class="card" id="mtest-pane-2" style="display:none;">
        <div class="card-header" style="margin-bottom:14px;">
          <div>
            <span class="badge badge-blue" data-i18n="quiz.t2Badge">IELTS LISTENING MOCK TEST #2</span>
            <h3 style="margin:4px 0 0;" data-i18n="quiz.t2Heading">Academic Lecture: Renewable Microgrids & Energy Transition</h3>
          </div>
          <span class="badge badge-amber" data-i18n="quiz.threshold">3 CÂU HỎI • ĐẠT: &ge; 80%</span>
        </div>

        <!-- Audio Simulation Player Box -->
        <div style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:16px; margin-bottom:18px;">
          <strong style="color:var(--text); font-size:.9rem; display:block; margin-bottom:8px;" data-i18n="quiz.t2AudioTitle">Trình phát audio hội thoại bài nghe:</strong>
          <div style="display:flex; align-items:center; gap:14px; background:#fff; padding:12px 16px; border-radius:12px; border:1px solid var(--line);">
            <button type="button" class="btn btn-accent btn-sm" id="mtest2-audio-btn" onclick="toggleMockAudio(this)" style="width:38px; height:38px; border-radius:50%; padding:0; justify-content:center;">
              <svg class="ic" style="width:16px; height:16px;"><use href="#i-play"/></svg>
            </button>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; font-size:.78rem; font-weight:700; color:var(--text-soft); margin-bottom:4px;">
                <span data-i18n="quiz.t2AudioTrack">Lecture 04: Microgrid Decentralization.mp3</span>
                <span>01:24 / 03:45</span>
              </div>
              <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
                <div style="width:38%; height:100%; background:var(--primary); border-radius:3px;"></div>
              </div>
            </div>
          </div>
          <div style="margin-top:10px; font-size:.84rem; color:var(--text-soft); line-height:1.5;" data-i18n="quiz.t2TranscriptExcerpt">
            <em>Tóm tắt đoạn nghe: Giáo sư Smith nhấn mạnh việc tích hợp năng lượng mặt trời cục bộ đòi hỏi giải pháp lưu trữ pin (battery storage) để giải quyết tính không liên tục của phụ tải.</em>
          </div>
        </div>

        <!-- T2 Question 1 -->
        <div style="border-bottom:1.5px solid var(--line); padding-bottom:18px; margin-bottom:18px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-blue" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">1</span>
            <span data-i18n="quiz.t2q1Prompt">(Chọn một) Theo bài giảng, thách thức lớn nhất của năng lượng tái tạo phân tán là gì?</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:.88rem; padding-left:32px;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="radio" name="mtest2_q1" value="A" id="t2q1-correct">
              <span data-i18n="quiz.t2q1OptA">A. Tính bất ổn định và thiếu khả năng lưu trữ liên tục (intermittency)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="radio" name="mtest2_q1" value="B">
              <span data-i18n="quiz.t2q1OptB">B. Chi phí bảo trì đường dây tải điện cao áp</span>
            </label>
          </div>
        </div>

        <!-- T2 Question 2 -->
        <div style="border-bottom:1.5px solid var(--line); padding-bottom:18px; margin-bottom:18px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-sky" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">2</span>
            <span data-i18n="quiz.t2q2Prompt">(Chọn 2 đáp án) Hai giải pháp công nghệ nào được Giáo sư khuyến nghị?</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:.88rem; padding-left:32px;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" name="mtest2_q2" value="A" id="t2q2-optA">
              <span data-i18n="quiz.t2q2OptA">A. Hệ thống pin lưu trữ phân tán (Battery Energy Storage)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" name="mtest2_q2" value="B" id="t2q2-optB">
              <span data-i18n="quiz.t2q2OptB">B. Thuật toán điều phối phụ tải thông minh theo thời gian thực</span>
            </label>
          </div>
        </div>

        <!-- T2 Question 3 -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-amber" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">3</span>
            <span data-i18n="quiz.t2q3Prompt">(Điền từ khuyết) Điền thuật ngữ tiếng Anh thích hợp:</span>
          </div>
          <p style="font-size:.88rem; margin:0 0 8px 32px; line-height:1.7;">
            <span data-i18n="quiz.t2q3Prefix">« The decentralized grid heavily relies on </span>
            <input type="text" id="t2q3-blank" placeholder="Nhập từ chính xác..." data-i18n-ph="quiz.q3Placeholder" style="padding:5px 12px; border-radius:8px; border:1.5px solid var(--line); width:170px; font-weight:700; color:var(--primary); outline:none;">
            <span data-i18n="quiz.t2q3Suffix"> storage solutions to stabilize peak loads. »</span>
          </p>
          <small style="color:var(--text-soft); display:block; margin-left:32px;" data-i18n="quiz.t2q3Hint">Gợi ý: Từ bắt đầu bằng "b..." (nghĩa: battery)</small>
        </div>
      </div>

      <!-- TEST 3 PANE (Business English & Negotiation) -->
      <div class="card" id="mtest-pane-3" style="display:none;">
        <div class="card-header" style="margin-bottom:14px;">
          <div>
            <span class="badge badge-blue" data-i18n="quiz.t3Badge">BUSINESS ENGLISH MOCK TEST #3</span>
            <h3 style="margin:4px 0 0;" data-i18n="quiz.t3Heading">Service Level Agreement (SLA) & Contract Governance</h3>
          </div>
          <span class="badge badge-amber" data-i18n="quiz.threshold">3 CÂU HỎI • ĐẠT: &ge; 80%</span>
        </div>

        <div style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:16px; margin-bottom:18px;">
          <strong style="color:var(--text); font-size:.9rem; display:block; margin-bottom:6px;" data-i18n="quiz.t3ContractTitle">Điều khoản hợp đồng SLA quốc tế mẫu:</strong>
          <div style="font-size:.86rem; line-height:1.6; color:var(--text-soft); font-family:monospace; background:#fff; padding:12px; border-radius:8px; border:1px solid var(--line);">
            "Section 8.4: In the event of system downtime exceeding 0.05% monthly, the Provider shall issue a 10% service credit. All disputes arising shall be settled via binding arbitration administered in Singapore."
          </div>
        </div>

        <!-- T3 Question 1 -->
        <div style="border-bottom:1.5px solid var(--line); padding-bottom:18px; margin-bottom:18px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-blue" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">1</span>
            <span data-i18n="quiz.t3q1Prompt">(Chọn một) Theo điều khoản 8.4, chế tài bồi thường được áp dụng là gì?</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:.88rem; padding-left:32px;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="radio" name="mtest3_q1" value="A" id="t3q1-correct">
              <span data-i18n="quiz.t3q1OptA">A. Hoàn trả tín dụng dịch vụ 10% (10% service credit)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="radio" name="mtest3_q1" value="B">
              <span data-i18n="quiz.t3q1OptB">B. Hủy bỏ ngay lập tức toàn bộ hợp đồng mà không báo trước</span>
            </label>
          </div>
        </div>

        <!-- T3 Question 2 -->
        <div style="border-bottom:1.5px solid var(--line); padding-bottom:18px; margin-bottom:18px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-sky" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">2</span>
            <span data-i18n="quiz.t3q2Prompt">(Chọn 2 đáp án) Hai yếu tố pháp lý bắt buộc trong điều khoản tranh chấp là gì?</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:.88rem; padding-left:32px;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" name="mtest3_q2" value="A" id="t3q2-optA">
              <span data-i18n="quiz.t3q2OptA">A. Trọng tài có giá trị ràng buộc (Binding arbitration)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" name="mtest3_q2" value="B" id="t3q2-optB">
              <span data-i18n="quiz.t3q2OptB">B. Địa điểm phân xử tài phán tại Singapore</span>
            </label>
          </div>
        </div>

        <!-- T3 Question 3 -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:flex-start; gap:8px;">
            <span class="tile t-amber" style="width:24px; height:24px; font-size:.78rem; flex-shrink:0;">3</span>
            <span data-i18n="quiz.t3q3Prompt">(Điền từ khuyết) Điền từ pháp lý thích hợp:</span>
          </div>
          <p style="font-size:.88rem; margin:0 0 8px 32px; line-height:1.7;">
            <span data-i18n="quiz.t3q3Prefix">« All disputes shall be settled via binding </span>
            <input type="text" id="t3q3-blank" placeholder="Nhập từ chính xác..." data-i18n-ph="quiz.q3Placeholder" style="padding:5px 12px; border-radius:8px; border:1.5px solid var(--line); width:170px; font-weight:700; color:var(--primary); outline:none;">
            <span data-i18n="quiz.t3q3Suffix"> administered in Singapore. »</span>
          </p>
          <small style="color:var(--text-soft); display:block; margin-left:32px;" data-i18n="quiz.t3q3Hint">Gợi ý: Từ bắt đầu bằng "a..." (nghĩa: arbitration)</small>
        </div>
      </div>

      <!-- Action Buttons Bar -->
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
        <button type="button" class="btn btn-primary" onclick="submitQuiz()" style="flex:1; justify-content:center;">
          <svg class="ic"><use href="#i-check"/></svg>
          <span data-i18n="quiz.submitBtn">Nộp bài & Chấm điểm tự động</span>
        </button>
        <button type="button" class="btn btn-ghost" onclick="resetCurrentQuiz()" style="border:1.5px solid var(--line);">
          <svg class="ic"><use href="#i-refresh"/></svg>
          <span data-i18n="quiz.resetBtn">Làm lại bài thi</span>
        </button>
      </div>
    </div>

    <!-- RIGHT COLUMN: INSTANT EVALUATION & COMPREHENSIVE EXPLANATIONS -->
    <div class="card" id="quiz-result-panel">
      <div class="card-header">
        <h3 class="card-title">
          <svg class="ic" style="color:var(--primary);"><use href="#i-clipboard"/></svg>
          <span data-i18n="quiz.resultCardTitle">Kết quả đánh giá tức thì</span>
        </h3>
        <span class="badge badge-blue" id="quiz-status-badge" data-i18n="quiz.badgePending">CHỜ NỘP BÀI</span>
      </div>

      <!-- Score & Band Score Display -->
      <div style="text-align:center; padding:18px 0; border-bottom:1.5px solid var(--line); margin-bottom:18px;">
        <div style="font-size:3.2rem; font-weight:800; color:var(--primary); line-height:1; font-variant-numeric:tabular-nums;" id="quiz-score-display">-- / 100</div>
        <div style="display:inline-block; margin-top:8px;">
          <span class="badge badge-sky" id="quiz-band-display" style="font-size:.85rem; padding:4px 14px;" data-i18n="quiz.bandPending">IELTS Band: Chưa chấm • CEFR: --</span>
        </div>
        <div style="font-size:1.05rem; font-weight:700; margin-top:10px;" id="quiz-verdict-title" data-i18n="quiz.initialVerdictTitle">Vui lòng hoàn thành các câu hỏi bên trái</div>
        <p style="color:var(--text-soft); font-size:.86rem; margin:4px 0 0;" id="quiz-verdict-desc" data-i18n="quiz.initialVerdictDesc">Hệ thống yêu cầu &ge; 80% để mở khóa bài học kế tiếp.</p>
      </div>

      <!-- Unlock Next Lesson Alert -->
      <div id="quiz-unlock-box" style="display:none; background:#ECFDF5; border:1.5px solid #A7F3D0; border-radius:var(--radius-sm); padding:16px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:10px; color:#065F46; font-weight:700; margin-bottom:4px;">
          <svg class="ic" style="color:var(--success);"><use href="#i-check"/></svg>
          <span data-i18n="quiz.congratsTitle">CHÚC MỪNG! BẠN ĐÃ ĐẠT TIÊU CHUẨN</span>
        </div>
        <p style="color:#047857; font-size:.85rem; margin:0 0 10px;" data-i18n="quiz.unlockDesc">
          Bài học tiếp theo <strong>"Unit 5: Complex Argumentation in IELTS Writing"</strong> đã được tự động mở khóa.
        </p>
        <button type="button" class="btn btn-success btn-sm" onclick="switchTab('lms')" data-i18n="quiz.nextLessonBtn">Chuyển tới bài học mới</button>
      </div>

      <!-- Answer Explanations -->
      <div id="quiz-explanation-box" style="display:none;">
        <h4 style="margin-bottom:10px; display:flex; align-items:center; gap:6px;">
          <svg class="ic" style="color:var(--primary);"><use href="#i-sprout"/></svg>
          <span data-i18n="quiz.explanationTitle">Giải thích chi tiết đáp án:</span>
        </h4>
        <div style="display:flex; flex-direction:column; gap:10px; font-size:.85rem; color:var(--text-soft); line-height:1.55;" id="quiz-explanation-content">
          <div style="background:#f8fafc; padding:10px 12px; border-radius:8px; border-left:3px solid var(--primary);">
            <strong style="color:var(--text);" data-i18n="quiz.expQ1Label">Câu 1:</strong>
            <span data-i18n="quiz.expQ1">Đáp án B đúng trực tiếp từ câu: <em>"working memory plays a pivotal role in language assimilation"</em>.</span>
          </div>
          <div style="background:#f8fafc; padding:10px 12px; border-radius:8px; border-left:3px solid var(--primary);">
            <strong style="color:var(--text);" data-i18n="quiz.expQ2Label">Câu 2:</strong>
            <span data-i18n="quiz.expQ2">Phương án A và C đúng: <em>"demonstrate superior grammatical discernment and enhanced lexical recall"</em>.</span>
          </div>
          <div style="background:#f8fafc; padding:10px 12px; border-radius:8px; border-left:3px solid var(--primary);">
            <strong style="color:var(--text);" data-i18n="quiz.expQ3Label">Câu 3:</strong>
            <span data-i18n="quiz.expQ3">Từ cần điền là <code>grammatical</code> (tính từ đứng trước danh từ discernment).</span>
          </div>
        </div>

        <!-- Strategy Advice for Test-Takers -->
        <div style="margin-top:14px; padding:12px; background:var(--light-blue); border-radius:8px; border:1px solid #cbe1f8; font-size:.82rem; color:var(--primary);">
          <strong style="display:block; margin-bottom:2px;" data-i18n="quiz.strategyTitle">💡 Chiến thuật làm bài IELTS từ Teacher Dong:</strong>
          <span data-i18n="quiz.strategyDesc">Đối với dạng bài điền từ khuyết (Summary Completion), hãy luôn xác định loại từ cần điền (danh/tính/động/trạng) và tìm các từ đồng nghĩa (synonyms) trong bài khóa.</span>
        </div>
      </div>
    </div>
  </div>
</section>
`;
