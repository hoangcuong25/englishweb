# GEMINI.md - Hướng Dẫn & Quy Chuẩn Dự Án Website Tiếng Anh (LMS & LiveKit WebRTC)

## 1. Tổng Quan Dự Án (Project Overview)
- **Tên dự án**: Website Dạy Tiếng Anh Trực Tuyến (LMS & WebRTC LiveKit In-house).
- **Mục tiêu**: Nền tảng học tiếng Anh all-in-one phục vụ luyện thi IELTS, Business English và tiếng Anh trẻ em.
- **Mô hình người dùng (CHỈ CÓ ĐÚNG 2 VAI TRÒ)**:
  1. `STUDENT`: Học viên (đăng ký, học bài, làm trắc nghiệm, thu âm Speaking, tham gia lớp WebRTC 1 chạm, vẽ bảng trắng, theo dõi tiến độ).
  2. `ADMIN`: Chủ sở hữu kiêm Giáo viên & Quản trị viên toàn quyền (quản lý học viên, khóa học, tài liệu PDF/MP3, host lớp LiveKit, tắt/bật mic cam học viên, chấm bài Speaking, chốt điểm danh tự động theo số phút, dashboard & export báo cáo).
  > **LƯU Ý QUAN TRỌNG**: Không tạo role Teacher trung gian. Hệ thống chỉ có `STUDENT` và `ADMIN`.

---

## 2. Ngăn Xếp Kỹ Thuật (Tech Stack Architecture)
- **Cấu trúc Monorepo**:
  - `server/`: Backend NestJS (TypeScript), Prisma ORM, MySQL 8.0, JWT HTTP-Only Cookies, WebSockets, LiveKit Server SDK.
  - `client/`: Frontend Next.js 14+ (App Router, TypeScript), Tailwind CSS, shadcn/ui (theme xanh dương nhạt / sky blue), `@livekit/components-react`, Whiteboard (Tldraw/Excalidraw).
  - `docker-compose.yml`: Triển khai hạ tầng MySQL, LiveKit Server, NestJS, Next.js, Nginx.
- **Bảo mật & Phân quyền**:
  - Role-based Access Control (RBAC): `RolesGuard` và `@Roles('ADMIN', 'STUDENT')`.
  - Auth: JWT Access Token & Refresh Token Rotation trong HTTP-Only Cookies.
  - Tài liệu: Private Storage (S3 / Local), phân phối qua Presigned URL thời hạn 15 phút.
- **Lớp học WebRTC**:
  - LiveKit Server SFU (đáp ứng 7-8 người/phòng, 1 Host + 7 Students, độ trễ < 150ms).
  - Điểm danh tự động qua LiveKit Webhook (`participant_joined`, `participant_left`) tính theo số phút thực tế.

---

## 3. Quy Ước Mã Nguồn & Phát Triển (Code Standards & Conventions)
- **Backend (NestJS)**:
  - Cấu trúc thư mục theo module: `auth`, `users`, `courses`, `lessons`, `materials`, `quizzes`, `speaking`, `rooms`, `attendance`, `dashboard`.
  - Luôn dùng `class-validator` và `class-transformer` cho DTOs.
  - Sử dụng Prisma Service dùng chung (`prisma.service.ts`).
  - Toàn bộ exception được xử lý tập trung qua `HttpExceptionFilter`.
  - API documentation: Tích hợp Swagger OpenAPI tại `/api/docs`.
- **Frontend (Next.js 14 App Router)**:
  - Phân vùng Route:
    - `(auth)/`: `/login`, `/register`
    - `(student)/student/`: `/student/dashboard`, `/student/courses/[id]`, `/student/classroom/[roomId]`, `/student/quizzes/[id]`, `/student/progress`
    - `(admin)/admin/`: `/admin/dashboard`, `/admin/courses`, `/admin/lessons`, `/admin/users`, `/admin/classroom/[roomId]`, `/admin/attendance`, `/admin/speaking-grading`
  - Theme: Xanh dương nhạt (Light blue / Slate / Sky), giao diện hiện đại, sạch sẽ, tối ưu responsive Mobile/Tablet/Desktop.
  - Quản lý trạng thái: TanStack Query (React Query) cho server state, Zustand cho client state (nếu cần).
  - Forms: `react-hook-form` + `zod`.
- **Whiteboard & WebRTC**:
  - Giao diện phòng học: Grid camera 1 Admin to nổi bật và 7 Students bên cạnh hoặc dưới.
  - Whiteboard: Nhúng Tldraw/Excalidraw, đồng bộ nét vẽ thông qua LiveKit DataChannel.

---

## 4. Các Lệnh Thường Dùng (Common Commands)
- **Backend (`cd server`)**:
  - Cài đặt: `npm install`
  - Chạy dev: `npm run start:dev`
  - Prisma migrate: `npx prisma migrate dev`
  - Prisma Studio: `npx prisma studio`
- **Frontend (`cd client`)**:
  - Cài đặt: `npm install`
  - Chạy dev: `npm run dev`
  - Build: `npm run build`
- **Hạ tầng Docker**:
  - Khởi động: `docker compose up -d`
