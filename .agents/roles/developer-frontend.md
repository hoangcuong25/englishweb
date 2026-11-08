# Role: Frontend Developer (Lập Trình Phía Giao Diện)

## 1. Mục Tiêu & Trách Nhiệm
Phát triển giao diện người dùng Next.js 14 App Router, Tailwind CSS, shadcn/ui bám sát thiết kế mockup và đặc tả SRS.

## 2. Quy Chuẩn Tổ Chức Thư Mục & Routes
- `client/src/app/(auth)/`: `/login`, `/register`.
- `client/src/app/(student)/student/`:
  - `dashboard`: Tổng quan học tập, khóa học, lịch học sắp tới.
  - `courses/[id]`: Đề cương khóa học, danh sách chương bài.
  - `classroom/[roomId]`: Phòng học WebRTC LiveKit 1 Host + 7 Students & Bảng trắng canvas.
  - `quizzes/[id]`: Trắc nghiệm 3 dạng, timer đếm ngược, tự động chấm điểm & giải thích.
  - `speaking`: Studio thu âm với sóng âm thanh (Web Audio API), nghe lại, nộp bài.
  - `writing`: Studio luyện viết IELTS Task 1 & Task 2, đếm từ, kết quả chấm AI.
  - `library`: Kho học liệu số với Dynamic Watermark chuyển động chống leak tài liệu.
- `client/src/app/(admin)/admin/`:
  - `dashboard`: Thống kê toàn hệ thống.
  - `courses`: Quản trị khóa học, modules, bài học, học liệu.
  - `users`: Quản lý tài khoản học viên, khóa/mở tài khoản.
  - `classroom/[roomId]`: Host phòng học LiveKit, điều khiển bật/tắt mic cam học viên, quản lý quyền vẽ bảng.
  - `speaking-grading`: Nghe bản ghi âm học viên, chấm 4 tiêu chí IELTS Speaking, timestamp feedback.
  - `writing-review`: Xem phân tích AI, chỉnh sửa điểm và phê duyệt bài viết.
  - `attendance`: Xem log vào/ra LiveKit, tổng phút học, chỉnh sửa thủ công và xuất file Excel (.xlsx).

## 3. Quy Chuẩn Giao Diện (Design System)
- Theme màu: Xanh dương nhạt (Sky Blue / Slate).
  - Primary: `#0284c7` (sky-600) / `#0ea5e9` (sky-500)
  - Surface: `#ffffff`, Background: `#f8fafc` (slate-50)
  - Text: `#0f172a` (slate-900)
- Tương thích Responsive hoàn chỉnh: Mobile, Tablet, Desktop.
- Hỗ trợ đa ngôn ngữ i18n đầy đủ cho cả 4 thứ tiếng (VI, EN, ZH, JA).
