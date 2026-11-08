module.exports = `
<!-- MODULE 5: AI IELTS WRITING ASSESSMENT -->
<section id="tab-writing" class="tab-pane">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
    <div>
      <h2 style="margin:0 0 4px;" data-i18n="writing.title">Luyện viết & Chấm điểm IELTS Writing bằng AI</h2>
      <p style="color:var(--text-soft); margin:0;" data-i18n="writing.subtitle">Đánh giá chuyên sâu 4 tiêu chí chuẩn IELTS: TR, CC, LR, GRA kèm gợi ý từ vựng C1/C2.</p>
    </div>

    <!-- Timer & Word Count Quick Bar -->
    <div style="display:flex; align-items:center; gap:10px;">
      <div style="background:var(--white); border:1.5px solid var(--line); border-radius:999px; padding:6px 16px; font-weight:700; font-size:.85rem; display:flex; align-items:center; gap:6px;">
        <svg class="ic" style="color:var(--primary);"><use href="#i-clock"/></svg>
        <span>Thời gian còn: </span>
        <span id="writing-timer" style="color:var(--primary);">38:15</span>
      </div>
      <div style="background:var(--white); border:1.5px solid var(--line); border-radius:999px; padding:6px 16px; font-weight:700; font-size:.85rem; display:flex; align-items:center; gap:6px;">
        <svg class="ic" style="color:var(--accent-dark);"><use href="#i-edit"/></svg>
        <span id="word-count-badge" style="color:var(--success);">268 từ (Đạt chuẩn &ge; 250 từ)</span>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <!-- Left Column: Prompt & Essay Editor -->
    <div class="card" style="display:flex; flex-direction:column;">
      <!-- Prompt Selection -->
      <div style="margin-bottom:16px;">
        <label style="font-weight:700; font-size:.88rem; display:block; margin-bottom:6px;">Lựa chọn đề bài luyện viết:</label>
        <select class="form-select" id="writing-prompt-select" onchange="changeWritingPrompt(this.value)">
          <option value="task2_ai">IELTS Task 2: Artificial Intelligence & The Future of Human Educators (Opinion)</option>
          <option value="task1_energy">IELTS Task 1: Renewable Energy Consumption Trends 2010–2025 (Line Graph)</option>
        </select>
      </div>

      <!-- Prompt Description Box -->
      <div style="background:var(--light-blue); border-left:4px solid var(--primary); padding:14px 18px; border-radius:0 14px 14px 0; margin-bottom:16px;">
        <strong style="color:var(--primary); display:block; margin-bottom:4px;" id="prompt-task-title">WRITING TASK 2</strong>
        <p style="font-size:.9rem; margin:0;" id="prompt-task-desc">
          "Some people believe that advances in Artificial Intelligence will soon render human teachers obsolete in classrooms. To what extent do you agree or disagree? Give reasons and relevant examples."
        </p>
      </div>

      <!-- Writing Editor Textarea -->
      <div style="flex:1; display:flex; flex-direction:column; margin-bottom:16px;">
        <label style="font-weight:700; font-size:.88rem; margin-bottom:6px;">Nội dung bài viết của học viên:</label>
        <textarea class="form-textarea" id="writing-textarea" style="flex:1; min-height:280px; line-height:1.7; font-size:.94rem;" oninput="updateWordCount(this.value)">The debate regarding whether artificial intelligence will eventually supplant human educators has garnered considerable attention in recent decades. While technological innovations have undoubtedly enhanced pedagogical delivery, I firmly believe that the indispensable empathetic guidance and pastoral care provided by human instructors cannot be replicated by automated algorithms.

To commence with, AI-powered educational platforms possess unprecedented computational efficiency in terms of personalizing cognitive content. Algorithms can meticulously diagnose individual knowledge deficits and adapt curricula at an optimized pace. Consequently, students assimilate technical fundamentals with heightened efficiency.

Nevertheless, genuine pedagogy transcends the mere dissemination of empirical facts. Teaching fundamentally entails emotional mentorship, moral development, and fostering critical discernment. Human instructors instinctively detect subtle shifts in classroom morale and adapt their rhetoric to instill confidence. A computer algorithm, irrespective of its sophisticated architecture, fundamentally lacks organic empathy.

In conclusion, although artificial intelligence will unquestionably serve as a potent pedagogical catalyst, it will merely augment rather than usurp the pivotal role of human educators.</textarea>
      </div>

      <!-- Submit Action -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <span style="font-size:.82rem; color:var(--text-soft);">Bấm nút dưới để gọi AI chấm theo 4 tiêu chí chuẩn IELTS</span>
        <button type="button" class="btn btn-accent" id="btn-submit-ai" onclick="submitToAIEvaluator()">
          <svg class="ic"><use href="#i-bulb"/></svg>
          <span id="btn-ai-text">Chấm điểm ngay bằng AI</span>
        </button>
      </div>
    </div>

    <!-- Right Column: AI Analysis & 4 Criteria Breakdown -->
    <div class="card" id="ai-result-panel">
      <!-- Result Header -->
      <div class="card-header" style="margin-bottom:16px;">
        <div>
          <span class="badge badge-green">KẾT QUẢ PHÂN TÍCH AI (IELTS 4 TIÊU CHÍ)</span>
          <h3 style="margin:4px 0 0;">Báo cáo đánh giá bài viết Task 2</h3>
        </div>
        <div style="text-align:right;">
          <div style="font-size:.78rem; font-weight:700; color:var(--text-soft);">OVERALL BAND</div>
          <div style="font-size:2.2rem; font-weight:800; color:var(--primary); line-height:1;" id="ai-overall-band">7.5</div>
        </div>
      </div>

      <!-- 4 Criteria Score Cards -->
      <div class="grid-2" style="gap:12px; margin-bottom:18px;">
        <div style="background:#F1F6FC; border-radius:var(--radius-sm); padding:12px 14px; border-left:4px solid var(--primary);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:.88rem;">1. Task Achievement</strong>
            <span class="badge badge-blue" id="score-tr">7.5</span>
          </div>
          <p style="font-size:.78rem; color:var(--text-soft); margin:4px 0 0;">Lập trường rõ ràng xuyên suốt, luận điểm phát triển đầy đủ.</p>
        </div>

        <div style="background:#F1F6FC; border-radius:var(--radius-sm); padding:12px 14px; border-left:4px solid var(--secondary);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:.88rem;">2. Coherence & Cohesion</strong>
            <span class="badge badge-blue" id="score-cc">7.0</span>
          </div>
          <p style="font-size:.78rem; color:var(--text-soft); margin:4px 0 0;">Bố cục 4 đoạn chuẩn, liên kết ý logic và đa dạng từ nối.</p>
        </div>

        <div style="background:#FFF9EB; border-radius:var(--radius-sm); padding:12px 14px; border-left:4px solid var(--accent);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:.88rem;">3. Lexical Resource</strong>
            <span class="badge badge-amber" id="score-lr">8.0</span>
          </div>
          <p style="font-size:.78rem; color:var(--text-soft); margin:4px 0 0;">Vốn từ học thuật C1/C2 xuất sắc: supplant, pedagogical, assimilate.</p>
        </div>

        <div style="background:#F1F6FC; border-radius:var(--radius-sm); padding:12px 14px; border-left:4px solid var(--primary);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:.88rem;">4. Grammatical Range</strong>
            <span class="badge badge-blue" id="score-gra">7.5</span>
          </div>
          <p style="font-size:.78rem; color:var(--text-soft); margin:4px 0 0;">Cấu trúc câu phức phong phú, mệnh đề nhượng bộ chính xác.</p>
        </div>
      </div>

      <!-- C1/C2 Vocabulary Upgrades Recommendation -->
      <div style="background:#FAFDFE; border:1px solid var(--line); border-radius:var(--radius-sm); padding:14px; margin-bottom:16px;">
        <h4 style="display:flex; align-items:center; gap:6px; margin-bottom:8px; color:var(--primary);">
          <svg class="ic"><use href="#i-star"/></svg>
          <span>Gợi ý nâng cấp từ vựng C1/C2 từ AI:</span>
        </h4>
        <div style="display:flex; flex-direction:column; gap:6px; font-size:.85rem;">
          <div>• Thay <code>"helps a lot"</code> &rarr; <strong style="color:#059669;">"substantially facilitates"</strong></div>
          <div>• Thay <code>"big problem"</code> &rarr; <strong style="color:#059669;">"paramount challenge / grave dilemma"</strong></div>
          <div>• Thay <code>"shows clearly"</code> &rarr; <strong style="color:#059669;">"lucidly delineates"</strong></div>
        </div>
      </div>

      <!-- Admin Override Section (Only active in Admin mode) -->
      <div id="admin-writing-override-box" style="display:none; background:#FFFBEB; border:1.5px solid #FCD34D; border-radius:var(--radius-sm); padding:14px;">
        <h4 style="margin:0 0 8px; color:#b26a00; display:flex; align-items:center; gap:6px;">
          <svg class="ic"><use href="#i-crown"/></svg>
          <span>Phê duyệt & Điều chỉnh điểm của Teacher Dong:</span>
        </h4>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
          <label style="font-size:.85rem; font-weight:700;">Điều chỉnh Band:</label>
          <input type="number" step="0.5" min="4.0" max="9.0" value="7.5" id="admin-adjust-band-input" style="width:70px; padding:4px 8px; border-radius:8px; border:1px solid var(--line);">
          <button type="button" class="btn btn-accent btn-sm" onclick="approveWritingSubmission()">Phê duyệt & Công bố cho học viên</button>
        </div>
      </div>
    </div>
  </div>
</section>
`;
