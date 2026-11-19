# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## DỰ ÁN: TEACHER DONG ACADEMY – NỀN TẢNG ĐÀO TẠO TRỰC TUYẾN
### Standard: IEEE 830 / ISO/IEC/IEEE 29148 Compliant (Phiên bản v2.0 - Bổ sung Toàn bộ Tính năng từ Codebase)

> Bản sao đồng bộ từ gốc dự án: [SRS.md](file:///D:/englishweb/SRS.md).  
> Tham chiếu chi tiết đặc tả tại [docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md](file:///D:/englishweb/docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md) và Interactive Prototype tại [docs/mock_test.html](file:///D:/englishweb/docs/mock_test.html).  
> Tài liệu đặc tả RESTful API & WebSocket: [docs/API_DOCUMENTATION.md](file:///D:/englishweb/docs/API_DOCUMENTATION.md) (Swagger UI: `http://localhost:3001/api/docs`).

---

## 1. TỔNG QUAN DỰ ÁN & NGUYÊN TẮC CỐT LÕI
- **Tên dự án**: Teacher Dong Academy – Nền tảng đào tạo trực tuyến chuẩn EdTech hiện đại.
- **Mô hình 2 vai trò duy nhất (Strict 2-Role RBAC)**: `STUDENT` (Học viên) & `ADMIN` (Quản trị viên kiêm Giáo viên toàn quyền). Tuyệt đối không tạo vai trò giáo viên trung gian.
- **Single Concurrent Session**: Mỗi tài khoản học viên chỉ được phép đăng nhập trên 1 thiết bị/trình duyệt tại một thời điểm. Đăng nhập mới lập tức vô hiệu hóa phiên cũ.
- **Bảo mật học liệu số & Chống rò rỉ**: Phân phối qua Presigned URL thời hạn 15 phút, vẽ Dynamic Watermark (Họ tên + Mã SV + SĐT + Giờ thực) di chuyển mượt mà liên tục trên canvas (đổi tọa độ mỗi 12 giây), chặn click chuột phải (`contextmenu`) và phím tắt lưu file (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`), không cung cấp nút tải trực tiếp file gốc.

---

## 2. MA TRẬN 14 PHÂN HỆ CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

| Mã Phân Hệ | Tên Phân Hệ | Phạm Vi Nghiệp Vụ Cốt Lõi |
|---|---|---|
| **FR-01** | **Xác thực & Quản lý Phiên** | Đăng ký, Đăng nhập email/pass, Google OAuth 2.0 (Login, Link, Unlink), Single Concurrent Session (tự động trigger lưu nháp khẩn cấp `isEmergencySave: true` cho học viên khi nhận sự kiện `SESSION_TERMINATED`), JWT HttpOnly Cookies, Đổi mật khẩu, Quên mật khẩu qua Email SMTP (`/forgot-password`, `/reset-password`), Quản lý phiên đa thiết bị (`GET /sessions`, `DELETE /sessions/:id`, `POST /logout-all`). |
| **FR-02** | **Đa Ngôn Ngữ (i18n)** | Hỗ trợ 5 ngôn ngữ (`VI`, `EN`, `ZH`, `JA`, `KM`), tự động nhận diện ngôn ngữ trình duyệt, nhớ cookie/localStorage, đồng bộ vào cơ sở dữ liệu `User.preferredLang`. |
| **FR-03** | **Quản Lý Khóa Học & Đề Cương (LMS)** | Cấu trúc 4 cấp: Course ➔ Module ➔ Lesson ➔ Components. Quản lý 5 trụ cột đào tạo, tính % tiến độ, bài học học thử miễn phí (`isFreePreview`), luồng đăng ký duyệt học phí (`Enrollment Pending/Active/Rejected` - khi từ chối tự động gửi email lý do, giữ bản ghi `REJECTED` và cho phép học viên gửi lại), kéo-thả sắp xếp thứ tự Module & Lesson (`modules/reorder`, `reorder`). |
| **FR-04** | **Kho Học Liệu Số & Media CDN** | PDF Viewer & Audio Player trực tiếp, Presigned URL 15 phút kèm cơ chế thu hồi tức thì qua Redis Blacklist khi tài liệu bị xóa/ẩn; Dynamic Watermark chuyển động chống quay chụp màn hình, chặn chuột phải & phím tắt lưu file; Controller quản lý tải lên hình ảnh/video Cloudinary độc lập (`/api/media`). |
| **FR-05** | **Lớp Học WebRTC LiveKit & Bảng Trắng** | Phòng học LiveKit SFU (1 Host + 7-8 Học viên), độ trễ < 150ms. Bật/tắt mic/cam, giơ tay, chia sẻ màn hình, Host tắt mic từ xa hoặc Kick học viên. Bảng trắng tương tác 2 chiều (Whiteboard) lưu lịch sử nét vẽ trên RAM phiên học và tự động dọn dẹp khi phòng đóng (`ENDED`) không lưu DB vĩnh viễn; Host cấp/khóa quyền vẽ từng học viên; Tự động kết thúc phòng học quá giờ 30 phút. Webhook LiveKit Idempotency đảm bảo bằng `event.createdAt` và composite key `(roomName, identity, joinedAt)`. |
| **FR-06** | **Luyện Viết IELTS Writing AI** | Task 1 & Task 2, bộ đếm từ thời gian thực, đồng hồ đếm ngược, tự động lưu bản nháp (`WritingDraft`). AI Gemini chấm 4 tiêu chí (TR, CC, LR, GRA), gợi ý từ C1/C2, tự động sinh bài mẫu Band 8.5+ tức thời (`sampleBand8Essay`). Admin xem, sửa điểm và phê duyệt trước khi công bố. |
| **FR-07** | **Luyện Nói IELTS Speaking Studio** | Thu âm qua Web Audio API hiển thị sóng âm thời gian thực, hỗ trợ nghe Audio phát âm mẫu của người bản xứ (`sampleAudioUrl`), nộp file ghi âm trực tiếp qua multipart form. Admin chấm thủ công 4 tiêu chí (FC, LR, GRA, PR) kèm Audio player tua +/- 5s, tốc độ 0.75x-2x và Timestamp comments tại từng giây. |
| **FR-08** | **IELTS Mock Test & Quiz Engine** | Hỗ trợ 18 dạng câu hỏi chuyên sâu chuẩn Cambridge IELTS, bài đọc dài (`passage`), file âm thanh (`audioUrl`), phân loại 3 cấp độ (`FULL_MOCK_TEST`, `PRACTICE_TEST`, `LESSON_QUIZ`), chấm tức thì, sàn $\ge 80\%$ để đạt và mở khóa bài tiếp theo. Hệ thống phân tích chẩn đoán năng lực 4 kỹ năng (`/diagnostic/...`) kèm biểu đồ Radar. |
| **FR-09** | **Điểm Danh Tự Động & Chuyên Cần** | Webhook LiveKit ghi nhận phút học thực tế chuẩn xác nhờ cơ chế Idempotency deduplication. Phân loại: `PRESENT` (vào 15p đầu & $\ge 80\%$ thời lượng), `LATE` (vào sau 15p), `ABSENT` (< 30%). Admin điểm danh cưỡng bức (`mark`), can thiệp thủ công có ghi chú lý do (`override` + `note`), xuất báo cáo Excel (.xlsx) theo buổi học hoặc theo khoảng ngày. |
| **FR-10** | **Dashboard & IELTS Master Hub** | Dashboard Học viên (tiến độ, lịch học sắp tới, bài tập cần nộp, điểm số); Cổng tổng quan luyện thi IELTS Hub cá nhân hóa (Target Band, dự đoán Band điểm, lối tắt 4 kỹ năng); Dashboard Admin (tổng quan học viên, bài viết/nói chờ chấm, tỷ lệ chuyên cần, tự động quét đóng phòng học cũ). |
| **FR-11** | **Nhắn Tin Thời Gian Thực** | Trao đổi trực tiếp 1-1 giữa Admin và Học viên qua Socket.IO, lưu trữ lịch sử trong cơ sở dữ liệu (`Conversation`, `Message`), hiển thị trạng thái đang soạn tin nhắn (`typing indicator`) và trạng thái đã xem (`read receipts` tick xanh + timestamp). |
| **FR-12** | **Quản Trị Blog & Media Cloudinary** | Cung cấp cổng thông tin kiến thức, tin tức học thuật, phương pháp học tập và chia sẻ (Khách và Học viên xem bài `PUBLISHED`; Admin quản trị toàn quyền `DRAFT`, `PUBLISHED`, `ARCHIVED`). Tích hợp lưu trữ và phân phối Media Cloudinary (ảnh bìa, video review) kèm cơ chế tự động dọn dẹp asset qua publicId khi xóa bài; bộ phân tích Markdown AST hiển thị bài viết trực quan, tính năng ước lượng thời gian đọc chuẩn 200 WPM, phân loại chuyên mục và tự động tăng lượt xem (`viewCount`). |
| **FR-13** | **Tiếp Nhận Tư Vấn Tuyển Sinh (Leads)** | Form thu thập thông tin học viên tiềm năng tại Landing Page công khai (`fullName`, `email`, `phone`, `interestedProgram`, `message`), áp dụng rate limit IP (3 lần / 10 phút) chống spam bot; endpoint `/api/notifications/consultation` tự động chuyển tiếp thông báo tức thì cho Admin qua Email và Socket. |
| **FR-14** | **Trung Tâm Thông Báo & Broadcast** | Quản lý thông báo in-app cho học viên (bài viết được duyệt, bài nói đã chấm, lớp học sắp diễn ra, thông báo hệ thống), đếm số chưa đọc, đánh dấu đã đọc; Admin phát thông báo loa phóng thanh tức thì toàn trường qua WebSocket (`POST /api/notifications/broadcast`). |

---

## 3. KIẾN TRÚC MÃ NGUỒN CHUẨN MONOREPO
- Phía Server NestJS chia thành 2 phân vùng:
  - `server/src/core/`: Hạ tầng nền tảng dùng chung (`core/common`, `core/livekit`, `core/prisma`, `core/mail`, `core/cloudinary`, `core/redis`, `core/gemini`).
  - `server/src/modules/`: Toàn bộ các phân hệ nghiệp vụ (`modules/auth`, `modules/courses`, `modules/lessons`, `modules/materials`, `modules/quizzes`, `modules/speaking`, `modules/writing`, `modules/attendance`, `modules/dashboard`, `modules/chat`, `modules/blogs`, `modules/notifications`, `modules/users`).
- Phía Client Next.js 14 App Router:
  - `client/src/app/(auth)/`: Tuyến đường đăng nhập, đăng ký, quên mật khẩu.
  - `client/src/app/(student)/student/`: Toàn bộ màn hình học viên (Dashboard, IELTS Hub, Courses, Materials, WebRTC, Studio).
  - `client/src/app/(admin)/admin/`: Toàn bộ màn hình quản trị viên (Courses, Quizzes, Grading, Blogs, Attendance, Users, Assessments).
  - `client/src/app/blog/`: Cổng đọc tin tức & bài viết công khai (danh sách và chi tiết `[slug]`).

---

## 4. 17 TIÊU CHÍ NGHIỆM THU CHỨC NĂNG CHUẨN (ACCEPTANCE CRITERIA)
1. Đăng ký, đăng nhập email/mật khẩu, đăng nhập Google, liên kết/hủy liên kết Google, và luồng quên mật khẩu qua email SMTP hoạt động chính xác.
2. Giới hạn một phiên đăng nhập đối với học viên (Single Concurrent Session) và quản lý thu hồi phiên đa thiết bị hoạt động ổn định.
3. Chuyển đổi mượt mà giữa 5 ngôn ngữ (VI, EN, JA, ZH, KM) không gây lỗi giao diện, đồng bộ `preferredLang` vào cơ sở dữ liệu.
4. Admin quản lý toàn diện khóa học, sắp xếp thứ tự module/lesson, tải video bài giảng và hỗ trợ bài học học thử miễn phí (`isFreePreview`).
5. Học viên chỉ truy cập tài liệu PDF và Audio khi có quyền hợp lệ của khóa học đã được duyệt học phí.
6. Dynamic Watermark hiển thị đầy đủ định danh và tự động trôi dạt tọa độ mượt mà; chặn chuột phải và phím tắt lưu trang (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`).
7. Phòng học WebRTC 1 Host + 7-8 Học viên tương tác ổn định; Admin Host có quyền kick học viên và quản lý quyền bảng trắng; tự động đóng phòng quá giờ 30 phút.
8. AI phân tích bài Writing theo 4 tiêu chí IELTS, tự sinh bài mẫu Band 8.5+; Admin duyệt và sửa điểm trước khi công bố.
9. Học viên ghi âm bài Speaking hiển thị sóng âm; nghe audio mẫu của giáo viên; Admin chấm 4 tiêu chí kèm timestamp comments.
10. Hệ thống thi trắc nghiệm hỗ trợ 18 dạng câu hỏi IELTS, đoạn văn đọc dài, audio nghe, chấm điểm tức thì, sàn đạt $\ge 80\%$ để mở bài kế tiếp.
11. Báo cáo chẩn đoán năng lực 4 kỹ năng tổng thể của học viên và toàn học viện hiển thị chính xác qua biểu đồ Radar.
12. Tự động ghi nhận thời gian tham gia và phân loại chuyên cần (PRESENT, LATE, ABSENT) chuẩn xác qua LiveKit Webhook.
13. Admin có thể điểm danh cưỡng bức, can thiệp thủ công có ghi chú lý do và xuất báo cáo Excel (.xlsx) theo buổi học hoặc theo khoảng ngày.
14. Dashboard hiển thị chính xác các số liệu học tập theo phân quyền STUDENT và ADMIN; Student IELTS Master Hub cá nhân hóa lộ trình.
15. Nhắn tin thời gian thực giữa Admin và học viên qua Socket.IO hiển thị trạng thái đang soạn thảo và đã xem tin nhắn.
16. Quản lý, xuất bản bài viết Blog, tích hợp Cloudinary tải lên ảnh/video và tự động đếm lượt xem (`viewCount`) hoạt động chuẩn xác theo phân quyền STUDENT và ADMIN.
17. Form tiếp nhận tư vấn tuyển sinh tại Landing Page tiếp nhận lead và gửi cảnh báo tức thì cho Admin qua Email và Socket.
