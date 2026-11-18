# BÁO CÁO RÀ SOÁT AN TOÀN BẢO MẬT, ĐỘ ỔN ĐỊNH VÀ TOÀN VẸN DỮ LIỆU
**Dự án**: Teacher Dong Academy (LMS & LiveKit WebRTC Platform)  
**Thời gian rà soát**: Tháng 11/2026  
**Chuyên gia thực hiện**: Senior Security & Web Systems Engineer  
**Phạm vi**: Toàn bộ Monorepo (`server/`, `client/`, `server/prisma/`, cấu hình hạ tầng & WebSocket Gateways)

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

Dự án **Teacher Dong Academy** được xây dựng với ngăn xếp công nghệ hiện đại (NestJS 11, Prisma ORM 6.4, MySQL 8.0, Redis, Next.js 14 App Router, LiveKit SFU). Hệ thống đã áp dụng nhiều nguyên tắc bảo mật chuẩn hóa như: mô hình Strict 2-Role RBAC (`STUDENT` & `ADMIN`), cơ chế Single Concurrent Session cho học viên, bảo mật học liệu số với Signed URL 15 phút kèm Dynamic Watermark canvas, và ValidationPipe tập trung.

Tuy nhiên, qua rà soát chi tiết từng dòng code thực tế, hệ thống tồn tại **3 nhóm rủi ro lớn nhất**:
1. **Lỗ hổng kiểm soát truy cập và xác thực danh tính mức độ Critical**:
   - **Google OAuth Signature Bypass**: Backend giải mã Base64 `idToken` từ client mà không xác thực chữ ký số với máy chủ Google, dẫn đến nguy cơ **Account Takeover (Chiếm đoạt tài khoản Admin hoặc bất kỳ học viên nào)**.
   - **Mạo danh danh tính và tiêm tin nhắn trên WebSocket Chat Gateway**: Các cổng WebSocket (`/chat`, `/notifications`, `/whiteboard`) không xác thực JWT Token khi handshake và tin tưởng hoàn toàn `senderId`, `role` gửi từ client payload.
2. **Lỗ hổng Logic Nghiệp vụ & Vượt rào quy trình (Business Logic Bypass)**:
   - Tồn tại endpoint `POST /courses/:id/enroll` cho phép bất kỳ học viên nào tự kích hoạt ghi danh `ACTIVE` mà không cần thanh toán hay chờ Admin phê duyệt.
   - Endpoint `submitEssay` trả về nguyên bản đối tượng `submission` chứa điểm AI và bài mẫu Band 8.0+ ngay khi nộp, phá vỡ hoàn toàn cơ chế kiểm duyệt trước khi công bố (Human-in-the-loop).
3. **Hiệu năng & Toàn vẹn Dữ liệu**:
   - Sử dụng `fs.readFileSync` đọc toàn bộ file PDF/Audio (lên tới 50–100MB) vào RAM gây nghẽn đơn luồng Node.js và nguy cơ sập máy chủ do OOM (Out-of-Memory).
   - Thuật toán tính chuyên cần ghi đè `firstJoinedAt` khi học viên reconnect, dẫn đến việc học viên bị đánh dấu vắng mặt (`ABSENT`) oan uổng.

---

## 2. Danh Sách Phát Hiện Chi Tiết (Xếp Theo Mức Độ Giảm Dần)

### 🔴 MỨC ĐỘ CRITICAL (CỰC KỲ NGUY HIỂM)

---

