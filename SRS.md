# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
**Software Requirements Specification • Dự án Website Dạy Tiếng Anh Trực Tuyến**

- **Dự án**: Website Dạy Tiếng Anh Trực Tuyến (LMS & Lớp Học WebRTC LiveKit In-house)
- **Phân quyền hệ thống (2 Roles)**: `STUDENT` (Học viên) và `ADMIN` (Chủ sở hữu kiêm Giáo viên & Quản trị viên toàn quyền)
- **Công nghệ sử dụng**:
  - **Backend**: NestJS (TypeScript), Prisma ORM, MySQL 8.0, WebSockets
  - **Frontend**: Next.js 14+ (App Router, TypeScript), Tailwind CSS, shadcn/ui (Chủ đạo màu xanh dương nhạt)
  - **WebRTC Server**: LiveKit SFU (Docker tự host trên VPS)
  - **Bảng tương tác**: Tldraw / Excalidraw đồng bộ qua LiveKit DataChannel
  - **Lưu trữ**: S3 / MinIO / Local VPS bảo vệ qua Presigned URL
- **Môi trường triển khai**: VPS Ubuntu (2-4 vCPU, 4GB RAM), Docker & Docker Compose, Nginx Reverse Proxy, SSL Let's Encrypt

---

## 1. Giới Thiệu (Introduction)

### 1.1. Mục đích tài liệu (Purpose)
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này mô tả chi tiết toàn bộ các yêu cầu chức năng, yêu cầu phi chức năng, kiến trúc kỹ thuật và kế hoạch thực thi cho hệ thống Website Dạy Tiếng Anh Trực Tuyến. Tài liệu được thiết kế theo mô hình vận hành gọn nhẹ với đúng 2 vai trò người dùng (`STUDENT` và `ADMIN`), phục vụ làm kim chỉ nam phát triển cho đội ngũ kỹ thuật Backend và Frontend.

### 1.2. Phạm vi dự án (Scope)
Hệ thống là nền tảng tất-cả-trong-một (All-in-one) phục vụ dạy học tiếng Anh cá nhân/nhóm nhỏ, tập trung vào luyện thi IELTS, Business English và tiếng Anh trẻ em. Hệ thống tích hợp đầy đủ:
- Quản lý học tập (LMS)
- Kho tài liệu giáo trình bảo mật qua Presigned URL (hết hạn sau 15 phút)
- Ngân hàng đề trắc nghiệm tự chấm kèm lời giải
- Tính năng thu âm nộp bài Speaking (sử dụng MediaRecorder API)
- Lớp học trực tuyến WebRTC 7–8 người tự host không phụ thuộc Zoom/Meet
- Cơ chế tự động ghi nhận thời gian học (điểm danh) theo phút thực tế qua LiveKit Webhook

### 1.3. Định nghĩa vai trò người dùng (User Roles & Personas)
Hệ thống loại bỏ hoàn toàn vai trò trung gian Teacher để tinh giản quy trình quản trị, chỉ duy trì 2 vai trò cốt lõi:
- **`STUDENT` (Học viên)**: Người học đăng ký tài khoản, đăng nhập, xem lộ trình học và tài liệu được phân quyền, làm bài kiểm tra trắc nghiệm, ghi âm trực tiếp nộp bài Speaking, tham gia lớp học trực tuyến LiveKit, vẽ tương tác bảng trắng và theo dõi tiến độ học tập cá nhân.
- **`ADMIN` (Chủ sở hữu / Quản trị viên kiêm Giảng dạy)**: Nắm toàn bộ quyền hạn cao nhất: trực tiếp đứng lớp giảng dạy (Host), điều khiển camera/mic học viên, vẽ bảng, quản lý toàn bộ học viên, tạo/sửa khóa học và bài học, upload giáo trình PDF/Audio, chấm điểm & nhận xét bài thu âm Speaking, kiểm tra và chốt bảng điểm danh, xem thống kê dashboard toàn hệ thống.

---

## 2. Mô Tả Tổng Thể Hệ Thống & Kiến Trúc Kỹ Thuật

### 2.1. Ngăn xếp công nghệ (Technology Stack)

