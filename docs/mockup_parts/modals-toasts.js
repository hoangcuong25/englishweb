module.exports = `
<!-- MODALS & OVERLAYS -->

<!-- 1. Single Concurrent Session Modal -->
<div class="modal-overlay" id="single-session-modal">
  <div class="modal-content" style="border-top:6px solid #EF4444;">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
      <div class="tile t-red" style="width:44px; height:44px;"><svg class="ic"><use href="#i-lock"/></svg></div>
      <div>
        <h3 style="margin:0; color:#EF4444;">Phiên đăng nhập đã bị chấm dứt</h3>
        <small style="color:var(--text-soft); font-weight:700;">CƠ CHẾ BẢO MẬT SINGLE CONCURRENT SESSION</small>
      </div>
    </div>
    
    <p style="font-size:.9rem; color:var(--text-soft); line-height:1.6;">
      Tài khoản <strong>Nguyễn Văn An (TD-STU-8821)</strong> vừa được đăng nhập trên một thiết bị mới:<br>
      • Thiết bị: <strong>MacBook Pro — Chrome 124 (macOS Sonoma)</strong><br>
      • Địa chỉ IP: <strong>118.69.142.88 (TP. Hồ Chí Minh)</strong><br>
      • Thời gian: <strong>Vừa xong</strong>
    </p>

    <div style="background:#FEF2F2; border-left:4px solid #EF4444; padding:10px 14px; border-radius:0 10px 10px 0; font-size:.85rem; color:#991B1B; margin-bottom:20px;">
      Theo chính sách bảo mật chống chia sẻ tài khoản học tập, mỗi học viên chỉ được duy trì một phiên đăng nhập đồng thời. Phiên hiện tại trên thiết bị này đã tự động vô hiệu hóa.
    </div>

    <div style="display:flex; justify-content:flex-end; gap:10px;">
      <button type="button" class="btn btn-ghost" onclick="closeSingleSessionModal()">Đóng cửa sổ</button>
      <button type="button" class="btn btn-danger" onclick="simulateReLogin()">Đăng nhập lại trên thiết bị này</button>
    </div>
  </div>
</div>

<!-- 2. Google OAuth 2.0 Management Modal -->
<div class="modal-overlay" id="google-modal">
  <div class="modal-content">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <div class="tile t-blue" style="width:44px; height:44px;"><svg class="ic"><use href="#i-google"/></svg></div>
      <div>
        <h3 style="margin:0;">Liên kết tài khoản Google OAuth 2.0</h3>
        <small style="color:var(--text-soft); font-weight:700;">XÁC THỰC & ĐĂNG NHẬP NHANH 1 CHẠM</small>
      </div>
    </div>

    <div style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:16px; margin-bottom:18px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:700; font-size:.9rem;">Trạng thái liên kết Google:</span>
        <span class="badge badge-green" id="google-link-badge">ĐÃ LIÊN KẾT</span>
      </div>
      <p style="font-size:.88rem; color:var(--text-soft); margin:0;">
        Email Google: <strong id="google-email-display">nguyenvanan.ielts@gmail.com</strong>
      </p>
    </div>

    <p style="font-size:.85rem; color:var(--text-soft); margin-bottom:20px;">
      Khi đã liên kết, bạn có thể đăng nhập vào hệ thống Teacher Dong Academy nhanh chóng qua nút "Đăng nhập bằng Google" mà không cần gõ mật khẩu.
    </p>

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <button type="button" class="btn btn-danger btn-sm" id="btn-toggle-google" onclick="toggleGoogleLink()">
        Hủy liên kết tài khoản Google
      </button>
      <button type="button" class="btn btn-ghost btn-sm" onclick="closeGoogleModal()">Đóng</button>
    </div>
  </div>
</div>

<!-- 3. Manual Attendance Override Modal -->
<div class="modal-overlay" id="attendance-edit-modal">
  <div class="modal-content">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <div class="tile t-amber" style="width:44px; height:44px;"><svg class="ic"><use href="#i-clock"/></svg></div>
      <div>
        <h3 style="margin:0;">Điều chỉnh điểm danh chuyên cần</h3>
        <small style="color:var(--text-soft); font-weight:700;">DÀNH CHO GIẢNG VIÊN TEACHER DONG</small>
      </div>
    </div>

    <div class="form-group">
      <label>Học viên & Mã số:</label>
      <input type="text" class="form-input" id="edit-att-name" readonly style="background:#f1f5f9;">
    </div>

    <div class="form-group">
      <label>Trạng thái chuyên cần mới:</label>
      <select class="form-select" id="edit-att-status">
        <option value="PRESENT">PRESENT (Có mặt &ge; 80% thời lượng)</option>
        <option value="LATE">LATE (Đi muộn sau 15 phút đầu)</option>
        <option value="ABSENT">ABSENT (Vắng mặt hoặc &lt; 30% thời lượng)</option>
      </select>
    </div>

    <div class="form-group">
      <label>Lý do điều chỉnh (Lưu vào Audit Log):</label>
      <textarea class="form-textarea" id="edit-att-reason" rows="3" placeholder="Nhập lý do điều chỉnh (ví dụ: Học viên mất kết nối 10 phút, có xin phép qua Zalo)..."></textarea>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:10px;">
      <button type="button" class="btn btn-ghost" onclick="closeAttendanceEditModal()">Hủy</button>
      <button type="button" class="btn btn-primary" onclick="saveAttendanceEdit()">Lưu thay đổi</button>
    </div>
  </div>
</div>

<!-- 4. Add Course Modal (Admin) -->
<div class="modal-overlay" id="new-course-modal">
  <div class="modal-content">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <div class="tile t-blue" style="width:44px; height:44px;"><svg class="ic"><use href="#i-book"/></svg></div>
      <div>
        <h3 style="margin:0;">Thêm khóa học mới vào hệ thống</h3>
        <small style="color:var(--text-soft); font-weight:700;">TEACHER DONG ACADEMY LMS</small>
      </div>
    </div>

    <div class="form-group">
      <label>Tên khóa học:</label>
      <input type="text" class="form-input" id="new-course-title" placeholder="VD: IELTS Speaking Masterclass Band 8.0+">
    </div>

    <div class="form-group">
      <label>Danh mục đào tạo:</label>
      <select class="form-select" id="new-course-cat">
        <option value="ielts">IELTS Intensive</option>
        <option value="business">Business English</option>
        <option value="kids">English for Early Childhood</option>
        <option value="ai">Ứng dụng AI trong giảng dạy</option>
        <option value="life">Kỹ năng sống & Tư duy phản biện</option>
      </select>
    </div>

    <div class="form-group">
      <label>Mô tả ngắn khóa học:</label>
      <textarea class="form-textarea" rows="2" placeholder="Tóm tắt mục tiêu đầu ra và đối tượng học viên..."></textarea>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:10px;">
      <button type="button" class="btn btn-ghost" onclick="closeNewCourseModal()">Hủy</button>
      <button type="button" class="btn btn-accent" onclick="saveNewCourse()">Tạo khóa học</button>
    </div>
  </div>
</div>

<!-- TOAST CONTAINER -->
<div class="toast-container" id="toast-box"></div>

<!-- FLOATING CHAT DOCK (Always available across all tabs) -->
<div class="chat-dock">
  <button type="button" class="chat-trigger-btn" onclick="toggleFloatingChat()" title="Mở hộp thoại nhắn tin nhanh">
    <svg class="ic" style="width:26px; height:26px;"><use href="#i-chat"/></svg>
  </button>
</div>

<!-- FLOATING CHAT WINDOW -->
<div class="chat-window" id="floating-chat-window">
  <div class="chat-header">
    <div style="display:flex; align-items:center; gap:10px;">
      <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, var(--secondary), #fff); color:var(--primary); display:grid; place-items:center; font-weight:800; font-size:.85rem;">TD</div>
      <div>
        <div style="font-weight:700; font-size:.9rem;">Teacher Dong</div>
        <div style="font-size:.72rem; color:#bbf7d0;">● Đang trực tuyến</div>
      </div>
    </div>
    <button type="button" onclick="toggleFloatingChat()" style="background:none; border:none; color:#fff; cursor:pointer; padding:4px;">
      <svg class="ic"><use href="#i-close"/></svg>
    </button>
  </div>
  <div class="chat-body" id="float-chat-body">
    <div class="chat-msg theirs">
      Chào An! Em cần hỗ trợ gì về bài học hoặc lớp trực tuyến tối nay không?
      <div style="font-size:.68rem; color:#94a3b8; text-align:right; margin-top:2px;">19:30</div>
    </div>
  </div>
  <form onsubmit="handleFloatChatSubmit(event)" class="chat-footer">
    <input type="text" class="form-input" id="float-chat-input" placeholder="Nhập tin nhắn..." style="padding:8px 12px; font-size:.85rem;">
    <button type="submit" class="btn btn-primary btn-sm" style="padding:8px 14px;">
      <svg class="ic"><use href="#i-send"/></svg>
    </button>
  </form>
</div>
`;
