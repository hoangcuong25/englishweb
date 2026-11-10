# TÀI LIỆU ĐẶC TẢ CHI TIẾT RESTFUL API VÀ WEBSOCKET
## TEACHER DONG ACADEMY — HỆ THỐNG LMS & WEBRTC IN-HOUSE

> **Phiên bản tài liệu**: 1.0.0  
> **Cập nhật lần cuối**: 2026-11-09  
> **Backend Framework**: NestJS (TypeScript), Prisma ORM, MySQL 8.0, Socket.IO, LiveKit SFU  
> **Global Prefix**: `/api`  
> **Swagger OpenAPI Document**: `http://localhost:3001/api/docs`  
> **Base URL Local**: `http://localhost:3001/api`  
> **Mô hình Phân quyền (Strict 2-Role RBAC)**: `STUDENT` | `ADMIN` (Tuyệt đối không có Teacher trung gian)

---

## MỤC LỤC
1. [Quy Chuẩn Chung & Cơ Chế Xác Thực (Authentication & Security)](#1-quy-chuẩn-chung--cơ-chế-xác-thực)
2. [Cấu Trúc Phản Hồi Chuẩn Hóa (Response Envelopes)](#2-cấu-trúc-phản-hồi-chuẩn-hóa)
3. [Bảng Tổng Hợp Danh Mục Endpoints Theo Phân Hệ](#3-bảng-tổng-hợp-danh-mục-endpoints)
4. [Chi Tiết Đặc Tả Endpoints Từng Phân Hệ](#4-chi-tiết-đặc-tả-endpoints)
   - [4.1. Phân Hệ Xác Thực & Phiên Đăng Nhập (Auth & Sessions)](#41-phân-hệ-xác-thực--phiên-đăng-nhập-auth--sessions)
   - [4.2. Phân Hệ Quản Lý Người Dùng & Học Viên (Users Management)](#42-phân-hệ-quản-lý-người-dùng--học-viên-users-management)
   - [4.3. Phân Hệ Khóa Học & Danh Mục Đào Tạo (Courses & Catalog)](#43-phân-hệ-khóa-học--danh-mục-đào-tạo-courses--catalog)
   - [4.4. Phân Hệ Chương Học & Bài Học (Curriculum & Lessons)](#44-phân-hệ-chương-học--bài-học-curriculum--lessons)
   - [4.5. Phân Hệ Học Liệu Số & Chống Sao Chép (Digital Library & DRM)](#45-phân-hệ-học-liệu-số--chống-sao-chép-digital-library--drm)
   - [4.6. Phân Hệ Thi Trắc Nghiệm & Chẩn Đoán 4 Kỹ Năng (Quiz Engine & Diagnostics)](#46-phân-hệ-thi-trắc-nghiệm--chẩn-đoán-4-kỹ-năng-quiz-engine--diagnostics)
   - [4.7. Phân Hệ Luyện Viết AI IELTS Writing Studio (AI Writing)](#47-phân-hệ-luyện-viết-ai-ielts-writing-studio-ai-writing)
   - [4.8. Phân Hệ Luyện Nói IELTS Speaking Studio (Speaking Assessment)](#48-phân-hệ-luyện-nói-ielts-speaking-studio-speaking-assessment)
   - [4.9. Phân Hệ Lớp Học Trực Tuyến LiveKit WebRTC & Bảng Trắng](#49-phân-hệ-lớp-học-trực-tuyến-livekit-webrtc--bảng-trắng)
   - [4.10. Phân Hệ Kiểm Soát Chuyên Cần Tự Động (Automated Attendance)](#410-phân-hệ-kiểm-soát-chuyên-cần-tự-động-automated-attendance)
   - [4.11. Phân Hệ Nhắn Tin Thời Gian Thực (Chat & Messaging)](#411-phân-hệ-nhắn-tin-thời-gian-thực-chat--messaging)
   - [4.12. Phân Hệ Bảng Điều Khiển & Phân Tích (Dashboard & Analytics)](#412-phân-hệ-bảng-điều-khiển--phân-tích-dashboard--analytics)
   - [4.13. Phân Hệ Tin Tức & Bài Viết Chia Sẻ (Blogs & Content)](#413-phân-hệ-tin-tức--bài-viết-chia-sẻ-blogs--content)
   - [4.14. Phân Hệ Quản Trị Tải Lên Đa Phương Tiện (Cloudinary Media)](#414-phân-hệ-quản-trị-tải-lên-đa-phương-tiện-cloudinary-media)
5. [Đặc Tả WebSocket Gateways (Realtime Events)](#5-đặc-tả-websocket-gateways-realtime-events)
   - [5.1. LiveKit Whiteboard Gateway (`/whiteboard`)](#51-livekit-whiteboard-gateway-whiteboard)
   - [5.2. Realtime Chat Gateway (`/chat`)](#52-realtime-chat-gateway-chat)
6. [Danh Mục Mã Trạng Thái HTTP & Mã Lỗi Hệ Thống](#6-danh-mục-mã-trạng-thái-http--mã-lỗi-hệ-thống)

---

## 1. QUY CHUẨN CHUNG & CƠ CHẾ XÁC THỰC

### 1.1. Header & Cookie Authentication
Hệ thống hỗ trợ đồng thời 2 hình thức truyền JWT Authentication Token:
1. **HTTP-Only Cookies (Khuyến nghị cho Web Client/SPA)**:
   - `access_token`: Thời hạn 15 phút, tự động gửi kèm mỗi request cùng domain/subdomain.
   - `refresh_token`: Thời hạn 7 ngày, đường dẫn giới hạn `/api/auth`.
   - `user_role`: Lưu vai trò người dùng (`STUDENT` hoặc `ADMIN`) để Next.js Middleware route guarding.
2. **Authorization Header (Dành cho Swagger, API Client, Mobile, Postman)**:
   - `Authorization: Bearer <access_token>`

### 1.2. Cơ Chế Single Concurrent Session (Duy Nhất 1 Phiên Đồng Thời Cho Học Viên)
- Khi tài khoản có vai trò `STUDENT` thực hiện đăng nhập từ trình duyệt hoặc thiết bị mới:
  - Hệ thống tự động thu hồi (revoke) toàn bộ Refresh Token của các phiên trước đó trong bảng `RefreshToken`.
  - Phiên cũ nếu tiếp tục gửi request sẽ bị từ chối với lỗi `401 Unauthorized` (Session terminated on another device).
- Đối với `ADMIN`: Cho phép duy trì đa phiên phục vụ giảng dạy và điều hành quản trị viên linh hoạt.

### 1.3. Phân Quyền Vai Trò (Strict 2-Role RBAC)
- Toàn bộ endpoint được bảo vệ qua bộ đôi Guard: `@UseGuards(JwtAuthGuard, RolesGuard)` và decorator `@Roles(...)`.
- Chỉ chấp nhận 2 vai trò:
  - `STUDENT`: Học viên chính thức.
  - `ADMIN`: Quản trị viên kiêm Giảng viên chủ sở hữu (Teacher Dong).

---

## 2. CẤU TRÚC PHẢN HỒI CHUẨN HÓA

Toàn bộ API được kiểm soát bởi `ResponseInterceptor` (cho thành công) và `AllExceptionsFilter` (cho ngoại lệ/lỗi).

### 2.1. Chuẩn Phản Hồi Thành Công (`StandardSuccessResponse<T>`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thông điệp xử lý thành công nghiệp vụ",
  "data": { ... },
  "timestamp": "2026-11-09T14:30:00.000Z",
  "path": "/api/courses"
}
```

### 2.2. Chuẩn Phản Hồi Thất Bại (`StandardErrorResponse`)
```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_FAILED",
  "message": [
    "Tiêu đề bài viết không được để trống",
    "password phải chứa ít nhất 6 ký tự"
  ],
  "error": "Bad Request",
  "timestamp": "2026-11-09T14:30:00.000Z",
  "path": "/api/auth/register"
}
```

---

## 3. BẢNG TỔNG HỢP DANH MỤC ENDPOINTS

| STT | Phân Hệ | Method | Endpoint URL | Vai Trò (RBAC) | Mô Tả Chức Năng |
|:---:|:---|:---:|:---|:---:|:---|
| **1** | **Auth** | `POST` | `/api/auth/register` | `PUBLIC` | Đăng ký tài khoản học viên (`STUDENT`) |
| **2** | | `POST` | `/api/auth/login` | `PUBLIC` | Đăng nhập bằng Email & Password (Single Session) |
| **3** | | `POST` | `/api/auth/google` | `PUBLIC` | Đăng nhập / Đăng ký qua Google OAuth 2.0 |
| **4** | | `POST` | `/api/auth/google/link` | `STUDENT, ADMIN` | Liên kết Google Account vào tài khoản hiện tại |
| **5** | | `POST` | `/api/auth/google/unlink` | `STUDENT, ADMIN` | Hủy liên kết Google Account |
| **6** | | `POST` | `/api/auth/refresh` | `PUBLIC` | Cấp lại Access Token mới từ Refresh Token |
| **7** | | `POST` | `/api/auth/logout` | `PUBLIC` | Đăng xuất và hủy Refresh Token hiện tại |
| **8** | | `POST` | `/api/auth/logout-all` | `STUDENT, ADMIN` | Đăng xuất khỏi mọi thiết bị / phiên làm việc |
| **9** | | `POST` | `/api/auth/change-password` | `STUDENT, ADMIN` | Đổi mật khẩu tài khoản và thu hồi các phiên khác |
| **10** | | `GET` | `/api/auth/sessions` | `STUDENT, ADMIN` | Lấy danh sách các phiên đăng nhập đang hoạt động |
| **11** | | `DELETE` | `/api/auth/sessions/:id` | `STUDENT, ADMIN` | Thu hồi / chấm dứt một phiên đăng nhập cụ thể |
| **12** | | `PUT` | `/api/auth/language` | `STUDENT, ADMIN` | Cập nhật ngôn ngữ giao diện ưu tiên (VI, EN, ZH, JA) |
| **13** | | `GET` | `/api/auth/me` | `STUDENT, ADMIN` | Lấy thông tin hồ sơ người dùng đang đăng nhập |
| **14** | **Users** | `GET` | `/api/users` | `ADMIN` | Lấy danh sách người dùng & học viên (phân trang, lọc) |
| **15** | | `GET` | `/api/users/:id` | `ADMIN` | Xem chi tiết hồ sơ & tiến độ học tập của học viên |
| **16** | | `PUT` | `/api/users/:id/status` | `ADMIN` | Khóa hoặc kích hoạt lại tài khoản học viên |
| **17** | | `PUT` | `/api/users/:id/reset-password` | `ADMIN` | Quản trị viên cấp lại mật khẩu cho học viên |
| **18** | | `POST` | `/api/users/:id/avatar` | `ADMIN` | Tải lên ảnh đại diện đại diện lên Cloudinary |
| **19** | **Courses** | `GET` | `/api/courses/categories` | `PUBLIC` | Lấy 5 trụ cột đào tạo tiếng Anh |
| **20** | | `GET` | `/api/courses/my-learning` | `STUDENT` | Lấy danh sách khóa học đã ghi danh kèm % hoàn thành |
| **21** | | `GET` | `/api/courses` | `PUBLIC / AUTH` | Danh sách khóa học (lọc theo danh mục, từ khóa) |
| **22** | | `GET` | `/api/courses/:slugOrId` | `PUBLIC / AUTH` | Chi tiết khóa học, toàn bộ Modules và Bài học |
| **23** | | `POST` | `/api/courses` | `ADMIN` | Tạo khóa học mới |
| **24** | | `PUT` | `/api/courses/:id` | `ADMIN` | Cập nhật thông tin khóa học |
| **25** | | `DELETE` | `/api/courses/:id` | `ADMIN` | Xóa khóa học |
| **26** | | `POST` | `/api/courses/:id/enroll` | `STUDENT` | Học viên đăng ký / ghi danh tham gia khóa học |
| **27** | | `POST` | `/api/courses/:id/thumbnail` | `ADMIN` | Upload ảnh thumbnail khóa học lên Cloudinary |
| **28** | **Lessons** | `POST` | `/api/lessons/modules` | `ADMIN` | Tạo Chương học (Module) mới |
| **29** | | `PUT` | `/api/lessons/modules/:id` | `ADMIN` | Cập nhật tên/thứ tự Chương học |
| **30** | | `DELETE` | `/api/lessons/modules/:id` | `ADMIN` | Xóa Chương học |
| **31** | | `POST` | `/api/lessons/modules/reorder` | `ADMIN` | Sắp xếp lại thứ tự các Chương học |
| **32** | | `POST` | `/api/lessons` | `ADMIN` | Tạo Bài học (Lesson) mới |
| **33** | | `PUT` | `/api/lessons/:id` | `ADMIN` | Cập nhật nội dung Bài học |
| **34** | | `DELETE` | `/api/lessons/:id` | `ADMIN` | Xóa Bài học |
| **35** | | `POST` | `/api/lessons/reorder` | `ADMIN` | Sắp xếp lại thứ tự Bài học trong Chương |
| **36** | | `GET` | `/api/lessons/:id` | `PUBLIC / AUTH` | Lấy chi tiết bài học (video, học liệu số, quiz) |
| **37** | | `POST` | `/api/lessons/:id/complete` | `STUDENT` | Đánh dấu hoàn thành bài học, cập nhật tiến độ % |
| **38** | | `POST` | `/api/lessons/:id/video` | `ADMIN` | Upload video bài giảng lên Cloudinary |
| **39** | **Materials**| `POST` | `/api/materials` | `ADMIN` | Tải lên / tạo metadata tài liệu số PDF/Audio mới |
| **40** | | `PUT` | `/api/materials/:id` | `ADMIN` | Cập nhật thông tin tài liệu số |
| **41** | | `DELETE` | `/api/materials/:id` | `ADMIN` | Xóa tài liệu số |
| **42** | | `GET` | `/api/materials/lesson/:lessonId`| `STUDENT, ADMIN`| Lấy danh sách tài liệu thuộc bài học |
| **43** | | `GET` | `/api/materials/:id` | `STUDENT, ADMIN`| Lấy thông tin chi tiết của tài liệu |
| **44** | | `POST` | `/api/materials/:id/signed-url` | `STUDENT, ADMIN`| Cấp Presigned URL 15 phút + Watermark payload |
| **45** | | `GET` | `/api/materials/:id/stream` | `PUBLIC / SIGNED` | Stream trực tiếp tài liệu bảo mật inline chống tải |
| **46** | **Quizzes** | `POST` | `/api/quizzes` | `ADMIN` | Tạo bài thi trắc nghiệm / Test 4 kỹ năng |
| **47** | | `POST` | `/api/quizzes/:id/questions` | `ADMIN` | Thêm câu hỏi phân loại theo dạng bài và kỹ năng |
| **48** | | `GET` | `/api/quizzes/skills/tests` | `PUBLIC / AUTH` | Danh sách đề thi phân loại 4 kỹ năng IELTS |
| **49** | | `GET` | `/api/quizzes/diagnostic/me` | `STUDENT, ADMIN`| Báo cáo chẩn đoán năng lực 4 kỹ năng của học viên |
| **50** | | `GET` | `/api/quizzes/diagnostic/admin/overview`| `ADMIN` | Thống kê các dạng câu hỏi hay làm sai toàn trường |
| **51** | | `GET` | `/api/quizzes/diagnostic/students/:studentId`| `ADMIN` | Xem hồ sơ chẩn đoán điểm yếu của một học viên |
| **52** | | `GET` | `/api/quizzes/lesson/:lessonId` | `PUBLIC / AUTH` | Lấy bài kiểm tra Quiz theo bài học |
| **53** | | `GET` | `/api/quizzes/:id` | `PUBLIC / AUTH` | Lấy đề Quiz (ẩn đáp án đúng với học viên) |
| **54** | | `POST` | `/api/quizzes/:id/submit` | `STUDENT` | Nộp bài làm Quiz, tự động chấm điểm & mở khóa bài |
| **55** | | `GET` | `/api/quizzes/:id/my-submissions`| `STUDENT` | Xem lịch sử nộp bài và giải thích đáp án |
| **56** | | `DELETE` | `/api/quizzes/:id` | `ADMIN` | Xóa bài kiểm tra Quiz |
| **57** | **Writing** | `GET` | `/api/writing/prompts` | `PUBLIC` | Danh sách đề bài IELTS Writing Task 1 & 2 |
| **58** | | `GET` | `/api/writing/prompts/:id` | `PUBLIC` | Xem chi tiết đề bài Writing |
| **59** | | `POST` | `/api/writing/prompts` | `ADMIN` | Tạo đề bài Writing mới |
| **60** | | `PUT` | `/api/writing/prompts/:id` | `ADMIN` | Cập nhật đề bài Writing |
| **61** | | `DELETE` | `/api/writing/prompts/:id` | `ADMIN` | Xóa đề bài Writing |
| **62** | | `POST` | `/api/writing/submissions` | `STUDENT` | Nộp bài viết -> AI phân tích 4 tiêu chí & sinh Band 8+ |
| **63** | | `GET` | `/api/writing/submissions/my` | `STUDENT` | Xem lịch sử các bài viết đã nộp của cá nhân |
| **64** | | `GET` | `/api/writing/submissions/:id` | `STUDENT, ADMIN`| Xem chi tiết bài nộp và kết quả phân tích AI |
| **65** | | `GET` | `/api/writing/admin/submissions` | `ADMIN` | Danh sách bài viết học viên chờ duyệt hoặc đã duyệt |
| **66** | | `POST` | `/api/writing/admin/submissions/:id/approve` | `ADMIN` | Giáo viên điều chỉnh điểm và phê duyệt công bố |
| **67** | **Speaking**| `GET` | `/api/speaking/prompts` | `PUBLIC` | Danh sách đề bài luyện nói IELTS Speaking |
| **68** | | `GET` | `/api/speaking/prompts/:id` | `PUBLIC` | Xem chi tiết đề bài Speaking |
| **69** | | `POST` | `/api/speaking/prompts` | `ADMIN` | Tạo đề bài Speaking mới |
| **70** | | `PUT` | `/api/speaking/prompts/:id` | `ADMIN` | Cập nhật đề bài Speaking |
| **71** | | `DELETE` | `/api/speaking/prompts/:id` | `ADMIN` | Xóa đề bài Speaking |
| **72** | | `POST` | `/api/speaking/submissions` | `STUDENT` | Nộp bản ghi âm bài nói Speaking |
| **73** | | `GET` | `/api/speaking/submissions/my` | `STUDENT` | Xem lịch sử các bài ghi âm đã nộp |
| **74** | | `GET` | `/api/speaking/submissions/:id` | `STUDENT, ADMIN`| Chi tiết bài nói, điểm 4 tiêu chí & timestamp feedback |
| **75** | | `GET` | `/api/speaking/admin/submissions`| `ADMIN` | Danh sách bài nói chờ chấm hoặc đã chấm |
| **76** | | `POST` | `/api/speaking/admin/submissions/:id/grade` | `ADMIN` | Giáo viên chấm 4 tiêu chí (FC, LR, GRA, PR) + timestamp |
| **77** | **LiveKit** | `GET` | `/api/livekit/rooms` | `STUDENT, ADMIN`| Danh sách phòng học đang hoạt động hoặc theo lịch |
| **78** | | `POST` | `/api/livekit/rooms` | `ADMIN` | Lập lịch mở phòng học WebRTC LiveKit mới |
| **79** | | `POST` | `/api/livekit/token` | `STUDENT, ADMIN`| Cấp token phân quyền tham gia phòng học WebRTC |
| **80** | | `POST` | `/api/livekit/end-room` | `ADMIN` | Admin Host kết thúc phòng học cho toàn bộ thành viên |
| **81** | | `POST` | `/api/livekit/mute-participant`| `ADMIN` | Admin Host tắt mic / cam của người tham gia |
| **82** | | `POST` | `/api/livekit/webhook` | `PUBLIC / WEBHOOK` | Webhook nhận sự kiện participant từ LiveKit SFU |
| **83** | | `GET` | `/api/livekit/rooms/:roomName/whiteboard` | `STUDENT, ADMIN`| Lấy snapshot toàn bộ nét vẽ hiện tại trên bảng trắng |
| **84** | | `POST` | `/api/livekit/rooms/:roomName/whiteboard/stroke` | `STUDENT, ADMIN`| Vẽ một nét mới lên bảng trắng lớp học |
| **85** | | `POST` | `/api/livekit/rooms/:roomName/whiteboard/clear` | `STUDENT, ADMIN`| Xóa toàn bộ nội dung bảng trắng |
| **86** | | `POST` | `/api/livekit/rooms/:roomName/whiteboard/permission` | `ADMIN` | Cấp / thu hồi quyền vẽ bảng trắng của học viên |
| **87** | **Attendance**| `POST` | `/api/attendance/classrooms` | `ADMIN` | Tạo lớp học trực tuyến phục vụ kiểm soát chuyên cần |
| **88** | | `GET` | `/api/attendance/classrooms` | `ADMIN` | Lấy danh sách phòng học và trạng thái |
| **89** | | `GET` | `/api/attendance/classroom/:classroomId` | `ADMIN` | Xem danh sách điểm danh chi tiết của phòng học |
| **90** | | `GET` | `/api/attendance/my` | `STUDENT` | Học viên xem lịch sử chuyên cần của bản thân |
| **91** | | `PUT` | `/api/attendance/:id/override` | `ADMIN` | Điều chỉnh thủ công điểm danh (PRESENT/LATE/ABSENT) |
| **92** | | `GET` | `/api/attendance/classroom/:classroomId/export` | `ADMIN` | Xuất báo cáo điểm danh ra file Excel (.xlsx) |
| **93** | **Chat** | `GET` | `/api/chat/conversations` | `STUDENT, ADMIN`| Lấy danh sách hội thoại của người dùng |
| **94** | | `GET` | `/api/chat/conversations/:id/messages` | `STUDENT, ADMIN`| Lấy tin nhắn trong hội thoại (hỗ trợ phân trang) |
| **95** | | `POST` | `/api/chat/conversations/:id/messages` | `STUDENT, ADMIN`| Gửi tin nhắn qua HTTP (fallback khi mất socket) |
| **96** | | `PUT` | `/api/chat/conversations/:id/read` | `STUDENT, ADMIN`| Đánh dấu đã đọc toàn bộ tin nhắn trong hội thoại |
| **97** | **Dashboard** | `GET` | `/api/dashboard/student` | `STUDENT` | Thống kê số giờ học, tiến độ, điểm trung bình học viên |
| **98** | | `GET` | `/api/dashboard/admin` | `ADMIN` | Tổng quan số liệu toàn học viện, bài tập chờ chấm |
| **99** | **Blogs** | `POST` | `/api/blogs` | `ADMIN` | Đăng bài viết Blog mới (kèm ảnh bìa & video Cloudinary) |
| **100**| | `PUT` | `/api/blogs/:id` | `ADMIN` | Cập nhật bài viết Blog |
| **101**| | `GET` | `/api/blogs` | `PUBLIC / AUTH` | Danh sách bài viết Blog (tìm kiếm, lọc danh mục, tags) |
| **102**| | `GET` | `/api/blogs/:slugOrId` | `PUBLIC / AUTH` | Xem chi tiết bài viết Blog (tự động tăng viewCount) |
| **103**| | `DELETE` | `/api/blogs/:id` | `ADMIN` | Xóa bài viết Blog và dọn dẹp assets Cloudinary |
| **104**| | `POST` | `/api/blogs/:id/cover` | `ADMIN` | Upload ảnh bìa riêng cho bài viết |
| **105**| | `POST` | `/api/blogs/:id/video` | `ADMIN` | Upload video riêng cho bài viết |
| **106**| **Media** | `POST` | `/api/media/upload/image` | `STUDENT, ADMIN`| Upload ảnh trực tiếp lên Cloudinary |
| **107**| | `POST` | `/api/media/upload/video` | `STUDENT, ADMIN`| Upload video trực tiếp lên Cloudinary |
| **108**| | `DELETE` | `/api/media/:publicId` | `STUDENT, ADMIN`| Xóa file media trên Cloudinary |
| **109**| **App** | `GET` | `/api` | `PUBLIC` | Health-check endpoint hệ thống |

---

## 4. CHI TIẾT ĐẶC TẢ ENDPOINTS TỪNG PHÂN HỆ

### 4.1. Phân Hệ Xác Thực & Phiên Đăng Nhập (Auth & Sessions)

#### 4.1.1. `POST /api/auth/register`
- **Mô tả**: Đăng ký tài khoản học viên mới (mặc định chỉ cấp vai trò `STUDENT`).
- **Phân quyền**: Public (không yêu cầu token).
- **Request Body (`RegisterDto`)**:
  ```json
  {
    "email": "student@example.com",
    "password": "Password123!",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "preferredLang": "VI",
    "deviceId": "browser-fingerprint-uuid"
  }
  ```
- **Validation Rules**:
  - `email`: Bắt buộc, định dạng email chuẩn, không được trùng lặp trong hệ thống (HTTP 409 nếu trùng).
  - `password`: Bắt buộc, tối thiểu 6 ký tự.
  - `fullName`: Bắt buộc, chuỗi không rỗng.
  - `preferredLang`: Không bắt buộc, giá trị trong `['VI', 'EN', 'ZH', 'JA']`, mặc định `'VI'`.
- **Response**: Trả về thông tin tài khoản và thiết lập đồng thời 3 HTTP cookies (`access_token`, `refresh_token`, `user_role`).

#### 4.1.2. `POST /api/auth/login`
- **Mô tả**: Đăng nhập bằng Email và Password. Kích hoạt logic **Single Concurrent Session** cho `STUDENT`.
- **Phân quyền**: Public.
- **Request Body (`LoginDto`)**:
  ```json
  {
    "email": "student@example.com",
    "password": "Password123!",
    "deviceId": "chrome-win11-xyz"
  }
  ```
- **Cơ chế Single Session**: Nếu tài khoản là `STUDENT`, hệ thống lập tức thu hồi mọi Refresh Token cũ. Phiên đăng nhập trên các trình duyệt/thiết bị khác sẽ bị ngắt kết nối ngay lập tức.
- **Response Data (`200 OK`)**:
  ```json
  {
    "user": {
      "id": "c0a80123-uuid",
      "email": "student@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "STUDENT",
      "preferredLang": "VI",
      "avatarUrl": "https://res.cloudinary.com/..."
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "7a8b9c..."
  }
  ```

#### 4.1.3. `POST /api/auth/google`
- **Mô tả**: Xác thực qua Google OAuth 2.0 (tự động tạo tài khoản học viên nếu email chưa tồn tại).
- **Phân quyền**: Public.
- **Request Body (`GoogleAuthDto`)**:
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIs...",
    "clientId": "google-client-id-here",
    "deviceId": "optional-device-id"
  }
  ```

#### 4.1.4. `POST /api/auth/refresh`
- **Mô tả**: Làm mới Access Token (15 phút) bằng Refresh Token (7 ngày).
- **Phân quyền**: Public (Đọc cookie `refresh_token` hoặc qua trường `refreshToken` trong Body).
- **Mã lỗi**: Trả về `401 Unauthorized` nếu Refresh Token đã bị thu hồi do đăng nhập ở thiết bị khác.

#### 4.1.5. `POST /api/auth/logout`
- **Mô tả**: Đăng xuất phiên làm việc hiện tại, thu hồi token và xóa cookies.

#### 4.1.6. `POST /api/auth/logout-all`
- **Mô tả**: Chấm dứt toàn bộ phiên làm việc của tài khoản trên tất cả các thiết bị.
- **Phân quyền**: `STUDENT`, `ADMIN` (`JwtAuthGuard`).

#### 4.1.7. `POST /api/auth/change-password`
- **Mô tả**: Đổi mật khẩu tài khoản và thu hồi các phiên đăng nhập khác để bảo đảm an toàn.
- **Phân quyền**: `STUDENT`, `ADMIN` (`JwtAuthGuard`).
- **Request Body (`ChangePasswordDto`)**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }
  ```

#### 4.1.8. `GET /api/auth/sessions` & `DELETE /api/auth/sessions/:id`
- **Mô tả**: Xem danh sách các phiên đăng nhập (kèm IP, User-Agent, Thời gian đăng nhập cuối) và thu hồi phiên từ xa.

#### 4.1.9. `PUT /api/auth/language`
- **Mô tả**: Cập nhật ngôn ngữ hiển thị giao diện của người dùng (`VI`, `EN`, `ZH`, `JA`).

#### 4.1.10. `GET /api/auth/me`
- **Mô tả**: Lấy thông tin tài khoản hiện tại từ Token.

---

### 4.2. Phân Hệ Quản Lý Người Dùng & Học Viên (Users Management)

> 🔒 **Toàn bộ endpoint trong phân hệ này chỉ dành riêng cho vai trò `ADMIN`**.

#### 4.2.1. `GET /api/users`
- **Query Params**:
  - `role`: Lọc theo vai trò (`STUDENT` hoặc `ADMIN`).
  - `search`: Tìm kiếm theo Họ tên, Email, Số điện thoại.
  - `page`: Trang hiện tại (mặc định 1).
  - `limit`: Số bản ghi mỗi trang (mặc định 10).
- **Response**: Trả về danh sách người dùng kèm phân trang `total`, `page`, `limit`, `totalPages`.

#### 4.2.2. `GET /api/users/:id`
- **Mô tả**: Xem chi tiết hồ sơ học viên, danh sách khóa học đang tham gia, tiến độ % hoàn thành, lịch sử điểm danh và điểm các bài tập Writing/Speaking/Quiz.

#### 4.2.3. `PUT /api/users/:id/status`
- **Mô tả**: Khóa (`isActive: false`) hoặc mở khóa (`isActive: true`) tài khoản học viên.
- **Request Body**: `{"isActive": false}`.

#### 4.2.4. `PUT /api/users/:id/reset-password`
- **Mô tả**: Admin đặt lại mật khẩu mới cho học viên.
- **Request Body**: `{"newPassword": "TempPassword123!"}`.

#### 4.2.5. `POST /api/users/:id/avatar`
- **Mô tả**: Upload avatar cho học viên/quản trị viên lên Cloudinary qua `multipart/form-data`.

---

### 4.3. Phân Hệ Khóa Học & Danh Mục Đào Tạo (Courses & Catalog)

#### 4.3.1. `GET /api/courses/categories`
- **Mô tả**: Lấy danh mục 5 trụ cột đào tạo cốt lõi của Teacher Dong Academy:
  1. `IELTS`: Luyện thi chuyên sâu 4 kỹ năng.
  2. `BUSINESS`: Tiếng Anh thương mại & giao tiếp chuyên nghiệp.
  3. `KIDS`: Tiếng Anh trẻ em & Thiếu niên.
  4. `TEACHING`: Kỹ năng giảng dạy & Phương pháp sư phạm.
  5. `LIFE_SKILLS`: Kỹ năng sống & Tư duy toàn cầu.

#### 4.3.2. `GET /api/courses/my-learning`
- **Phân quyền**: `STUDENT`.
- **Mô tả**: Lấy danh sách các khóa học học viên đã đăng ký kèm tiến độ học tập (`progressPercentage: 0 -> 100%`) và trạng thái hoàn thành.

#### 4.3.3. `GET /api/courses`
- **Query Params**:
  - `category`: Lọc theo `CourseCategory`.
  - `search`: Lọc theo tiêu đề/mô tả khóa học.
- **Mô tả**: Học viên và khách chỉ thấy khóa học `isPublished = true`. Admin thấy toàn bộ khóa học cả nháp lẫn công khai.

#### 4.3.4. `GET /api/courses/:slugOrId`
- **Mô tả**: Lấy toàn bộ cây nội dung khóa học: Thông tin khóa -> Danh sách Modules (Chương) -> Danh sách Bài học (Lessons) kèm trạng thái hoàn thành của học viên.

#### 4.3.5. `POST /api/courses` & `PUT /api/courses/:id` & `DELETE /api/courses/:id`
- **Phân quyền**: `ADMIN`.
- **Request Body (`CreateCourseDto`)**:
  ```json
  {
    "title": "IELTS Intensive Band 6.5 -> 7.5+ Masterclass",
    "slug": "ielts-intensive-masterclass",
    "description": "Lộ trình đào tạo bứt phá 4 kỹ năng với phương pháp độc quyền của Teacher Dong.",
    "category": "IELTS",
    "thumbnail": "https://res.cloudinary.com/...",
    "isPublished": true
  }
  ```

#### 4.3.6. `POST /api/courses/:id/enroll`
- **Phân quyền**: `STUDENT`.
- **Mô tả**: Ghi danh học viên vào khóa học để mở quyền truy cập bài học và theo dõi tiến độ.

---

### 4.4. Phân Hệ Chương Học & Bài Học (Curriculum & Lessons)

#### 4.4.1. Module Endpoints (`/api/lessons/modules`)
- `POST /api/lessons/modules`: Tạo chương học mới (`courseId`, `title`, `orderIndex`).
- `PUT /api/lessons/modules/:id`: Cập nhật tiêu đề hoặc mô tả chương học.
- `DELETE /api/lessons/modules/:id`: Xóa chương học (cascade xóa bài học liên quan).
- `POST /api/lessons/modules/reorder`: Admin kéo thả sắp xếp lại thứ tự các chương học:
  ```json
  {
    "items": [
      { "id": "module-1-uuid", "orderIndex": 0 },
      { "id": "module-2-uuid", "orderIndex": 1 }
    ]
  }
  ```

#### 4.4.2. Lesson Endpoints (`/api/lessons`)
- `POST /api/lessons`: Tạo bài học mới trong chương (`moduleId`, `title`, `content`, `videoUrl`, `orderIndex`, `isFree`).
- `PUT /api/lessons/:id`: Cập nhật nội dung bài học.
- `DELETE /api/lessons/:id`: Xóa bài học.
- `POST /api/lessons/reorder`: Sắp xếp lại thứ tự các bài học.
- `GET /api/lessons/:id`: Lấy chi tiết bài học kèm video giảng dạy, tài liệu số PDF/MP3 đính kèm và bài kiểm tra Quiz.
- `POST /api/lessons/:id/complete`: Học viên đánh dấu hoàn thành bài học. Hệ thống tự động tính lại % tiến độ của toàn khóa học.
- `POST /api/lessons/:id/video`: Upload video bài giảng định dạng MP4/WebM trực tiếp lên Cloudinary.

---

### 4.5. Phân Hệ Học Liệu Số & Chống Sao Chép (Digital Library & DRM)

#### 4.5.1. `POST /api/materials`
- **Phân quyền**: `ADMIN`.
- **Request Body (`CreateMaterialDto`)**:
  ```json
  {
    "title": "IELTS Academic Writing Task 2 Master Formula PDF",
    "description": "Tài liệu lưu hành nội bộ có chứa Watermark bảo mật",
    "type": "PDF",
    "fileUrl": "https://storage.googleapis.com/.../secret-doc.pdf",
    "lessonId": "lesson-uuid-here",
    "isSecure": true
  }
  ```

#### 4.5.2. `POST /api/materials/:id/signed-url`
- **Phân quyền**: `STUDENT`, `ADMIN` (`JwtAuthGuard`).
- **Mô tả**: Cấp Signed URL tạm thời có thời hạn chính xác **15 phút (900 giây)**.
- **Cơ chế Watermark**: Response trả về token ký số bảo mật chứa payload thông tin học viên (`fullName`, `email`, `phone`, `id`). Phía Next.js Client sử dụng payload này để vẽ canvas **Dynamic Watermark** chuyển động liên tục trên màn hình xem tài liệu chống chụp màn hình.

#### 4.5.3. `GET /api/materials/:id/stream`
- **Query Params**: `token` (Token ký số 15 phút).
- **Mô tả**: Stream tài liệu PDF/Audio trực tiếp dưới dạng `inline`, thiết lập header chống cache và vô hiệu hóa nút tải xuống của trình duyệt:
  ```http
  Content-Disposition: inline; filename="..."
  Cache-Control: private, no-cache, no-store, must-revalidate
  X-Content-Type-Options: nosniff
  ```

---

### 4.6. Phân Hệ Thi Trắc Nghiệm & Chẩn Đoán 4 Kỹ Năng (Quiz Engine & Diagnostics)

#### 4.6.1. `POST /api/quizzes`
- **Phân quyền**: `ADMIN`.
- **Request Body (`CreateQuizDto`)**:
  ```json
  {
    "title": "IELTS Academic Reading Mock Test 1",
    "description": "Đề thi thử kỹ năng Đọc gồm 3 bài đọc chuyên sâu",
    "skill": "READING",
    "testType": "FULL_MOCK_TEST",
    "passage": "The history of modern architecture...",
    "audioUrl": null,
    "timeLimitMinutes": 60,
    "passScore": 80,
    "lessonId": null
  }
  ```

#### 4.6.2. `POST /api/quizzes/:id/questions`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Thêm câu hỏi phân loại chi tiết theo dạng bài thi thật (Question Type) và kỹ năng để phục vụ AI Diagnostic Engine.
- **Request Body (`CreateQuestionDto`)**:
  ```json
  {
    "prompt": "According to paragraph 2, why did early skyscrapers adopt steel frames?",
    "type": "MULTIPLE_CHOICE",
    "questionType": "MULTIPLE_CHOICE",
    "skill": "READING",
    "orderIndex": 1,
    "points": 1,
    "explanation": "Paragraph 2 states clearly that steel framing allowed higher load bearing.",
    "options": [
      { "text": "To reduce building weight", "isCorrect": false, "orderIndex": 0 },
      { "text": "To support greater vertical structural loads", "isCorrect": true, "orderIndex": 1 },
      { "text": "To lower production costs", "isCorrect": false, "orderIndex": 2 },
      { "text": "To prevent earthquake damage", "isCorrect": false, "orderIndex": 3 }
    ]
  }
  ```

#### 4.6.3. `GET /api/quizzes/diagnostic/me` (Học viên chẩn đoán năng lực 4 Kỹ năng)
- **Phân quyền**: `STUDENT`.
- **Mô tả**: Phân tích toàn diện lịch sử làm bài thi của học viên theo 4 kỹ năng (Reading, Listening, Writing, Speaking).
- **Response Data**:
  - `overallAccuracy`: Tỷ lệ chính xác trung bình.
  - `weakQuestionTypes`: Top các dạng bài hay sai nhất (ví dụ: `TRUE_FALSE_NOT_GIVEN`, `HEADINGS_MATCHING`, `MULTIPLE_CHOICE`).
  - `strengths`: Dạng câu hỏi học viên có độ chính xác cao (&ge; 85%).
  - `recommendedActions`: Lời khuyên cụ thể để cải thiện band điểm.

#### 4.6.4. `GET /api/quizzes/diagnostic/admin/overview`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Báo cáo tổng thể toàn học viện: Thống kê 5 dạng câu hỏi mà học sinh hay mắc lỗi nhất, tỷ lệ đạt điểm sàn &ge; 80%.

#### 4.6.5. `POST /api/quizzes/:id/submit`
- **Phân quyền**: `STUDENT`.
- **Mô tả**: Học viên nộp bài làm Quiz. Hệ thống đối chiếu đáp án đúng tức thì, tính điểm phần trăm.
- **Quy tắc Nghiệp vụ (Sàn đạt &ge; 80%)**: Nếu điểm đạt &ge; `passScore` (mặc định 80%), hệ thống tự động cập nhật trạng thái `isPassed = true` và hoàn thành bài học tương ứng.
- **Request Body (`SubmitQuizDto`)**:
  ```json
  {
    "answers": [
      { "questionId": "q1-uuid", "selectedOptionId": "opt-2-uuid" },
      { "questionId": "q2-uuid", "textAnswer": "industrial revolution" }
    ]
  }
  ```

---

### 4.7. Phân Hệ Luyện Viết AI IELTS Writing Studio (AI Writing)

#### 4.7.1. `POST /api/writing/prompts`
- **Phân quyền**: `ADMIN`.
- **Request Body (`CreateWritingPromptDto`)**:
  ```json
  {
    "title": "IELTS Writing Task 2: Remote Work vs Office Work",
    "taskType": "TASK_2",
    "topic": "Some people believe that working remotely from home is better for both employees and companies. To what extent do you agree or disagree?",
    "targetWords": 250,
    "timeLimitMinutes": 40,
    "sampleEssay": "In contemporary society, telecommuting has become increasingly prevalent..."
  }
  ```

#### 4.7.2. `POST /api/writing/submissions` (Học viên nộp bài & Kích hoạt AI)
- **Phân quyền**: `STUDENT`.
- **Request Body (`SubmitWritingDto`)**:
  ```json
  {
    "promptId": "prompt-uuid-here",
    "content": "It is often argued that remote working provides extensive advantages for both staff and enterprises. In my perspective, while this paradigm promotes greater flexibility, traditional office interaction remains crucial...",
    "timeSpentSeconds": 2100
  }
  ```
- **Xử lý Backend**:
  1. Đếm số từ thực tế (`wordCount`).
  2. Kích hoạt AI Engine phân tích 4 tiêu chí Cambridge:
     - `taskAchievementScore` (0.0 - 9.0)
     - `coherenceCohesionScore` (0.0 - 9.0)
     - `lexicalResourceScore` (0.0 - 9.0)
     - `grammarScore` (0.0 - 9.0)
     - `overallBand` (Làm tròn chuẩn IELTS: 0.25 -> 0.5, 0.75 -> 1.0)
  3. AI đề xuất gợi ý sửa lỗi ngữ pháp, nâng cấp từ vựng C1/C2 và sinh bài viết mẫu Band 8.5+.
  4. Trạng thái bài nộp chuyển thành: `PENDING_REVIEW` (Chờ Admin/Teacher phê duyệt trước khi công bố điểm chính thức).

#### 4.7.3. `POST /api/writing/admin/submissions/:id/approve`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Giáo viên xem kết quả AI, có thể điều chỉnh điểm (Override Band) và ghi nhận xét cá nhân hóa trước khi chuyển trạng thái bài viết sang `APPROVED`.
- **Request Body (`ApproveWritingDto`)**:
  ```json
  {
    "adminOverrideBand": 7.5,
    "adminFeedback": "Lập luận mạch lạc, tuy nhiên cần kiểm soát tốt thì quá khứ hoàn thành ở đoạn thân bài 1."
  }
  ```

---

### 4.8. Phân Hệ Luyện Nói IELTS Speaking Studio (Speaking Assessment)

#### 4.8.1. `POST /api/speaking/prompts`
- **Phân quyền**: `ADMIN`.
- **Request Body (`CreateSpeakingPromptDto`)**:
  ```json
  {
    "title": "IELTS Speaking Part 2: Describe a Memorable Journey",
    "part": "PART_2",
    "topic": "Describe a memorable journey you made by public transport. You should say: where you went, what happened, and explain why it was memorable.",
    "preparationSeconds": 60,
    "speakingSeconds": 120,
    "sampleAudioUrl": "https://res.cloudinary.com/.../sample_part2.mp3"
  }
  ```

#### 4.8.2. `POST /api/speaking/submissions`
- **Phân quyền**: `STUDENT`.
- **Request Body (`SubmitSpeakingDto`)**:
  ```json
  {
    "promptId": "prompt-uuid-here",
    "audioUrl": "https://res.cloudinary.com/.../student_recording.mp3",
    "durationSeconds": 118
  }
  ```

#### 4.8.3. `POST /api/speaking/admin/submissions/:id/grade`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Giáo viên thẩm định thủ công 100% bản ghi âm qua Audio Player chuyên dụng (+/- 5 giây, tua tốc độ 0.75x - 2.0x), chấm điểm 4 tiêu chí và để lại nhận xét ghim theo mốc giây (**Timestamp Feedback**).
- **Request Body (`GradeSpeakingDto`)**:
  ```json
  {
    "fluencyScore": 7.0,
    "lexicalScore": 7.5,
    "grammarScore": 6.5,
    "pronunciationScore": 7.0,
    "bandScore": 7.0,
    "feedback": "Phát âm tự nhiên, ngữ điệu cuốn hút, chú ý các âm cuối đuôi /s/ và /ed/.",
    "timestampFeedback": [
      { "timestamp": "00:18", "note": "Cụm collocation tự nhiên: 'picturesque landscape'" },
      { "timestamp": "00:54", "note": "Lỗi ngữ pháp: 'I was went' -> sửa thành 'I went'" }
    ]
  }
  ```

---

### 4.9. Phân Hệ Lớp Học Trực Tuyến LiveKit WebRTC & Bảng Trắng

#### 4.9.1. `POST /api/livekit/rooms`
- **Phân quyền**: `ADMIN`.
- **Request Body**:
  ```json
  {
    "name": "ielts-masterclass-live-01",
    "courseId": "optional-course-uuid",
    "scheduledStartTime": "2026-11-10T19:30:00.000Z",
    "scheduledEndTime": "2026-11-10T21:00:00.000Z"
  }
  ```

#### 4.9.2. `POST /api/livekit/token`
- **Phân quyền**: `STUDENT`, `ADMIN` (`JwtAuthGuard`).
- **Mô tả**: Tạo LiveKit Access Token phân quyền WebRTC SFU:
  - `ADMIN`: Quyền Host (publish audio/video, mute người khác, ghi hình, đóng phòng).
  - `STUDENT`: Quyền tham gia (chỉ bật mic/cam khi được cấp phép, giới hạn tối đa 7-8 học viên/lớp).
- **Request Body**: `{"roomName": "ielts-masterclass-live-01"}`.

#### 4.9.3. `POST /api/livekit/mute-participant` & `POST /api/livekit/end-room`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Quản trị viên tắt track mic/cam của học viên khi bị ồn hoặc kết thúc lớp học cho tất cả mọi người.

#### 4.9.4. `POST /api/livekit/webhook`
- **Phân quyền**: Public (Xác thực chữ ký qua header `Authorization` của LiveKit SFU).
- **Mô tả**: Tiếp nhận các sự kiện: `room_started`, `room_finished`, `participant_joined`, `participant_left` để tự động tính thời gian học và ghi nhận chuyên cần.

#### 4.9.5. Interactive Whiteboard REST Endpoints
- `GET /api/livekit/rooms/:roomName/whiteboard`: Lấy toàn bộ nét vẽ hiện tại của bảng trắng.
- `POST /api/livekit/rooms/:roomName/whiteboard/stroke`: Lưu nét vẽ mới vào bảng trắng.
- `POST /api/livekit/rooms/:roomName/whiteboard/clear`: Xóa bảng trắng.
- `POST /api/livekit/rooms/:roomName/whiteboard/permission`: Admin bật/tắt quyền vẽ bảng trắng cho học viên (`{"allowStudentDrawing": true}`).

---

### 4.10. Phân Hệ Kiểm Soát Chuyên Cần Tự Động (Automated Attendance)

#### 4.10.1. `GET /api/attendance/classroom/:classroomId`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Xem danh sách điểm danh chi tiết của lớp học: Thời gian vào, thời gian ra, tổng số phút tham gia (`durationMinutes`) và trạng thái chuyên cần:
  - `PRESENT`: Tham gia &ge; 80% thời lượng buổi học.
  - `LATE`: Tham gia từ 50% đến dưới 80% thời lượng.
  - `ABSENT`: Tham gia dưới 50% thời lượng hoặc không có mặt.

#### 4.10.2. `PUT /api/attendance/:id/override`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Cho phép giáo viên điều chỉnh thủ công trạng thái điểm danh (kèm lý do/ghi chú có phép).
- **Request Body (`OverrideAttendanceDto`)**:
  ```json
  {
    "status": "PRESENT",
    "note": "Học viên gặp sự cố mất điện 15 phút đầu, đã nộp đơn xin phép hợp lệ."
  }
  ```

#### 4.10.3. `GET /api/attendance/classroom/:classroomId/export`
- **Phân quyền**: `ADMIN`.
- **Mô tả**: Xuất báo cáo điểm danh toàn lớp ra file Excel định dạng `.xlsx` tải xuống trực tiếp.

---

### 4.11. Phân Hệ Nhắn Tin Thời Gian Thực (Chat & Messaging)

#### 4.11.1. `GET /api/chat/conversations`
- **Mô tả**: Lấy danh sách hội thoại hỗ trợ giữa Học viên và Giáo viên (Teacher Dong), kèm tin nhắn cuối và số lượng tin nhắn chưa đọc (`unreadCount`).

#### 4.11.2. `GET /api/chat/conversations/:id/messages`
- **Query Params**: `take` (số lượng tin, mặc định 50), `skip` (bỏ qua).
- **Mô tả**: Lấy lịch sử hội thoại hiển thị trên khung chat.

#### 4.11.3. `POST /api/chat/conversations/:id/messages`
- **Mô tả**: Gửi tin nhắn văn bản qua HTTP fallback (khi đường truyền Socket bị gián đoạn).
- **Request Body (`SendMessageDto`)**: `{"content": "Thưa thầy, em muốn hỏi về bài tập Writing Task 2..."}`.

#### 4.11.4. `PUT /api/chat/conversations/:id/read`
- **Mô tả**: Đánh dấu toàn bộ tin nhắn trong hội thoại là đã đọc.

---

### 4.12. Phân Hệ Bảng Điều Khiển & Phân Tích (Dashboard & Analytics)

#### 4.12.1. `GET /api/dashboard/student`
- **Phân quyền**: `STUDENT`.
- **Response Data**:
  - Khóa học đang học dở và % tiến độ.
  - Lịch học trực tuyến LiveKit sắp tới.
  - Kết quả điểm trung bình 4 kỹ năng.
  - Số bài Writing / Speaking đang chờ giáo viên chấm.

#### 4.12.2. `GET /api/dashboard/admin`
- **Phân quyền**: `ADMIN`.
- **Response Data**:
  - Tổng số học viên hoạt động.
  - Hàng đợi bài viết Writing và bản ghi Speaking cần chấm gấp (Action Items).
  - Tỷ lệ chuyên cần của các lớp học gần nhất.
  - Các chỉ số truy cập và hoạt động hệ thống.

---

### 4.13. Phân Hệ Tin Tức & Bài Viết Chia Sẻ (Blogs & Content)

#### 4.13.1. `POST /api/blogs`
- **Phân quyền**: `ADMIN`.
- **Content-Type**: `multipart/form-data` hoặc `application/json`.
- **Request Body (`CreateBlogDto`)**:
  - `title`: Tiêu đề bài viết.
  - `content`: Nội dung chi tiết (Markdown/HTML).
  - `category`: Chuyên mục (IELTS, Business, Sư phạm...).
  - `tags`: Từ khóa (phân cách dấu phẩy).
  - `coverImage`: File ảnh tải lên (hoặc chuỗi URL).
  - `video`: File video tải lên (hoặc chuỗi URL).

#### 4.13.2. `GET /api/blogs` & `GET /api/blogs/:slugOrId`
- **Mô tả**: Xem danh sách bài viết (hỗ trợ tìm kiếm, lọc chuyên mục) và xem chi tiết bài viết (tự động tăng `viewCount` mỗi lượt đọc).

---

### 4.14. Phân Hệ Quản Trị Tải Lên Đa Phương Tiện (Cloudinary Media)

#### 4.14.1. `POST /api/media/upload/image`
- **Content-Type**: `multipart/form-data`.
- **Body**: `file` (Binary Image).
- **Query Params**: `folder` (Mặc định `teacher_dong_academy/images`).
- **Response**: Trả về `url`, `secure_url`, `public_id`, `width`, `height`, `format`.

#### 4.14.2. `POST /api/media/upload/video`
- **Content-Type**: `multipart/form-data`.
- **Body**: `file` (Binary Video MP4/WebM).
- **Query Params**: `folder` (Mặc định `teacher_dong_academy/videos`).

#### 4.14.3. `DELETE /api/media/:publicId`
- **Mô tả**: Xóa tài nguyên ảnh hoặc video khỏi Cloudinary CDN để giải phóng dung lượng.

---

## 5. ĐẶC TẢ WEBSOCKET GATEWAYS (REALTIME EVENTS)

Hệ thống triển khai 2 WebSocket Gateway chuyên biệt sử dụng Socket.IO trên cùng port máy chủ backend:

### 5.1. LiveKit Whiteboard Gateway (`/whiteboard`)
- **Namespace**: `/whiteboard`
- **CORS**: Hỗ trợ credentials và allowed origins từ Next.js.
- **Client Emit Events**:
  - `joinWhiteboard`: `{ "roomName": "ielts-room-01" }`
    - Response: Trả về trạng thái `joined` kèm toàn bộ nét vẽ hiện tại (`snapshot`).
  - `leaveWhiteboard`: `{ "roomName": "ielts-room-01" }`
  - `drawStroke`:
    ```json
    {
      "roomName": "ielts-room-01",
      "stroke": {
        "points": [{ "x": 120, "y": 85 }, { "x": 125, "y": 90 }],
        "color": "#38bdf8",
        "brushSize": 3,
        "tool": "pen"
      },
      "user": { "id": "user-uuid", "fullName": "Nguyen Van A", "role": "STUDENT" }
    }
    ```
  - `clearWhiteboard`: `{ "roomName": "ielts-room-01", "user": { ... } }`
- **Server Broadcast Events**:
  - `strokeAdded`: Gửi nét vẽ mới đến tất cả người tham gia khác trong phòng.
  - `whiteboardCleared`: Thông báo bảng trắng đã được làm sạch.
  - `permissionChanged`: Báo cho học viên biết quyền vẽ bảng đã được bật hoặc tắt.

### 5.2. Realtime Chat Gateway (`/chat`)
- **Namespace**: `/chat`
- **Client Emit Events**:
  - `joinUser`: `{ "userId": "user-uuid" }` -> Đăng ký nhận thông báo tin nhắn mới toàn cục.
  - `joinConversation`: `{ "conversationId": "conv-uuid" }` -> Tham gia phòng chat cụ thể.
  - `leaveConversation`: `{ "conversationId": "conv-uuid" }`
  - `typing`: `{ "conversationId": "conv-uuid", "userId": "...", "fullName": "...", "isTyping": true }`
  - `sendMessage`:
    ```json
    {
      "conversationId": "conv-uuid",
      "senderId": "user-uuid",
      "role": "STUDENT",
      "content": "Thưa thầy cho em hỏi bài tập Speaking..."
    }
    ```
- **Server Broadcast Events**:
  - `newMessage`: Phát nội dung tin nhắn mới tới người tham gia trong hội thoại.
  - `unreadUpdate`: Gửi tín hiệu cập nhật badge số tin nhắn chưa đọc tới người nhận.
  - `userTyping`: Phát hiệu ứng "đang gõ..." tới đối phương.

---

## 6. DANH MỤC MÃ TRẠNG THÁI HTTP & MÃ LỖI HỆ THỐNG

| HTTP Status | Error Code | Tình Huống Phát Sinh & Ý Nghĩa Nghiệp Vụ |
|:---|:---|:---|
| **200 OK** | - | Yêu cầu xử lý thành công. |
| **201 Created** | - | Khởi tạo tài nguyên mới thành công (Đăng ký, Tạo đề, Ghi bài nộp). |
| **400 Bad Request** | `VALIDATION_FAILED` | Dữ liệu đầu vào không hợp lệ theo DTO Decorators (`class-validator`). |
| **401 Unauthorized** | `UNAUTHORIZED` | Thiếu hoặc JWT Token không hợp lệ / đã hết hạn. |
| **401 Unauthorized** | `SINGLE_SESSION_VIOLATION` | Học viên đã đăng nhập trên một thiết bị/trình duyệt khác. |
| **403 Forbidden** | `FORBIDDEN_RESOURCE` | Người dùng không đủ quyền truy cập (ví dụ: Học viên gọi API của Admin). |
| **404 Not Found** | `NOT_FOUND` | Không tìm thấy tài nguyên (Khóa học, Bài học, Đề thi, Bản ghi). |
| **409 Conflict** | `EMAIL_ALREADY_EXISTS` | Email đăng ký đã tồn tại trong cơ sở dữ liệu. |
| **409 Conflict** | `ALREADY_ENROLLED` | Học viên đã ghi danh vào khóa học này trước đó. |
| **422 Unprocessable**| `FILE_TOO_LARGE` | Dung lượng file upload vượt quá giới hạn cho phép. |
| **500 Internal Error**| `INTERNAL_SERVER_ERROR` | Lỗi ngoại lệ máy chủ chưa được kiểm soát. |
