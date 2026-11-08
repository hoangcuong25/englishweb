// SKELETON — Lớp 3 (Hook). Chặn/cảnh báo khi không tuân thủ quy trình.
// Phase 0: chưa viết logic thật — điền khi tạo playbook mới.
// enforcement level ('monitor-only' | 'warn' | 'block') đọc từ .claude/settings.json.
//
// MUST — giao ước exit code của Claude Code khi wrap skeleton này thành hook thật:
//   exit 0  → cho qua (stdout/stderr không hiện cho model)
//   exit 2  → CHẶN; harness đọc lý do từ STDERR rồi feed lại cho Claude
//   khác 0  → non-blocking error: chỉ hiện cho user rồi VẪN CHẠY tool
// NEVER dùng exit 1 + stdout để chặn (đã từng làm dangerous-op-blocker mất tác dụng âm thầm).
// Xem hooks/README.md § Giao ước exit code.

// CommonJS (module.exports) — nhất quán với các hook thật trong repo; xem package.json.
module.exports = function guard(event) {
  // 1) Lấy dữ liệu từ event (vd: event.files)
  // 2) Kiểm tra điều kiện vi phạm quy trình
  // 3) return { level, message } để cảnh báo (warn) hoặc chặn (block)
  return null; // null = không vi phạm
};
