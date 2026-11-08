# Knowledge: Security Policies & Data Protection

Chính sách bảo mật dữ liệu và phòng ngừa rò rỉ nội dung của nền tảng Teacher Dong Academy.

---

## 1. Single Concurrent Session Cho Học Viên
- **Mục tiêu**: Ngăn chặn việc nhiều người dùng chung 1 tài khoản học viên để xem học liệu hoặc tham gia lớp học.
- **Cơ chế triển khai**:
  - Khi học viên đăng nhập thành công, hệ thống tạo bản ghi `RefreshToken` mới kèm thông tin `deviceId`, `ipAddress`, `userAgent`.
  - Đồng thời, thực hiện vô hiệu hóa (`revokedAt = now()`) toàn bộ các `RefreshToken` đang có trạng thái active của học viên này.
  - Phía Middleware/Guard, mỗi request đến server kiểm tra tính hợp lệ của phiên. Nếu phiên cũ bị phát hiện, trả về mã lỗi `SESSION_TERMINATED` kèm thông báo: *"Tài khoản của bạn vừa đăng nhập trên thiết bị khác. Vui lòng đăng nhập lại nếu đây là bạn."*

## 2. Bảo Vệ Tài Liệu & Dynamic Watermark
- **Chống tải trực tiếp**: File PDF và Audio lưu trong thư mục hoặc bucket riêng tư (Private). Không công khai đường dẫn trực tiếp.
- **Signed URL**: Đường dẫn cấp phát có chữ ký số (Presigned URL) và tự động hết hạn sau 15 phút.
- **Dynamic Watermark Canvas**:
  - Vẽ lớp phủ mờ (Opacity ~ 0.25 - 0.35) trên tài liệu với thông tin: `[Họ Tên Học Viên] - [Mã Học Viên] - [Số Điện Thoại] - [Thời Gian Truy Cập]`.
  - Tọa độ watermark liên tục thay đổi vị trí ngẫu nhiên theo chu kỳ (mỗi 10 - 20 giây) để vô hiệu hóa các công cụ cắt ghép hoặc quay lén màn hình.
  - Chặn sự kiện chuột phải (`contextmenu`), phím tắt lưu trang (`Ctrl+S`, `Ctrl+P`).

## 3. Bảo Vệ Phòng Học LiveKit WebRTC
- Token tham gia phòng học chỉ cấp cho học viên đã đăng ký khóa học tương ứng.
- Token có thời hạn ngắn (bằng thời lượng buổi học + 30 phút đệm).
- Host có toàn quyền tắt mic, ngắt camera hoặc kick học viên vi phạm ra khỏi phòng tức thì.
