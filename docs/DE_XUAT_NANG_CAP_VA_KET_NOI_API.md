# BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS, TỔNG HỢP KẾT NỐI API & KẾ HOẠCH TRIỂN KHAI THEO NGÀY
**Dự án**: Teacher Dong Academy (LMS & WebRTC In-house EdTech Platform)  
**Tài liệu tham chiếu**: `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md`, `docs/SRS.md`, `docs/mock_test.html`, `docs/API_DOCUMENTATION.md`  
**Ngày cập nhật**: 13/11/2026  
**Trạng thái kiểm thử**: 
- Phía Server NestJS: **130/130 Test cases E2E PASS (100%)**
- Phía Client Next.js: **17/17 Test cases E2E PASS (100%)**  
- Biên dịch Production: **30/30 Routes Next.js build PASS (100%)**

---

## MỤC LỤC
1. [BẢNG TỔNG HỢP TIẾN ĐỘ THỰC TẾ: ĐÃ LÀM VÀ CHƯA LÀM](#1-bảng-tổng-hợp-tiến-độ-thực-tế-đã-làm-và-chưa-làm)
   - 1.1. Danh mục các hạng mục ĐÃ HOÀN THÀNH 100% (Từ ngày 11/11 đến 13/11/2026)
   - 1.2. Danh mục các hạng mục CHƯA LÀM / CẦN LÀM TIẾP so với tài liệu đặc tả SRS & Mockup
2. [BẢNG MA TRẬN KẾT NỐI API GIỮA BACKEND & FRONTEND](#2-bảng-ma-trận-kết-nối-api-giữa-backend--frontend)
   - 2.1. Các API và phân hệ đã kết nối hoàn chỉnh (BE ↔ FE)
   - 2.2. Các API Backend đã có sẵn nhưng Frontend chưa dựng màn hình tương tác
   - 2.3. Các API nâng cao còn thiếu cần bổ sung tiếp theo
3. [BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS & ĐỀ XUẤT NÂNG CẤP TRẢI NGHIỆM CHI TIẾT](#3-báo-cáo-đối-chiếu-hệ-thống-với-srs--đề-xuất-nâng-cấp-trải-nghiệm-chi-tiết)
   - 3.1. Phân hệ Luyện Viết AI IELTS Writing Studio (Đã làm & Còn thiếu)
   - 3.2. Phân hệ Luyện Nói IELTS Speaking Studio (Đã làm & Còn thiếu)
   - 3.3. Kho Học Liệu Số & Bảo Mật Chống Quay Chụp (Đã làm & Còn thiếu)
   - 3.4. LMS Course Engine & Quản Lý Cây Giáo Trình (Đã làm & Còn thiếu)
   - 3.5. Hệ Thống Thi Trắc Nghiệm Quiz Engine & Xử Lý Reading Split-View (Đã làm & Còn thiếu)
   - 3.6. Điểm Danh Tự Động & Báo Cáo Chuyên Cần (Đã làm & Còn thiếu)
   - 3.7. Kênh Nhắn Tin Hỗ Trực Tuyến Thời Gian Thực (Đã làm & Còn thiếu)
   - 3.8. Quản Lý Tài Khoản, Học Viên & Phiên Đơn Concurrent Session (Đã làm & Còn thiếu)
4. [KẾ HOẠCH TRIỂN KHAI VÀ THỰC THI PHÂN CHIA THEO NGÀY CỤ THỂ (TIMELINE & DAILY ROADMAP)](#4-kế-hoạch-triển-khai-và-thực-thi-phân-chia-theo-ngày-cụ-thể-timeline--daily-roadmap)
   - 4.1. Nhật ký tiến độ các ngày đã hoàn thành (11/11 - 13/11/2026)
   - 4.2. Kế hoạch triển khai chi tiết từng ngày tiếp theo (14/11 - 18/11/2026)

---

# 1. BẢNG TỔNG HỢP TIẾN ĐỘ THỰC TẾ: ĐÃ LÀM VÀ CHƯA LÀM

Hệ thống mã nguồn hiện tại được đối chiếu trực tiếp giữa **Tài liệu đặc tả (SRS)**, **Mã nguồn Backend NestJS (`server/src/`)** và **Mã nguồn Frontend Next.js (`client/src/`)**:

### 1.1. Danh mục các hạng mục ĐÃ HOÀN THÀNH 100% (Từ ngày 11/11 đến 13/11/2026)

| STT | Phân hệ / Tính năng | Mô tả chi tiết kỹ thuật | Ngày hoàn thành | Trạng thái |
|:---:|:---|:---|:---:|:---:|
| **1** | **Xác thực & Quản lý phiên** | Đăng ký, đăng nhập email/pass, Single Concurrent Session, HttpOnly Cookie JWT, thu hồi phiên từ xa qua Drawer. | 11/11/2026 |  ĐÃ XONG |
| **2** | **Đổi mật khẩu tài khoản** | Kết nối `POST /api/auth/change-password` ở cả `student/account` và `admin/account`, kiểm tra mật khẩu cũ, loading spinner chống spam. | 12/11/2026 |  ĐÃ XONG |
| **3** | **Quản lý học viên & Reset Pass** | Kết nối `GET /api/users?role=STUDENT`, khóa/mở khóa tài khoản `PATCH /api/users/:id/status`, nút 1-click Reset mật khẩu mặc định `DongAcademy@2026`. | 12/11/2026 |  ĐÃ XONG |
| **4** | **Admin tạo học viên thủ công** | Bổ sung `POST /api/users` ở Backend; nối modal `#addUserModal` trên `admin/users` gửi trực tiếp dữ liệu học viên mới lưu MySQL. | 12/11/2026 |  ĐÃ XONG |
| **5** | **Cây giáo trình khóa học động** | Nối `GET /api/courses/:slugOrId` nạp cấu trúc Module $\rightarrow$ Lesson, đồng bộ tiến độ học, cờ hoàn thành và cơ chế khóa bài học tuần tự. | 12/11/2026 |  ĐÃ XONG |
| **6** | **Ngân hàng đề thi Quiz** | Nối `quizzesService.getSkillsTests()` nạp danh sách câu hỏi; modal soạn câu hỏi gửi trực tiếp lên `POST /api/quizzes/:id/questions`. | 12/11/2026 |  ĐÃ XONG |
| **7** | **Thêm câu hỏi Quiz hàng loạt & Sửa Quiz** | Bổ sung `POST /api/quizzes/:id/questions/bulk` và `PUT /api/quizzes/:id` phía Backend; tạo hàm `addBulkQuestions`, `updateQuiz` ở Frontend service. | 12/11/2026 |  ĐÃ XONG |
| **8** | **Kho học liệu số toàn hệ thống** | Bổ sung `GET /api/materials` có lọc theo `fileType` (PDF/Audio) và tìm kiếm; nối vào cả `student/library` và `admin/library`. | 12/11/2026 |  ĐÃ XONG |
| **9** | **Bảo vệ học liệu & Print Shield** | Dynamic Watermark canvas (Họ tên + SĐT + Mã học viên) chuyển động mờ liên tục; chặn in ấn (`@media print`), chặn tải trực tiếp. | 12/11/2026 |  ĐÃ XONG |
| **10** | **Phân hệ Thông báo thời gian thực** | Tạo mới bảng `notifications` trong Prisma; module `server/src/modules/notifications/` (5 APIs); icon chuông Topbar hiển thị badge số lượng chưa đọc và popover thao tác. | 12/11/2026 |  ĐÃ XONG |
| **11** | **Tự động lưu bản nháp bài viết Writing** | Tạo bảng `writing_drafts`; 3 API (`POST /drafts`, `GET /drafts/:promptId`, `DELETE /drafts/:promptId`); giao diện `student/writing` tự động lưu nháp mỗi 30s. | 12/11/2026 |  ĐÃ XONG |
| **12** | **Thanh đo số từ 3 phân đoạn màu Writing** | Thanh đo trực quan: Đỏ (thiếu từ) $\rightarrow$ Vàng (sắp đạt) $\rightarrow$ Xanh lá (đạt chuẩn: 150 từ cho Task 1 / 250 từ cho Task 2). | 12/11/2026 |  ĐÃ XONG |
| **13** | **Xuất báo cáo điểm danh theo khoảng ngày** | Bổ sung `GET /api/attendance/export?startDate=&endDate=`; trang `admin/attendance` đã có Date Range Picker và nút xuất file Excel `.xlsx`. | 12/11/2026 |  ĐÃ XONG |
| **14** | **Phòng học WebRTC LiveKit & Bảng trắng** | Cấp token Host/Student, kết nối SFU LiveKit, bật/tắt mic/cam, giơ tay, bảng trắng Whiteboard Canvas đồng bộ nét vẽ DataChannel & REST. | 11/11/2026 |  ĐÃ XONG |
| **15** | **AI IELTS Writing Studio & Chấm điểm** | Gemini AI phân tích 4 tiêu chí (TR, CC, LR, GRA), gợi ý từ vựng C1/C2; Admin xem và duyệt kết quả bài nộp. | 11/11/2026 |  ĐÃ XONG |
| **16** | **IELTS Speaking Studio & Web Audio Wave** | Thu âm giọng nói với sóng âm thời gian thực Web Audio API; Admin nghe lại và chấm 4 tiêu chí (FC, LR, GRA, PR) kèm bình luận. | 11/11/2026 |  ĐÃ XONG |
| **17** | **Kênh Chat REST API & Tin nhắn DB** | Tạo mới `chat.service.ts`; nối `GET /chat/conversations`, `GET /messages`, `POST /messages`, `PUT /read` lưu trữ DB vĩnh viễn. | 12/11/2026 |  ĐÃ XONG |
| **18** | **Bộ kiểm thử tự động hóa 100% PASS** | • 130 tests E2E Server NestJS (`test/app.e2e-spec.ts`) PASS 100%.<br>• 17 tests E2E Client Next.js (`test/e2e-fe.test.mjs`) PASS 100%. | 13/11/2026 |  ĐÃ XONG |

---

### 1.2. Danh mục các hạng mục CHƯA LÀM / CẦN LÀM TIẾP so với tài liệu đặc tả SRS & Mockup

| STT | Phân hệ / Tính năng | Mô tả chức năng còn thiếu | Mức độ ưu tiên | Kế hoạch ngày triển khai |
|:---:|:---|:---|:---:|:---:|
| **1** | **Quản trị Ngân hàng đề thi Writing & Speaking (Admin UI)** | Backend đã có đầy đủ API CRUD (`/writing/prompts`, `/speaking/prompts`), nhưng **Frontend Admin chưa có màn hình** để Admin tạo/sửa/xóa đề bài Task 1, Task 2 và Speaking Part 1, 2, 3. | **CAO** | **Ngày 14/11/2026** |
| **2** | **Upload file âm thanh Speaking thật lên Cloudinary** | Học viên thu âm tạo blob URL cục bộ. Cần thêm API `POST /api/speaking/submissions/with-audio` nhận multipart file và upload trực tiếp lên Cloudinary CDN để Admin nghe được ở mọi nơi. | **CAO** | **Ngày 14/11/2026** |
| **3** | **Trình thi IELTS Reading chia đôi màn hình (Split-View)** | Đối với các bài đọc dài `passage`, giao diện học viên cần chia 2 cột độc lập (Cột trái: Đọc bài + Highlight từ khóa; Cột phải: Chọn đáp án A, B, C, D) có thanh cuộn riêng. | **CAO** | **Ngày 15/11/2026** |
| **4** | **Các dạng câu hỏi Quiz nâng cao** | Mở rộng UI hỗ trợ dạng câu hỏi `FILL_BLANK` (nhập chữ vào ô khuyết) và `TRUE_FALSE_NOT_GIVEN` ngoài dạng Single Choice 4 đáp án hiện tại. | **TRUNG BÌNH** | **Ngày 15/11/2026** |
| **5** | **Giao diện quản lý giáo trình kéo - thả (Curriculum Drag & Drop)** | Backend đã có API `@Post('/lessons/modules/reorder')`, nhưng UI trên `admin/courses` vẫn là bảng tĩnh; cần tích hợp thư viện kéo-thả để Admin sắp xếp vị trí bài học. | **TRUNG BÌNH** | **Ngày 16/11/2026** |
| **6** | **Gạch chân lỗi sai trực tiếp trong bài viết (Inline Error Highlighter)** | Bôi màu gạch chân đỏ (ngữ pháp), gạch chân vàng (từ vựng lặp) trực tiếp trên từng câu trong bài viết của học viên, click vào hiện tooltip gợi ý từ C1/C2. | **TRUNG BÌNH** | **Ngày 16/11/2026** |
| **7** | **Socket.IO Client thời gian thực 2 chiều cho Chat** | Nhúng `socket.io-client` vào giao diện chat để khi một bên gửi tin nhắn, bên kia nhận được ngay tức thì (push event `newMessage`) mà không cần tải lại trang; hiển thị trạng thái đang soạn tin (*typing indicator*). | **CAO** | **Ngày 17/11/2026** |
| **8** | **Sóng âm tương tác WaveSurfer cho Speaking** | Thay thế thẻ audio mặc định của trình duyệt bằng sóng âm động WaveSurfer, có ghim (marker pin) theo từng giây bình luận của Admin, click vào nhận xét tự động tua đến đúng giây phát âm sai. | **TRUNG BÌNH** | **Ngày 17/11/2026** |
| **9** | **Chế độ đọc sách toàn màn hình (Focus Book Reader)** | Thêm nút mở tài liệu PDF toàn màn hình, ẩn sidebar để học viên tập trung đọc sách, hỗ trợ lật trang mượt mà và lưu lại số trang đang đọc dở. | **THẤP** | **Ngày 18/11/2026** |
| **10** | **Tích hợp dịch vụ gửi Email thông báo thật** | Tích hợp SendGrid / Nodemailer SMTP gửi email kích hoạt tài khoản, thông báo khi Thầy giáo đã duyệt bài viết hoặc bài nói về hòm thư người dùng. | **THẤP** | **Ngày 18/11/2026** |
| **11** | **Cổng thanh toán học phí trực tuyến (VNPay / MoMo)** | Tích hợp cổng thanh toán trực tuyến để học viên nộp học phí tự động kích hoạt khóa học (hiện tại Admin đang kích hoạt thủ công). | **TƯƠNG LAI** | **Giai đoạn 2** |

---

# 2. BẢNG MA TRẬN KẾT NỐI API GIỮA BACKEND & FRONTEND

### 2.1. Các API và phân hệ đã kết nối hoàn chỉnh (BE ↔ FE)

| Phân hệ | API Backend Controller | Service Frontend | Màn hình tương tác | Tình trạng |
|:---|:---|:---|:---|:---:|
| **Xác thực & Phiên** | `auth.controller.ts`<br>`POST /api/auth/login`<br>`POST /api/auth/register`<br>`GET /api/auth/me`<br>`GET /api/auth/sessions`<br>`DELETE /api/auth/sessions/:id`<br>`POST /api/auth/change-password` | `auth.service.ts` | `/login`, `/register`<br>`/student/account`<br>`/admin/account` |  **Hoàn thành 100%** |
| **Quản lý học viên** | `users.controller.ts`<br>`GET /api/users`<br>`POST /api/users`<br>`PATCH /api/users/:id/status`<br>`POST /api/users/:id/reset-password` | `users.service.ts` | `/admin/users` |  **Hoàn thành 100%** |
| **Khóa học & Cây bài học** | `courses.controller.ts`<br>`GET /api/courses`<br>`GET /api/courses/:slugOrId`<br>`lessons.controller.ts`<br>`POST /api/lessons/:id/complete` | `courses.service.ts`<br>`lessons.service.ts` | `/student/courses`<br>`/admin/courses` |  **Hoàn thành 100%** |
| **Học liệu số & Thư viện** | `materials.controller.ts`<br>`GET /api/materials`<br>`GET /api/materials/:id/view-token`<br>`POST /api/materials` | `materials.service.ts` | `/student/library`<br>`/admin/library` |  **Hoàn thành 100%** |
| **Lớp học WebRTC LiveKit** | `livekit.controller.ts`<br>`GET /api/livekit/rooms`<br>`POST /api/livekit/rooms`<br>`POST /api/livekit/token`<br>`POST /api/livekit/end-room`<br>`POST /api/livekit/mute-participant` | `livekit.service.ts` | `/student/classroom`<br>`/admin/classroom` |  **Hoàn thành 100%** |
| **Luyện viết AI & Bản nháp** | `writing.controller.ts`<br>`GET /api/writing/prompts`<br>`POST /api/writing/submissions`<br>`POST /api/writing/drafts`<br>`GET /api/writing/drafts/:promptId`<br>`POST /api/writing/admin/submissions/:id/approve` | `writing.service.ts` | `/student/writing`<br>`/admin/writing-review` |  **Hoàn thành 100%** |
| **Luyện nói & Chấm điểm** | `speaking.controller.ts`<br>`GET /api/speaking/prompts`<br>`POST /api/speaking/submissions`<br>`POST /api/speaking/admin/submissions/:id/grade` | `speaking.service.ts` | `/student/speaking`<br>`/admin/speaking-grading` |  **Hoàn thành 100%** |
| **Ngân hàng đề thi Quiz** | `quizzes.controller.ts`<br>`GET /api/quizzes/skills/tests`<br>`POST /api/quizzes`<br>`PUT /api/quizzes/:id`<br>`POST /api/quizzes/:id/questions`<br>`POST /api/quizzes/:id/questions/bulk`<br>`POST /api/quizzes/:id/submit` | `quizzes.service.ts` | `/student/quizzes`<br>`/admin/quizzes` |  **Hoàn thành 100%** |
| **Điểm danh & Xuất Excel** | `attendance.controller.ts`<br>`GET /api/attendance/classrooms`<br>`PUT /api/attendance/:id/override`<br>`GET /api/attendance/export?startDate=&endDate=` | `attendance.service.ts` | `/student/attendance`<br>`/admin/attendance` |  **Hoàn thành 100%** |
| **Thông báo thời gian thực** | `notifications.controller.ts`<br>`GET /api/notifications`<br>`GET /api/notifications/unread-count`<br>`PUT /api/notifications/:id/read`<br>`PUT /api/notifications/read-all`<br>`DELETE /api/notifications/:id` | `notifications.service.ts` | `components/shared/app-topbar.tsx` |  **Hoàn thành 100%** |
| **Tin nhắn & Hội thoại** | `chat.controller.ts`<br>`GET /api/chat/conversations`<br>`GET /api/chat/conversations/:id/messages`<br>`POST /api/chat/conversations/:id/messages`<br>`PUT /api/chat/conversations/:id/read` | `chat.service.ts` | `/student/messages`<br>`/admin/messages` |  **Hoàn thành 100% (REST API)** |

---

### 2.2. Các API Backend đã có sẵn nhưng Frontend chưa dựng màn hình tương tác

1. **Quản lý Đề thi Writing & Speaking của Admin**:
   - Backend: `POST /api/writing/prompts`, `PUT /api/writing/prompts/:id`, `DELETE /api/writing/prompts/:id` và tương tự cho `/api/speaking/prompts`.
   - Frontend: Mới có màn hình chấm bài (`/admin/writing-review`, `/admin/speaking-grading`), chưa có trang quản lý ngân hàng đề bài.
2. **Kéo - thả sắp xếp thứ tự Module & Bài học**:
   - Backend: `POST /api/lessons/modules/reorder`, `POST /api/lessons/reorder`.
   - Frontend: Màn hình `/admin/courses` hiện tại hiển thị dạng danh sách tĩnh, chưa có thư viện kéo-thả.

---

### 2.3. Các API nâng cao còn thiếu cần bổ sung tiếp theo

1. `POST /api/speaking/submissions/with-audio`:
   - Endpoint nhận `multipart/form-data` chứa file âm thanh thực (`audioFile: Express.Multer.File`), tự động tải lên thư mục `teacher_dong_academy/speaking_audios/` trên Cloudinary CDN và lưu URL vĩnh viễn vào database.
2. `POST /api/auth/send-verification-email` / `POST /api/notifications/send-email`:
   - Tích hợp Nodemailer/SendGrid bắn email tự động khi có sự kiện quan trọng.

---

# 3. BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS & ĐỀ XUẤT NÂNG CẤP TRẢI NGHIỆM CHI TIẾT

---

### 3.1. Phân hệ Luyện Viết AI IELTS Writing Studio (`WR-SCR-001` $\rightarrow$ `005`)

####  Những gì ĐÃ LÀM XONG:
- Bộ đếm từ thời gian thực với **Thanh đo 3 phân đoạn màu** (Đỏ: `< 150/250 từ` $\rightarrow$ Vàng: `150-179/250-279 từ` $\rightarrow$ Xanh lá: `≥ 180/280 từ` đạt chuẩn Cambridge).
- **Auto-save Draft**: Tự động lưu bản nháp vào MySQL qua bảng `writing_drafts` mỗi 30 giây, tự động tải lại nháp khi vào lại trang.
- Tích hợp Gemini AI chấm chuẩn 4 tiêu chí: **Task Response (TR)**, **Coherence & Cohesion (CC)**, **Lexical Resource (LR)**, **Grammatical Range & Accuracy (GRA)**.
- Giao diện Admin duyệt kết quả, cho phép chỉnh sửa điểm số từng tiêu chí trước khi công bố.
- **Print Shield**: Chặn phím tắt `Ctrl + P` và bảo vệ bản quyền đề bài.

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. **Giao diện Quản trị Ngân hàng Đề thi Writing**: Màn hình dành cho Admin tạo đề mới (Task 1: biểu đồ Line/Bar/Pie/Map; Task 2: Opinion/Discussion/Problem-Solution), chỉnh sửa hoặc xóa đề bài.
2. **Inline Error & Lexical Highlighter**: Gạch chân trực tiếp các lỗi ngữ pháp (màu đỏ) và từ vựng lặp (màu vàng) trên đoạn văn của bài viết, hover chuột hiện tooltip gợi ý từ C1/C2 nâng cao.

---

### 3.2. Phân hệ Luyện Nói IELTS Speaking Studio (`SP-SCR-001` $\rightarrow$ `005`)

####  Những gì ĐÃ LÀM XONG:
- Studio thu âm với hiển thị sóng âm thời gian thực qua **Web Audio API** (`AudioContext`, `AnalyserNode`).
- Đồng hồ đếm ngược thông minh (1 phút chuẩn bị Part 2 Cue Card, 2 phút ghi âm).
- Admin nghe lại bản ghi âm và chấm 4 tiêu chí: **Fluency & Coherence (FC)**, **Lexical Resource (LR)**, **Grammatical Range & Accuracy (GRA)**, **Pronunciation (PR)** kèm comment chi tiết.

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. **Giao diện Quản trị Ngân hàng Đề thi Speaking**: Màn hình cho Admin thêm câu hỏi Part 1, đề Part 2 (Cue Card + 4 gợi ý) và Part 3.
2. **Upload âm thanh thật lên Cloudinary**: Chuyển đổi blob audio thành file tải lên Cloudinary để link chạy ổn định ở mọi thiết bị.
3. **Interactive WaveSurfer Timeline**: Sóng âm tương tác có marker pin theo giây, bấm vào nhận xét tự động tua đến đúng giây phát âm bị lỗi.

---

### 3.3. Kho Học Liệu Số & Bảo Mật Chống Quay Chụp (`LIB-SCR-001` $\rightarrow$ `003`)

####  Những gì ĐÃ LÀM XONG:
- Đã kết nối `GET /api/materials` hiển thị đầy đủ tài liệu học tập từ database.
- Cấp quyền bảo mật: Học viên chỉ truy cập tài liệu thuộc khóa học đã ghi danh hoặc tài liệu miễn phí.
- **Dynamic Watermark Canvas**: Họ tên + SĐT + Mã học viên chuyển động mờ liên tục trên tài liệu chống quay chụp.
- Presigned URL thời hạn 15 phút, vô hiệu hóa nút tải trực tiếp file gốc.

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. **Focus Book Reader UI**: Chế độ đọc toàn màn hình (Focus Mode) ẩn sidebar, thanh lật trang mượt mà và ghi nhớ số trang đang đọc dở.

---

### 3.4. LMS Course Engine & Quản Lý Cây Giáo Trình (`LMS-SCR-001` $\rightarrow$ `007`)

####  Những gì ĐÃ LÀM XONG:
- Kết nối cây bài học động: Course $\rightarrow$ Module $\rightarrow$ Lesson từ cơ sở dữ liệu.
- Cơ chế **Sequential Content Unlocking**: Khóa bài học tuần tự, học viên hoàn thành bài trước mới mở bài sau.
- Tính toán % tiến độ hoàn thành khóa học và cập nhật vào bảng `Enrollment`.

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. **Quản lý giáo trình Kéo - Thả (Curriculum Drag & Drop)**: Giao diện trực quan cho Admin kéo thả đổi thứ tự các Module và Lesson.
2. **Cinema Mode Player & Ghi chú bài học**: Trình phát video bài giảng chiếm 75% màn hình kèm tính năng gõ ghi chú cá nhân có gắn timestamp phút video.

---

### 3.5. Hệ Thống Thi Trắc Nghiệm Quiz Engine & Xử Lý Reading Split-View (`QZ-SCR-001` $\rightarrow$ `005`)

####  Những gì ĐÃ LÀM XONG:
- Cơ chế chống gian lận Server-side: Tự động bóc tách và ẩn trường `isCorrect` đối với học viên.
- **Sàn điểm nghiêm ngặt $\ge 80\%$ (`BIZ-QZ-003`)**: Tự động chấm tức thì; đạt $\ge 80\%$ kích hoạt mở khóa bài học tiếp theo; dưới $80\%$ yêu cầu làm lại.
- Bảng điều hướng câu hỏi dạng bong bóng (Palette Bubbles) nhận diện câu đã làm/chưa làm/câu hiện tại.
- Đồng hồ đếm ngược tự động nộp bài khi hết giờ.
- Admin có thể tạo câu hỏi đơn lẻ hoặc nhập câu hỏi hàng loạt (`bulk questions`).

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. **Giao diện Chia đôi màn hình (Split-View)**: Cột trái đọc bài đọc `passage`, cột phải trả lời câu hỏi song song với thanh cuộn độc lập.
2. **Mở rộng dạng câu hỏi**: Bổ sung giao diện cho câu hỏi điền từ vào chỗ trống (`FILL_BLANK`) và `TRUE_FALSE_NOT_GIVEN`.

---

### 3.6. Điểm Danh Tự Động & Báo Cáo Chuyên Cần (`ATT-SCR-001` $\rightarrow$ `003`)

####  Những gì ĐÃ LÀM XONG:
- Webhook LiveKit tự động ghi nhận phút học thực tế của từng học viên.
- Phân loại chuẩn 3 trạng thái: `PRESENT` ($\ge 80\%$ thời lượng & vào 15p đầu), `LATE` (vào sau 15p), `ABSENT` ($< 30\%$).
- Admin có thể điều chỉnh trạng thái thủ công kèm lý do giải trình (Audit Note).
- **Xuất file Excel (`.xlsx`) theo khoảng ngày (Date Range Export)**: Đã tích hợp bộ chọn ngày Từ ngày - Đến ngày và tải file Excel trực tiếp từ backend.

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. **Donut Attendance Chart**: Biểu đồ tròn hiển thị tỷ lệ chuyên cần tháng và chuỗi ngày chăm chỉ (Study Streak) trên trang học viên.

---

### 3.7. Kênh Nhắn Tin Hỗ Trợ Trực Tuyến Thời Gian Thực (`CHAT-SCR-001`, `002`)

####  Những gì ĐÃ LÀM XONG:
- Đã tạo `chat.service.ts` kết nối đầy đủ các API hội thoại của Backend.
- Với Học viên: Tự động khởi tạo và kết nối hội thoại với Thầy giáo Admin.
- Với Admin: Hiển thị danh sách toàn bộ học viên, tìm kiếm theo tên/email, hiển thị số tin nhắn chưa đọc.
- Gửi nhận tin nhắn lưu trữ vĩnh viễn trong cơ sở dữ liệu (`Conversation`, `Message`), tự động đánh dấu đã đọc (`PUT /read`).

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. **Đồng bộ Socket.IO Client 2 chiều**: Nhúng `socket.io-client` để khi Admin hoặc Học viên gửi tin, màn hình người kia lập tức hiển thị tin nhắn mới mà không cần refresh trang.
2. **Đính kèm tài liệu & hình ảnh**: Nút đính kèm ảnh bài viết trong ô chat.

---

### 3.8. Quản Lý Tài Khoản, Học Viên & Phiên Đơn Concurrent Session (`AUTH-SCR-004, 005`, `ADM-SCR-002`)

####  Những gì ĐÃ LÀM XONG:
- Cơ chế **Single Concurrent Session**: Đăng nhập từ thiết bị mới tự động thu hồi refresh token của thiết bị cũ.
- Drawer quản lý danh sách phiên đăng nhập, chấm dứt phiên từ xa.
- Đổi mật khẩu kết nối API Backend, mã hóa mật khẩu bằng Bcrypt.
- Admin quản lý học viên: xem danh sách thật, tìm kiếm, khóa/mở khóa tài khoản, nút 1-click Reset mật khẩu về `DongAcademy@2026`.
- Admin tạo tài khoản học viên mới lưu trực tiếp vào cơ sở dữ liệu.

#### ⏳ Những gì CÒN THIẾU CẦN LÀM TIẾP:
1. Chi tiết thông tin thiết bị trực quan trong Drawer phiên (icon Windows Laptop, iPhone iOS, Chrome browser kèm IP).

---

# 4. KẾ HOẠCH TRIỂN KHAI VÀ THỰC THI PHÂN CHIA THEO NGÀY CỤ THỂ (TIMELINE & DAILY ROADMAP)

Để đưa toàn bộ dự án từ hiện trạng **75% hoàn thành** lên **100% nghiệm thu chuẩn mực**, lộ trình triển khai chi tiết được phân bổ theo từng ngày như sau:

---

### 4.1. Nhật ký tiến độ các ngày đã hoàn thành (11/11 - 13/11/2026)

- **Ngày 11/11/2026 (Hoàn thành nghiệm thu giai đoạn 1)**:
  - Rà soát toàn bộ tài liệu đặc tả SRS và Interactive Mockup.
  - Thiết kế kiến trúc 11 phân hệ, mô hình 2 vai trò duy nhất (`STUDENT` & `ADMIN`).
  - Triển khai Core WebRTC LiveKit, AI Writing Service và hệ thống Điểm danh Webhook.
  - Lập báo cáo đối chiếu kiến trúc và phát hiện các API còn thiếu.
- **Ngày 12/11/2026 (Hoàn thành nghiệm thu giai đoạn 2)**:
  - **Buổi sáng (Commit `caac1a1`, `b9f7f57`)**:
    - Nối API Đổi mật khẩu thực tế tại `student/account` và `admin/account`.
    - Nối API Quản lý học viên thực tế tại `admin/users` (khóa/mở khóa, reset mật khẩu).
    - Nối cây giáo trình động tại `student/courses` tải Modules & Lessons từ DB.
    - Nối API Ngân hàng câu hỏi tại `admin/quizzes`.
    - Tạo mới `chat.service.ts` và nối trang tin nhắn Học viên & Admin với Backend.
  - **Buổi chiều (Commit `1834414`)**:
    - Thêm model `Notification` và `WritingDraft` vào Prisma Schema.
    - Xây dựng module Thông báo (`server/src/modules/notifications/`) gồm 5 endpoints.
    - Nối chuông thông báo Topbar thời gian thực với unread badge.
    - Bổ sung `POST /api/users` cho phép Admin tạo học viên mới.
    - Bổ sung `GET /api/materials` cho thư viện số toàn hệ thống.
    - Triển khai Auto-save bản nháp Writing, thanh đo 3 phân đoạn màu và Print Shield.
    - Bổ sung `POST /api/quizzes/:id/questions/bulk` và `PUT /api/quizzes/:id`.
    - Mở rộng API xuất Excel điểm danh theo khoảng ngày `startDate` & `endDate`.
    - Mở rộng bộ kiểm thử Server E2E lên 130 tests và tạo mới bộ kiểm thử Client E2E 17 tests.
- **Ngày 13/11/2026 (Hoàn thành nghiệm thu giai đoạn 3)**:
  - Đồng bộ và sinh lại Prisma Client trên môi trường cục bộ (`prisma generate`).
  - Kiểm thử toàn diện: Chạy **130/130 Server E2E tests PASS (100%)**, **17/17 Client E2E tests PASS (100%)**.
  - Kiểm tra biên dịch Next.js: **30/30 Routes build PASS (100%)**.
  - Hoàn thiện tài liệu đối chiếu hệ thống và phân bổ kế hoạch triển khai theo ngày.

---

### 4.2. Kế hoạch triển khai chi tiết từng ngày tiếp theo (14/11 - 18/11/2026)

```
LỘ TRÌNH 5 NGÀY HOÀN THIỆN TOÀN DIỆN HỆ THỐNG
│
├── 📅 NGÀY 14/11/2026: Quản trị Đề thi (Writing/Speaking) & Upload Audio CDN
│   ├── Buổi sáng: Dựng màn hình Admin Quản trị Đề thi Writing & Speaking (CRUD Prompts)
│   └── Buổi chiều: Xây dựng API Upload âm thanh Speaking trực tiếp lên Cloudinary CDN
│
├── 📅 NGÀY 15/11/2026: Giao diện Reading Split-View & Các dạng câu hỏi Quiz nâng cao
│   ├── Buổi sáng: Thiết kế layout Chia đôi màn hình (Split-View) cho bài đọc IELTS Reading
│   └── Buổi chiều: Bổ sung component câu hỏi Điền từ khuyết (Fill Blank) & True/False/Not Given
│
├── 📅 NGÀY 16/11/2026: Kéo - Thả Giáo trình & Inline Error Highlighter Writing
│   ├── Buổi sáng: Tích hợp thư viện kéo-thả (@dnd-kit) sắp xếp Module & Bài học
│   └── Buổi chiều: Xây dựng bộ gạch chân lỗi ngữ pháp/từ vựng (Inline Highlighter) bài viết
│
├── 📅 NGÀY 17/11/2026: Socket.IO Client Realtime & WaveSurfer Timeline Speaking
│   ├── Buổi sáng: Nhúng socket.io-client đồng bộ tin nhắn Chat tức thì 2 chiều
│   └── Buổi chiều: Tích hợp sóng âm động WaveSurfer kèm ghim mốc thời gian nhận xét Speaking
│
└── 📅 NGÀY 18/11/2026: Chế độ Focus Reader, Dịch vụ Email & Nghiệm thu Tổng thể
    ├── Buổi sáng: Hoàn thiện chế độ Focus Reader đọc sách toàn màn hình
    ├── Buổi chiều: Tích hợp dịch vụ gửi Email thông báo tự động (Nodemailer/SendGrid)
    └── Buổi tối: Chạy kiểm thử End-to-End tổng thể 14 tiêu chí SRS & Bàn giao sản phẩm
```

---

#### Chi Tiết Nhiệm Vụ Từng Ngày:

#### 📅 Ngày 14/11/2026 (Thứ Bảy): Quản Trị Đề Thi Writing/Speaking & Upload Audio CDN
- **Mục tiêu**: Hoàn thiện toàn bộ khâu chuẩn bị đề thi của Giáo viên Admin và giải quyết triệt để vấn đề lưu trữ âm thanh thu âm.
- **Nhiệm vụ cụ thể**:
  1. *Frontend Admin*: Tạo mới trang `/admin/writing-prompts` hoặc modal quản lý danh mục đề bài Writing Task 1 & Task 2; kết nối với `@Get/Post/Put/Delete('/writing/prompts')`.
  2. *Frontend Admin*: Tạo mới trang `/admin/speaking-prompts` quản lý bộ câu hỏi Speaking Part 1, Part 2 (Cue Card), Part 3; kết nối với `@Get/Post/Put/Delete('/speaking/prompts')`.
  3. *Backend*: Viết endpoint `POST /api/speaking/submissions/with-audio` nhận `multipart/form-data` file âm thanh, đẩy lên Cloudinary qua `CloudinaryService`, trả về secure URL vĩnh viễn.
  4. *Frontend Student*: Cập nhật màn hình `student/speaking`, khi học viên bấm nộp bài sẽ gửi blob audio trực tiếp qua API mới.

---

#### 📅 Ngày 15/11/2026 (Chủ Nhật): Reading Split-View & Đa Dạng Hóa Câu Hỏi Quiz
- **Mục tiêu**: Đưa trải nghiệm thi trực tuyến đạt chuẩn thi máy Cambridge IELTS Computer-delivered.
- **Nhiệm vụ cụ thể**:
  1. *Frontend Student*: Nâng cấp trang `/student/quizzes`. Khi đề thi có trường `passage`:
     - Tự động kích hoạt layout 2 cột chia đôi màn hình:
       - Cột trái (50%): Bài đọc dài kèm thanh cuộn độc lập, công cụ bôi màu highlight từ khóa, nút đổi cỡ chữ (A- / A+).
       - Cột phải (50%): Danh sách câu hỏi con cuộn độc lập.
  2. *Frontend & Backend Quiz*:
     - Xây dựng component giao diện cho câu hỏi dạng điền từ vào ô trống (`FILL_BLANK`).
     - Xây dựng component giao diện cho dạng câu hỏi `TRUE_FALSE_NOT_GIVEN` / `YES_NO_NOT_GIVEN`.
  3. Bổ sung hiệu ứng chúc mừng Confetti khi học viên đạt sàn $\ge 80\%$.

---

#### 📅 Ngày 16/11/2026 (Thứ Hai): Kéo - Thả Giáo Trình LMS & Inline Error Highlighter Writing
- **Mục tiêu**: Tối ưu hóa năng suất quản lý khóa học của Admin và nâng tầm chiều sâu trải nghiệm luyện viết AI.
- **Nhiệm vụ cụ thể**:
  1. *Frontend Admin*: Cài đặt `@dnd-kit/core` và `@dnd-kit/sortable` trên trang `/admin/courses`. Cho phép Admin kéo thả thay đổi vị trí các Module và Bài học, tự động gọi API `POST /lessons/modules/reorder` và `POST /lessons/reorder`.
  2. *Frontend Writing*: Xây dựng bộ render văn bản thông minh (Inline Highlighter) tại `student/writing` và `admin/writing-review`:
     - Phân tích tọa độ từ sai từ phản hồi của Gemini AI.
     - Gạch chân đỏ dưới cụm từ sai ngữ pháp, gạch chân vàng dưới từ vựng lặp/bình dân.
     - Hover/Click hiển thị popup giải thích lý do và gợi ý từ vựng Band 8.0+.

---

#### 📅 Ngày 17/11/2026 (Thứ Ba): Socket.IO Client Thời Gian Thực 2 Chiều & WaveSurfer Speaking
- **Mục tiêu**: Hoàn thiện tính năng tương tác thời gian thực tức thì cho kênh tin nhắn và studio luyện nói.
- **Nhiệm vụ cụ thể**:
  1. *Frontend Chat*: Cài đặt `socket.io-client`, khởi tạo kết nối với Namespace `/chat` của server:
     - Lắng nghe sự kiện `newMessage`: Tự động append tin nhắn mới vào khung chat mà không cần reload trang.
     - Lắng nghe sự kiện `typing`: Hiển thị icon ba chấm chuyển động khi đối phương đang gõ văn bản.
  2. *Frontend Speaking*: Tích hợp thư viện `wavesurfer.js` vào màn hình chấm bài `admin/speaking-grading`:
     - Hiển thị sóng âm khi phát lại file âm thanh của học viên.
     - Hiển thị các chấm ghim (marker pin) tại các mốc thời gian Admin đã nhận xét.
     - Click vào nhận xét ở giây nào $\rightarrow$ Audio tự động nhảy đến đúng giây đó.

---

#### 📅 Ngày 18/11/2026 (Thứ Tư): Focus Book Reader, Email Service & Nghiệm Thu Tổng Thể
- **Mục tiêu**: Hoàn thiện các chi tiết bảo mật, hạ tầng thông báo và nghiệm thu toàn diện theo 14 tiêu chí chuẩn SRS.
- **Nhiệm vụ cụ thể**:
  1. *Frontend Library*: Bổ sung nút "Chế độ đọc sách toàn màn hình" (Focus Reading Mode) trên `student/library`, ẩn thanh menu để phóng to sách đọc, thanh lật trang mượt mà và lưu vị trí trang đang đọc dở vào LocalStorage.
  2. *Backend Email*: Xây dựng module dịch vụ gửi email tự động qua Nodemailer SMTP / SendGrid:
     - Gửi email kích hoạt tài khoản khi học viên được tạo mới.
     - Gửi email thông báo điểm số khi Admin duyệt xong bài Writing / Speaking.
  3. *QA Testing & Verification*:
     - Chạy lại toàn bộ test suite E2E Server (130 tests) và Client (17 tests).
     - Kiểm tra đối chiếu 14 tiêu chí nghiệm thu chức năng của tài liệu SRS.
     - Kiểm tra tương thích đa ngôn ngữ (VI, EN, ZH, JA) trên toàn bộ các màn hình mới.
     - Đóng gói và phát hành phiên bản hoàn thiện của hệ thống Teacher Dong Academy.
