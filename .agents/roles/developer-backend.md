# Role: Backend Developer (Lập Trình Phía Server)

## 1. Mục Tiêu & Trách Nhiệm
Phát triển các module phía Backend trên nền tảng NestJS, Prisma ORM, MySQL, LiveKit Server SDK và Socket.IO.

## 2. Quy Chuẩn Bắt Buộc Về Cấu Trúc Thư Mục (`server/src/`)
Toàn bộ mã nguồn phía server tuân thủ nghiêm ngặt 2 phân vùng:

1. **`server/src/core/` (Hạ tầng nền tảng & Dùng chung)**:
   - `core/common/`: Guards (`JwtAuthGuard`, `RolesGuard`), Decorators (`CurrentUser`, `Roles`), Filters, Interceptors.
   - `core/prisma/`: `PrismaService`, `PrismaModule` kết nối MySQL 8.0.
   - `core/livekit/`: `LivekitService`, `LivekitController`, `LivekitModule` tích hợp WebRTC SFU & Webhook.

2. **`server/src/modules/` (Tất cả module nghiệp vụ chức năng)**:
   - **BẮT BUỘC**: Mọi module tính năng mới (ví dụ: `courses`, `lessons`, `quizzes`, `speaking`, `writing`, `attendance`, `dashboard`, `chat`) **PHẢI** được tạo bên trong `server/src/modules/<module-name>/`.
   - **TUYỆT ĐỐI KHÔNG** tạo module nghiệp vụ nằm trực tiếp tại thư mục gốc `server/src/`.
   - Cấu trúc chuẩn của một module nghiệp vụ:
     ```
     server/src/modules/<name>/
     ├── dto/                      # Request/Response DTOs với class-validator
     │   ├── create-<name>.dto.ts
     │   └── update-<name>.dto.ts
     ├── <name>.controller.ts      # REST Endpoints + Swagger decorators
     ├── <name>.service.ts         # Business Logic + Prisma transactions
     └── <name>.module.ts          # Khai báo NestJS Module
     ```

3. **Quy Tắc Đường Dẫn Import**:
   - Gọi Prisma: `import { PrismaService } from '../../core/prisma/prisma.service';`
   - Gọi Guards: `import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';`
   - Gọi Decorators: `import { CurrentUser } from '../../core/common/decorators/current-user.decorator';`
   - Gọi Roles: `import { Roles } from '../../core/common/decorators/roles.decorator';`

## 3. Quy Trình Lập Trình 4 Bước Chuẩn
1. **Bước 1 - Khảo sát Tái Sử Dụng (Reuse Scan)**:
   - Kiểm tra `server/src/core/common/` và các module đã có trong `server/src/modules/`.
   - Tái sử dụng decorator (`@CurrentUser()`, `@Roles()`), guard và Prisma models sẵn có.
2. **Bước 2 - Định nghĩa DTO & Validation**:
   - Tất cả request body phải có DTO class với decorators từ `class-validator` và `class-transformer`.
   - Validate kiểu dữ liệu, độ dài chuỗi, định dạng email, password strength.
3. **Bước 3 - Triển khai Logic & Database Operation**:
   - Gọi cơ sở dữ liệu thông qua `PrismaService`.
   - Luôn sử dụng transaction (`prisma.$transaction`) cho các chuỗi hành động đồng thời.
   - Tuyệt đối không trả `passwordHash` trong response user.
4. **Bước 4 - Kiểm Thử Bắt Buộc (Testing Verification)**:
   - Cập nhật test e2e tại `server/test/app.e2e-spec.ts`.
   - Chạy lệnh kiểm tra biên dịch `node node_modules/typescript/bin/tsc --project tsconfig.build.json --noEmit` đạt 0 lỗi.

## 4. Bắt Lỗi & Swagger API
- Mọi Controller phải có `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`, `@ApiBearerAuth()`.
- Bắt lỗi tập trung: Ném các exception chuẩn của NestJS (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`).
