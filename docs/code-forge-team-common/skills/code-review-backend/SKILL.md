---
description: >
  Review nhanh code tầng BACKEND (server-side) theo 5 chiều: Security, Performance,
  Correctness, Style, Reuse & Duplication. Kích hoạt khi review/check code phía server (API, service,
  dữ liệu, business logic) trong session — trước khi commit. Review toàn diện
  trước MR dùng agent code-reviewer-backend. Review giao diện → skill code-review-frontend.
---

# Code Review Skill — Backend (server-side)

> Tiêu chí cụ thể lấy từ knowledge của dự án (`backend/*` + `shared/security-policy.md` + `architecture.md`).
> Skill này chỉ định nghĩa 5 chiều cần soi — không gắn cứng stack.

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** thực thi khi:
- Implement xong code phía server — **trước khi commit**.
- Nhận "review", "check code", "kiểm tra code" cho thay đổi tầng backend.

**NEVER** commit code backend mà không chạy đủ 5 chiều.
Review toàn diện trước MR → **agent `code-reviewer-backend`**. Thay đổi giao diện → **skill `code-review-frontend`**.

---

## Quy trình (4 bước nhanh)

### Bước 1 — Xác định phạm vi
Hỏi nếu chưa rõ: file / function / diff nào? Nếu user chỉ định rồi → bắt đầu luôn.

### Bước 2 — Chạy 5 chiều review (chi tiết theo `backend/*` knowledge)
- **Security:** secret hardcode? log lộ PII/token? truy cập dữ liệu an toàn? phân quyền đúng cơ chế `backend/security.md`?
- **Performance:** **số truy vấn mỗi request có trong ngưỡng `shared/non-functional-standards.md §1`** (đọc chi tiết 3 · danh sách 4 · ghi 6 — vượt mà chưa được xác nhận lúc code = MAJOR)? truy vấn lặp (N+1)? phân trang? I/O nặng trong vòng lặp? **Native SQL có được justify (JPA bất khả) hay nên thay bằng JPA/derived/JPQL?** — xem `backend/coding-convention.md §6`.
- **Correctness:** khớp `domain-glossary` & yêu cầu? xử lý null/biên? lỗi & ranh giới giao dịch đúng?
- **Style** (`backend/coding-convention.md`): đặt tên/format/kích thước? quản lý dependency? ranh giới model/đóng gói theo `architecture.md`?
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
- Review toàn diện trước MR → agent `code-reviewer-backend`
- Chuẩn đặt tên / format → `backend/coding-convention.md`
- Chuẩn bảo mật → `shared/security-policy.md` + `backend/security.md`
- Ngưỡng số truy vấn / phân trang / index → `shared/non-functional-standards.md §1`
