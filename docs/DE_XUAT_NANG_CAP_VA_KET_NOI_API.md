# BÁO CÁO TIẾN ĐỘ THEO NGÀY: ĐỐI CHIẾU HỆ THỐNG VỚI SRS, TỔNG HỢP CÁC HẠNG MỤC ĐÃ GIẢI QUYẾT & DANH MỤC CẢI TIẾN TỒN ĐỌNG
**Dự án**: Teacher Dong Academy (LMS & WebRTC In-house EdTech Platform)  
**Tài liệu tham chiếu**: `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md`, `docs/SRS.md`, `docs/mock_test.html`, `docs/API_DOCUMENTATION.md`  
**Ngày lập báo cáo**: 13/11/2026  
**Trạng thái kiểm thử hệ thống**:
- Phía Server NestJS: **130/130 Test cases E2E PASS (100%)**
- Phía Client Next.js: **17/17 Test cases E2E PASS (100%)**
- Biên dịch Next.js Production: **30/30 Routes App Router PASS (100%)**

---

## MỤC LỤC BÁO CÁO
1. [NHẬT KÝ TIẾN ĐỘ THEO NGÀY: CÁC VẤN ĐỀ ĐÃ ĐƯỢC GIẢI QUYẾT](#1-nhật-ký-tiến-độ-theo-ngày-các-vấn-đề-đã-được-giải-quyết)
   - 1.1. Ngày 11/11/2026: Rà soát đối chiếu kiến trúc, lập ma trận API và phát hiện thiếu sót
   - 1.2. Ngày 12/11/2026: Đợt nâng cấp đột phá — Nối API Frontend, bổ sung Model DB, thêm 7 API mới và Test Suites
   - 1.3. Ngày 13/11/2026 (HÔM NAY): Nghiệm thu code mới pull về, sinh Prisma Client, kiểm thử 100% E2E và lập danh mục tồn đọng
2. [TỔNG HỢP CÁC CẢI TIẾN & ĐIỂM MỚI XUẤT HIỆN HÔM NAY (NGÀY 13/11/2026)](#2-tổng-hợp-các-cải-tiến--điểm-mới-xuất-hiện-hôm-nay-ngày-13112026)
3. [DANH MỤC CHI TIẾT CÁC CHỨC NĂNG CÒN LẠI CHƯA LÀM (BACKLOG TỒN ĐỌNG SO VỚI SRS)](#3-danh-mục-chi-tiết-các-chức-năng-còn-lại-chưa-làm-backlog-tồn-đọng-so-với-srs)
   - 3.1. Các màn hình giao diện quản trị (Admin UI) Backend đã có API nhưng Frontend chưa có màn hình
   - 3.2. Các tính năng trải nghiệm người dùng chuyên sâu (Interactive UX/UI) theo chuẩn EdTech/IELTS chưa được code
   - 3.3. Các luồng kết nối hạ tầng dịch vụ bên thứ ba & Socket.IO Realtime 2 chiều
4. [BẢNG MA TRẬN KẾT NỐI API TOÀN HỆ THỐNG ĐẾN THỜI ĐIỂM HIỆN TẠI (13/11/2026)](#4-bảng-ma-trận-kết-nối-api-toàn-hệ-thống-đến-thời-điểm-hiện-tại-13112026)

---

# 1. NHẬT KÝ TIẾN ĐỘ THEO NGÀY: CÁC VẤN ĐỀ ĐÃ ĐƯỢC GIẢI QUYẾT

---

### 1.1. Ngày 11/11/2026: Rà soát đối chiếu kiến trúc, lập ma trận API và phát hiện thiếu sót

> **Trọng tâm ngày 11/11**: Thiết lập nền móng kiến trúc, đối chiếu 11 phân hệ với tài liệu SRS, lập danh mục các lỗ hổng kết nối giữa Backend và Frontend (Commits: `f104651`, `c7c792d`).

####  Các vấn đề đã được giải quyết trong ngày 11/11/2026:
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

####  Các vấn đề đã được giải quyết trong ngày 12/11/2026:

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
   - Tạo mới service độc lập: [`client/src/services/chat.service.ts`](file:///d:/englishweb/client/src/services/chat.service.ts).
   - Nối trang `student/messages` và `admin/messages` với các API: `GET /chat/conversations`, `GET /messages`, `POST /messages`, `PUT /read`. Tin nhắn được lưu trữ vĩnh viễn trong MySQL thay vì mảng tạm thời `setTimeout`.
   - Xuất khẩu tập trung `chat.service` tại [`client/src/services/index.ts`](file:///d:/englishweb/client/src/services/index.ts).

#### B. Đợt Chiều 12/11 (Mở rộng Schema, 7 API mới & E2E Suites - Commit `1834414`):
6. **Mở rộng Prisma Database Schema (`server/prisma/schema.prisma`)**:
   - Bổ sung Model `Notification` & Enum `NotificationType` (`WRITING`, `SPEAKING`, `LIVE`, `QUIZ`, `SYSTEM`) kèm index `[userId, isRead]`.
   - Bổ sung Model `WritingDraft` với ràng buộc duy nhất `@@unique([userId, promptId])` phục vụ cơ chế tự động lưu nháp.
7. **Xây dựng trọn vẹn Phân hệ Thông báo mới (`server/src/modules/notifications/`)**:
   - Cung cấp đầy đủ 5 API: `GET /api/notifications` (phân trang, lọc chưa đọc), `GET /unread-count`, `PUT /:id/read`, `PUT /read-all`, `DELETE /:id`.
   - Tạo [`client/src/services/notifications.service.ts`](file:///d:/englishweb/client/src/services/notifications.service.ts).
   - Nối quả chuông thông báo trên `client/src/components/shared/app-topbar.tsx`: Hiển thị chấm đỏ số lượng chưa đọc, popover xem danh sách, click tự động đánh dấu đã đọc.
8. **Admin tạo học viên mới thủ công (`POST /api/users`)**:
   - Bổ sung `CreateUserDto` có validation (`fullName`, `email`, `phone`, `password`, `targetBand`, `role`). Tự động sinh mật khẩu mặc định `DongAcademy@2026` nếu Admin không nhập.
   - Nối modal `#addUserModal` trên `admin/users` gửi trực tiếp dữ liệu học viên mới lưu vào MySQL.
9. **Kho học liệu số toàn hệ thống (`GET /api/materials`)**:
   - Bổ sung endpoint lấy toàn bộ tài liệu có phân trang, tìm kiếm và lọc theo định dạng `fileType` (PDF, AUDIO).
   - Nối vào cả 2 trang thư viện: `student/library` và `admin/library`.
10. **Tự động lưu bản nháp bài viết Writing (Writing Auto-Save Drafts)**:
    - Bổ sung 3 API Backend: `POST /api/writing/drafts`, `GET /api/writing/drafts/:promptId`, `DELETE /api/writing/drafts/:promptId`.
    - Giao diện `student/writing` tự động lưu nháp mỗi 30 giây vào MySQL, tự động phục hồi nội dung khi học viên mở lại đề bài.
11. **Thanh đo số từ 3 phân đoạn màu & Print Shield**:
    - Trang `student/writing` được trang bị **3-Tier Word Count Progress Bar**: Đỏ (thiếu từ) $\rightarrow$ Vàng (sắp đạt) $\rightarrow$ Xanh lá (đạt chuẩn: $\ge 150$ từ cho Task 1 / $\ge 250$ từ cho Task 2).
    - Tích hợp lớp bảo vệ in ấn **Print Shield** (`@media print` và CSS che mờ) chống sao chép và chụp đề bài.
12. **Bổ sung API Quản trị Quiz**:
    - `POST /api/quizzes/:id/questions/bulk`: Cho phép Admin nhập một danh sách nhiều câu hỏi cùng lúc vào đề thi.
    - `PUT /api/quizzes/:id`: Cho phép cập nhật tiêu đề, mô tả, điểm sàn và thời gian làm bài của Quiz.
13. **Xuất báo cáo điểm danh Excel theo khoảng ngày tùy chọn**:
    - Mở rộng `GET /api/attendance/export?startDate=&endDate=`.
    - Trang `admin/attendance` bổ sung bộ chọn khoảng ngày (Date Range Picker) và nút xuất file Excel `.xlsx` trực tiếp từ máy chủ.
14. **Mở rộng hệ thống kiểm thử tự động E2E**:
    - Mở rộng bộ kiểm thử Server E2E (`server/test/app.e2e-spec.ts`) lên **130 tests** bao phủ toàn bộ 7 phân hệ mới.
    - Xây dựng bộ kiểm thử Client E2E mới (`client/test/e2e-fe.test.mjs`) gồm **17 tests** kiểm thử hợp đồng API phía Frontend.

---

### 1.3. Ngày 13/11/2026 (HÔM NAY): Nghiệm thu code mới pull về, sinh Prisma Client, kiểm thử 100% E2E và lập danh mục tồn đọng

> **Trọng tâm ngày 13/11**: Kiểm định toàn bộ mã nguồn vừa pull về từ remote, xử lý vấn đề tương thích môi trường cục bộ, nghiệm thu 100% chất lượng code và thiết lập bảng phân định rõ ràng giữa cái đã làm và cái chưa làm.

####  Các vấn đề đã được giải quyết trong ngày 13/11/2026:
1. **Kiểm tra và tiếp nhận mã nguồn mới (`git pull`)**:
   - Kéo thành công commit `1834414` từ tác giả *hoang cuong* (43 files thay đổi, 2.164 dòng code mới).
2. **Khắc phục lỗi thiếu kiểu dữ liệu Prisma Client cục bộ**:
   - Khi chạy test lần đầu gặp lỗi: `Property 'writingDraft' does not exist on type 'PrismaService'`.
   - **Xử lý triệt để**: Thực thi lệnh `node node_modules/prisma/build/index.js generate` trong thư mục `server/`, đồng bộ 2 model mới `Notification` và `WritingDraft` vào `@prisma/client`.
3. **Nghiệm thu toàn bộ Bộ Kiểm Thử E2E Test Suites**:
   - **Server E2E Suite**: Chạy lệnh `npm --prefix server run test:e2e` $\rightarrow$ **130/130 tests PASS 100%** (29 test suites hoàn thành trong ~8.1 giây).
   - **Client E2E Suite**: Chạy lệnh `npm --prefix client run test:e2e` $\rightarrow$ **17/17 tests PASS 100%** (9 phân hệ service contract pass hoàn hảo).
4. **Nghiệm thu Biên dịch Production phía Frontend (`npm run build`)**:
   - Chạy lệnh `npm --prefix client run build` $\rightarrow$ Toàn bộ **30/30 routes Next.js App Router** biên dịch thành công, $0$ lỗi TypeScript, $0$ lỗi ESLint.
5. **Hoàn thiện cấu trúc Export tập trung**:
   - Đảm bảo [`client/src/services/index.ts`](file:///d:/englishweb/client/src/services/index.ts) re-export đầy đủ cả `chat.service` và `notifications.service`.
6. **Lập Báo cáo đối chiếu hiện trạng và Danh mục tồn đọng**:
   - Đối chiếu từng tiêu chí của SRS và Interactive Prototype với code thực tế trên website.
   - Phân định rõ ràng: Những gì đã giải quyết xong vào ngày nào và những gì còn thiếu chưa làm.

---

# 2. TỔNG HỢP CÁC CẢI TIẾN & ĐIỂM MỚI XUẤT HIỆN HÔM NAY (NGÀY 13/11/2026)

Hôm nay (13/11/2026), sau khi pull code và nghiệm thu môi trường, hệ thống ghi nhận **5 điểm mới và cải tiến quan trọng**:

1. **Prisma Client Cục Bộ Đã Được Đồng Bộ Hoàn Toàn**:
   - Đã sinh lại mã nguồn Prisma Client tương thích hoàn toàn với 2 bảng dữ liệu mới: `notifications` và `writing_drafts`. Môi trường dev phía server hiện tại không còn bất kỳ cảnh báo đỏ hay lỗi thiếu thuộc tính nào.
2. **Hệ Thống Đạt Chuẩn 100% PASS Trên Cả 2 Bộ Test Suite**:
   - Lần đầu tiên toàn bộ dự án đạt chứng chỉ xanh: **130 test cases phía Backend** và **17 test cases phía Frontend** đều vượt qua tuyệt đối trong một lượt chạy tự động.
3. **Độ Ổn Định Biên Dịch Frontend Đạt Mức Tối Đa**:
   - Đã giải quyết triệt để lỗi ép kiểu `any` và các biến chưa sử dụng (`unused-vars`), đưa toàn bộ 30 trang giao diện của Next.js App Router về trạng thái sẵn sàng triển khai (Production Ready).
4. **Bản Báo Cáo Đối Chiếu Được Tái Cấu Trúc Theo Trục Thời Gian**:
   - Thay vì các đề xuất chung chung, tài liệu đã được chuyển đổi thành nhật ký tiến độ minh bạch theo từng ngày, giúp theo dõi chính xác thời điểm từng tính năng được đưa vào hoạt động.
5. **Bảng Danh Mục Tồn Đọng Được Khoanh Vùng Rõ Ràng**:
   - Xác định chính xác 10 tính năng còn lại cần lập trình tiếp theo mà không bị nhầm lẫn với các phần đã làm xong.

---

# 3. DANH MỤC CHI TIẾT CÁC CHỨC NĂNG CÒN LẠI CHƯA LÀM (BACKLOG TỒN ĐỌNG SO VỚI SRS)

Đối chiếu với tài liệu SRS và Mockup giao diện, dưới đây là danh sách toàn bộ các tính năng **HIỆN TẠI TRÊN TRANG WEB CHƯA CÓ HOẶC MỚI CÓ MỘT NỬA**:

---

### 3.1. Các màn hình giao diện quản trị (Admin UI) Backend đã có API nhưng Frontend chưa có màn hình

| STT | Tên chức năng chưa làm | Mô tả yêu cầu trong SRS | Hiện trạng Backend | Hiện trạng Frontend |
|:---:|:---|:---|:---|:---|
| **1** | **Quản trị Ngân hàng Đề thi Writing cho Admin** | Admin có màn hình chuyên biệt để xem danh sách, tạo mới đề bài (Task 1 / Task 2), sửa nội dung và xóa đề bài thi viết. | Đã có đầy đủ API CRUD:<br>`POST /writing/prompts`<br>`PUT /writing/prompts/:id`<br>`DELETE /writing/prompts/:id` | **CHƯA CÓ MÀN HÌNH**.<br>Admin hiện mới chỉ có trang duyệt bài (`admin/writing-review`), chưa có trang quản lý ngân hàng đề bài. |
| **2** | **Quản trị Ngân hàng Đề thi Speaking cho Admin** | Admin có màn hình xem danh sách, tạo mới câu hỏi Part 1, đề Part 2 (Cue Card + 4 gợi ý) và câu hỏi Part 3; chỉnh sửa hoặc xóa đề thi nói. | Đã có đầy đủ API CRUD:<br>`POST /speaking/prompts`<br>`PUT /speaking/prompts/:id`<br>`DELETE /speaking/prompts/:id` | **CHƯA CÓ MÀN HÌNH**.<br>Admin hiện mới chỉ có trang nghe và chấm điểm (`admin/speaking-grading`), chưa có trang quản lý danh mục đề bài nói. |
| **3** | **Quản lý Cây Giáo Trình Kéo - Thả (Curriculum Drag & Drop)** | Admin có thể kéo - thả trực quan để sắp xếp, hoán đổi vị trí của các Chương học (Module) và Bài học (Lesson) trong khóa học. | Đã có API hỗ trợ đổi thứ tự:<br>`POST /lessons/modules/reorder`<br>`POST /lessons/reorder` | **CHƯA CÓ GIAO DIỆN KÉO THẢ**.<br>Trang `admin/courses` hiện đang hiển thị dạng bảng tĩnh thông thường, chưa tích hợp thư viện kéo thả (như `@dnd-kit`). |

---

### 3.2. Các tính năng trải nghiệm người dùng chuyên sâu (Interactive UX/UI) theo chuẩn EdTech/IELTS chưa được code

| STT | Tên chức năng chưa làm | Mô tả yêu cầu trong SRS | Hiện trạng trên website |
|:---:|:---|:---|:---|
| **4** | **Giao diện làm bài IELTS Reading Chia Đôi Màn Hình (Split-View)** | Đối với các bài đọc dài hàng nghìn từ (`passage`) kèm nhóm câu hỏi con: Giao diện phải chia làm 2 cột độc lập (Cột trái: Đọc bài + Bôi màu highlight từ khóa; Cột phải: Chọn đáp án A, B, C, D) có thanh cuộn riêng biệt chuẩn thi máy Cambridge. | **CHƯA LÀM**.<br>Hiện tại trang `student/quizzes` hiển thị cuộn trang dọc 1 cột (đọc bài ở trên, câu hỏi ở dưới), học viên phải cuộn lên cuộn xuống liên tục gây bất tiện. |
| **5** | **Các dạng câu hỏi Quiz nâng cao (Fill in Blanks / True-False-Not Given)** | Hệ thống Quiz phải hỗ trợ dạng câu hỏi điền từ vào ô khuyết (`FILL_BLANK`) và dạng kiểm tra đọc hiểu đặc thù `TRUE_FALSE_NOT_GIVEN` / `YES_NO_NOT_GIVEN`. | **CHƯA LÀM TRÊN GIAO DIỆN**.<br>Hiện tại giao diện làm bài của học viên mới chỉ render dạng trắc nghiệm chọn 1 trong 4 phương án A, B, C, D (Single Choice). |
| **6** | **Gạch chân lỗi sai trực tiếp trong bài viết (Inline Error Highlighter)** | Sau khi AI chấm bài Writing xong, hệ thống phải gạch chân đỏ (lỗi ngữ pháp), gạch chân vàng (từ vựng lặp) trực tiếp trên các câu trong bài viết của học viên, click vào từ sẽ hiện tooltip giải thích và gợi ý từ vựng C1/C2 thay thế. | **CHƯA LÀM**.<br>Hiện tại gợi ý của AI mới chỉ được liệt kê thành danh sách ở cột bên phải, chưa có cơ chế bôi màu/gạch chân trực tiếp lên nội dung bài viết. |
| **7** | **Sóng âm tương tác WaveSurfer cho Speaking** | Khi Admin nghe lại bài nói của học viên: Audio player phải hiển thị sóng âm dạng WaveSurfer; khi bấm vào nhận xét ở giây thứ `00:45` thì audio tự động tua đến đúng giây đó và có ghim (marker pin) đánh dấu vị trí phát âm sai. | **CHƯA LÀM**.<br>Hiện đang dùng thẻ `<audio controls>` mặc định của trình duyệt, chưa tích hợp sóng âm động phát lại và chưa liên kết click vào comment để tua audio. |
| **8** | **Chế độ đọc sách toàn màn hình (Focus Book Reader UI)** | Thêm nút mở tài liệu PDF toàn màn hình trên `student/library`, tự động ẩn sidebar để học viên tập trung đọc sách, hỗ trợ lật trang mượt mà và lưu lại số trang đang đọc dở vào LocalStorage. | **CHƯA LÀM**.<br>Hiện tại tài liệu PDF hiển thị trong một khung iframe cố định, chưa có chế độ xem toàn màn hình và chưa ghi nhớ vị trí trang. |
| **9** | **Biểu đồ tròn Chuyên cần & Chuỗi ngày học tập (Donut Chart & Streak)** | Trang `student/attendance` hiển thị biểu đồ tròn Donut Chart tổng kết tỷ lệ chuyên cần trong tháng và huy hiệu chuỗi ngày học tập chăm chỉ (Study Streak). | **CHƯA LÀM**.<br>Hiện tại mới chỉ có bảng danh sách lịch sử các buổi học, chưa có biểu đồ trực quan. |

---

### 3.3. Các luồng kết nối hạ tầng dịch vụ bên thứ ba & Socket.IO Realtime 2 chiều

| STT | Tên chức năng chưa làm | Mô tả yêu cầu trong SRS | Hiện trạng trên website |
|:---:|:---|:---|:---|
| **10** | **Đồng bộ Socket.IO Client 2 chiều thời gian thực cho Khung Chat** | Khi Học viên nhắn tin cho Thầy Đông hoặc ngược lại, tin nhắn phải tự động xuất hiện ngay lập tức trên màn hình của người kia qua kết nối WebSocket (Socket.IO) mà không cần reload trang; hiển thị trạng thái đang soạn tin (*typing indicator*). | **CHƯA NỐI SOCKET.IO PHÍA FE**.<br>Backend đã có Gateway `chat.gateway.ts`. Frontend hiện mới chỉ chạy qua REST API fallback để lưu và tải tin nhắn từ DB. |
| **11** | **Upload file ghi âm Speaking thật (`multipart/form-data`) lên Cloudinary** | File thu âm từ micro của học viên phải được gửi trực tiếp dưới dạng file nhị phân lên máy chủ và lưu trữ tại Cloudinary CDN để Admin mở lên nghe được vĩnh viễn ở mọi nơi. | **CHƯA CÓ ENDPOINT MULTIPART**.<br>Hiện tại API nộp bài nhận chuỗi `audioUrl: string`, học viên gửi link blob cục bộ của trình duyệt. |
| **12** | **Tích hợp dịch vụ gửi Email thông báo tự động (Nodemailer / SendGrid)** | Khi học viên được Admin tạo tài khoản mới, khi có thông báo lớp học sắp diễn ra, hoặc khi Thầy giáo đã duyệt bài Writing/Speaking: Hệ thống gửi email thông báo về hòm thư người dùng. | **CHƯA TÍCH HỢP**.<br>Hệ thống hiện mới chỉ lưu thông báo nội bộ vào database và hiển thị lên chuông Topbar, chưa có dịch vụ gửi email ra ngoài Internet. |
| **13** | **Cổng thanh toán học phí trực tuyến (VNPay / MoMo)** | Học viên có thể thanh toán học phí trực tuyến qua cổng thanh toán điện tử để hệ thống tự động kích hoạt khóa học vào tài khoản. | **CHƯA TÍCH HỢP**.<br>Hiện tại học viên được kích hoạt tham gia khóa học thủ công bởi Admin. |

---

# 4. BẢNG MA TRẬN KẾT NỐI API TOÀN HỆ THỐNG ĐẾN THỜI ĐIỂM HIỆN TẠI (13/11/2026)

| Phân hệ chức năng | Endpoint Backend | Frontend Service & Màn hình | Tình trạng thực tế |
|:---|:---|:---|:---:|
| **Xác thực & Quản lý phiên** | `POST /api/auth/login`<br>`POST /api/auth/register`<br>`GET /api/auth/me`<br>`GET /api/auth/sessions`<br>`DELETE /api/auth/sessions/:id`<br>`POST /api/auth/change-password` | `auth.service.ts`<br>`(auth)/login`, `(auth)/register`<br>`/student/account`<br>`/admin/account` |  **Đã kết nối 100%** |
| **Quản lý học viên & Reset Pass** | `GET /api/users`<br>`POST /api/users`<br>`PATCH /api/users/:id/status`<br>`POST /api/users/:id/reset-password` | `users.service.ts`<br>`/admin/users` |  **Đã kết nối 100%** |
| **Khóa học & Cây giáo trình** | `GET /api/courses`<br>`GET /api/courses/:slugOrId`<br>`POST /api/lessons/:id/complete` | `courses.service.ts`<br>`lessons.service.ts`<br>`/student/courses`<br>`/admin/courses` |  **Đã kết nối 100%** |
| **Kho học liệu số & Thư viện** | `GET /api/materials`<br>`GET /api/materials/:id/view-token`<br>`POST /api/materials` | `materials.service.ts`<br>`/student/library`<br>`/admin/library` |  **Đã kết nối 100%** |
| **Lớp học WebRTC LiveKit** | `GET /api/livekit/rooms`<br>`POST /api/livekit/rooms`<br>`POST /api/livekit/token`<br>`POST /api/livekit/end-room`<br>`POST /api/livekit/mute-participant`<br>`POST /api/livekit/rooms/:name/whiteboard/stroke` | `livekit.service.ts`<br>`/student/classroom`<br>`/admin/classroom` |  **Đã kết nối 100%** |
| **AI Writing Studio & Tự động lưu nháp** | `GET /api/writing/prompts`<br>`POST /api/writing/submissions`<br>`POST /api/writing/drafts`<br>`GET /api/writing/drafts/:promptId`<br>`DELETE /api/writing/drafts/:promptId`<br>`POST /api/writing/admin/submissions/:id/approve` | `writing.service.ts`<br>`/student/writing`<br>`/admin/writing-review` |  **Đã kết nối 100%** |
| **IELTS Speaking Studio** | `GET /api/speaking/prompts`<br>`POST /api/speaking/submissions`<br>`POST /api/speaking/admin/submissions/:id/grade` | `speaking.service.ts`<br>`/student/speaking`<br>`/admin/speaking-grading` |  **Đã kết nối 100%** |
| **Ngân hàng đề thi Quiz & Chấm tức thì** | `GET /api/quizzes/skills/tests`<br>`POST /api/quizzes`<br>`PUT /api/quizzes/:id`<br>`POST /api/quizzes/:id/questions`<br>`POST /api/quizzes/:id/questions/bulk`<br>`POST /api/quizzes/:id/submit` | `quizzes.service.ts`<br>`/student/quizzes`<br>`/admin/quizzes` |  **Đã kết nối 100%** |
| **Điểm danh & Xuất Excel theo ngày** | `GET /api/attendance/classrooms`<br>`PUT /api/attendance/:id/override`<br>`GET /api/attendance/export?startDate=&endDate=` | `attendance.service.ts`<br>`/student/attendance`<br>`/admin/attendance` |  **Đã kết nối 100%** |
| **Thông báo thời gian thực** | `GET /api/notifications`<br>`GET /api/notifications/unread-count`<br>`PUT /api/notifications/:id/read`<br>`PUT /api/notifications/read-all`<br>`DELETE /api/notifications/:id` | `notifications.service.ts`<br>`components/shared/app-topbar.tsx` |  **Đã kết nối 100%** |
| **Tin nhắn & Hội thoại** | `GET /api/chat/conversations`<br>`GET /api/chat/conversations/:id/messages`<br>`POST /api/chat/conversations/:id/messages`<br>`PUT /api/chat/conversations/:id/read` | `chat.service.ts`<br>`/student/messages`<br>`/admin/messages` |  **Đã kết nối 100% (REST API)**<br>*(Chờ nhúng Socket.IO Client)* |
