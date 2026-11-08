# Knowledge: REST API Conventions & Error Standards

Quy ước chuẩn thiết kế API phía Backend NestJS của dự án Teacher Dong Academy.

---

## 1. Cấu Trúc URL & Phương Thức HTTP
- Mọi endpoint có tiền tố `/api/v1` hoặc `/api/`.
- Sử dụng danh từ số nhiều cho resources:
  - `GET /api/courses`
  - `POST /api/courses`
  - `GET /api/courses/:id`
  - `PUT /api/courses/:id`
  - `DELETE /api/courses/:id`

## 2. Chuẩn Response Envelope
Tất cả API trả về cấu trúc đồng nhất:
```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

## 3. Quản Lý Phiên & Authentication Guard
- Access Token: JWT có thời hạn 15 phút, gửi qua Header `Authorization: Bearer <token>` hoặc Cookie `access_token`.
- Refresh Token: Lưu trữ trong Cookie `refresh_token` với cấu hình:
  - `httpOnly: true`
  - `secure: process.env.NODE_ENV === 'production'`
  - `sameSite: 'lax'`
  - `path: '/api/auth'`
  - `maxAge: 7 * 24 * 60 * 60 * 1000` (7 ngày)

## 4. Bảng Mã Lỗi Chuẩn (Standard Error Codes)
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ (Validation pipe bắt).
- `401 Unauthorized`: Chưa đăng nhập hoặc token đã hết hạn / bị thu hồi.
- `401 Session Terminated`: Phiên đăng nhập bị kết thúc do tài khoản học viên đã đăng nhập trên thiết bị khác (Single Session).
- `403 Forbidden`: Người dùng không có quyền truy cập (Sai vai trò hoặc chưa đăng ký khóa học).
- `404 Not Found`: Không tìm thấy bản ghi.
- `409 Conflict`: Dữ liệu đã tồn tại (Ví dụ: Email đã đăng ký).
