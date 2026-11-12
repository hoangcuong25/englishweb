# BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS, TỔNG HỢP KẾT NỐI API & ĐỀ XUẤT NÂNG CẤP TRẢI NGHIỆM
**Dự án**: Teacher Dong Academy (LMS & WebRTC In-house EdTech Platform)  
**Tài liệu tham chiếu**: `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md`, `docs/SRS.md`, `docs/mock_test.html`  
**Ngày cập nhật**: 11/11/2026  

---

## MỤC LỤC
1. [BẢNG TỔNG HỢP KẾT NỐI API GIỮA BACKEND & FRONTEND](#1-bảng-tổng-hợp-kết-nối-api-giữa-backend--frontend)
   - 1.1. Các phân hệ đã kết nối hoàn chỉnh (BE ↔ FE)
   - 1.2. BE đã xây dựng API nhưng FE chưa kết nối (Đang dùng dữ liệu tĩnh Mock/Local State)
   - 1.3. Danh Mục Chi Tiết Các API Cần Thêm & Còn Thiếu So Với Tài Liệu SRS (Phạm Vi, Mô Tả & Cách Triển Khai)
     - 1.3.1. Phân hệ Thông Báo Thời Gian Thực (Notifications System - FR-10 & Topbar UI)
     - 1.3.2. Phân hệ Quản Lý Học Viên - Admin Tạo Tài Khoản Thủ Công (Users Management - ADM-REQ-001)
     - 1.3.3. Phân hệ Kho Học Liệu Số Toàn Hệ Thống (Digital Library - FR-04 & LIB-SCR-001/002)
     - 1.3.4. Phân hệ Ngân Hàng Đề Thi & Quản Trị Quiz (Quiz Engine - FR-08 & QZ-SCR-004)
     - 1.3.5. Phân hệ Tự Động Lưu Bản Nháp Bài Viết (Writing Auto-Save Drafts - WR-REQ-002)
     - 1.3.6. Phân hệ Upload File Âm Thanh Bài Nói Speaking Lên Cloudinary (Speaking Audio Storage - SPK-REQ-002)
     - 1.3.7. Phân hệ Xuất Báo Cáo Chuyên Cần Theo Khoảng Thời Gian (Attendance Date-Range Export - ATT-REQ-005)
   - 1.4. Các API BE nâng cao đã sẵn sàng nhưng chưa có màn hình giao diện FE
2. [BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS & ĐỀ XUẤT NÂNG CẤP TRẢI NGHIỆM](#2-báo-cáo-đối-chiếu-hệ-thống-với-srs--đề-xuất-nâng-cấp-trải-nghiệm)
   - 2.1. Phân hệ Luyện Viết AI IELTS Writing Studio (`WR-SCR-001` → `003`)
   - 2.2. Phân hệ Luyện Nói IELTS Speaking Studio (`SPK-SCR-001` → `003`)
   - 2.3. Kho Học Liệu Số & Bảo Mật Chống Quay Chụp (`LIB-SCR-001` → `003`)
   - 2.4. LMS Course Engine & Quản Lý Tiến Trình Bài Học (`CRS-SCR-001` → `004`)
   - 2.5. Hệ Thống Thi Trắc Nghiệm Quiz Engine & Xử Lý Bài Đọc Reading (`QZ-SCR-001` → `005`)
     - 2.5.1. Kiến Trúc Dữ Liệu & Quy Trình Xử Lý Quiz ở Backend
     - 2.5.2. Cách Xử Lý Bài Đọc (Reading Passage) Kèm Nhiều Câu Hỏi Con
     - 2.5.3. Trải Nghiệm Làm Bài Trực Tuyến & Hiển Thị Đề Thi 1 Trong 4 Đáp Án
     - 2.5.4. Đề Xuất Nâng Cấp Hoàn Thiện Trải Nghiệm (UX Action Plan)
   - 2.6. Điểm Danh Tự Động & Báo Cáo Chuyên Cần (`ATT-SCR-001` → `003`)
   - 2.7. Kênh Nhắn Tin Hỗ Trợ Trực Tuyến Thời Gian Thực (`MSG-SCR-001`)
   - 2.8. Quản Lý Tài Khoản, Học Viên & Phiên Đơn Concurrent Session (`AUTH-SCR-004, 005`, `ADM-SCR-002`)
3. [LỘ TRÌNH TRIỂN KHAI VÀ THỰC THI ĐỒNG BỘ](#3-lộ-trình-triển-khai-và-thực-thi-đồng-bộ)

---

# 1. BẢNG TỔNG HỢP KẾT NỐI API GIỮA BACKEND & FRONTEND

Hệ thống mã nguồn hiện tại được phân tích đối chiếu giữa **Backend NestJS (`server/src`)** và **Frontend Next.js (`client/src`)**:

### 1.1. Các phân hệ đã kết nối hoàn chỉnh (BE ↔ FE)

| Phân hệ | API Backend Controller | Service Frontend | Tình trạng kiểm tra thực tế |
|:---|:---|:---|:---|
| **Xác thực & Phiên (Auth & Session)** | `auth.controller.ts`<br>`@Post('login')`<br>`@Post('register')`<br>`@Get('me')`<br>`@Get('sessions')`<br>`@Delete('sessions/:id')`<br>`@Post('logout')` | `client/src/services/auth.service.ts` | **ĐÃ KẾT NỐI 100%**: Lưu JWT Bearer qua HttpOnly + LocalStorage, Drawer xem danh sách phiên và chấm dứt phiên từ xa (`handleRevokeOne`, `handleRevokeAllOther`) hoạt động với BE. |
| **Lớp học WebRTC LiveKit** | `livekit.controller.ts`<br>`@Get('rooms')`<br>`@Post('rooms')`<br>`@Post('token')`<br>`@Post('end-room')`<br>`@Post('mute-participant')`<br>`@Get('rooms/:name/whiteboard')`<br>`@Post('rooms/:name/whiteboard/stroke')` | `client/src/services/livekit.service.ts` | **ĐÃ KẾT NỐI 100%**: Tạo phòng học, cấp token phân quyền Host/Student, kết nối SFU, đồng bộ nét vẽ bảng trắng REST & Data Channel. |
| **Điểm danh & Chuyên cần (Attendance)** | `attendance.controller.ts`<br>`@Get('classrooms')`<br>`@Post('classrooms')`<br>`@Get('classroom/:id')`<br>`@Get('my')`<br>`@Put(':id/override')`<br>`@Get('classroom/:id/export')` | `client/src/services/attendance.service.ts` | **ĐÃ KẾT NỐI 100%**: Tính phút tham gia, Admin sửa trạng thái điểm danh kèm ghi chú (Audit Note), xuất báo cáo file Excel (.xlsx) tải về trực tiếp từ Backend. |
| **Bảng điều khiển (Dashboard)** | `dashboard.controller.ts`<br>`@Get('student')`<br>`@Get('admin')` | `client/src/services/dashboard.service.ts` | **ĐÃ KẾT NỐI 100%**: Dữ liệu số liệu tổng quan của Student & Admin tải động từ Prisma Database. |
| **Luyện viết AI (Writing)** | `writing.controller.ts`<br>`@Get('prompts')`<br>`@Post('submissions')`<br>`@Get('admin/submissions')`<br>`@Post('admin/submissions/:id/approve')` | `client/src/services/writing.service.ts` | **ĐÃ KẾT NỐI 100%**: Lấy đề thi, nộp bài kích hoạt AI chấm 4 tiêu chí (TR, CC, LR, GRA) và Admin duyệt bài nộp. |
| **Luyện nói (Speaking)** | `speaking.controller.ts`<br>`@Get('prompts')`<br>`@Post('submissions')`<br>`@Get('admin/submissions')`<br>`@Post('admin/submissions/:id/grade')` | `client/src/services/speaking.service.ts` | **ĐÃ KẾT NỐI 100%**: Học viên gửi bản ghi âm, Admin nghe lại và chấm 4 tiêu chí (FC, LR, GRA, PR). |
| **Tin tức / Blogs** | `blogs.controller.ts`<br>`@Get()`, `@Get(':slugOrId')`, `@Post()`, `@Put(':id')`, `@Delete(':id')` | `client/src/services/blogs.service.ts` | **ĐÃ KẾT NỐI 100%**: CRUD bài viết blog tin tức đầy đủ. |

---

### 1.2. BE đã xây dựng API nhưng FE chưa kết nối (Đang dùng dữ liệu tĩnh Mock/Local State)

| STT | Phân hệ & Màn hình FE | API Backend đã có sẵn | Hiện trạng tại Frontend | Giải pháp đồng bộ |
|:---:|:---|:---|:---|:---|
| **1** | **Quản lý học viên**<br>`client/src/app/(admin)/admin/users/page.tsx` | `users.controller.ts`:<br>• `@Get('/users')` (lọc role, search, pagination)<br>• `@Put('/users/:id/status')` (khóa/mở khóa)<br>• `@Put('/users/:id/reset-password')` | File `services/users.service.ts` đã có hàm, nhưng `admin/users/page.tsx` **chưa gọi service**, đang dùng `useState` cứng với 3 học sinh mẫu ("Trần Văn Nam", "Lê Thị Mai", "Nguyễn Tiến Dũng"). | Nối `useEffect` gọi `usersService.getUsers()`, bấm Khóa/Mở khóa gọi `usersService.toggleUserStatus()`. |
| **2** | **Tin nhắn & Chat**<br>`student/messages/page.tsx`<br>`admin/messages/page.tsx` | `chat.controller.ts`:<br>• `@Get('conversations')`<br>• `@Get('conversations/:id/messages')`<br>• `@Post('conversations/:id/messages')`<br>• `@Put('conversations/:id/read')`<br>Kèm WebSocket Gateway `chat.gateway.ts`. | FE **chưa có `chat.service.ts`**. Cả 2 trang của Học sinh và Admin đang dùng mảng tin nhắn cục bộ và giả lập tin nhắn phản hồi bằng `setTimeout(..., 2000)`. | Xây dựng `chat.service.ts`, kết nối REST API lấy danh sách hội thoại và Socket.IO client để nhắn tin 2 chiều tức thì. |
| **3** | **Đổi mật khẩu tài khoản**<br>`student/account/page.tsx`<br>`admin/account/page.tsx` | `auth.controller.ts`:<br>• `@Post('change-password')`<br>(nhận `currentPassword`, `newPassword`, mã hóa Bcrypt và thu hồi các phiên đăng nhập khác). | Trong `auth.service.ts` đã có `changePassword()`, nhưng sự kiện submit form `handleChangePassword()` ở cả 2 trang tài khoản chỉ gọi `setNotice('Đổi mật khẩu thành công')` mà **không gọi API BE**. | Gọi `await authService.changePassword({ currentPassword, newPassword })` trong sự kiện submit, bắt lỗi sai mật khẩu cũ từ BE. |
| **4** | **Quản lý ngân hàng Quiz**<br>`client/src/app/(admin)/admin/quizzes/page.tsx` | `quizzes.controller.ts`:<br>• `@Post('/quizzes')`<br>• `@Post('/quizzes/:id/questions')`<br>• `@Delete('/quizzes/:id')` | Trang `admin/quizzes/page.tsx` dùng mảng `useState` cục bộ với 2 câu hỏi mẫu, thêm câu hỏi chỉ cập nhật React state trong máy. | Bổ sung hàm `createQuiz` và `addQuestions` vào `quizzes.service.ts` và nối vào form thêm câu hỏi của Admin. |
| **5** | **Cây bài học theo Khóa học**<br>`client/src/app/(student)/student/courses/page.tsx` | `courses.controller.ts`:<br>• `@Get('/courses/:slugOrId')`<br>(trả về đầy đủ Course ➔ Modules ➔ Lessons ➔ Quizzes). | Trang `student/courses/page.tsx` mới lấy danh sách khóa học, còn danh sách các Module 01, 02, 03... đang gán cứng bằng mảng `MockModule[]`. | Gọi `coursesService.getCourseBySlug(courseId)` khi học viên bấm vào từng khóa học để nạp cây module thật từ DB. |
| **6** | **Quản lý đề thi Writing & Speaking** | `writing.controller.ts` & `speaking.controller.ts`:<br>• `@Post('/prompts')`<br>• `@Put('/prompts/:id')`<br>• `@Delete('/prompts/:id')` | Backend đã có đầy đủ API CRUD ngân hàng đề thi, nhưng Frontend Admin hiện mới chỉ có trang chấm bài (`admin/writing-review` và `admin/speaking-grading`), chưa có màn hình giao diện để Admin thêm/sửa/xóa đề bài. | Dựng trang quản trị ngân hàng đề thi hoặc tích hợp modal tạo đề thi mới cho Admin. |
| **7** | **Kéo-thả sắp xếp thứ tự Module & Bài học** | `lessons.controller.ts`:<br>• `@Post('/lessons/modules/reorder')`<br>• `@Post('/lessons/reorder')` | Backend đã hỗ trợ đổi thứ tự bài học và module, nhưng Frontend hiện đang hiển thị danh sách dạng bảng tĩnh, chưa tích hợp thư viện kéo thả (Drag-and-Drop). | Tích hợp tính năng kéo thả trên UI để gọi API reorder khi Admin sắp xếp giáo trình. |

---

### 1.3. Danh Mục Chi Tiết Các API Cần Thêm & Còn Thiếu So Với Tài Liệu SRS (Phạm Vi, Mô Tả & Cách Triển Khai)

Sau khi rà soát toàn bộ tài liệu đặc tả SRS (`docs/SRS.md`, `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md`), mã nguồn Backend NestJS (`server/src/modules/`) và mã nguồn Frontend Next.js (`client/src/`), dưới đây là bảng ma trận chi tiết các API còn thiếu kèm đầy đủ: **Phạm vi nghiệp vụ, Đặc tả Endpoint, Input/Output, Phân quyền RBAC và Cách triển khai kỹ thuật**:

---

#### 1.3.1. Phân hệ Thông Báo Thời Gian Thực (Notifications System - FR-10 & Topbar UI)
- **Vấn đề thực tế**: Frontend Topbar (`client/src/components/shared/app-topbar.tsx`) đã thiết kế hoàn chỉnh giao diện chuông báo, phân loại thông báo (Writing đã duyệt, Speaking cần chấm, LiveKit sắp diễn ra, Quiz đạt sàn) nhưng Backend **chưa có bảng Notification** và **chưa có bất kỳ API nào**.
- **Danh sách Endpoint cần bổ sung**:
  1. `GET /api/notifications`
     - **Mô tả**: Lấy danh sách thông báo của người dùng hiện tại (kèm phân trang, lọc theo trạng thái `isRead`).
     - **Quyền hạn (RBAC)**: `STUDENT`, `ADMIN`.
     - **Query Params**: `page?: number`, `limit?: number`, `unreadOnly?: boolean`.
     - **Response**: `{ items: NotificationItem[], total: number, unreadCount: number }`.
  2. `GET /api/notifications/unread-count`
     - **Mô tả**: Lấy nhanh số lượng thông báo chưa đọc để hiển thị chấm đỏ trên icon chuông Topbar mà không cần tải toàn bộ danh sách.
     - **Quyền hạn**: `STUDENT`, `ADMIN`.
     - **Response**: `{ unreadCount: number }`.
  3. `PUT /api/notifications/:id/read`
     - **Mô tả**: Đánh dấu 1 thông báo cụ thể là đã đọc (`isRead: true`).
     - **Quyền hạn**: `STUDENT`, `ADMIN`.
  4. `PUT /api/notifications/read-all`
     - **Mô tả**: Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc.
     - **Quyền hạn**: `STUDENT`, `ADMIN`.
  5. `DELETE /api/notifications/:id`
     - **Mô tả**: Xóa 1 thông báo khỏi danh sách.
     - **Quyền hạn**: `STUDENT`, `ADMIN`.
  6. `POST /api/notifications` (Internal Service API)
     - **Mô tả**: Hàm nghiệp vụ nội bộ `NotificationsService.createNotification(...)` tự động kích hoạt tạo thông báo khi:
       - Học viên nộp bài Writing / Speaking ➔ Tự động tạo thông báo gửi tới Admin.
       - Admin duyệt điểm bài Writing / Speaking ➔ Tự động tạo thông báo gửi tới Học viên nộp bài.
       - Học viên làm Quiz đạt $\ge 80\%$ ➔ Tạo thông báo chúc mừng mở khóa bài học kế tiếp.
       - Phòng học LiveKit được mở (`room.isLive = true`) ➔ Bắn thông báo nhắc học viên vào lớp.
- **Cách triển khai Backend**:
  - Thêm model `Notification` vào `server/prisma/schema.prisma`:
    ```prisma
    model Notification {
      id        String           @id @default(uuid())
      userId    String
      user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
      title     String
      content   String           @db.Text
      type      NotificationType @default(SYSTEM) // 'WRITING', 'SPEAKING', 'LIVE', 'QUIZ', 'SYSTEM'
      link      String?
      isRead    Boolean          @default(false)
      createdAt DateTime         @default(now())
      @@index([userId, isRead])
      @@map("notifications")
    }
    ```
  - Tạo module mới: `server/src/modules/notifications/` (`notifications.controller.ts`, `notifications.service.ts`, `notifications.module.ts`).

---

#### 1.3.2. Phân hệ Quản Lý Học Viên - Admin Tạo Tài Khoản Thủ Công (Users Management - ADM-REQ-001)
- **Vấn đề thực tế**: Trong trang Admin Quản lý học viên (`client/src/app/(admin)/admin/users/page.tsx`), có modal *"Thêm Học Viên Mới"* (`#addUserModal` gồm Họ tên, Email, Số điện thoại, Khóa học kích hoạt ngay, Target Band). Tuy nhiên Backend `users.controller.ts` **chỉ có API xem, khóa, đổi pass mà THIẾU API tạo học viên mới**.
- **Endpoint cần bổ sung**:
  - `POST /api/users`
    - **Mô tả**: Admin tạo trực tiếp tài khoản học viên, sinh mật khẩu mặc định (hoặc nhập mật khẩu), tự động kích hoạt ghi danh vào khóa học chỉ định (`enrolledCourseId`) và thiết lập mục tiêu Band điểm (`targetBand`).
    - **Quyền hạn**: `ADMIN`.
    - **Request Body (DTO)**:
      ```typescript
      {
        fullName: string;      // Họ và tên học viên
        email: string;         // Email đăng nhập duy nhất
        phone?: string;        // Số điện thoại (dùng để vẽ Dynamic Watermark)
        password?: string;     // Mật khẩu khởi tạo (nếu bỏ trống tự sinh "DongAcademy@2026")
        courseId?: string;     // Khóa học kích hoạt ghi danh ngay
        targetBand?: string;   // Mục tiêu: "6.5", "7.0", "7.5", "8.0+"
      }
      ```
    - **Response**: Trả về thông tin User vừa tạo kèm thông tin Enrollment tương ứng.
- **Cách triển khai Backend**:
  - Thêm phương thức `createStudent(dto: CreateUserDto)` trong `server/src/modules/users/users.service.ts`:
    - Băm mật khẩu bằng Bcrypt (`saltRounds = 10`).
    - Tạo `User` với role `Role.STUDENT`.
    - Nếu có `courseId`, tự động tạo bản ghi `Enrollment` liên kết `userId` với `courseId`.
  - Thêm `@Post()` trong `server/src/modules/users/users.controller.ts` bảo vệ bởi `JwtAuthGuard` và `Roles(Role.ADMIN)`.

---

#### 1.3.3. Phân hệ Kho Học Liệu Số Toàn Hệ Thống (Digital Library - FR-04 & LIB-SCR-001/002)
- **Vấn đề thực tế**: Hiện tại `materials.controller.ts` chỉ có `@Get('lesson/:lessonId')` (chỉ lấy tài liệu thuộc về một bài học cụ thể). Cả trang học viên (`/student/library`) và Admin (`/admin/library`) đều là màn hình Thư viện số độc lập, cần danh sách toàn bộ tài liệu PDF và Audio trong hệ thống để tìm kiếm và lọc, dẫn đến việc FE phải dùng mảng tĩnh.
- **Endpoint cần bổ sung**:
  - `GET /api/materials`
    - **Mô tả**: Lấy danh sách toàn bộ tài liệu số trong Thư viện số bảo mật (cho phép tìm kiếm, lọc theo loại file, lọc theo khóa học, phân trang).
    - **Quyền hạn**: `STUDENT`, `ADMIN` (Học viên chỉ thấy tài liệu thuộc các khóa học đã ghi danh hoặc tài liệu công khai).
    - **Query Params**:
      - `search?: string`: Tìm theo tên tài liệu hoặc mô tả.
      - `fileType?: 'PDF' | 'AUDIO_MP3'`: Lọc định dạng tài liệu.
      - `courseId?: string`: Lọc theo khóa học áp dụng.
      - `page?: number`, `limit?: number`: Phân trang dữ liệu.
    - **Response**: Danh sách `materials: Material[]`, `total: number`.
- **Cách triển khai Backend**:
  - Cập nhật `materials.service.ts`: Viết hàm `findAllMaterials(query, userId, userRole)`:
    - Nếu là `STUDENT`: Chỉ truy vấn các tài liệu thuộc khóa học mà học viên đã ghi danh (`Enrollment`) hoặc tài liệu có `isFreePreview: true`.
    - Nếu là `ADMIN`: Truy vấn tất cả tài liệu kèm thông tin khóa học trực thuộc.
  - Thêm route `@Get()` trong `materials.controller.ts`.

---

#### 1.3.4. Phân hệ Ngân Hàng Đề Thi & Quản Trị Quiz (Quiz Engine - FR-08 & QZ-SCR-004)
- **Vấn đề thực tế**: Backend hiện có `@Post('/quizzes')` và `@Post('/quizzes/:id/questions')`, nhưng lại **thiếu endpoint lấy danh sách đề thi Quiz tổng quan** để Admin xem toàn bộ ngân hàng câu hỏi, và **thiếu endpoint cập nhật Quiz (`PUT`)**.
- **Danh sách Endpoint cần bổ sung**:
  1. `GET /api/quizzes`
     - **Mô tả**: Admin lấy danh sách toàn bộ các bài Quiz trong hệ thống (phân loại theo khóa học, bài học hoặc đề thi độc lập, thống kê số lượng câu hỏi con).
     - **Quyền hạn**: `ADMIN`.
     - **Query Params**: `skill?: SkillType`, `testType?: string`, `search?: string`, `page?: number`, `limit?: number`.
  2. `PUT /api/quizzes/:id`
     - **Mô tả**: Admin chỉnh sửa thông tin đề thi Quiz (tiêu đề, bài đọc `passage`, audio `audioUrl`, thời gian `timeLimitMinutes`, điểm sàn `passScore`).
     - **Quyền hạn**: `ADMIN`.
  3. `POST /api/quizzes/:id/questions/bulk`
     - **Mô tả**: Admin nhập hàng loạt câu hỏi kèm 4 đáp án (A, B, C, D) và lời giải thích vào bài thi Quiz chỉ trong 1 lần gửi, thay vì phải gọi API tạo từng câu đơn lẻ.
     - **Quyền hạn**: `ADMIN`.
     - **Request Body**: `{ questions: CreateQuestionDto[] }`.
- **Cách triển khai Backend**:
  - Viết hàm `findAllQuizzes`, `updateQuiz`, và `addQuestionsBulk` trong `quizzes.service.ts`.
  - Khai báo các route tương ứng tại `quizzes.controller.ts`.

---

#### 1.3.5. Phân hệ Tự Động Lưu Bản Nháp Bài Viết (Writing Auto-Save Drafts - WR-REQ-002)
- **Vấn đề thực tế**: Theo SRS `WR-REQ-002` và màn hình `WR-SCR-001`, hệ thống bắt buộc phải có cơ chế **Auto-save draft sau mỗi 15-30 giây** để học viên không bị mất bài viết Task 1/Task 2 khi rớt mạng, sập nguồn hoặc vô tình reload trang. Hiện tại Frontend mới chỉ đếm timeout lưu tạm trên RAM, nếu tắt tab sẽ mất bài viết.
- **Danh sách Endpoint cần bổ sung**:
  1. `POST /api/writing/drafts`
     - **Mô tả**: Lưu bản nháp bài viết đang làm dở của học viên theo thời gian thực.
     - **Quyền hạn**: `STUDENT`.
     - **Request Body**: `{ promptId: string, content: string, wordCount: number, durationSeconds: number }`.
  2. `GET /api/writing/drafts/:promptId`
     - **Mô tả**: Lấy lại nội dung bài viết đang viết dở khi học viên quay trở lại phòng thi Writing Studio.
     - **Quyền hạn**: `STUDENT`.
  3. `DELETE /api/writing/drafts/:promptId`
     - **Mô tả**: Tự động xóa bản nháp khi học viên đã bấm nộp bài thi chính thức.
     - **Quyền hạn**: `STUDENT`.
- **Cách triển khai Backend**:
  - Thêm bảng `writing_drafts` vào `schema.prisma`:
    ```prisma
    model WritingDraft {
      id              String   @id @default(uuid())
      userId          String
      user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      promptId        String
      prompt          WritingPrompt @relation(fields: [promptId], references: [id], onDelete: Cascade)
      content         String   @db.LongText
      wordCount       Int      @default(0)
      durationSeconds Int      @default(0)
      updatedAt       DateTime @updatedAt

      @@unique([userId, promptId])
      @@map("writing_drafts")
    }
    ```
  - Thêm các route lưu và tải nháp vào `writing.controller.ts`.

---

#### 1.3.6. Phân hệ Upload File Âm Thanh Bài Nói Speaking Lên Cloudinary (Speaking Audio Storage - SPK-REQ-002)
- **Vấn đề thực tế**: Học sinh thu âm bài thi Speaking qua Web Audio API tạo ra chuỗi Blob (`blob:http://...`). Khi gọi `POST /api/speaking/submissions`, API hiện tại chỉ nhận chuỗi `audioUrl: string`. Nếu truyền blob URL thì link chỉ chạy được trên máy học viên; Admin mở bài lên chấm điểm sẽ không nghe được âm thanh.
- **Endpoint cần bổ sung**:
  - `POST /api/speaking/submissions/with-audio` (hoặc `POST /api/media/upload/audio`)
    - **Mô tả**: Nhận file audio trực tiếp dưới dạng `multipart/form-data` (`file: Express.Multer.File`), tự động upload lên thư mục `teacher_dong_academy/speaking_audios/` trên Cloudinary CDN, sau đó tạo bản ghi `SpeakingSubmission` với URL tĩnh vĩnh viễn.
    - **Quyền hạn**: `STUDENT`.
    - **Headers**: `Content-Type: multipart/form-data`.
    - **Body Fields**: `audioFile` (file mp3/webm/wav), `promptId` (UUID), `durationSeconds` (number).
- **Cách triển khai Backend**:
  - Sử dụng `@UseInterceptors(FileInterceptor('audioFile'))` trong `speaking.controller.ts`.
  - Gọi `cloudinaryService.uploadVideo(file, 'teacher_dong_academy/speaking_audios')` (Cloudinary xử lý audio qua resource type video/raw).

---

#### 1.3.7. Phân hệ Xuất Báo Cáo Chuyên Cần Theo Khoảng Thời Gian (Attendance Date-Range Export - ATT-REQ-005)
- **Vấn đề thực tế**: Hiện tại `GET /api/attendance/classroom/:classroomId/export` chỉ cho phép xuất Excel của một phòng học đơn lẻ. Theo SRS `ATT-REQ-005` và màn hình `ATT-SCR-002`, Admin cần có chức năng **xuất báo cáo chuyên cần tổng hợp của toàn bộ học viện hoặc theo từng khóa học trong khoảng thời gian tùy chọn** (ví dụ: Từ 01/10/2026 đến 31/10/2026).
- **Endpoint cần bổ sung**:
  - `GET /api/attendance/export`
    - **Mô tả**: Xuất file Excel (`.xlsx`) tổng hợp dữ liệu chuyên cần của nhiều lớp học/khóa học trong khoảng thời gian lọc (Từ ngày - Đến ngày).
    - **Quyền hạn**: `ADMIN`.
    - **Query Params**:
      - `startDate: string` (định dạng `YYYY-MM-DD`, ví dụ: `2026-10-01`).
      - `endDate: string` (định dạng `YYYY-MM-DD`, ví dụ: `2026-10-31`).
      - `courseId?: string` (tùy chọn: lọc theo 1 khóa học hoặc toàn bộ khóa học).
    - **Response**: Trả về binary stream file Excel `.xlsx` có tên file động `Bao_Cao_Chuyen_Can_[TuNgay]_[DenNgay].xlsx`.
- **Cách triển khai Backend**:
  - Mở rộng hàm `exportAttendanceToExcel` trong `attendance.service.ts` để nhận thêm điều kiện `where: { createdAt: { gte, lte }, courseId }`.
  - Khai báo endpoint `@Get('export')` trong `attendance.controller.ts`.

---

### 1.4. Các API BE nâng cao đã sẵn sàng nhưng chưa có màn hình giao diện FE

1. **Quản lý ngân hàng đề thi Writing & Speaking (Admin Prompts CRUD)**:
   - Backend đã có đầy đủ: `@Post('/writing/prompts')`, `@Put('/writing/prompts/:id')`, `@Delete('/writing/prompts/:id')` và tương tự cho Speaking.
   - Frontend hiện tại Admin mới chỉ có màn hình chấm bài nộp (`admin/writing-review` và `admin/speaking-grading`), chưa có trang riêng để Admin chủ động tạo thêm đề thi mới vào hệ thống.
2. **Kéo-thả sắp xếp thứ tự Module & Bài học**:
   - Backend đã hỗ trợ `@Post('/lessons/modules/reorder')` và `@Post('/lessons/reorder')`.
   - Frontend hiện hiển thị danh sách dạng bảng/danh sách thông thường, chưa tích hợp thư viện kéo thả (Drag-and-Drop như `dnd-kit`).

---

# 2. BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS & ĐỀ XUẤT NÂNG CẤP TRẢI NGHIỆM

---

## 2.1. Phân hệ Luyện Viết AI IELTS Writing Studio (`WR-SCR-001` → `003`)

### 📋 Đặc tả SRS
- Bộ đếm từ thời gian thực, mục tiêu từ rõ ràng: Task 1 tối thiểu 150 từ (thời gian làm bài khuyến nghị 20 phút); Task 2 tối thiểu 250 từ (thời gian làm bài 40 phút).
- Tích hợp Gemini AI phân tích 4 tiêu chí chuẩn Cambridge IELTS: **Task Response (TR)**, **Coherence & Cohesion (CC)**, **Lexical Resource (LR)**, **Grammatical Range & Accuracy (GRA)**.
- Phía Admin: Xem danh sách bài nộp, cho phép duyệt nguyên điểm AI hoặc override điểm thủ công trước khi xuất bản kết quả cho học viên.

### 🔍 Hiện trạng trong code
- Giao diện nộp bài học sinh (`student/writing`) và duyệt bài Admin (`admin/writing-review`) đã hoàn thiện khung điểm 4 tiêu chí và gọi được API nộp bài/duyệt bài.
- **Điểm còn hạn chế**:
  1. Chỉ số đếm từ mới chỉ là số text đơn điệu, học viên khó nhận biết mình đang cách ngưỡng an toàn bao nhiêu từ.
  2. Gợi ý từ vựng và ngữ pháp của AI đang liệt kê dạng danh sách ở góc phải hoặc bên dưới, chưa có cơ chế đánh dấu trực tiếp (Inline Annotation / Highlight) lên từng câu sai trong bài viết.
  3. Phía Admin chưa có nút bấm duyệt nhanh 1-click (One-click Quick Approve) nếu thấy kết quả AI đã chuẩn xác.

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Dynamic Target Progress Bar**:
   - Thanh tiến độ đếm từ 3 phân đoạn màu:
     - 🔴 **Đỏ (Chưa đạt)**: `< 150 từ` (Task 1) hoặc `< 250 từ` (Task 2). Hiển thị tooltip cảnh báo: *"Chưa đủ số từ tối thiểu, nguy cơ bị trừ điểm Task Response"*.
     - 🟡 **Vàng cam (Sắp đạt)**: `150 - 179 từ` (Task 1) / `250 - 279 từ` (Task 2).
     - 🟢 **Xanh lá (Tối ưu)**: `≥ 180 từ` (Task 1) / `280 - 320 từ` (Task 2 - Độ dài lý tưởng đạt Band 7.5+).
2. **Inline Error & Lexical Highlighter**:
   - Sử dụng thẻ màu gạch chân thông minh ngay trong bài viết:
     - Gạch chân đỏ: Lỗi sai ngữ pháp hoặc thì động từ (Grammar).
     - Gạch chân vàng: Từ vựng lặp lại nhiều lần hoặc cơ bản (Level A2/B1).
     - Hover/Click vào cụm từ: Hiển thị tooltip gợi ý cụm từ thay thế C1/C2 (ví dụ: *"important"* ➔ *"paramount / pivotal"*).
3. **Quick-Grade & Audio Comment cho Admin**:
   - Nút 1-click: *"Chấp nhận toàn bộ điểm AI"* giúp Admin tiết kiệm 80% thời gian chấm đối với các bài học viên viết chuẩn.
   - Thêm ô ghi âm lời nhận xét ngắn của Giáo viên gửi kèm kết quả bài viết.

---

## 2.2. Phân hệ Luyện Nói IELTS Speaking Studio (`SPK-SCR-001` → `003`)

### 📋 Đặc tả SRS
- Chế độ phòng thu chuẩn thi: 1 phút chuẩn bị (Part 2 Cue Card) kèm bảng ghi chú nhanh nháp ý tưởng; tối đa 2 phút ghi âm liên tục.
- Hiển thị sóng âm động thời gian thực (Audio Waveform Visualizer) qua Web Audio API khi đang thu âm để kiểm tra chất lượng micro.
- Admin nghe lại bản thu âm, chấm 4 tiêu chí: **Fluency & Coherence (FC)**, **Lexical Resource (LR)**, **Grammatical Range & Accuracy (GRA)**, **Pronunciation (PR)** kèm comment gắn mốc thời gian (Timestamp).

### 🔍 Hiện trạng trong code
- Đã có canvas sóng âm khi thu âm, có đồng hồ đếm ngược và lưu bản ghi âm.
- Phía Admin đã có bảng chấm điểm 4 tiêu chí.
- **Điểm còn hạn chế**:
  1. Khi phát lại bản ghi âm, giao diện đang dùng thanh `<audio controls />` mặc định đơn điệu của trình duyệt, không hiển thị sóng âm khi phát lại.
  2. Bấm vào mốc thời gian nhận xét (ví dụ: `00:45 - Phát âm nuốt âm đuôi`) chưa có liên kết trực quan để tua thanh phát đến đúng giây đó.
  3. Chưa có bộ lọc đề thi Speaking phân rõ theo Part 1 (Hỏi đáp phản xạ nhanh), Part 2 (Độc thoại theo chủ đề), Part 3 (Thảo luận phản biện).

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Interactive WaveSurfer Timeline**:
   - Thay thế thanh audio mặc định bằng WaveSurfer trực quan.
   - Khi Admin gắn comment tại giây thứ 45, trên sóng âm xuất hiện 1 điểm mốc (marker pin) màu cam. Học viên bấm vào nhận xét thì sóng âm lập tức phát lại đúng 5 giây xung quanh đoạn bị lỗi phát âm đó.
2. **Bộ đếm thời gian 3 giai đoạn**:
   - Part 1: Đếm ngược 30 giây cho mỗi câu trả lời ngắn.
   - Part 2: Chuyển tự động giữa 60s Chuẩn bị ➔ 120s Trình bày (tự động bật micro khi hết 60s chuẩn bị).
   - Part 3: Câu hỏi mở chuyên sâu kèm gợi ý dàn ý phát triển luận điểm.
3. **Speech Pace Tracker (Đo tốc độ nói)**:
   - Hiển thị nhịp điệu nói (tốc độ từ trung bình trên phút - WPM) để học viên nhận biết mình có đang nói quá nhanh hoặc ngắt quãng quá lâu hay không.

---

## 2.3. Kho Học Liệu Số & Bảo Mật Chống Quay Chụp (`LIB-SCR-001` → `003`)

### 📋 Đặc tả SRS
- Bảo mật tài liệu PDF và audio MP3 qua Signed URL thời hạn 15 phút (900 giây).
- Không cung cấp nút tải file trực tiếp (`No Download Button`).
- **Dynamic Watermark Canvas**: Hiển thị họ tên, số điện thoại, mã học viên chuyển động mờ liên tục trên canvas đọc tài liệu để chống quay chụp màn hình hoặc rò rỉ đề thi.

### 🔍 Hiện trạng trong code
- Đã có Dynamic Watermark canvas phủ lên tài liệu, đếm ngược thời gian hết hạn của Signed URL 15 phút.
- **Điểm còn hạn chế**:
  1. Người dùng vẫn có thể bấm phím tắt `Ctrl + P` (In ấn) hoặc dùng công cụ chụp ảnh chụp lại tài liệu mà chưa có màn chắn tự động.
  2. Trình đọc PDF hiển thị trong khung iframe cố định, chưa có chế độ toàn màn hình tập trung đọc sách (Focus Reading Mode) hoặc thanh lật trang mượt mà.

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Bộ chắn Screen-Capture & Print Shield**:
   - Bổ sung CSS `@media print { body { display: none !important; } }` triệt để chặn `Ctrl + P`.
   - Lắng nghe sự kiện mất tiêu điểm cửa sổ (`window.onblur`) hoặc phím PrintScreen: tự động phủ màn hình đen cảnh báo bảo mật học liệu.
2. **Focus Book Reader UI**:
   - Chế độ đọc toàn màn hình (Focus Mode): Ẩn toàn bộ sidebar, hiển thị trang sách với nền sáng dịu mắt (Sepia / Slate Light), hỗ trợ phóng to/thu nhỏ (Zoom), chuyển trang và ghi nhớ số trang đang đọc dở.

---

## 2.4. LMS Course Engine & Quản Lý Tiến Trình Bài Học (`CRS-SCR-001` → `004`)

### 📋 Đặc tả SRS
- Mô hình phân cấp 4 tầng: **Course ➔ Module ➔ Lesson ➔ Components**.
- **Sequential Content Unlocking**: Cơ chế mở khóa bài học tuần tự: Học viên phải hoàn thành bài trước (hoặc đạt Quiz $\ge 80\%$) mới được mở khóa bài học kế tiếp.

### 🔍 Hiện trạng trong code
- Giao diện có icon khóa/mở khóa.
- **Điểm còn hạn chế**:
  1. Chưa có màn hình phát video bài giảng chuyên nghiệp (`Cinema Mode`) kèm khu vực ghi chú cá nhân (Personal Notes) theo từng phút của video.
  2. Chưa có nút *"Đánh dấu đã học xong"* liên kết trực tiếp với BE để cập nhật tiến trình và mở khóa bài tiếp theo.

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Cinema Mode Lesson Player**:
   - Thiết kế giao diện học tập tập trung: Trình phát video chiếm 75% màn hình bên trái; cột danh sách bài học và tài liệu kèm theo ở bên phải.
   - Thanh điều khiển có nút *"Tốc độ phát"* (1x, 1.25x, 1.5x), nút *"Xem toàn màn hình"*.
2. **Timestamped Personal Notes**:
   - Cho phép học viên gõ ghi chú ngay bên dưới bài học, tự động gắn mốc thời gian video lúc gõ. Khi bấm vào dòng ghi chú, video tự nhảy đến đoạn đó để ôn tập lại kiến thức.
3. **Course Completion Certificate**:
   - Khi hoàn thành 100% các bài học và đạt điểm các bài kiểm tra, hệ thống tự động sinh chứng chỉ số hóa (Digital Certificate) có mã xác thực của Teacher Dong Academy.

---

## 2.5. Hệ Thống Thi Trắc Nghiệm Quiz Engine & Xử Lý Bài Đọc Reading (`QZ-SCR-001` → `005`)

### 📋 Đặc tả SRS & Quy tắc nghiệp vụ cốt lõi
- Hỗ trợ các dạng câu hỏi chuẩn Cambridge IELTS & LMS hiện đại:
  - `SINGLE_CHOICE`: Trắc nghiệm 1 đáp án đúng (A, B, C, D).
  - `MULTIPLE_CHOICE`: Trắc nghiệm nhiều đáp án đúng.
  - `TRUE_FALSE_NOT_GIVEN` / `YES_NO_NOT_GIVEN`: Dạng đặc thù kiểm tra đọc hiểu IELTS Reading.
  - `FILL_BLANK`: Điền từ vào chỗ trống.
  - `MATCHING_HEADINGS` / `MATCHING_INFORMATION`: Nối tiêu đề / thông tin đoạn văn.
- **Sàn điểm nghiêm ngặt $\ge 80\%$ (`BIZ-QZ-003`)**: Học viên phải đạt $\ge 80\%$ để được công nhận hoàn thành Checkpoint và kích hoạt mở khóa bài học / Module kế tiếp (`Sequential Unlocking`).
- Tự động chấm điểm tức thì (Instant Automated Grading), lưu vết toàn bộ câu trả lời và hiển thị giải thích chi tiết (`explanation`) sau khi nộp bài.

---

### 🗄️ 2.5.1. Kiến Trúc Dữ Liệu & Quy Trình Xử Lý Quiz ở Backend
Mô hình cơ sở dữ liệu (Prisma Schema - MySQL) được cấu trúc thành 5 thực thể liên kết chặt chẽ:
1. **Model `Quiz` (Đề thi / Bài kiểm tra)**:
   - `id`: UUID định danh duy nhất.
   - `lessonId`: Liên kết khóa ngoại với bài học cụ thể (hoặc `null` nếu là bài thi thử độc lập).
   - `title`: Tiêu đề bài thi (ví dụ: *"Checkpoint 03: End-of-Module Mastery Quiz"*).
   - `skill`: Phân loại kỹ năng (`READING`, `LISTENING`, `GRAMMAR`, `VOCABULARY`).
   - `testType`: Loại bài thi (`LESSON_QUIZ`, `PRACTICE_TEST`, `FULL_MOCK_TEST`).
   - `passage`: Lưu trữ bài đọc dài học thuật (`@db.LongText`), chứa toàn bộ văn bản đọc hiểu hàng nghìn từ.
   - `audioUrl`: Đường dẫn file âm thanh cho bài thi Listening.
   - `timeLimitMinutes`: Thời gian làm bài tính bằng phút (mặc định 15 phút).
   - `passScore`: Điểm sàn đạt chuẩn (mặc định 80.0%).
2. **Model `Question` (Câu hỏi trong đề thi)**:
   - `quizId`: Khóa ngoại trỏ về `Quiz`.
   - `content`: Nội dung câu hỏi.
   - `type`: Dạng câu hỏi (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE_NOT_GIVEN`,...).
   - `points`: Trọng số điểm của câu (mặc định 1.0).
   - `explanation`: Lời giải thích cặn kẽ tại sao đáp án đó đúng, trích dẫn dòng/đoạn trong bài đọc.
   - `orderIndex`: Thứ tự hiển thị câu hỏi (1, 2, 3...).
3. **Model `QuestionOption` (Phương án lựa chọn A, B, C, D)**:
   - `questionId`: Khóa ngoại trỏ về `Question`.
   - `content`: Nội dung phương án (A, B, C, D).
   - `isCorrect`: Cờ Boolean xác định đáp án đúng (`true`/`false`).
4. **Model `QuizSubmission` & `QuizAnswer` (Lịch sử làm bài & Bài nộp)**:
   - Lưu thời điểm nộp bài (`submittedAt`), điểm số `%`, tổng số câu, số câu đúng.
   - Cờ `isPassed`: `score >= passScore` (điều kiện kích hoạt mở khóa bài học tiếp theo).
   - Lưu từng phương án học viên đã chọn (`selectedOptionId`), câu trả lời tự luận (`textAnswer`), và kết quả đúng/sai của từng câu.

#### 🛡️ Cơ chế Chống gian lận (Anti-Cheat Sanitization) tại Backend
- Khi học viên gọi API lấy đề thi (`GET /quizzes/:id` hoặc `GET /quizzes/lesson/:lessonId`), hàm `sanitizeQuizForRole` tại `quizzes.service.ts` **tự động bóc tách và ẩn triệt để trường `isCorrect`** khỏi tất cả các `options`.
- Nhờ cơ chế này, học viên dù có mở DevTools (F12) hay kiểm tra Network Payload cũng **hoàn toàn không thể xem trước đáp án đúng**.
- Khi nộp bài (`POST /quizzes/:id/submit`), Backend thực hiện so khớp server-side độc lập và bảo mật, đảm bảo tính công bằng và toàn vẹn của kết quả thi.

---

### 📖 2.5.2. Cách Xử Lý Bài Đọc (Reading Passage) Kèm Nhiều Câu Hỏi Con

Trong các bài thi IELTS Reading hoặc bài đọc hiểu học thuật, một đoạn văn lớn thường đi kèm một nhóm từ 5 đến 13 câu hỏi con bên dưới. Hệ thống xử lý trường hợp này như sau:

#### A. Cấu trúc quan hệ Dữ liệu
- Toàn bộ bài đọc dài được lưu tại trường `passage` của bảng `quizzes` dưới dạng `@db.LongText`. Văn bản có thể chứa các ký tự xuống dòng, đánh số đoạn văn [A], [B], [C], [D] chuẩn IELTS.
- Một bản ghi `Quiz` liên kết với mảng các `questions` (`1 Quiz -> N Questions`). Mỗi `Question` đại diện cho một câu hỏi con liên quan đến nội dung bài đọc `passage`.

#### B. So sánh 2 cơ chế hiển thị trên giao diện Học sinh
1. **Dạng Cuộn truyền thống (Stacked View - Cuộn dọc)**:
   - Bài đọc nằm ở nửa trên màn hình, danh sách các câu hỏi con nằm ở nửa dưới.
   - *Bất cập*: Học viên phải cuộn trang lên xuống liên tục (cuộn lên để đọc đoạn văn, cuộn xuống để chọn đáp án A/B/C/D), dễ gây mất dấu vị trí thông tin, mỏi mắt và giảm tốc độ làm bài.
2. **Dạng Chia đôi màn hình độc lập (Split-View IELTS Computer-delivered - Khuyên dùng & Chuẩn hóa)**:
   - **Cột bên trái (chiếm 50% độ rộng màn hình)**: Hiển thị toàn văn bài đọc `passage`.
     - Có thanh cuộn độc lập (Independent Scrollbar).
     - Tích hợp công cụ Highlight text: Học viên dùng chuột bôi đen các từ khóa hoặc câu chứa bằng chứng, đoạn văn bản sẽ được highlight màu vàng/xanh để ghi nhớ.
     - Tích hợp điều chỉnh kích thước chữ (Font Size: Nhỏ / Vừa / Lớn).
   - **Cột bên phải (chiếm 50% độ rộng màn hình)**: Hiển thị các câu hỏi con.
     - Cuộn độc lập với cột bài đọc bên trái.
     - Có thanh chỉ mục câu hỏi (ví dụ: Questions 1 – 5).
     - Học viên vừa nhìn đoạn văn bên trái, vừa chọn phương án A, B, C, D bên phải song song mà không cần cuộn trang lên xuống.

---

### 📝 2.5.3. Trải Nghiệm Làm Bài Trực Tuyến & Hiển Thị Đề Thi 1 Trong 4 Đáp Án

Hệ thống đã có **chức năng làm bài trực tuyến hoàn chỉnh** cho học viên tại `/student/quizzes` và trong trang bài học `/student/courses`.

#### A. Các thành phần giao diện khi Học sinh làm bài trực tuyến
1. **Đồng hồ đếm ngược thông minh (Smart Countdown Timer)**:
   - Hiển thị cố định ở thanh trạng thái (ví dụ: `Thời gian còn: 14:59`).
   - Cảnh báo trực quan: Khi thời gian làm bài còn dưới 5 phút, thanh thời gian đổi sang màu đỏ nhấp nháy (`animate-pulse`) để nhắc nhở học viên tăng tốc độ.
   - Khi hết giờ (00:00): Hệ thống tự động thu bài và gửi bài thi lên Backend để chấm điểm.
2. **Thanh điều hướng số câu hỏi nhanh (Question Bubbles Palette)**:
   - Một hàng nút bấm số thứ tự câu hỏi: `[1] [2] [3] ... [10]`.
   - Mã màu trạng thái nhận diện ngay lập tức:
     - 🟦 **Màu xanh dương đậm (Primary)**: Câu hỏi hiện tại đang xem.
     - 🟩 **Màu xanh nhạt (Answered)**: Câu hỏi đã được chọn đáp án.
     - ⬜ **Màu xám nhạt (Unanswered)**: Câu hỏi chưa trả lời.
     - 🟨 **Màu vàng (Flagged)**: Câu hỏi học sinh đánh dấu cần kiểm tra lại trước khi nộp.
   - Học sinh có thể click vào bất kỳ nút số nào để nhảy thẳng đến câu hỏi đó mà không cần bấm Next liên tiếp.
3. **Cách hiển thị câu hỏi trắc nghiệm chọn 1 trong 4 đáp án (A, B, C, D)**:
   - Câu hỏi được trình bày dạng **Thẻ tập trung (Focus Question Card)**:
     - Tiêu đề câu hỏi in đậm, cỡ chữ chuẩn dễ đọc.
     - 4 phương án A, B, C, D hiển thị thành 4 nút bấm bản to, có bo góc viền hiện đại.
     - Khi học sinh click chọn: Nút lập tức đổi nền sang màu xanh nhạt (`bg-sky-50`), viền xanh đậm (`border-primary`), chữ in đậm, và chữ cái A/B/C/D đổi thành icon chọn tích xanh.
     - Dữ liệu lựa chọn được lưu ngay vào bộ nhớ đệm (State) nên chuyển qua lại giữa các câu không bao giờ bị mất đáp án đã chọn.
4. **Quy trình nộp bài & Nghiệm thu kết quả tức thì (Instant Grading Flow)**:
   - Ở câu hỏi cuối cùng, nút điều hướng chuyển thành nút nổi bật màu xanh ngọc: **"Nộp Bài Chấm Điểm (Instant)"**.
   - Bấm nộp bài, hệ thống hiển thị màn hình nghiệm thu chi tiết:
     - **Hiển thị điểm tổng**: Phần trăm điểm đạt được + Số câu đúng (ví dụ: `80% - 8/10 Câu đúng`).
     - **Phân nhánh kết quả theo sàn điểm $\ge 80\%$**:
       - 🎉 **Đạt $\ge 80\%$**: Hiện huy hiệu xanh lá *"ĐÃ ĐẠT CHECKPOINT"*, thông báo chúc mừng và hiển thị nút *"Quay về Khóa học (Module tiếp theo đã mở khóa)"*.
       - ⚠️ **Dưới $80\%$**: Hiện huy hiệu đỏ *"CHƯA ĐẠT SÀN ĐIỂM"*, hiển thị nút *"Làm Lại Bài Thi"* để học sinh ôn tập và làm lại.
     - **Xem lại đáp án và giải thích (Review Mode)**: Sau khi nộp, hệ thống mở khóa toàn bộ phần giải thích (`explanation`) của từng câu hỏi để học sinh biết chính xác lý do đúng/sai.

---

### 💡 2.5.4. Đề Xuất Nâng Cấp Hoàn Thiện Trải Nghiệm (UX Action Plan)
1. **Bổ sung chế độ chuyển đổi linh hoạt (Toggle View Mode)**:
   - Cho phép học viên chọn giữa 2 chế độ hiển thị:
     - **Chế độ Từng câu một (Focus Mode)**: Thích hợp khi luyện tập cẩn thận từng câu.
     - **Chế độ Danh sách cuộn toàn bộ (All-in-one Sheet View)**: Hiển thị cả 10-20 câu trên 1 trang dài, thích hợp cho học viên muốn nhìn tổng thể toàn bộ đề thi để làm nhanh.
2. **Kích hoạt Split-View tự động khi đề có bài đọc `passage`**:
   - Nếu bài thi có dữ liệu trường `passage`, giao diện tự động bật layout 2 cột chia đôi màn hình chuẩn thi quốc tế.
3. **Hiệu ứng chúc mừng Confetti**:
   - Kích hoạt hiệu ứng pháo hoa chúc mừng sinh động khi học sinh vượt qua bài kiểm tra với điểm số cao ($\ge 80\%$), tạo cảm giác chinh phục và động lực học tập.

---

## 2.6. Điểm Danh Tự Động & Báo Cáo Chuyên Cần (`ATT-SCR-001` → `003`)

### 📋 Đặc tả SRS
- Ghi nhận thời gian tham gia lớp qua LiveKit Webhook.
- Phân loại 3 trạng thái:
  - `PRESENT`: Vào lớp trong 15 phút đầu và tham gia $\ge 80\%$ thời lượng.
  - `LATE`: Vào lớp sau 15 phút đầu nhưng vẫn học $\ge 50\%$ thời lượng.
  - `ABSENT`: Học $< 30\%$ thời lượng hoặc không vào lớp.
- Admin có thể điều chỉnh thủ công (Override) kèm lý do giải trình.
- Xuất file báo cáo Excel (.xlsx).

### 🔍 Hiện trạng trong code
- Cả hai trang phía Student và Admin đã có bảng dữ liệu và nút xuất Excel hoạt động tốt.
- **Điểm còn hạn chế**:
  1. Phía học sinh chưa có biểu đồ hình tròn (Donut Chart) tổng kết tỷ lệ chuyên cần của tháng.
  2. Phía Admin chưa có bộ lọc ngày (Date Range Picker: Từ ngày... Đến ngày...) để lọc dữ liệu trước khi xuất báo cáo Excel.

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Donut Attendance Chart & Streak Counter**:
   - Thể hiện tỷ lệ chuyên cần dạng biểu đồ tròn trực quan (ví dụ: `94% Chuyên cần`).
   - Huy hiệu "Chuỗi ngày chuyên cần" (Study Streak) khích lệ tinh thần học viên.
2. **Bộ lọc xuất báo cáo Excel nâng cao**:
   - Cho phép Admin chọn: Chọn khóa học ➔ Chọn khoảng thời gian ➔ Xem trước số lượng học viên ➔ Bấm xuất file Excel theo mẫu chuẩn của Bộ Giáo dục / Trung tâm.

---

## 2.7. Kênh Nhắn Tin Hỗ Trợ Trực Tuyến Thời Gian Thực (`MSG-SCR-001`)

### 📋 Đặc tả SRS
- Trao đổi tin nhắn 1-1 thời gian thực giữa Học viên và Thầy Đông qua Socket.IO WebSocket Gateway.

### 🔍 Hiện trạng trong code
- Giao diện khung 2 cột (danh sách hội thoại và khung chat) đã được dựng rất đẹp mắt.
- **Điểm còn hạn chế**:
  1. Chưa nối với Socket.IO và REST API của server (`/chat`), đang dùng dữ liệu tin nhắn giả lập bằng `setTimeout`.
  2. Chưa có nút gửi ảnh hoặc file đính kèm bài tập trực tiếp trong khung chat.
  3. Chưa có huy hiệu báo tin nhắn mới chưa đọc (Unread Badge) trên thanh Topbar.

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Full Socket.IO Realtime Sync**:
   - Đồng bộ hóa tin nhắn tức thì giữa 2 màn hình Admin và Học sinh khi cùng mở web.
   - Hiển thị trạng thái đang soạn tin (*"Thầy Đông đang gõ..."* hoặc *"Học viên đang soạn tin..."*).
2. **Đính kèm tài liệu & Voice Message**:
   - Cho phép học viên kéo thả ảnh bài viết hoặc ghi âm một đoạn giọng nói ngắn gửi trực tiếp vào ô chat để hỏi bài.
3. **Topbar Notification Badge**:
   - Hiển thị chấm đỏ số lượng tin nhắn mới chưa đọc trên icon chuông hoặc icon tin nhắn ở thanh điều hướng trên cùng.

---

## 2.8. Quản Lý Tài Khoản, Học Viên & Phiên Đơn Concurrent Session (`AUTH-SCR-004, 005`, `ADM-SCR-002`)

### 📋 Đặc tả SRS
- Đổi mật khẩu có thanh đo độ mạnh (Password Strength Meter).
- Cơ chế **Single Concurrent Session**: Học viên chỉ được đăng nhập 1 nơi duy nhất tại một thời điểm; phiên mới sẽ chấm dứt phiên cũ.
- Phía Admin: Quản lý danh sách học viên, xem trạng thái học tập, khóa/mở khóa tài khoản học viên.

### 🔍 Hiện trạng trong code
- Đã có thanh đo độ mạnh mật khẩu và Drawer xem phiên đăng nhập.
- **Điểm còn hạn chế**:
  1. Chức năng đổi mật khẩu chưa gọi API backend.
  2. Trang Quản lý học viên của Admin chưa tải danh sách học viên thật từ cơ sở dữ liệu.

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Quick Unlock & Password Reset**:
   - Admin có nút 1-click *"Reset mật khẩu về mặc định"* để cấp cứu học viên quên mật khẩu hoặc bị kẹt tài khoản ngay lập tức.
2. **Chi tiết thiết bị trực quan**:
   - Trong drawer quản lý phiên, bổ sung icon thiết bị trực quan: 💻 Laptop Windows, 📱 iPhone iOS, 🌐 Trình duyệt Chrome kèm địa chỉ IP và thời gian đăng nhập lần cuối.

---

# 3. LỘ TRÌNH TRIỂN KHAI VÀ THỰC THI ĐỒNG BỘ

Dựa trên toàn bộ phân tích trên, các bước thực thi được sắp xếp theo thứ tự ưu tiên:

```
LỘ TRÌNH THỰC THI
│
├── GIAI ĐOẠN 1: Bổ sung 1 API còn thiếu ở Backend
│   └── Thêm GET /materials vào materials.controller.ts (lấy danh sách tài liệu thư viện số)
│
├── GIAI ĐOẠN 2: Nối API dữ liệu thật cho các trang Frontend đang dùng Mock
│   ├── 1. Nối /admin/users với users.service.ts (quản lý học viên thật)
│   ├── 2. Nối API đổi mật khẩu thật ở student/account & admin/account
│   ├── 3. Nối /student/library & /admin/library với materials.service.ts
│   └── 4. Nối cây bài học động ở /student/courses với courses.service.ts
│
├── GIAI ĐOẠN 3: Triển khai Socket.IO Chat 1-1 giữa Học viên & Thầy Đông
│   └── Tạo chat.service.ts, nối WebSocket Gateway, unread badges trên Topbar
│
└── GIAI ĐOẠN 4: Nâng cấp trải nghiệm người dùng (UX Upgrades)
    ├── AI Writing Studio: Thanh từ 3 màu + Inline Error Highlight
    ├── Speaking Studio: Audio WaveSurfer timeline + Timestamp comments
    ├── Quiz Engine: Ma trận 20 câu hỏi nhanh + Màn hình pháo hoa đạt sàn >= 80%
    └── Library: Bộ chặn Print / Screen-capture chống chụp quay màn hình
```

