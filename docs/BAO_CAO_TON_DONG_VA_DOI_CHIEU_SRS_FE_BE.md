# BÁO CÁO TOÀN DIỆN: CÁC VẤN ĐỀ TỒN ĐỌNG & ĐỐI CHIẾU CHỨC NĂNG GIỮA SRS, BACKEND VÀ FRONTEND
## DỰ ÁN: TEACHER DONG ACADEMY (LMS & WEBRTC IN-HOUSE)

> **Ngày lập báo cáo:** 16/11/2026  
> **Tài liệu căn cứ:**  
> - `SRS.md` & `docs/SRS.md` (Tài liệu đặc tả yêu cầu phần mềm IEEE 830).  
> - `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md` (Đặc tả chi tiết màn hình, trường dữ liệu, validation & luồng nghiệp vụ).  
> - `docs/mock_test.html` (Interactive Prototype UI/UX).  
> - Mã nguồn Backend: `server/src/` (NestJS 10, Prisma ORM, LiveKit, Redis, Mailer).  
> - Mã nguồn Frontend: `client/src/` (Next.js 14 App Router, TypeScript, Tailwind CSS).

---

## MỤC LỤC TỔNG QUAN

1. [Phần 1: Những Chức Năng Còn Thiếu Trong Toàn Bộ Code So Với SRS](#phần-1-những-chức-năng-còn-thiếu-trong-toàn-bộ-code-so-với-srs)
2. [Phần 2: Chức Năng Đã Làm Ở Backend Nhưng Chưa Xuất Hiện Trên Frontend](#phần-2-chức-năng-đã-làm-ở-backend-nhưng-chưa-xuất-hiện-trên-frontend)
3. [Phần 3: Chức Năng Xuất Hiện Trên Frontend Nhưng Chưa Có Ở Backend](#phần-3-chức-năng-xuất-hiện-trên-frontend-nhưng-chưa-có-ở-backend)
4. [Phần 4: Ma Trận Đối Chiếu Chi Tiết 11 Phân Hệ SRS](#phần-4-ma-trận-đối-chiếu-chi-tiết-11-phân-hệ-srs)
5. [Phần 5: Kế Hoạch Triển Khai Xử Lý Khuyến Nghị Theo Thứ Tự Ưu Tiên](#phần-5-kế-hoạch-triển-khai-xử-lý-khuyến-nghị-theo-thứ-tự-ưu-tiên)

---

# PHẦN 1: NHỮNG CHỨC NĂNG CÒN THIẾU TRONG TOÀN BỘ CODE SO VỚI SRS

Dưới đây là các chức năng được quy định bắt buộc trong tài liệu SRS nhưng hiện tại cả phía Backend và Frontend đều chưa hoàn thiện hoặc chưa triển khai.

---

### 1.1. Chống Tấn Công Dò Mật Khẩu (Brute-Force Attack Protection - FR-1.7)
- **Quy định trong SRS (Mục 3, FR-1.7)**:  
  *Hệ thống phải có cơ chế giới hạn số lần đăng nhập sai liên tiếp nhằm phòng chống tấn công dò quét mật khẩu (Brute-force lockout).*
- **Thực trạng trong code**:  
  - Trong [auth.service.ts](file:///d:/englishweb/server/src/modules/auth/auth.service.ts) và [auth.controller.ts](file:///d:/englishweb/server/src/modules/auth/auth.controller.ts), endpoint `POST /api/auth/login` chỉ so sánh `bcrypt.compare`.
  - Chưa tích hợp `@nestjs/throttler` hoặc bộ đếm số lần thất bại trên Redis (`redis.incr(failed_login:email)`).
  - Không có cơ chế khóa tạm thời tài khoản (15-30 phút) hay yêu cầu CAPTCHA khi sai quá 5 lần.
- **Rủi ro**: Kẻ tấn công có thể dùng botnet gửi hàng ngàn request dò mật khẩu tài khoản học viên và Admin mà không bị chặn.
- **Giải pháp cần làm**:
  - Cài đặt `@nestjs/throttler` hoặc viết Guard đếm số lần đăng nhập sai theo IP/Email trên Redis.
  - Khi vượt quá 5 lần sai trong 10 phút, trả về mã lỗi `AUTH_TOO_MANY_ATTEMPTS` kèm thời gian còn lại trước khi được thử lại.

---

### 1.2. Luồng Đăng Nhập Google OAuth 2.0 Thật (FR-1.4)
- **Quy định trong SRS (Mục 3, FR-1.4 & Tiêu chí nghiệm thu số 1)**:  
  *Đăng nhập và tự động tạo tài khoản học viên qua Google OAuth 2.0; xác thực token ký bởi Google API.*
- **Thực trạng trong code**:  
  - Phía Frontend [auth-context.tsx](file:///d:/englishweb/client/src/lib/auth-context.tsx#L171-L176), hàm `loginWithGoogle` hiện đang truyền `idToken: 'google_oauth_' + Date.now()` (giả lập).
  - Frontend chưa tích hợp thư viện Google Identity Services (GIS) hoặc `@react-oauth/google` để mở popup đăng nhập tài khoản Google thật của người dùng.
  - Backend [auth.service.ts](file:///d:/englishweb/server/src/modules/auth/auth.service.ts#L182-L210) chỉ giải mã payload giả lập nếu thiếu Google Client ID chứ chưa bắt buộc verify token qua `google-auth-library`.
- **Giải pháp cần làm**:
  - Frontend: Bổ sung component nút Google Sign-In chính thức của Google, lấy token thực tế gửi về API.
  - Backend: Sử dụng `OAuth2Client.verifyIdToken()` từ thư viện `google-auth-library` để kiểm tra chữ ký số của Google.

---

### 1.3. Trình Xem Học Liệu PDF Nhị Phân Thật (FR-4.2)
- **Quy định trong SRS (Mục 3, FR-4.2 & LIB-SCR-003)**:  
  *Trình xem PDF trực tiếp trên giao diện website, hỗ trợ lật trang, zoom, toàn màn hình, không cho tải file gốc.*
- **Thực trạng trong code**:  
  - Trong [student/library/page.tsx](file:///d:/englishweb/client/src/app/(student)/student/library/page.tsx#L350-L364), khi mở xem file PDF, giao diện chỉ hiển thị một khung Card minh họa tượng trưng ("*Đang hiển thị tài liệu: ... Trang 1 / 24*").
  - Chưa nhúng thư viện giải mã và vẽ các trang PDF nhị phân thật lên Canvas (như `pdfjs-dist` hoặc `react-pdf`).
- **Giải pháp cần làm**:
  - Tích hợp thư viện `pdfjs-dist` để fetch luồng nhị phân từ URL ký số (`/api/materials/:id/stream?token=...`) và render các trang PDF thực tế lên canvas dưới lớp Watermark bảo vệ.

---

### 1.4. Quyền Host Loại Bỏ Học Viên Khỏi Phòng Học (FR-5.4)
- **Quy định trong SRS (Mục 3, FR-5.4)**:  
  *Admin Host có quyền quản trị phòng học: Mute mic, tắt camera và Kick học viên vi phạm ra khỏi phòng.*
- **Thực trạng trong code**:  
  - Backend [livekit.service.ts](file:///d:/englishweb/server/src/core/livekit/livekit.service.ts#L68) đã có phương thức `removeParticipant(roomName, identity)` gọi đến SDK LiveKit.
  - Tuy nhiên, [livekit.controller.ts](file:///d:/englishweb/server/src/core/livekit/livekit.controller.ts) **chưa có endpoint REST** `@Post('kick-participant')` để client gọi lên.
  - Frontend [classroom-container.tsx](file:///d:/englishweb/client/src/components/classroom/classroom-container.tsx) chưa truyền hàm xử lý vào prop `onKickParticipant` của [video-grid.tsx](file:///d:/englishweb/client/src/components/classroom/video-grid.tsx).
- **Giải pháp cần làm**:
  - Thêm `@Post('kick-participant')` vào `LivekitController`.
  - Nối nút "Kick khỏi lớp" trên menu ngữ cảnh video của từng học viên trên giao diện giảng viên.

---

### 1.5. Màn Hình Học Viên Xem Kết Quả Speaking Kèm Timestamp Comments (FR-7.3 & SP-SCR-005)
- **Quy định trong SRS (Mục 3, FR-7.3 & SP-SCR-005)**:  
  *Học viên xem điểm 4 tiêu chí IELTS Speaking, nghe lại audio và click vào Timestamp Comments để tự động nhảy đến đúng giây nhận xét.*
- **Thực trạng trong code**:  
  - Phía Admin [speaking-grading/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/speaking-grading/page.tsx) đã có đầy đủ công cụ chấm và tạo timestamp comment.
  - Tuy nhiên phía Học viên [student/speaking/page.tsx](file:///d:/englishweb/client/src/app/(student)/student/speaking/page.tsx) hiện **chỉ là màn hình thu âm và nộp bài**. Hoàn toàn thiếu tab/màn hình danh sách các bài Speaking đã được chấm để học viên nghe lại nhận xét và click vào các mốc thời gian.
- **Giải pháp cần làm**:
  - Bổ sung tab "Lịch sử & Kết quả chấm bài" trên trang Speaking của học viên.
  - Hiển thị thanh Audio Player có gắn các pin mốc thời gian nhận xét của Admin.

---

# PHẦN 2: CHỨC NĂNG ĐÃ LÀM Ở BACKEND NHƯNG CHƯA XUẤT HIỆN TRÊN FRONTEND

Backend đã hoàn thành toàn bộ Model cơ sở dữ liệu Prisma, DTO có validation, Controller và Service, nhưng Frontend chưa xây dựng giao diện hoặc chưa gọi API.

```
       CÁC API BACKEND SẴN SÀNG                        THỰC TRẠNG PHÍA FRONTEND
┌──────────────────────────────────────────────┐        ┌─────────────────────────────────────────────┐
│ 1. POST/PUT/DELETE /api/blogs                │ ────►  │ Chưa có trang Admin Blog (BLOG-SCR-002)     │
│ 2. POST /api/notifications/broadcast         │ ────►  │ Thiếu modal Admin gửi thông báo toàn trường │
│ 3. POST /api/lessons/:id/video               │ ────►  │ Chưa có nút/form upload video bài giảng     │
│ 4. POST /api/lessons/modules (CRUD)          │ ────►  │ Chưa có modal quản lý chương học độc lập    │
│ 5. POST /api/quizzes/:id/questions/bulk      │ ────►  │ Chưa có nút nhập câu hỏi hàng loạt (Excel)  │
│ 6. GET /api/quizzes/diagnostic/...           │ ────►  │ Chưa có trang xem lịch sử chẩn đoán tổng hợp│
│ 7. POST /api/auth/google/link & unlink       │ ────►  │ Thiếu nút liên kết/hủy Google trong Profile │
│ 8. PUT /api/auth/language (Sync DB)          │ ────►  │ FE chỉ lưu localStorage, không gọi API      │
│ 9. GET /api/users/:id (Chi tiết + Tiến độ)   │ ────►  │ Chưa có popup xem chi tiết học viên         │
│ 10. POST /api/media/upload/image, video      │ ────►  │ Chưa có media.service kết nối               │
└──────────────────────────────────────────────┘        └─────────────────────────────────────────────┘
```

| STT | Endpoint Backend đã sẵn sàng | Controller & Service Backend | Chức năng nghiệp vụ | Hiện trạng phía Frontend |
|:---:|---|---|---|---|
| 1 | `POST /api/blogs`<br>`PUT /api/blogs/:id`<br>`DELETE /api/blogs/:id`<br>`POST /api/blogs/:id/cover`<br>`POST /api/blogs/:id/video` | [blogs.controller.ts](file:///d:/englishweb/server/src/modules/blogs/blogs.controller.ts)<br>[blogs.service.ts](file:///d:/englishweb/server/src/modules/blogs/blogs.service.ts) | Quản trị bài viết Blog (CRUD, upload ảnh bìa, upload video review). Phân hệ Trụ cột 05 SRS. | **Chưa có trang Admin UI**. Chỉ có trang xem public `/blog`. [blogs.service.ts](file:///d:/englishweb/client/src/services/blogs.service.ts) trên client đã viết sẵn hàm nhưng chưa gắn vào trang quản trị nào. |
| 2 | `POST /api/notifications/broadcast` | [notifications.controller.ts](file:///d:/englishweb/server/src/modules/notifications/notifications.controller.ts#L36)<br>[notifications.service.ts](file:///d:/englishweb/server/src/modules/notifications/notifications.service.ts) | Admin phát thông báo hệ thống tức thì tới toàn bộ học viên hoặc nhóm vai trò qua Socket.IO. | Frontend [app-topbar.tsx](file:///d:/englishweb/client/src/components/shared/app-topbar.tsx) có chuông nhận thông báo, nhưng **Admin hoàn toàn không có giao diện để soạn và phát thông báo**. |
| 3 | `POST /api/lessons/:id/video` | [lessons.controller.ts](file:///d:/englishweb/server/src/modules/lessons/lessons.controller.ts#L162)<br>[lessons.service.ts](file:///d:/englishweb/server/src/modules/lessons/lessons.service.ts) | Upload video bài giảng đa phương tiện lên hệ thống lưu trữ Cloudinary. | Trang [admin/courses/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/courses/page.tsx) chỉ cho nhập text tiêu đề/thời lượng, chưa có nút/input chọn file video để upload lên API. |
| 4 | `POST /api/lessons/modules`<br>`PUT /api/lessons/modules/:id`<br>`DELETE /api/lessons/modules/:id` | [lessons.controller.ts](file:///d:/englishweb/server/src/modules/lessons/lessons.controller.ts#L46-L70)<br>[lessons.service.ts](file:///d:/englishweb/server/src/modules/lessons/lessons.service.ts) | Quản lý Chương học (Module): Tạo mới, cập nhật tên chương, xóa chương thuộc khóa học. | Admin Courses hiện chỉ có modal thêm Lesson, chưa có giao diện độc lập để quản lý danh sách Module. |
| 5 | `POST /api/quizzes/:id/questions/bulk` | [quizzes.controller.ts](file:///d:/englishweb/server/src/modules/quizzes/quizzes.controller.ts#L65)<br>[quizzes.service.ts](file:///d:/englishweb/server/src/modules/quizzes/quizzes.service.ts) | Nhập hàng loạt câu hỏi trắc nghiệm từ tệp dữ liệu (Excel/JSON) vào đề thi. | Trang [admin/quizzes/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/quizzes/page.tsx) chỉ có form nhập từng câu hỏi một (`#questionBankModal`), chưa có nút Bulk Import. |
| 6 | `GET /api/quizzes/diagnostic/me`<br>`GET /api/quizzes/diagnostic/admin/overview`<br>`GET /api/quizzes/diagnostic/students/:id` | [quizzes.controller.ts](file:///d:/englishweb/server/src/modules/quizzes/quizzes.controller.ts#L85-L100)<br>[quizzes.service.ts](file:///d:/englishweb/server/src/modules/quizzes/quizzes.service.ts) | Báo cáo chẩn đoán năng lực 4 kỹ năng tổng thể của học viên và toàn hệ thống. | [quizzes.service.ts](file:///d:/englishweb/client/src/services/quizzes.service.ts#L68-L76) đã viết hàm nhưng không có trang nào trên FE gọi; biểu đồ radar trên màn hình quiz hiện chỉ tự tính cục bộ. |
| 7 | `POST /api/auth/google/link`<br>`POST /api/auth/google/unlink` | [auth.controller.ts](file:///d:/englishweb/server/src/modules/auth/auth.controller.ts#L70-L80)<br>[auth.service.ts](file:///d:/englishweb/server/src/modules/auth/auth.service.ts) | Liên kết hoặc hủy liên kết tài khoản Google với tài khoản Email/Password hiện hành. | Trang [student/account/page.tsx](file:///d:/englishweb/client/src/app/(student)/student/account/page.tsx) và `admin/account/page.tsx` hoàn toàn chưa có nút bấm hoặc UI để thực hiện liên kết. |
| 8 | `PUT /api/auth/language` | [auth.controller.ts](file:///d:/englishweb/server/src/modules/auth/auth.controller.ts#L135)<br>[auth.service.ts](file:///d:/englishweb/server/src/modules/auth/auth.service.ts) | Lưu trữ ngôn ngữ ưa thích (`preferredLang`) vào hồ sơ người dùng trong Database MySQL. | Hàm `setLang` trong [i18n-context.tsx](file:///d:/englishweb/client/src/lib/i18n-context.tsx#L749) chỉ lưu vào `localStorage` và `cookie`, không hề gọi API để đồng bộ lên server. |
| 9 | `GET /api/users/:id` | [users.controller.ts](file:///d:/englishweb/server/src/modules/users/users.controller.ts#L46)<br>[users.service.ts](file:///d:/englishweb/server/src/modules/users/users.service.ts) | Lấy chi tiết hồ sơ học viên, thông tin khóa học đã đăng ký và % tiến độ học tập. | Trang [admin/users/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/users/page.tsx) chỉ hiển thị bảng danh sách, chưa có modal "Xem hồ sơ chi tiết & tiến độ". |
| 10 | `POST /api/media/upload/image`<br>`POST /api/media/upload/video` | [media.controller.ts](file:///d:/englishweb/server/src/core/cloudinary/media.controller.ts)<br>[cloudinary.service.ts](file:///d:/englishweb/server/src/core/cloudinary/cloudinary.service.ts) | Upload media độc lập dùng chung cho toàn hệ thống. | Frontend hoàn toàn chưa có `media.service.ts` và chưa gọi endpoint này. |

---

# PHẦN 3: CHỨC NĂNG XUẤT HIỆN TRÊN FRONTEND NHƯNG CHƯA CÓ Ở BACKEND

Frontend đã thiết kế giao diện, form nhập liệu, hiệu ứng phản hồi, nhưng chạy bằng dữ liệu Mock, hàm `setTimeout` giả lập hoặc thiếu endpoint xử lý ở Backend.

---

### 3.1. Form Đăng Ký Tư Vấn Khóa Học Trang Chủ (`page.tsx`)
- **Giao diện trên Frontend**:  
  Tại [page.tsx](file:///d:/englishweb/client/src/app/page.tsx#L536-L545), người dùng có thể nhập: Họ tên, Email, Số điện thoại, Trụ cột khóa học quan tâm và Lời nhắn.
- **Thực trạng**:  
  Khi bấm nút gửi, hàm `handleConsultSubmit` chỉ chạy:
  ```typescript
  setFormSubmitted(true);
  setTimeout(() => {
    setFormSubmitted(false);
    setFormData({ fullName: '', email: '', phone: '', interestedProgram: 'p1', message: '' });
  }, 4000);
  ```
- **Backend còn thiếu**:  
  - Chưa có bảng Database (ví dụ model `ConsultationLead`).
  - Chưa có Controller/Service: `POST /api/leads` hoặc `POST /api/consultations` để lưu thông tin học viên tiềm năng và gửi email thông báo cho Admin.

---

### 3.2. Cây Đề Cương Khóa Học Quản Trị Viên (`admin/courses`) Đang Hardcode Mảng Tĩnh
- **Giao diện trên Frontend**:  
  Tại [admin/courses/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/courses/page.tsx#L194-L223), khối "Curriculum Reorder" hiển thị các module và bài học kèm nút hoán đổi vị trí (Up/Down).
- **Thực trạng**:  
  - Dữ liệu `curriculumModules` đang là **mảng dữ liệu cố định trong code** (`id: 'm-1'`, `'m-2'`, `'m-3'`).
  - Dropdown chọn khóa học (`selectedCourseId`) khi thay đổi **không kích hoạt bất kỳ API nào** để lấy danh sách Module và Lesson thật của khóa học đó từ database.
- **Backend cần bổ sung**:  
  - Cần endpoint: `GET /api/courses/:id/curriculum` hoặc `GET /api/courses/:id/modules` để trả về cây cấu trúc thực tế phục vụ sắp xếp.

---

### 3.3. Xuất Báo Cáo Điểm Danh Theo Lớp Đang Dùng ID Giả Lập
- **Giao diện trên Frontend**:  
  Tại [admin/attendance/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/attendance/page.tsx#L161), nút xuất file Excel theo buổi học gọi:
  ```typescript
  blob = await attendanceService.exportExcel('classroom-active-id');
  ```
- **Thực trạng**:  
  Chuỗi `'classroom-active-id'` là ID cứng giả lập, không lấy từ ID phòng học thực tế được chọn trong bộ lọc.

---

# PHẦN 4: MA TRẬN ĐỐI CHIẾU CHI TIẾT 11 PHÂN HỆ SRS

| Mã SRS | Tên phân hệ | Mức độ hoàn thiện Backend | Mức độ hoàn thiện Frontend | Trạng thái tích hợp |
|:---:|---|:---:|:---:|:---:|
| **FR-01** | Xác thực & Single Session | 95% *(Đầy đủ Single Session, JWT, Mailer; thiếu Throttler)* | 85% *(Thiếu Google OAuth thật, thiếu nút Link Google)* | 🟡 **Khá** |
| **FR-02** | Đa ngôn ngữ (i18n) | 100% *(Có đủ 4 thứ tiếng + API sync)* | 80% *(Chưa gọi API sync preferredLang vào DB)* | 🟡 **Khá** |
| **FR-03** | Quản lý khóa học (LMS) | 90% *(Có đủ CRUD Course/Lesson, reorder)* | 75% *(Cây curriculum đang mock, thiếu upload video)* | 🟡 **Khá** |
| **FR-04** | Kho học liệu số bảo mật | 95% *(Upload multipart, Signed URL 15m)* | 80% *(PDF Viewer chỉ là khung card, chưa render file)* | 🟡 **Khá** |
| **FR-05** | Lớp học WebRTC LiveKit | 90% *(SFU Token, Mute, End room, Whiteboard)* | 85% *(Thiếu nút Kick học viên trên Grid video)* | 🟡 **Khá** |
| **FR-06** | AI Writing Studio | 95% *(Gemini AI 4 tiêu chí, Auto-save draft, Admin duyệt)* | 95% *(Word counter, target bar, inline highlight)* | 🟢 **Tốt** |
| **FR-07** | IELTS Speaking Studio | 90% *(Thu âm Web Audio API, Admin chấm 4 tiêu chí)* | 70% *(Thiếu màn hình học viên xem bài đã chấm kèm timestamp)* | 🟡 **Khá** |
| **FR-08** | Quiz Engine & Kiểm tra | 95% *(Chấm tức thì, sàn 80%, 3 dạng câu hỏi)* | 85% *(Thiếu bulk import câu hỏi, radar tính client)* | 🟢 **Tốt** |
| **FR-09** | Điểm danh tự động | 95% *(LiveKit Webhook, phân loại PRESENT/LATE/ABSENT)* | 90% *(Override, xuất Excel; đã sửa lỗi lệch trường)* | 🟢 **Tốt** |
| **FR-10** | Dashboard & Thống kê | 100% *(Thống kê chi tiết cho cả Student & Admin)* | 95% *(Kết nối API thật, biểu đồ tiến độ)* | 🟢 **Tốt** |
| **FR-11** | Nhắn tin Socket.IO | 95% *(Realtime 2 chiều, typing indicator, unread)* | 95% *(Kết nối Gateway kèm fallback HTTP)* | 🟢 **Tốt** |

---

# PHẦN 5: KẾ HOẠCH TRIỂN KHAI XỬ LÝ KHUYẾN NGHỊ THEO THỨ TỰ ƯU TIÊN

```
             LỘ TRÌNH HOÀN THIỆN TOÀN DIỆN HỆ THỐNG
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: KHẮC PHỤC LỖI KẾT NỐI & DỮ LIỆU ĐANG MOCK (P0)      │
│  - Tạo màn hình học viên xem bài Speaking đã chấm (SP-SCR-005)   │
│  - Bổ sung bảng và API tiếp nhận Lead tư vấn trang chủ          │
│  - Kết nối cây Modules thật theo courseId trong admin/courses   │
├─────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 2: BỔ SUNG GIAO DIỆN CHO CÁC API BACKEND SẴN CÓ (P1)   │
│  - Tạo trang Admin Blog (/admin/blogs) phục vụ Trụ cột 05       │
│  - Thêm modal Admin phát thông báo Broadcast Notification       │
│  - Bổ sung nút liên kết Google và gọi API đồng bộ ngôn ngữ      │
│  - Bổ sung nút upload video bài giảng cho Lesson                │
├─────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 3: BẢO MẬT & TRẢI NGHIỆM CHUYÊN SÂU (P2)              │
│  - Tích hợp Throttler Guard chống Brute-force đăng nhập         │
│  - Nhúng PDF.js render file nhị phân thật cho Kho học liệu      │
│  - Bổ sung endpoint và nút Host Kick học viên khỏi phòng LiveKit│
└─────────────────────────────────────────────────────────────────┘
```

### Chi tiết phân công công việc:

#### 1. Ưu tiên P0 (Cần làm ngay)
1. **Màn hình Học viên xem Speaking đã chấm (`SP-SCR-005`)**:
   - Thêm tab "Kết quả chấm bài" trên `client/src/app/(student)/student/speaking/page.tsx`.
   - Khi chọn một bài đã nộp, load audio player, hiển thị điểm 4 tiêu chí và danh sách nhận xét có ghim mốc giây (click để tua audio).
2. **Form Đăng ký tư vấn khóa học**:
   - Tạo model Prisma `ConsultationLead` (`fullName`, `email`, `phone`, `programCode`, `message`, `status`).
   - Viết endpoint `POST /api/leads` và nối vào form trang chủ [page.tsx](file:///d:/englishweb/client/src/app/page.tsx).
3. **Đề cương khóa học Admin động**:
   - Viết API `GET /api/courses/:id/curriculum` trả về danh sách module và bài học thực tế từ database.
   - Nối dropdown `selectedCourseId` trên `admin/courses` để fetch dữ liệu thật thay cho mảng hardcode.

#### 2. Ưu tiên P1 (Hoàn thiện chức năng quản trị)
1. **Xây dựng trang Admin Blog (`BLOG-SCR-002`)**:
   - Tạo file `client/src/app/(admin)/admin/blogs/page.tsx`.
   - Kết nối với `blogs.service.ts` để hiển thị bảng bài viết, modal thêm/sửa bài viết kèm upload ảnh bìa và video.
2. **Modal Admin gửi Broadcast Notification**:
   - Bổ sung modal trên [app-topbar.tsx](file:///d:/englishweb/client/src/components/shared/app-topbar.tsx) cho phép Admin soạn tiêu đề, nội dung và gọi `POST /api/notifications/broadcast`.
3. **Đồng bộ ngôn ngữ & Liên kết Google**:
   - Gọi `api.put('/auth/language', { language: newLang })` trong `setLang` của `i18n-context.tsx`.
   - Thêm nút "Liên kết Google" trong trang `account/page.tsx`.

#### 3. Ưu tiên P2 (Bảo mật & Tối ưu trải nghiệm)
1. **Tích hợp `@nestjs/throttler`**:
   - Cấu hình rate limit 5 requests/phút đối với endpoint `POST /api/auth/login`.
2. **Render PDF nhị phân thật**:
   - Nhúng `pdfjs-dist` để hiển thị nội dung tài liệu PDF thật trên Canvas.
3. **Kick học viên LiveKit**:
   - Bổ sung endpoint `@Post('kick-participant')` trong `livekit.controller.ts` và nối prop `onKickParticipant` trong `classroom-container.tsx`.

