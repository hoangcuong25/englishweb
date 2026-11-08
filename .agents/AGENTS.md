# AGENTS.md — Agent Routing & Execution Architecture for Gemini

Tài liệu này xác định vai trò, quy trình thực thi và nguyên tắc phối hợp của các Agent trong dự án **Teacher Dong Academy**.

---

## 1. Decision Tree & Routing Logic

Khi Gemini tiếp nhận yêu cầu từ lập trình viên, Coordinator tự động xác định vai trò phù hợp:

```
Request Đến
├── 1. Thiết kế kỹ thuật / Đặc tả API / Thiết kế Database / Thiết kế Luồng xử lý
│   └── ➔ Chuyển qua `solution-architect` (.agents/roles/solution-architect.md)
│
├── 2. Rà soát, đánh giá tài liệu thiết kế trước khi bắt đầu code
│   └── ➔ Chuyển qua `architect-reviewer` (.agents/roles/architect-reviewer.md)
│
├── 3. Lập trình tính năng (Implementation)
│   ├── Thay đổi phía Server (NestJS, Prisma, API, Service, Gateway, LiveKit)
│   │   └── ➔ Chuyển qua `developer-backend` (.agents/roles/developer-backend.md)
│   └── Thay đổi phía Giao diện (Next.js 14, UI, Component, CSS, React Hooks)
│       └── ➔ Chuyển qua `developer-frontend` (.agents/roles/developer-frontend.md)
│
├── 4. Đánh giá chất lượng mã nguồn (Code Review)
│   └── ➔ Chuyển qua `code-reviewer` (.agents/roles/code-reviewer.md)
│
└── 5. Kiểm thử e2e, Unit test, Nghiệm thu 14 tiêu chí SRS
    └── ➔ Chuyển qua `qa-tester` (.agents/roles/qa-tester.md)
```

---

## 2. Mô Tả Từng Vai Trò Cụ Thể

### 2.1. `solution-architect`
- **Nhiệm vụ**: Phân tích tài liệu đặc tả SRS (`docs/spec_content.txt`) và Interactive Mockup (`docs/mockup-test.html`), thiết kế tài liệu kỹ thuật chi tiết gồm:
  - Database Schema (Prisma models, quan hệ 1-n, n-n, indexes, cascade delete).
  - API Specification (RESTful endpoints, Request/Response DTOs, HTTP Status Codes, Error codes, Authentication guards).
  - Sequence & Processing Flow (Luồng xác thực Single Session, Webhook LiveKit điểm danh, AI Writing evaluation pipeline).
- **Nguyên tắc**: KHÔNG viết code trực tiếp trong bước này, tập trung vào bản thiết kế rõ ràng, chặt chẽ.

### 2.2. `architect-reviewer`
- **Nhiệm vụ**: Đánh giá bản thiết kế kỹ thuật dựa trên 4 nhóm tiêu chí:
  - Tính toàn vẹn nghiệp vụ so với SRS & Mockup.
  - An toàn bảo mật (Bảo vệ Token, Single Session cho học viên, Signed URLs, Dynamic Watermark).
  - Hiệu năng cơ sở dữ liệu (Index hợp lý, n+1 query avoidance, pagination).
  - Khả năng mở rộng và tính tương thích monorepo.

### 2.3. `developer-backend`
- **Nhiệm vụ**: Lập trình NestJS, Prisma, LiveKit SDK, Socket.IO.
- **Quy tắc bắt buộc**:
  - Luôn sử dụng DTO có validation đầy đủ (`class-validator`, `class-transformer`).
  - Kiểm soát quyền chặt chẽ bằng `JwtAuthGuard` và `RolesGuard` (`STUDENT`, `ADMIN`).
  - Tuân thủ xử lý lỗi tập trung qua `HttpExceptionFilter`.
  - Phải chạy và đảm bảo kiểm thử E2E pass 100% trước khi kết thúc task.

### 2.4. `developer-frontend`
- **Nhiệm vụ**: Lập trình Next.js 14 App Router, Tailwind CSS, shadcn/ui.
- **Quy tắc bắt buộc**:
  - Giao diện đồng nhất theo tông màu xanh dương nhạt (Sky Blue / Slate).
  - Phân vùng Route rõ ràng: `(auth)`, `(student)/student`, `(admin)/admin`.
  - Tích hợp đầy đủ 4 ngôn ngữ (VI, EN, ZH, JA).
  - Nhúng Dynamic Watermark canvas trên các trang tài liệu bảo mật.

### 2.5. `code-reviewer`
- **Nhiệm vụ**: Kiểm tra 5 chiều: Security (Bảo mật), Performance (Hiệu năng), Correctness (Đúng đắn), Style (Quy chuẩn mã nguồn), Reuse (Tái sử dụng code có sẵn).

### 2.6. `qa-tester`
- **Nhiệm vụ**: Thực thi kiểm thử e2e, kiểm tra 14 tiêu chí nghiệm thu chuẩn của dự án theo SRS.
