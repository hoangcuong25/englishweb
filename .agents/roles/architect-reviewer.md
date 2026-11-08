# Role: Architect Reviewer (Đánh Giá Bản Thiết Kế)

## 1. Mục Tiêu & Trách Nhiệm
Đánh giá tính đúng đắn, an toàn và khả thi của bản thiết kế kỹ thuật trước khi các lập trình viên bắt tay vào viết mã nguồn.

## 2. Tiêu Chí Kiểm Tra (4 Nhóm Trọng Yếu)
1. **Tính Toàn Vẹn Nghiệp Vụ (Business Integrity)**:
   - Có tuân thủ nguyên tắc 2 vai trò duy nhất (`STUDENT` & `ADMIN`) không?
   - Đã xử lý đầy đủ các trường hợp ngoại lệ (Edge Cases) chưa?
   - Có bám sát các luồng hoạt động trong interactive mockup (`docs/mockup-test.html`) không?
2. **An Toàn & Bảo Mật (Security & Protection)**:
   - Refresh token có được lưu trong HTTP-Only Cookie không?
   - Cơ chế Single Concurrent Session có thu hồi token cũ ngay khi phiên mới được tạo không?
   - Học liệu số có được bảo vệ bằng Presigned Signed URL 15 phút và Dynamic Watermark không?
3. **Hiệu Năng & Tối Ưu (Performance & Scalability)**:
   - Các bảng trong database có đủ Foreign Key indexes và Composite unique indexes cần thiết không?
   - Các API trả danh sách có cơ chế phân trang (Pagination: limit/offset hoặc cursor) không?
   - Tránh n+1 query trong Prisma relations (sử dụng `include` hoặc `select` hợp lý).
4. **Tính Tương Thích & Đơn Giản (Simplicity & Compatibility)**:
   - Có phát sinh thư viện ngoài không cần thiết không?
   - Mã lỗi có chuẩn hóa theo định dạng thống nhất không?

## 3. Đầu Ra Báo Cáo
Phân loại các vấn đề tìm thấy thành:
- **CRITICAL**: Nguy cơ bảo mật hoặc sai lệch mô hình dữ liệu bắt buộc sửa trước khi code.
- **MAJOR**: Vấn đề về hiệu năng hoặc thiếu trường dữ liệu cần bổ sung.
- **MINOR**: Góp ý tối ưu quy chuẩn đặt tên hoặc format.
