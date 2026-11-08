module.exports = `
<!-- MODULE 2: LMS & COURSE MANAGEMENT -->
<section id="tab-lms" class="tab-pane">
  <!-- STUDENT LMS VIEW -->
  <div id="student-lms-view">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="margin:0 0 4px;" data-i18n="lms.catalogTitle">Chương trình đào tạo & Khóa học</h2>
        <p style="color:var(--text-soft); margin:0;" data-i18n="lms.catalogSubtitle">Lộ trình học chuẩn quốc tế: IELTS, Business English, Tiếng Anh trẻ em và Năng lực sư phạm AI.</p>
      </div>
      <!-- Course Categories Filter Chips (5 Trụ Cột Đào Tạo Chuẩn) -->
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm btn-primary filter-chip" onclick="filterCourses('all', this)">Tất cả (5 Trụ Cột)</button>
        <button type="button" class="btn btn-sm btn-ghost filter-chip" onclick="filterCourses('p1', this)">1. English Proficiency</button>
        <button type="button" class="btn btn-sm btn-ghost filter-chip" onclick="filterCourses('p2', this)">2. Professional Dev</button>
        <button type="button" class="btn btn-sm btn-ghost filter-chip" onclick="filterCourses('p3', this)">3. Life Skills</button>
        <button type="button" class="btn btn-sm btn-ghost filter-chip" onclick="filterCourses('p4', this)">4. Life Experiences</button>
        <button type="button" class="btn btn-sm btn-ghost filter-chip" onclick="filterCourses('p5', this)">5. Travel & Culture</button>
      </div>
    </div>

    <!-- Active Course Detail & Syllabus Viewer -->
    <div class="card" style="margin-bottom:28px;">
      <div class="card-header" style="flex-wrap:wrap;">
        <div>
          <span class="badge badge-amber" style="margin-bottom:6px;">KHÓA HỌC ĐANG HỌC</span>
          <h2 style="margin:0;">IELTS Intensive Band 6.5 &rarr; 7.5+ Masterclass</h2>
          <p style="color:var(--text-soft); font-size:.9rem; margin:4px 0 0;">Giảng viên chủ nhiệm: <strong>Teacher Dong</strong> • 12 Modules • 36 Bài học • Hoàn thành: <span id="lms-percent">68%</span></p>
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('library')">
            <svg class="ic"><use href="#i-shield"/></svg>
            <span>Tài liệu PDF có Watermark</span>
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="markLessonComplete()">
            <svg class="ic"><use href="#i-check"/></svg>
            <span>Đánh dấu hoàn thành bài hiện tại</span>
          </button>
        </div>
      </div>

      <!-- Video Lesson Player Simulator -->
      <div style="background:#111e30; border-radius:var(--radius); padding:20px; margin-bottom:24px; color:#fff;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="badge" style="background:var(--primary); color:#fff;">BÀI 1.2</span>
            <span style="font-weight:700; font-size:1.05rem;">Describing Trends & Paraphrasing in Academic Writing</span>
          </div>
          <span style="font-size:.85rem; color:#94a3b8;">Thời lượng: 18:42</span>
        </div>
        
        <div style="background:#1c2d44; aspect-ratio:16/8; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;">
          <div style="width:70px; height:70px; border-radius:50%; background:rgba(40,104,178,.85); display:grid; place-items:center; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.4); transition:transform .2s;" onclick="toggleMockVideo(this)">
            <svg class="ic" style="width:32px; height:32px; fill:#fff; stroke:none;"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          </div>
          <div style="position:absolute; bottom:16px; left:20px; right:20px; display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); padding:8px 16px; border-radius:10px; font-size:.82rem;">
            <span>08:15 / 18:42</span>
            <div style="flex:1; height:6px; background:rgba(255,255,255,.2); border-radius:999px; margin:0 16px; position:relative; cursor:pointer;">
              <div style="width:44%; height:100%; background:var(--secondary); border-radius:999px;"></div>
            </div>
            <span>Tốc độ: 1.0x • 1080p HD</span>
          </div>
        </div>
      </div>

      <!-- Syllabus Tree (Module -> Lesson -> Components) -->
      <h3 style="margin-bottom:14px;">Giáo trình chi tiết (Curriculum Structure)</h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <!-- Module 1 -->
        <div style="border:1.5px solid var(--line); border-radius:var(--radius-sm); overflow:hidden;">
          <div style="background:#F1F6FC; padding:12px 18px; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
            <span>Module 1: IELTS Writing Task 1 & 2 Fundamentals</span>
            <span class="badge badge-green">3/4 Hoàn thành</span>
          </div>
          <div style="padding:10px 18px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid #edf2f7;">
              <div style="display:flex; align-items:center; gap:10px;">
                <svg class="ic" style="color:var(--success);"><use href="#i-check"/></svg>
                <span>Lesson 1.1: Comprehensive Overview of IELTS Writing Assessment Criteria</span>
              </div>
              <span class="badge badge-blue">Video + PDF</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid #edf2f7; font-weight:700; color:var(--primary);">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="tile t-blue" style="width:24px; height:24px; border-radius:6px; font-size:.75rem;">▶</span>
                <span>Lesson 1.2: Describing Trends & Paraphrasing in Academic Writing (Đang học)</span>
              </div>
              <span class="badge badge-amber">Đang học</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid #edf2f7;">
              <div style="display:flex; align-items:center; gap:10px;">
                <svg class="ic" style="color:var(--text-soft);"><use href="#i-clipboard"/></svg>
                <span>Lesson 1.3: Practice Quiz: Cohesion & Grammatical Range Mastery</span>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('quiz')">Làm Quiz</button>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0;">
              <div style="display:flex; align-items:center; gap:10px;">
                <svg class="ic" style="color:var(--text-soft);"><use href="#i-edit"/></svg>
                <span>Lesson 1.4: Assignment: Writing Task 2 AI Assessment Submission</span>
              </div>
              <button type="button" class="btn btn-accent btn-sm" onclick="switchTab('writing')">Nộp bài AI</button>
            </div>
          </div>
        </div>

        <!-- Module 2 -->
        <div style="border:1.5px solid var(--line); border-radius:var(--radius-sm); overflow:hidden;">
          <div style="background:#F1F6FC; padding:12px 18px; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
            <span>Module 2: IELTS Speaking Studio & Interactive LiveKit Sessions</span>
            <span class="badge badge-blue">Sắp mở</span>
          </div>
          <div style="padding:10px 18px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0;">
              <div style="display:flex; align-items:center; gap:10px;">
                <svg class="ic" style="color:var(--text-soft);"><use href="#i-mic"/></svg>
                <span>Lesson 2.1: Part 2 Long Turn Speaking Strategy & Audio Recording</span>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" onclick="switchTab('speaking')">Vào Studio</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ADMIN LMS & CURRICULUM BUILDER VIEW -->
  <div id="admin-lms-view" style="display:none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="margin:0 0 4px;">Quản lý Khóa học & Trình biên soạn giáo trình</h2>
        <p style="color:var(--text-soft); margin:0;">Teacher Dong toàn quyền tạo khóa học, sắp xếp chương học (Module) và bài học (Lesson).</p>
      </div>
      <button type="button" class="btn btn-accent" onclick="openNewCourseModal()">
        <svg class="ic"><use href="#i-sprout"/></svg>
        <span>+ Tạo khóa học mới</span>
      </button>
    </div>

    <!-- Courses Management Table -->
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Danh sách khóa học trên hệ thống</h3>
        <span class="badge badge-blue">6 KHÓA HỌC</span>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã & Tên khóa học</th>
              <th>Danh mục</th>
              <th>Số Module</th>
              <th>Học viên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>IELTS-INT-01: IELTS Intensive 6.5 &rarr; 7.5+</strong></td>
              <td><span class="badge badge-amber">IELTS</span></td>
              <td>12 Modules</td>
              <td>48 học viên</td>
              <td><span class="badge badge-green">Đã xuất bản</span></td>
              <td>
                <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đang mở trình chỉnh sửa giáo trình', 'success')">Sửa bài học</button>
              </td>
            </tr>
            <tr>
              <td><strong>BUS-ENG-02: Business English Communication</strong></td>
              <td><span class="badge badge-blue">Business</span></td>
              <td>8 Modules</td>
              <td>35 học viên</td>
              <td><span class="badge badge-green">Đã xuất bản</span></td>
              <td>
                <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đang mở khóa Business English', 'success')">Sửa bài học</button>
              </td>
            </tr>
            <tr>
              <td><strong>KIDS-ENG-03: English for Early Childhood</strong></td>
              <td><span class="badge badge-amber">Kids</span></td>
              <td>10 Modules</td>
              <td>22 học viên</td>
              <td><span class="badge badge-green">Đã xuất bản</span></td>
              <td>
                <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đang mở khóa Kids English', 'success')">Sửa bài học</button>
              </td>
            </tr>
            <tr>
              <td><strong>AI-PED-04: Ứng dụng AI trong giảng dạy tiếng Anh</strong></td>
              <td><span class="badge badge-blue">Sư phạm AI</span></td>
              <td>6 Modules</td>
              <td>23 học viên</td>
              <td><span class="badge badge-green">Đã xuất bản</span></td>
              <td>
                <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đang mở khóa AI Sư phạm', 'success')">Sửa bài học</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Curriculum Reorder & Builder Tool -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <svg class="ic" style="color:var(--primary);"><use href="#i-edit"/></svg>
          <span>Trình sắp xếp thứ tự Module & Lesson (Drag & Drop / Reorder)</span>
        </h3>
        <button type="button" class="btn btn-primary btn-sm" onclick="showToast('Đã lưu cấu trúc giáo trình mới vào MySQL Database!', 'success')">
          Lưu cấu trúc giáo trình
        </button>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:14px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="tile t-blue" style="width:32px; height:32px; font-weight:800;">1</span>
            <div>
              <strong>Lesson 1.1: Overview of IELTS Assessment Criteria</strong>
              <div style="font-size:.8rem; color:var(--text-soft);">Thành phần: Video (15p) • Tài liệu PDF bảo mật</div>
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đã chuyển bài lên', 'info')">▲ Lên</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đã chuyển bài xuống', 'info')">▼ Xuống</button>
          </div>
        </div>
        <div style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:14px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="tile t-blue" style="width:32px; height:32px; font-weight:800;">2</span>
            <div>
              <strong>Lesson 1.2: Describing Trends & Paraphrasing in Academic Writing</strong>
              <div style="font-size:.8rem; color:var(--text-soft);">Thành phần: Video (18p) • File Audio MP3</div>
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đã chuyển bài lên', 'info')">▲ Lên</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="showToast('Đã chuyển bài xuống', 'info')">▼ Xuống</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;
