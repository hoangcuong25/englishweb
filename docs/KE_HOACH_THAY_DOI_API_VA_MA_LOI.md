# KẾ HOẠCH THAY ĐỔI & CHUẨN HÓA TOÀN DIỆN: HỆ THỐNG API VÀ BỘ MÃ LỖI
## DỰ ÁN: TEACHER DONG ACADEMY (LMS & WEBRTC IN-HOUSE)

> **Phiên bản:** 3.0 (Tích hợp Toàn diện Kế Hoạch Thay Đổi API + Bảng Mã Lỗi Định Danh Cho Từng Endpoint)  
> **Ngày lập:** 16/11/2026  
> **Trạng thái thực tế:**  
> - Các lỗi trong code hiện **CHƯA CÓ MÃ LỖI RIÊNG** (đang map chung chung về mã trạng thái HTTP `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN_ACCESS`, `RESOURCE_NOT_FOUND`).  
> - Hệ thống còn **THIẾU CÁC API THỰC TẾ** (Quên/Reset mật khẩu, Upload file tài liệu nhị phân thật, API học bài chi tiết theo components).  
> **Mục tiêu tài liệu:** Đặc tả chi tiết kế hoạch thêm mới & nâng cấp các API, đi kèm bộ mã lỗi định danh chi tiết (Domain Error Codes Enum) cho từng Endpoint, Request/Response DTO và lộ trình lập trình hoàn thiện.

---

## MỤC LỤC TỔNG QUAN

