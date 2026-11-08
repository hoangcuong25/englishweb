---
description: >
  Khởi tạo trạng thái task mới khi bắt đầu implement một tính năng. Kích hoạt khi
  nghe "implement [X]", "build [X]", "tạo [X]", "viết [X]", "thêm tính năng [X]",
  "bắt đầu làm [X]", "start task". Tạo .claude/state/current-task.md với format chuẩn.
---

# Task State Init Skill

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** thực thi skill này khi:
- Nhận request chứa "implement/tạo/viết/build/thêm/code [X]" **VÀ** chưa có `current-task.md` với `status: in_progress`.

**NEVER** bắt đầu viết code khi chưa hoàn thành đủ 4 bước của skill này.

---

## Mục đích
Tạo hoặc reset `current-task.md` (trong namespace của dev) để theo dõi task đang thực hiện.
Đảm bảo mọi implementation có trạng thái rõ ràng, không mất context giữa các session.

> **State theo namespace từng dev** (`.claude/state/<dev-id>/`) — mỗi dev một thư mục riêng nên
> khi merge nhánh chung không giẫm lên nhau; cả đội đọc gộp `state/*/` để biết "ai đang làm gì".

## Quy trình

### Bước 0 — Xác định namespace & bootstrap
- Chạy `git config user.email` → `dev-id` = phần trước `@`, lowercase, ký tự ngoài `[a-z0-9._-]` → `-`
  (vd `quanggv2@fpt.com` → `quanggv2`). Email rỗng → `local-dev` + cảnh báo nên đặt `git config user.email`.
- Nếu thư mục `.claude/state/<dev-id>/` **chưa tồn tại** → tạo bằng cách **copy toàn bộ**
  `.claude/state/_template/` vào `.claude/state/<dev-id>/` (bootstrap đủ 5 file skeleton).
- Mọi đường dẫn state phía dưới đều nằm trong `.claude/state/<dev-id>/`.

### Bước 1 — Thu thập thông tin & đánh giá sơ bộ
Nếu chưa rõ, hỏi user:
- Tên task / tính năng là gì?
- Tiêu chí hoàn thành (Definition of Done)?
- Ràng buộc kỹ thuật đặc biệt?

**Đánh giá sơ bộ** (mức nhẹ — KHÔNG đọc sâu kiến trúc, để dành cho agent `developer`):
- Loại thay đổi (tính năng mới / sửa lỗi / refactor…) và tầng dự kiến (server / UI / cả hai).
- Phạm vi & ảnh hưởng thô (1 file / nhiều file / chạm nhiều module).
- Có yếu tố đặc biệt không (DB/migration, đổi public API, bảo mật).

> Mục đích đánh giá sơ bộ: chỉ để **chọn & điều chỉnh khung tổng quan** ở Bước 3.
> Việc đọc kiến trúc, liệt kê file chi tiết là của agent `developer` (Bước 2 của agent) — **KHÔNG làm ở đây**.

### Bước 2 — Kiểm tra current-task.md
- Đọc `.claude/state/<dev-id>/current-task.md`.
- Nếu `status: in_progress` → hỏi user:
  "Đang có task '[tên]' đang dở. Tiếp tục task cũ hay tạo task mới?"
  (Tạo mới = **ghi đè**, không lưu lịch sử task cũ — theo thiết kế state Phase 3C.)
- Nếu `status: done`/`idle` → tạo mới.

### Bước 3 — Tạo / reset file

Ghi `.claude/state/<dev-id>/current-task.md` theo format:

```markdown
---
task: <tên task ngắn gọn>
created: <YYYY-MM-DD>
status: in_progress
---

## Mô tả
<mô tả nhiệm vụ 1-3 câu>

## Thiết kế liên quan
<trỏ `project-knowledge/design/<MÃ_CHỨC_NĂNG>/` nếu có; chưa có → `không`>

## Definition of Done
- [ ] <tiêu chí 1>
- [ ] <tiêu chí 2>

## Các bước thực hiện (tổng quan)
- [ ] 1. Đối chiếu & phân tích ảnh hưởng (spec/rules/convention/architecture)
- [ ] 2. Lập kế hoạch chi tiết — file cần sửa
- [ ] 3. Triển khai code + test (theo playbook đang bật)
- [ ] 4. Chạy test & xác nhận PASS
- [ ] 5. Review đúng tầng (code-review-*) & chuẩn bị MR

## Tái sử dụng
_Trống — skill `reuse-scan` điền ở Bước 2a của agent `developer` (Reuse Report: DÙNG LẠI / MỞ RỘNG / VIẾT MỚI)._

## Kế hoạch chi tiết
_Trống — agent `developer` sẽ điền ở Bước 2 (file cần tạo/sửa + bước con) sau khi đọc kiến trúc._

## Blockers / Ghi chú
_chưa có_
```

> **Mục "Các bước thực hiện (tổng quan)"** dùng **khung thông dụng** ở trên làm mặc định.
> Dựa vào *đánh giá sơ bộ* (Bước 1), điều chỉnh nhẹ cho khớp task:
> - Có DB/migration → thêm bước migration.
> - Task vặt / 1 file → có thể bỏ bước 5 (review).
> - KHÔNG đi vào chi tiết file/hàm — đó là việc của agent `developer`.
>
> **Mục "Tái sử dụng" và "Kế hoạch chi tiết" để TRỐNG** ở bước này; agent `developer` ghi vào ở Bước 2a
> (qua skill `reuse-scan`) và Bước 2 (xem Liên kết).

### Bước 4 — Xác nhận với user
Hiển thị task vừa tạo và hỏi "Bắt đầu implement không?"

## Liên kết
- Thiết kế từ spec TRƯỚC khi code (nếu chức năng mới) → agent `solution-architect` → `architect-reviewer`
- Quét cái đã có trước khi viết mới → skill `reuse-scan` (ghi mục "Tái sử dụng")
- Chi tiết hoá "Kế hoạch chi tiết" (file + bước con) → agent `developer-backend` / `developer-frontend` (Bước 2)
- Cập nhật tiến độ trong session → skill `progress-tracker`
- Bàn giao / kết thúc phiên → lệnh `/cf-handoff`
- Mở lại phiên trước → lệnh `/cf-resume`
