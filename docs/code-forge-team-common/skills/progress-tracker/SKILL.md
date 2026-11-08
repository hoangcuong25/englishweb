---
description: >
  Cập nhật tiến độ task đang thực hiện. Kích hoạt khi nghe "đến đâu rồi",
  "tiến độ", "update progress", "progress", "xong bước", "hoàn thành bước",
  "đã xong [X]", "cập nhật tiến độ", "còn lại gì", "còn bao nhiêu nữa".
---

# Progress Tracker Skill

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** thực thi skill này khi:
- Hoàn thành bất kỳ bước nào trong quá trình implement (không chờ user hỏi "tiến độ đến đâu").
- Agent `developer` hoàn thành Bước 3 (viết code) hoặc Bước 4 (viết test).
- Tất cả DoD item đã tick → đổi `status: done` trong `current-task.md`.

**NEVER** kết thúc một bước implement mà không cập nhật `progress.md` và tick checkbox.

---

## Mục đích
Đọc `current-task.md` và cập nhật `progress.md` trong namespace của dev
(`.claude/state/<dev-id>/`) — phản ánh chính xác trạng thái hiện tại của task.

> State theo namespace từng dev (`.claude/state/<dev-id>/`) để merge nhánh chung không conflict.

## Quy trình

### Bước 1 — Xác định namespace & đọc current-task.md
- `dev-id` = phần trước `@` của `git config user.email`, lowercase, ký tự lạ → `-`
  (rỗng → `local-dev`). Làm việc trong `.claude/state/<dev-id>/`.
- Đọc `.claude/state/<dev-id>/current-task.md`.
  - Nếu thư mục/`current-task.md` không tồn tại → nhắc user chạy skill `task-state-init` trước.
- Đọc: task name, DoD checklist, "Các bước thực hiện (tổng quan)" và "Kế hoạch chi tiết".

### Bước 2 — Đánh giá tiến độ
- Tick các DoD item, bước **tổng quan** và bước con trong **"Kế hoạch chi tiết"** đã hoàn thành
  (dựa vào code đã viết + thông tin user cung cấp). Nếu "Kế hoạch chi tiết" còn trống → nhắc chạy
  agent `developer` Bước 2 để điền trước khi đo tiến độ chi tiết.
- Xác định bước đang làm hiện tại
- Ước tính % hoàn thành (ưu tiên theo bước con "Kế hoạch chi tiết" nếu đã có; nếu chưa → theo bước tổng quan)

### Bước 3 — Ghi progress.md

Ghi `.claude/state/<dev-id>/progress.md` theo format:

```markdown
---
task: <tên task từ current-task.md>
updated: <YYYY-MM-DD HH:MM>
percent: <0-100>
---

## Đang làm
- Bước hiện tại: <tên bước>
- Tóm tắt: <1-2 câu mô tả đang làm gì>

## Đã xong (session này)
- <mục 1 đã hoàn thành>

## Còn lại
- <mục chưa làm 1>

## Blockers
<nếu không có: "_không có_">
```

### Bước 4 — Tóm tắt cho user
Hiển thị ngắn gọn: "Task [tên]: [X]% — Đang làm [bước]. Còn [N] bước nữa."

### Bước 5 — Cập nhật current-task.md
Tick checkbox trong `.claude/state/<dev-id>/current-task.md` cho các bước đã xong.

**Cổng test (bắt buộc trước khi `done`):** chỉ tick DoD liên quan tới code và **chỉ** đổi
`status: done` khi đã có **bằng chứng test chạy và PASS** trong session (output test thật).
Nếu test chưa chạy hoặc còn fail → **giữ `status: in_progress`**, không tick DoD đó, và nhắc lại
ràng buộc "chạy test xác nhận PASS" của agent `developer-backend` / `developer-frontend`.

Nếu tất cả DoD item đều tick (đã qua cổng test) → đổi `status: done`.

## Liên kết
- Khởi tạo task mới → skill `task-state-init`
- Bàn giao / kết thúc phiên → lệnh `/cf-handoff`; mở lại phiên → lệnh `/cf-resume`
- Thu thập tech debt phát sinh → skill `tech-debt-collector` (backlog)
