---
name: english-lms-nextjs-theme
description: >-
  Kỹ năng xây dựng giao diện Next.js 14 App Router, Slate/Sky Blue design tokens, bảo vệ route bằng Next.js Middleware và tích hợp đa ngôn ngữ i18n (VI, EN, ZH, JA).
---

# Next.js 14 LMS Theme & i18n Skill

## 1. Hệ Thống Màu Sắc & Design Tokens (Sky Blue / Slate)
- **Primary / Brand**: `#0284c7` (sky-600) / `#0ea5e9` (sky-500)
- **Primary Light**: `#e0f2fe` (sky-100) / `#f0f9ff` (sky-50)
- **Dark Accent**: `#0f172a` (slate-900)
- **Muted Text**: `#64748b` (slate-500)
- **Border**: `#e2e8f0` (slate-200)
- **Background**: `#f8fafc` (slate-50)
- **Card Surface**: `#ffffff`

## 2. Phân Vùng Tuyến Đường (Route Segmentation)
- `/(auth)/`: `/login`, `/register`
- `/(student)/student/`: Toàn bộ màn hình dành cho học viên.
- `/(admin)/admin/`: Toàn bộ màn hình dành cho quản trị viên kiêm giáo viên.

## 3. Bảo Vệ Route Bằng Middleware (`client/src/middleware.ts`)
Kiểm tra cookie `access_token` và `user_role`:
- Truy cập `/admin/*` mà role không phải `ADMIN` ➔ Redirect `/login`.
- Truy cập `/student/*` mà chưa đăng nhập ➔ Redirect `/login`.
- Đã đăng nhập khi vào `/login` hoặc `/register` ➔ Redirect về trang dashboard tương ứng.

## 4. Đa Ngôn Ngữ i18n (4 Ngôn Ngữ)
- Hỗ trợ đầy đủ: `vi` (Tiếng Việt), `en` (English), `zh` (简体中文), `ja` (日本語).
- Khách vãng lai: Tự động lấy theo ngôn ngữ trình duyệt (`navigator.language`).
- Học viên đã đăng nhập: Đồng bộ ngôn ngữ đã lưu trong `User.preferredLang`.
