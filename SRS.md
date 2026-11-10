# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## DỰ ÁN: TEACHER DONG ACADEMY – NỀN TẢNG ĐÀO TẠO TRỰC TUYẾN
### Standard: IEEE 830 / ISO/IEC/IEEE 29148 Compliant

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
3. [ĐẶC TẢ CHI TIẾT 11 PHÂN HỆ CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)](#3-đặc-tả-chi-tiết-11-phân-hệ-chức-năng-functional-requirements)
   - FR-01: Phân hệ Xác thực & Quản lý Phiên (Authentication & Single Session)
   - FR-02: Phân hệ Đa Ngôn Ngữ (Internationalization - i18n)
   - FR-03: Phân hệ Quản lý Đào tạo & Khóa học (LMS Course Hierarchy)
   - FR-04: Phân hệ Kho Học liệu Số Bảo mật (Secured Digital Library)
   - FR-05: Phân hệ Lớp học Trực tuyến WebRTC (LiveKit Live Classroom)
   - FR-06: Phân hệ Luyện viết IELTS Writing Chấm bằng AI (AI Writing Assessment)
   - FR-07: Phân hệ Luyện nói & Chấm điểm IELTS Speaking (Speaking Studio)
   - FR-08: Phân hệ Kiểm tra & Trắc nghiệm (Quiz Engine)
   - FR-09: Phân hệ Điểm danh Tự động & Báo cáo Chuyên cần (Automated Attendance)
   - FR-10: Phân hệ Dashboard & Thống kê Học tập (Dashboard & Analytics)
   - FR-11: Phân hệ Nhắn tin Thời gian thực (Realtime Chat & Messaging)
4. [YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)](#4-yêu-cầu-phi-chức-năng-non-functional-requirements)
   - 4.1 Yêu cầu về Hiệu năng (Performance)
   - 4.2 Yêu cầu về An toàn & Bảo mật (Security)
   - 4.3 Khả năng sẵn sàng & Phục hồi (Reliability & Availability)
   - 4.4 Khả năng tương thích & Giao diện (Compatibility & Usability)
5. [MÔ HÌNH DỮ LIỆU & KIẾN TRÚC TỔ CHỨC MÃ NGUỒN](#5-mô-hình-dữ-liệu--kiến-trúc-tổ-chức-mã-nguồn)
   - 5.1 Cấu trúc Cơ sở dữ liệu Prisma Schema
   - 5.2 Kiến trúc thư mục chuẩn Monorepo (Core vs Modules)
6. [KẾ HOẠCH BÀN GIAO & 14 TIÊU CHÍ NGHIỆM THU](#6-kế-hoạch-bàn-giao--14-tiêu-chí-nghiệm-thu)
   - 6.1 Lộ trình 6 tuần triển khai
   - 6.2 14 Tiêu chí nghiệm thu chức năng chuẩn (Acceptance Criteria)

---

## 1. GIỚI THIỆU TỔNG QUAN (INTRODUCTION)

### 1.1 Mục đích tài liệu
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này xác định toàn bộ phạm vi chức năng, yêu cầu phi chức năng, kiến trúc kỹ thuật, mô hình dữ liệu và các tiêu chí nghiệm thu cho hệ thống **Teacher Dong Academy**. Đây là căn cứ pháp lý và kỹ thuật duy nhất phục vụ đội ngũ phát triển, kiểm thử, quản trị dự án và nghiệm thu với khách hàng.

### 1.2 Phạm vi sản phẩm
**Teacher Dong Academy** là hệ thống giáo dục trực tuyến (EdTech) hiện đại chuẩn All-in-One, kết hợp giữa:
- Hệ thống Quản lý Đào tạo (LMS) cho 5 trụ cột chương trình: Tiếng Anh (IELTS, Business, Kids), Năng lực Sư phạm & Ứng dụng AI, Kỹ năng sống.
- Lớp học trực tuyến WebRTC độ trễ siêu thấp (< 150ms) trên nền tảng LiveKit SFU (1 Host + 7-8 Học viên) tích hợp bảng trắng tương tác (Whiteboard).
- Phòng luyện viết AI IELTS Writing Studio (Task 1 & 2) phân tích 4 tiêu chí với quy trình phê duyệt của giáo viên.
- Studio thu âm luyện nói IELTS Speaking hiển thị sóng âm thời gian thực với bộ công cụ chấm điểm 4 tiêu chí và timestamp comments của Admin.
- Hệ thống thi trắc nghiệm (Quiz Engine) tự động chấm và kiểm soát mở khóa bài học tiếp theo.
- Hệ thống điểm danh tự động dựa trên thời gian tham gia thực tế từ webhook LiveKit và xuất báo cáo Excel (.xlsx).

### 1.3 Mô hình 2 vai trò duy nhất (Strict 2-Role RBAC)
Hệ thống được thiết kế theo nguyên tắc tối giản, phân quyền nghiêm ngặt với **ĐÚNG 2 VAI TRÒ**:
1. `STUDENT` (Học viên): Học bài, làm bài trắc nghiệm, nộp bài viết Writing, ghi âm bài Speaking, tham gia lớp WebRTC, vẽ bảng trắng khi được cấp quyền, theo dõi tiến độ và nhận xét.
2. `ADMIN` (Quản trị viên kiêm Giáo viên): Toàn quyền quản trị hệ thống, quản lý tài khoản, tạo và sửa khóa học/bài học, tải học liệu, duyệt điểm AI Writing, nghe và chấm bài Speaking, làm Host lớp LiveKit (bật/tắt mic/cam, phân quyền bảng trắng), quản lý điểm danh và xuất báo cáo.
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
- Đặc tả chi tiết màn hình & trường dữ liệu: [docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md](file:///D:/Project/englishweb/docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md)
- Đặc tả RESTful API & WebSocket: [docs/API_DOCUMENTATION.md](file:///D:/Project/englishweb/docs/API_DOCUMENTATION.md) (Swagger UI: `http://localhost:3001/api/docs`)
- Interactive Prototype: [docs/mock_test.html](file:///D:/Project/englishweb/docs/mock_test.html)

---

## 2. MÔ TẢ TỔNG QUAN HỆ THỐNG (OVERALL DESCRIPTION)

### 2.1 Bối cảnh & Kiến trúc Monorepo
Hệ thống được tổ chức theo mô hình Monorepo đồng nhất:
- **Client (`/client`)**: Next.js 14+ (App Router, React 18, TypeScript), Tailwind CSS, shadcn/ui (Tone màu Sky Blue / Slate), LiveKit React Components, Web Audio API.
- **Server (`/server`)**: NestJS (TypeScript), Prisma ORM, MySQL 8.0, JWT HttpOnly Cookies, Socket.IO, LiveKit Server SDK, Swagger OpenAPI.
- **Infrastructure**: Container hóa hoàn chỉnh bằng Docker Compose (MySQL 8.0, LiveKit SFU, NestJS Backend, Next.js Frontend, Nginx Reverse Proxy).

### 2.2 Đặc tính người dùng
- **Học viên**: Đa dạng đối tượng (học sinh, sinh viên, người đi làm, học viên quốc tế). Giao diện trực quan, hỗ trợ 4 ngôn ngữ (VI, EN, ZH, JA), thao tác 1 chạm vào lớp học, phản hồi học tập tức thì.
- **Admin (Teacher Dong)**: Cần giao diện quản trị tập trung (Dashboard), các công cụ duyệt điểm AI Writing nhanh chóng, giao diện chấm Speaking tiện lợi (phím tắt, tua +/- 5s, timestamp feedback) và quản lý chuyên cần chính xác.

### 2.3 Các ràng buộc thiết kế & bảo mật
1. **Single Concurrent Session**: Áp dụng đối với học viên. Đăng nhập mới trên thiết bị khác lập tức vô hiệu hóa phiên cũ.
2. **Bảo vệ tài liệu số**: PDF và Audio lưu trữ riêng tư, không cung cấp link tải gốc, chỉ cấp Presigned URL 15 phút, vẽ Dynamic Watermark liên tục di chuyển trên canvas.
3. **Phân tầng Backend**: Phân chia rõ `server/src/core/` (Hạ tầng dùng chung: common, livekit, prisma) và `server/src/modules/` (Nghiệp vụ: auth, courses, quizzes, speaking, writing...).

---

## 3. ĐẶC TẢ CHI TIẾT 11 PHÂN HỆ CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### FR-01: Phân hệ Xác thực & Quản lý Phiên (Authentication & Session)
- **FR-1.1**: Đăng ký tài khoản học viên bằng Email & Mật khẩu. Mặc định gán vai trò `STUDENT`.
- **FR-1.2**: Đăng nhập Email & Mật khẩu. Hỗ trợ xác thực kép: Access Token (15 phút) và Refresh Token (7 ngày) lưu trữ trong HTTP-Only Cookie.
- **FR-1.3 (Single Concurrent Session)**: Đối với học viên, khi đăng nhập trên thiết bị mới, hệ thống tự động thu hồi (`revokedAt = now()`) các Refresh Token đang hoạt động trước đó. Thiết bị cũ gọi request tiếp theo nhận lỗi `401 Unauthorized`. Vai trò `ADMIN` không bị giới hạn phiên.
- **FR-1.4 (Google OAuth 2.0)**:
  - Đăng nhập và tự động tạo tài khoản học viên qua Google OAuth.
  - Liên kết tài khoản Google với tài khoản Email/Password hiện có.
  - Hủy liên kết tài khoản Google (chỉ khi tài khoản đã thiết lập mật khẩu nội bộ).
- **FR-1.5**: Đổi mật khẩu tài khoản (yêu cầu mật khẩu cũ) và tự động đăng xuất tất cả các phiên khác.
- **FR-1.6**: Quản lý phiên đăng nhập: Xem danh sách các phiên đang hoạt động (`GET /api/auth/sessions`), thu hồi từ xa một phiên (`DELETE /api/auth/sessions/:id`), hoặc đăng xuất tất cả thiết bị (`POST /api/auth/logout-all`).
- **FR-1.7**: Giới hạn số lần đăng nhập sai liên tiếp để phòng chống tấn công Brute-force.

### FR-02: Phân hệ Đa Ngôn Ngữ (Internationalization - i18n)
- **FR-2.1**: Hỗ trợ đầy đủ 4 ngôn ngữ: Tiếng Việt (`vi`), Tiếng Anh (`en`), Tiếng Trung giản thể (`zh`), Tiếng Nhật (`ja`).
- **FR-2.2**: Chuyển đổi ngôn ngữ tức thì qua dropdown menu trên Header mà không cần tải lại trang.
- **FR-2.3**: Tự động nhận diện ngôn ngữ theo cài đặt trình duyệt đối với khách vãng lai.
- **FR-2.4**: Đồng bộ ngôn ngữ đã chọn vào trường `preferredLang` trong hồ sơ học viên khi đã đăng nhập.
- **FR-2.5**: Định dạng ngày tháng, múi giờ và số liệu theo chuẩn của từng quốc gia.

### FR-03: Phân hệ Quản lý Đào tạo & Khóa học (LMS Course Hierarchy)
- **FR-3.1**: Cấu trúc khóa học phân cấp 4 tầng:
  $$\text{Course (Khóa học)} \longrightarrow \text{Module (Chương)} \longrightarrow \text{Lesson (Bài học)} \longrightarrow \text{Components (Học liệu, Quiz, Speaking, Writing)}$$
- **FR-3.2 (5 Trụ cột chương trình)**:
  1. *English Proficiency*: IELTS Intensive, Business English Communication, English for Kids.
  2. *Professional Development*: Ứng dụng AI trong giảng dạy, Prompt Engineering, Phương pháp sư phạm.
  3. *Life Skills*: Tư duy phản biện, Thuyết trình, Quản trị thời gian.
  4. *Life Experiences*: Tư vấn du học, Định cư, Kinh nghiệm sống quốc tế.
  5. *Travel & Culture Blog*: Khám phá văn hóa toàn cầu.
- **FR-3.3**: Học viên xem danh sách khóa học, xem chi tiết đề cương, đăng ký khóa học, theo dõi % hoàn thành khóa học trên thanh tiến độ trực quan.
- **FR-3.4 (Admin)**: CRUD khóa học, sắp xếp thứ tự chương học/bài học (`orderIndex`), tải lên video bài giảng, gắn các bài kiểm tra trắc nghiệm, bài tập Writing và Speaking vào bài học.

### FR-04: Phân hệ Kho Học liệu Số Bảo mật (Secured Digital Library)
- **FR-4.1**: Hỗ trợ 2 định dạng học liệu chính: Tài liệu PDF và Tệp âm thanh Audio MP3.
- **FR-4.2**: Trình xem PDF trực tiếp trên giao diện website, hỗ trợ lật trang, zoom, toàn màn hình.
- **FR-4.3**: Trình phát Audio MP3 tích hợp thanh điều khiển, tua tiến/lùi, điều chỉnh âm lượng.
- **FR-4.4 (Chống rò rỉ học liệu)**:
  - Tuyệt đối không cung cấp nút tải trực tiếp file gốc về máy.
  - Vô hiệu hóa chuột phải (`contextmenu`), phím tắt lưu trang (`Ctrl+S`, `Ctrl+P`).
  - Học liệu lưu tại Private Storage, phân phối qua Presigned URL thời hạn tối đa 15 phút.
- **FR-4.5 (Dynamic Watermark)**:
  - Lớp phủ Canvas hiển thị thông tin định danh: `[Họ tên học viên] - [Mã học viên] - [SĐT] - [Thời gian]`.
  - Watermark tự động dịch chuyển vị trí ngẫu nhiên theo chu kỳ (15-20s) trên màn hình nhằm vô hiệu hóa các hành vi quay lén hoặc chụp màn hình.

### FR-05: Phân hệ Lớp học Trực tuyến WebRTC (Live Classroom)
- **FR-5.1 (Quy mô & Hạ tầng)**: 01 Admin làm Host + 7-8 Học viên tham gia đồng thời. Độ trễ âm thanh/hình ảnh < 150ms trên nền tảng LiveKit SFU.
- **FR-5.2 (Giao diện phòng học)**: Grid camera thông minh: 1 ô Host lớn nổi bật và 7 ô học viên bố trí hợp lý bên cạnh hoặc bên dưới.
- **FR-5.3 (Quyền học viên)**: Bật/tắt Micro và Camera cá nhân, Giơ tay phát biểu, Chia sẻ màn hình (khi Host cho phép), Tham gia tương tác bảng trắng (khi Host cấp quyền).
- **FR-5.4 (Quyền Admin Host)**:
  - Quản trị phòng học: Bắt đầu/Kết thúc buổi học (`endRoom`), Mute mic hoặc tắt camera của học viên, Kick học viên ra khỏi phòng.
  - Quản lý quyền tương tác trên bảng trắng của từng học viên.
- **FR-5.5 (Bảng trắng tương tác - Interactive Whiteboard)**:
  - Công cụ: Bút vẽ tự do, Bút highlight, Tẩy, Hình khối (chữ nhật, tròn, mũi tên), Nhập văn bản.
  - Đồng bộ nét vẽ thời gian thực giữa Host và Học viên thông qua LiveKit DataChannels không phụ thuộc server trung gian.

### FR-06: Phân hệ Luyện viết IELTS Writing Chấm bằng AI (AI Writing Assessment)
- **FR-6.1**: Hỗ trợ luyện viết IELTS Writing Task 1 (tối thiểu 150 từ, gợi ý 20 phút) và Task 2 (tối thiểu 250 từ, gợi ý 40 phút).
- **FR-6.2**: Trình soạn thảo văn bản trực quan tích hợp bộ đếm từ trực tiếp (Real-time Word Counter), đồng hồ đếm ngược thời gian làm bài, tự động lưu bản nháp (Auto-save).
- **FR-6.3 (Đánh giá AI theo 4 tiêu chí chuẩn IELTS)**:
  1. *Task Achievement / Task Response (TR)*: Phân tích độ hoàn thiện đề bài, luận điểm.
  2. *Coherence & Cohesion (CC)*: Đánh giá tính liên kết và phân đoạn bài viết.
  3. *Lexical Resource (LR)*: Đánh giá độ phong phú và độ chính xác của từ vựng.
  4. *Grammatical Range & Accuracy (GRA)*: Đánh giá sự đa dạng cấu trúc và lỗi ngữ pháp.
- **FR-6.4**: AI tạo điểm thành phần từng tiêu chí, điểm Overall Band, nhận xét chi tiết, danh sách từ vựng gợi ý nâng cao (C1/C2 vocabulary) và bài viết tham khảo mẫu Band 8.0+.
- **FR-6.5 (Human-in-the-Loop Admin Approval)**:
  - Kết quả phân tích của AI ở trạng thái chờ duyệt (`AI_EVALUATED`), học viên chưa xem được điểm ngay.
  - Admin xem bài nộp và phân tích của AI, có toàn quyền điều chỉnh điểm số và bổ sung lời nhận xét của giáo viên.
  - Admin nhấn "Phê duyệt" ➔ Trạng thái chuyển thành `APPROVED` và công bố cho học viên.

### FR-07: Phân hệ Luyện nói & Chấm điểm IELTS Speaking (Speaking Studio)
- **FR-7.1**: Học viên nhận đề bài Speaking, hướng dẫn làm bài và nghe Audio phát âm mẫu từ giáo viên.
- **FR-7.2 (Ghi âm sóng âm)**: Thu âm trực tiếp qua trình duyệt bằng Web Audio API, hiển thị sóng âm thanh thời gian thực (Audio Waveform), đồng hồ bấm giờ (min 30s - max 120s), nghe lại, thu âm lại và nộp bài.
- **FR-7.3 (Admin Chấm Thủ Công - Không Dùng AI)**:
  - Audio Player chuyên dụng: Tua nhanh/chậm (0.75x, 1x, 1.25x, 1.5x, 2x), nút tua tiến/lùi 5 giây (`-5s` / `+5s`), thanh trượt sóng âm.
  - Chấm điểm 4 tiêu chí IELTS Speaking: Fluency & Coherence (FC), Lexical Resource (LR), Grammatical Range & Accuracy (GRA), Pronunciation (PR) và Overall Band Score.
  - **Timestamp Comments**: Admin gắn nhận xét tại mốc giây cụ thể của bản ghi âm (ví dụ: `00:23 - Chú ý phát âm ending sound /s/`). Học viên click vào nhận xét sẽ tự động nhảy đến đúng giây đó trên audio.

### FR-08: Phân hệ Kiểm tra & Trắc nghiệm (Quiz Engine)
- **FR-8.1**: Hỗ trợ 3 định dạng câu hỏi trắc nghiệm:
  1. *Single Choice*: Chọn 1 đáp án đúng duy nhất.
  2. *Multiple Choice*: Chọn nhiều đáp án đúng.
  3. *Fill in the Blanks*: Điền từ khuyết vào chỗ trống.
- **FR-8.2**: Đồng hồ đếm ngược thời gian làm bài thi; tự động thu bài khi hết giờ.
- **FR-8.3**: Tự động chấm điểm ngay khi nộp bài; hiển thị điểm số, tỷ lệ %, band điểm tương đương và trạng thái ĐẠT / CHƯA ĐẠT.
- **FR-8.4 (Sàn điểm mở khóa bài học)**:
  - Yêu cầu điểm số $\ge 80\%$ để đạt yêu cầu.
  - Khi đạt yêu cầu, hệ thống tự động mở khóa (Unlock) bài học kế tiếp trong lộ trình đào tạo.
- **FR-8.5**: Cung cấp lời giải thích chi tiết (Explanation) và chiến thuật làm bài cho từng câu hỏi sau khi nộp bài.

### FR-09: Phân hệ Điểm danh Tự động & Báo cáo Chuyên cần (Automated Attendance)
- **FR-9.1 (Webhook LiveKit)**: Tự động ghi nhận thời gian vào (`firstJoinedAt`), thời gian ra (`lastLeftAt`) và tính tổng thời lượng học thực tế theo phút (`totalMinutes`).
- **FR-9.2 (Quy tắc xác định chuyên cần)**:
  - `PRESENT` (Có mặt): Tham gia trong vòng **15 phút đầu tiên** kể từ giờ bắt đầu VÀ tổng thời lượng tham gia đạt **$\ge 80\%$** thời lượng buổi học.
  - `LATE` (Đi muộn): Tham gia sau 15 phút đầu tiên của buổi học.
  - `ABSENT` (Vắng mặt): Không tham gia buổi học HOẶC thời gian tham gia dưới **$30\%$** thời lượng buổi học.
- **FR-9.3**: Admin có quyền xem log chi tiết vào/ra, điều chỉnh thủ công trạng thái chuyên cần (`isManualOverride = true`) kèm lý do ghi chú (`note`).
- **FR-9.4**: Xuất báo cáo điểm danh theo buổi học hoặc toàn bộ khóa học dưới định dạng file Excel (`.xlsx`).

### FR-10: Phân hệ Dashboard & Thống kê Học tập (Dashboard & Analytics)
- **FR-10.1 (Dashboard Học viên)**:
  - Hiển thị danh sách khóa học đang theo học kèm thanh tiến độ hoàn thành.
  - Lịch học trực tuyến sắp tới kèm nút "Vào phòng học ngay" 1 chạm.
  - Danh sách bài tập Quiz, Writing, Speaking cần nộp và hạn chót.
  - Kết quả điểm số các bài tập đã được giáo viên chấm/duyệt gần nhất.
- **FR-10.2 (Dashboard Admin)**:
  - Thống kê tổng số học viên active, tổng số khóa học, tổng số bài học.
  - Số lượng bài Writing chờ AI duyệt và bài Speaking chờ giáo viên chấm.
  - Biểu đồ tỷ lệ chuyên cần trung bình của các lớp học gần đây.
  - Tiến độ học tập chung của toàn bộ học viên trong hệ thống.

### FR-11: Phân hệ Nhắn tin Thời gian thực (Realtime Chat & Messaging)
- **FR-11.1**: Kênh trao đổi trực tiếp 1-1 giữa Admin và Học viên qua Socket.IO thời gian thực.
- **FR-11.2**: Hiển thị danh sách hội thoại, số tin nhắn chưa đọc (Unread badge), trạng thái tin nhắn đã gửi/đã đọc.
- **FR-11.3**: Lưu trữ toàn bộ lịch sử trò chuyện trong cơ sở dữ liệu (`Conversation`, `Message`), đảm bảo bảo mật và phân quyền dữ liệu nghiêm ngặt.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 4.1 Yêu cầu về Hiệu năng (Performance)
- Tải trang tĩnh và Server-Side Rendering (SSR): Thời gian phản hồi trang dưới **1.5 giây**.
- Độ trễ âm thanh/hình ảnh phòng học WebRTC LiveKit: Dưới **150ms**.
- Thời gian phân tích bài viết của AI: Dưới **15 giây**.
- Khả năng phục vụ đồng thời: Tối thiểu **100 học viên** truy cập và làm bài cùng lúc.

### 4.2 Yêu cầu về An toàn & Bảo mật (Security)
- Toàn bộ mật khẩu người dùng được băm an toàn bằng thuật toán **Bcrypt** với salt round $\ge 10$.
- Token xác thực JWT gồm Access Token (15m) và Refresh Token (7d) được lưu trong **HTTP-Only Cookies** với các cờ `Secure`, `SameSite=Lax`.
- Áp dụng cơ chế **Single Concurrent Session** cho toàn bộ học viên nhằm bảo vệ bản quyền tài khoản.
- Tài liệu học tập lưu tại Private Storage, phân phối qua Presigned URL thời hạn 15 phút và bảo vệ bằng Dynamic Watermark.
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

### 5.1 Cấu trúc Cơ sở dữ liệu Prisma Schema (11 Models Cốt Lõi)
```
users                  -> Quản lý tài khoản, vai trò (STUDENT/ADMIN), ngôn ngữ (preferredLang)
refresh_tokens         -> Quản lý phiên, deviceId, ipAddress, cơ chế Single Concurrent Session
google_accounts        -> Thông tin liên kết tài khoản Google OAuth 2.0
courses                -> Danh mục khóa học (5 trụ cột chương trình)
course_modules         -> Chương học thuộc khóa học
lessons                -> Bài học thuộc chương học
materials              -> Học liệu PDF / Audio có bảo vệ và watermark
enrollments            -> Đăng ký khóa học và tiến độ hoàn thành %
lesson_progresses      -> Theo dõi trạng thái hoàn thành từng bài học
writing_prompts        -> Đề bài IELTS Writing Task 1 & Task 2
writing_submissions    -> Bài nộp Writing, phân tích AI 4 tiêu chí và phê duyệt của Admin
speaking_prompts       -> Đề bài Speaking, audio mẫu, min/max thời lượng
speaking_submissions   -> File ghi âm, điểm 4 tiêu chí và timestamp comments của Admin
quizzes                -> Bài kiểm tra trắc nghiệm, thời gian đếm ngược, điểm sàn pass 80%
questions              -> Câu hỏi (SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK)
question_options       -> Các lựa chọn đáp án trắc nghiệm
quiz_submissions       -> Kết quả làm quiz, điểm số, trạng thái Đạt/Chưa đạt
quiz_answers           -> Chi tiết câu trả lời của từng học viên
classrooms             -> Thông tin phòng học LiveKit SFU (1 Host + 7-8 Students)
attendance_records     -> Dữ liệu điểm danh, log phút học, phân loại PRESENT/LATE/ABSENT
conversations          -> Cuộc trò chuyện 1-1 giữa Admin và Học viên
messages               -> Nội dung tin nhắn chat thời gian thực qua Socket.IO
```

### 5.2 Kiến trúc thư mục chuẩn Monorepo
```
englishweb/
├── client/                              # Ứng dụng Frontend Next.js 14 App Router
│   ├── src/app/(auth)/                  # Tuyến đường đăng nhập, đăng ký
│   ├── src/app/(student)/student/       # Cổng thông tin học viên (Dashboard, LMS, Studio, WebRTC)
│   ├── src/app/(admin)/admin/           # Cổng thông tin quản trị viên & giáo viên
│   └── src/middleware.ts                # Next.js Middleware kiểm soát route theo role
│
└── server/                              # Ứng dụng Backend NestJS
    └── src/
        ├── core/                        # 🛠️ VÙNG HẠ TẦNG DÙNG CHUNG
        │   ├── common/                  # Guards, Decorators, Filters dùng chung
        │   ├── livekit/                 # LiveKit SDK Service, SFU Room Management & Webhook
        │   └── prisma/                  # Prisma ORM Service kết nối MySQL 8.0
        │
        └── modules/                     # 📦 VÙNG PHÂN HỆ NGHIỆP VỤ (BẮT BUỘC)
            ├── auth/                    # Module xác thực, phiên đơn, Google OAuth
            ├── courses/                 # Quản lý khóa học và đề cương
            ├── lessons/                 # Quản lý bài học và video
            ├── materials/               # Học liệu số và Watermark
            ├── quizzes/                 # Quiz Engine và trắc nghiệm
            ├── speaking/                # Speaking Studio và chấm điểm
            ├── writing/                 # AI Writing Studio và phê duyệt
            ├── attendance/              # Báo cáo chuyên cần và export Excel
            ├── dashboard/               # Thống kê phân tích số liệu
            └── chat/                    # Socket.IO Gateway nhắn tin thời gian thực
```

---

## 6. KẾ HOẠCH BÀN GIAO & 14 TIÊU CHÍ NGHIỆM THU

### 6.1 Lộ trình 6 tuần triển khai
| Giai đoạn | Hạng mục công việc trọng tâm | Đầu ra mục tiêu |
|:---:|---|---|
| **Tuần 1** | Hạ tầng, Database, Xác thực & Đa ngôn ngữ | Khởi tạo môi trường, CSDL Prisma MySQL, Auth Single Session, i18n 4 thứ tiếng |
| **Tuần 2** | Quản lý khóa học & LMS Engine | Hoàn thiện khóa học 4 cấp, tính % tiến độ, giao diện bài học |
| **Tuần 3** | Kho học liệu số bảo mật | Tích hợp PDF Viewer, Audio Player, Dynamic Watermark chống leak tài liệu |
| **Tuần 4** | Lớp học trực tuyến WebRTC | Hoàn thiện phòng học LiveKit 1 Host + 7-8 Học viên, Bảng trắng tương tác DataChannel |
| **Tuần 5** | AI Writing Studio, Speaking Studio & Chat | Chấm Writing AI 4 tiêu chí & Admin duyệt, Thu âm Speaking & chấm điểm, Chat Socket.IO |
| **Tuần 6** | Quiz Engine, Điểm danh tự động & Nghiệm thu | Hệ thống Quiz sàn 80%, Webhook tính chuyên cần, Xuất file Excel, Test e2e 100% |

### 6.2 14 Tiêu chí nghiệm thu chức năng chuẩn (Acceptance Criteria)
1. **Tiêu chí 1**: Hệ thống đăng ký, đăng nhập email/mật khẩu, đăng nhập Google và liên kết tài khoản Google hoạt động chính xác.
2. **Tiêu chí 2**: Cơ chế giới hạn 1 phiên đăng nhập đồng thời đối với học viên (Single Concurrent Session) hoạt động ổn định và chính xác.
3. **Tiêu chí 3**: Chuyển đổi mượt mà giữa 4 ngôn ngữ (VI, EN, JA, ZH) không gây lỗi hiển thị giao diện hay mất trạng thái.
4. **Tiêu chí 4**: Admin tạo và quản lý toàn diện khóa học, chương học, bài học và học liệu đính kèm.
5. **Tiêu chí 5**: Học viên chỉ truy cập được tài liệu PDF và Audio khi có quyền hợp lệ của khóa học đã đăng ký.
6. **Tiêu chí 6**: Dynamic Watermark hiển thị đầy đủ thông tin định danh học viên (Họ tên, SĐT, Mã học viên) và di chuyển liên tục trên màn hình xem tài liệu.
7. **Tiêu chí 7**: Phòng học WebRTC hỗ trợ 1 Admin + 7-8 Học viên tương tác ổn định qua âm thanh, hình ảnh và bảng trắng tương tác đồng bộ nét vẽ.
8. **Tiêu chí 8**: AI phân tích bài Writing theo chuẩn 4 tiêu chí IELTS, Admin có thể điều chỉnh điểm và phê duyệt trước khi công bố kết quả.
9. **Tiêu chí 9**: Học viên ghi âm được bài Speaking hiển thị sóng âm; Admin nghe lại, điều chỉnh tốc độ, tua +/- 5s và chấm điểm 4 tiêu chí kèm timestamp comments.
10. **Tiêu chí 10**: Hệ thống Quiz tự động chấm 3 dạng câu hỏi, tính điểm chuẩn xác, xác định Đạt/Chưa đạt và tự động mở khóa bài học kế tiếp khi điểm $\ge 80\%$.
11. **Tiêu chí 11**: Hệ thống tự động ghi nhận thời gian tham gia và phân loại chuyên cần (PRESENT, LATE, ABSENT) chuẩn xác qua LiveKit Webhook.
12. **Tiêu chí 12**: Admin có thể xem log chi tiết vào/ra, điều chỉnh thủ công và xuất báo cáo điểm danh dưới định dạng file Excel (`.xlsx`).
13. **Tiêu chí 13**: Dashboard hiển thị chính xác các thông tin học tập, phân tích và thống kê theo đúng quyền truy cập của STUDENT và ADMIN.
14. **Tiêu chí 14**: Chức năng nhắn tin thời gian thực giữa Admin và học viên qua Socket.IO gửi nhận tin cậy, bảo mật và lưu trữ đầy đủ lịch sử hội thoại.
