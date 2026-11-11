# BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS, TỔNG HỢP KẾT NỐI API & ĐỀ XUẤT NÂNG CẤP TRẢI NGHIỆM
**Dự án**: Teacher Dong Academy (LMS & WebRTC In-house EdTech Platform)  
**Tài liệu tham chiếu**: `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md`, `docs/SRS.md`, `docs/mock_test.html`  
**Ngày cập nhật**: 11/11/2026  

---

## MỤC LỤC
1. [BẢNG TỔNG HỢP KẾT NỐI API GIỮA BACKEND & FRONTEND](#1-bảng-tổng-hợp-kết-nối-api-giữa-backend--frontend)
   - 1.1. Các phân hệ đã kết nối hoàn chỉnh (BE ↔ FE)
   - 1.2. BE đã xây dựng API nhưng FE chưa kết nối (Đang dùng dữ liệu tĩnh Mock/Local State)
   - 1.3. FE cần nhưng BE đang thiếu API
   - 1.4. Các API BE nâng cao đã sẵn sàng nhưng chưa có màn hình giao diện FE
2. [BÁO CÁO ĐỐI CHIẾU HỆ THỐNG VỚI SRS & ĐỀ XUẤT NÂNG CẤP TRẢI NGHIỆM](#2-báo-cáo-đối-chiếu-hệ-thống-với-srs--đề-xuất-nâng-cấp-trải-nghiệm)
   - 2.1. Phân hệ Luyện Viết AI IELTS Writing Studio (`WR-SCR-001` → `003`)
   - 2.2. Phân hệ Luyện Nói IELTS Speaking Studio (`SPK-SCR-001` → `003`)
   - 2.3. Kho Học Liệu Số & Bảo Mật Chống Quay Chụp (`LIB-SCR-001` → `003`)
   - 2.4. LMS Course Engine & Quản Lý Tiến Trình Bài Học (`CRS-SCR-001` → `004`)
   - 2.5. Hệ Thống Thi Trắc Nghiệm Quiz Engine (`QZ-SCR-001` → `003`)
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

---

### 1.3. FE cần nhưng BE đang thiếu API

| STT | Nhu cầu chức năng | Vấn đề hiện tại | API Backend cần bổ sung |
|:---:|:---|:---|:---|
| **1** | **Lấy toàn bộ tài liệu Thư viện số** (`student/library` & `admin/library`) | Hiện tại `materials.controller.ts` chỉ có `@Get('lesson/:lessonId')` (lấy tài liệu của 1 bài học), **chưa có endpoint lấy tất cả tài liệu chung của thư viện** kèm lọc theo PDF / Audio MP3. Khiến cả 2 trang thư viện đang phải gán cứng 4 tài liệu mẫu. | Bổ sung endpoint `@Get('/materials')` trong `materials.controller.ts` hỗ trợ Query params (`fileType`, `category`, `search`, `page`, `limit`). |
| **2** | **Upload file Audio ghi âm bài thi Speaking** | Khi học viên ghi âm xong, trình duyệt tạo ra Blob URL nội bộ (`blob:http://...`). Học viên nộp bài thì URL này chỉ có hiệu lực trên máy học viên, Admin mở máy khác nghe sẽ không có tiếng. | Bổ sung `media.service.ts` ở FE để upload file âm thanh lên `@Post('/media/upload/video')` (hoặc Audio) của Cloudinary lấy link tĩnh trước khi nộp bài. |

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

## 2.5. Hệ Thống Thi Trắc Nghiệm Quiz Engine (`QZ-SCR-001` → `003`)

### 📋 Đặc tả SRS
- Hỗ trợ 3 dạng câu hỏi: Trắc nghiệm 1 đáp án, nhiều đáp án, True / False / Not Given chuẩn IELTS.
- **Sàn điểm nghiêm ngặt $\ge 80\%$**: Nếu điểm $< 80\%$, không mở khóa bài tiếp theo, yêu cầu làm lại.
- Chấm điểm tức thì kèm giải thích chi tiết đáp án.

### 🔍 Hiện trạng trong code
- Đã có logic kiểm tra `percentage >= 80`.
- **Điểm còn hạn chế**:
  1. Chưa có ma trận điều hướng nhanh danh sách câu hỏi (Question Navigation Palette).
  2. Dạng câu hỏi True/False/Not Given chưa có thiết kế giao diện đặc thù bài đọc Academic.
  3. Màn hình kết thúc bài thi hiển thị còn đơn giản, chưa làm nổi bật điều kiện đạt/chưa đạt.

### 💡 Đề xuất nâng cấp trải nghiệm (UX Upgrades)
1. **Question Navigation Palette (Ma trận câu hỏi)**:
   - Cột cố định bên phải liệt kê các ô số từ 1 đến 20:
     - Ô màu xám: Chưa trả lời.
     - Ô màu xanh dương: Đã chọn đáp án.
     - Cờ màu vàng: Đánh dấu cần xem lại (Flag for Review).
   - Giúp học sinh kiểm soát toàn diện trạng thái làm bài trước khi bấm nộp.
2. **Giao diện bài đọc Reading chia đôi màn hình (Split View)**:
   - Nửa trái là đoạn văn bài đọc (Reading Passage), nửa phải là danh sách câu hỏi True/False/Not Given, cuộn độc lập giúp học viên không phải cuộn lên cuộn xuống liên tục.
3. **Celebration Modal & Action Flow**:
   - Đạt $\ge 80\%$: Hiệu ứng Confetti (pháo hoa chúc mừng) kèm nút *"Tiếp tục bài học tiếp theo"*.
   - Dưới $80\%$: Bảng phân tích câu sai màu đỏ kèm lời khuyên ôn tập và nút to nổi bật *"Làm lại bài kiểm tra"*.

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

