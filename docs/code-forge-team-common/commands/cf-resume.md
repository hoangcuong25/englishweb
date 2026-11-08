---
description: >
  Tiếp tục phiên làm việc trước đó. Đọc session-handoff.md (+ current-task, progress) của dev hiện tại,
  tóm tắt nơi đã dừng và việc kế tiếp, rồi HỎI trước khi viết code. Chỉ chạy khi user gõ /cf-resume.
disable-model-invocation: true
argument-hint: "(không cần tham số)"
---

# /cf-resume — Tiếp tục phiên (Session Resume)

> Lệnh người dùng chủ động gọi ở ranh giới **mở lại phiên**. Tái lập ngữ cảnh từ handoff đã lưu.
> **KHÔNG tự động viết code** — chỉ tóm tắt rồi chờ user quyết định.

## Quy trình (thực thi tuần tự — không bỏ bước)

### Bước 1 — Xác định dev-id
- Chạy `git config user.email` → `dev-id` (cùng quy tắc với `/cf-handoff`:
  phần trước `@`, lowercase, ký tự lạ → `-`; rỗng → `local-dev`).
- Đường dẫn: `.claude/state/<dev-id>/`.

### Bước 2 — Đọc handoff + state
- Đọc `.claude/state/<dev-id>/session-handoff.md`.
  - Nếu file không tồn tại hoặc `status: idle` / `task` rỗng → báo
    "Chưa có phiên nào được lưu cho `<dev-id>`. Gõ `/cf-handoff` trước khi kết thúc phiên để lưu."
    rồi DỪNG.
- Đọc kèm `current-task.md` và `progress.md` cùng namespace để đối chiếu.

### Bước 3 — Tóm tắt cho user
Trình bày gọn:
- **Task:** `<task>` — status `<status>`, `<percent>`%
- **Đã dừng ở:** `<bước hiện tại>`
- **File đang sửa:** `<danh sách từ handoff>`
- **Quyết định/context:** `<tóm tắt>`
- **Blockers:** `<nếu có>`
- **Next steps:** `<checklist từ handoff>`

### Bước 4 — Hỏi trước khi tiếp tục
Hỏi rõ: **"Tiếp tục từ đây không? (bước kế: <next step đầu tiên>)"**
- **NEVER** tự động bắt đầu viết/sửa code ngay sau khi resume.
- Chỉ khi user xác nhận → đi theo routing thường lệ (procedure `developer-*` theo tầng, các playbook đang bật...).

## Ràng buộc
- **MUST** chỉ đọc namespace `state/<dev-id>/` của chính dev hiện tại.
- **NEVER** sửa state khi resume — `/cf-resume` là thao tác đọc + tóm tắt, không ghi.

## Liên kết
- Lưu phiên → lệnh `/cf-handoff`
- Cập nhật tiến độ sau khi tiếp tục → skill `progress-tracker`
