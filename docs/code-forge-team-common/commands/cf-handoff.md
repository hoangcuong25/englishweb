---
description: >
  Lưu trạng thái phiên làm việc hiện tại để bàn giao / tiếp tục sau. Đọc state của dev hiện tại
  (current-task, progress), gom file đang sửa từ git, rồi GHI ĐÈ session-handoff.md. Chỉ chạy khi
  user gõ /cf-handoff (không tự kích hoạt).
disable-model-invocation: true
argument-hint: "(không cần tham số)"
---

# /cf-handoff — Lưu phiên (Session Handoff)

> Lệnh người dùng chủ động gọi ở ranh giới **kết thúc phiên**. Đóng gói state do skill
> `task-state-init` / `progress-tracker` tạo ra thành 1 snapshot bàn giao.
> Bàn giao theo **namespace từng dev** (`state/<dev-id>/`) — không giẫm lên dev khác khi merge.

## Quy trình (thực thi tuần tự — không bỏ bước)

### Bước 1 — Xác định dev-id
- Chạy `git config user.email`.
- `dev-id` = phần trước `@`, lowercase, thay ký tự ngoài `[a-z0-9._-]` bằng `-`
  (vd `quanggv2@fpt.com` → `quanggv2`).
- Nếu email rỗng → dùng `local-dev` và **cảnh báo** user nên đặt `git config user.email`.
- Đường dẫn state của phiên này: `.claude/state/<dev-id>/`.

### Bước 2 — Đọc state hiện tại
- Đọc `.claude/state/<dev-id>/current-task.md` và `progress.md`.
- Nếu chưa có `state/<dev-id>/` → báo "Chưa có task nào đang theo dõi cho <dev-id>; không có gì để handoff."
  rồi DỪNG (không tạo file rỗng vô nghĩa).

### Bước 3 — Gom file đang sửa dở
- Chạy `git status --short` và `git diff --name-only` → danh sách file đang thay đổi/chưa commit.

### Bước 4 — Ghi đè session-handoff.md
Ghi `.claude/state/<dev-id>/session-handoff.md` theo format (ghi đè toàn bộ, không append):

```markdown
---
dev: <dev-id>
saved: <YYYY-MM-DD HH:MM>
task: <tên task từ current-task.md>
status: <status từ current-task.md>
percent: <percent từ progress.md>
---

## Phiên bàn giao

## Đang làm dở
- Task: <task>
- Bước hiện tại: <bước đang làm, từ progress.md>

## File đang sửa (từ git status lúc handoff)
- <liệt kê từ Bước 3>

## Quyết định / context quan trọng của phiên
- <tóm tắt quyết định trong phiên + tham chiếu decisions-log.md nếu có>

## Blockers
- <từ current-task.md / progress.md; không có → "_không có_">

## Next steps (làm gì khi quay lại / /cf-resume)
- [ ] <việc tiếp theo rõ ràng>
```

### Bước 5 — Xác nhận
Báo ngắn: "Đã lưu handoff cho `<dev-id>` (task `<task>`, `<percent>`%). Gõ `/cf-resume` để tiếp tục."

## Ràng buộc
- **MUST** ghi vào đúng namespace `state/<dev-id>/` — NEVER ghi ra `state/` phẳng (sẽ gây conflict khi merge).
- **NEVER** xoá/sửa state của dev-id khác.
- Snapshot **ghi đè** — không lưu lịch sử phiên cũ (theo thiết kế state Phase 3C).

## Liên kết
- Tiếp tục phiên → lệnh `/cf-resume`
- Khởi tạo / cập nhật task → skill `task-state-init`, `progress-tracker`
