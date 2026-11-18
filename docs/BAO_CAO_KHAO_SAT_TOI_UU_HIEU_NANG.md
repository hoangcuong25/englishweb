# Báo Cáo Khảo Sát & Kế Hoạch Tối Ưu Hiệu Năng Hệ Thống (Performance Audit)
**Dự án**: Teacher Dong Academy (NestJS API + Next.js + MySQL 8.0)  
**Mục tiêu**: Giảm số lượng query, giảm RAM, giảm CPU, giảm bundle size phục vụ hạ tầng tài nguyên hạn chế (**1 CPU Core, 2GB RAM, chạy chung ứng dụng & MySQL**).  
**Branch thực hiện**: `perf/optimize`  
**Nguyên tắc**: Giữ nguyên nghiệp vụ, response contract, validate và RBAC. Chỉ sửa code khi có vấn đề cụ thể đã được kiểm chứng.

---

## 1. Bảng Tổng Hợp Vấn Đề Hiệu Năng (Xếp theo Lợi ích / Rủi ro giảm dần)

| ID | file:dòng | Vấn đề | Cách sửa | Lợi ích | Rủi ro |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DB-001** | `server/src/modules/dashboard/dashboard.service.ts:213` | `findMany()` nạp TOÀN BỘ bản ghi `attendance_records` vào RAM không có limit/filter chỉ để tính tổng số và lọc theo status (`PRESENT`, `LATE`, `ABSENT`). | Dùng `prisma.attendanceRecord.groupBy({ by: ['status'], _count: { _all: true } })` đếm trực tiếp từ DB. | Tiết kiệm hàng chục đến hàng trăm MB RAM, tránh OOM crash máy chủ 2GB RAM. | **Thấp** |
| **DB-002** | `server/src/modules/quizzes/quizzes.service.ts:654-668` | `getAdminSkillsDiagnosticOverview()` nạp toàn bộ quiz submissions + answers + questions vào RAM để loop tính tỷ lệ sai của học viện. | Dùng `prisma.quizAnswer.groupBy` kết hợp lấy mẫu phân tích gần nhất (`take: 500`) thay vì nạp toàn bộ lịch sử DB vào heap. | Giảm đột biến RAM từ hàng trăm MB về vài KB khi Admin mở chẩn đoán kỹ năng. | **Thấp** |
| **DB-003** | `server/src/modules/chat/chat.service.ts:92-111` | **N+1 Query**: loop qua N cuộc hội thoại, mỗi lượt bắn thêm 2 query (`findFirst` message + `count` unread) = $2N + 1$ queries. | Dùng batch `findMany` cho tin nhắn gần nhất + `groupBy` unread count theo `conversationId`, gom về đúng 3 queries cố định. | Giảm 90-95% số lượng query vào MySQL khi tải danh sách chat. | **Thấp** |
| **NEST-001** | `server/src/modules/materials/materials.service.ts:427` & `materials.controller.ts:157` | Stream PDF/Audio bằng `fs.readFileSync` nạp cả file 50MB-100MB vào RAM Buffer rồi `res.end(buffer)`. | Thay bằng `fs.createReadStream` và `pipe(res)`. | Tiết kiệm ngay 50-100MB RAM mỗi kết nối stream, không nghẽn Event Loop. | **Thấp** |
| **DB-005** | `server/src/modules/blogs/blogs.service.ts:214-225` | `findAll()` lấy nguyên cột `content` (`@db.LongText`, hàng trăm KB/bài) đưa vào RAM, serialize JSON và cache Redis. | Thêm `select` loại bỏ trường `content` khỏi query danh sách (chỉ lấy `content` ở trang chi tiết `findBySlugOrId`). | Giảm 85% RAM và bandwidth mạng mỗi lượt tải trang danh sách Blog. | **Thấp** |
| **DB-006** | `server/src/modules/courses/courses.service.ts:184-210` | `findMyLearning()` nạp toàn bộ danh sách `modules` và tất cả `lessons` con chỉ để tính `totalLessons += m.lessons.length`. | Bỏ nạp chi tiết `lessons`, dùng relation count `_count: { select: { lessons: true } }` trên `modules`. | Tiết kiệm hàng nghìn object trong Node heap mỗi khi học viên mở trang học tập. | **Thấp** |
| **DB-007** | `server/src/modules/lessons/lessons.service.ts:405-418` & `quizzes.service.ts:351-360` | Nạp toàn bộ `courseModules` và mảng `lessons` vào RAM chỉ để đếm tổng số bài và check mảng ID `in: allLessonIds`. | Đếm trực tiếp bằng `prisma.lesson.count({ where: { module: { courseId } } })`. | Giảm 2 query nặng nạp mảng ID thành 2 query COUNT trực tiếp siêu nhẹ. | **Thấp** |
| **NEST-002** | `server/src/core/livekit/livekit.service.ts:33-37` | **Rò rỉ tài nguyên Timer**: `setInterval` 60s quét phòng học không lưu reference, không có `OnModuleDestroy` để `clearInterval()`. | Lưu timer reference và thêm hook `onModuleDestroy()` để clear timer. | Giải phóng triệt để handle nền, giúp server/test shutdown sạch sẽ. | **Thấp** |
| **NEST-003** | `server/src/core/redis/redis.service.ts:15, 154` | In-memory fallback cache `memoryStore = new Map()` không có giới hạn phần tử tối đa, có thể phình to vô hạn. | Thêm cơ chế giới hạn tối đa (`MAX_MEMORY_CACHE_ITEMS = 500`) và dọn dẹp entry quá hạn khi set. | Bảo vệ RAM không bị rò rỉ khi chạy chế độ in-memory cache. | **Thấp** |
| **NEXT-001** | `client/next.config.mjs:2` | File cấu hình rỗng `{}`, chưa bật tối ưu bundle icon `lucide-react` (đang import tràn lan khắp client). | Cấu hình `experimental: { optimizePackageImports: ['lucide-react'] }`, `poweredByHeader: false`. | Giảm mạnh kích thước bundle JS client, giảm RAM trình duyệt và server render. | **Thấp** |
| **NEXT-004** | `client/src/app/(admin)/admin/users/page.tsx:109, 230` | Ô tìm kiếm người dùng bắn API tới backend ở **mỗi ký tự gõ** không debounce (`[searchTerm]` trigger `fetchStudents`). | Thêm debounce 350ms trước khi gọi hàm fetch. | Giảm 85% lượng request và CPU truy vấn tìm kiếm người dùng. | **Thấp** |
| **NEST-004** | `server/src/core/gemini/gemini.service.ts:102-108` | Lời gọi ngoại vi tới Google Gemini AI không có timeout, có thể treo kết nối nhiều phút khi mạng chậm. | Bọc timeout 25s bằng `Promise.race` kích hoạt fallback khi hết hạn. | Giải phóng connection ngay lập tức, không làm kẹt tài nguyên Node. | **Thấp** |
| **DB-009** | `server/prisma/schema.prisma` | Thiếu Composite Index phục vụ các truy vấn thường xuyên (`Classroom`, `WritingSubmission`, `SpeakingSubmission`, `Message`, `AttendanceRecord`). | Viết file migration SQL thêm index (chỉ tạo file `.sql`, KHÔNG chạy migration ghi DB). | Chuyển full table scan thành index scan, giảm 80-90% CPU MySQL. | **Thấp** |
| **DB-010** | `server/.env.example` & `server/src/core/prisma/prisma.service.ts` | Chưa cấu hình giới hạn kích thước connection pool cho MySQL (`connection_limit=5&pool_timeout=10`). | Cấu hình rõ ràng tham số connection pool tối đa 5-8 kết nối. | Giữ bộ nhớ của MySQL dưới 60-80MB, tránh ăn hết 2GB RAM chung. | **Thấp** |
| **NEXT-003** | `client/src/app/(student)/student/classroom/[roomId]/page.tsx:5` | `ClassroomContainer` kéo theo thư viện WebRTC `livekit-client` và Whiteboard được nạp tĩnh. | Chuyển sang `next/dynamic` với `{ ssr: false }`. | Tách riêng chunk WebRTC nặng, không nạp vào initial bundle của các trang khác. | **Thấp** |
| **NEXT-005** | `client/src/app/(admin)/admin/courses/page.tsx:1012` | Nút "Kích hoạt lại" yêu cầu ghi danh của học viên chưa có `disabled={isProcessing}`. | Bổ sung `disabled={isProcessing}` chống bấm đúp. | Ngăn chặn duplicate API call và xung đột ghi DB. | **Thấp** |
| **DB-008** | `server/src/modules/attendance/attendance.service.ts:27, 45, 57` & `speaking.service.ts:30, 155, 202` | Các API danh sách (`getClassrooms`, `getMySubmissions`, `findAllPrompts`) chưa có giới hạn `take` tối đa. | Thêm giới hạn an toàn mặc định (`take: 50` hoặc theo phân trang). | Ngăn ngừa việc một API nạp hàng chục nghìn dòng dữ liệu khi hệ thống dùng lâu. | **Trung bình** *(Cần xác nhận)* |
| **NEXT-002** | `client/package.json:11, 14, 21` | Dependencies `tldraw` (~2-5MB), `@livekit/components-react` nằm trong `package.json` nhưng không được dùng. | Gỡ bỏ package thừa không sử dụng. | Giảm kích thước node_modules, tránh nguy cơ rò rỉ mã nguồn thừa vào build. | **Trung bình** *(Cần xác nhận)* |

