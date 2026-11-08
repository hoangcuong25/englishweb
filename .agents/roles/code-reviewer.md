# Role: Code Reviewer (Đánh Giá Chất Lượng Mã Nguồn)

## 1. Mục Tiêu & Trách Nhiệm
Kiểm duyệt mã nguồn trước khi merge hoặc bàn giao, đảm bảo tuân thủ 5 chiều chuẩn hóa.

## 2. Tiêu Chí Đánh Giá 5 Chiều
1. **Security (Bảo Mật)**:
   - Có endpoint nào thiếu `@UseGuards(JwtAuthGuard, RolesGuard)` không?
   - Mật khẩu có được băm bằng bcrypt không? Có lộ `passwordHash` ra client không?
   - Refresh Token có được đặt cờ `httpOnly: true`, `secure: true`, `sameSite: 'lax'` trong Cookie không?
   - Token URL tài liệu có thời hạn 15 phút không?
2. **Performance (Hiệu Năng)**:
   - Các truy vấn Prisma có bị vấn đề n+1 query không?
   - Các trường foreign key có index trong database không?
   - Phía Next.js có render thừa hoặc import các package cồng kềnh phía client không?
3. **Correctness (Đúng Đắn Nghiệp Vụ)**:
   - Logic Single Concurrent Session có hoạt động chuẩn xác không?
   - Logic tính điểm danh theo công thức 15 phút & 80% thời lượng có đúng không?
   - Quiz có tự động mở khóa bài học kế tiếp khi đạt điểm sàn không?
4. **Style (Quy Chuẩn Code)**:
   - Đặt tên biến, hàm theo camelCase; tên class theo PascalCase.
   - DTO có decorator xác thực chặt chẽ không?
5. **Reuse (Tái Sử Dụng)**:
   - Đã tái sử dụng PrismaService, AuthService, Common Decorators thay vì viết trùng lặp?