1. [Phần 1: Thực Trạng Hệ Thống & Lý Do Cần Thay Đổi](#phần-1-thực-trạng-hệ-thống--lý-do-cần-thay-đổi)
2. [Phần 2: Kế Hoạch Thay Đổi & Bổ Sung API Chi Tiết Cho Từng Phân Hệ](#phần-2-kế-hoạch-thay-đổi--bổ-sung-api-chi-tiết-cho-từng-phân-hệ)
   - [2.1. Phân hệ Thư Viện Số: API Tải File Nhị Phân Thật (`/api/materials/upload`)](#21-phân-hệ-thư-viện-số-api-tải-file-nhị-phân-thật-apimaterialsupload)
   - [2.2. Phân hệ Xác Thực: API Quên Mật Khẩu & Đặt Lại Mật Khẩu (`/api/auth/forgot-password`, `/reset-password`)](#22-phân-hệ-xác-thực-api-quên-mật-khẩu--đặt-lại-mật-khẩu-apiauthforgot-password-reset-password)
   - [2.3. Phân hệ LMS: API Màn Hình Học Bài Chi Tiết (`/api/lessons/:id/study`)](#23-phân-hệ-lms-api-màn-hình-học-bài-chi-tiết-apilessonsidstudy)
   - [2.4. Phân hệ Lớp Học Trực Tuyến: API Ép Tắt Mic/Cam Học Viên Từ Xa (`/api/livekit/.../mute`)](#24-phân-hệ-lớp-học-trực-tuyến-api-ép-tắt-miccam-học-viên-từ-xa-apilivekitmute)
   - [2.5. Phân hệ Quản Trị: API Upload Video Bài Giảng & Phát Thông Báo Broadcast](#25-phân-hệ-quản-trị-api-upload-video-bài-giảng--phát-thông-báo-broadcast)
3. [Phần 3: Bảng Tra Cứu Toàn Bộ Mã Lỗi Định Danh Cụ Thể (Master Error Codes Catalog)](#phần-3-bảng-tra-cứu-toàn-bộ-mã-lỗi-định-danh-cụ-thể-master-error-codes-catalog)
4. [Phần 4: Kiến Trúc & Mã Nguồn Triển Khai Kỹ Thuật (Backend & Frontend)](#phần-4-kiến-trúc--mã-nguồn-triển-khai-kỹ-thuật-backend--frontend)
5. [Phần 5: Lộ Trình Triển Khai Thực Tế Từng Bước (Execution Roadmap)](#phần-5-lộ-trình-triển-khai-thực-tế-từng-bước-execution-roadmap)

---

## PHẦN 1: THỰC TRẠNG HỆ THỐNG & LÝ DO CẦN THAY ĐỔI

### 1. Vấn đề về API (Thiếu hụt hoặc chạy Mock)
- **Modal Thư viện số ([admin/library](file:///d:/englishweb/client/src/app/(admin)/admin/library/page.tsx))**: Không có ô chọn file nhị phân thật (`<input type="file">`). Code đang tự gán `fileSize: 6.2 MB` / `18.4 MB` giả lập. Backend thiếu một endpoint upload multipart file lưu vào thư mục bảo mật `private_storage/materials/`.
- **Luồng khôi phục tài khoản ([login/page.tsx](file:///d:/englishweb/client/src/app/(auth)/login/page.tsx))**: Chữ *"Quên mật khẩu?"* chỉ là text tĩnh, chưa có API sinh token reset và gửi email khôi phục mật khẩu.
- **Học bài LMS ([student/courses](file:///d:/englishweb/client/src/app/(student)/student/courses/page.tsx))**: Học viên chỉ có nút tick *"Học & Hoàn thành"* thay vì một màn hình học tập đầy đủ (Lesson Learning Player) xem video bài giảng, tài liệu đính kèm và làm quiz.
- **Lớp học LiveKit ([classroom-container.tsx](file:///d:/englishweb/client/src/components/classroom/classroom-container.tsx))**: Giảng viên chưa có nút gọi API `muteParticipantTrack` để tắt mic học viên gây ồn.

### 2. Vấn đề về Mã Lỗi (Chưa có mã lỗi riêng)
- Trong [http-exception.filter.ts](file:///d:/englishweb/server/src/core/common/filters/http-exception.filter.ts), mọi ngoại lệ bị gom chung vào mã HTTP:
  - `400` ➔ `BAD_REQUEST`
  - `401` ➔ `UNAUTHORIZED`
  - `403` ➔ `FORBIDDEN_ACCESS`
  - `404` ➔ `RESOURCE_NOT_FOUND`
- **Hậu quả**: Khi Frontend nhận lỗi `BAD_REQUEST`, không thể biết được lỗi do *quên chọn file*, *file vượt quá 50MB*, hay *token đổi mật khẩu đã quá hạn 15 phút*.

---

## PHẦN 2: KẾ HOẠCH THAY ĐỔI & BỔ SUNG API CHI TIẾT CHO TỪNG PHÂN HỆ

---

### 2.1. Phân hệ Thư Viện Số: API Tải File Nhị Phân Thật (`/api/materials/upload`)

#### 1. Mục tiêu thay đổi
- Xóa bỏ hoàn toàn việc tạo metadata giả.
- Cho phép Admin kéo-thả hoặc chọn tệp tin PDF/MP3 thật từ máy tính.
- Backend tiếp nhận file nhị phân, kiểm tra dung lượng, định dạng MIME và lưu trữ vật lý vào thư mục an toàn `private_storage/materials/`.

#### 2. Đặc tả API chi tiết
- **URL**: `POST /api/materials/upload`
- **Quyền truy cập**: `@Roles(Role.ADMIN)` (Cần Bearer Token)
- **Content-Type**: `multipart/form-data`
- **Request Body (FormData)**:
  - `file`: Binary file (`.pdf`, `.mp3`, `.wav`, `.m4a`) - **Bắt buộc**
  - `title`: Chuỗi tên tài liệu giáo trình - **Bắt buộc**
  - `lessonId`: UUID của bài học muốn gán tài liệu - **Bắt buộc**
  - `type`: `PDF` | `AUDIO_MP3` - **Bắt buộc**
  - `isPrivate`: `true` | `false` (Mặc định `true`)
- **Response thành công (`201 Created`)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Tải lên và mã hóa học liệu số thành công",
    "data": {
      "id": "mat-uuid-1234",
      "title": "IELTS Academic Reading Cam 18",
      "type": "PDF",
      "fileKey": "materials/mat-uuid-1234.pdf",
      "fileSize": 14589200,
      "isPrivate": true,
      "lessonId": "lesson-uuid-5678",
      "createdAt": "2026-11-16T21:50:00.000Z"
    }
  }
  ```

#### 3. Danh mục Mã Lỗi Cụ Thể của API này
| Mã Lỗi (`errorCode`) | Tình Huống Kích Hoạt | HTTP Status | Thông Báo Trả Về |
|---|---|---|---|
| `MATERIAL_FILE_PAYLOAD_MISSING` | Request không đính kèm trường `file` | `400 Bad Request` | Vui lòng chọn tệp tin PDF hoặc MP3 từ máy tính để tải lên. |
| `MATERIAL_FILE_SIZE_EXCEEDED` | File PDF > 50MB hoặc File Audio > 100MB | `413 Payload Too Large` | Dung lượng tệp tin vượt quá giới hạn (PDF tối đa 50MB, Audio tối đa 100MB). |
| `MATERIAL_INVALID_MIME_TYPE` | Định dạng không phải PDF, MP3, WAV, M4A | `415 Unsupported Media` | Định dạng tệp không hợp lệ. Hệ thống chỉ hỗ trợ .pdf, .mp3, .wav, .m4a. |
| `MATERIAL_LESSON_NOT_FOUND` | `lessonId` truyền lên không tồn tại | `404 Not Found` | Không tìm thấy bài học tương ứng để gán học liệu. |

#### 4. Kế hoạch thay đổi Frontend
- Tại [client/src/app/(admin)/admin/library/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/library/page.tsx):
  - Dựng khu vực **File Dropzone** kéo thả chuột.
  - State `selectedFile: File | null`. Đọc tên file và dung lượng thật `(file.size / (1024 * 1024)).toFixed(1) + ' MB'`.
  - Tự nhận diện đuôi file `.pdf` ➔ tự chọn dropdown PDF; `.mp3` ➔ tự chọn MP3.
  - Đóng gói `new FormData()` gửi lên API, bắt các mã lỗi `MATERIAL_*` hiển thị Toast màu đỏ chuẩn xác.

---

### 2.2. Phân hệ Xác Thực: API Quên Mật Khẩu & Đặt Lại Mật Khẩu (`/api/auth/forgot-password`, `/reset-password`)

#### 1. Mục tiêu thay đổi
- Cung cấp luồng khôi phục tài khoản tự động qua Email bảo mật thời hạn 15 phút.

#### 2. Đặc tả API 1: Yêu cầu khôi phục mật khẩu
- **URL**: `POST /api/auth/forgot-password`
- **Quyền**: Public (Không cần đăng nhập)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "email": "student@englishweb.com"
  }
  ```
- **Xử lý Backend**:
  - Tìm user theo email. Nếu không thấy ➔ Ném lỗi `AUTH_EMAIL_NOT_FOUND`.
  - Sinh chuỗi ngẫu nhiên 64 ký tự hex `resetToken = crypto.randomBytes(32).toString('hex')`.
  - Lưu vào Redis: `SET reset_pwd:<resetToken> <userId> EX 900` (Hết hạn sau 15 phút).
  - Gọi `MailService.sendPasswordResetEmail(email, user.fullName, resetToken)`.
- **Response thành công (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Hướng dẫn đặt lại mật khẩu đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư (hiệu lực trong 15 phút)."
  }
  ```

#### 3. Đặc tả API 2: Xác nhận mật khẩu mới
- **URL**: `POST /api/auth/reset-password`
- **Request Body**:
  ```json
  {
    "token": "a1b2c3d4e5f6...",
    "newPassword": "NewStudentPassword@2026"
  }
  ```
- **Xử lý Backend**:
  - Tra cứu token trong Redis. Nếu không có hoặc hết hạn ➔ Ném `AUTH_RESET_TOKEN_EXPIRED`.
  - Kiểm tra độ mạnh mật khẩu (`newPassword`). Nếu < 8 ký tự ➔ Ném `AUTH_WEAK_PASSWORD`.
  - Hash mật khẩu mới bằng `bcrypt.hash(newPassword, 10)`.
  - Cập nhật database và xóa token khỏi Redis.
- **Response thành công (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bằng mật khẩu mới."
  }
  ```

#### 4. Danh mục Mã Lỗi Cụ Thể
| Mã Lỗi (`errorCode`) | Tình Huống Kích Hoạt | HTTP Status | Thông Báo Trả Về |
|---|---|---|---|
| `AUTH_EMAIL_NOT_FOUND` | Email không tồn tại trên hệ thống | `404 Not Found` | Không tìm thấy tài khoản học viên nào liên kết với email này. |
| `AUTH_RESET_TOKEN_EXPIRED` | Token không có trong Redis hoặc quá hạn 15p | `400 Bad Request` | Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu. |
| `AUTH_WEAK_PASSWORD` | Mật khẩu mới không đạt chuẩn bảo mật | `400 Bad Request` | Mật khẩu phải có tối thiểu 8 ký tự, gồm cả chữ hoa, chữ thường và chữ số. |

#### 5. Kế hoạch thay đổi Frontend
- Tạo trang `client/src/app/(auth)/forgot-password/page.tsx`: Form nhập email nhận link.
- Tạo trang `client/src/app/(auth)/reset-password/page.tsx`: Lấy `token` từ URL `?token=...`, nhập mật khẩu mới và xác nhận.
- Nối link tại `client/src/app/(auth)/login/page.tsx` dòng 115 chuyển sang `/forgot-password`.

---

### 2.3. Phân hệ LMS: API Màn Hình Học Bài Chi Tiết (`/api/lessons/:id/study`)

#### 1. Mục tiêu thay đổi
- Thay thế nút tick checkbox đơn giản ở danh sách khóa học bằng màn hình xem bài giảng chi tiết (Lesson Learning Player) theo chuẩn SRS `LMS-SCR-006`.

#### 2. Đặc tả API
- **URL**: `GET /api/lessons/:id/study`
- **Quyền**: `@Roles(Role.STUDENT, Role.ADMIN)`
- **Xử lý Backend**:
  - Kiểm tra điều kiện mở khóa bài học: Nếu bài học yêu cầu hoàn thành Quiz checkpoint trước đó mà học viên chưa đạt $\ge 80\%$ ➔ Ném `LESSON_LOCKED_CHECKPOINT`.
  - Lấy thông tin bài học kèm `videoUrl`, danh sách `materials` (tự động ký Signed URL 15 phút), danh sách câu hỏi Quiz liên kết và trạng thái tiến độ (`isCompleted`).
- **Response thành công (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "lesson-uuid-1",
      "title": "Lesson 01: Mastering IELTS Speaking Part 1",
      "duration": "45 phút",
      "videoUrl": "https://res.cloudinary.com/.../lesson1.mp4",
      "description": "Nội dung chi tiết bài học lý thuyết...",
      "isCompleted": false,
      "materials": [
        {
          "id": "mat-1",
          "title": "Speaking Part 1 Topic Vocabulary PDF",
          "type": "PDF",
          "signedUrl": "/api/materials/mat-1/stream?token=jwt_signed_token"
        }
      ],
      "quizzes": [
        { "id": "quiz-1", "title": "Mini Quiz Checkpoint Lesson 1", "passingScore": 80 }
      ]
    }
  }
  ```

#### 3. Danh mục Mã Lỗi Cụ Thể
| Mã Lỗi (`errorCode`) | Tình Huống Kích Hoạt | HTTP Status | Thông Báo Trả Về |
|---|---|---|---|
| `LESSON_LOCKED_CHECKPOINT` | Học viên chưa đạt $\ge 80\%$ bài kiểm tra tiên quyết | `403 Forbidden` | Bài học đang bị khóa. Bạn cần đạt tối thiểu 80% điểm bài kiểm tra trước đó để mở khóa. |
| `LESSON_NOT_FOUND` | Không tìm thấy ID bài học | `404 Not Found` | Bài học không tồn tại trong giáo trình đào tạo. |

#### 4. Kế hoạch thay đổi Frontend
- Xây dựng trang: `client/src/app/(student)/student/courses/[courseId]/lessons/[lessonId]/page.tsx`:
  - Player video bài giảng (hỗ trợ tua $\pm 10$s, tốc độ phát 0.75x - 2x).
  - Khung nội dung lý thuyết định dạng Markdown.
  - Tab Thư viện tài liệu (mở PDF Viewer có watermark).
  - Nút chuyển nhanh sang làm bài tập Quiz liên kết.
  - Nút "Đánh dấu hoàn thành bài học" gọi `POST /api/lessons/:id/complete`.

---

### 2.4. Phân hệ Lớp Học Trực Tuyến: API Ép Tắt Mic/Cam Học Viên Từ Xa (`/api/livekit/.../mute`)

#### 1. Mục tiêu thay đổi
- Kích hoạt tính năng kiểm soát lớp học của Giảng viên (Host) qua LiveKit Server SDK.

#### 2. Đặc tả API
- **URL**: `POST /api/livekit/rooms/:roomName/participants/:identity/mute`
- **Quyền**: `@Roles(Role.ADMIN)`
- **Request Body**:
  ```json
  {
    "trackSid": "TR_AMPA_123456",
    "muted": true
  }
  ```
- **Xử lý Backend**:
  - Gọi `RoomServiceClient.mutePublishedTrack(roomName, identity, trackSid, muted)`.
- **Danh mục Mã Lỗi Cụ Thể**:
  | Mã Lỗi (`errorCode`) | Tình Huống Kích Hoạt | HTTP Status | Thông Báo Trả Về |
  |---|---|---|---|
  | `LIVEKIT_PARTICIPANT_NOT_FOUND` | Học viên đã thoát phòng khi bấm Mute | `404 Not Found` | Học viên không còn hiện diện trong phòng học trực tuyến. |
  | `LIVEKIT_MUTE_ACTION_FAILED` | Máy chủ SFU không thể ngắt âm thanh | `500 Server Error` | Máy chủ SFU LiveKit gặp sự cố khi ngắt âm thanh học viên. |

#### 3. Kế hoạch thay đổi Frontend
- Trong [classroom-container.tsx](file:///d:/englishweb/client/src/components/classroom/classroom-container.tsx): Tại danh sách thành viên (Participant List), thêm nút icon Microphone có gạch chéo đỏ cho Giảng viên. Khi click, gọi API này và hiển thị Toast thành công.

---

### 2.5. Phân hệ Quản Trị: API Upload Video Bài Giảng & Phát Thông Báo Broadcast

#### 1. API Upload Video Bài Giảng: `POST /api/lessons/:id/upload-video`
- **Content-Type**: `multipart/form-data` (trường `file`)
- **Mã Lỗi**:
  - `LESSON_VIDEO_INVALID_FORMAT` (`415`): Video không phải định dạng mp4, webm, mov.
  - `LESSON_VIDEO_UPLOAD_FAILED` (`500`): Lỗi khi lưu trữ file video.

#### 2. API Phát Thông Báo Broadcast: `POST /api/notifications/broadcast`
- **Quyền**: `@Roles(Role.ADMIN)`
- **Body**: `{ title: string, content: string, type: 'SYSTEM' | 'LIVE' | 'QUIZ' }`
- **Mã Lỗi**:
  - `NOTIFICATION_PAYLOAD_INVALID` (`400`): Tiêu đề hoặc nội dung thông báo bị để trống.

---

## PHẦN 3: BẢNG TRA CỨU TOÀN BỘ MÃ LỖI ĐỊNH DANH CỤ THỂ (MASTER ERROR CODES CATALOG)

Dưới đây là bộ mã lỗi cụ thể được chuẩn hóa toàn bộ dự án theo cấu trúc: `<MODULE>_<ACTION>_<REASON>`:

### 1. Phân hệ Xác Thực & Phiên Làm Việc (`AUTH_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | Sai email hoặc sai mật khẩu | `401 Unauthorized` | Email hoặc mật khẩu không chính xác. |
| `AUTH_ACCOUNT_DEACTIVATED` | Tài khoản bị Admin khóa (`isActive: false`) | `403 Forbidden` | Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Thầy Đông để được hỗ trợ. |
| `AUTH_SESSION_TERMINATED` | Tài khoản học viên bị đăng nhập đè từ thiết bị khác | `401 Unauthorized` | Phiên đăng nhập đã bị hủy do có lượt đăng nhập mới trên thiết bị khác. |
| `AUTH_TOKEN_EXPIRED` | Access Token hoặc Refresh Token đã hết hạn | `401 Unauthorized` | Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại. |
| `AUTH_TOKEN_INVALID` | Token không đúng định dạng JWT hoặc sai chữ ký | `401 Unauthorized` | Mã xác thực không hợp lệ hoặc đã bị can thiệp. |
| `AUTH_EMAIL_ALREADY_EXISTS` | Đăng ký hoặc tạo học viên với email trùng | `409 Conflict` | Địa chỉ email này đã được sử dụng trên hệ thống. |
| `AUTH_EMAIL_NOT_FOUND` | Quên mật khẩu nhưng email không có trong hệ thống | `404 Not Found` | Không tìm thấy tài khoản học viên nào liên kết với email này. |
| `AUTH_RESET_TOKEN_EXPIRED` | Token trong link đổi mật khẩu qua email bị quá hạn/sai | `400 Bad Request` | Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. |
| `AUTH_WEAK_PASSWORD` | Mật khẩu mới không đạt chuẩn bảo mật (<8 ký tự) | `400 Bad Request` | Mật khẩu phải có tối thiểu 8 ký tự, gồm cả chữ hoa, chữ thường và chữ số. |
| `AUTH_GOOGLE_TOKEN_INVALID` | Token Google OAuth gửi lên không thể xác thực | `401 Unauthorized` | Xác thực tài khoản Google không thành công. Vui lòng thử lại. |
| `AUTH_GOOGLE_ALREADY_LINKED` | Tài khoản Google này đã liên kết với tài khoản khác | `409 Conflict` | Tài khoản Google này đã được liên kết với một học viên khác. |

---

### 2. Phân hệ Thư Viện Số & Tải File Học Liệu (`MATERIAL_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `MATERIAL_FILE_PAYLOAD_MISSING` | Modal tải học liệu không đính kèm file nhị phân | `400 Bad Request` | Vui lòng chọn tệp tin PDF hoặc MP3 từ máy tính để tải lên. |
| `MATERIAL_FILE_SIZE_EXCEEDED` | File PDF > 50MB hoặc File MP3 > 100MB | `413 Payload Too Large` | Dung lượng tệp tin vượt quá giới hạn (PDF tối đa 50MB, Audio tối đa 100MB). |
| `MATERIAL_INVALID_MIME_TYPE` | Chọn file không phải PDF, MP3, WAV, M4A | `415 Unsupported Media` | Định dạng tệp không hợp lệ. Hệ thống chỉ hỗ trợ .pdf, .mp3, .wav, .m4a. |
| `MATERIAL_NOT_FOUND` | Không tìm thấy tài liệu theo ID | `404 Not Found` | Không tìm thấy học liệu yêu cầu trong hệ thống. |
| `MATERIAL_SIGNED_URL_EXPIRED` | Signed URL xem tài liệu đã quá hạn 15 phút | `401 Unauthorized` | Liên kết xem tài liệu bảo mật đã hết hạn. Vui lòng làm mới trang. |
| `MATERIAL_PHYSICAL_FILE_MISSING` | File trong database có nhưng trên ổ đĩa bị mất | `404 Not Found` | Tệp tin học liệu gốc không tồn tại trên hệ thống lưu trữ máy chủ. |
| `MATERIAL_ACCESS_DENIED` | Học viên chưa đăng ký khóa học chứa tài liệu | `403 Forbidden` | Bạn chưa đăng ký khóa học này để truy cập tài liệu giáo trình. |

---

### 3. Phân hệ Khóa Học & Bài Học LMS (`COURSE_*` & `LESSON_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `COURSE_NOT_FOUND` | Không tìm thấy khóa học theo ID / Slug | `404 Not Found` | Khóa học không tồn tại hoặc đã bị xóa. |
| `COURSE_SLUG_CONFLICT` | Tiêu đề khóa học tạo slug trùng lặp | `409 Conflict` | Đường dẫn khóa học (slug) đã tồn tại. Vui lòng đổi tiêu đề khác. |
| `MODULE_NOT_FOUND` | Không tìm thấy chương học theo ID | `404 Not Found` | Không tìm thấy chương học yêu cầu. |
| `LESSON_NOT_FOUND` | Không tìm thấy bài học theo ID | `404 Not Found` | Bài học không tồn tại trong giáo trình. |
| `LESSON_LOCKED_CHECKPOINT` | Bài học bị khóa do chưa đạt sàn điểm Checkpoint $\ge 80\%$ | `403 Forbidden` | Bài học đang bị khóa. Bạn cần đạt tối thiểu 80% bài kiểm tra trước đó để mở. |
| `LESSON_VIDEO_INVALID_FORMAT` | File video upload không phải mp4, webm, mov | `415 Unsupported Media` | Định dạng video bài giảng không hợp lệ. Chỉ chấp nhận .mp4, .webm, .mov. |
| `LESSON_VIDEO_UPLOAD_FAILED` | Lưu trữ file video bài giảng lên máy chủ thất bại | `500 Server Error` | Quá trình tải lên video bài giảng gặp sự cố. Vui lòng thử lại. |
| `CURRICULUM_REORDER_FAILED` | Sắp xếp lại thứ tự bài học bị trùng index | `400 Bad Request` | Thứ tự sắp xếp giáo trình không hợp lệ hoặc trùng lặp. |

---

### 4. Phân hệ Lớp Học Trực Tuyến LiveKit & Bảng Vẽ (`LIVEKIT_*` & `WHITEBOARD_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `LIVEKIT_ROOM_NOT_FOUND` | Phòng học không tồn tại hoặc đã bị đóng | `404 Not Found` | Phòng học trực tuyến không tồn tại hoặc đã kết thúc. |
| `LIVEKIT_TOKEN_GENERATION_FAILED` | Sinh Access Token phòng học bị lỗi | `500 Server Error` | Không thể cấp mã truy cập phòng học LiveKit. Vui lòng thử lại. |
| `LIVEKIT_PARTICIPANT_NOT_FOUND` | Host muốn mute học viên nhưng học viên đã thoát phòng | `404 Not Found` | Học viên không còn hiện diện trong phòng học. |
| `LIVEKIT_MUTE_ACTION_FAILED` | SFU từ chối lệnh ngắt track âm thanh | `500 Server Error` | Máy chủ SFU không thể ngắt âm thanh của học viên. |
| `LIVEKIT_WEBHOOK_UNAUTHORIZED` | Chữ ký HMAC SHA-256 của Webhook bị sai | `401 Unauthorized` | Chữ ký xác thực LiveKit Webhook không hợp lệ. |
| `WHITEBOARD_SESSION_INACTIVE` | Bảng vẽ chưa được host mở quyền vẽ | `403 Forbidden` | Bảng vẽ tương tác hiện đang ở chế độ chỉ đọc. |

---

### 5. Phân hệ Luyện Viết IELTS Writing AI (`WRITING_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `WRITING_PROMPT_NOT_FOUND` | Đề bài viết không tồn tại | `404 Not Found` | Không tìm thấy đề bài luyện viết IELTS yêu cầu. |
| `WRITING_WORD_COUNT_INSUFFICIENT` | Số từ bài nộp quá ngắn (< 50 từ) không đủ chấm | `400 Bad Request` | Bài viết của bạn quá ngắn (tối thiểu 50 từ) để AI phân tích 4 tiêu chí. |
| `WRITING_SUBMISSION_NOT_FOUND` | Bài nộp của học viên không tồn tại | `404 Not Found` | Không tìm thấy bài làm văn của học viên. |
| `WRITING_ALREADY_APPROVED` | Giáo viên đã duyệt bài, không cho sửa đè | `409 Conflict` | Bài viết này đã được giáo viên phê duyệt kết quả chính thức. |
| `WRITING_AI_EVALUATION_FAILED` | Gọi Gemini API bị lỗi và Heuristic fallback lỗi | `500 Server Error` | Hệ thống AI chấm bài đang bận. Bài nộp đã được lưu, vui lòng thử lại sau. |

---

### 6. Phân hệ Studio Luyện Nói IELTS Speaking (`SPEAKING_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `SPEAKING_PROMPT_NOT_FOUND` | Đề bài nói Part 1/2/3 không tìm thấy | `404 Not Found` | Không tìm thấy đề bài luyện nói IELTS yêu cầu. |
| `SPEAKING_AUDIO_EMPTY` | Nộp bài thu âm nhưng không có dữ liệu âm thanh | `400 Bad Request` | Bản ghi âm trống hoặc chưa được thu âm thành công. |
| `SPEAKING_DURATION_TOO_SHORT` | Thời gian nói < 10 giây | `400 Bad Request` | Thời lượng bài nói quá ngắn (tối thiểu 10 giây). Vui lòng nói dài hơn. |
| `SPEAKING_AUDIO_FORMAT_INVALID` | Định dạng file âm thanh không phải webm, mp3, wav | `415 Unsupported Media` | Định dạng bản ghi âm không được hỗ trợ. |
| `SPEAKING_SUBMISSION_NOT_FOUND` | Không tìm thấy bản ghi âm cần chấm điểm | `404 Not Found` | Không tìm thấy bài nói cần chấm điểm. |
| `SPEAKING_BAND_SCORE_INVALID` | Điểm chấm không nằm trong dải 0.0 - 9.0 bước nhảy 0.5 | `400 Bad Request` | Điểm số các tiêu chí IELTS Speaking phải từ 0.0 đến 9.0 với bước nhảy 0.5. |

---

### 7. Phân hệ Bài Tập & Thi Thử Quiz (`QUIZ_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `QUIZ_NOT_FOUND` | Bài trắc nghiệm không tồn tại | `404 Not Found` | Không tìm thấy bài tập trắc nghiệm yêu cầu. |
| `QUIZ_QUESTION_NOT_FOUND` | Câu hỏi trong bài thi không tìm thấy | `404 Not Found` | Không tìm thấy câu hỏi tương ứng. |
| `QUIZ_ALREADY_SUBMITTED` | Bài thi chỉ cho phép nộp 1 lần trong phiên | `400 Bad Request` | Bạn đã nộp bài thi này rồi. |
| `QUIZ_EMPTY_ANSWERS` | Nộp bài nhưng chưa chọn bất kỳ đáp án nào | `400 Bad Request` | Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài. |
| `QUIZ_PREREQUISITE_FAILED` | Điểm thi đạt < 80%, không mở khóa bài tiếp theo | `400 Bad Request` | Bạn đạt dưới 80% điểm sàn yêu cầu. Vui lòng ôn tập và thi lại để mở khóa bài học. |

---

### 8. Phân hệ Điểm Danh & Chuyên Cần (`ATTENDANCE_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `ATTENDANCE_RECORD_NOT_FOUND` | Bản ghi điểm danh không tồn tại | `404 Not Found` | Không tìm thấy dữ liệu điểm danh yêu cầu. |
| `ATTENDANCE_USER_RECORD_EMPTY` | Học viên chưa có buổi học nào trong lớp | `404 Not Found` | Học viên chưa có lịch sử tham gia lớp học trực tuyến nào. |
| `ATTENDANCE_DATE_RANGE_INVALID` | Ngày bắt đầu lớn hơn ngày kết thúc khi xuất Excel | `400 Bad Request` | Khoảng thời gian xuất báo cáo điểm danh không hợp lệ. |
| `ATTENDANCE_STATUS_INVALID` | Trạng thái không phải PRESENT, LATE, ABSENT | `400 Bad Request` | Trạng thái chuyên cần chỉ chấp nhận PRESENT, LATE hoặc ABSENT. |

---

### 9. Phân hệ Thông Báo & Tin Nhắn Realtime (`NOTIFICATION_*` & `CHAT_*`)
| Mã Lỗi Cụ Thể (`errorCode`) | Tình Huống / Nguyên Nhân | HTTP Status | Thông Báo Chuẩn |
|---|---|---|---|
| `NOTIFICATION_PAYLOAD_INVALID` | Tiêu đề hoặc nội dung thông báo broadcast bị rỗng | `400 Bad Request` | Tiêu đề và nội dung thông báo không được để trống. |
| `NOTIFICATION_NOT_FOUND` | Thông báo cần đánh dấu đọc không tồn tại | `404 Not Found` | Thông báo không tồn tại trong hộp thư. |
| `CHAT_CONVERSATION_NOT_FOUND` | Cuộc hội thoại giữa Admin và Học viên không tồn tại | `404 Not Found` | Không tìm thấy đoạn hội thoại yêu cầu. |
| `CHAT_MESSAGE_EMPTY` | Gửi tin nhắn có nội dung rỗng hoặc toàn khoảng trắng | `400 Bad Request` | Nội dung tin nhắn không được để trống. |
| `CHAT_UNAUTHORIZED_PARTICIPANT` | Học viên cố ý đọc trộm tin nhắn của học viên khác | `403 Forbidden` | Bạn không có quyền truy cập vào đoạn hội thoại này. |

---

## PHẦN 4: KIẾN TRÚC & MÃ NGUỒN TRIỂN KHAI KỸ THUẬT (BACKEND & FRONTEND)

### 1. File Enum Mã Lỗi: `server/src/core/common/errors/error-codes.enum.ts`
```typescript
export enum AppErrorCode {
  // Auth
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_ACCOUNT_DEACTIVATED = 'AUTH_ACCOUNT_DEACTIVATED',
  AUTH_SESSION_TERMINATED = 'AUTH_SESSION_TERMINATED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_EMAIL_NOT_FOUND = 'AUTH_EMAIL_NOT_FOUND',
  AUTH_RESET_TOKEN_EXPIRED = 'AUTH_RESET_TOKEN_EXPIRED',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_GOOGLE_TOKEN_INVALID = 'AUTH_GOOGLE_TOKEN_INVALID',
  AUTH_GOOGLE_ALREADY_LINKED = 'AUTH_GOOGLE_ALREADY_LINKED',

  // Materials
  MATERIAL_FILE_PAYLOAD_MISSING = 'MATERIAL_FILE_PAYLOAD_MISSING',
  MATERIAL_FILE_SIZE_EXCEEDED = 'MATERIAL_FILE_SIZE_EXCEEDED',
  MATERIAL_INVALID_MIME_TYPE = 'MATERIAL_INVALID_MIME_TYPE',
  MATERIAL_NOT_FOUND = 'MATERIAL_NOT_FOUND',
  MATERIAL_SIGNED_URL_EXPIRED = 'MATERIAL_SIGNED_URL_EXPIRED',
  MATERIAL_PHYSICAL_FILE_MISSING = 'MATERIAL_PHYSICAL_FILE_MISSING',
  MATERIAL_ACCESS_DENIED = 'MATERIAL_ACCESS_DENIED',

  // Courses & Lessons
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  COURSE_SLUG_CONFLICT = 'COURSE_SLUG_CONFLICT',
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  LESSON_LOCKED_CHECKPOINT = 'LESSON_LOCKED_CHECKPOINT',
  LESSON_VIDEO_INVALID_FORMAT = 'LESSON_VIDEO_INVALID_FORMAT',
  LESSON_VIDEO_UPLOAD_FAILED = 'LESSON_VIDEO_UPLOAD_FAILED',
  CURRICULUM_REORDER_FAILED = 'CURRICULUM_REORDER_FAILED',

  // LiveKit & Whiteboard
  LIVEKIT_ROOM_NOT_FOUND = 'LIVEKIT_ROOM_NOT_FOUND',
  LIVEKIT_TOKEN_GENERATION_FAILED = 'LIVEKIT_TOKEN_GENERATION_FAILED',
  LIVEKIT_PARTICIPANT_NOT_FOUND = 'LIVEKIT_PARTICIPANT_NOT_FOUND',
  LIVEKIT_MUTE_ACTION_FAILED = 'LIVEKIT_MUTE_ACTION_FAILED',
  LIVEKIT_WEBHOOK_UNAUTHORIZED = 'LIVEKIT_WEBHOOK_UNAUTHORIZED',
  WHITEBOARD_SESSION_INACTIVE = 'WHITEBOARD_SESSION_INACTIVE',

  // Writing
  WRITING_PROMPT_NOT_FOUND = 'WRITING_PROMPT_NOT_FOUND',
  WRITING_WORD_COUNT_INSUFFICIENT = 'WRITING_WORD_COUNT_INSUFFICIENT',
  WRITING_SUBMISSION_NOT_FOUND = 'WRITING_SUBMISSION_NOT_FOUND',
  WRITING_ALREADY_APPROVED = 'WRITING_ALREADY_APPROVED',
  WRITING_AI_EVALUATION_FAILED = 'WRITING_AI_EVALUATION_FAILED',

  // Speaking
  SPEAKING_PROMPT_NOT_FOUND = 'SPEAKING_PROMPT_NOT_FOUND',
  SPEAKING_AUDIO_EMPTY = 'SPEAKING_AUDIO_EMPTY',
  SPEAKING_DURATION_TOO_SHORT = 'SPEAKING_DURATION_TOO_SHORT',
  SPEAKING_AUDIO_FORMAT_INVALID = 'SPEAKING_AUDIO_FORMAT_INVALID',
  SPEAKING_SUBMISSION_NOT_FOUND = 'SPEAKING_SUBMISSION_NOT_FOUND',
  SPEAKING_BAND_SCORE_INVALID = 'SPEAKING_BAND_SCORE_INVALID',

  // Quiz
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  QUIZ_QUESTION_NOT_FOUND = 'QUIZ_QUESTION_NOT_FOUND',
  QUIZ_ALREADY_SUBMITTED = 'QUIZ_ALREADY_SUBMITTED',
  QUIZ_EMPTY_ANSWERS = 'QUIZ_EMPTY_ANSWERS',
  QUIZ_PREREQUISITE_FAILED = 'QUIZ_PREREQUISITE_FAILED',

  // Attendance
  ATTENDANCE_RECORD_NOT_FOUND = 'ATTENDANCE_RECORD_NOT_FOUND',
  ATTENDANCE_USER_RECORD_EMPTY = 'ATTENDANCE_USER_RECORD_EMPTY',
  ATTENDANCE_DATE_RANGE_INVALID = 'ATTENDANCE_DATE_RANGE_INVALID',
  ATTENDANCE_STATUS_INVALID = 'ATTENDANCE_STATUS_INVALID',

  // Notifications & Chat
  NOTIFICATION_PAYLOAD_INVALID = 'NOTIFICATION_PAYLOAD_INVALID',
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',
  CHAT_CONVERSATION_NOT_FOUND = 'CHAT_CONVERSATION_NOT_FOUND',
  CHAT_MESSAGE_EMPTY = 'CHAT_MESSAGE_EMPTY',
  CHAT_UNAUTHORIZED_PARTICIPANT = 'CHAT_UNAUTHORIZED_PARTICIPANT',

  // Generic
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
```

### 2. File Lớp Ngoại Lệ Nghiệp Vụ: `server/src/core/common/errors/app.exception.ts`
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';
import { AppErrorCode } from './error-codes.enum';

export class AppException extends HttpException {
  public readonly errorCode: AppErrorCode;

  constructor(errorCode: AppErrorCode, message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ errorCode, message }, status);
    this.errorCode = errorCode;
  }

  static badRequest(errorCode: AppErrorCode, message: string) {
    return new AppException(errorCode, message, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(errorCode: AppErrorCode, message: string) {
    return new AppException(errorCode, message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(errorCode: AppErrorCode, message: string) {
    return new AppException(errorCode, message, HttpStatus.FORBIDDEN);
  }

  static notFound(errorCode: AppErrorCode, message: string) {
    return new AppException(errorCode, message, HttpStatus.NOT_FOUND);
  }

  static conflict(errorCode: AppErrorCode, message: string) {
    return new AppException(errorCode, message, HttpStatus.CONFLICT);
  }

  static payloadTooLarge(errorCode: AppErrorCode, message: string) {
    return new AppException(errorCode, message, HttpStatus.PAYLOAD_TOO_LARGE);
  }

  static unsupportedMediaType(errorCode: AppErrorCode, message: string) {
    return new AppException(errorCode, message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}
```

### 3. File Bắt Lỗi Phía Frontend: `client/src/lib/api-error.ts`
```typescript
import { toast } from '@/components/ui/toast';

export interface ApiErrorPayload {
  success: boolean;
  statusCode: number;
  errorCode: string;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

export function handleApiError(err: unknown, fallbackMessage: string = 'Đã có lỗi xảy ra'): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: ApiErrorPayload } };
    const data = axiosErr.response?.data;
    if (data && data.errorCode) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      toast.error(msg || fallbackMessage);
      return data.errorCode;
    }
  }
  toast.error(fallbackMessage);
  return 'UNKNOWN_ERROR';
}
```

---

## PHẦN 5: LỘ TRÌNH TRIỂN KHAI THỰC TẾ TỪNG BƯỚC (EXECUTION ROADMAP)

```
                    QUY TRÌNH THỰC THI 4 BƯỚC
                    
  BƯỚC 1: XÂY DỰNG NỀN TẢNG MÃ LỖI (FOUNDATION)
  ├── 1.1. Tạo error-codes.enum.ts và app.exception.ts tại server/src/core/common/errors/
  ├── 1.2. Nâng cấp AllExceptionsFilter nhận diện AppErrorCode ưu tiên
  └── 1.3. Tạo client/src/lib/api-error.ts phía Frontend

  BƯỚC 2: NÂNG CẤP API THƯ VIỆN SỐ (MATERIALS UPLOAD)
  ├── 2.1. Viết endpoint POST /api/materials/upload nhận multipart file, lưu private_storage
  ├── 2.2. Áp dụng mã lỗi MATERIAL_FILE_PAYLOAD_MISSING, SIZE_EXCEEDED, INVALID_MIME_TYPE
  └── 2.3. Sửa Modal #materialModal ở admin/library: Thêm File Dropzone kéo-thả file thật

  BƯỚC 3: HOÀN THIỆN LUỒNG QUÊN MẬT KHẨU & HỌC BÀI LMS
  ├── 3.1. Viết 2 API /api/auth/forgot-password và /api/auth/reset-password kèm mã lỗi AUTH_*
  ├── 3.2. Dựng trang Frontend /forgot-password và /reset-password
  └── 3.3. Viết API GET /lessons/:id/study và dựng trang xem bài học chi tiết cho học viên

  BƯỚC 4: LIVEKIT MUTE, WHITEBOARD SOCKET & KIỂM THỬ E2E
  ├── 4.1. Nối nút Host Mute học viên trong phòng LiveKit (bắt LIVEKIT_PARTICIPANT_NOT_FOUND)
  ├── 4.2. Kích hoạt Socket Whiteboard dự phòng khi WebRTC mất kết nối
  └── 4.3. Chạy toàn bộ 177+ test E2E server và 31+ test E2E client xác nhận PASS 100%
```

Bản kế hoạch này kết hợp hoàn chỉnh cả hai khía cạnh: **Đặc tả thay đổi kỹ thuật của từng API** và **Danh mục Mã lỗi định danh chi tiết cho từng trường hợp**, sẵn sàng để lập trình viên bắt tay vào thực thi ngay lập tức.