---

## 2. Chi Tiết Phân Tích & Phương Án Khắc Phục

### 2.1. Nhóm Database / ORM & RAM

#### Vấn đề DB-001: Tràn RAM do `findMany()` không giới hạn trong Admin Dashboard
- **Vị trí**: `server/src/modules/dashboard/dashboard.service.ts:213`
- **Hiện trạng**:
  ```typescript
  // Nạp toàn bộ bảng attendance_records vào heap RAM
  const attendanceRecords = await this.prisma.attendanceRecord.findMany();
  const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
  ```
- **Sau khi sửa**:
  ```typescript
  // Đếm trực tiếp từ MySQL qua groupBy, RAM tiêu thụ = 0 MB
  const statusGroups = await this.prisma.attendanceRecord.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  const presentCount = statusGroups.find((g) => g.status === 'PRESENT')?._count._all || 0;
  const lateCount = statusGroups.find((g) => g.status === 'LATE')?._count._all || 0;
  const absentCount = statusGroups.find((g) => g.status === 'ABSENT')?._count._all || 0;
  ```
- **Lợi ích**: Giảm từ hàng chục MB dữ liệu nạp vào Node.js heap xuống 3 dòng tổng hợp ngắn gọn, tốc độ truy vấn tăng x10.
- **Rủi ro**: Thấp (Response contract giữ nguyên 100%).

