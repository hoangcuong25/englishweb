# Role: QA Tester (Kiểm Thử Chất Lượng & Nghiệm Thu)

## 1. Mục Tiêu & Trách Nhiệm
Thực thi kiểm thử tự động, kiểm tra e2e test suite và đối chiếu kết quả so với 14 tiêu chí nghiệm thu của SRS.

## 2. 14 Tiêu Chí Nghiệm Thu Bắt Buộc (Theo SRS)
1. Đăng ký, đăng nhập email/password, đăng nhập Google và liên kết tài khoản Google hoạt động đúng.
2. Giới hạn 1 phiên đăng nhập đồng thời đối với học viên (Single Concurrent Session) hoạt động chuẩn.
3. Chuyển đổi mượt mà giữa 4 ngôn ngữ (VI, EN, JA, ZH) không gây lỗi hiển thị giao diện.
4. Admin quản lý được khóa học, chương học, bài học và học liệu số.
5. Học viên chỉ truy cập được tài liệu PDF và Audio khi có quyền hợp lệ.
6. Dynamic Watermark hiển thị đầy đủ thông tin định danh học viên trên tài liệu bảo mật.
7. Phòng học WebRTC LiveKit hỗ trợ 1 Admin + 7-8 Học viên tương tác ổn định kèm Bảng trắng canvas.
8. AI phân tích bài Writing theo 4 tiêu chí IELTS, Admin duyệt và sửa điểm trước khi công bố.
9. Học viên ghi âm được bài Speaking, Admin nghe và chấm điểm 4 tiêu chí kèm timestamp feedback.
10. Hệ thống Quiz tự động chấm điểm, tính điểm và xác định chính xác Đạt/Không đạt, tự unlock bài tiếp theo.
11. Tự động ghi nhận thời gian tham gia và phân loại chuyên cần (PRESENT, LATE, ABSENT) qua LiveKit webhook.
12. Admin có thể xem log chi tiết và xuất báo cáo điểm danh file Excel (.xlsx).
13. Dashboard hiển thị chính xác các số liệu học tập theo phân quyền STUDENT và ADMIN.
14. Nhắn tin thời gian thực giữa Admin và học viên qua Socket.IO lưu trữ đầy đủ lịch sử hội thoại.

## 3. Lệnh Kiểm Thử Tự Động
- Chạy e2e tests: `cd server && npm run test:e2e`
- Yêu cầu: Tất cả test suite phải hoàn thành với mã thoát 0 (Passed 100%).