| Tầng Hệ Thống | Công Nghệ / Thư Viện | Đặc Tả Kỹ Thuật |
| :--- | :--- | :--- |
| **Backend** | NestJS (TypeScript) | Module-based architecture, Guards (JWT, Role: STUDENT \| ADMIN), Pipes, Interceptors, WebSocket Gateway. |
| **Frontend** | Next.js 14+ (App Router, TS) | Server Components (SSR/SSG tối ưu SEO), Client Components, Tailwind CSS, shadcn/ui theme xanh dương nhạt. |
| **Database** | MySQL 8.0 + Prisma ORM | Lưu trữ dữ liệu: Users (role enum: STUDENT, ADMIN), Courses, Lessons, Quizzes, Attendance. |
| **Phòng Học Trực Tuyến** | LiveKit Server (SFU WebRTC) | Tự deploy qua Docker trên VPS. Chuyển tiếp video/audio đa điểm 7-8 người, độ trễ < 150ms, chi phí 0 VNĐ. |
| **LiveKit SDKs** | livekit-server-sdk & React SDK | NestJS sinh JWT Access Token; Next.js dùng `@livekit/components-react` có sẵn giao diện phòng học responsive. |
| **Bảng Tương Tác** | Tldraw / Excalidraw | Nhúng trực tiếp vào phòng học; đồng bộ nét vẽ thời gian thực giữa Admin và Student qua LiveKit DataChannel. |
| **Lưu Trữ File / Audio** | AWS S3 / MinIO / Local VPS | Lưu trữ sách PDF IELTS Mindset/Business English bảo vệ qua Presigned URL; lưu file âm thanh Speaking của học viên. |
| **Hạ Tầng Triển Khai** | VPS Ubuntu (2-4 vCPU, 4GB RAM) | Chạy Docker Compose (NestJS, LiveKit, MySQL), Nginx Reverse Proxy, SSL Certbot Let's Encrypt. |

### 2.2. Luồng kiến trúc xử lý (System Architecture & Dataflow)
- **Kiến trúc Xác thực (Auth)**: Next.js lưu JWT Access Token và Refresh Token trong HTTP-only Cookie. Khi gọi API, NestJS `RolesGuard` xác thực claim role chỉ gồm `'STUDENT'` hoặc `'ADMIN'`. Các route quản lý (`/admin`) và API nhạy cảm được bảo vệ tuyệt đối.
- **Kiến trúc Phòng học SFU (WebRTC)**: Khi Admin bắt đầu buổi học hoặc Học viên vào lớp, NestJS cấp AccessToken có gắn RoomName và Identity. LiveKit Server SFU nhận luồng video từ mỗi người và phân phối trực tiếp cho 7 người còn lại mà không qua CPU giải mã, đảm bảo máy chủ chạy nhẹ nhàng trên VPS 4GB RAM.
- **Kiến trúc Điểm danh**: LiveKit Server kích hoạt Webhook bắn sự kiện `participant_joined` và `participant_left` về NestJS. Hệ thống tự động tính tổng số phút học thực tế của Học viên và ghi thẳng vào bảng `attendance`.

---

## 3. Yêu Cầu Chức Năng Chi Tiết (Functional Requirements - 7 Modules)

### Module 1: Quản Lý Xác Thực & Người Dùng (Auth & User Management)
- **FR-1.1 Đăng ký tài khoản**: Học viên có thể tự đăng ký tài khoản với Họ tên, Email, Số điện thoại và Mật khẩu. Mặc định tài khoản tạo ra có vai trò là `STUDENT`.
- **FR-1.2 Đăng nhập & Xác thực**: Xác thực qua JWT. Hỗ trợ cơ chế Refresh Token Rotation. Phân luồng truy cập: Admin vào Dashboard quản trị (`/admin`), Student vào Dashboard học tập (`/student`).
- **FR-1.3 Phân quyền 2 Roles (RBAC)**: Hệ thống chỉ định nghĩa đúng 2 vai trò: `STUDENT` và `ADMIN`. Admin có toàn quyền tạo, sửa, xóa, khóa tài khoản và phân bổ học viên.
- **FR-1.4 Quản lý danh sách học viên**: Admin xem danh sách toàn bộ học viên, tình trạng kích hoạt, lịch sử học tập, reset mật khẩu khi cần thiết.

### Module 2: Quản Lý Khóa Học & Lộ Trình Học (Course & Curriculum Management)
- **FR-2.1 Cấu trúc nội dung phân cấp**: Hỗ trợ cấu trúc 4 cấp: Khóa học (IELTS, Business, Trẻ em) → Module/Chương → Bài học (Lessons) → Tài liệu & Bài luyện tập.
- **FR-2.2 Quản trị khóa học (Admin)**: Admin có toàn quyền CRUD khóa học, tạo nội dung bài giảng, tải giáo trình, bật/tắt trạng thái hiển thị của khóa học.
- **FR-2.3 Ghi danh học viên (Enrollment)**: Admin duyệt hoặc ghi danh trực tiếp học viên vào lớp/khóa học tương ứng. Học viên chỉ xem được nội dung các khóa học đã được ghi danh.

