# GEMINI.md — Orchestration & Development Hub for Teacher Dong Academy

> Trung tâm điều phối phát triển toàn diện của Gemini Agent cho dự án **Teacher Dong Academy** (LMS & WebRTC In-house).
> Bám sát tài liệu đặc tả SRS (`docs/spec_content.txt`) và Interactive Prototype (`docs/mockup-test.html`).

---

## 1. Tổng Quan Dự Án & Nguyên Tắc Cốt Lõi

- **Tên dự án**: Teacher Dong Academy – Nền tảng đào tạo trực tuyến chuẩn EdTech hiện đại.
- **Mục tiêu**: Đào tạo tiếng Anh (IELTS, Business English, Kids) & Phát triển năng lực giảng dạy/kỹ năng sống, tích hợp lớp học trực tuyến WebRTC LiveKit, AI Writing Assessment, Speaking Studio và hệ thống kiểm soát chuyên cần tự động.
- **Nguyên tắc 2 VAI TRÒ DUY NHẤT (Strict 2-Role RBAC)**:
  1. `STUDENT`: Học viên (học bài, làm quiz, nộp bài Writing AI, ghi âm Speaking, tham gia lớp LiveKit, tương tác bảng trắng, theo dõi tiến độ).
  2. `ADMIN`: Chủ sở hữu kiêm Giáo viên & Quản trị viên (quản lý khóa học, bài học, tài liệu, duyệt điểm AI Writing, nghe & chấm bài Speaking, host lớp LiveKit, kiểm soát mic/cam, quản trị điểm danh và dashboard).
  > ⚠️ **TUYỆT ĐỐI KHÔNG TẠO VAI TRÒ GIÁO VIÊN TRUNG GIAN (TEACHER ROLE)**. Toàn bộ logic phân quyền chỉ xoay quanh `STUDENT` và `ADMIN`.

- **Cơ chế Single Concurrent Session**:
  - Đối với `STUDENT`: Mỗi tài khoản chỉ được phép đăng nhập trên 1 thiết bị/trình duyệt tại một thời điểm. Đăng nhập mới sẽ lập tức vô hiệu hóa phiên cũ.
  - Đối với `ADMIN`: Cho phép kiểm soát phiên linh hoạt phục vụ quản trị và giảng dạy.

- **Bảo mật học liệu số**:
  - Học liệu (PDF, MP3) lưu trữ tại Private Storage (Local/S3), truy cập qua Presigned Signed URL thời hạn 15 phút.
  - Tích hợp Dynamic Watermark (Hiển thị Họ tên + SĐT + Mã học viên chuyển động liên tục trên canvas) chống quay chụp màn hình. Không cung cấp nút tải trực tiếp tài liệu gốc.

---

## 2. Ngăn Xếp Kỹ Thuật & Quy Chuẩn Cấu Trúc Mã Nguồn

### 2.1. Cấu Trúc Monorepo
- `server/`: Backend NestJS (TypeScript), Prisma ORM, MySQL 8.0, JWT HTTP-Only Cookies, Socket.IO, LiveKit Server SDK, Swagger OpenAPI.
- `client/`: Frontend Next.js 14+ (App Router, TypeScript), Tailwind CSS, shadcn/ui (Tone màu Sky Blue / Slate), `@livekit/components-react`, Whiteboard Canvas, Web Audio API Recorder.
- `docker-compose.yml`: Triển khai MySQL 8.0, LiveKit Server, NestJS API, Next.js Web, Nginx.
- **i18n**: Hỗ trợ 4 ngôn ngữ chuẩn xác trên toàn bộ giao diện: `VI` (Tiếng Việt), `EN` (English), `ZH` (中文), `JA` (日本語).

### 2.2. Quy Chuẩn Tổ Chức Thư Mục Backend (`server/src/`) — BẮT BUỘC TUÂN THỦ
Toàn bộ mã nguồn phía server được phân chia nghiêm ngặt thành 2 vùng rõ ràng:

