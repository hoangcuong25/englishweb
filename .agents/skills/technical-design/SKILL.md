---
name: technical-design
description: >-
  Kỹ năng xây dựng tài liệu thiết kế kỹ thuật, đặc tả API RESTful, thiết kế luồng xử lý và mô hình dữ liệu trước khi lập trình.
---

# Technical Design Skill

## 1. Quy Trình Soạn Thảo Thiết Kế
1. **Phân tích yêu cầu**: Bám sát nghiệp vụ trong `docs/spec_content.txt` và giao diện mẫu `docs/mockup-test.html`.
2. **Thiết kế API Contract**:
   - URL path theo chuẩn số nhiều danh từ (`/api/courses`, `/api/quizzes`, `/api/auth/login`).
   - Request DTO kèm validation decorators.
   - Response envelope mẫu: `{ statusCode, message, data }`.
   - Bảng mã lỗi chi tiết và HTTP Status tương ứng.
3. **Mô hình hóa dữ liệu**: Xác định các bảng Prisma, khóa ngoại, unique constraints, cascade deletion.
4. **Thiết kế Sequence Diagram**: Luồng tương tác giữa Client ➔ Next.js / Controller ➔ Service ➔ Database / External Services (LiveKit / AI).
