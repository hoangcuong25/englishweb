module.exports = `
<!-- MODULE 1: DASHBOARD -->
<section id="tab-dashboard" class="tab-pane active">
  <!-- STUDENT DASHBOARD VIEW -->
  <div id="student-dashboard-view">
    <!-- Live Class Notification Banner -->
    <div class="live-class-banner">
      <div class="live-class-info">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span class="badge" style="background:#EF4444; color:#fff;">ĐANG DIỄN RA</span>
          <span style="font-size:.85rem; color:#dbe9f8;">Lớp học trực tiếp WebRTC</span>
        </div>
        <h3 data-i18n="dash.liveClassTitle">IELTS Speaking & Discussion — Room #101</h3>
        <p data-i18n="dash.liveClassDesc">Giảng viên Host: <strong>Teacher Dong</strong> • Sĩ số: 7/8 học viên đã vào phòng</p>
      </div>
      <button type="button" class="btn btn-accent" onclick="switchTab('classroom')">
        <svg class="ic"><use href="#i-video"/></svg>
        <span data-i18n="dash.joinNow">Vào phòng học ngay (1 chạm)</span>
      </button>
    </div>

    <!-- 4 Stat Cards -->
    <div class="grid-4" style="margin-bottom:24px;">
      <div class="stat-card">
        <div class="tile t-blue"><svg class="ic"><use href="#i-book"/></svg></div>
        <div>
          <div class="stat-number">3</div>
          <div class="stat-label" data-i18n="dash.coursesEnrolled">Khóa học đang học</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="tile t-sky"><svg class="ic"><use href="#i-clock"/></svg></div>
        <div>
          <div class="stat-number">42.5h</div>
          <div class="stat-label" data-i18n="dash.hoursLearned">Tổng giờ học tích lũy</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="tile t-amber"><svg class="ic"><use href="#i-target"/></svg></div>
        <div>
          <div class="stat-number">Band 7.0</div>
          <div class="stat-label" data-i18n="dash.currentBand">Điểm IELTS ước tính</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="tile t-green"><svg class="ic"><use href="#i-clipboard"/></svg></div>
        <div>
          <div class="stat-number">18/20</div>
          <div class="stat-label" data-i18n="dash.quizzesPassed">Quiz đã vượt qua</div>
        </div>
      </div>
    </div>

    <!-- Active Course Progress & Recent Tasks -->
    <div class="grid-2">
      <!-- Active Course Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="ic" style="color:var(--primary);"><use href="#i-book"/></svg>
            <span data-i18n="dash.continueLearning">Khóa học đang tiếp tục</span>
          </h3>
          <span class="badge badge-blue">IELTS INTENSIVE</span>
        </div>
        <p style="font-weight:700; font-size:1.05rem; margin-bottom:6px;">IELTS Intensive 6.5 -> 7.5+ Masterclass</p>
        <p style="color:var(--text-soft); font-size:.9rem; margin-bottom:14px;">Bài học tiếp theo: <em>Unit 4 — Advanced Cohesion & Lexical Upgrade</em></p>
        
        <div style="margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; font-size:.85rem; font-weight:700; margin-bottom:6px;">
            <span>Tiến độ hoàn thành khóa học</span>
            <span style="color:var(--primary);" id="dash-progress-text">68%</span>
          </div>
          <div style="background:var(--light-blue); height:10px; border-radius:999px; overflow:hidden;">
            <div id="dash-progress-bar" style="background:linear-gradient(90deg, var(--secondary), var(--primary)); width:68%; height:100%; border-radius:999px; transition:width .4s;"></div>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-primary btn-sm" onclick="switchTab('lms')">
            <svg class="ic"><use href="#i-play"/></svg>
            <span>Tiếp tục bài học</span>
          </button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('library')">
            <svg class="ic"><use href="#i-file-pdf"/></svg>
            <span>Tài liệu bài học</span>
          </button>
        </div>
      </div>

      <!-- Pending Tasks & Teacher Feedback -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="ic" style="color:var(--accent-dark);"><use href="#i-star"/></svg>
            <span data-i18n="dash.tasksAndFeedback">Nhiệm vụ & Phản hồi giảng viên</span>
          </h3>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="background:var(--bg); border:1px solid var(--line); border-radius:var(--radius-sm); padding:12px 16px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-weight:700; font-size:.92rem;">Bài viết IELTS Writing Task 2</div>
              <div style="font-size:.82rem; color:var(--text-soft);">Hạn nộp: Tối nay 23:59 • Trí tuệ nhân tạo & Giáo dục</div>
            </div>
            <button type="button" class="btn btn-accent btn-sm" onclick="switchTab('writing')">Làm bài AI</button>
          </div>

          <div style="background:#FFFDF9; border:1px solid #FFE4B5; border-radius:var(--radius-sm); padding:12px 16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
              <span style="font-weight:700; font-size:.92rem; color:#b26a00;">Phản hồi Speaking Part 2 từ Teacher Dong</span>
              <span class="badge badge-amber">BAND 7.5</span>
            </div>
            <p style="font-size:.85rem; color:var(--text-soft); margin:0 0 10px;">"Ngữ điệu rất tự nhiên, phát âm rõ ràng. Thầy đã để lại 3 ghi chú chi tiết tại các mốc thời gian trong audio."</p>
            <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('speaking')">Nghe nhận xét</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ADMIN DASHBOARD VIEW (Shown when role is ADMIN) -->
  <div id="admin-dashboard-view" style="display:none;">
    <!-- Admin Hero Banner -->
    <div style="background:linear-gradient(135deg, #153a68, var(--primary)); color:#fff; border-radius:var(--radius-lg); padding:26px 32px; margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; gap:20px; box-shadow:var(--shadow);">
      <div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span class="badge" style="background:var(--accent); color:var(--text); font-weight:800;">ADMINISTRATION</span>
          <span style="font-size:.85rem; color:#c7dcf5;">Quản trị & Giảng dạy trực tuyến</span>
        </div>
        <h2 style="color:#fff; margin:0 0 6px;">Chào mừng trở lại, Teacher Dong!</h2>
        <p style="color:#dbe9f8; margin:0;">Hệ thống đang phục vụ 128 học viên. Bạn có 5 bài Writing chờ duyệt và 8 bài Speaking cần chấm điểm.</p>
      </div>
      <button type="button" class="btn btn-accent" onclick="switchTab('classroom')">
        <svg class="ic"><use href="#i-crown"/></svg>
        <span>Mở phòng học LiveKit với quyền Host</span>
      </button>
    </div>

    <!-- Admin 4 Stat Cards -->
    <div class="grid-4" style="margin-bottom:24px;">
      <div class="stat-card">
        <div class="tile t-blue"><svg class="ic"><use href="#i-users"/></svg></div>
        <div>
          <div class="stat-number">128</div>
          <div class="stat-label">Tổng học viên Active</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="tile t-amber"><svg class="ic"><use href="#i-book"/></svg></div>
        <div>
          <div class="stat-number">6</div>
          <div class="stat-label">Khóa học & Giáo trình</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="tile t-sky"><svg class="ic"><use href="#i-edit"/></svg></div>
        <div>
          <div class="stat-number">5</div>
          <div class="stat-label">Bài Writing chờ duyệt</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="tile t-green"><svg class="ic"><use href="#i-mic"/></svg></div>
        <div>
          <div class="stat-number">8</div>
          <div class="stat-label">Bài Speaking chờ chấm</div>
        </div>
      </div>
    </div>

    <!-- Admin Operations Tables -->
    <div class="grid-2">
      <!-- Pending Submissions -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="ic" style="color:var(--primary);"><use href="#i-clipboard"/></svg>
            <span>Hàng đợi bài nộp cần xử lý</span>
          </h3>
          <span class="badge badge-amber">13 BÀI CHỜ</span>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Phân hệ</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Nguyễn Văn An</strong></td>
                <td><span class="badge badge-blue">Writing AI</span></td>
                <td>10 phút trước</td>
                <td><button type="button" class="btn btn-primary btn-sm" onclick="switchTab('writing')">Duyệt bài</button></td>
              </tr>
              <tr>
                <td><strong>Trần Thị Mai</strong></td>
                <td><span class="badge badge-amber">Speaking Part 2</span></td>
                <td>25 phút trước</td>
                <td><button type="button" class="btn btn-accent btn-sm" onclick="switchTab('speaking')">Chấm audio</button></td>
              </tr>
              <tr>
                <td><strong>Lê Quốc Hoàng</strong></td>
                <td><span class="badge badge-blue">Writing Task 1</span></td>
                <td>1 giờ trước</td>
                <td><button type="button" class="btn btn-primary btn-sm" onclick="switchTab('writing')">Duyệt bài</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Attendance Overview -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="ic" style="color:var(--success);"><use href="#i-clock"/></svg>
            <span>Chuyên cần phòng học LiveKit tuần này</span>
          </h3>
          <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('attendance')">Xuất Excel (.xlsx)</button>
        </div>
        <div style="display:flex; align-items:center; gap:20px; margin-bottom:16px;">
          <div style="width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg, var(--secondary), var(--primary)); display:grid; place-items:center; color:#fff; font-size:1.4rem; font-weight:800; box-shadow:var(--shadow-sm);">
            94.2%
          </div>
          <div>
            <div style="font-weight:700; font-size:1.05rem;">Tỷ lệ học viên tham gia đúng giờ</div>
            <p style="color:var(--text-soft); font-size:.88rem; margin:2px 0 0;">Dữ liệu đồng bộ tự động qua LiveKit Webhook. Học viên học &ge; 80% thời lượng tính trạng thái PRESENT.</p>
          </div>
        </div>
        <div style="background:var(--bg); border:1px solid var(--line); border-radius:var(--radius-sm); padding:12px 16px;">
          <div style="display:flex; justify-content:space-between; font-size:.88rem; margin-bottom:4px;">
            <span>Có mặt (PRESENT):</span>
            <strong style="color:var(--success);">112 lượt (87.5%)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:.88rem; margin-bottom:4px;">
            <span>Đi muộn (LATE &gt;15p):</span>
            <strong style="color:var(--warning);">11 lượt (8.6%)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:.88rem;">
            <span>Vắng mặt (ABSENT &lt;30%):</span>
            <strong style="color:var(--danger);">5 lượt (3.9%)</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;
