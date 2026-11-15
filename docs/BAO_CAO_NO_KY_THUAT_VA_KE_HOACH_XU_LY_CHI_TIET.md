# BÁO CÁO TOÀN DIỆN VỀ NỢ KỸ THUẬT, LỖI TỒN ĐỌNG & PHƯƠNG ÁN KHẮC PHỤC
## DỰ ÁN: TEACHER DONG ACADEMY (LMS & WEBRTC IN-HOUSE)

> **Ngày lập báo cáo**: 15/11/2026  
> **Người thực hiện**: Antigravity Technical Audit & Architecture Reviewer  
> **Phạm vi kiểm toán**: Toàn bộ Monorepo gồm `server/` (NestJS 10, Prisma, LiveKit, Redis, Mailer), `client/` (Next.js 14 App Router, Web Audio API, Canvas), `docker-compose.yml`, cơ sở dữ liệu MySQL và hệ thống kiểm thử tự động E2E.

---

## MỤC LỤC TỔNG QUAN

1. [Bảng Ma Trận Tổng Hợp Các Lỗi & Nợ Kỹ Thuật Tồn Đọng](#1-bảng-ma-trận-tổng-hợp-các-lỗi--nợ-kỹ-thuật-tồn-đọng)
2. [Chi Tiết 11 Lỗi Tồn Đọng, Bằng Chứng, Tác Hại & Đánh Đổi](#2-chi-tiết-11-lỗi-tồn-đọng-bằng-chứng-tác-hại--đánh-đổi)
   - [Lỗi 1: Hardcoded Fallback Secret cho JWT & LiveKit (P0 - Bảo mật)](#lỗi-1-hardcoded-fallback-secret-cho-jwt--livekit-p0---bảo-mật)
   - [Lỗi 2: LiveKit Webhook Signature Verification thất bại do thiếu Raw Body (P0 - Tích hợp)](#lỗi-2-livekit-webhook-signature-verification-thất-bại-do-thiếu-raw-body-p0---tích-hợp)
   - [Lỗi 3: Docker Compose thiếu cấu hình Redis Network cho Backend (P0 - Hạ tầng)](#lỗi-3-docker-compose-thiếu-cấu-hình-redis-network-cho-backend-p0---hạ-tầng)
   - [Lỗi 4: Single Concurrent Session chưa kiểm tra tức thời ở tầng Access Token (P1 - Bảo mật)](#lỗi-4-single-concurrent-session-chưa-kiểm-tra-tức-thời-ở-tầng-access-token-p1---bảo-mật)
   - [Lỗi 5: Thư viện số trả Buffer Mock thay vì Stream dữ liệu PDF/MP3 thật (P1 - Nghiệp vụ)](#lỗi-5-thư-viện-số-trả-buffer-mock-thay-vì-stream-dữ-liệu-pdfmp3-thật-p1---nghiệp-vụ)
   - [Lỗi 6: Cloudinary Fallback sinh URL ảo gây lỗi 404 khi thiếu API Key (P1 - Lưu trữ)](#lỗi-6-cloudinary-fallback-sinh-url-ảo-gây-lỗi-404-khi-thiếu-api-key-p1---lưu-trữ)
   - [Lỗi 7: Lạm dụng hàm `alert()` nguyên bản trình duyệt gây nghẽn UX (P2 - Trải nghiệm)](#lỗi-7-lạm-dụng-hàm-alert-nguyên-bản-trình-duyệt-gây-nghẽn-ux-p2---trải-nghiệm)
   - [Lỗi 8: Cổng phụ Socket.IO Whiteboard ở Backend chưa được Frontend kết nối (P2 - Thời gian thực)](#lỗi-8-cổng-phụ-socketio-whiteboard-ở-backend-chưa-được-frontend-kết-nối-p2---thời-gian-thực)
   - [Lỗi 9: Cảnh báo ESLint `react-hooks/exhaustive-deps` trong Whiteboard & Classroom (P2 - Mã nguồn)](#lỗi-9-cảnh-báo-eslint-react-hooksexhaustive-deps-trong-whiteboard--classroom-p2---mã-nguồn)
   - [Lỗi 10: Độ phủ Đa ngôn ngữ (i18n) chưa triệt để tại các màn hình Quản trị viên (P2 - Bản địa hóa)](#lỗi-10-độ-phủ-đa-ngôn-ngữ-i18n-chưa-triệt-để-tại-các-màn-hình-quản-trị-viên-p2---bản-địa-hóa)
   - [Lỗi 11: Backend E2E Test Suite chạy trên In-Memory Mock thay vì MySQL thật (P2 - Kiểm thử)](#lỗi-11-backend-e2e-test-suite-chạy-trên-in-memory-mock-thay-vì-mysql-thật-p2---kiểm-thử)
3. [Lộ Trình & Kế Hoạch Triển Khai Xử Lý Khuyến Nghị](#3-lộ-trình--kế-hoạch-triển-khai-xử-lý-khuyến-nghị)

---

## 1. BẢNG MA TRẬN TỔNG HỢP CÁC LỖI & NỢ KỸ THUẬT TỒN ĐỌNG

| STT | Mã Lỗi | Phân Loại | Vị Trí Code Ảnh Hưởng | Mức Độ | Trạng Thái Hiện Tại |
|---|---|---|---|---|---|
| 1 | **SEC-01** | Bảo Mật | `server/src/modules/auth/strategies/jwt.strategy.ts`<br>`server/src/modules/auth/auth.service.ts` | 🔴 **P0 (Critical)** | Có nguy cơ giả mạo JWT |
| 2 | **INT-01** | Tích Hợp | `server/src/main.ts`<br>`server/src/core/livekit/livekit.controller.ts` | 🔴 **P0 (Critical)** | Chữ ký Webhook SFU bị fail |
| 3 | **OPS-01** | Hạ Tầng | `docker-compose.yml` | 🔴 **P0 (Critical)** | Backend mất kết nối Redis khi deploy |
| 4 | **SEC-02** | Bảo Mật | `server/src/modules/auth/strategies/jwt.strategy.ts` | 🟡 **P1 (High)** | Session cũ còn sống 15 phút |
| 5 | **BIZ-01** | Nghiệp Vụ | `server/src/modules/materials/materials.service.ts` | 🟡 **P1 (High)** | File PDF/MP3 không tải được thật |
| 6 | **STO-01** | Lưu Trữ | `server/src/core/cloudinary/cloudinary.service.ts` | 🟡 **P1 (High)** | Ảnh/Audio sinh link 404 khi offline |
| 7 | **FE-01** | Trải Nghiệm | `client/src/components/classroom/classroom-container.tsx`<br>`client/src/app/(student)/student/speaking/page.tsx` | 🟢 **P2 (Medium)** | Giao diện bị khựng do `alert()` |
| 8 | **RT-01** | Thời Gian Thực | `client/src/lib/socket.ts`<br>`server/src/core/livekit/whiteboard.gateway.ts` | 🟢 **P2 (Medium)** | Dead code kênh Socket Whiteboard |
| 9 | **CODE-01** | Mã Nguồn | `client/src/components/classroom/whiteboard.tsx`<br>`client/src/components/classroom/classroom-container.tsx` | 🟢 **P2 (Medium)** | Cảnh báo React Hook Stale Closure |
| 10 | **I18N-01** | Bản Địa Hóa | `client/src/app/(admin)/admin/writing-prompts/page.tsx`<br>`client/src/app/(admin)/admin/speaking-prompts/page.tsx` | 🟢 **P2 (Medium)** | Chưa dịch sang EN/ZH/JA |
| 11 | **TEST-01** | Kiểm Thử | `server/test/app.e2e-spec.ts`<br>`server/test/mock-prisma.service.ts` | 🟢 **P2 (Medium)** | Không kiểm tra được ràng buộc MySQL thật |

---

## 2. CHI TIẾT 11 LỖI TỒN ĐỌNG, BẰNG CHỨNG, TÁC HẠI & ĐÁNH ĐỔI

---

### Lỗi 1: Hardcoded Fallback Secret cho JWT & LiveKit (P0 - Bảo mật)

#### 1. Bằng chứng cụ thể trong code
Tại [jwt.strategy.ts](file:///d:/englishweb/server/src/modules/auth/strategies/jwt.strategy.ts#L28):
```typescript
secretOrKey: configService.get<string>('JWT_SECRET', 'your_super_secret_jwt_key_2026'),
```
Tại [auth.service.ts](file:///d:/englishweb/server/src/modules/auth/auth.service.ts#L471):
```typescript
const accessToken = await this.jwtService.signAsync(payload, {
  secret: this.configService.get<string>('JWT_SECRET', 'your_super_secret_jwt_key_2026'),
  expiresIn: '15m',
});
```
Tại [docker-compose.yml](file:///d:/englishweb/docker-compose.yml#L57-L60):
```yaml
JWT_SECRET: "your_super_secret_jwt_key_2026"
JWT_REFRESH_SECRET: "your_super_secret_refresh_key_2026"
LIVEKIT_API_KEY: "API_KEY_DEV"
LIVEKIT_API_SECRET: "API_SECRET_DEV_ENGLISHWEB_2026"
```

#### 2. Tác hại, Hậu quả & Rủi ro
- **Nguy cơ an ninh cực kỳ nghiêm trọng**: Khóa bí mật ký token đang bị lộ công khai trong git repository (`your_super_secret_jwt_key_2026`).
- Khi triển khai production, nếu DevOps vô tình quên khai báo biến `JWT_SECRET` trong file `.env` hoặc container environment, hệ thống sẽ **âm thầm sử dụng chuỗi bí mật mặc định này** mà không hề cảnh báo.
- Kẻ tấn công chỉ cần dùng thư viện `jsonwebtoken` với secret `'your_super_secret_jwt_key_2026'` là có thể tự tạo ra Access Token với vai trò `role: ADMIN`, chiếm quyền điều khiển toàn bộ cơ sở dữ liệu, sửa điểm học viên, xóa khóa học và lộ dữ liệu người dùng.

#### 3. Phương án thay đổi / Khắc phục
- Loại bỏ hoàn toàn giá trị fallback dạng string cố định.
- Sử dụng module xác thực cấu hình tập trung (`Joi` hoặc `@nestjs/config` validation schema) để kiểm tra bắt buộc khi server khởi động. Nếu thiếu `JWT_SECRET`, ứng dụng sẽ lập tức dừng hoạt động và thông báo lỗi.
```typescript
// Sửa trong jwt.strategy.ts
const secret = configService.get<string>('JWT_SECRET');
if (!secret) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing!');
}
super({
  // ...
  secretOrKey: secret,
});
```

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Triệt tiêu 100% rủi ro giả mạo chữ ký số JWT. Đảm bảo chuẩn an toàn thông tin OWASP Top 10 và 12-Factor App.
- **Tiêu cực (Cons)**: Môi trường Local Development bắt buộc phải có file `.env` hợp lệ thì backend mới khởi động được, dev không thể "chạy chay" nếu không clone đủ config.

---

### Lỗi 2: LiveKit Webhook Signature Verification thất bại do thiếu Raw Body (P0 - Tích hợp)

#### 1. Bằng chứng cụ thể trong code
Tại [livekit.controller.ts](file:///d:/englishweb/server/src/core/livekit/livekit.controller.ts#L107):
```typescript
@Post('webhook')
async handleWebhook(@Req() req: Request, @Headers('authorization') authHeader: string) {
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  return this.livekitService.handleWebhook(rawBody, authHeader);
}
```
Tại [main.ts](file:///d:/englishweb/server/src/main.ts#L10):
```typescript
const app = await NestFactory.create(AppModule); // Thiếu cấu hình { rawBody: true }
```

#### 2. Tác hại, Hậu quả & Rủi ro
- Thuật toán xác minh Webhook của LiveKit SDK (`WebhookReceiver.receive(body, authHeader)`) sử dụng thuật toán băm HMAC SHA-256 đối chiếu chữ ký số trên **chuỗi byte nguyên bản (raw bytes)** được truyền qua HTTP.
- Khi NestJS khởi tạo mà không có `{ rawBody: true }`, middleware `body-parser` mặc định sẽ parse HTTP payload thành JavaScript object (`req.body`). 
- Lệnh `JSON.stringify(req.body)` tạo ra một chuỗi JSON mới có thể bị thay đổi thứ tự các thuộc tính (keys ordering) và khoảng trắng (whitespaces), dẫn đến chuỗi băm tính ra không khớp với header `authorization`.
- **Hậu quả**: LiveKit Webhook sẽ văng lỗi `Sha256 checksum mismatch` hoặc `Unauthorized`. Toàn bộ luồng **tự động tính phút tham gia lớp học, tự động điểm danh PRESENT / LATE / ABSENT và cập nhật chuyên cần của học viên sẽ bị tê liệt hoàn toàn** trên môi trường thật.

#### 3. Phương án thay đổi / Khắc phục
- Cấu hình NestJS lưu giữ Raw Body nguyên thủy trong [main.ts](file:///d:/englishweb/server/src/main.ts):
```typescript
const app = await NestFactory.create(AppModule, { rawBody: true });
```
- Lấy chuỗi raw body chuẩn xác từ `(req as any).rawBody`:
```typescript
// Sửa trong livekit.controller.ts
@Post('webhook')
async handleWebhook(@Req() req: any, @Headers('authorization') authHeader: string) {
  const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
  return this.livekitService.handleWebhook(rawBody, authHeader);
}
```

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Webhook LiveKit SFU hoạt động ổn định và chính xác 100%, bảo đảm tính năng điểm danh tự động hoạt động trơn tru.
- **Tiêu cực (Cons)**: Node.js tốn thêm một phần bộ nhớ RAM nhỏ (khoảng vài KB cho mỗi request webhook) để lưu giữ buffer raw payload.

---

### Lỗi 3: Docker Compose thiếu cấu hình Redis Network cho Backend (P0 - Hạ tầng)

#### 1. Bằng chứng cụ thể trong code
Tại [docker-compose.yml](file:///d:/englishweb/docker-compose.yml#L45-L67):
```yaml
  redis:
    image: redis:7-alpine
    container_name: englishweb_redis
    restart: always
    ports:
      - "6379:6379"

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: englishweb_backend
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: "mysql://lms_user:lms_password_123@mysql:3306/english_lms"
      # KHÔNG HỀ CÓ REDIS_HOST hoặc REDIS_URL Ở ĐÂY!
    depends_on:
      mysql:
        condition: service_healthy
      livekit:
        condition: service_started
      # KHÔNG HỀ DEPENDS VÀO REDIS!
```

#### 2. Tác hại, Hậu quả & Rủi ro
- Khi triển khai hệ thống bằng lệnh `docker compose up -d`, container `englishweb_backend` không có biến môi trường `REDIS_HOST`.
- Mã nguồn trong [redis.service.ts](file:///d:/englishweb/server/src/core/redis/redis.service.ts) sẽ mặc định kết nối tới `localhost:6379`. Trong môi trường mạng của Docker, `localhost` trỏ về chính container backend chứ không trỏ sang container `englishweb_redis`.
- Kết nối Redis thất bại, backend buộc phải rơi vào trạng thái `Memory fallback` (lưu cache trên RAM của tiến trình Node.js).
- **Hậu quả**: Khi scale backend lên từ 2 container trở lên (Load Balancing), danh sách đen token bị thu hồi (Blacklist session) và bộ nhớ đệm cache không được chia sẻ giữa các container. Học viên bị Admin khóa tài khoản ở container A vẫn có thể gọi API sang container B bình thường.

#### 3. Phương án thay đổi / Khắc phục
- Cập nhật [docker-compose.yml](file:///d:/englishweb/docker-compose.yml):
```yaml
  server:
    environment:
      # ...
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      mysql:
        condition: service_healthy
      livekit:
        condition: service_started
      redis:
        condition: service_started
```

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Hạ tầng container đồng bộ chuẩn xác, kích hoạt toàn diện Redis Caching và Token Blacklist phân tán.
- **Tiêu cực (Cons)**: Container backend sẽ mất thêm 1-2 giây chờ container Redis sẵn sàng trước khi khởi động.

---

### Lỗi 4: Single Concurrent Session chưa kiểm tra tức thời ở tầng Access Token (P1 - Bảo mật)

#### 1. Bằng chứng cụ thể trong code
Tại [auth.service.ts](file:///d:/englishweb/server/src/modules/auth/auth.service.ts#L86-L104):
```typescript
// Single Concurrent Session: Revoke existing active tokens for STUDENT
if (user.role === Role.STUDENT) {
  // Revoke refreshToken trong Database
  await this.prisma.refreshToken.updateMany({ /* ... */ });

  // Blacklist session cũ trong Redis
  const oldSessionToken = await this.redisService.get(`user:session:${user.id}`);
  if (oldSessionToken) {
    await this.redisService.set(`blacklist:token:${oldSessionToken}`, 'revoked', 7 * 24 * 3600);
  }
}
```
Tuy nhiên, tại [jwt.strategy.ts](file:///d:/englishweb/server/src/modules/auth/strategies/jwt.strategy.ts#L32-L50):
```typescript
async validate(payload: { sub: string; email: string; role: string }) {
  const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    throw new UnauthorizedException('User account is inactive or not found');
  }
  // HOÀN TOÀN KHÔNG KIỂM TRA REDIS BLACKLIST HOẶC ACTIVE SESSION ID CỦA USER!
  return user;
}
```

#### 2. Tác hại, Hậu quả & Rủi ro
- Theo yêu cầu đặc tả SRS, tài khoản `STUDENT` chỉ được phép đăng nhập trên 1 thiết bị tại một thời điểm (Single Concurrent Session). Khi đăng nhập thiết bị mới, thiết bị cũ phải bị vô hiệu hóa ngay lập tức.
- Thực tế hiện tại: Khi thiết bị B đăng nhập, hệ thống chỉ thu hồi `refreshToken` của thiết bị A. Nhưng `accessToken` của thiết bị A (có thời hạn 15 phút) **vẫn hợp lệ về mặt mật mã học (cryptographically valid)**.
- Do `JwtStrategy` không kiểm tra Redis khi nhận request, thiết bị A **vẫn có thể tiếp tục gọi API, xem bài giảng, nộp bài tập trong tối đa 15 phút** mà không hề bị đá ra (chỉ bị chặn khi token 15 phút hết hạn và phải gọi API refresh).

#### 3. Phương án thay đổi / Khắc phục
- **Bước 1**: Nhúng định danh phiên `sessionId` hoặc timestamp `loginTime` vào payload của `accessToken`.
- **Bước 2**: Khi học viên đăng nhập mới, cập nhật giá trị `user:active_session:<userId> = <sessionId>` trong Redis.
- **Bước 3**: Trong `JwtStrategy.validate()`, thêm một lệnh kiểm tra Redis siêu tốc:
```typescript
if (user.role === Role.STUDENT) {
  const activeSessionId = await this.redisService.get(`user:active_session:${user.id}`);
  if (activeSessionId && activeSessionId !== payload.sessionId) {
    throw new UnauthorizedException('Phiên đăng nhập đã bị vô hiệu hóa do có đăng nhập mới trên thiết bị khác');
  }
}
```

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Vô hiệu hóa phiên cũ **ngay lập tức trong mili-giây** trên mọi thiết bị khi phát sinh đăng nhập mới, đáp ứng 100% chuẩn SRS chống chia sẻ tài khoản.
- **Tiêu cực (Cons)**: Mỗi HTTP Request có bảo vệ JWT sẽ phát sinh thêm 1 network round-trip truy vấn tới Redis (tốn khoảng 0.3ms - 0.8ms độ trễ).

---

### Lỗi 5: Thư viện số trả Buffer Mock thay vì Stream dữ liệu PDF/MP3 thật (P1 - Nghiệp vụ)

#### 1. Bằng chứng cụ thể trong code
Tại [materials.service.ts](file:///d:/englishweb/server/src/modules/materials/materials.service.ts#L286-L301):
```typescript
const contentType = material.type === MaterialType.PDF ? 'application/pdf' : 'audio/mpeg';

// Mock document content buffer for test/verification
const buffer = Buffer.from(
  material.type === MaterialType.PDF
    ? `%PDF-1.4 Mock Encrypted Secure Document for ${material.title}`
    : `MOCK_AUDIO_MP3_STREAM_FOR_${material.title}`,
);

return { material, contentType, buffer, fileSize: buffer.length };
```

#### 2. Tác hại, Hậu quả & Rủi ro
- Module Kho học liệu số (Digital Library) đã được trang bị cơ chế bảo mật rất tốt: Signed URL thời hạn 15 phút và Dynamic Watermark canvas.
- Tuy nhiên, endpoint stream dữ liệu thật (`/api/materials/:id/stream`) lại đang trả về một chuỗi string ngắn giả lập PDF (`%PDF-1.4 Mock Encrypted...`).
- **Hậu quả**: Khi giảng viên tải lên một cuốn giáo trình IELTS Cambridge 50 trang (dạng PDF thật) hoặc một file nghe Listening Part 4 (MP3 thật), học viên mở tài liệu sẽ nhận được file hỏng (corrupted PDF), trình duyệt không thể render ra nội dung sách và audio player không phát được tiếng.

#### 3. Phương án thay đổi / Khắc phục
- Thiết lập thư mục lưu trữ tài liệu riêng biệt nằm ngoài thư mục public (ví dụ: `server/private_storage/materials/`).
- Trong `materials.service.ts`, sử dụng `fs.createReadStream` kết hợp đường dẫn file vật lý được lưu trong database (`material.filePath`):
```typescript
const fullFilePath = path.join(process.cwd(), 'private_storage', material.fileKey);
if (!fs.existsSync(fullFilePath)) {
  throw new NotFoundException('Tệp tin học liệu gốc không tồn tại trên hệ thống lưu trữ');
}
const fileStream = fs.createReadStream(fullFilePath);
return { material, contentType, stream: fileStream, fileSize: fs.statSync(fullFilePath).size };
```

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Học viên đọc và nghe được toàn bộ tài liệu học tập thực tế một cách mượt mà và bảo mật.
- **Tiêu cực (Cons)**: Cần quản lý dung lượng ổ cứng máy chủ lưu trữ (Private Storage Volume), cần cấu hình backup định kỳ tránh mất mát dữ liệu học liệu khi server gặp sự cố.

---

### Lỗi 6: Cloudinary Fallback sinh URL ảo gây lỗi 404 khi thiếu API Key (P1 - Lưu trữ)

#### 1. Bằng chứng cụ thể trong code
Tại [cloudinary.service.ts](file:///d:/englishweb/server/src/core/cloudinary/cloudinary.service.ts#L97-L113):
```typescript
// Mock storage fallback khi không có API key trong dev / test environment
if (!this.isConfigured || !buffer) {
  const mockId = `mock_${resourceType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const ext = resourceType === 'video' ? 'mp4' : 'jpg';
  const mockUrl = `https://res.cloudinary.com/englishweb/${resourceType}/upload/v1700000000/${options.folder}/${mockId}.${ext}`;

  return {
    url: mockUrl,
    secureUrl: mockUrl,
    publicId: `${options.folder}/${mockId}`,
    // ...
  };
}
```

#### 2. Tác hại, Hậu quả & Rủi ro
- Khi chạy ứng dụng ở môi trường local hoặc khi chưa gắn thông tin tài khoản Cloudinary (`CLOUDINARY_API_KEY`), service sinh ra một đường link giả dạng Cloudinary URL.
- File upload (ảnh đại diện học viên, video bài học, bài nộp ghi âm Speaking) thực chất **bị vứt bỏ hoàn toàn trong bộ nhớ đệm và không được lưu ở bất cứ đâu**.
- **Hậu quả**: Khi frontend hiển thị thẻ `<img src={mockUrl}>` hoặc phát `<audio src={mockUrl}>`, trình duyệt gửi request tới Cloudinary và nhận mã lỗi `404 Not Found` (hình ảnh bị vỡ biểu tượng icon broken image).

#### 3. Phương án thay đổi / Khắc phục
- Xây dựng cơ chế **Dual Storage Driver**:
  - Nếu có Cloudinary credentials: Tải lên Cloudinary CDN.
  - Nếu không có Cloudinary: Tự động chuyển sang **Local Disk Storage**, ghi file buffer vào thư mục `server/public/uploads/` và trả về URL nội bộ dạng `http://localhost:3001/uploads/...`.
- Cấu hình `@nestjs/serve-static` trong NestJS để phục vụ file từ thư mục `public/uploads/` này.

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Cho phép dev, tester và reviewer chạy thử và kiểm tra đầy đủ tính năng upload ảnh, nộp bài thu âm Speaking mà không cần phụ thuộc vào tài khoản cloud bên ngoài.
- **Tiêu cực (Cons)**: Cần thêm logic dọn dẹp file tạm trên ổ đĩa dev và cấu hình phân quyền ghi thư mục cho container Docker.

---

### Lỗi 7: Lạm dụng hàm `alert()` nguyên bản trình duyệt gây nghẽn UX (P2 - Trải nghiệm)

#### 1. Bằng chứng cụ thể trong code
Xuất hiện rải rác tại nhiều màn hình quan trọng:
- [student/speaking/page.tsx:138](file:///d:/englishweb/client/src/app/(student)/student/speaking/page.tsx#L138):
  `alert('Không thể truy cập microphone. Vui lòng cấp quyền micro cho trình duyệt!');`
- [classroom-container.tsx:113](file:///d:/englishweb/client/src/components/classroom/classroom-container.tsx#L113):
  `alert('Giảng viên đã kết thúc buổi học trực tuyến. Bạn sẽ được chuyển về Dashboard.');`
- [whiteboard.tsx:506](file:///d:/englishweb/client/src/components/classroom/whiteboard.tsx#L506):
  `alert('Vui lòng chọn file hình ảnh (PNG, JPG, WebP) của đề bài hoặc tài liệu.');`
- [admin/messages/page.tsx:384, 389, 394](file:///d:/englishweb/client/src/app/(admin)/admin/messages/page.tsx#L384):
  `alert('Đã đánh dấu phiên hỗ trợ này là hoàn thành.');`

#### 2. Tác hại, Hậu quả & Rủi ro
- Lệnh `window.alert()` là phương thức đồng bộ (synchronous modal dialog), nó **đóng băng toàn bộ JavaScript main thread** cho đến khi người dùng bấm OK.
- Trên trình duyệt di động (iOS Safari, Android Chrome), pop-up `alert()` có giao diện thô cứng của hệ điều hành, làm vỡ trải nghiệm hiện đại (Slate/Sky Blue theme) của ứng dụng EdTech.
- Nếu người dùng bấm "Prevent this page from creating additional dialogs", trang web sẽ bị vô hiệu hóa toàn bộ thông báo tiếp theo.

#### 3. Phương án thay đổi / Khắc phục
- Tích hợp thư viện thông báo Toast chuyên nghiệp, nhẹ và chuẩn React (ví dụ: `sonner` hoặc custom Toast context có sẵn):
```tsx
import { toast } from 'sonner';

// Thay thế:
toast.error('Không thể truy cập microphone. Vui lòng cấp quyền micro cho trình duyệt!');
toast.success('Đã đánh dấu phiên hỗ trợ này là hoàn thành.');
```

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Giao diện mượt mà, thông báo tự động ẩn sau 3 giây, hỗ trợ animation, màu sắc phân loại (success/error/warning) và không làm đứng trình duyệt.
- **Tiêu cực (Cons)**: Cần bổ sung component `<Toaster />` vào Root Layout và refactor lại các vị trí gọi `alert()` trong mã nguồn.

---

### Lỗi 8: Cổng phụ Socket.IO Whiteboard ở Backend chưa được Frontend kết nối (P2 - Thời gian thực)

#### 1. Bằng chứng cụ thể trong code
- Tại [client/src/lib/socket.ts:53-67](file:///d:/englishweb/client/src/lib/socket.ts#L53):
```typescript
export function getWhiteboardSocket(): Socket {
  if (!whiteboardSocket) {
    whiteboardSocket = io(`${SOCKET_SERVER_URL}/whiteboard`, { /* ... */ });
  }
  return whiteboardSocket;
}
```
- Phía backend có Gateway hoàn chỉnh: [whiteboard.gateway.ts](file:///d:/englishweb/server/src/core/livekit/whiteboard.gateway.ts#L16) (`@WebSocketGateway({ namespace: '/whiteboard' })`).
- Tuy nhiên, trong [classroom-container.tsx](file:///d:/englishweb/client/src/components/classroom/classroom-container.tsx#L260-L285), hàm `getWhiteboardSocket` **hoàn toàn không được import hoặc sử dụng**.

#### 2. Tác hại, Hậu quả & Rủi ro
- Đây là một dạng nợ kỹ thuật **mã nguồn dư thừa (Dead Code) / chức năng bị bỏ dở (Incomplete Integration)**.
- Hiện tại, bảng vẽ tương tác (Whiteboard) chỉ phụ thuộc duy nhất vào LiveKit Data Channel (WebRTC). Nếu học viên ở mạng có tường lửa chặn giao thức UDP WebRTC (mạng công ty, cơ quan, trường học), kết nối LiveKit bị chập chờn thì bảng trắng sẽ mất hoàn toàn khả năng vẽ tương tác 2 chiều.

#### 3. Phương án thay đổi / Khắc phục
- Xây dựng cơ chế **Dual Realtime Fallback**: Trong `classroom-container.tsx`, ưu tiên truyền nét vẽ qua LiveKit Data Channel; nếu Data Channel ngắt kết nối thì tự động fall-back gửi sự kiện `wb_stroke`, `wb_clear` qua `getWhiteboardSocket()`.

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Đảm bảo bảng trắng vẽ mượt và đồng bộ trong 100% điều kiện mạng phức tạp nhất.
- **Tiêu cực (Cons)**: Cần thêm logic khử trùng lặp nét vẽ (de-duplication) nếu cả hai kênh WebRTC và WebSocket cùng hoạt động đồng thời.

---

### Lỗi 9: Cảnh báo ESLint `react-hooks/exhaustive-deps` trong Whiteboard & Classroom (P2 - Mã nguồn)

#### 1. Bằng chứng cụ thể trong code
Khi chạy `npm --prefix client run build`:
```
./src/components/classroom/classroom-container.tsx
167:6  Warning: React Hook useEffect has missing dependencies: 'isSidebarOpen', 'router', and 'setupMockClassroom'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/classroom/whiteboard.tsx
120:6  Warning: React Hook useEffect has missing dependencies: 'redrawBackground' and 'strokes'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
```

#### 2. Tác hại, Hậu quả & Rủi ro
- Việc bỏ qua dependency trong mảng `useEffect` có thể gây ra hiện tượng **Stale Closure** (hàm vẽ giữ tham chiếu tới giá trị cũ của `strokes` tại thời điểm component mount ban đầu).
- Hậu quả: Khi đổi ảnh nền bảng vẽ hoặc phóng to màn hình, nét vẽ cũ có thể bị mất hoặc canvas vẽ đè lên hình ảnh cũ mà không được làm sạch đúng cách.

#### 3. Phương án thay đổi / Khắc phục
- Sử dụng `useCallback` bọc các hàm `redrawBackground`, `setupMockClassroom` hoặc sử dụng `useRef` để theo dõi giá trị mới nhất của `strokesRef.current` mà không kích hoạt re-render không cần thiết.

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Loại bỏ sạch sẽ 100% cảnh báo khi build dự án, mã nguồn chuẩn mực theo quy tắc React 18.
- **Tiêu cực (Cons)**: Cần kiểm tra cẩn thận sau khi sửa để đảm bảo không vô tình tạo ra vòng lặp render vô tận (infinite render loop).

---

### Lỗi 10: Độ phủ Đa ngôn ngữ (i18n) chưa triệt để tại các màn hình Quản trị viên (P2 - Bản địa hóa)

#### 1. Bằng chứng cụ thể trong code
Tại các trang quản trị chuyên sâu:
- [admin/writing-prompts/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/writing-prompts/page.tsx)
- [admin/speaking-prompts/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/speaking-prompts/page.tsx)
- [admin/writing-review/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/writing-review/page.tsx)
Các chuỗi như `"Ngân Hàng Đề Thi IELTS Writing"`, `"Thêm đề bài mới"`, `"Tiêu chí chấm điểm"`... đều đang viết cứng bằng Tiếng Việt trực tiếp trong JSX mà không thông qua hàm `t(...)`.

#### 2. Tác hại, Hậu quả & Rủi ro
- Trang web hỗ trợ 4 ngôn ngữ (Tiếng Việt `VI`, Tiếng Anh `EN`, Tiếng Trung `ZH`, Tiếng Nhật `JA`).
- Khi giáo viên hoặc đối tác quốc tế chuyển ngôn ngữ sang `EN` trên thanh Topbar, chỉ có menu bên ngoài chuyển đổi, còn nội dung thao tác quản lý đề thi bên trong vẫn hiển thị hoàn toàn bằng Tiếng Việt, gây khó khăn cho việc mở rộng trung tâm đào tạo ra thị trường quốc tế.

#### 3. Phương án thay đổi / Khắc phục
- Bổ sung các key tương ứng vào từ điển dịch thuật [client/src/lib/i18n-context.tsx](file:///d:/englishweb/client/src/lib/i18n-context.tsx) và thay thế chuỗi hardcode bằng `t('admin.writing.title', 'Ngân Hàng Đề Thi IELTS Writing')`.

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Giao diện chuẩn mực EdTech quốc tế, sẵn sàng cho người dùng đa quốc gia.
- **Tiêu cực (Cons)**: Tăng kích thước từ điển dịch thuật, đòi hỏi chi phí dịch thuật chuẩn xác các thuật ngữ chuyên môn IELTS sang Tiếng Trung và Tiếng Nhật.

---

### Lỗi 11: Backend E2E Test Suite chạy trên In-Memory Mock thay vì MySQL thật (P2 - Kiểm thử)

#### 1. Bằng chứng cụ thể trong code
Tại [server/test/app.e2e-spec.ts:7-20](file:///d:/englishweb/server/test/app.e2e-spec.ts#L7):
```typescript
import { MockPrismaService } from './mock-prisma.service';

describe('Teacher Dong Academy - E2E Comprehensive Test Suite', () => {
  let mockPrisma: MockPrismaService;
  beforeAll(async () => {
    mockPrisma = new MockPrismaService();
    // Thay thế PrismaService thật bằng MockPrismaService!
  });
});
```

#### 2. Tác hại, Hậu quả & Rủi ro
- Mặc dù test suite đạt thành tích xuất sắc **141/141 test cases PASS 100%**, nhưng toàn bộ dữ liệu đang được lưu trong JavaScript Array của RAM.
- **Hậu quả**: Các lỗi cơ sở dữ liệu thực thụ không thể bị phát hiện trong quá trình test, ví dụ:
  - Lỗi vi phạm khóa ngoại (Foreign Key constraint violation) khi xóa một khóa học chứa bài học.
  - Lỗi độ dài chuỗi ký tự (Data truncation) của các bài viết luận IELTS dài hơn 5000 ký tự.
  - Lỗi bảng mã Tiếng Việt (MySQL Collation `utf8mb4_unicode_ci` vs `latin1`).
  - Lỗi xung đột khóa chính khi chạy đồng thời nhiều transaction (Concurrency Race Conditions).

#### 3. Phương án thay đổi / Khắc phục
- Duy trì bộ test mock hiện tại để chạy nhanh trong quá trình code hàng ngày (`npm run test:quick`).
- Xây dựng thêm một kịch bản test integration thực sự (`npm run test:integration`) kết nối trực tiếp vào container MySQL test (`DATABASE_URL_TEST`), chạy `prisma migrate deploy` trước khi kiểm thử để đảm bảo MySQL 8.0 thực thi trơn tru mọi câu lệnh SQL.

#### 4. Đánh đổi (Trade-offs)
- **Tích cực (Pros)**: Đảm bảo độ tin cậy tuyệt đối 100% trên môi trường database thực tế, ngăn ngừa các bug bất ngờ khi lên Production.
- **Tiêu cực (Cons)**: Thời gian chạy test sẽ tăng từ 1.5 giây lên khoảng 15 - 25 giây do phải thực hiện I/O ghi đĩa vào MySQL và dọn dẹp database sau mỗi lần chạy.

---

## 3. LỘ TRÌNH & KẾ HOẠCH TRIỂN KHAI XỬ LÝ KHUYẾN NGHỊ

```
                     KẾ HOẠCH "TRẢ NỢ KỸ THUẬT" DỰ ÁN
                     
  Giai đoạn 1: BẢO MẬT & HẠ TẦNG (Ưu tiên làm ngay)
  ├── 1. Khóa fallback JWT Secret & chuẩn hóa biến môi trường bắt buộc (SEC-01)
  ├── 2. Bật rawBody cho NestJS để LiveKit Webhook điểm danh hoạt động chính xác (INT-01)
  └── 3. Cập nhật docker-compose.yml kết nối mạng Redis container (OPS-01)

  Giai đoạn 2: HOÀN THIỆN NGHIỆP VỤ & LƯU TRỮ (Tuần tiếp theo)
  ├── 4. Bổ sung kiểm tra Single Session tức thời trong JwtStrategy (SEC-02)
  ├── 5. Nối file stream PDF/MP3 thực tế cho Kho học liệu số (BIZ-01)
  └── 6. Xây dựng Local Disk Storage fallback cho Media Controller (STO-01)

  Giai đoạn 3: TỐI ƯU TRẢI NGHIỆM & CHẤT LƯỢNG CODE (Hoàn thiện sản phẩm)
  ├── 7. Thay thế browser alert() bằng Toast Notification Component (FE-01)
  ├── 8. Sửa dứt điểm các cảnh báo React Hook dependencies (CODE-01)
  ├── 9. Hoàn tất i18n cho các form quản trị viên còn sót (I18N-01)
  └── 10. Bổ sung bộ Integration Test trên Database MySQL thật (TEST-01)
```

Bản báo cáo này cung cấp cơ sở kỹ thuật chi tiết nhất để đội ngũ phát triển và các bên liên quan đánh giá chính xác khối lượng công việc, rủi ro tiềm ẩn và tiến hành nâng cấp hệ thống một cách có lộ trình, an toàn và bài bản.