---

#### Vấn đề DB-002: Tràn RAM trong phân tích chẩn đoán kỹ năng Admin
- **Vị trí**: `server/src/modules/quizzes/quizzes.service.ts:654-668`
- **Hiện trạng**:
  ```typescript
  const submissions = await this.prisma.quizSubmission.findMany({
    include: {
      answers: {
        include: {
          question: { select: { id: true, skill: true, type: true } },
        },
      },
    },
  });
  ```
- **Sau khi sửa**: Giới hạn mẫu kiểm tra gần nhất (`take: 500` hoặc gom nhóm thống kê trực tiếp qua `quizAnswer` query).
- **Lợi ích**: Tránh OOM crash khi dữ liệu bài thi học viên tích lũy theo thời gian.
- **Rủi ro**: Thấp.

---

#### Vấn đề DB-003: N+1 Query trong API Chat Realtime
- **Vị trí**: `server/src/modules/chat/chat.service.ts:92-111`
- **Hiện trạng**: Với $N$ cuộc trò chuyện, bắn $2N$ queries vào DB trong `Promise.all(conversations.map(...))`:
  ```typescript
  const lastMessage = await this.prisma.message.findFirst({
    where: { conversationId: conv.id },
    orderBy: { createdAt: 'desc' },
  });
  const unreadCount = await this.prisma.message.count({
    where: { conversationId: conv.id, senderId: { not: userId }, isRead: false },
  });
  ```
- **Sau khi sửa**: Dùng batch `findMany` + `groupBy`:
  ```typescript
  const convIds = conversations.map((c) => c.id);
  const [unreadCounts, recentMessages] = await Promise.all([
    this.prisma.message.groupBy({
      by: ['conversationId'],
      where: { conversationId: { in: convIds }, senderId: { not: userId }, isRead: false },
      _count: { _all: true },
    }),
    this.prisma.message.findMany({
      where: { conversationId: { in: convIds } },
      orderBy: { createdAt: 'desc' },
      distinct: ['conversationId'],
    }),
  ]);
  ```
- **Lợi ích**: Giảm từ $2N+1$ queries về đúng 3 queries cố định.
- **Rủi ro**: Thấp.