### Module 3: Kho Tài Liệu Giáo Trình (Learning Material Management)
- **FR-3.1 Tải lên tài liệu (Admin)**: Admin tải lên tài liệu giáo trình (PDF sách IELTS Mindset, Business English, file nghe MP3) kéo thả nhanh chóng.
- **FR-3.2 Bảo vệ bản quyền (Presigned URL)**: Tài liệu lưu trữ dạng private. Khi học viên mở tài liệu, NestJS sinh Presigned URL có hạn sử dụng (15 phút) để chống copy/share link công khai.
- **FR-3.3 Trình đọc tài liệu tích hợp**: Tích hợp sẵn PDF Viewer và Audio Player ngay trên trình duyệt Next.js, học viên không cần tải file về máy để học.

### Module 4: Kiểm Tra & Luyện Thi IELTS (Assessment & Speaking)
- **FR-4.1 Ngân hàng đề thi (Admin)**: Admin tạo và quản lý câu hỏi trắc nghiệm, điền từ, matching theo format đề thi IELTS.
- **FR-4.2 Làm bài thi trắc nghiệm (Student)**: Học viên làm bài thi với đồng hồ đếm ngược (Timer). Hệ thống tự động chấm điểm và hiển thị đáp án, lời giải thích ngay khi nộp bài.
- **FR-4.3 Thu âm Speaking trực tuyến (Student)**: Học viên bấm thu âm trực tiếp trên web bằng MediaRecorder API (có hiển thị sóng âm), nghe lại bản ghi và nộp bài lên hệ thống.
- **FR-4.4 Chấm điểm & Nhận xét Speaking (Admin)**: Admin nghe bản thu âm của học viên, nhập điểm số (theo band điểm IELTS) và gửi lời nhận xét chi tiết.

### Module 5: Phòng Học Trực Tuyến WebRTC In-house & Bảng Vẽ (LiveKit & Whiteboard)
- **FR-5.1 Phòng học trực tuyến 7-8 người**: Tích hợp LiveKit SFU tự host trên VPS. Giao diện Grid camera hiển thị 1 ô Admin (Host) và 7 ô Student mượt mà.
- **FR-5.2 Điều khiển lớp học (Admin)**: Admin có toàn quyền: Bật/tắt mic học viên, chia sẻ màn hình bài giảng, đóng/mở phòng học, ghi nhận lớp học.
- **FR-5.3 Tương tác học viên (Student)**: Học viên vào lớp bằng 1 chạm, bật/tắt mic/cam cá nhân, giơ tay phát biểu, xem màn hình chia sẻ của Admin.
- **FR-5.4 Bảng viết tương tác (Whiteboard)**: Nhúng Tldraw/Excalidraw trực tiếp trong lớp học. Admin và Student cùng vẽ tương tác, đồng bộ nét vẽ thời gian thực qua LiveKit DataChannel.

### Module 6: Điểm Danh Tự Động & Báo Cáo Tiến Độ (Attendance & LMS Tracking)
- **FR-6.1 Điểm danh tự động theo số phút**: Hệ thống tự động ghi nhận chính xác thời gian Student vào/rời phòng WebRTC dựa trên Webhook của LiveKit. Tự động gắn nhãn: Có mặt (đủ giờ), Muộn (>15p), hoặc Vắng.
- **FR-6.2 Quản lý điểm danh (Admin)**: Admin xem bảng điểm danh dạng checklist theo từng buổi học, có quyền can thiệp chỉnh sửa thủ công khi có sự cố mạng.
- **FR-6.3 Theo dõi tiến độ khóa học (LMS)**: Tự động tính % hoàn thành bài học khi học viên học xong lý thuyết và hoàn thành bài test. Hiển thị Progress bar trực quan.
- **FR-6.4 Xuất báo cáo (Admin)**: Admin xuất bảng điểm học tập, tỷ lệ chuyên cần của học viên ra file Excel/CSV chỉ bằng một click.

