# Knowledge: 11 Modules Functional Specification

Đặc tả chi tiết 11 phân hệ chức năng của nền tảng **Teacher Dong Academy** tổng hợp từ SRS và Interactive Prototype.

---

### Module 1: Xác Thực & Quản Lý Tài Khoản (Authentication & Session)
- **Vai trò**: 2 roles duy nhất: `STUDENT` và `ADMIN`.
- **Cơ chế**: Email/Password + Google OAuth 2.0 (Đăng nhập, Đăng ký, Liên kết, Hủy liên kết).
- **Single Concurrent Session**: Học viên chỉ được đăng nhập trên 1 thiết bị/trình duyệt. Phiên đăng nhập mới sẽ vô hiệu hóa phiên cũ. Admin không bị giới hạn phiên.
- **Bảo mật**: Bcrypt băm mật khẩu, JWT Access Token (15m) + Refresh Token (7d) trong HTTP-Only Cookies.

### Module 2: Đa Ngôn Ngữ (Internationalization - i18n)
- **4 Ngôn ngữ**: Tiếng Việt (`vi`), Tiếng Anh (`en`), Tiếng Trung (`zh`), Tiếng Nhật (`ja`).
- **Cơ chế**: Ghi nhớ qua Cookie, tự động nhận diện ngôn ngữ trình duyệt cho khách vãng lai, đồng bộ `preferredLang` với tài khoản học viên.

### Module 3: Quản Lý Khóa Học & Đào Tạo (LMS)
- **5 Trụ cột đào tạo**: IELTS Intensive, Business English, English for Kids, Năng lực sư phạm (AI trong giảng dạy), Kỹ năng sống.
- **Cấu trúc 4 cấp**: Course ➔ Module (Chương) ➔ Lesson (Bài học) ➔ Components (Học liệu, Quiz, Speaking, Writing).
- **Tiến độ học tập**: Tự động tính % hoàn thành dựa trên số bài học đã xem, quiz đã pass, speaking/writing đã nộp.

### Module 4: Kho Học Liệu Số Bảo Mật (Digital Library & Content Protection)
- **Học liệu**: Tài liệu PDF và Audio MP3.
- **Chống rò rỉ**: Không cung cấp nút tải trực tiếp file gốc.
- **Presigned URL**: Thời hạn tối đa 15 phút.
- **Dynamic Watermark**: Canvas hiển thị thông tin động (Họ tên + SĐT + Mã học viên) liên tục đổi tọa độ để chống chụp/quay màn hình.

### Module 5: Lớp Học Trực Tuyến WebRTC (Live Classroom)
- **Quy mô**: 1 Admin làm Host + 7-8 Học viên tham gia (LiveKit SFU).
- **Tính năng**: Bật/tắt mic/cam, giơ tay phát biểu, chia sẻ màn hình. Host có quyền tắt mic/cam hoặc mời học viên ra khỏi phòng.
- **Bảng trắng tương tác (Whiteboard)**: Bút vẽ, tẩy, hình khối, chèn text, đổi màu; đồng bộ nét vẽ thời gian thực qua DataChannel.

### Module 6: Luyện Viết IELTS Writing Chấm Bằng AI (AI Writing Assessment)
- **Phạm vi**: IELTS Writing Task 1 và Task 2.
- **Công cụ học viên**: Trình soạn thảo văn bản, bộ đếm từ trực tiếp, đồng hồ đếm ngược, tự động lưu bản nháp.
- **AI Engine (4 Tiêu chí IELTS)**:
  1. Task Achievement / Task Response (TR)
  2. Coherence and Cohesion (CC)
  3. Lexical Resource (LR)
  4. Grammatical Range and Accuracy (GRA)
- **Phê duyệt của Admin**: Điểm AI đưa ra ở trạng thái `AI_EVALUATED`. Admin có thể sửa điểm, thêm nhận xét trước khi chuyển sang `APPROVED` để học viên xem.

### Module 7: Luyện Nói IELTS Speaking Studio (Speaking Studio)
- **Thu âm học viên**: Web Audio API hiển thị sóng âm thời gian thực, đồng hồ ghi âm (min 30s - max 120s), nghe lại, thu âm lại và nộp bài.
- **Admin chấm thủ công (Không dùng AI)**:
  - Audio Player chuyên dụng: tua +/- 5s, chỉnh tốc độ 0.75x - 2x.
  - Chấm 4 tiêu chí: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation + Overall Band.
  - Ghi chú mốc thời gian (Timestamp comments) gắn trực tiếp vào giây cụ thể của file ghi âm.

### Module 8: Kiểm Tra & Trắc Nghiệm (Quiz Engine)
- **Dạng câu hỏi**: Single Choice, Multiple Choice, Fill in the Blanks.
- **Cơ chế**: Đồng hồ đếm ngược, chấm điểm tức thì khi nộp bài.
- **Điều kiện Pass**: Điểm số &ge; điểm sàn (ví dụ 80%) mới xác định Đạt và tự động mở khóa bài học tiếp theo. Cung cấp lời giải thích chi tiết cho từng đáp án.

### Module 9: Điểm Danh Tự Động & Báo Cáo Chuyên Cần (Automated Attendance)
- **Cơ chế Webhook**: LiveKit gửi sự kiện `participant_joined`, `participant_left`.
- **Quy tắc phân loại**:
  - `PRESENT`: Vào phòng trong 15 phút đầu VÀ thời gian học &ge; 80% thời lượng.
  - `LATE`: Vào phòng sau 15 phút đầu.
  - `ABSENT`: Không vào HOẶC thời gian học < 30%.
- **Quản trị**: Admin có thể xem log chi tiết, điều chỉnh thủ công (Manual override kèm lý do) và xuất file Excel (.xlsx).

### Module 10: Dashboard & Thống Kê Học Tập (Dashboard & Analytics)
- **Dashboard Học viên**: Tiến độ khóa học, lịch học sắp tới kèm nút vào phòng nhanh 1 chạm, bài tập cần làm, điểm số mới nhất.
- **Dashboard Admin**: Tổng số học viên active, số khóa học, số bài viết/nói chờ chấm, tỷ lệ chuyên cần gần đây.

### Module 11: Nhắn Tin Thời Gian Thực (Realtime Chat & Messaging)
- **Cơ chế**: Socket.IO giữa Admin và Học viên.
- **Tính năng**: Danh sách hội thoại, gửi tin nhắn, đánh dấu đã đọc, lưu trữ toàn bộ lịch sử trò chuyện trong cơ sở dữ liệu.
