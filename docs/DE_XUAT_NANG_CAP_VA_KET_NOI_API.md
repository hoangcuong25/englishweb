# BÁO CÁO TIẾN ĐỘ THEO NGÀY: ĐỐI CHIẾU HỆ THỐNG VỚI SRS, TỔNG HỢP CÁC HẠNG MỤC ĐÃ GIẢI QUYẾT & DANH MỤC CẢI TIẾN TỒN ĐỌNG
**Dự án**: Teacher Dong Academy (LMS & WebRTC In-house EdTech Platform)  
**Tài liệu tham chiếu**: `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md`, `docs/SRS.md`, `docs/mock_test.html`, `docs/API_DOCUMENTATION.md`  
**Ngày cập nhật báo cáo**: 13/11/2026 (Phiên bản Toàn diện Cuối ngày)  
**Trạng thái kiểm thử hệ thống**:
- Phía Server NestJS: **135/135 Test cases E2E PASS (100%)** (31 Test Suites)
- Phía Client Next.js: **31/31 Test cases E2E PASS (100%)** (17 Test Suites)
- Biên dịch Next.js Production: **32/32 Routes App Router PASS (100%)**

---

## MỤC LỤC BÁO CÁO
1. [NHẬT KÝ TIẾN ĐỘ THEO NGÀY: CÁC VẤN ĐỀ ĐÃ ĐƯỢC GIẢI QUYẾT](#1-nhật-ký-tiến-độ-theo-ngày-các-vấn-đề-đã-được-giải-quyết)
   - 1.1. Ngày 11/11/2026: Rà soát đối chiếu kiến trúc, lập ma trận API và phát hiện thiếu sót
   - 1.2. Ngày 12/11/2026: Đợt nâng cấp đột phá — Nối API Frontend, bổ sung Model DB, thêm 7 API mới và Test Suites
   - 1.3. Ngày 13/11/2026 (Đợt 1): Nghiệm thu code mới pull về, sinh Prisma Client, kiểm thử E2E ban đầu
   - 1.4. Ngày 13/11/2026 (Đợt 2 - Tối): Hoàn thiện toàn bộ Backlog còn lại, triển khai Socket.IO 2 chiều và mở rộng E2E Suite lên 100%
2. [TỔNG HỢP CÁC CẢI TIẾN & ĐIỂM MỚI ĐÃ HOÀN THÀNH](#2-tổng-hợp-các-cải-tiến--điểm-mới-đã-hoàn-thành)
3. [TÌNH TRẠNG CÁC CHỨC NĂNG TRONG DANH MỤC BACKLOG SRS](#3-tình-trạng-các-chức-năng-trong-danh-mục-backlog-srs)
   - 3.1. Các màn hình giao diện quản trị (Admin UI)
   - 3.2. Các tính năng trải nghiệm người dùng chuyên sâu (Interactive UX/UI) theo chuẩn EdTech/IELTS
   - 3.3. Các luồng kết nối hạ tầng dịch vụ & Socket.IO Realtime 2 chiều
4. [BẢNG MA TRẬN KẾT NỐI API TOÀN HỆ THỐNG ĐẾN THỜI ĐIỂM HIỆN TẠI (13/11/2026)](#4-bảng-ma-trận-kết-nối-api-toàn-hệ-thống-đến-thời-điểm-hiện-tại-13112026)

---

# 1. NHẬT KÝ TIẾN ĐỘ THEO NGÀY: CÁC VẤN ĐỀ ĐÃ ĐƯỢC GIẢI QUYẾT

---

### 1.1. Ngày 11/11/2026: Rà soát đối chiếu kiến trúc, lập ma trận API và phát hiện thiếu sót

> **Trọng tâm ngày 11/11**: Thiết lập nền móng kiến trúc, đối chiếu 11 phân hệ với tài liệu SRS, lập danh mục các lỗ hổng kết nối giữa Backend và Frontend (Commits: `f104651`, `c7c792d`).

#### Các vấn đề đã được giải quyết trong ngày 11/11/2026:
1. **Kiến trúc hệ thống 2 vai trò chuẩn mực (Strict 2-Role RBAC)**:
   - Thống nhất toàn bộ luồng phân quyền hệ thống chỉ xoay quanh 2 vai trò: `STUDENT` và `ADMIN`. Loại bỏ triệt để vai trò trung gian `TEACHER` theo đúng đặc tả SRS.
2. **Cơ chế Single Concurrent Session cho học viên**:
   - Hoàn thiện logic kiểm soát phiên đăng nhập đơn: Khi học viên đăng nhập trên thiết bị/trình duyệt mới, hệ thống tự động thu hồi refresh token của phiên cũ.
   - Xây dựng Drawer xem danh sách các phiên đăng nhập hoạt động và nút chấm dứt phiên từ xa.
3. **Phòng học WebRTC LiveKit SFU & Bảng trắng tương tác**:
   - Cấp LiveKit token phân quyền `Host` (Admin) và `Participant` (Học viên).
   - Tích hợp điều khiển mic/cam, chia sẻ màn hình, giơ tay phát biểu.
   - Bảng trắng tương tác Canvas đồng bộ nét vẽ qua LiveKit DataChannel và lưu vết REST API.
4. **Hệ thống Điểm danh tự động qua LiveKit Webhook**:
   - Bắt sự kiện webhook từ LiveKit SFU tính số phút học thực tế, tự động phân loại chuyên cần: `PRESENT`, `LATE`, `ABSENT`.
   - Admin có quyền điều chỉnh trạng thái thủ công kèm ghi chú giải trình (Audit Note) và xuất báo cáo Excel (`.xlsx`) cho từng phòng học.
5. **AI IELTS Writing Studio & Chấm 4 tiêu chí ban đầu**:
   - Kết nối Gemini AI tự động chấm bài viết Task 1 & Task 2 theo 4 tiêu chí Cambridge: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
   - Giao diện Admin xem và duyệt kết quả bài nộp của học viên.
6. **IELTS Speaking Studio thu âm sóng âm**:
   - Tích hợp Web Audio API hiển thị sóng âm động thời gian thực khi học viên thu âm bài nói.
   - Admin nghe lại bản thu âm và chấm 4 tiêu chí IELTS Speaking (FC, LR, GRA, PR).
7. **Lập Báo cáo kiểm toán lỗ hổng API**:
   - Phát hiện 5 màn hình Frontend đang dùng dữ liệu mock cục bộ (`admin/users`, `student/courses`, `admin/quizzes`, `student/account`, `student/messages`).
   - Phát hiện thiếu hụt 7 nhóm API ở Backend so với tài liệu SRS (Notifications, Admin tạo học viên, Kho tài liệu hệ thống, Lưu nháp Writing, Bulk Quiz, Xuất Excel theo khoảng ngày).

---

### 1.2. Ngày 12/11/2026: Đợt nâng cấp đột phá — Nối API Frontend, bổ sung Model DB, thêm 7 API mới và Test Suites

> **Trọng tâm ngày 12/11**: Hiện thực hóa triệt để các đề xuất của ngày 11/11 thông qua 3 lượt commit lớn:
> - **Sáng 12/11** (Commits `caac1a1`, `b9f7f57`): Nối 5 màn hình Frontend đang mock với Backend.
> - **Chiều 12/11** (Commit `1834414` do tác giả *hoang cuong* đẩy lên): Mở rộng Prisma Schema, thêm 7 nhóm API mới, nâng cấp UX Writing/Attendance và mở rộng bộ kiểm thử E2E.

#### Các vấn đề đã được giải quyết trong ngày 12/11/2026:

#### A. Đợt Sáng 12/11 (Nối API Frontend đang dùng Mock):
1. **Kết nối API Đổi mật khẩu cá nhân (`POST /api/auth/change-password`)**:
   - Giao diện học viên: `client/src/app/(student)/student/account/page.tsx`.
   - Giao diện Admin: `client/src/app/(admin)/admin/account/page.tsx`.
   - Thay thế toàn bộ alert mock bằng gọi API thực tế, hiển thị loading spinner chống click đúp, bắt thông báo lỗi chi tiết khi nhập sai mật khẩu cũ.
2. **Kết nối API Quản lý học viên thực tế (`/admin/users`)**:
   - Nạp danh sách học viên từ database qua `usersService.getUsers({ role: 'STUDENT' })`.
   - Nối nút Khóa/Mở khóa tài khoản với `PATCH /api/users/:id/status` (có Optimistic UI cập nhật tức thì).
   - Bổ sung nút 1-click Reset mật khẩu học viên về mặc định `DongAcademy@2026` qua `POST /api/users/:id/reset-password`.
3. **Kết nối Cây giáo trình bài học động (`/student/courses`)**:
   - Gọi `coursesService.getCourseBySlug()` nạp cấu trúc cây thật từ database: Course $\rightarrow$ Modules $\rightarrow$ Lessons.
   - Tự động đồng bộ tiến độ học tập, cờ `isCompleted`, `isAccessible` và cơ chế khóa bài học tuần tự (Sequential Locking).
4. **Kết nối Ngân hàng câu hỏi trắc nghiệm (`/admin/quizzes`)**:
   - Tải danh sách đề thi và câu hỏi từ `quizzesService.getSkillsTests()`.
   - Form modal "Soạn câu hỏi mới (#questionBankModal)" trực tiếp gửi nội dung, 4 phương án, đáp án đúng và giải thích ngữ pháp lên `POST /api/quizzes/:id/questions`.
5. **Xây dựng Chat Service & Nối tin nhắn lưu trữ Database**:
   - Tạo mới service độc lập: `client/src/services/chat.service.ts`.
   - Nối trang `student/messages` và `admin/messages` với các API: `GET /chat/conversations`, `GET /messages`, `POST /messages`, `PUT /read`.
   - Xuất khẩu tập trung `chat.service` tại `client/src/services/index.ts`.

#### B. Đợt Chiều 12/11 (Mở rộng Schema, 7 API mới & E2E Suites):
6. **Mở rộng Prisma Database Schema (`server/prisma/schema.prisma`)**:
   - Bổ sung Model `Notification` & Enum `NotificationType` (`WRITING`, `SPEAKING`, `LIVE`, `QUIZ`, `SYSTEM`) kèm index `[userId, isRead]`.
   - Bổ sung Model `WritingDraft` với ràng buộc duy nhất `@@unique([userId, promptId])` phục vụ cơ chế tự động lưu nháp.
7. **Xây dựng trọn vẹn Phân hệ Thông báo mới (`server/src/modules/notifications/`)**:
   - Cung cấp đầy đủ 5 API: `GET /api/notifications`, `GET /unread-count`, `PUT /:id/read`, `PUT /read-all`, `DELETE /:id`.
   - Tạo `client/src/services/notifications.service.ts`.
   - Nối quả chuông thông báo trên `client/src/components/shared/app-topbar.tsx`.
8. **Admin tạo học viên mới thủ công (`POST /api/users`)**:
   - Bổ sung `CreateUserDto` có validation (`fullName`, `email`, `phone`, `password`, `targetBand`, `role`).
   - Nối modal `#addUserModal` trên `admin/users` gửi trực tiếp dữ liệu học viên mới lưu vào MySQL.
9. **Kho học liệu số toàn hệ thống (`GET /api/materials`)**:
   - Bổ sung endpoint lấy toàn bộ tài liệu có phân trang, tìm kiếm và lọc theo định dạng `fileType` (PDF, AUDIO).
   - Nối vào cả 2 trang thư viện: `student/library` và `admin/library`.
10. **Tự động lưu bản nháp bài viết Writing (Writing Auto-Save Drafts)**:
    - Bổ sung 3 API Backend: `POST /api/writing/drafts`, `GET /api/writing/drafts/:promptId`, `DELETE /api/writing/drafts/:promptId`.
    - Giao diện `student/writing` tự động lưu nháp mỗi 30 giây vào MySQL, tự động phục hồi nội dung khi học viên mở lại đề bài.
11. **Thanh đo số từ 3 phân đoạn màu & Print Shield**:
    - Trang `student/writing` được trang bị **3-Tier Word Count Progress Bar**: Đỏ $\rightarrow$ Vàng $\rightarrow$ Xanh lá.
    - Tích hợp lớp bảo vệ in ấn **Print Shield** (`@media print` và CSS che mờ) chống sao chép và chụp đề bài.
12. **Bổ sung API Quản trị Quiz**:
    - `POST /api/quizzes/:id/questions/bulk`: Nhập danh sách câu hỏi hàng loạt.
    - `PUT /api/quizzes/:id`: Cập nhật cấu hình đề thi.
13. **Xuất báo cáo điểm danh Excel theo khoảng ngày tùy chọn**:
    - Mở rộng `GET /api/attendance/export?startDate=&endDate=`.
    - Bổ sung Date Range Picker trên `admin/attendance` và xuất `.xlsx`.
14. **Mở rộng hệ thống kiểm thử tự động E2E**:
    - Đạt 130 tests phía Server và 17 tests phía Client.

---

### 1.3. Ngày 13/11/2026 (Đợt 1): Nghiệm thu code mới pull về, sinh Prisma Client, kiểm thử E2E ban đầu

1. **Tiếp nhận mã nguồn mới**: Đồng bộ đầy đủ các commit từ remote (`origin/main`, `origin/dev`).
2. **Khắc phục lỗi Prisma Client cục bộ**: Chạy `node node_modules/prisma/build/index.js generate` trong thư mục `server/`.
3. **Nghiệm thu bước đầu**: 130 tests server và 17 tests client pass.

---

### 1.4. Ngày 13/11/2026 (Đợt 2 - Tối): Hoàn thiện toàn bộ Backlog còn lại, triển khai Socket.IO 2 chiều và mở rộng E2E Suite lên 100%

> **Trọng tâm đợt 2 ngày 13/11**: Giải quyết triệt để toàn bộ 11 hạng mục tồn đọng theo yêu cầu của người dùng, tích hợp WebSocket Socket.IO 2 chiều thời gian thực trên cả Backend và Frontend, loại bỏ cổng thanh toán và mở rộng test suite đạt 100% PASS.

#### Các thành tựu đột phá đã giải quyết trong đợt 2 ngày 13/11/2026:

1. **Triển khai Hệ Thống Socket.IO Realtime 2 Chiều Toàn Diện (Backend & Frontend)**:
   - **Backend**:
     - `ChatGateway` (`server/src/modules/chat/chat.gateway.ts`) tại namespace `/chat`: Hỗ trợ sự kiện `join_conversation`, `leave_conversation`, `typing`, `stop_typing`, `new_message`, `messages_read`.
     - `NotificationsGateway` (`server/src/modules/notifications/notifications.gateway.ts`) tại namespace `/notifications`: Phát thông báo tức thì đến từng phòng cá nhân `user_<id>` và phát sóng toàn hệ thống (`broadcast`).
     - Tích hợp `NotificationsGateway` trực tiếp vào `NotificationsService` để bắn socket tự động ngay khi có thông báo mới.
     - `WhiteboardGateway` (`server/src/core/livekit/whiteboard.gateway.ts`) tại namespace `/whiteboard`: Đồng bộ nét vẽ bảng trắng thời gian thực.
   - **Frontend**:
     - Cài đặt thư viện `socket.io-client` và xây dựng module quản lý kết nối tập trung: `client/src/lib/socket.ts`.
     - Cập nhật `chat.service.ts`: Cung cấp các hàm lắng nghe sự kiện `onNewMessage`, `onUserTyping`, `onMessagesRead`, `sendTyping`.
     - Nối Socket.IO vào cả 2 màn hình tin nhắn: `student/messages` và `admin/messages`, hiển thị chấm động trạng thái gõ phím (*Typing indicator*) và nhận tin nhắn mới ngay lập tức mà không cần reload.
     - Cập nhật `notifications.service.ts`: Tự động tham gia phòng thông báo `joinUserNotifications` và bắt sự kiện `notification_received`.
     - Nối vào `client/src/components/shared/app-topbar.tsx`: Quả chuông tự động tăng số lượng chưa đọc theo thời gian thực khi có thông báo từ hệ thống.

2. **Xây dựng Màn hình Quản trị Đề thi Writing cho Admin (`/admin/writing-prompts`)**:
   - Tạo mới giao diện `client/src/app/(admin)/admin/writing-prompts/page.tsx`.
   - Đầy đủ tính năng CRUD: Lọc theo Task 1 / Task 2, modal tạo mới đề thi, sửa đề thi, xóa đề thi, cấu hình số từ tối thiểu và thời gian giới hạn.
   - Nối trực tiếp với các API `POST /writing/prompts`, `PUT /writing/prompts/:id`, `DELETE /writing/prompts/:id` qua `writing.service.ts`.
   - Có tab điều hướng qua lại trực tiếp với trang chấm bài `admin/writing-review`.

3. **Xây dựng Màn hình Quản trị Đề thi Speaking cho Admin (`/admin/speaking-prompts`)**:
   - Tạo mới giao diện `client/src/app/(admin)/admin/speaking-prompts/page.tsx`.
   - Quản lý đề thi theo cấu trúc 3 phần chuẩn IELTS: Part 1 (Short Q&A), Part 2 (Cue Card + Bullet points gợi ý), Part 3 (In-depth Discussion).
   - Đầy đủ modal thêm, sửa, xóa đề thi nói, cấu hình thời gian chuẩn bị và thời gian thu âm.
   - Nối với `POST /speaking/prompts`, `PUT /speaking/prompts/:id`, `DELETE /speaking/prompts/:id` qua `speaking.service.ts`.
   - Có tab điều hướng qua lại trực tiếp với trang chấm điểm nói `admin/speaking-grading`.

4. **Quản lý Cây Giáo trình Sắp xếp Thứ tự Module & Bài học (Curriculum Reorder)**:
   - Nâng cấp giao diện `client/src/app/(admin)/admin/courses/page.tsx`.
   - Bổ sung nút điều khiển thứ tự (Up / Down) trực quan cho cả Cấp Chương (Module) và Cấp Bài học (Lesson).
   - Nối trực tiếp với API `POST /api/lessons/modules/reorder` và `POST /api/lessons/reorder` qua `lessons.service.ts`.

5. **Giao diện Làm bài IELTS Reading Chia Đôi Màn Hình (Cambridge Split-View)**:
   - Nâng cấp màn hình `client/src/app/(student)/student/quizzes/page.tsx` thành bố cục 2 cột độc lập chuẩn thi máy Cambridge:
     - **Cột Trái (Reading Passage)**: Hiển thị văn bản bài đọc, có thanh cuộn riêng biệt, tích hợp thanh công cụ đánh dấu / bôi màu từ khóa (*Highlighter Toolbar*).
     - **Cột Phải (Question Sheet)**: Hiển thị danh sách câu hỏi con với thanh cuộn riêng biệt.
   - Hỗ trợ các dạng câu hỏi nâng cao:
     - Trắc nghiệm truyền thống (`SINGLE_CHOICE`).
     - Điền khuyết (`FILL_BLANK`).
     - Kiểm tra đọc hiểu chuẩn Cambridge: `TRUE_FALSE_NOT_GIVEN` / `YES_NO_NOT_GIVEN`.

6. **Gạch Chân Lỗi Sai Trực Tiếp Trong Bài Viết (Writing Inline Error Highlighter)**:
   - Nâng cấp màn hình `client/src/app/(student)/student/writing/page.tsx`.
   - Thêm nút chuyển đổi chế độ xem: **"Soạn Thảo"** $\leftrightarrow$ **"Gạch Chân Lỗi Sai AI"**.
   - Phân tích trực tiếp kết quả đánh giá của AI để gạch chân lượn sóng (*wavy underlines*):
     - Màu đỏ: Lỗi ngữ pháp (*Grammar issue*).
     - Màu vàng hổ phách: Gợi ý nâng cấp từ vựng (*Lexical upgrade C1/C2*).
   - Rê chuột vào từ bị gạch chân sẽ hiển thị Tooltip giải thích chi tiết và từ đề xuất thay thế.

7. **Sóng Âm Động WaveSurfer & Ghim Tua Âm Thanh Trong Speaking Studio**:
   - Nâng cấp màn hình `client/src/app/(admin)/admin/speaking-grading/page.tsx`.
   - Hiển thị dải sóng âm tương tác trực quan mô phỏng bản ghi âm bài nói.
   - Bổ sung các điểm ghim nhận xét theo mốc thời gian (*Timestamp Marker Pins*): Khi Admin bấm vào nhận xét ở phút/giây cụ thể, audio player tự động tua đến đúng vị trí đó để thẩm định lại.
   - Hoàn thiện luồng nộp bài thu âm kèm file âm thanh nhị phân thật qua endpoint `POST /api/speaking/submissions/with-audio` (`speakingService.submitRecordingWithFile`).

8. **Chế độ Đọc Sách Toàn Màn Hình (Focus Book Reader UI)**:
   - Nâng cấp màn hình thư viện `client/src/app/(student)/student/library/page.tsx`.
   - Bổ sung chế độ Focus Mode toàn màn hình: Tự động ẩn thanh điều hướng và các panel không cần thiết để học viên chuyên tâm đọc tài liệu.
   - Tích hợp bộ điều khiển lật trang (Next / Prev) và ghi nhớ vị trí trang đang đọc dở vào `localStorage`.

9. **Biểu Đồ Tròn Chuyên Cần & Huy Hiệu Chuỗi Ngày Học Tập (Donut Chart & Streak)**:
   - Nâng cấp màn hình `client/src/app/(student)/student/attendance/page.tsx`.
   - Xây dựng biểu đồ tròn SVG Donut Chart trực quan tổng kết tỷ lệ phần trăm các buổi Có mặt (`PRESENT`), Đến muộn (`LATE`) và Vắng mặt (`ABSENT`).
   - Hiển thị huy hiệu chuỗi ngày chuyên cần (*Study Streak*) tạo động lực học tập.

10. **Loại Bỏ Cổng Thanh Toán Học Phí Trực Tuyến**:
    - Thực hiện đúng chỉ đạo của người dùng: Loại bỏ hoàn toàn hạng mục cổng thanh toán điện tử (VNPay/MoMo) khỏi phạm vi phát triển để giữ đúng mô hình xét duyệt học viên nội bộ.

11. **Mở Rộng & Nghiệm Thu 100% Cả 2 Bộ Kiểm Thử E2E**:
    - **Server E2E Suite**: Bổ sung Test Suite 30 (Curriculum Module & Lesson Reorder) và Test Suite 31 (Speaking Multipart Audio Submission), nâng tổng số test lên **135/135 tests PASS 100%**.
    - **Client E2E Suite**: Mở rộng từ 17 tests lên **31 tests PASS 100%** (17 suites) bao phủ toàn bộ các service mới: Socket.IO client, CRUD Prompts, Reorder, Quizzes nâng cao.
    - **Next.js Production Build**: Biên dịch thành công tuyệt đối **32/32 routes App Router** ($0$ lỗi TypeScript, $0$ lỗi ESLint).

---

# 2. TỔNG HỢP CÁC CẢI TIẾN & ĐIỂM MỚI ĐÃ HOÀN THÀNH

Sau đợt triển khai toàn diện, hệ thống ghi nhận **6 cột mốc hoàn thành quan trọng**:

1. **Bộ Đôi Quản Trị Đề Thi Hoàn Chỉnh (Writing & Speaking Prompts Admin UI)**:
   - Đã lấp đầy khoảng trống thiếu màn hình quản trị bằng 2 trang quản lý chuyên nghiệp tại `/admin/writing-prompts` và `/admin/speaking-prompts`.
2. **Hệ Thống Thời Gian Thực Đa Kênh Qua Socket.IO**:
   - Đã hiện thực hóa kết nối WebSocket 2 chiều trên 3 kênh nghiệp vụ trọng yếu: Khung Chat (`/chat`), Thông báo đẩy (`/notifications`) và Bảng trắng tương tác (`/whiteboard`).
3. **Trải Nghiệm Thi & Luyện Tập Đạt Tiêu Chuẩn Quốc Tế**:
   - Giao diện Cambridge Split-View với công cụ highlight từ khóa, hỗ trợ đa dạng câu hỏi đọc hiểu và gạch chân lỗi sai trực tiếp bằng AI.
4. **Studio Đánh Giá Nói Chuyên Nghiệp**:
   - Sóng âm trực quan, tua nhanh theo mốc thời gian nhận xét và khả năng tiếp nhận file ghi âm thực tế từ micro học viên.
5. **Thư Viện Tập Trung & Theo Dõi Chuyên Cần Trực Quan**:
   - Focus Book Reader ghi nhớ trang sách và biểu đồ Donut Chart chuyên cần.
6. **Bảo Đảm Chất Lượng Tuyệt Đối (Zero Regression)**:
   - 135 tests Server PASS + 31 tests Client PASS + 32 routes Next.js Build PASS.

---

# 3. TÌNH TRẠNG CÁC CHỨC NĂNG TRONG DANH MỤC BACKLOG SRS

Đối chiếu với danh mục tồn đọng ban đầu, dưới đây là tình trạng nghiệm thu chi tiết của từng hạng mục:

---

### 3.1. Các màn hình giao diện quản trị (Admin UI)

| STT | Tên chức năng | Tình trạng hiện tại | Chi tiết triển khai & Nghiệm thu |
|:---:|:---|:---:|:---|
| **1** | **Quản trị Ngân hàng Đề thi Writing cho Admin** | **ĐÃ HOÀN THÀNH 100%** | Đã tạo màn hình `client/src/app/(admin)/admin/writing-prompts/page.tsx`. Hỗ trợ đầy đủ CRUD Task 1 & 2, nối API Backend và có E2E test kiểm tra hợp đồng API. |
| **2** | **Quản trị Ngân hàng Đề thi Speaking cho Admin** | **ĐÃ HOÀN THÀNH 100%** | Đã tạo màn hình `client/src/app/(admin)/admin/speaking-prompts/page.tsx`. Hỗ trợ CRUD đề Part 1/2/3, cấu hình thời gian chuẩn bị/nói, nối API Backend và có E2E test. |
| **3** | **Quản lý Cây Giáo Trình Sắp xếp Thứ tự (Curriculum Reorder)** | **ĐÃ HOÀN THÀNH 100%** | Trang `admin/courses` đã tích hợp bộ điều khiển di chuyển thứ tự Up/Down cho Module và Lesson, kết nối `POST /lessons/modules/reorder` và `POST /lessons/reorder`. |

---

### 3.2. Các tính năng trải nghiệm người dùng chuyên sâu (Interactive UX/UI) theo chuẩn EdTech/IELTS

| STT | Tên chức năng | Tình trạng hiện tại | Chi tiết triển khai & Nghiệm thu |
|:---:|:---|:---:|:---|
| **4** | **Giao diện làm bài IELTS Reading Chia Đôi Màn Hình (Split-View)** | **ĐÃ HOÀN THÀNH 100%** | Trang `student/quizzes` đã nâng cấp bố cục 2 cột độc lập chuẩn Cambridge: Passage bên trái có thanh cuộn riêng + Highlighter bôi màu từ khóa; Question Sheet bên phải. |
| **5** | **Các dạng câu hỏi Quiz nâng cao (Fill in Blanks / True-False-Not Given)** | **ĐÃ HOÀN THÀNH 100%** | Đã hỗ trợ render và chấm điểm cho cả `FILL_BLANK`, `TRUE_FALSE_NOT_GIVEN` và `SINGLE_CHOICE` trên giao diện học viên. |
| **6** | **Gạch chân lỗi sai trực tiếp trong bài viết (Inline Error Highlighter)** | **ĐÃ HOÀN THÀNH 100%** | Trang `student/writing` bổ sung nút chuyển chế độ "Gạch Chân Lỗi Sai AI", hiển thị đường gạch chân lượn sóng đỏ/vàng kèm tooltip hướng dẫn sửa lỗi ngữ pháp và từ vựng. |
| **7** | **Sóng âm tương tác & Ghim tua âm thanh cho Speaking** | **ĐÃ HOÀN THÀNH 100%** | Trang `admin/speaking-grading` đã tích hợp visualizer sóng âm động và các ghim mốc thời gian; click vào nhận xét tự động tua audio đến đúng thời điểm phát âm sai. |
| **8** | **Chế độ đọc sách toàn màn hình (Focus Book Reader UI)** | **ĐÃ HOÀN THÀNH 100%** | Trang `student/library` đã bổ sung nút Focus Mode phóng to tài liệu toàn màn hình, thanh lật trang Next/Prev và ghi nhớ vị trí trang vào `localStorage`. |
| **9** | **Biểu đồ tròn Chuyên cần & Chuỗi ngày học tập (Donut Chart & Streak)** | **ĐÃ HOÀN THÀNH 100%** | Trang `student/attendance` đã tích hợp biểu đồ tròn SVG Donut Chart và huy hiệu chuỗi ngày chuyên cần (Study Streak). |

---

### 3.3. Các luồng kết nối hạ tầng dịch vụ & Socket.IO Realtime 2 chiều

| STT | Tên chức năng | Tình trạng hiện tại | Chi tiết triển khai & Nghiệm thu |
|:---:|:---|:---:|:---|
| **10** | **Đồng bộ Socket.IO Client 2 chiều thời gian thực cho Khung Chat & Thông báo** | **ĐÃ HOÀN THÀNH 100%** | Đã triển khai `socket.io-client` phía Frontend (`client/src/lib/socket.ts`), kết nối 2 chiều với NestJS Gateways (`/chat`, `/notifications`, `/whiteboard`), có hiển thị Typing indicator và chuông thông báo tự động cập nhật. |
| **11** | **Upload file ghi âm Speaking thật (`multipart/form-data`)** | **ĐÃ HOÀN THÀNH 100%** | Backend đã có endpoint `POST /api/speaking/submissions/with-audio` (`FileInterceptor('audioFile')`), Frontend `student/speaking` đã nối gửi blob nhị phân thật qua `submitRecordingWithFile`. |
| **12** | **Tích hợp dịch vụ gửi Email thông báo tự động (Nodemailer / SendGrid)** | **SẴN SÀNG CẤU HÌNH SAAS** | Hệ thống đã có cơ chế lưu trữ và thông báo nội bộ qua DB & Socket.IO. Phân hệ email sẵn sàng gắn cấu hình SMTP/SendGrid khi vận hành production. |
| **13** | **Cổng thanh toán học phí trực tuyến (VNPay / MoMo)** | **ĐÃ LOẠI BỎ THEO YÊU CẦU** | Đã loại bỏ hoàn toàn theo chỉ đạo rõ ràng của người dùng ("bỏ cái Cổng thanh toán học phí trực tuyến đi"). |

---

# 4. BẢNG MA TRẬN KẾT NỐI API TOÀN HỆ THỐNG ĐẾN THỜI ĐIỂM HIỆN TẠI (13/11/2026)

| Phân hệ chức năng | Endpoint Backend & WebSocket Gateway | Frontend Service & Màn hình | Tình trạng thực tế |
|:---|:---|:---|:---:|
| **Xác thực & Quản lý phiên** | `POST /api/auth/login`<br>`POST /api/auth/register`<br>`GET /api/auth/me`<br>`GET /api/auth/sessions`<br>`DELETE /api/auth/sessions/:id`<br>`POST /api/auth/change-password` | `auth.service.ts`<br>`(auth)/login`, `(auth)/register`<br>`/student/account`<br>`/admin/account` |  **Đã kết nối 100%** |
| **Quản lý học viên & Reset Pass** | `GET /api/users`<br>`POST /api/users`<br>`PATCH /api/users/:id/status`<br>`POST /api/users/:id/reset-password` | `users.service.ts`<br>`/admin/users` |  **Đã kết nối 100%** |
| **Khóa học, Cây giáo trình & Reorder** | `GET /api/courses`<br>`GET /api/courses/:slugOrId`<br>`POST /api/lessons/:id/complete`<br>`POST /api/lessons/modules/reorder`<br>`POST /api/lessons/reorder` | `courses.service.ts`<br>`lessons.service.ts`<br>`/student/courses`<br>`/admin/courses` |  **Đã kết nối 100%** |
| **Kho học liệu số & Thư viện (Focus Reader)** | `GET /api/materials`<br>`GET /api/materials/:id/view-token`<br>`POST /api/materials` | `materials.service.ts`<br>`/student/library`<br>`/admin/library` |  **Đã kết nối 100%** |
| **Lớp học WebRTC LiveKit & Bảng trắng** | `GET /api/livekit/rooms`<br>`POST /api/livekit/rooms`<br>`POST /api/livekit/token`<br>`POST /api/livekit/end-room`<br>`POST /api/livekit/mute-participant`<br>`POST /api/livekit/rooms/:name/whiteboard/stroke`<br>*(WebSocket `/whiteboard`)* | `livekit.service.ts`<br>`/student/classroom`<br>`/admin/classroom` |  **Đã kết nối 100%** |
| **AI Writing Studio, Tự động lưu nháp & CRUD Prompts** | `GET /api/writing/prompts`<br>`POST /api/writing/prompts`<br>`PUT /api/writing/prompts/:id`<br>`DELETE /api/writing/prompts/:id`<br>`POST /api/writing/submissions`<br>`POST /api/writing/drafts`<br>`GET /api/writing/drafts/:promptId`<br>`DELETE /api/writing/drafts/:promptId`<br>`POST /api/writing/admin/submissions/:id/approve` | `writing.service.ts`<br>`/student/writing`<br>`/admin/writing-review`<br>`/admin/writing-prompts` |  **Đã kết nối 100%** |
| **IELTS Speaking Studio, Multipart Upload & CRUD Prompts** | `GET /api/speaking/prompts`<br>`POST /api/speaking/prompts`<br>`PUT /api/speaking/prompts/:id`<br>`DELETE /api/speaking/prompts/:id`<br>`POST /api/speaking/submissions`<br>`POST /api/speaking/submissions/with-audio`<br>`POST /api/speaking/admin/submissions/:id/grade` | `speaking.service.ts`<br>`/student/speaking`<br>`/admin/speaking-grading`<br>`/admin/speaking-prompts` |  **Đã kết nối 100%** |
| **Ngân hàng đề thi Quiz, Split-View Reading & Chấm tức thì** | `GET /api/quizzes/skills/tests`<br>`POST /api/quizzes`<br>`PUT /api/quizzes/:id`<br>`POST /api/quizzes/:id/questions`<br>`POST /api/quizzes/:id/questions/bulk`<br>`POST /api/quizzes/:id/submit` | `quizzes.service.ts`<br>`/student/quizzes`<br>`/admin/quizzes` |  **Đã kết nối 100%** |
| **Điểm danh, SVG Donut Chart & Xuất Excel** | `GET /api/attendance/classrooms`<br>`PUT /api/attendance/:id/override`<br>`GET /api/attendance/export?startDate=&endDate=` | `attendance.service.ts`<br>`/student/attendance`<br>`/admin/attendance` |  **Đã kết nối 100%** |
| **Thông báo đẩy thời gian thực** | `GET /api/notifications`<br>`GET /api/notifications/unread-count`<br>`PUT /api/notifications/:id/read`<br>`PUT /api/notifications/read-all`<br>`DELETE /api/notifications/:id`<br>*(WebSocket `/notifications`)* | `notifications.service.ts`<br>`components/shared/app-topbar.tsx` |  **Đã kết nối 100% (REST API + Socket.IO)** |
| **Tin nhắn & Hội thoại 2 chiều** | `GET /api/chat/conversations`<br>`GET /api/chat/conversations/:id/messages`<br>`POST /api/chat/conversations/:id/messages`<br>`PUT /api/chat/conversations/:id/read`<br>*(WebSocket `/chat`)* | `chat.service.ts`<br>`/student/messages`<br>`/admin/messages` |  **Đã kết nối 100% (REST API + Socket.IO 2-way)** |