### Module 7: Thiết Kế UI/UX & Triển Khai Hệ Thống (UI/UX & Deployment)
- **FR-7.1 Giao diện chuẩn mực Responsive**: Giao diện thân thiện tông màu xanh dương nhạt chủ đạo, tương thích tối ưu trên Mobile, Tablet và Desktop.
- **FR-7.2 Tối ưu hóa tải trang & đường truyền**: Áp dụng Next.js SSR/SSG tải trang < 2 giây; cấu hình Dynacast giới hạn bitrate WebRTC tự động theo mạng của học viên.
- **FR-7.3 Triển khai VPS độc lập**: Đóng gói toàn bộ hệ thống bằng Docker Compose (NestJS, LiveKit, MySQL, Nginx reverse proxy kèm SSL Let's Encrypt).

---

## 4. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)
- **NFR-1 (Hiệu năng phòng học WebRTC)**: Độ trễ truyền tải âm thanh và hình ảnh trong phòng học LiveKit không vượt quá 200ms trên mạng Internet thông thường; máy học viên chỉ tốn băng thông tải 1 luồng lên server.
- **NFR-2 (Tính khả dụng & Ổn định)**: Hệ thống hoạt động ổn định trên VPS cấu hình 2 vCPU – 4GB RAM, đáp ứng đồng thời 1–2 phòng học (mỗi phòng 7–8 người) mà CPU máy chủ duy trì dưới 65%.
- **NFR-3 (Bảo mật thông tin & Bản quyền)**: Bảo vệ mật khẩu bằng thuật toán Bcrypt; toàn bộ kết nối HTTPS/WSS có SSL hợp lệ; tài liệu giáo trình và file ghi âm Speaking không bị lộ link truy cập công khai.
- **NFR-4 (Khả năng tương thích thiết bị)**: Học viên có thể tham gia lớp học và làm bài kiểm tra mượt mà trên trình duyệt Safari (iOS), Chrome/Edge (Android, Windows, macOS).

---

## 5. Bảng Phân Bổ Nhiệm Vụ & Gantt Chart 3 Tuần (18 Ngày Làm Việc)

| WBS | Nhiệm Vụ Triển Khai | Phụ Trách | Thời Gian | Ghi Chú Kỹ Thuật (2 Roles) |
| :--- | :--- | :--- | :--- | :--- |
| **1.0** | **TUẦN 1: NỀN TẢNG CORE, AUTH 2 ROLES & QUẢN LÝ TÀI LIỆU** | **Tất cả** | **Ngày 1 - 6** | **Mục tiêu: Đăng nhập 2 Role, CRUD Khóa học, Upload file** |
| 1.1 | Setup Project NestJS + Next.js, MySQL schema & Theme | BE / FE | Ngày 1 (T2) | Khởi tạo repo & cấu hình enum Role (`STUDENT`, `ADMIN`) |
| 1.2 | Xác thực JWT, Refresh Token & Guard phân quyền 2 Roles | BE (NestJS) | Ngày 2 (T3) | RolesGuard chặn riêng quyền ADMIN và STUDENT |
| 1.3 | UI Đăng nhập, Đăng ký & Middleware điều hướng Dashboard | FE (Next.js) | Ngày 2 (T3) | Admin vào `/admin`, Student vào `/student` |
| 1.4 | CRUD Khóa học (IELTS, Business, Trẻ em) & Bài học | BE (NestJS) | Ngày 3 (T4) | API quản lý dành riêng cho Admin |
| 1.5 | UI Catalog khóa học & Màn hình quản lý bài giảng cho Admin | FE (Next.js) | Ngày 3 (T4) | Admin tạo/sửa; Student xem lộ trình |
| 1.6 | Tích hợp Upload S3/Cloud & Signed URL bảo mật tài liệu | BE (NestJS) | Ngày 4 (T5) | Chống tải lậu sách giáo trình IELTS |
| 1.7 | Giao diện Upload kéo thả & Bộ PDF Viewer, Audio Player | FE (Next.js) | Ngày 4 (T5) | Admin upload; Student đọc sách & nghe audio |
| 1.8 | API Enrollment gán học viên vào khóa & Quản lý User | BE (NestJS) | Ngày 5 (T6) | Admin chủ động thêm/xóa học viên trong lớp |
| 1.9 | UI Màn hình học bài (bài giảng + tài liệu đính kèm) | FE (Next.js) | Ngày 5 (T6) | Giao diện học tập tinh gọn cho Student |
| 1.10 | Swagger API docs & Test luồng Auth -> Xem bài -> Đọc tài liệu | BE / FE | Ngày 6 (T7) | Kiểm thử phân quyền 2 roles & responsive |
| **2.0** | **TUẦN 2: LỚP HỌC WEBRTC LIVEKIT, BẢNG VẼ & QUIZ/SPEAKING** | **Tất cả** | **Ngày 7 - 12** | **Mục tiêu: LiveKit SFU 7-8 người, Quiz, Thu âm** |
| 2.1 | Cài đặt LiveKit Server Docker trên VPS & Cấu hình UFW | DevOps/BE | Ngày 7 (T2) | Mở port 7880 & UDP 50000-60000 |
| 2.2 | Xây dựng LivekitService (NestJS) sinh Token vào phòng | BE (NestJS) | Ngày 7 (T2) | Phân quyền: Admin (Host) & Student (Participant) |
| 2.3 | UI Phòng học trực tuyến Next.js bằng @livekit/components | FE (Next.js) | Ngày 8 (T3) | Grid 1 Admin + 7 Students; nút Mic/Cam/Share |
| 2.4 | Nhúng Bảng tương tác (Tldraw/Excalidraw) qua DataChannel | FE (Next.js) | Ngày 9 (T4) | Admin & Student cùng vẽ tương tác thời gian thực |
| 2.5 | Kiểm thử WebRTC: 1 Admin + 7 Students nói chuyện & vẽ bảng | BE / FE | Ngày 9 (T4) | Đảm bảo độ trễ thấp < 150ms trên VPS |
| 2.6 | Schema Quizzes & CRUD Ngân hàng câu hỏi trắc nghiệm/điền từ | BE (NestJS) | Ngày 10 (T5) | Admin tạo đề thi & cấu hình đáp án đúng |
| 2.7 | UI Làm bài thi trắc nghiệm (Timer đếm ngược, tự chấm điểm) | FE (Next.js) | Ngày 10 (T5) | Student làm bài thi; nhận điểm & giải thích ngay |
| 2.8 | API Nhận file thu âm Speaking & API Admin chấm nhận xét | BE (NestJS) | Ngày 11 (T6) | Lưu audio metadata lên S3/Cloud |
| 2.9 | Tích hợp MediaRecorder thu âm & UI Admin chấm bài Speaking | FE (Next.js) | Ngày 11 (T6) | Student nộp audio; Admin nghe & nhập điểm/feedback |
| 2.10 | Tối ưu bitrate WebRTC & Test liên thông Lớp học + Làm bài | BE / FE | Ngày 12 (T7) | Kiểm tra luồng Admin dạy và Student nộp bài |
| **3.0** | **TUẦN 3: ĐIỂM DANH SỐ PHÚT, TIẾN ĐỘ LMS, TỐI ƯU & DEPLOY** | **Tất cả** | **Ngày 13 - 18** | **Mục tiêu: Điểm danh tự động, Dashboard Admin, Bàn giao** |
| 3.1 | Tự động ghi nhận điểm danh dựa trên LiveKit Webhook | BE (NestJS) | Ngày 13 (T2) | Tính chính xác số phút học thực tế của Student |
| 3.2 | UI Bảng điểm danh cho Admin: Checklist có mặt, vắng, số phút | FE (Next.js) | Ngày 13 (T2) | Admin kiểm tra và được phép sửa thủ công |
| 3.3 | API Lesson Progress & Tính tỷ lệ % hoàn thành khóa học | BE (NestJS) | Ngày 14 (T3) | Ghi nhận tiến độ khi Student học xong bài/quiz |
| 3.4 | Component Progress Bar & Tự động tick xanh hoàn thành bài | FE (Next.js) | Ngày 14 (T3) | Student theo dõi hành trình học của mình |
| 3.5 | API Dashboard Admin thống kê & API xuất báo cáo Excel/CSV | BE (NestJS) | Ngày 15 (T4) | Xuất bảng điểm danh & kết quả thi của học viên |
| 3.6 | UI Dashboard Admin: Biểu đồ chuyên cần, điểm số, học viên | FE (Next.js) | Ngày 15 (T4) | Giao diện quản trị tổng quan cho Admin |
| 3.7 | Rà soát bảo mật SQLi, Rate Limiting & Tối ưu Index MySQL | BE (NestJS) | Ngày 16 (T5) | Bảo vệ hệ thống & tăng tốc query |
| 3.8 | Tối ưu Performance Next.js (Bundle, SEO, Lazy-load Audio) | FE (Next.js) | Ngày 16 (T5) | Tải trang < 2 giây trên mobile |
| 3.9 | Docker compose toàn bộ hệ thống (NestJS, LiveKit, MySQL, Nginx) | DevOps/BE | Ngày 17 (T6) | Cài SSL Certbot & hoàn tất VPS |
| 3.10 | Deploy Frontend Next.js & Kiểm tra Responsive toàn diện | FE (Next.js) | Ngày 17 (T6) | Test trên iPhone, iPad, Laptop |
| 3.11 | End-to-End Testing toàn hệ thống, Fix bug & Bàn giao nghiệm thu | BE / FE | Ngày 18 (T7) | Bàn giao mã nguồn & Hướng dẫn quản trị Admin |