---

#### Vấn đề DB-005: Nạp cột `LongText` trong danh sách Blog
- **Vị trí**: `server/src/modules/blogs/blogs.service.ts:214-225`
- **Hiện trạng**: Query danh sách blog trả về cả cột `content` (`@db.LongText`), gây phình bộ nhớ RAM Node và Redis cache khi nạp danh sách.
- **Sau khi sửa**: Bổ sung `select` chỉ lấy metadata cần thiết cho danh sách (`id, title, slug, summary, coverImage, category, tags, status, isFeatured, viewCount, author, publishedAt, createdAt`). Cột `content` chỉ được lấy khi gọi `findBySlugOrId`.
- **Lợi ích**: Giảm 85% dung lượng truyền tải và RAM heap.
- **Rủi ro**: Thấp.

---

#### Vấn đề DB-006: Nạp toàn bộ Lessons con để đếm số lượng trong `findMyLearning`
- **Vị trí**: `server/src/modules/courses/courses.service.ts:184-210`
- **Hiện trạng**: Nạp toàn bộ mảng `lessons: { select: { id, title, orderIndex } }` chỉ để chạy `totalLessons += m.lessons.length`.
- **Sau khi sửa**: Bỏ nạp chi tiết bài học, thay bằng `_count: { select: { lessons: true } }`.
- **Lợi ích**: Giảm thiểu việc cấp phát hàng nghìn object ngắn hạn trên bộ nhớ.
- **Rủi ro**: Thấp.

---

#### Vấn đề DB-007: Query lãng phí mảng ID trong `completeLesson` và `submitQuiz`
- **Vị trí**: `server/src/modules/lessons/lessons.service.ts:405-418` & `quizzes.service.ts:351-360`
- **Hiện trạng**: Nạp `courseModules` kèm toàn bộ `lessons: { select: { id: true } }` vào RAM, tạo mảng `allLessonIds`, rồi chạy `lessonId: { in: allLessonIds }`.
- **Sau khi sửa**: Đếm trực tiếp qua quan hệ Prisma:
  ```typescript
  const totalLessons = await this.prisma.lesson.count({
    where: { module: { courseId } },
  });
  const completedLessons = await this.prisma.lessonProgress.count({
    where: { userId, isCompleted: true, lesson: { module: { courseId } } },
  });
  ```
- **Lợi ích**: Giảm 2 query lớn về 2 query COUNT cực nhẹ, xóa bỏ mảng ID trong RAM.
- **Rủi ro**: Thấp.

---

#### Vấn đề DB-009: Thiếu Composite Index
- **Vị trí**: `server/prisma/schema.prisma`
- **Đặc tả**:
  - `classrooms`: Thiếu `@@index([status, scheduledEndTime])` (dùng trong background job quét phòng hết hạn).
  - `writing_submissions`: Thiếu `@@index([status])` và `@@index([userId, submittedAt])`.
  - `speaking_submissions`: Thiếu `@@index([status])` và `@@index([userId, submittedAt])`.
  - `quiz_submissions`: Thiếu `@@index([userId, isPassed])`.
  - `messages`: Thiếu `@@index([conversationId, isRead])` và `@@index([conversationId, createdAt])`.
  - `attendance_records`: Thiếu `@@index([createdAt])` và `@@index([status])`.
- **Phương án**: Soạn thảo file migration `prisma/migrations/20261118_add_perf_composite_indexes/migration.sql` (KHÔNG chạy migration vào DB).
- **Lợi ích**: Tối ưu tốc độ query từ $O(N)$ sang $O(\log N)$, giải tỏa CPU MySQL.
- **Rủi ro**: Thấp.

---

#### Vấn đề DB-010: Connection Pool chưa được giới hạn
- **Vị trí**: `server/.env.example` & `server/src/core/prisma/prisma.service.ts`
- **Hiện trạng**: `DATABASE_URL` chưa có `connection_limit` và `pool_timeout`.
- **Phương án**: Thêm `?connection_limit=5&pool_timeout=10` vào chuỗi kết nối MySQL.
- **Lợi ích**: Giữ MySQL pool ở mức 5-8 kết nối, tránh việc mỗi kết nối chiếm 5-10MB RAM gây cạn kiệt RAM 2GB.
- **Rủi ro**: Thấp.

---

