#!/usr/bin/env node
'use strict';

// project-root.js — nguồn sự thật duy nhất cho câu hỏi "gốc project ở đâu?" trong hook.
//
// Vì sao cần: Claude Code KHÔNG bảo đảm chạy hook với cwd = gốc project. Sau khi một
// lệnh Bash trong phiên đã `cd` sang thư mục con, hook kế tiếp có thể nhận cwd là thư
// mục con đó. Mọi đường dẫn suy ra từ process.cwd() khi ấy đều sai — log ghi lệch chỗ,
// đọc settings.json không thấy, git config nhắm sai repo.
//
// Thứ tự ưu tiên (cao → thấp):
//   1. CLAUDE_PROJECT_DIR — biến môi trường Claude Code đặt cho hook; luôn trỏ đúng
//      thư mục chứa .claude/ (đã kiểm chứng trên Windows lẫn shell POSIX).
//   2. input.cwd — trường `cwd` trong payload JSON hook nhận qua stdin. Chỉ hook nào
//      parse stdin mới có; truyền null nếu không có.
//   3. fallbackRoot — gốc caller tự suy từ __dirname. Mỗi hook nằm ở một độ sâu khác
//      nhau trong submodule nên caller phải tự tính, helper không đoán thay.
//   4. process.cwd() — chốt cuối, giữ nguyên hành vi cũ thay vì ném lỗi.
function resolveProjectRoot(input, fallbackRoot) {
  return process.env.CLAUDE_PROJECT_DIR
      || (input && input.cwd)
      || fallbackRoot
      || process.cwd();
}

module.exports = { resolveProjectRoot };
