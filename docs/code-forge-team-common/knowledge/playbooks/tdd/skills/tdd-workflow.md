---
description: >
  Khi dev yêu cầu implement tính năng mới hoặc sửa logic nghiệp vụ, tự động áp dụng
  quy trình TDD (Red→Green→Refactor). Kích hoạt khi nghe "implement [X]", "tạo [X]",
  "build [X]", "viết function [X]", "thêm tính năng [X]", "fix bug [X]". Chỉ áp dụng
  khi playbook tdd đang enabled trong .claude/settings.json.
---

# TDD Workflow Skill

> Lớp 2 (Skill) của playbook TDD. Tự kích hoạt để Claude **hành động đúng quy trình** mà dev
> không cần nhớ gọi tay. Phối hợp với agent `developer-backend` / `developer-frontend` (developer chịu
> trách nhiệm viết code, skill này áp khung TDD lên cách viết).

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** áp dụng skill này khi:
- `playbooks.tdd.enabled = true` trong `.claude/settings.json`, **VÀ**
- Nhận request "implement/tạo/build/viết function/thêm tính năng/fix bug [X]" có behavior kiểm chứng được.

**NEVER** viết implementation trước khi có test FAIL tương ứng (vi phạm cốt lõi TDD).

---

## Quy trình bắt buộc (lặp cho từng behavior)

1. **Đọc spec/yêu cầu** → liệt kê các behavior cần implement, chọn behavior nhỏ nhất làm trước.
2. **🔴 RED**: Viết **1** test case TRƯỚC → chạy test → **xác nhận FAIL** (fail vì thiếu code, không phải lỗi import).
3. **🟢 GREEN**: Viết code **tối thiểu** để test pass → chạy test → **xác nhận PASS**.
4. **🔵 REFACTOR**: Cải thiện code (khử trùng lặp, đặt tên) → chạy test → **xác nhận vẫn PASS**.
5. **Commit** cycle (test + code cùng nhau) → quay lại bước 2 cho behavior tiếp theo.

## Ràng buộc

- **KHÔNG BAO GIỜ** viết implementation trước test.
- **KHÔNG** viết nhiều test cùng lúc — từng test một.
- **KHÔNG** thêm behavior trong pha Refactor.
- Mỗi cycle Red→Green→Refactor = 1 commit có cả test lẫn code.

## Phối hợp với hệ thống

- Quy ước đặt test file: xem `knowledge/tdd-guide.md §Quy ước test file`.
- Hook `tdd-guard.js` sẽ nhắc (warn) hoặc chặn (block) nếu sửa `src/` mà chưa có test — theo
  `enforcement` trong `settings.json`. Skill này giúp **không bao giờ chạm tới cảnh báo đó**.
- Sau mỗi cycle hoàn thành: gọi `progress-tracker` để cập nhật `.claude/state/progress.md`.