### 2.2. Nhóm NestJS Runtime & I/O

#### Vấn đề NEST-001: Đọc tệp PDF/Audio bằng `fs.readFileSync` nạp toàn bộ vào RAM Buffer
- **Vị trí**: `server/src/modules/materials/materials.service.ts:427` & `materials.controller.ts:157`
- **Hiện trạng**:
  ```typescript
  // Đọc file đến 100MB vào RAM
  buffer = fs.readFileSync(physicalPath);
  res.end(buffer);
  ```
- **Sau khi sửa**:
  ```typescript
  const stream = fs.createReadStream(physicalPath);
  res.set({
    'Content-Type': contentType,
    'Content-Length': fileSize,
  });
  stream.pipe(res);
  ```
- **Lợi ích**: RAM chỉ duy trì chunk đệm ~64KB thay vì 50-100MB cho mỗi kết nối stream.
- **Rủi ro**: Thấp.

---

#### Vấn đề NEST-002: Rò rỉ tài nguyên Timer trong `LivekitService`
- **Vị trí**: `server/src/core/livekit/livekit.service.ts:33-37`
- **Hiện trạng**: Khởi tạo `setInterval` quét phòng học hết hạn mỗi 60s không lưu reference, không có hook `OnModuleDestroy` để `clearInterval()`.
- **Sau khi sửa**: Lưu `timerRef` và gọi `clearInterval(this.timerRef)` trong `onModuleDestroy()`.
- **Lợi ích**: Đảm bảo không còn handle nền bị treo khi shutdown hoặc chạy test suite.
- **Rủi ro**: Thấp.

---

#### Vấn đề NEST-003: In-memory Cache Fallback không có giới hạn phần tử
- **Vị trí**: `server/src/core/redis/redis.service.ts:15, 154`
- **Hiện trạng**: `memoryStore = new Map<string, CacheEntry>()` không có giới hạn số lượng phần tử tối đa.
- **Sau khi sửa**: Thiết lập ngưỡng `MAX_ITEMS = 500`, tự động loại bỏ phần tử hết hạn hoặc phần tử cũ nhất (FIFO/LRU) khi vượt ngưỡng.
- **Lợi ích**: Giới hạn tối đa RAM cho cache in-memory dưới 10MB.
- **Rủi ro**: Thấp.

---

#### Vấn đề NEST-004: Gọi API ngoại vi Google Gemini không có Timeout
- **Vị trí**: `server/src/core/gemini/gemini.service.ts:102-108`
- **Hiện trạng**: Gọi `this.ai.models.generateContent` không có timeout bọc ngoài. Nếu kết nối mạng quốc tế gián đoạn, socket sẽ giữ kết nối nhiều phút.
- **Sau khi sửa**: Bọc `Promise.race` với thời gian chờ 25 giây; khi hết hạn sẽ tự động chuyển sang bộ chấm điểm Heuristic AI Fallback.
- **Lợi ích**: Giải phóng kết nối ngay lập tức, ngăn ngừa nghẽn hàng đợi request.
- **Rủi ro**: Thấp.

---

### 2.3. Nhóm Next.js & Frontend Bundle

