module.exports = `
<!-- MODULE 9: REAL-TIME LIVE CHAT & MESSAGING -->
<section id="tab-chat" class="tab-pane">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
    <div>
      <h2 style="margin:0 0 4px;" data-i18n="chat.title">Nhắn tin trực tuyến (Live Chat Socket.IO)</h2>
      <p style="color:var(--text-soft); margin:0;" data-i18n="chat.subtitle">Kênh trao đổi riêng tư giữa học viên và Teacher Dong. Hỗ trợ thông báo thời gian thực và lưu trữ lịch sử hội thoại.</p>
    </div>
    <span class="badge badge-green" style="display:flex; align-items:center; gap:6px;">
      <span style="width:8px; height:8px; border-radius:50%; background:#10B981; display:inline-block;"></span>
      Socket.IO: Connected (Port 3001)
    </span>
  </div>

  <div class="card" style="padding:0; overflow:hidden;">
    <div style="display:grid; grid-template-columns:300px 1fr; min-height:560px;">
      <!-- Left: Conversations List -->
      <div style="background:#FAFDFE; border-right:1.5px solid var(--line); display:flex; flex-direction:column;">
        <div style="padding:16px; border-bottom:1.5px solid var(--line); font-weight:700; font-size:.95rem;">
          Cuộc hội thoại (Conversations)
        </div>
        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column;">
          <!-- Item 1: Teacher Dong -->
          <div style="padding:14px 16px; border-bottom:1px solid #eef4fb; background:var(--light-blue); cursor:pointer; display:flex; align-items:center; gap:12px;">
            <div style="position:relative;">
              <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, var(--secondary), var(--primary)); display:grid; place-items:center; color:#fff; font-weight:800; font-size:1rem;">TD</div>
              <span style="position:absolute; bottom:0; right:0; width:10px; height:10px; border-radius:50%; background:#10B981; border:2px solid #fff;"></span>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-size:.9rem; color:var(--text);">Teacher Dong</strong>
                <span style="font-size:.75rem; color:var(--text-soft);">19:32</span>
              </div>
              <p style="font-size:.8rem; color:var(--text-soft); margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                Thầy đã chấm xong bài Speaking Part 2 của em rồi nhé...
              </p>
            </div>
          </div>

          <!-- Item 2: Class Channel -->
          <div style="padding:14px 16px; border-bottom:1px solid #eef4fb; cursor:pointer; display:flex; align-items:center; gap:12px;" onclick="showToast('Chuyển kênh lớp học IELTS K12', 'info')">
            <div style="position:relative;">
              <div style="width:42px; height:42px; border-radius:50%; background:#d97706; display:grid; place-items:center; color:#fff; font-weight:800; font-size:.9rem;">K12</div>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-size:.9rem; color:var(--text);">Lớp IELTS K12 (Group)</strong>
                <span style="font-size:.75rem; color:var(--text-soft);">18:40</span>
              </div>
              <p style="font-size:.8rem; color:var(--text-soft); margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                Lê Hoàng: Tối nay lớp có thảo luận Speaking không...
              </p>
            </div>
          </div>

          <!-- Item 3: Support -->
          <div style="padding:14px 16px; border-bottom:1px solid #eef4fb; cursor:pointer; display:flex; align-items:center; gap:12px;" onclick="showToast('Kênh hỗ trợ kỹ thuật Teacher Dong Academy', 'info')">
            <div style="position:relative;">
              <div style="width:42px; height:42px; border-radius:50%; background:#059669; display:grid; place-items:center; color:#fff; font-weight:800; font-size:.9rem;">HT</div>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-size:.9rem; color:var(--text);">Hỗ trợ kỹ thuật & Học vụ</strong>
                <span style="font-size:.75rem; color:var(--text-soft);">Hôm qua</span>
              </div>
              <p style="font-size:.8rem; color:var(--text-soft); margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                Đã cập nhật tài liệu PDF mới cho học viên...
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Main Chat Window -->
      <div style="display:flex; flex-direction:column; background:var(--white);">
        <!-- Chat Header -->
        <div style="padding:14px 20px; border-bottom:1.5px solid var(--line); display:flex; justify-content:space-between; align-items:center; background:#FAFDFE;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg, var(--secondary), var(--primary)); display:grid; place-items:center; color:#fff; font-weight:800;">TD</div>
            <div>
              <strong style="font-size:.95rem; display:block;">Teacher Dong</strong>
              <small style="color:var(--success); font-weight:600;">● Đang trực tuyến</small>
            </div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('classroom')">
            <svg class="ic"><use href="#i-video"/></svg>
            <span>Mời vào phòng LiveKit</span>
          </button>
        </div>

        <!-- Chat Messages Body -->
        <div class="chat-body" id="main-chat-body" style="flex:1; max-height:380px;">
          <div class="chat-msg theirs">
            Chào em An! Thầy thấy bài Speaking của em nộp hôm nay phát âm rất tiến bộ, đặc biệt là các cụm từ vựng nối.
            <div style="font-size:.7rem; color:#94a3b8; text-align:right; margin-top:4px;">19:25</div>
          </div>

          <div class="chat-msg mine">
            Dạ em cảm ơn Thầy nhiều ạ! Thầy ơi em có gửi cả bài viết IELTS Writing Task 2 qua phân hệ AI, Thầy xem giúp em với ạ.
            <div style="font-size:.7rem; color:#dbe9f8; text-align:right; margin-top:4px;">19:28 • Đã xem</div>
          </div>

          <div class="chat-msg theirs">
            Thầy vừa xem qua báo cáo phân tích AI rồi. Điểm Lexical Resource của em đạt 8.0 rất tốt. Thầy đã phê duyệt điểm trên hệ thống nhé!
            <div style="font-size:.7rem; color:#94a3b8; text-align:right; margin-top:4px;">19:32</div>
          </div>

          <!-- Typing Indicator -->
          <div id="chat-typing-indicator" style="display:none; align-self:flex-start; font-size:.8rem; color:var(--text-soft); font-style:italic; padding:4px 12px;">
            Teacher Dong đang soạn tin nhắn...
          </div>
        </div>

        <!-- Quick Reply Suggestion Chips -->
        <div style="padding:8px 16px; background:#FAFDFE; border-top:1px solid #eef4fb; display:flex; gap:8px; overflow-x:auto;">
          <button type="button" class="btn-sim" style="font-size:.75rem; padding:4px 10px;" onclick="sendQuickReply('Em xin phép vào lớp muộn 5 phút do bận họp ạ')">"Em xin phép vào muộn 5p ạ"</button>
          <button type="button" class="btn-sim" style="font-size:.75rem; padding:4px 10px;" onclick="sendQuickReply('Thầy ơi cho em xin tài liệu PDF bài giảng hôm nay với ạ')">"Thầy ơi cho em xin tài liệu PDF"</button>
          <button type="button" class="btn-sim" style="font-size:.75rem; padding:4px 10px;" onclick="sendQuickReply('Em cảm ơn Thầy rất nhiều ạ!')">"Em cảm ơn Thầy nhiều ạ!"</button>
        </div>

        <!-- Chat Input Form -->
        <form onsubmit="handleChatSubmit(event)" style="padding:12px 16px; display:flex; gap:10px; border-top:1.5px solid var(--line);">
          <input type="text" class="form-input" id="chat-text-input" placeholder="Nhập tin nhắn trao đổi với Teacher Dong..." style="flex:1;">
          <button type="submit" class="btn btn-primary">
            <svg class="ic"><use href="#i-send"/></svg>
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
`;
