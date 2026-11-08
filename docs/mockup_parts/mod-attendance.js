module.exports = `
<!-- MODULE 8: AUTOMATED ATTENDANCE & EXCEL REPORTS -->
<section id="tab-attendance" class="tab-pane">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
    <div>
      <h2 style="margin:0 0 4px;" data-i18n="att.title">Điểm danh tự động qua LiveKit Webhook & Báo cáo Excel</h2>
      <p style="color:var(--text-soft); margin:0;" data-i18n="att.subtitle">Tự động tính phút học thực tế từ sự kiện kết nối/ngắt kết nối SFU. Phân loại PRESENT, LATE, ABSENT.</p>
    </div>

    <!-- Actions -->
    <div style="display:flex; gap:10px;">
      <button type="button" class="btn btn-ghost" onclick="simulateIncomingWebhook()">
        <svg class="ic" style="color:var(--accent-dark);"><use href="#i-refresh"/></svg>
        <span>Giả lập LiveKit Webhook</span>
      </button>
      <button type="button" class="btn btn-primary" onclick="exportAttendanceToExcel()">
        <svg class="ic"><use href="#i-excel"/></svg>
        <span>Xuất file Excel (.xlsx / CSV)</span>
      </button>
    </div>
  </div>

  <!-- Attendance Rule Explanation Cards -->
  <div class="grid-3" style="margin-bottom:24px;">
    <div style="background:#ECFDF5; border:1.5px solid #A7F3D0; border-radius:var(--radius-sm); padding:16px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="badge badge-green">PRESENT (CÓ MẶT)</span>
      </div>
      <p style="font-size:.85rem; color:#065F46; margin:0;">
        Vào phòng trong <strong>15 phút đầu</strong> và thời gian học đạt ít nhất <strong>&ge; 80%</strong> thời lượng buổi học (&ge; 72 phút / 90 phút).
      </p>
    </div>

    <div style="background:#FFFBEB; border:1.5px solid #FDE68A; border-radius:var(--radius-sm); padding:16px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="badge badge-amber">LATE (ĐI MUỘN)</span>
      </div>
      <p style="font-size:.85rem; color:#92400E; margin:0;">
        Tham gia vào phòng học <strong>sau 15 phút đầu</strong> của buổi học (sau 19:45).
      </p>
    </div>

    <div style="background:#FEF2F2; border:1.5px solid #FECACA; border-radius:var(--radius-sm); padding:16px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="badge badge-red">ABSENT (VẮNG MẶT)</span>
      </div>
      <p style="font-size:.85rem; color:#991B1B; margin:0;">
        Không tham gia hoặc thời gian học tích lũy <strong>dưới 30%</strong> thời lượng buổi học (&lt; 27 phút).
      </p>
    </div>
  </div>

  <!-- LiveKit Webhook Live Event Stream -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-header" style="margin-bottom:12px;">
      <h3 class="card-title">
        <svg class="ic" style="color:var(--primary);"><use href="#i-refresh"/></svg>
        <span>Nhật ký sự kiện LiveKit Webhook (Real-time Event Stream)</span>
      </h3>
      <span class="badge badge-blue" id="webhook-counter-badge">4 Sự kiện ghi nhận</span>
    </div>
    <div style="background:#0f172a; color:#38bdf8; font-family:monospace; font-size:.82rem; padding:14px; border-radius:12px; max-height:120px; overflow-y:auto;" id="webhook-log-stream">
      <div>[19:28:15] participant_joined: TD-STU-8821 (Nguyễn Văn An) &rarr; Join at 0m (On time)</div>
      <div>[19:35:22] participant_joined: TD-STU-8822 (Trần Thị Mai) &rarr; Join at 7m (On time)</div>
      <div>[19:48:40] participant_joined: TD-STU-8824 (Phạm Thu Thảo) &rarr; Join at 20m (LATE)</div>
      <div>[20:10:05] participant_left: TD-STU-8826 (Vũ Thanh Hưng) &rarr; Disconnected at 42m</div>
    </div>
  </div>

  <!-- Attendance Records Table -->
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">
        <svg class="ic" style="color:var(--success);"><use href="#i-clock"/></svg>
        <span>Bảng theo dõi chuyên cần buổi học #101 (Thời lượng: 90 phút)</span>
      </h3>
      <span style="font-size:.85rem; color:var(--text-soft);">Sĩ số: 7 học viên</span>
    </div>

    <div class="data-table-wrap">
      <table class="data-table" id="attendance-table">
        <thead>
          <tr>
            <th>Họ và tên</th>
            <th>Mã học viên</th>
            <th>Giờ vào</th>
            <th>Giờ ra</th>
            <th>Số phút học</th>
            <th>Tỷ lệ %</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody id="attendance-tbody">
          <!-- Dynamic Attendance Rows -->
          <tr>
            <td><strong>Nguyễn Văn An</strong></td>
            <td>TD-STU-8821</td>
            <td>19:28</td>
            <td>21:00</td>
            <td><strong>90 / 90 min</strong></td>
            <td>100%</td>
            <td><span class="badge badge-green">PRESENT</span></td>
            <td>Tham gia từ đầu, phát biểu tích cực</td>
            <td><button type="button" class="btn btn-ghost btn-sm" onclick="openEditAttendanceModal('Nguyễn Văn An', 'TD-STU-8821', 'PRESENT')">Sửa</button></td>
          </tr>
          <tr>
            <td><strong>Trần Thị Mai</strong></td>
            <td>TD-STU-8822</td>
            <td>19:35</td>
            <td>21:00</td>
            <td><strong>85 / 90 min</strong></td>
            <td>94.4%</td>
            <td><span class="badge badge-green">PRESENT</span></td>
            <td>Tham gia trong 15p đầu</td>
            <td><button type="button" class="btn btn-ghost btn-sm" onclick="openEditAttendanceModal('Trần Thị Mai', 'TD-STU-8822', 'PRESENT')">Sửa</button></td>
          </tr>
          <tr>
            <td><strong>Lê Quốc Hoàng</strong></td>
            <td>TD-STU-8823</td>
            <td>19:32</td>
            <td>20:50</td>
            <td><strong>78 / 90 min</strong></td>
            <td>86.7%</td>
            <td><span class="badge badge-green">PRESENT</span></td>
            <td>&ge; 80% thời lượng</td>
            <td><button type="button" class="btn btn-ghost btn-sm" onclick="openEditAttendanceModal('Lê Quốc Hoàng', 'TD-STU-8823', 'PRESENT')">Sửa</button></td>
          </tr>
          <tr>
            <td><strong>Phạm Thu Thảo</strong></td>
            <td>TD-STU-8824</td>
            <td>19:48</td>
            <td>21:00</td>
            <td><strong>72 / 90 min</strong></td>
            <td>80.0%</td>
            <td><span class="badge badge-amber">LATE</span></td>
            <td>Vào muộn sau 18 phút (sau 19:45)</td>
            <td><button type="button" class="btn btn-ghost btn-sm" onclick="openEditAttendanceModal('Phạm Thu Thảo', 'TD-STU-8824', 'LATE')">Sửa</button></td>
          </tr>
          <tr>
            <td><strong>Đỗ Quang Minh</strong></td>
            <td>TD-STU-8825</td>
            <td>19:30</td>
            <td>21:00</td>
            <td><strong>90 / 90 min</strong></td>
            <td>100%</td>
            <td><span class="badge badge-green">PRESENT</span></td>
            <td>Tham gia đầy đủ</td>
            <td><button type="button" class="btn btn-ghost btn-sm" onclick="openEditAttendanceModal('Đỗ Quang Minh', 'TD-STU-8825', 'PRESENT')">Sửa</button></td>
          </tr>
          <tr>
            <td><strong>Vũ Thanh Hưng</strong></td>
            <td>TD-STU-8826</td>
            <td>19:30</td>
            <td>20:10</td>
            <td><strong>40 / 90 min</strong></td>
            <td>44.4%</td>
            <td><span class="badge badge-red">ABSENT</span></td>
            <td>Rời phòng sớm, &lt; 80% thời lượng</td>
            <td><button type="button" class="btn btn-ghost btn-sm" onclick="openEditAttendanceModal('Vũ Thanh Hưng', 'TD-STU-8826', 'ABSENT')">Sửa</button></td>
          </tr>
          <tr>
            <td><strong>Bùi Khánh Linh</strong></td>
            <td>TD-STU-8827</td>
            <td>19:30</td>
            <td>21:00</td>
            <td><strong>90 / 90 min</strong></td>
            <td>100%</td>
            <td><span class="badge badge-green">PRESENT</span></td>
            <td>Tham gia đầy đủ</td>
            <td><button type="button" class="btn btn-ghost btn-sm" onclick="openEditAttendanceModal('Bùi Khánh Linh', 'TD-STU-8827', 'PRESENT')">Sửa</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
`;