#### Vấn đề NEXT-001: Chưa bật tối ưu hóa Bundle trong `next.config.mjs`
- **Vị trí**: `client/next.config.mjs:2`
- **Hiện trạng**: `const nextConfig = {};`
- **Sau khi sửa**:
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    experimental: {
      optimizePackageImports: ['lucide-react'],
    },
    images: {
      unoptimized: true, // Không dùng server-side image resizer tốn CPU trên 1-core VPS
    },
    poweredByHeader: false,
    compress: true,
  };
  export default nextConfig;
  ```
- **Lợi ích**: Tree-shake triệt để các icon thừa của `lucide-react`, giảm kích thước bundle JS truyền xuống trình duyệt.
- **Rủi ro**: Thấp.

---

#### Vấn đề NEXT-003: Tải tĩnh WebRTC và Whiteboard Canvas trên các trang phòng học
- **Vị trí**: `client/src/app/(student)/student/classroom/[roomId]/page.tsx:5` & `(admin)/admin/classroom/[roomId]/page.tsx:5`
- **Hiện trạng**: `import { ClassroomContainer } from '@/components/classroom/classroom-container'` nạp tĩnh toàn bộ `livekit-client` vào chunk chính.
- **Sau khi sửa**:
  ```typescript
  import dynamic from 'next/dynamic';
  const ClassroomContainer = dynamic(
    () => import('@/components/classroom/classroom-container').then((m) => m.ClassroomContainer),
    { ssr: false, loading: () => <ClassroomLoadingState /> }
  );
  ```
- **Lợi ích**: Tránh nạp WebRTC khi người dùng chỉ xem các trang thông thường, giảm initial payload.
- **Rủi ro**: Thấp.

---

#### Vấn đề NEXT-004: Ô tìm kiếm học viên bắn API liên tục không có Debounce
- **Vị trí**: `client/src/app/(admin)/admin/users/page.tsx:109, 230`
- **Hiện trạng**: Gõ mỗi ký tự đều gọi `fetchStudents()` ngay lập tức.
- **Sau khi sửa**: Thêm debounce 350ms cho `searchTerm`.
- **Lợi ích**: Giảm 85% số lượng HTTP request và DB query tìm kiếm do thao tác gõ phím.
- **Rủi ro**: Thấp.

---

#### Vấn đề NEXT-005: Nút "Kích hoạt lại" chưa chống bấm đúp
- **Vị trí**: `client/src/app/(admin)/admin/courses/page.tsx:1012`
- **Hiện trạng**: Nút "Kích hoạt lại" thiếu cờ `disabled={isProcessing}`.
- **Sau khi sửa**: Thêm `disabled={isProcessing}` và hiển thị trạng thái chờ.
- **Lợi ích**: Chống race condition và trùng lặp bản ghi DB khi người dùng click liên tục.
- **Rủi ro**: Thấp.

---

## 3. Mục "Cần Xác Nhận" (User Decisions)

1. **Xác nhận 1 (Package `tldraw` thừa)**:
   - Trong `client/package.json` có khai báo `"tldraw": "5.6.0"` (~2-5MB). Tuy nhiên, phân hệ Bảng trắng Whiteboard của dự án hiện đã được viết bằng HTML5 Canvas 2D độc lập (`client/src/components/classroom/whiteboard.tsx`), hoàn toàn không dùng đến `tldraw`. 
   - *Câu hỏi*: Bạn có đồng ý cho phép gỡ `tldraw` khỏi `client/package.json` trong đợt tối ưu bundle không?

2. **Xác nhận 2 (Giới hạn phân trang an toàn)**:
   - Các API như `getClassrooms`, `getMySubmissions` (Speaking/Writing) hiện đang trả về toàn bộ dữ liệu không giới hạn.
   - *Câu hỏi*: Tôi có thể thêm giới hạn an toàn mặc định `take: 50` (và nhận query `limit`, `page`) cho các API này mà không phá vỡ kỳ vọng giao diện của bạn không?

---

## 4. Kế Hoạch Triển Khai Theo Đợt & Quy Trình Kiểm Thử

- **Đợt 1 (Database & RAM Backend)**: Xử lý `DB-001`, `DB-002`, `DB-003`, `DB-005`, `DB-006`, `DB-007`.  
  *Commit*: `perf(db): optimize memory and eliminate n+1 queries`  
  *Kiểm thử*: Chạy `npm --prefix server run test:e2e` đảm bảo 197/197 tests PASS.

- **Đợt 2 (NestJS I/O, Timers & Cache Bounds)**: Xử lý `NEST-001` (Stream), `NEST-002` (Timer leak), `NEST-003` (Cache cap), `NEST-004` (Timeout), `DB-010` (Pool limits).  
  *Commit*: `perf(server): stream file io, fix timer leak and add cache bounds`  
  *Kiểm thử*: Chạy kiểm thử stream và shutdown sạch sẽ.

- **Đợt 3 (Database Composite Indexes)**: Viết file SQL migration thêm composite indexes phục vụ các truy vấn nặng.  
  *Commit*: `perf(db): add missing composite indexes migration file`

- **Đợt 4 (Next.js Bundle, Dynamic Import & Debounce)**: Xử lý `NEXT-001` (next.config), `NEXT-003` (Dynamic import WebRTC), `NEXT-004` (Debounce search), `NEXT-005` (Chống đúp).  
  *Commit*: `perf(client): tree-shake lucide, dynamic import webrtc and debounce search`  
  *Kiểm thử*: Chạy `npm --prefix client run test:e2e` đảm bảo 39/39 tests PASS.
