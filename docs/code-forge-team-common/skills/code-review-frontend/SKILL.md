---
description: >
  Review nhanh code tầng FRONTEND (UI / client-side) theo 5 chiều: Security,
  Performance, Correctness, Style, Reuse & Duplication. Kích hoạt khi review/check code giao diện (màn
  hình, component, view, luồng tương tác) trong session — trước khi commit. Review
  toàn diện trước MR dùng agent code-reviewer-frontend. Review server → skill code-review-backend.
---

# Code Review Skill — Frontend (UI / client-side)

> Tiêu chí cụ thể lấy từ knowledge của dự án (`frontend/*` + `shared/security-policy.md` + `architecture.md`).
> Skill này chỉ định nghĩa 5 chiều cần soi — không gắn cứng stack.

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** thực thi khi:
- Implement xong code giao diện — **trước khi commit**.
- Nhận "review", "check code", "kiểm tra code" cho thay đổi tầng frontend.

**NEVER** commit code frontend mà không chạy đủ 5 chiều.
Review toàn diện trước MR → **agent `code-reviewer-frontend`**. Thay đổi server → **skill `code-review-backend`**.

---

## Quy trình (4 bước nhanh)

### Bước 1 — Xác định phạm vi
Hỏi nếu chưa rõ: file / component / diff nào? Nếu user chỉ định rồi → bắt đầu luôn.

### Bước 2 — Chạy 5 chiều review (chi tiết theo `frontend/*` knowledge)
- **Security:** secret trong code/bundle? log lộ token/PII? xác thực/token đúng cơ chế `frontend/security.md`? phân quyền hiển thị chỉ cho UX?
- **Performance:** render lại thừa? nạp động/lazy-load? gọi mạng lặp (tận dụng cache)?
- **Correctness:** khớp `domain-glossary` & yêu cầu? null/undefined? dọn side-effect (rò rỉ)? trạng thái loading/error?
- **Style** (`frontend/coding-convention.md`): đặt tên/file/kích thước? tách logic khỏi view? gọi API qua lớp riêng?
- **Reuse & Duplication:** thay đổi có tạo util/helper/mapper/converter/formatter/validator/constant mới? Có **Reuse Report** trong `current-task.md` (skill `reuse-scan`) không? Có tương đương trong thư viện dùng chung hoặc trong `src/` không (tra trên source hiện tại; Reuse Report ghi rõ đã tra cách nào)? Logic lặp ≥2 chỗ?

### Bước 3 — Phân loại phát hiện

| Mức | Ý nghĩa |
|---|---|
| CRITICAL | Phải sửa ngay (security hole, data loss, logic sai) |
| MAJOR | Nên sửa (performance, maintainability) |
| MINOR | Cân nhắc (style, micro-opt) |

### Bước 4 — Đề xuất sửa
Với mỗi CRITICAL / MAJOR: đưa đoạn code gợi ý cụ thể.

## Liên kết
- Review toàn diện trước MR → agent `code-reviewer-frontend`
- Chuẩn đặt tên / format → `frontend/coding-convention.md`
- Chuẩn bảo mật → `shared/security-policy.md` + `frontend/security.md`