#### 🚨 SEC-001: Chiếm quyền tài khoản do không xác thực chữ ký số Google ID Token
- **Mức độ**: `Critical` | **Nhóm**: `A (Phân quyền & Xác thực)`
- **Vị trí**: 
  - [server/src/modules/auth/auth.service.ts:151-174](file:///d:/englishweb/server/src/modules/auth/auth.service.ts#L151-L174)
  - [server/src/modules/auth/auth.service.ts:221-248](file:///d:/englishweb/server/src/modules/auth/auth.service.ts#L221-L248)
- **Mô tả vấn đề**:
  Trong hàm `googleAuth`, server tiếp nhận `dto.idToken` từ client. Nếu token chứa dấu chấm `.`, code chỉ đơn thuần cắt chuỗi và giải mã Base64 phần payload (`parts[1]`) mà **không hề xác minh chữ ký mã hóa (cryptographic signature) với Google**:
  ```typescript
  // auth.service.ts:151-163
  if (dto.idToken && dto.idToken.includes('.')) {
    try {
      const parts = dto.idToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload.sub) googleId = payload.sub;
        if (!email && payload.email) email = payload.email;
        ...
  ```
  Sau đó, hệ thống tìm user theo email và tự động liên kết tài khoản Google mới rồi cấp Access Token/Refresh Token:
  ```typescript
  // auth.service.ts:223-238
  let existingUser = await this.prisma.user.findUnique({
    where: { email: resolvedEmail },
  });
  if (existingUser) {
    googleAccount = await this.prisma.googleAccount.create({ ... });
    // Tự động generate tokens của user này!
  ```
- **Tác động thực tế**: Kẻ tấn công có thể tự tạo một JWT giả mạo mang `email` của Quản trị viên (`admin@englishweb.com`) hoặc bất kỳ học viên nào rồi gửi lên `POST /api/auth/google`. Server sẽ cấp ngay phiên đăng nhập với đầy đủ quyền hạn của tài khoản đó mà không cần mật khẩu.
- **Cách khắc phục đề xuất**:
  Sử dụng thư viện chuẩn `google-auth-library` để verify token với Google API:
  ```typescript
  import { OAuth2Client } from 'google-auth-library';

  const client = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  const ticket = await client.verifyIdToken({
    idToken: dto.idToken,
    audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email_verified) {
    throw new UnauthorizedException('Google ID Token không hợp lệ hoặc email chưa được xác minh.');
  }
  const googleId = payload.sub;
  const email = payload.email;
  ```

---

#### 🚨 SEC-002: Mạo danh danh tính và tiêm tin nhắn tùy ý trên WebSocket Chat Gateway
- **Mức độ**: `Critical` | **Nhóm**: `A (Xác thực) & C (Tấn công)`
- **Vị trí**:
  - [server/src/modules/chat/chat.gateway.ts:81-98](file:///d:/englishweb/server/src/modules/chat/chat.gateway.ts#L81-L98)
  - [server/src/modules/chat/chat.service.ts:152-164](file:///d:/englishweb/server/src/modules/chat/chat.service.ts#L152-L164)
- **Mô tả vấn đề**:
  1. `ChatGateway` mở CORS `origin: '*'` kèm `credentials: true` và hoàn toàn không có guard hay middleware xác thực token khi client kết nối.
  2. Sự kiện `sendMessage` nhận trực tiếp `senderId` và `role` từ client message payload:
  ```typescript
  // chat.gateway.ts:81-90
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; senderId: string; role: string; content: string }
  ) {
    const message = await this.chatService.sendMessage(payload.conversationId, payload.senderId, payload.role, payload.content);
  ```
  3. Trong `chat.service.ts`, server chỉ kiểm tra `if (role === 'STUDENT' && conv.studentId !== senderId)`. Nếu kẻ tấn công truyền `role: 'ADMIN'`, điều kiện này bị bỏ qua:
  ```typescript
  // chat.service.ts:161-163
  if (role === 'STUDENT' && conv.studentId !== senderId) {
    throw new ForbiddenException('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này');
  }
  // Nếu client gửi role: 'ADMIN', bypass hoàn toàn và gán senderId do client truyền vào!
  ```
- **Tác động thực tế**: Bất kỳ người dùng chưa đăng nhập nào cũng có thể kết nối WebSocket, gửi tin nhắn mạo danh Giáo viên/Admin (yêu cầu chuyển tiền học phí, phát tán link độc hại) vào bất kỳ cuộc trò chuyện nào của học viên.
- **Cách khắc phục đề xuất**:
  - Xác thực JWT token ngay tại `handleConnection` của Socket.IO, lưu `user` đã giải mã vào `client.data.user`.
  - Không bao giờ nhận `senderId` và `role` từ message body. Luôn lấy trực tiếp từ `client.data.user.id` và `client.data.user.role`.

---

### 🟠 MỨC ĐỘ HIGH (NGHIÊM TRỌNG)

---

#### ⚠️ SEC-003: Endpoint tự ghi danh khóa học miễn phí bypass quy trình duyệt thanh toán
- **Mức độ**: `High` | **Nhóm**: `A (Phân quyền) & E (Toàn vẹn nghiệp vụ)`
- **Vị trí**:
  - [server/src/modules/courses/courses.controller.ts:117-125](file:///d:/englishweb/server/src/modules/courses/courses.controller.ts#L117-L125)
  - [server/src/modules/courses/courses.service.ts:364-400](file:///d:/englishweb/server/src/modules/courses/courses.service.ts#L364-L400)
- **Mô tả vấn đề**:
  Hệ thống thiết kế luồng đăng ký khóa học có phí: học viên gửi yêu cầu chuyển khoản qua `POST /courses/:id/enroll-request` (trạng thái `PENDING`), sau đó Admin kiểm tra và duyệt qua `PUT /courses/admin/enrollments/:id/approve`.
  Tuy nhiên, controller vẫn mở công khai endpoint:
  ```typescript
  // courses.controller.ts:117-125
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  enroll(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.enrollCourse(id, user.id);
  }
  ```
  Hàm `enrollCourse` thực hiện:
  ```typescript
  // courses.service.ts:380-388
  update: { status: 'ACTIVE' },
  create: { userId, courseId, status: 'ACTIVE', progressPercent: 0 }
  ```
- **Tác động thực tế**: Bất kỳ học viên nào cũng có thể gọi trực tiếp `POST /api/courses/{courseId}/enroll` để kích hoạt trạng thái `ACTIVE` cho mọi khóa học trả phí mà không cần thanh toán hoặc chờ Admin duyệt.
- **Cách khắc phục đề xuất**:
  Chặn hoặc xóa endpoint `POST /courses/:id/enroll`. Đối với các khóa học miễn phí, cần có điều kiện `if (!course.isFree) throw new BadRequestException(...)`.

---

#### ⚠️ SEC-004: Cấp token LiveKit tùy tiện, không kiểm tra quyền ghi danh lớp học
- **Mức độ**: `High` | **Nhóm**: `A (Phân quyền truy cập)`
- **Vị trí**: [server/src/core/livekit/livekit.service.ts:87-166](file:///d:/englishweb/server/src/core/livekit/livekit.service.ts#L87-L166)
- **Mô tả vấn đề**:
  Khi học viên gọi `POST /api/livekit/token` với tham số `roomName`:
  1. Nếu tìm thấy `classroom`, server **không kiểm tra** học viên đã mua/ghi danh vào `classroom.courseId` hay chưa.
  2. Nếu `classroom` hoàn toàn không tồn tại trong DB (`null`), code vẫn bỏ qua và cấp LiveKit AccessToken hợp lệ với quyền join, publish audio/video vào LiveKit SFU:
  ```typescript
  // livekit.service.ts:149-164
  const at = new AccessToken(this.apiKey, this.apiSecret, { identity, name });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, ... });
  return { token: await at.toJwt(), ... };
  ```
- **Tác động thực tế**: Học viên có thể xâm nhập vào bất kỳ lớp học trực tuyến riêng tư nào mà không cần mua khóa học, hoặc tự ý tạo phòng không kiểm soát trên server LiveKit gây tốn tài nguyên SFU.
- **Cách khắc phục đề xuất**:
  Bắt buộc kiểm tra `classroom` phải tồn tại, và nếu là học viên (`Role.STUDENT`), phải kiểm tra bản ghi `enrollment` có `status === 'ACTIVE'` với `classroom.courseId`.

---

#### ⚠️ SEC-005: Lộ toàn bộ điểm số AI Writing và bài mẫu Band 8.0 ngay khi nộp bài
- **Mức độ**: `High` | **Nhóm**: `D (Lộ dữ liệu nhạy cảm) & Nghiệp vụ`
- **Vị trí**: [server/src/modules/writing/writing.service.ts:167-170](file:///d:/englishweb/server/src/modules/writing/writing.service.ts#L167-L170)
- **Mô tả vấn đề**:
  Theo đặc tả SRS và comment bảo mật tại [writing.service.ts:255](file:///d:/englishweb/server/src/modules/writing/writing.service.ts#L255) (`SEC-006: Human-in-the-loop gating`), học viên không được xem điểm AI và bài mẫu Band 8.0 khi chưa có Admin phê duyệt (trong `getMySubmissions` và `getSubmissionById` đều đã che trường này thành `null`).
  Tuy nhiên, tại hàm `submitEssay`:
  ```typescript
  // writing.service.ts:167-170
  return {
    message: 'Bài viết đã được nộp và phân tích bởi AI. Đang chờ Admin phê duyệt kết quả chính thức.',
    submission, // Trả về nguyên vẹn bản ghi DB vừa tạo chứa đầy đủ điểm AI, feedback và bài mẫu!
  };
  ```
- **Tác động thực tế**: Học viên chỉ cần nhìn response trả về của lệnh nộp bài là thấy ngay toàn bộ điểm AI và bài viết mẫu Band 8.0, vô hiệu hóa hoàn toàn cơ chế kiểm duyệt (Human-in-the-loop) của Giáo viên/Admin.
- **Cách khắc phục đề xuất**:
  Mask các trường nhạy cảm trong response trả về của `submitEssay` tương tự như `getSubmissionById`:
  ```typescript
  return {
    message: 'Bài viết đã được nộp và phân tích bởi AI. Đang chờ Admin phê duyệt kết quả chính thức.',
    submission: {
      id: submission.id,
      promptId: submission.promptId,
      wordCount: submission.wordCount,
      status: submission.status,
      submittedAt: submission.submittedAt,
    },
  };
  ```

---

#### ⚠️ SEC-006: Chặn nghẽn Node.js Event Loop & rủi ro OOM khi stream tài liệu bảo mật
- **Mức độ**: `High` | **Nhóm**: `F (Hiệu năng & Độ ổn định)`
- **Vị trí**:
  - [server/src/modules/materials/materials.service.ts:427](file:///d:/englishweb/server/src/modules/materials/materials.service.ts#L427)
  - [server/src/modules/materials/materials.controller.ts:151-168](file:///d:/englishweb/server/src/modules/materials/materials.controller.ts#L151-L168)
- **Mô tả vấn đề**:
  Khi client truy cập link stream tài liệu PDF hoặc file âm thanh:
  ```typescript
  // materials.service.ts:427
  buffer = fs.readFileSync(physicalPath); // Đọc đồng bộ toàn bộ file vào bộ nhớ Node Buffer!
  ```
  Và tại controller:
  ```typescript
  // materials.controller.ts:167
  res.end(buffer);
  ```
- **Tác động thực tế**: Hệ thống cho phép upload PDF lên tới 50MB và Audio lên tới 100MB. Lệnh `fs.readFileSync` chạy đồng bộ chặn đứng (block) luồng xử lý đơn (single-thread) của Node.js. Khi có nhiều học viên đồng thời nghe audio hoặc xem PDF, server sẽ bị nghẽn toàn bộ request khác hoặc sập ứng dụng do tràn bộ nhớ (Out-Of-Memory Crash). Ngoài ra, không hỗ trợ HTTP 206 Partial Content khiến người dùng không thể tua audio/video.
- **Cách khắc phục đề xuất**:
  Sử dụng `fs.createReadStream` kết hợp pipe vào `res`, đồng thời hỗ trợ `Range` header (HTTP 206) để phục vụ phát trực tuyến hiệu quả:
  ```typescript
  const stream = fs.createReadStream(physicalPath);
  stream.pipe(res);
  ```

---

#### ⚠️ SEC-007: Sai lệch tính toán chuyên cần nghiêm trọng khi học viên reconnect LiveKit
- **Mức độ**: `High` | **Nhóm**: `E (Toàn vẹn dữ liệu) & B (Nghiệp vụ)`
- **Vị trí**:
  - [server/src/core/livekit/livekit.service.ts:352-369](file:///d:/englishweb/server/src/core/livekit/livekit.service.ts#L352-L369)
  - [server/src/core/livekit/livekit.service.ts:380-405](file:///d:/englishweb/server/src/core/livekit/livekit.service.ts#L380-L405)
- **Mô tả vấn đề**:
  Trong webhook xử lý sự kiện `participant_joined`:
  ```typescript
  // livekit.service.ts:366-368
  update: {
    firstJoinedAt: now, // GHI ĐÈ firstJoinedAt mỗi lần học viên reconnect!
  }
  ```
  Và tại sự kiện `participant_left`:
  ```typescript
  // livekit.service.ts:381-384
  const durationMinutes = Math.max(1, Math.round((now.getTime() - record.firstJoinedAt.getTime()) / (1000 * 60)));
  ...
  if (durationMinutes < 15) {
    status = AttendanceStatus.ABSENT;
  }
  ```
- **Tác động thực tế**: Nếu học viên vào lớp đúng giờ (19:00) học suốt 45 phút, nhưng bị chập chờn mạng và kết nối lại lúc 19:42 rồi rời phòng lúc 19:45:
  `firstJoinedAt` bị ghi đè thành 19:42. Thời lượng `durationMinutes` tính ra chỉ là 3 phút (< 15 phút), dẫn đến việc học viên bị hệ thống đánh dấu oan thành **ABSENT (Vắng mặt)**!
- **Cách khắc phục đề xuất**:
  Không ghi đè `firstJoinedAt` nếu trường này đã có giá trị (`update: {}`). Quản lý thời gian học bằng cách cộng dồn các phiên tham gia riêng biệt (`sessionJoinedAt` và `sessionLeftAt`).

---

### 🟡 MỨC ĐỘ MEDIUM (TRUNG BÌNH)

---

#### ⚠️ SEC-008: Lộ đáp án câu hỏi trắc nghiệm qua trường `explanation` trước khi nộp bài
- **Mức độ**: `Medium` | **Nhóm**: `D (Lộ dữ liệu) & A`
- **Vị trí**: [server/src/modules/quizzes/quizzes.service.ts:177-191](file:///d:/englishweb/server/src/modules/quizzes/quizzes.service.ts#L177-L191)
- **Mô tả vấn đề**:
  Hàm `sanitizeQuizForRole` khi trả về đề thi cho học sinh:
  ```typescript
  // quizzes.service.ts:183-189
  questions: quiz.questions.map((q: any) => ({
    ...q, // Sao chép toàn bộ các trường của Question, bao gồm `explanation`!
    options: q.options.map((opt: any) => ({
      id: opt.id,
      content: opt.content,
    })),
  }))
  ```
- **Tác động thực tế**: Đoạn giải thích (`explanation`) thường chứa nội dung "Đáp án đúng là B vì...". Học viên chỉ cần mở F12 Network tab xem response của `GET /api/quizzes/:id` là biết trước toàn bộ đáp án trước khi làm bài.
- **Cách khắc phục đề xuất**: Ẩn trường `explanation: null` đối với học viên trước khi nộp bài, chỉ trả về trường này trong kết quả bài nộp sau khi đã chấm điểm.

---

#### ⚠️ SEC-009: Upload file ghi âm Speaking bị lỗi do kiểm tra nhầm MIME video
- **Mức độ**: `Medium` | **Nhóm**: `G (Trải nghiệm người dùng & Thiết kế API)`
- **Vị trí**:
  - [server/src/modules/speaking/speaking.service.ts:140-143](file:///d:/englishweb/server/src/modules/speaking/speaking.service.ts#L140-L143)
  - [server/src/core/cloudinary/cloudinary.service.ts:87-90](file:///d:/englishweb/server/src/core/cloudinary/cloudinary.service.ts#L87-L90)
- **Mô tả vấn đề**:
  Endpoint nộp bài Speaking kèm file âm thanh gọi:
  ```typescript
  // speaking.service.ts:140
  const uploadRes = await this.cloudinaryService.uploadVideo(file, 'teacher_dong_academy/speaking_audios');
  ```
  Nhưng trong `cloudinary.service.ts`:
  ```typescript
  // cloudinary.service.ts:88-90
  const mime = file.mimetype || '';
  if (!mime.startsWith('video/')) {
    throw new BadRequestException('Định dạng file không phải là video (mp4, webm, mov, mkv...)');
  }
  ```
- **Tác động thực tế**: Khi học viên ghi âm từ trình duyệt qua Web Audio API (thường sinh ra file có MIME `audio/webm`, `audio/mp3`, `audio/wav`), server sẽ lập tức từ chối và báo lỗi "Định dạng file không phải là video", làm hỏng tính năng nộp bài Speaking trực tiếp.
- **Cách khắc phục đề xuất**: Bổ sung hàm `uploadAudio` hoặc cho phép `uploadVideo` chấp nhận cả tiền tố `audio/` và `video/`.

---

#### ⚠️ SEC-010: Khóa bí mật JWT fallback hardcode trong mã nguồn
- **Mức độ**: `Medium` | **Nhóm**: `D (Lộ dữ liệu & Bí mật)`
- **Vị trí**:
  - [server/src/modules/auth/strategies/jwt.strategy.ts:20](file:///d:/englishweb/server/src/modules/auth/strategies/jwt.strategy.ts#L20)
  - [server/src/modules/auth/auth.service.ts:590](file:///d:/englishweb/server/src/modules/auth/auth.service.ts#L590)
  - [server/src/modules/materials/materials.service.ts:31](file:///d:/englishweb/server/src/modules/materials/materials.service.ts#L31)
- **Mô tả vấn đề**:
  Hệ thống sử dụng fallback secret: `'your_super_secret_jwt_key_teacher_dong_2026'` ở 3 file. Mặc dù `main.ts` có check `JWT_SECRET` nếu `NODE_ENV === 'production'`, nhưng nếu ứng dụng chạy ở môi trường Staging/Test hoặc dev quên gán `NODE_ENV=production`, JWT token sẽ được ký bằng chuỗi mặc định đã lộ công khai.
- **Cách khắc phục đề xuất**: Không dùng chuỗi fallback; throw Error ngay khi khởi tạo ứng dụng nếu `JWT_SECRET` không được định nghĩa trong `.env`.

---

#### ⚠️ SEC-011: Lỗ hổng thao túng phân quyền trên Whiteboard WebSocket Gateway
- **Mức độ**: `Medium` | **Nhóm**: `A (Phân quyền & Xác thực)`
- **Vị trí**:
  - [server/src/core/livekit/whiteboard.gateway.ts:112-116](file:///d:/englishweb/server/src/core/livekit/whiteboard.gateway.ts#L112-L116)
  - [server/src/core/livekit/whiteboard.gateway.ts:141](file:///d:/englishweb/server/src/core/livekit/whiteboard.gateway.ts#L141)
- **Mô tả vấn đề**:
  Trong `handleClearWhiteboard`, nếu client không gửi thông tin user, server mặc định gán:
  ```typescript
  const user = data.user || { id: 'anon', fullName: 'Anonymous', role: Role.ADMIN };
  ```
  Trong `handleSetPermission`, server tin tưởng trường `data.role` do client tự gửi lên:
  ```typescript
  if (!data?.roomName || data.role !== Role.ADMIN) ...
  ```
- **Tác động thực tế**: Bất kỳ học viên nào cũng có thể gửi event socket để xóa bảng trắng của lớp hoặc tự cấp quyền vẽ bảng cho mình.
- **Cách khắc phục đề xuất**: Xác thực JWT token của client khi kết nối socket và lấy `role` từ token, không tin dữ liệu client gửi qua message body.

---

### 🟢 MỨC ĐỘ LOW (THẤP)

---

#### ℹ️ SEC-012: Tiết lộ tài khoản tồn tại qua thông báo Quên mật khẩu
- **Mức độ**: `Low` | **Nhóm**: `A (Xác thực)`
- **Vị trí**: [server/src/modules/auth/auth.service.ts:641-645](file:///d:/englishweb/server/src/modules/auth/auth.service.ts#L641-L645)
- **Mô tả vấn đề**: Khi gọi `POST /api/auth/forgot-password`, nếu email không tồn tại, API trả về HTTP 404 với thông báo "Không tìm thấy tài khoản với địa chỉ email này." Kẻ tấn công có thể lợi dụng để quét và lập danh sách email học viên trong hệ thống (User Enumeration).
- **Cách khắc phục đề xuất**: Luôn trả về phản hồi chung: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn."

#### ℹ️ SEC-013: Frontend Route Protection dựa trên Cookie không HttpOnly
- **Mức độ**: `Low` | **Nhóm**: `A (Phân quyền giao diện)`
- **Vị trí**:
  - [client/src/middleware.ts:7,24](file:///d:/englishweb/client/src/middleware.ts#L7-L24)
  - [server/src/modules/auth/auth.controller.ts:52-57](file:///d:/englishweb/server/src/modules/auth/auth.controller.ts#L52-L57)
- **Mô tả vấn đề**: Next.js middleware phân quyền truy cập trang `/admin` dựa vào cookie `user_role` (`httpOnly: false`). Học viên có thể sửa cookie này thành `ADMIN` trên DevTools để render giao diện Admin (dù các API phía server vẫn chặn nếu có `@Roles(Role.ADMIN)`).
- **Cách khắc phục đề xuất**: Nên verify token JWT trực tiếp trong Next.js middleware hoặc decode claim `role` từ access_token được ký số thay vì tin cậy cookie plain text.

---

## 3. Bảng Ma Trận Toàn Bộ Endpoint & Phân Quyền Hiện Có

| Controller | Method | Endpoint URL | Vai trò cho phép | Kiểm tra quyền sở hữu? | Đánh giá & Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Public | Không áp dụng | Đăng ký học viên (`STUDENT`) |
| **Auth** | POST | `/api/auth/login` | Public | Không áp dụng | Đăng nhập, rate limit 5 lần |
| **Auth** | POST | `/api/auth/forgot-password` | Public | Không áp dụng | ⚠️ Lộ email tồn tại (SEC-012) |
| **Auth** | POST | `/api/auth/reset-password` | Public | Token 15 phút | Single-use qua Redis |
| **Auth** | POST | `/api/auth/google` | Public | Không áp dụng | 🔴 **CRITICAL**: Không verify chữ ký token (SEC-001) |
| **Auth** | POST | `/api/auth/google/link` | Authenticated | Có (`user.id`) | An toàn |
| **Auth** | POST | `/api/auth/google/unlink` | Authenticated | Có (`user.id`) | An toàn |
| **Auth** | POST | `/api/auth/refresh` | Public | Có (Cookie) | Token rotation chuẩn qua Redis |
| **Auth** | POST | `/api/auth/logout` | Public | Có (Cookie) | Thu hồi token trong Redis |
| **Auth** | POST | `/api/auth/logout-all` | Authenticated | Có (`user.id`) | An toàn |
| **Auth** | POST | `/api/auth/change-password` | Authenticated | Có (`user.id`) | An toàn |
| **Auth** | GET | `/api/auth/sessions` | Authenticated | Có (`user.id`) | An toàn |
| **Auth** | DELETE | `/api/auth/sessions/:id` | Authenticated | Có (`userId`) | An toàn |
| **Auth** | PUT | `/api/auth/language` | Authenticated | Có (`user.id`) | An toàn |
| **Auth** | GET | `/api/auth/me` | Authenticated | Có (`user.id`) | An toàn |
| **Users** | POST | `/api/users` | `ADMIN` | Phân quyền Admin | An toàn |
| **Users** | GET | `/api/users` | `ADMIN` | Phân quyền Admin | Có phân trang |
| **Users** | GET | `/api/users/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Users** | PUT | `/api/users/:id/status` | `ADMIN` | Phân quyền Admin | An toàn |
| **Users** | PUT | `/api/users/:id/reset-password` | `ADMIN` | Phân quyền Admin | An toàn |
| **Users** | POST | `/api/users/:id/avatar` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | GET | `/api/courses/categories` | Public | Không áp dụng | An toàn |
| **Courses** | GET | `/api/courses/my-learning` | `STUDENT` | Có (`user.id`) | An toàn |
| **Courses** | GET | `/api/courses/ielts-access` | Authenticated | Có (`user.id`) | An toàn |
| **Courses** | GET | `/api/courses` | Public / Auth | Không | An toàn |
| **Courses** | GET | `/api/courses/:slugOrId` | Public / Auth | Không | Lọc bài học theo quyền truy cập |
| **Courses** | POST | `/api/courses` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | PUT | `/api/courses/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | DELETE | `/api/courses/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | POST | `/api/courses/:id/enroll` | `STUDENT` | Không | ⚠️ **HIGH**: Tự kích hoạt ACTIVE miễn phí (SEC-003) |
| **Courses** | POST | `/api/courses/:id/enroll-request` | `STUDENT` | Có (`user.id`) | An toàn (trạng thái PENDING) |
| **Courses** | GET | `/api/courses/admin/enrollments` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | PUT | `/api/courses/admin/enrollments/:id/approve` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | PUT | `/api/courses/admin/enrollments/:id/reject` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | POST | `/api/courses/admin/manual-enroll` | `ADMIN` | Phân quyền Admin | An toàn |
| **Courses** | POST | `/api/courses/:id/thumbnail` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | POST | `/api/lessons/modules` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | PUT | `/api/lessons/modules/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | DELETE | `/api/lessons/modules/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | POST | `/api/lessons/modules/reorder` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | POST | `/api/lessons` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | PUT | `/api/lessons/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | DELETE | `/api/lessons/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | POST | `/api/lessons/reorder` | `ADMIN` | Phân quyền Admin | An toàn |
| **Lessons** | GET | `/api/lessons/:id/study` | Authenticated | Có (kiểm tra enrollment) | An toàn |
| **Lessons** | GET | `/api/lessons/:id` | Public / Auth | Có (kiểm tra free preview) | An toàn |
| **Lessons** | POST | `/api/lessons/:id/complete` | `STUDENT` | Có (`user.id`) | An toàn |
| **Lessons** | POST | `/api/lessons/:id/video` | `ADMIN` | Phân quyền Admin | An toàn |
| **Materials** | POST | `/api/materials` | `ADMIN` | Phân quyền Admin | An toàn |
| **Materials** | POST | `/api/materials/upload` | `ADMIN` | Phân quyền Admin | Giới hạn 50MB PDF / 100MB Audio |
| **Materials** | PUT | `/api/materials/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Materials** | DELETE | `/api/materials/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Materials** | GET | `/api/materials` | Authenticated | Có (lọc theo enrollment) | An toàn |
| **Materials** | GET | `/api/materials/lesson/:lessonId`| Authenticated | Không kiểm tra enrollment | Cần xác nhận quyền truy cập |
| **Materials** | GET | `/api/materials/:id` | Authenticated | Không kiểm tra enrollment | Chỉ trả metadata |
| **Materials** | POST | `/api/materials/:id/signed-url` | Authenticated | Có (kiểm tra enrollment) | Token 15 phút + watermark |
| **Materials** | GET | `/api/materials/:id/stream` | Public (kèm token) | Có (verify token JWT) | ⚠️ **HIGH**: `readFileSync` gây nghẽn (SEC-006) |
| **Quizzes** | POST | `/api/quizzes` | `ADMIN` | Phân quyền Admin | An toàn |
| **Quizzes** | GET | `/api/quizzes` | `ADMIN` | Phân quyền Admin | Có phân trang |
| **Quizzes** | PUT | `/api/quizzes/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Quizzes** | POST | `/api/quizzes/:id/questions` | `ADMIN` | Phân quyền Admin | An toàn |
| **Quizzes** | POST | `/api/quizzes/:id/questions/bulk`| `ADMIN` | Phân quyền Admin | An toàn |
| **Quizzes** | GET | `/api/quizzes/skills/tests` | Public / Auth | Không | An toàn |
| **Quizzes** | GET | `/api/quizzes/diagnostic/me` | Authenticated | Có (`userId`) | An toàn |
| **Quizzes** | GET | `/api/quizzes/diagnostic/admin/overview` | `ADMIN` | Phân quyền Admin | An toàn |
| **Quizzes** | GET | `/api/quizzes/diagnostic/students/:studentId` | `ADMIN` | Phân quyền Admin | An toàn |
| **Quizzes** | GET | `/api/quizzes/lesson/:lessonId` | Public / Auth | Không | Ẩn `isCorrect` |
| **Quizzes** | GET | `/api/quizzes/:id` | Public / Auth | Không | ⚠️ **MEDIUM**: Lộ trường `explanation` (SEC-008) |
| **Quizzes** | POST | `/api/quizzes/:id/submit` | `STUDENT` | Có (`user.id`) | Server chấm tự động |
| **Quizzes** | GET | `/api/quizzes/:id/my-submissions`| `STUDENT` | Có (`user.id`) | An toàn |
| **Quizzes** | DELETE | `/api/quizzes/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Writing** | GET | `/api/writing/prompts` | Public | Không áp dụng | An toàn |
| **Writing** | GET | `/api/writing/prompts/:id` | Public | Không áp dụng | An toàn |
| **Writing** | POST | `/api/writing/prompts` | `ADMIN` | Phân quyền Admin | An toàn |
| **Writing** | PUT | `/api/writing/prompts/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Writing** | DELETE | `/api/writing/prompts/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Writing** | POST | `/api/writing/drafts` | `STUDENT` | Có (`user.id`) | An toàn |
| **Writing** | GET | `/api/writing/drafts/:promptId` | `STUDENT` | Có (`user.id`) | An toàn |
| **Writing** | DELETE | `/api/writing/drafts/:promptId`| `STUDENT` | Có (`user.id`) | An toàn |
| **Writing** | POST | `/api/writing/submissions` | `STUDENT` | Có (`user.id`) | ⚠️ **HIGH**: Lộ kết quả AI khi submit (SEC-005) |
| **Writing** | GET | `/api/writing/submissions/my` | `STUDENT` | Có (`user.id`) | Đã mask điểm AI nếu chưa duyệt |
| **Writing** | GET | `/api/writing/submissions/:id` | Authenticated | Có (kiểm tra ownership) | Đã mask điểm AI nếu chưa duyệt |
| **Writing** | GET | `/api/writing/admin/submissions`| `ADMIN` | Phân quyền Admin | An toàn |
| **Writing** | POST | `/api/writing/admin/submissions/:id/approve` | `ADMIN` | Phân quyền Admin | Ghi đè điểm & gửi mail học viên |
| **Speaking** | GET | `/api/speaking/prompts` | Public | Không áp dụng | An toàn |
| **Speaking** | GET | `/api/speaking/prompts/:id` | Public | Không áp dụng | An toàn |
| **Speaking** | POST | `/api/speaking/prompts` | `ADMIN` | Phân quyền Admin | An toàn |
| **Speaking** | PUT | `/api/speaking/prompts/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Speaking** | DELETE | `/api/speaking/prompts/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Speaking** | POST | `/api/speaking/submissions` | `STUDENT` | Có (`user.id`) | An toàn |
| **Speaking** | POST | `/api/speaking/submissions/with-audio` | `STUDENT` | Có (`user.id`) | ⚠️ **MEDIUM**: Lỗi MIME upload (SEC-009) |
| **Speaking** | GET | `/api/speaking/submissions/my` | `STUDENT` | Có (`user.id`) | An toàn |
| **Speaking** | GET | `/api/speaking/submissions/:id`| Authenticated | Có (kiểm tra ownership) | An toàn |
| **Speaking** | GET | `/api/speaking/admin/submissions`| `ADMIN` | Phân quyền Admin | An toàn |
| **Speaking** | POST | `/api/speaking/admin/submissions/:id/grade` | `ADMIN` | Phân quyền Admin | Tính band score 4 tiêu chí |
| **LiveKit** | GET | `/api/livekit/rooms` | Authenticated | Không | Lọc phòng theo thời gian kết thúc |
| **LiveKit** | POST | `/api/livekit/rooms` | `ADMIN` | Phân quyền Admin | An toàn |
| **LiveKit** | POST | `/api/livekit/token` | Authenticated | Không kiểm tra enrollment | ⚠️ **HIGH**: Không check ghi danh (SEC-004) |
| **LiveKit** | POST | `/api/livekit/end-room` | `ADMIN` | Phân quyền Admin | An toàn |
| **LiveKit** | POST | `/api/livekit/mute-participant`| `ADMIN` | Phân quyền Admin | An toàn |
| **LiveKit** | GET | `/api/livekit/admin/history` | `ADMIN` | Phân quyền Admin | An toàn |
| **LiveKit** | GET | `/api/livekit/student/history`| Authenticated | Có (`studentId`) | An toàn |
| **LiveKit** | POST | `/api/livekit/webhook` | Public (verify header) | Xác thực WebhookReceiver | ⚠️ **HIGH**: Sai logic chuyên cần (SEC-007) |
| **LiveKit** | GET | `/api/livekit/rooms/:roomName/whiteboard` | Authenticated | Không | Lấy snapshot bảng trắng |
| **LiveKit** | POST | `/api/livekit/rooms/:roomName/whiteboard/stroke` | Authenticated | Có (`user.id`) | An toàn |
| **LiveKit** | POST | `/api/livekit/rooms/:roomName/whiteboard/clear` | `ADMIN` | Phân quyền Admin | An toàn |
| **LiveKit** | POST | `/api/livekit/rooms/:roomName/whiteboard/permission` | `ADMIN` | Phân quyền Admin | An toàn |
| **Attendance**| POST | `/api/attendance/classrooms` | `ADMIN` | Phân quyền Admin | An toàn |
| **Attendance**| GET | `/api/attendance/classrooms` | `ADMIN` | Phân quyền Admin | An toàn |
| **Attendance**| GET | `/api/attendance/classroom/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Attendance**| GET | `/api/attendance/my` | `STUDENT` | Có (`user.id`) | An toàn |
| **Attendance**| PUT | `/api/attendance/:id/override` | `ADMIN` | Phân quyền Admin | Lưu cờ manual override |
| **Attendance**| GET | `/api/attendance/export` | `ADMIN` | Phân quyền Admin | Xuất Excel (.xlsx) |
| **Attendance**| GET | `/api/attendance/classroom/:id/export` | `ADMIN` | Phân quyền Admin | Xuất Excel (.xlsx) |
| **Chat** | GET | `/api/chat/conversations` | Authenticated | Có (`userId`) | An toàn |
| **Chat** | GET | `/api/chat/conversations/:id/messages` | Authenticated | Có (kiểm tra ownership) | An toàn |
| **Chat** | POST | `/api/chat/conversations/:id/messages` | Authenticated | Có (kiểm tra ownership) | An toàn qua HTTP |
| **Chat** | PUT | `/api/chat/conversations/:id/read` | Authenticated | Có (`userId`) | An toàn |
| **Media** | POST | `/api/media/upload/image` | `ADMIN` | Phân quyền Admin | Lọc MIME image |
| **Media** | POST | `/api/media/upload/video` | `ADMIN` | Phân quyền Admin | Lọc MIME video |
| **Media** | DELETE | `/api/media/:publicId` | `ADMIN` | Phân quyền Admin | An toàn |
| **Blogs** | POST | `/api/blogs` | `ADMIN` | Phân quyền Admin | An toàn |
| **Blogs** | PUT | `/api/blogs/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Blogs** | GET | `/api/blogs` | Public | Không | An toàn |
| **Blogs** | GET | `/api/blogs/:slugOrId` | Public | Không | Tự động tăng viewCount |
| **Blogs** | DELETE | `/api/blogs/:id` | `ADMIN` | Phân quyền Admin | An toàn |
| **Blogs** | POST | `/api/blogs/:id/cover` | `ADMIN` | Phân quyền Admin | An toàn |
| **Blogs** | POST | `/api/blogs/:id/video` | `ADMIN` | Phân quyền Admin | An toàn |
| **Notifications** | POST | `/api/notifications/broadcast` | `ADMIN` | Phân quyền Admin | An toàn |
| **Notifications** | GET | `/api/notifications` | Authenticated | Có (`userId`) | An toàn |
| **Notifications** | GET | `/api/notifications/unread-count` | Authenticated | Có (`userId`) | An toàn |
| **Notifications** | PUT | `/api/notifications/read-all` | Authenticated | Có (`userId`) | An toàn |
| **Notifications** | PUT | `/api/notifications/:id/read` | Authenticated | Có (`userId`) | An toàn |
| **Notifications** | DELETE| `/api/notifications/:id` | Authenticated | Có (`userId`) | An toàn |
| **Mail** | GET | `/api/mail/status` | `ADMIN` | Phân quyền Admin | An toàn |
| **Mail** | POST | `/api/mail/test` | `ADMIN` | Phân quyền Admin | An toàn |
| **Mail** | POST | `/api/mail/send-custom` | `ADMIN` | Phân quyền Admin | An toàn |
| **Dashboard** | GET | `/api/dashboard/student` | `STUDENT` | Có (`userId`) | An toàn |
| **Dashboard** | GET | `/api/dashboard/admin` | `ADMIN` | Phân quyền Admin | An toàn |
| **Gateway /chat** | WS | `joinUser`, `joinConversation`, `sendMessage` | **Không xác thực** | ❌ **KHÔNG** | 🔴 **CRITICAL**: Mạo danh tin nhắn & nghe lén (SEC-002) |
| **Gateway /notifications** | WS | `joinUser`, `leaveUser` | **Không xác thực** | ❌ **KHÔNG** | ⚠️ **HIGH**: Nghe lén thông báo của người khác |
| **Gateway /whiteboard** | WS | `drawStroke`, `clearWhiteboard`, `setPermission`| **Không xác thực** | ❌ **KHÔNG** | ⚠️ **MEDIUM**: Tự nâng quyền Admin xóa/vẽ bảng (SEC-011) |

---

## 4. Mục Cần Xác Nhận (Questions & Clarifications)

1. **Endpoint `GET /api/materials/lesson/:lessonId`**: Endpoint này yêu cầu `JwtAuthGuard` nhưng không kiểm tra học viên đã ghi danh vào khóa học chứa bài học này chưa. Cần xác nhận xem tài liệu theo bài học có cho phép xem danh sách tiêu đề trước khi mua khóa học hay bắt buộc phải ghi danh mới được thấy?
2. **Cơ chế lưu trữ Local Disk Storage Driver khi Cloudinary offline**: Trong [cloudinary.service.ts:123](file:///d:/englishweb/server/src/core/cloudinary/cloudinary.service.ts#L123), file được lưu tại `public/uploads/{safeFolder}/{mockId}.ext`. Vì thư mục `public` được serve static qua `app.useStaticAssets(join(process.cwd(), 'public'))`, các file tải lên ở chế độ local disk storage sẽ truy cập được trực tiếp mà không cần qua bảo vệ kiểm tra quyền của NestJS. Cần xác nhận xem trên production có bắt buộc 100% dùng Cloudinary/S3 không?
3. **Mô hình chấm điểm tự động cho IELTS Listening/Reading**: Tại `QuizzesService.submitQuiz`, hệ thống tự tính điểm và nếu `isPassed && quiz.lessonId` thì tự đánh dấu bài học hoàn thành. Tuy nhiên, nếu là bài Full Mock Test (không gắn với `lessonId`), hệ thống chỉ lưu `QuizSubmission` mà chưa ghi nhận vào lịch sử chẩn đoán tổng thể. Cần xác nhận hành vi hiển thị tại màn hình Student Diagnostic.

---

## 5. Đề Xuất Ưu Tiên Xử Lý (Actionable Roadmap)

1. **Khắc phục ngay SEC-001 (Google OAuth Signature Verification)**: Tích hợp thư viện `google-auth-library`, bắt buộc xác thực token từ Google servers trước khi cho phép đăng nhập hoặc tạo tài khoản.
2. **Khắc phục SEC-002 & Bảo vệ toàn bộ WebSocket Gateways**: Thiết lập `WsJwtGuard` hoặc xác thực JWT token trong `handleConnection` của Socket.IO cho cả 3 namespace `/chat`, `/notifications`, `/whiteboard`; tuyệt đối không nhận `senderId` hay `role` từ client message payload.
3. **Đóng endpoint SEC-003 (`POST /courses/:id/enroll`)**: Xóa hoặc chuyển endpoint này sang quyền `ADMIN` (`manualEnroll`), bắt buộc học viên muốn ghi danh khóa học trả phí phải đi qua quy trình gửi yêu cầu duyệt chuyển khoản qua `POST /courses/:id/enroll-request` để tránh việc học viên tự kích hoạt học miễn phí.
4. **Kiểm tra quyền ghi danh lớp học khi cấp LiveKit Token (SEC-004)**: Trong `LivekitService.createToken`, bắt buộc kiểm tra xem phòng học có tồn tại trong cơ sở dữ liệu hay không, và nếu là `STUDENT`, bắt buộc kiểm tra đã ghi danh khóa học tương ứng (`Enrollment.status === 'ACTIVE'`) trước khi cấp Token SFU.
5. **Ẩn điểm số AI Writing khi nộp bài (SEC-005)**: Trong `WritingService.submitEssay`, chỉ trả về các thông tin cơ bản của bài nộp (`id`, `promptId`, `wordCount`, `status: AI_EVALUATED`, `submittedAt`). Giữ nguyên cơ chế bảo mật Human-in-the-loop: không trả về điểm số chi tiết và bài mẫu Band 8.0+ cho học viên cho đến khi Admin phê duyệt.
6. **Thay thế `fs.readFileSync` bằng Read Stream cho thư viện số (SEC-006)**: Chuyển đổi endpoint `GET /api/materials/:id/stream` sang sử dụng `fs.createReadStream` kết hợp pipe vào Response, đồng thời xử lý `Range` header (HTTP 206 Partial Content) để giải phóng RAM cho server và cho phép học viên tua audio/video mượt mà.
7. **Sửa thuật toán tính chuyên cần khi học viên Reconnect (SEC-007)**: Trong `LivekitService.handleWebhook`, không ghi đè `firstJoinedAt` nếu trường này đã tồn tại; tính toán tổng thời gian học dựa trên từng khoảng thời gian vào/ra thực tế để tránh việc học viên bị đánh dấu vắng mặt (`ABSENT`) oan do rớt mạng ngắn hạn.
8. **Khắc phục lỗi upload ghi âm Speaking (SEC-009)**: Cập nhật hàm `CloudinaryService.uploadVideo` (hoặc tạo thêm `uploadAudio`) để chấp nhận cả hai định dạng MIME `audio/*` và `video/*`, đảm bảo trình duyệt nộp file thu âm trực tiếp từ Web Audio API không bị từ chối.

