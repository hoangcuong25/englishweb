---
name: code-review
description: >-
  Kỹ năng thực hiện quy trình review code 5 chiều: Security, Performance, Correctness, Style, Reuse trước khi merge code hoặc bàn giao tính năng.
---

# Code Review 5 Dimensions Skill

## 1. Trình Tự Thực Hiện
1. Quét git status và git diff các file đã thay đổi.
2. Kiểm tra lần lượt qua 5 chiều đánh giá:
   - **Chiều 1: Security**:
     + Có kiểm tra xác thực JWT & Phân quyền Roles chưa?
     + Có dữ liệu nhạy cảm nào bị lộ (secrets, hash password, private keys) không?
     + Token phân phối tài liệu có kiểm tra thời hạn và phân quyền không?
   - **Chiều 2: Performance**:
     + Có truy vấn Prisma nào bị lồng lặp (n+1) không? Đã dùng `include` / `select` tối ưu chưa?
     + Đã đánh index cho foreign key và các cột tìm kiếm chưa?
   - **Chiều 3: Correctness**:
     + Logic nghiệp vụ có khớp 100% với đặc tả SRS không?
     + Đã xử lý đầy đủ các nhánh lỗi (try-catch, 400, 401, 403, 404)?
   - **Chiều 4: Style**:
     + Đặt tên rõ nghĩa, tuân thủ TypeScript strict mode, không dùng `any` bừa bãi.
   - **Chiều 5: Reuse**:
     + Đã tái sử dụng hàm chung, decorator, component sẵn có thay vì duplicate code chưa?
3. Chạy `npm run test:e2e` phía server và `npm run build` phía client để xác nhận không có lỗi biên dịch hoặc gãy test.
