# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## DỰ ÁN: TEACHER DONG ACADEMY – NỀN TẢNG ĐÀO TẠO TRỰC TUYẾN
### Standard: IEEE 830 / ISO/IEC/IEEE 29148 Compliant (Phiên bản v2.5 - Đồng bộ Toàn diện Codebase)

---

## MỤC LỤC

1. [GIỚI THIỆU TỔNG QUAN (INTRODUCTION)](#1-giới-thiệu-tổng-quan-introduction)
   - 1.1 Mục đích tài liệu
   - 1.2 Phạm vi sản phẩm
   - 1.3 Mô hình 2 vai trò duy nhất (Strict 2-Role RBAC)
   - 1.4 Thuật ngữ & Từ viết tắt
   - 1.5 Tài liệu tham chiếu
2. [MÔ TẢ TỔNG QUAN HỆ THỐNG (OVERALL DESCRIPTION)](#2-mô-tả-tổng-quan-hệ-thống-overall-description)
   - 2.1 Bối cảnh & Kiến trúc Monorepo
   - 2.2 Đặc tính người dùng
   - 2.3 Các ràng buộc thiết kế & bảo mật
   - 2.4 Giả định & Phụ thuộc
3. [ĐẶC TẢ CHI TIẾT 17 PHÂN HỆ CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)](#3-đặc-tả-chi-tiết-17-phân-hệ-chức-năng-functional-requirements)
   - FR-01: Phân hệ Xác thực, Quản lý Phiên & Hồ Sơ Cá Nhân (Authentication, Single Session & Account Profile)
   - FR-02: Phân hệ Đa Ngôn Ngữ (Internationalization - i18n)
   - FR-03: Phân hệ Quản lý Đào tạo, Khóa học & Duyệt Học Phí (LMS Curriculum & Enrollment)
   - FR-04: Phân hệ Kho Học liệu Số Bảo mật & Media CDN (Secured Digital Library & Cloudinary Media)
   - FR-05: Phân hệ Lớp học Trực tuyến WebRTC (LiveKit Live Classroom & Interactive Whiteboard)
   - FR-06: Phân hệ Luyện viết IELTS Writing Chấm bằng AI & Ngân Hàng Đề (AI Writing Assessment & Prompts)
   - FR-07: Phân hệ Luyện nói & Chấm điểm IELTS Speaking (Speaking Studio & Standalone Prompts)
   - FR-08: Phân hệ Kiểm tra, Trắc nghiệm 18 Dạng & Chẩn Đoán Năng Lực (Quiz Engine & 4-Skills Diagnostic)
   - FR-09: Phân hệ Điểm danh Tự động & Báo cáo Chuyên cần (Automated Attendance & Excel Export)
   - FR-10: Phân hệ Dashboard & Cổng Luyện Thi Cá Nhân Hóa (Dashboard, Analytics & IELTS Master Hub)
   - FR-11: Phân hệ Nhắn tin Thời gian thực (Realtime Chat & Messaging)
   - FR-12: Phân hệ Quản trị Blog & Media Truyền thông (Blog Management & Markdown AST)
   - FR-13: Phân hệ Tiếp nhận Tư vấn Tuyển sinh (Consultation Leads & Anti-Spam)
   - FR-14: Phân hệ Trung tâm Thông báo & Loa Phát thanh (Notifications & WebSocket Broadcast)
   - FR-15: Phân hệ Quản lý Người dùng & Học viên Dành cho Admin (User & Student Administration)
   - FR-16: Phân hệ Kiểm tra & Gửi Email Hệ thống (Mail Dispatch & SMTP Health Check)
   - FR-17: Trung tâm Đánh giá & Chấm thi Tích hợp của Admin (Admin Assessments & Grading Studio Hub)
4. [YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)](#4-yêu-cầu-phi-chức-năng-non-functional-requirements)
   - 4.1 Yêu cầu về Hiệu năng (Performance)
   - 4.2 Yêu cầu về An toàn & Bảo mật (Security)
   - 4.3 Khả năng sẵn sàng & Phục hồi (Reliability & Availability)
   - 4.4 Khả năng tương thích & Giao diện (Compatibility & Usability)
5. [MÔ HÌNH DỮ LIỆU & KIẾN TRÚC TỔ CHỨC MÃ NGUỒN](#5-mô-hình-dữ-liệu--kiến-trúc-tổ-chức-mã-nguồn)
   - 5.1 Cấu trúc Cơ sở dữ liệu Prisma Schema
   - 5.2 Kiến trúc thư mục chuẩn Monorepo (Core vs Modules)
6. [KẾ HOẠCH BÀN GIAO & 20 TIÊU CHÍ NGHIỆM THU](#6-kế-hoạch-bàn-giao--20-tiêu-chí-nghiệm-thu)
   - 6.1 Lộ trình 6 tuần triển khai
   - 6.2 20 Tiêu chí nghiệm thu chức năng chuẩn (Acceptance Criteria)

---

## 1. GIỚI THIỆU TỔNG QUAN (INTRODUCTION)

### 1.1 Mục đích tài liệu
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này xác định toàn bộ phạm vi chức năng, yêu cầu phi chức năng, kiến trúc kỹ thuật, mô hình dữ liệu và các tiêu chí nghiệm thu cho hệ thống **Teacher Dong Academy**. Đây là căn cứ pháp lý và kỹ thuật duy nhất phục vụ đội ngũ phát triển, kiểm thử, quản trị dự án và nghiệm thu với khách hàng.

### 1.2 Phạm vi sản phẩm
**Teacher Dong Academy** là nền tảng giáo dục trực tuyến (EdTech) hiện đại chuẩn All-in-One, kết hợp giữa:
- Hệ thống Quản lý Đào tạo (LMS) cho 5 trụ cột chương trình: Tiếng Anh (IELTS, Business, Kids), Năng lực Sư phạm & Ứng dụng AI, Kỹ năng sống, Trải nghiệm quốc tế, Blog văn hóa.
- Lớp học trực tuyến WebRTC độ trễ siêu thấp (< 150ms) trên nền tảng LiveKit SFU (1 Host + 7-8 Học viên) tích hợp bảng trắng tương tác 2 chiều (Interactive Whiteboard).
- Phòng luyện viết AI IELTS Writing Studio (Task 1 & 2) phân tích 4 tiêu chí chuẩn Cambridge với quy trình phê duyệt (Human-in-the-Loop) của giáo viên.
- Studio thu âm luyện nói IELTS Speaking hiển thị sóng âm thời gian thực với bộ công cụ chấm điểm 4 tiêu chí và timestamp comments của Admin.
- Hệ thống thi trắc nghiệm & chẩn đoán năng lực 4 kỹ năng (Quiz & Diagnostic Engine) hỗ trợ 18 dạng câu hỏi IELTS, biểu đồ Radar và tự động mở khóa bài học tiếp theo ($\ge 80\%$).
- Hệ thống kiểm soát chuyên cần tự động dựa trên thời gian tham gia thực tế từ LiveKit Webhook và xuất báo cáo Excel (.xlsx).
- Quản trị Blog truyền thông, tiếp nhận lead tư vấn tuyển sinh, hệ thống thông báo in-app kèm loa phát thanh thời gian thực.
- Phân hệ quản trị người dùng, quản lý hồ sơ cá nhân và trung tâm chấm thi tích hợp (Assessments Hub) dành cho Admin.

### 1.3 Mô hình 2 vai trò duy nhất (Strict 2-Role RBAC)
Hệ thống được thiết kế theo nguyên tắc tối giản, phân quyền nghiêm ngặt với **ĐÚNG 2 VAI TRÒ**:
1. `STUDENT` (Học viên): Học bài, làm bài trắc nghiệm, nộp bài viết Writing, ghi âm bài Speaking, tham gia lớp WebRTC, vẽ bảng trắng khi được cấp quyền, theo dõi tiến độ, cập nhật hồ sơ cá nhân và nhận xét.
2. `ADMIN` (Quản trị viên kiêm Giáo viên): Toàn quyền quản trị hệ thống, quản lý tài khoản người dùng, tạo và sửa khóa học/bài học, tải học liệu, duyệt điểm AI Writing, nghe và chấm bài Speaking, làm Host lớp LiveKit (bật/tắt mic/cam, kick học viên, phân quyền bảng trắng), quản lý điểm danh, quản trị blog và xuất báo cáo.
> ⚠️ **TUYỆT ĐỐI KHÔNG TẠO VAI TRÒ GIÁO VIÊN TRUNG GIAN (TEACHER ROLE)**. Toàn bộ logic phân quyền chỉ xoay quanh `STUDENT` và `ADMIN`.

### 1.4 Thuật ngữ & Từ viết tắt
| Thuật ngữ / Viết tắt | Ý nghĩa |
|---|---|
| **LMS** | Learning Management System (Hệ thống quản lý đào tạo trực tuyến) |
| **WebRTC / SFU** | Web Real-Time Communication / Selective Forwarding Unit (LiveKit) |
| **RBAC** | Role-Based Access Control (Kiểm soát quyền truy cập theo vai trò) |
| **Single Session** | Cơ chế hạn chế chỉ 1 phiên đăng nhập đồng thời trên 1 tài khoản học viên |
| **Dynamic Watermark** | Dấu nhận diện cá nhân động chạy trên canvas chống quay chụp màn hình |
| **Presigned URL** | Đường dẫn tài liệu có ký số và tự động hết hạn sau 15 phút |
| **IELTS TR / TA** | Task Response (Task 2) / Task Achievement (Task 1) |
| **IELTS CC** | Coherence and Cohesion (Độ mạch lạc và liên kết) |
| **IELTS LR** | Lexical Resource (Vốn từ vựng) |
| **IELTS GRA** | Grammatical Range and Accuracy (Ngữ pháp đa dạng và chính xác) |
| **IELTS FC / PR** | Fluency and Coherence / Pronunciation (Trôi chảy & Phát âm) |

### 1.5 Tài liệu tham chiếu
- Đặc tả chi tiết màn hình & trường dữ liệu: [docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md](file:///D:/englishweb/docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md)
- Đặc tả RESTful API & WebSocket: [docs/API_DOCUMENTATION.md](file:///D:/englishweb/docs/API_DOCUMENTATION.md) (Swagger UI: `http://localhost:3001/api/docs`)
- Interactive Prototype: [docs/mock_test.html](file:///D:/englishweb/docs/mock_test.html)

---

## 2. MÔ TẢ TỔNG QUAN HỆ THỐNG (OVERALL DESCRIPTION)

### 2.1 Bối cảnh & Kiến trúc Monorepo
Hệ thống được tổ chức theo mô hình Monorepo đồng nhất:
- **Client (`/client`)**: Next.js 14+ (App Router, React 18, TypeScript), Tailwind CSS, shadcn/ui (Tone màu Sky Blue / Slate), LiveKit React Components, Web Audio API.
- **Server (`/server`)**: NestJS (TypeScript), Prisma ORM, MySQL 8.0, JWT HttpOnly Cookies, Socket.IO, LiveKit Server SDK, Swagger OpenAPI.
- **Infrastructure**: Container hóa hoàn chỉnh bằng Docker Compose (MySQL 8.0, LiveKit SFU, NestJS Backend, Next.js Frontend, Nginx Reverse Proxy).

### 2.2 Đặc tính người dùng
- **Học viên**: Đa dạng đối tượng (học sinh, sinh viên, người đi làm, học viên quốc tế). Giao diện trực quan, hỗ trợ 5 ngôn ngữ (`VI`, `EN`, `ZH`, `JA`, `KM`), thao tác 1 chạm vào lớp học, phản hồi học tập tức thì.
- **Admin (Teacher Dong)**: Cần giao diện quản trị tập trung (Dashboard, Assessments Hub), các công cụ duyệt điểm AI Writing nhanh chóng, giao diện chấm Speaking tiện lợi (phím tắt, tua +/- 5s, timestamp feedback) và quản lý chuyên cần chính xác.

### 2.3 Các ràng buộc thiết kế & bảo mật
1. **Single Concurrent Session**: Áp dụng đối với học viên. Đăng nhập mới trên thiết bị khác lập tức vô hiệu hóa phiên cũ. Khi nhận tín hiệu thu hồi phiên (`SESSION_TERMINATED`), client tự động kích hoạt lưu nháp khẩn cấp (`isEmergencySave: true`).
2. **Bảo vệ tài liệu số**: PDF và Audio lưu trữ riêng tư, không cung cấp link tải gốc, chỉ cấp Presigned URL 15 phút kèm Redis Blacklist thu hồi tức thời khi xóa/ẩn tài liệu, vẽ Dynamic Watermark liên tục di chuyển trên canvas.
3. **Phân tầng Backend**: Phân chia rõ `server/src/core/` (Hạ tầng dùng chung: common, livekit, prisma, mail, cloudinary, redis, gemini) và `server/src/modules/` (Nghiệp vụ: auth, courses, lessons, materials, quizzes, speaking, writing, attendance, dashboard, chat, blogs, notifications, users).

---

## 3. ĐẶC TẢ CHI TIẾT 17 PHÂN HỆ CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### FR-01: Phân hệ Xác thực, Quản lý Phiên & Hồ Sơ Cá Nhân (Authentication & Account Profile)
- **FR-1.1**: Đăng ký tài khoản học viên bằng Email & Mật khẩu. Mặc định gán vai trò `STUDENT`.
- **FR-1.2**: Đăng nhập Email & Mật khẩu. Hỗ trợ xác thực kép: Access Token (15 phút) và Refresh Token (7 ngày) lưu trữ trong HTTP-Only Cookie. Áp dụng Rate Limit chống Brute-force (`@Throttle(5, 60000)`).
- **FR-1.3 (Single Concurrent Session)**: Đối với học viên, khi đăng nhập trên thiết bị mới, hệ thống tự động thu hồi (`revokedAt = now()`) các Refresh Token đang hoạt động trước đó. Thiết bị cũ gọi request tiếp theo nhận lỗi `401 Unauthorized`. Vai trò `ADMIN` không bị giới hạn phiên.
- **FR-1.4 (Google OAuth 2.0)**:
  - Đăng nhập và tự động tạo tài khoản học viên qua Google OAuth.
  - Liên kết tài khoản Google với tài khoản Email/Password hiện có.
  - Hủy liên kết tài khoản Google (chỉ khi tài khoản đã thiết lập mật khẩu nội bộ).
- **FR-1.5 (Đổi & Quên mật khẩu)**:
  - Quên mật khẩu qua email SMTP (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).
  - Đổi mật khẩu (`POST /api/auth/change-password`): Yêu cầu mật khẩu cũ, tự động đăng xuất các phiên khác.
  - **Xác thực OTP qua Email**: Hỗ trợ endpoint yêu cầu mã OTP bảo mật gửi về hộp thư cá nhân (`POST /api/auth/change-password/request-otp`) trước khi hoàn tất đổi mật khẩu.
- **FR-1.6 (Quản lý phiên đa thiết bị)**: Xem danh sách các phiên đang hoạt động (`GET /api/auth/sessions`), thu hồi từ xa một phiên (`DELETE /api/auth/sessions/:id`), hoặc đăng xuất tất cả thiết bị (`POST /api/auth/logout-all`).
- **FR-1.7 (Quản lý hồ sơ cá nhân - Account Profile)**:
  - Xem thông tin hồ sơ cá nhân (`GET /api/auth/me`).
  - Cập nhật số điện thoại và họ tên (`PUT /api/auth/profile`).
  - Tải lên và cập nhật ảnh đại diện trực tiếp lên Cloudinary (`POST /api/auth/avatar`).
  - Giao diện người dùng chuyên biệt cho cả Student (`/student/account`) và Admin (`/admin/account`).

### FR-02: Phân hệ Đa Ngôn Ngữ (Internationalization - i18n)
- **FR-2.1**: Hỗ trợ đầy đủ 5 ngôn ngữ: Tiếng Việt (`VI`), Tiếng Anh (`EN`), Tiếng Trung giản thể (`ZH`), Tiếng Nhật (`JA`), Tiếng Khmer (`KM`).
- **FR-2.2**: Chuyển đổi ngôn ngữ tức thì qua dropdown menu trên Header mà không cần tải lại trang.
- **FR-2.3**: Tự động nhận diện ngôn ngữ theo cài đặt trình duyệt đối với khách vãng lai.
- **FR-2.4**: Đồng bộ ngôn ngữ đã chọn vào trường `preferredLang` trong hồ sơ học viên khi đã đăng nhập (`PUT /api/auth/language`).
- **FR-2.5**: Định dạng ngày tháng, múi giờ và số liệu theo chuẩn quốc tế của từng ngôn ngữ.

### FR-03: Phân hệ Quản lý Đào tạo, Khóa học & Duyệt Học Phí (LMS Curriculum & Enrollment)
- **FR-3.1**: Cấu trúc khóa học phân cấp 4 tầng:
  $$\text{Course (Khóa học)} \longrightarrow \text{Module (Chương)} \longrightarrow \text{Lesson (Bài học)} \longrightarrow \text{Components (Học liệu, Quiz, Speaking, Writing)}$$
- **FR-3.2 (5 Trụ cột chương trình)**:
  1. *English Proficiency*: IELTS Intensive, Business English Communication, English for Kids.
  2. *Professional Development*: Ứng dụng AI trong giảng dạy, Prompt Engineering, Phương pháp sư phạm.
  3. *Life Skills*: Tư duy phản biện, Thuyết trình, Quản trị thời gian.
  4. *Life Experiences*: Tư vấn du học, Định cư, Kinh nghiệm sống quốc tế.
  5. *Travel & Culture Blog*: Khám phá văn hóa toàn cầu.
- **FR-3.3**: Học viên xem danh sách khóa học, xem chi tiết đề cương, theo dõi % hoàn thành trên thanh tiến độ (`/courses/my-learning`), học bài học xem trước miễn phí (`isFreePreview`).
- **FR-3.4 (Admin CRUD & Sắp xếp)**:
  - CRUD Khóa học, tải ảnh bìa thumbnail lên Cloudinary (`POST /api/courses/upload-thumbnail`).
  - Kéo-thả sắp xếp thứ tự Module (`POST /api/lessons/modules/reorder`) và Lesson (`POST /api/lessons/reorder`).
  - Tải video bài giảng lên Cloudinary (`POST /api/lessons/:id/video`).
- **FR-3.5 (Quy trình Duyệt Học Phí & Đăng Ký)**:
  - Học viên gửi yêu cầu ghi danh kèm ghi chú chuyển khoản QR (`POST /api/courses/:id/enroll-request` với `paymentNote`, `paymentAmount`).
  - Admin duyệt chuyển khoản (`PUT /api/courses/admin/enrollments/:id/approve`) ➔ Kích hoạt trạng thái `ACTIVE`.
  - Admin từ chối yêu cầu (`PUT /api/courses/admin/enrollments/:id/reject`) kèm lý do ➔ Gửi mail tự động cho học viên.
  - **Admin ghi danh thủ công**: Admin có quyền thêm trực tiếp học viên vào bất kỳ khóa học nào (`POST /api/courses/admin/manual-enroll`).
- **FR-3.6 (Kiểm soát Paywall Cổng IELTS 4 Kỹ Năng)**:
  - Kiểm tra quyền truy cập phân hệ IELTS (`GET /api/courses/ielts-access`).
  - Yêu cầu học viên phải sở hữu ít nhất 1 khóa học thuộc danh mục Tiếng Anh (`ENGLISH`, `IELTS`, `BUSINESS`, `KIDS`) mới được mở khóa toàn bộ cổng luyện thi IELTS Hub.

### FR-04: Phân hệ Kho Học liệu Số Bảo mật & Media CDN (Secured Digital Library & Cloudinary Media)
- **FR-4.1**: Hỗ trợ 2 định dạng học liệu chính: Tài liệu PDF và Tệp âm thanh Audio MP3.
- **FR-4.2**: Trình xem PDF trực tiếp trên giao diện website, hỗ trợ lật trang, zoom, toàn màn hình. Trình phát Audio MP3 tích hợp tua tiến/lùi, điều chỉnh tốc độ.
- **FR-4.3 (Chống rò rỉ học liệu)**:
  - Tuyệt đối không cung cấp nút tải trực tiếp file gốc về máy.
  - Vô hiệu hóa chuột phải (`contextmenu`), phím tắt lưu trang (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`).
  - Học liệu lưu tại Private Storage, phân phối qua Presigned URL thời hạn 15 phút (`POST /api/materials/:id/signed-url`).
  - Thu hồi tức thì qua Redis Blacklist khi tài liệu bị ẩn hoặc xóa.
  - Stream dữ liệu inline nhị phân thật (`GET /api/materials/:id/stream?token=...`).
- **FR-4.4 (Dynamic Watermark)**: Lớp phủ Canvas hiển thị định danh cá nhân `[Họ tên] - [Mã học viên] - [SĐT] - [Thời gian thực]`, tự động trôi dạt tọa độ mượt mà ngẫu nhiên theo chu kỳ (12-15 giây) trên màn hình.
- **FR-4.5 (Quản lý Media Cloudinary Độc Lập)**:
  - Bộ điều khiển media trung tâm (`/api/media`): Tải ảnh theo folder chỉ định (`upload/image`), tải video (`upload/video`), xóa asset Cloudinary theo `publicId`.

### FR-05: Phân hệ Lớp học Trực tuyến WebRTC (LiveKit Live Classroom & Interactive Whiteboard)
- **FR-5.1 (Quy mô & Hạ tầng)**: 01 Admin Host + 7-8 Học viên tham gia đồng thời. Độ trễ âm thanh/hình ảnh < 150ms trên nền tảng LiveKit SFU.
- **FR-5.2 (Giao diện phòng học)**: Grid camera thông minh: 1 ô Host lớn nổi bật và 7 ô học viên bố trí hợp lý bên cạnh hoặc bên dưới.
- **FR-5.3 (Quyền học viên)**: Bật/tắt Micro và Camera, Giơ tay phát biểu, Chia sẻ màn hình (khi Host cho phép), Tương tác bảng trắng (khi Host cấp quyền).
- **FR-5.4 (Quyền Admin Host)**:
  - Quản trị phòng học: Bắt đầu/Kết thúc buổi học (`endRoom`), Mute mic từ xa (`mute-participant`).
  - **Kick học viên vi phạm**: Buộc học viên rời khỏi phòng học (`POST /api/livekit/kick-participant`).
  - Cấp hoặc khóa quyền vẽ bảng trắng của học viên (`POST /api/livekit/rooms/:roomName/whiteboard/permission`).
  - Xóa trắng bảng vẽ (`POST /api/livekit/rooms/:roomName/whiteboard/clear`).
- **FR-5.5 (Bảng trắng tương tác 2 chiều)**: Bút vẽ tự do, highlight, tẩy, hình khối, văn bản; đồng bộ nét vẽ thời gian thực qua LiveKit DataChannels; lưu lịch sử nét vẽ trên RAM phiên học và tự động dọn dẹp khi phòng đóng (`ENDED`).
- **FR-5.6 (Lịch sử lớp học & Tác vụ nền)**:
  - Admin xem lịch sử các buổi dạy (`GET /api/livekit/admin/history`).
  - Học viên xem lịch sử các lớp đã join/chưa join (`GET /api/livekit/student/history`).
  - Tác vụ tự động quét đóng các phòng học quá giờ dự kiến 30 phút.

### FR-06: Phân hệ Luyện viết IELTS Writing Chấm bằng AI & Ngân Hàng Đề (AI Writing Assessment & Prompts)
- **FR-6.1**: Hỗ trợ IELTS Writing Task 1 (tối thiểu 150 từ, gợi ý 20p) và Task 2 (tối thiểu 250 từ, gợi ý 40p).
- **FR-6.2**: Trình soạn thảo văn bản trực quan tích hợp bộ đếm từ trực tiếp (Real-time Word Counter), đồng hồ đếm ngược, tự động lưu bản nháp định kỳ (`WritingDraft`).
  - Cơ chế **Lưu nháp khẩn cấp** (`isEmergencySave: true`) khi xảy ra sự kiện mất mạng hoặc bị thu hồi phiên đăng nhập (`SESSION_TERMINATED`).
- **FR-6.3 (Đánh giá AI theo 4 tiêu chí chuẩn IELTS)**: AI Gemini phân tích chi tiết Task Achievement (TR/TA), Coherence & Cohesion (CC), Lexical Resource (LR), Grammatical Range & Accuracy (GRA); gợi ý từ vựng nâng cao C1/C2 và tự động tạo bài viết mẫu Band 8.5+ tức thời (`sampleBand8Essay`).
- **FR-6.4 (Human-in-the-Loop Approval)**: Bài nộp ở trạng thái chờ duyệt (`AI_EVALUATED`). Admin xem xét, có quyền điều chỉnh điểm (override), bổ sung nhận xét sư phạm và phê duyệt (`POST /api/writing/admin/submissions/:id/approve`) trước khi công bố cho học viên.
- **FR-6.5 (Ngân hàng đề bài Writing Độc lập)**:
  - Giao diện quản trị ngân hàng đề chuyên biệt: `/admin/writing-prompts`.
  - CRUD đề bài Writing độc lập (`/api/writing/prompts`), cho phép học viên luyện tập tự do không bắt buộc gắn với bài học khóa học.

### FR-07: Phân hệ Luyện nói & Chấm điểm IELTS Speaking (Speaking Studio & Standalone Prompts)
- **FR-7.1**: Học viên nhận đề bài Speaking, hướng dẫn làm bài và nghe Audio phát âm mẫu từ giáo viên (`sampleAudioUrl`).
- **FR-7.2 (Ghi âm sóng âm)**: Thu âm trực tiếp qua trình duyệt bằng Web Audio API, hiển thị sóng âm thời gian thực (Audio Waveform), đồng hồ bấm giờ (min 30s - max 120s), nghe lại, thu âm lại và nộp bài.
  - Hỗ trợ tải trực tiếp tệp âm thanh ghi âm lên Cloudinary thông qua multipart form (`POST /api/speaking/submissions/with-audio`).
- **FR-7.3 (Admin Chấm Thủ Công - Không Dùng AI)**:
  - Audio Player chuyên dụng: Tua nhanh/chậm (0.75x, 1x, 1.25x, 1.5x, 2x), nút tua tiến/lùi 5 giây (`-5s` / `+5s`), thanh trượt sóng âm.
  - Chấm điểm 4 tiêu chí: Fluency & Coherence (FC), Lexical Resource (LR), Grammatical Range & Accuracy (GRA), Pronunciation (PR) và Overall Band Score.
  - **Timestamp Comments**: Admin gắn nhận xét tại mốc giây cụ thể của bản ghi âm. Học viên click vào nhận xét sẽ tự động nhảy đến đúng giây đó trên audio.
- **FR-7.4 (Ngân hàng đề bài Speaking Độc lập)**:
  - Giao diện quản trị ngân hàng đề luyện nói chuyên biệt: `/admin/speaking-prompts`.
  - CRUD đề bài Speaking độc lập (`/api/speaking/prompts`) với tùy chỉnh thời lượng tối thiểu/tối đa và file audio mẫu.

### FR-08: Phân hệ Kiểm tra, Trắc nghiệm 18 Dạng & Chẩn Đoán Năng Lực (Quiz Engine & 4-Skills Diagnostic)
- **FR-8.1 (18 Dạng câu hỏi chuyên sâu chuẩn Cambridge IELTS)**:
  - *Trắc nghiệm cơ bản*: SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK.
  - *IELTS Reading*: TRUE_FALSE_NOT_GIVEN, YES_NO_NOT_GIVEN, MATCHING_HEADINGS, MATCHING_INFORMATION, MATCHING_FEATURES, SENTENCE_COMPLETION, SUMMARY_COMPLETION.
  - *IELTS Listening*: NOTE_COMPLETION, FORM_COMPLETION, MAP_DIAGRAM_LABELING, FLOW_CHART_COMPLETION, SHORT_ANSWER.
  - *Writing & Speaking*: ESSAY_TASK_1, ESSAY_TASK_2, SPEAKING_PART_1, SPEAKING_PART_2, SPEAKING_PART_3.
- **FR-8.2**: Hỗ trợ bài đọc dài (`passage`), tệp âm thanh nghe (`audioUrl`), đồng hồ đếm ngược, phân loại 4 cấp độ: `LESSON_QUIZ`, `PRACTICE_TEST`, `FULL_MOCK_TEST`, `DIAGNOSTIC_TEST`.
- **FR-8.3 (Chấm điểm & Mở khóa bài học)**: Tự động chấm tức thì; yêu cầu sàn điểm $\ge 80\%$ để đạt và mở khóa bài học kế tiếp trong lộ trình đào tạo.
- **FR-8.4 (Nhập câu hỏi hàng loạt - Bulk Import)**: Admin tải lên danh sách câu hỏi số lượng lớn vào đề thi qua API (`POST /api/quizzes/:id/questions/bulk`).
- **FR-8.5 (Hệ thống Chẩn đoán Năng lực 4 Kỹ năng - Diagnostic Engine)**:
  - Báo cáo phân tích chuyên sâu cho học viên (`GET /api/quizzes/diagnostic/me`): Thống kê tỷ lệ sai theo từng dạng bài, xác định điểm mạnh, điểm yếu và gợi ý lộ trình cải thiện kèm Biểu đồ Radar.
  - Báo cáo toàn học viện cho Admin (`GET /api/quizzes/diagnostic/admin/overview`) và chi tiết từng học viên (`/diagnostic/students/:studentId`).

### FR-09: Phân hệ Điểm danh Tự động & Báo cáo Chuyên cần (Automated Attendance & Excel Export)
- **FR-9.1 (Webhook LiveKit Idempotency)**: Tự động ghi nhận thời gian vào (`firstJoinedAt`), thời gian ra (`lastLeftAt`) và tính tổng số phút học thực tế (`totalMinutes`) dựa trên trường `event.createdAt` và composite key `(roomName, identity, joinedAt)`.
- **FR-9.2 (Quy tắc xác định chuyên cần)**:
  - `PRESENT` (Có mặt): Vào lớp trong vòng 15 phút đầu tiên VÀ tổng thời lượng tham gia $\ge 80\%$ thời lượng buổi học.
  - `LATE` (Đi muộn): Tham gia sau 15 phút đầu tiên của buổi học.
  - `ABSENT` (Vắng mặt): Không tham gia HOẶC thời gian tham gia dưới $30\%$ thời lượng buổi học.
- **FR-9.3 (Can thiệp Admin)**: Admin xem log chi tiết, điều chỉnh thủ công (`override`) có ghi chú lý do (`note`), hoặc thực hiện điểm danh trực tiếp (`POST /api/attendance/mark`).
- **FR-9.4 (Xuất báo cáo Excel)**: Xuất file Excel (.xlsx) theo từng buổi học cụ thể hoặc xuất tổng hợp theo khoảng ngày/khóa học (`/api/attendance/export`).

### FR-10: Phân hệ Dashboard & Cổng Luyện Thi Cá Nhân Hóa (Dashboard, Analytics & IELTS Master Hub)
- **FR-10.1 (Dashboard Học viên)**: Hiển thị các khóa học đang theo học kèm thanh tiến độ %, lịch học sắp diễn ra kèm nút "Vào phòng học ngay" 1 chạm, bài tập Quiz/Writing/Speaking cần nộp và tóm tắt chuyên cần.
- **FR-10.2 (Student IELTS Master Hub)**: Màn hình trung tâm cá nhân hóa (`/student/ielts`): Thiết lập Target Band, biểu đồ Radar 4 kỹ năng, phân tích chi tiết điểm yếu/điểm mạnh theo từng dạng câu hỏi và lối tắt làm bài luyện tập.
- **FR-10.3 (Dashboard Admin)**: Thống kê số lượng học viên active, tổng số khóa học, bài học; số lượng bài Writing chờ AI duyệt và Speaking chờ chấm; biểu đồ chuyên cần và tự động quét đóng phòng học cũ.

### FR-11: Phân hệ Nhắn tin Thời gian thực (Realtime Chat & Messaging)
- **FR-11.1**: Kênh trao đổi 1-1 trực tiếp giữa Admin và Học viên qua Socket.IO thời gian thực.
- **FR-11.2**: Hiển thị danh sách hội thoại, số tin nhắn chưa đọc (Unread badge), trạng thái đang soạn thảo tin nhắn (`typing indicator`) và trạng thái đã xem (`read receipts` tick xanh + timestamp `readAt`).
- **FR-11.3**: Lưu trữ toàn bộ lịch sử trò chuyện trong cơ sở dữ liệu (`Conversation`, `Message`), đảm bảo bảo mật và phân quyền dữ liệu nghiêm ngặt.

### FR-12: Phân hệ Quản trị Blog & Media Truyền thông (Blog Management & Markdown AST)
- **FR-12.1**: Cổng đọc tin tức & bài viết công khai (`/blog`, `/blog/[slug]`): Khách và học viên xem các bài viết ở trạng thái `PUBLISHED`.
- **FR-12.2**: Quản trị bài viết dành cho Admin (`/admin/blogs`): Toàn quyền CRUD bài viết theo 3 trạng thái (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- **FR-12.3**: Tích hợp Cloudinary lưu trữ ảnh bìa (`coverImage`) và video review; cơ chế tự động xóa asset trên Cloudinary khi bài viết bị xóa.
- **FR-12.4**: Bộ phân tích cú pháp Markdown AST hiển thị bài viết trực quan; thuật toán tự động ước tính thời gian đọc chuẩn 200 WPM; tự động tăng lượt xem (`viewCount`).

### FR-13: Phân hệ Tiếp nhận Tư vấn Tuyển sinh (Consultation Leads & Anti-Spam)
- **FR-13.1**: Form thu thập thông tin học viên tiềm năng tại Landing Page công khai (`fullName`, `email`, `phone`, `interestedProgram`, `message`).
- **FR-13.2 (Anti-Spam Rate Limit)**: Áp dụng `@Throttle({ default: { limit: 3, ttl: 600000 } })` giới hạn tối đa 3 lần gửi / 10 phút trên mỗi địa chỉ IP chống spam bot.
- **FR-13.3 (Thông báo tức thì)**: Endpoint `POST /api/notifications/consultation` tự động chuyển tiếp thông tin đăng ký cho Admin qua Email SMTP và Socket.IO notification.

### FR-14: Phân hệ Trung tâm Thông báo & Loa Phát thanh (Notifications & WebSocket Broadcast)
- **FR-14.1**: Quản lý thông báo In-App cho người dùng (bài viết được duyệt, bài nói đã chấm, lớp học sắp diễn ra, thông báo hệ thống), đếm số chưa đọc, đánh dấu đã đọc (`/api/notifications/read-all`).
- **FR-14.2 (Loa phát thanh toàn trường)**: Admin phát thông báo khẩn cấp tới toàn bộ hoặc nhóm người dùng qua WebSocket (`POST /api/notifications/broadcast`) hiển thị tức thì trên màn hình học viên.

### FR-15: Phân hệ Quản lý Người dùng & Học viên Dành cho Admin (User & Student Administration)
- **FR-15.1**: Màn hình quản trị người dùng tập trung: `/admin/users`.
- **FR-15.2 (Tạo tài khoản học viên)**: Admin chủ động tạo tài khoản học viên mới trực tiếp (`POST /api/users`), thiết lập mật khẩu ban đầu và thông tin liên hệ.
- **FR-15.3 (Xem & Tìm kiếm)**: Xem danh sách toàn bộ học viên, lọc theo `Role`, phân trang và tìm kiếm theo từ khóa họ tên, email, số điện thoại (`GET /api/users`).
- **FR-15.4 (Khóa / Kích hoạt tài khoản)**: Admin có quyền khóa tài khoản học viên vi phạm quy chế hoặc kích hoạt lại tài khoản (`PUT /api/users/:id/status` với trường `isActive`). Tài khoản bị khóa sẽ bị chặn đăng nhập ngay lập tức.
- **FR-15.5 (Cấp lại mật khẩu cưỡng bức)**: Admin can thiệp đặt lại mật khẩu mới cho học viên (`PUT /api/users/:id/reset-password`) mà không cần qua luồng email OTP.

### FR-16: Phân hệ Kiểm tra & Gửi Email Hệ thống (Mail Dispatch & SMTP Health Check)
- **FR-16.1**: Endpoint kiểm tra trạng thái hoạt động của hạ tầng SMTP Nodemailer (`GET /api/mail/status`).
- **FR-16.2**: Admin gửi email thử nghiệm kiểm tra đường truyền gửi thư (`POST /api/mail/test`).
- **FR-16.3**: Admin chủ động gửi email thông báo tùy chỉnh bằng tiếng Anh tới danh sách email học viên (`POST /api/mail/send-custom`).

### FR-17: Trung tâm Đánh giá & Chấm thi Tích hợp của Admin (Admin Assessments & Grading Studio Hub)
- **FR-17.1**: Màn hình quản trị hợp nhất: `/admin/assessments`.
- **FR-17.2**: Tích hợp toàn diện 4 phân hệ chấm thi trên một giao diện thống nhất:
  - Tab 1: Quản trị Mock Tests & Ngân hàng câu hỏi trắc nghiệm.
  - Tab 2: Hàng đợi duyệt bài Writing & Giao diện override điểm AI.
  - Tab 3: Studio nghe và chấm điểm Speaking kèm Timestamp comments.
  - Tab 4: Thống kê chẩn đoán năng lực 4 kỹ năng toàn học viện.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 4.1 Yêu cầu về Hiệu năng (Performance)
- Tải trang tĩnh và SSR: Thời gian phản hồi trang dưới **1.5 giây**.
- Độ trễ âm thanh/hình ảnh phòng học WebRTC LiveKit: Dưới **150ms**.
- Thời gian phân tích bài viết của AI: Dưới **15 giây**.
- Khả năng phục vụ đồng thời: Tối thiểu **100 học viên** truy cập và làm bài cùng lúc.

### 4.2 Yêu cầu về An toàn & Bảo mật (Security)
- Toàn bộ mật khẩu người dùng được băm an toàn bằng thuật toán **Bcrypt** với salt round $\ge 10$.
- Token xác thực JWT gồm Access Token (15m) và Refresh Token (7d) được lưu trong **HTTP-Only Cookies** với các cờ `Secure`, `SameSite=Lax`.
- Áp dụng cơ chế **Single Concurrent Session** cho toàn bộ học viên.
- Tài liệu học tập lưu tại Private Storage, phân phối qua Presigned URL thời hạn 15 phút, thu hồi tức thì qua Redis Blacklist và bảo vệ bằng Dynamic Watermark.
- Phân quyền RBAC nghiêm ngặt: Mọi endpoint nhạy cảm đều được bảo vệ bởi `JwtAuthGuard` và `RolesGuard`.

### 4.3 Khả năng sẵn sàng & Phục hồi (Reliability & Availability)
- Tính sẵn sàng hệ thống đạt tối thiểu **99.9%** thời gian hoạt động (uptime).
- Phòng học LiveKit hỗ trợ tự động kết nối lại (Auto-reconnect) khi gặp sự cố mạng gián đoạn nhẹ.
- Định kỳ sao lưu (backup) cơ sở dữ liệu MySQL tự động hàng ngày.

### 4.4 Khả năng tương thích & Giao diện (Compatibility & Usability)
- Tương thích hoàn toàn trên các trình duyệt hiện đại: Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari.
- Thiết kế Responsive hoàn chỉnh cho 3 kích thước màn hình: Desktop ($\ge 1024\text{px}$), Tablet ($768\text{px} - 1023\text{px}$), Mobile ($< 768\text{px}$).
- Giao diện người dùng theo tông màu chủ đạo **Sky Blue / Slate**, chuẩn phong cách EdTech hiện đại, thanh lịch, thân thiện và dễ sử dụng.

---

## 5. MÔ HÌNH DỮ LIỆU & KIẾN TRÚC TỔ CHỨC MÃ NGUỒN

### 5.1 Cấu trúc Cơ sở dữ liệu Prisma Schema
```
users                  -> Quản lý tài khoản, vai trò (STUDENT/ADMIN), trạng thái (isActive), avatarUrl, ngôn ngữ (preferredLang)
refresh_tokens         -> Quản lý phiên, deviceId, ipAddress, cơ chế Single Concurrent Session
google_accounts        -> Thông tin liên kết tài khoản Google OAuth 2.0
courses                -> Danh mục khóa học (5 trụ cột chương trình), thumbnail Cloudinary
course_modules         -> Chương học thuộc khóa học, thứ tự sắp xếp orderIndex
lessons                -> Bài học thuộc chương học, videoUrl Cloudinary, isFreePreview, orderIndex
materials              -> Học liệu PDF / Audio có bảo vệ, isWatermarked, fileKey
enrollments            -> Đăng ký khóa học, paymentNote, paymentAmount, status (PENDING/ACTIVE/REJECTED), % tiến độ
lesson_progresses      -> Theo dõi trạng thái hoàn thành từng bài học của học viên
writing_prompts        -> Đề bài IELTS Writing Task 1 & Task 2 (độc lập hoặc thuộc bài học)
writing_submissions    -> Bài nộp Writing, phân tích AI 4 tiêu chí, sampleBand8Essay và phê duyệt của Admin
writing_drafts         -> Bản nháp bài viết tự động lưu và lưu khẩn cấp khi ngắt phiên
speaking_prompts       -> Đề bài Speaking độc lập hoặc theo bài học, audio mẫu, min/max thời lượng
speaking_submissions   -> File ghi âm Cloudinary, điểm 4 tiêu chí và timestamp comments của Admin
quizzes                -> Đề thi 18 dạng câu hỏi, 4 kỹ năng (READING, LISTENING, WRITING, SPEAKING), passScore 80%
questions              -> Câu hỏi trắc nghiệm và câu hỏi IELTS chuyên sâu
question_options       -> Các lựa chọn đáp án trắc nghiệm
quiz_submissions       -> Kết quả làm quiz, điểm số, trạng thái Đạt/Chưa đạt
quiz_answers           -> Chi tiết câu trả lời của từng học viên
classrooms             -> Thông tin phòng học LiveKit SFU (1 Host + 7-8 Students), status (SCHEDULED/ACTIVE/ENDED)
attendance_records     -> Dữ liệu điểm danh, log phút học, phân loại PRESENT/LATE/ABSENT, isManualOverride
conversations          -> Cuộc trò chuyện 1-1 giữa Admin và Học viên
messages               -> Nội dung tin nhắn chat thời gian thực qua Socket.IO, isRead, readAt
blog_posts             -> Quản lý bài viết Blog, coverImage, tags, category, status (DRAFT/PUBLISHED/ARCHIVED), viewCount
notifications          -> Thông báo hệ thống in-app, liên kết bài viết, đếm số chưa đọc
```

### 5.2 Kiến trúc thư mục chuẩn Monorepo
```
englishweb/
├── client/                              # Ứng dụng Frontend Next.js 14 App Router
│   ├── src/app/(auth)/                  # Tuyến đường đăng nhập, đăng ký, quên mật khẩu
│   ├── src/app/(student)/student/       # Cổng thông tin học viên (Dashboard, IELTS Hub, Courses, Materials, WebRTC, Studio, Account)
│   ├── src/app/(admin)/admin/           # Cổng quản trị viên (Dashboard, Courses, Assessments, Quizzes, Grading, Prompts, Blogs, Users, Attendance, Account)
│   ├── src/app/blog/                    # Cổng đọc tin tức & bài viết công khai (danh sách và chi tiết [slug])
│   └── src/middleware.ts                # Next.js Middleware kiểm soát route theo cookie role
│
└── server/                              # Ứng dụng Backend NestJS
    └── src/
        ├── core/                        # 🛠️ VÙNG HẠ TẦNG DÙNG CHUNG
        │   ├── common/                  # Guards (Jwt, Roles, Throttle), Decorators, Filters, Interceptors
        │   ├── livekit/                 # LiveKit SDK Service, SFU Room Management, Webhook & Bảng trắng
        │   ├── prisma/                  # Prisma ORM Service kết nối MySQL 8.0
        │   ├── mail/                    # Nodemailer SMTP Service & Health Check
        │   ├── cloudinary/              # Cloudinary SDK Upload Service & Media Controller
        │   ├── redis/                   # Redis Service (Blacklist token, Cache)
        │   └── gemini/                  # Google Gemini AI Service chấm Writing 4 tiêu chí
        │
        └── modules/                     # 📦 VÙNG PHÂN HỆ NGHIỆP VỤ (BẮT BUỘC)
            ├── auth/                    # Module xác thực, phiên đơn, Google OAuth, Profile, Avatar
            ├── courses/                 # Quản lý khóa học, đề cương, duyệt học phí, IELTS Paywall
            ├── lessons/                 # Quản lý bài học, modules, video Cloudinary, kéo-thả sắp xếp
            ├── materials/               # Học liệu số, Watermark, Presigned URL, Stream nhị phân
            ├── quizzes/                 # Quiz Engine 18 dạng câu hỏi, Bulk import, Chẩn đoán 4 kỹ năng
            ├── speaking/                # Speaking Studio, thu âm sóng âm, chấm điểm timestamp comments
            ├── writing/                 # AI Writing Studio, Gemini 4 tiêu chí, Admin duyệt, Drafts
            ├── attendance/              # Webhook chuyên cần, tính phút học, xuất Excel
            ├── dashboard/               # Thống kê phân tích số liệu cho Student và Admin
            ├── chat/                    # Socket.IO Gateway nhắn tin thời gian thực
            ├── blogs/                   # Quản lý Blog, Markdown AST, viewCount
            ├── notifications/           # Thông báo in-app, tiếp nhận leads tư vấn, Loa phát thanh
            └── users/                   # Quản lý người dùng, học viên, khóa tài khoản, đổi mật khẩu
```

---

## 6. KẾ HOẠCH BÀN GIAO & 20 TIÊU CHÍ NGHIỆM THU

### 6.1 Lộ trình 6 tuần triển khai
| Giai đoạn | Hạng mục công việc trọng tâm | Đầu ra mục tiêu |
|:---:|---|---|
| **Tuần 1** | Hạ tầng, Database, Xác thực & Đa ngôn ngữ | Khởi tạo môi trường, CSDL Prisma MySQL, Auth Single Session, Profile/Avatar, i18n 5 thứ tiếng |
| **Tuần 2** | Quản lý khóa học & LMS Engine | Hoàn thiện khóa học 4 cấp, tính % tiến độ, luồng duyệt học phí QR, sắp xếp bài học |
| **Tuần 3** | Kho học liệu số bảo mật & Media Cloudinary | Tích hợp PDF/Audio Stream, Dynamic Watermark, Presigned URL 15m, Media Controller |
| **Tuần 4** | Lớp học trực tuyến WebRTC & Điểm danh | Phòng học LiveKit 1 Host + 7-8 Học viên, Bảng trắng DataChannel, Kick học viên, Webhook chuyên cần |
| **Tuần 5** | AI Writing Studio, Speaking Studio & Chat | Chấm Writing AI 4 tiêu chí & Admin duyệt, Thu âm Speaking & chấm điểm, Chat Socket.IO |
| **Tuần 6** | Quiz 18 dạng, Blog, Leads, Users & Nghiệm thu | Quiz Engine & Chẩn đoán 4 kỹ năng, Quản trị Blog, Tiếp nhận Lead tư vấn, Admin Users, Test e2e 100% |

### 6.2 20 Tiêu chí nghiệm thu chức năng chuẩn (Acceptance Criteria)
1. **Tiêu chí 1**: Hệ thống đăng ký, đăng nhập email/mật khẩu, đăng nhập Google, đổi mật khẩu (hỗ trợ xác thực qua Email OTP) và luồng quên mật khẩu hoạt động chính xác.
2. **Tiêu chí 2**: Cơ chế giới hạn 1 phiên đăng nhập đồng thời đối với học viên (Single Concurrent Session) và quản lý thu hồi phiên đa thiết bị hoạt động ổn định; tự động lưu nháp khẩn cấp khi bị ngắt phiên.
3. **Tiêu chí 3**: Quản lý hồ sơ cá nhân (Account Profile) cho phép cập nhật số điện thoại, họ tên và tải ảnh đại diện Avatar lên Cloudinary hoạt động chính xác cho cả Student và Admin.
4. **Tiêu chí 4**: Chuyển đổi mượt mà giữa 5 ngôn ngữ (VI, EN, JA, ZH, KM) không gây lỗi hiển thị giao diện hay mất trạng thái, đồng bộ `preferredLang` vào cơ sở dữ liệu.
5. **Tiêu chí 5**: Admin tạo và quản lý toàn diện khóa học, sắp xếp thứ tự module/lesson bằng kéo thả, tải video bài giảng Cloudinary, hỗ trợ bài học học thử (`isFreePreview`) và ghi danh thủ công.
6. **Tiêu chí 6**: Luồng học viên đăng ký chuyển khoản học phí, Admin xem xét duyệt hoặc từ chối kèm lý do gửi email hoạt động ổn định; kiểm soát Paywall cổng IELTS Hub chính xác.
7. **Tiêu chí 7**: Học viên chỉ truy cập được tài liệu PDF và Audio khi có quyền hợp lệ của khóa học đã đăng ký; Presigned URL 15 phút và cơ chế thu hồi qua Redis Blacklist hoạt động chuẩn xác.
8. **Tiêu chí 8**: Dynamic Watermark hiển thị đầy đủ thông tin định danh học viên và trôi dạt tọa độ mượt mà; chặn chuột phải và phím tắt lưu trang (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`).
9. **Tiêu chí 9**: Phòng học WebRTC hỗ trợ 1 Admin Host + 7-8 Học viên tương tác ổn định; Admin có quyền kick học viên, mute mic từ xa, quản trị quyền bảng trắng; tự động đóng phòng quá giờ 30 phút.
10. **Tiêu chí 10**: AI phân tích bài Writing theo chuẩn 4 tiêu chí IELTS, sinh bài mẫu Band 8.5+; hệ thống hỗ trợ lưu bản nháp định kỳ; Admin có thể điều chỉnh điểm và phê duyệt trước khi công bố kết quả.
11. **Tiêu chí 11**: Học viên ghi âm bài Speaking hiển thị sóng âm; Admin nghe lại, điều chỉnh tốc độ, tua +/- 5s và chấm điểm 4 tiêu chí kèm timestamp comments chính xác từng giây.
12. **Tiêu chí 12**: Quản lý ngân hàng đề bài Writing và Speaking độc lập cho phép học viên luyện tập tự do ngoài giáo trình bài học.
13. **Tiêu chí 13**: Hệ thống Quiz hỗ trợ 18 dạng câu hỏi chuyên sâu chuẩn Cambridge IELTS, bài đọc dài, audio nghe, tự động chấm điểm, sàn đạt $\ge 80\%$ để mở bài kế tiếp; hỗ trợ nhập câu hỏi hàng loạt (Bulk Import).
14. **Tiêu chí 14**: Báo cáo chẩn đoán năng lực 4 kỹ năng của học viên và toàn học viện hiển thị chính xác qua biểu đồ Radar; phân tích dạng bài hay làm sai và đề xuất giải pháp.
15. **Tiêu chí 15**: Hệ thống tự động ghi nhận thời gian tham gia và phân loại chuyên cần (PRESENT, LATE, ABSENT) chuẩn xác qua LiveKit Webhook với cơ chế Idempotency deduplication.
16. **Tiêu chí 16**: Admin có thể xem log chi tiết vào/ra, điều chỉnh thủ công có ghi chú lý do, điểm danh cưỡng bức và xuất báo cáo điểm danh dưới định dạng file Excel (`.xlsx`).
17. **Tiêu chí 17**: Dashboard hiển thị chính xác các thông tin học tập, phân tích và thống kê theo đúng quyền truy cập của STUDENT và ADMIN; Student IELTS Master Hub cá nhân hóa lộ trình.
18. **Tiêu chí 18**: Chức năng nhắn tin thời gian thực giữa Admin và học viên qua Socket.IO gửi nhận tin cậy, bảo mật, hiển thị trạng thái đang soạn thảo (`typing`) và đã xem (`read`).
19. **Tiêu chí 19**: Quản lý xuất bản bài viết Blog, tích hợp Cloudinary tải lên ảnh/video, bộ phân tích Markdown AST và tự động đếm lượt xem (`viewCount`) hoạt động chuẩn xác.
20. **Tiêu chí 20**: Form tiếp nhận tư vấn tuyển sinh tại Landing Page có Rate Limit IP chống spam; trung tâm thông báo in-app và loa phát thanh toàn trường WebSocket hoạt động ổn định; Admin quản lý toàn diện người dùng (xem danh sách, khóa/mở tài khoản, cấp lại mật khẩu).