```
server/src/
├── core/                                # 🛠️ VÙNG HẠ TẦNG NỀN TẢNG (INFRASTRUCTURE & SHARED)
│   ├── common/                          # Guards (JwtAuthGuard, RolesGuard), Decorators (CurrentUser, Roles), Filters
│   ├── livekit/                         # LiveKit WebRTC Token generation, SFU management & Webhook
│   └── prisma/                          # Prisma ORM client & service dùng chung toàn hệ thống
│
├── modules/                             # 📦 VÙNG PHÂN HỆ NGHIỆP VỤ (BUSINESS MODULES)
│   │                                    # ⚠️ TẤT CẢ các module tính năng BẮT BUỘC nằm tại đây!
│   ├── auth/                            # Module Xác thực, Phiên đăng nhập đơn, Google OAuth
│   ├── courses/                         # Quản lý khóa học, danh mục, phân cấp
│   ├── lessons/                         # Quản lý chương bài học & video
│   ├── materials/                       # Kho học liệu số, Watermark, Presigned URLs
│   ├── quizzes/                         # Hệ thống thi trắc nghiệm & tự động chấm
│   ├── speaking/                        # Studio luyện nói, Audio wave, chấm 4 tiêu chí
│   ├── writing/                         # Studio luyện viết IELTS, tích hợp AI, Admin duyệt
│   ├── attendance/                      # Đồng bộ chuyên cần, tính phút, xuất Excel
│   ├── dashboard/                       # Tổng quan học tập cho Student & Admin
│   └── chat/                            # Nhắn tin Socket.IO thời gian thực
│
├── app.controller.ts
├── app.module.ts                        # Nạp core modules & business modules
├── app.service.ts
└── main.ts                              # Khởi tạo NestJS app, Swagger OpenAPI, Global Pipes
```

> ⚠️ **QUY TẮC ĐƯỜNG DẪN IMPORT TRONG MODULE**:
> - Khi gọi Prisma: `import { PrismaService } from '../../core/prisma/prisma.service';`
> - Khi gọi Guards: `import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';`
> - Khi gọi Decorators: `import { CurrentUser } from '../../core/common/decorators/current-user.decorator';`
> - **TUYỆT ĐỐI KHÔNG TẠO MODULE NGHIỆP VỤ TRỰC TIẾP TẠI `server/src/` GỐC**.

---

## 3. Decision Tree & Routing Vai Trò Của Agent Gemini

Mỗi khi nhận yêu cầu từ người dùng, Gemini Coordinator tự động kích hoạt procedure tương ứng:

```
Nhận yêu cầu
│
├── 1. Thiết kế kỹ thuật từ spec/yêu cầu (API, DB, Flow, Class - CHƯA CODE)
│   └── ➔ Thực thi procedure `solution-architect` (.agents/roles/solution-architect.md)
│
├── 2. Review tài liệu thiết kế trước khi code
│   └── ➔ Thực thi procedure `architect-reviewer` (.agents/roles/architect-reviewer.md)
│
├── 3. Lập trình / Implement code chức năng
│   ├── Thay đổi phía Server (API, DB, Service, Gateway) ➔ `developer-backend` (.agents/roles/developer-backend.md)
│   └── Thay đổi phía Client (UI, Component, Page, Hook) ➔ `developer-frontend` (.agents/roles/developer-frontend.md)
│
├── 4. Review code & kiểm tra chất lượng trước khi bàn giao
│   └── ➔ Thực thi procedure `code-reviewer` (.agents/roles/code-reviewer.md)
│
└── 5. Kiểm thử End-to-End & nghiệm thu theo SRS 14 tiêu chí
    └── ➔ Thực thi procedure `qa-tester` (.agents/roles/qa-tester.md)
```

---

## 4. Danh Mục Skills Bắt Buộc Của Dự Án

