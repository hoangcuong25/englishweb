# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## DỰ ÁN: TEACHER DONG ACADEMY – NỀN TẢNG ĐÀO TẠO TRỰC TUYẾN
### Standard: IEEE 830 / ISO/IEC/IEEE 29148 Compliant

> Bản sao đồng bộ từ gốc dự án: [SRS.md](file:///D:/Project/englishweb/SRS.md).  
> Tham chiếu chi tiết đặc tả tại [docs/spec_content.txt](file:///D:/Project/englishweb/docs/spec_content.txt) và Interactive Prototype tại [docs/mockup-test.html](file:///D:/Project/englishweb/docs/mockup-test.html).

---

## 1. TỔNG QUAN DỰ ÁN & NGUYÊN TẮC CỐT LÕI
- **Tên dự án**: Teacher Dong Academy – Nền tảng đào tạo trực tuyến chuẩn EdTech hiện đại.
- **Mô hình 2 vai trò duy nhất**: `STUDENT` (Học viên) & `ADMIN` (Quản trị viên kiêm Giáo viên toàn quyền). Tuyệt đối không tạo vai trò giáo viên trung gian.
- **Single Concurrent Session**: Mỗi tài khoản học viên chỉ được phép đăng nhập trên 1 thiết bị/trình duyệt tại một thời điểm. Đăng nhập mới lập tức vô hiệu hóa phiên cũ.
- **Bảo mật học liệu số**: Phân phối qua Presigned URL thời hạn 15 phút, vẽ Dynamic Watermark (Họ tên + Mã SV + SĐT) liên tục di chuyển trên canvas, không cung cấp nút tải trực tiếp file gốc.

---

## 2. MA TRẬN 11 PHÂN HỆ CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

| Mã Phân Hệ | Tên Phân Hệ | Phạm Vi Nghiệp Vụ Cốt Lõi |
|---|---|---|
| **FR-01** | **Xác thực & Phiên đăng nhập** | Đăng ký, Đăng nhập email/pass, Google OAuth 2.0 (Login, Link, Unlink), Single Concurrent Session, JWT HttpOnly Cookies, Đổi mật khẩu, Quản lý phiên (`GET /sessions`, `DELETE /sessions/:id`). |
| **FR-02** | **Đa Ngôn Ngữ (i18n)** | Hỗ trợ 4 ngôn ngữ (VI, EN, ZH, JA), nhớ cookie, tự động nhận diện ngôn ngữ trình duyệt, đồng bộ `User.preferredLang`. |
| **FR-03** | **Quản Lý Khóa Học & LMS** | Cấu trúc 4 cấp: Course ➔ Module ➔ Lesson ➔ Components. Quản lý 5 trụ cột đào tạo, tính % hoàn thành khóa học, khóa/mở bài học. |
| **FR-04** | **Kho Học Liệu Số Bảo Mật** | PDF Viewer & Audio Player trực tiếp, Presigned URL 15 phút, Dynamic Watermark chuyển động chống quay chụp màn hình, vô hiệu hóa chuột phải & phím tắt lưu file. |
| **FR-05** | **Lớp Học WebRTC LiveKit** | Phòng học LiveKit SFU (1 Host + 7-8 Học viên), độ trễ < 150ms. Bật/tắt mic/cam, giơ tay, chia sẻ màn hình. Bảng trắng tương tác (Whiteboard) đồng bộ qua DataChannels. |
| **FR-06** | **Luyện Viết IELTS Writing AI** | Task 1 & Task 2, bộ đếm từ thời gian thực, đồng hồ đếm ngược, tự động lưu bản nháp. AI chấm 4 tiêu chí (TR, CC, LR, GRA), gợi ý từ C1/C2, bài mẫu Band 8.0+. Admin xem, sửa điểm và phê duyệt trước khi công bố. |
| **FR-07** | **Luyện Nói IELTS Speaking** | Thu âm qua Web Audio API với sóng âm thời gian thực. Admin chấm thủ công 4 tiêu chí (FC, LR, GRA, PR) kèm Audio player tua +/- 5s, tốc độ 0.75x-2x và Timestamp comments tại từng giây. |
| **FR-08** | **Kiểm Tra & Trắc Nghiệm** | 3 dạng câu hỏi (Single Choice, Multiple Choice, Fill in Blanks), chấm tức thì. Điểm sàn $\ge 80\%$ để đạt và tự động mở khóa bài học tiếp theo. Kèm lời giải thích chi tiết. |
| **FR-09** | **Điểm Danh Tự Động** | Webhook LiveKit ghi nhận phút học thực tế. Phân loại: `PRESENT` (vào 15p đầu & $\ge 80\%$ thời lượng), `LATE` (vào sau 15p), `ABSENT` (< 30%). Admin điều chỉnh thủ công và xuất báo cáo Excel (.xlsx). |
| **FR-10** | **Dashboard & Thống Kê** | Dashboard Học viên (tiến độ, lịch học sắp tới, bài tập cần nộp, điểm số) & Dashboard Admin (tổng quan học viên, bài viết/nói chờ chấm, tỷ lệ chuyên cần). |
| **FR-11** | **Nhắn Tin Thời Gian Thực** | Trao đổi trực tiếp 1-1 giữa Admin và Học viên qua Socket.IO, lưu trữ lịch sử tin nhắn trong cơ sở dữ liệu (`Conversation`, `Message`). |

---

## 3. KIẾN TRÚC MÃ NGUỒN CHUẨN MONOREPO
- Phía Server NestJS chia thành 2 phân vùng:
  - `server/src/core/`: Hạ tầng nền tảng dùng chung (`core/common`, `core/livekit`, `core/prisma`).
  - `server/src/modules/`: Toàn bộ các phân hệ nghiệp vụ (`modules/auth`, `modules/courses`, `modules/quizzes`, `modules/speaking`, `modules/writing`, `modules/attendance`...).
- Phía Client Next.js 14 App Router:
  - `client/src/app/(auth)/`: Tuyến đường đăng nhập/đăng ký.
  - `client/src/app/(student)/student/`: Toàn bộ màn hình học viên.
  - `client/src/app/(admin)/admin/`: Toàn bộ màn hình quản trị viên.

---

## 4. 14 TIÊU CHÍ NGHIỆM THU CHỨC NĂNG CHUẨN
1. Đăng ký, đăng nhập email/mật khẩu, đăng nhập Google và liên kết tài khoản Google hoạt động đúng.
2. Giới hạn một phiên đăng nhập đối với học viên (Single Concurrent Session) hoạt động ổn định.
3. Chuyển đổi mượt mà giữa 4 ngôn ngữ (VI, EN, JA, ZH) không gây lỗi giao diện.
4. Admin quản lý toàn diện khóa học, chương học, bài học và học liệu.
5. Học viên chỉ truy cập tài liệu PDF và Audio theo đúng quyền khóa học.
6. Dynamic Watermark hiển thị đầy đủ thông tin định danh di chuyển liên tục trên học liệu bảo mật.
7. Phòng học WebRTC 1 Host + 7-8 Học viên tương tác ổn định qua âm thanh, hình ảnh và bảng trắng tương tác.
8. AI phân tích bài Writing theo chuẩn 4 tiêu chí IELTS, Admin duyệt và sửa điểm trước khi công bố.
9. Học viên ghi âm bài Speaking hiển thị sóng âm; Admin chấm điểm 4 tiêu chí kèm timestamp comments.
10. Hệ thống Quiz tự động chấm điểm, tính điểm và tự động mở khóa bài học kế tiếp khi đạt $\ge 80\%$.
11. Tự động ghi nhận thời gian tham gia và phân loại chuyên cần (PRESENT, LATE, ABSENT) chuẩn xác qua LiveKit Webhook.
12. Admin có thể xem log chi tiết và xuất báo cáo điểm danh dưới định dạng Excel (.xlsx).
13. Dashboard hiển thị chính xác các số liệu học tập theo phân quyền STUDENT và ADMIN.
14. Nhắn tin thời gian thực giữa Admin và học viên qua Socket.IO gửi nhận ổn định và bảo mật.