| Skill Name | Vị trí định nghĩa | Mục đích & Phạm vi sử dụng |
|---|---|---|
| `prisma-mysql-schema` | `.agents/skills/prisma-mysql-schema/SKILL.md` | Thiết kế, migrate & seed dữ liệu MySQL Prisma chuẩn 11 phân hệ |
| `technical-design` | `.agents/skills/technical-design/SKILL.md` | Soạn thảo tài liệu đặc tả API, Class diagram và luồng xử lý |
| `livekit-webrtc` | `.agents/skills/livekit-webrtc/SKILL.md` | Tích hợp phòng học WebRTC LiveKit 1 Host + 7-8 Students & Whiteboard |
| `speaking-recorder-assessment` | `.agents/skills/speaking-recorder-assessment/SKILL.md` | Web Audio API wave recorder & giao diện Admin chấm IELTS Speaking 4 tiêu chí |
| `ai-writing-evaluation` | `.agents/skills/ai-writing-evaluation/SKILL.md` | Tích hợp AI chấm IELTS Writing 4 tiêu chí & Admin review/override |
| `attendance-sync` | `.agents/skills/attendance-sync/SKILL.md` | LiveKit webhook tính phút tham gia, phân loại PRESENT/LATE/ABSENT & export Excel |
| `english-lms-nextjs-theme` | `.agents/skills/english-lms-nextjs-theme/SKILL.md` | Xây dựng giao diện Next.js 14 App Router, Slate/Sky blue theme, i18n |
| `code-review` | `.agents/skills/code-review/SKILL.md` | Đánh giá code 5 chiều: Security, Performance, Correctness, Style, Reuse |

---

## 5. Ma Trận 11 Phân Hệ Chức Năng (Tra Cứu Chi Tiết)

1. **Authentication & Session**: Email/Pass, Google OAuth 2.0, Single Concurrent Session học viên, JWT HttpOnly Cookies, Bcrypt (`server/src/modules/auth`).
2. **Internationalization (i18n)**: 4 ngôn ngữ (VI, EN, ZH, JA), nhớ cookie, đồng bộ user profile.
3. **LMS Course Engine**: Cấu trúc 4 cấp: Course ➔ Module ➔ Lesson ➔ Components (`server/src/modules/courses`, `lessons`).
4. **Secured Digital Library**: PDF Viewer, Audio Player, Dynamic Watermark chống leak, Signed URL 15m (`server/src/modules/materials`).
5. **LiveKit WebRTC Classroom**: 1 Host + 7-8 Học viên, Điều khiển Mic/Cam, Giơ tay, Bảng trắng (`server/src/core/livekit`).
6. **AI IELTS Writing Studio**: Task 1 & 2, Đếm từ, AI chấm 4 tiêu chí, Admin duyệt kết quả (`server/src/modules/writing`).
7. **IELTS Speaking Studio**: Ghi âm sóng âm Web Audio API, Admin chấm 4 tiêu chí kèm timestamp comments (`server/src/modules/speaking`).
8. **Quiz Engine**: 3 dạng câu hỏi, Chấm tức thì, Sàn điểm &ge; 80% để mở khóa bài tiếp theo (`server/src/modules/quizzes`).
9. **Automated Attendance**: Webhook LiveKit ghi nhận phút học, phân loại chuyên cần, export Excel (`server/src/modules/attendance`).
10. **Dashboard & Analytics**: Thống kê học tập học viên & Báo cáo tổng thể hệ thống cho Admin (`server/src/modules/dashboard`).
11. **Realtime Chat & Messaging**: Trao đổi trực tiếp Admin - Học viên qua Socket.IO thời gian thực (`server/src/modules/chat`).

---

## 6. Bộ Lệnh Chuẩn & Kiểm Thử Thường Dùng

- **Backend (`cd server`)**:
  - Khởi động dev: `npm run start:dev`
  - Sinh Prisma client: `node node_modules/prisma/build/index.js generate`
  - Migrate database: `npx prisma migrate dev`
  - Chạy seed dữ liệu mẫu: `npx prisma db seed`
  - Chạy toàn bộ e2e test suite: `npm run test:e2e` (Bắt buộc PASS 100% trước khi bàn giao)
- **Frontend (`cd client`)**:
  - Khởi động dev: `npm run dev`
  - Kiểm tra build: `npm run build`
- **Docker Compose**:
  - Khởi động: `docker compose up -d`
