# TÀI LIỆU THIẾT KẾ KỸ THUẬT: HỆ THỐNG QUẢN LÝ NGÂN HÀNG ĐỀ & GIAO ĐỀ THI IELTS 4 KỸ NĂNG
## (Teacher Dong Academy - IELTS Exam Engine & Question Bank Architecture)

> **Tài liệu phân tích kiến trúc giải pháp kỹ thuật (Solution Architecture)**  
> **Người thực hiện**: Solution Architect  
> **Áp dụng cho**: Phân hệ Khảo thí & Giao bài tập IELTS (`server/src/modules/quizzes`, `server/src/modules/exams`, `client/src/app/(admin)/admin/assessments`)

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH NGHIỆP VỤ

### 1.1. Mục Tiêu Cốt Lõi
Hệ thống cho phép **Admin (Thầy Đông)**:
1. Quản lý **Ngân hàng câu hỏi (Question Bank)** chuẩn 4 kỹ năng IELTS (`LISTENING`, `READING`, `WRITING`, `SPEAKING`).
2. **Tạo Đề thi IELTS trên Web**:
   - Tự chọn từng câu hỏi hoặc bốc đề tự động từ Ngân hàng đề theo ma trận cấu trúc IELTS chuẩn.
   - Hỗ trợ cả 2 hình thức: **Đề thi thử hoàn chỉnh (Full Mock Test 4 kỹ năng)** hoặc **Đề luyện tập chuyên sâu từng kỹ năng (Single Skill Test)**.
3. **Giao đề thi cho học viên**:
   - Giao cho toàn bộ học viên trong khóa học hoặc danh sách học viên chọn lọc.
   - Cài đặt thời gian đếm ngược làm bài (Time Limit), hạn chót nộp bài (Deadline) và tự động bắn thông báo chuông cho học viên.
4. **Học viên làm bài trực tiếp trên Web**:
   - Giao diện mô phỏng chuẩn giao diện thi máy tính IELTS (Computer-delivered IELTS).
5. **Thu bài & Chấm điểm đa tầng**:
   - **Reading & Listening**: Tự động chấm tức thì theo thang điểm thô (0 - 40) và tự động quy đổi sang **IELTS Band Score (0 - 9.0)**.
   - **Writing**: Tích hợp AI chấm sơ bộ 4 tiêu chí (TR, CC, LR, GRA) & Thầy Đông duyệt/sửa điểm + nhận xét.
   - **Speaking**: Học viên ghi âm trực tiếp từng Part; Thầy Đông nghe audio, chấm 4 tiêu chí (FC, PR, LR, GRA) và để lại nhận xét sư phạm.

---

## 2. RÀ SOÁT HIỆN TRẠNG API & CƠ SỞ DỮ LIỆU (GAP ANALYSIS)

### 2.1. Những Gì Hệ Thống Đang Có Sẵn
1. **Database Schema (`prisma/schema.prisma`)**:
   - Có `model Quiz`, `model Question`, `model QuestionOption`, `model QuizSubmission`, `model QuizAnswer`.
   - Có `enum SkillType` (`READING`, `LISTENING`, `WRITING`, `SPEAKING`).
   - Có `enum QuestionType` rất chi tiết (14 dạng bài IELTS: `TRUE_FALSE_NOT_GIVEN`, `MATCHING_HEADINGS`, `SUMMARY_COMPLETION`, `NOTE_COMPLETION`, `ESSAY_TASK_1`, `SPEAKING_PART_2`...).
2. **Backend API (`server/src/modules/quizzes`)**:
   - Đã có CRUD cơ bản cho Quiz và Question trắc nghiệm.
   - Đã có chấm điểm trắc nghiệm tự động qua `POST /api/quizzes/:id/submit`.

### 2.2. Các Khoảng Trống Kỹ Thuật Lớn (Technical Gaps Cần Nâng Cấp)
| Thành phần | Hiện trạng hiện tại | Hạn chế / Vấn đề | Giải pháp thiết kế mới |
|---|---|---|---|
| **Ngân hàng đề** | Bảng `Question` bắt buộc phải có `quizId` trực tiếp. | Không thể lưu trữ một kho câu hỏi chung để tái sử dụng hoặc bốc câu hỏi vào nhiều đề thi khác nhau. | Bổ sung Entity `QuestionBankItem` (hoặc cấu trúc `isBankQuestion` + bảng trung gian `ExamQuestion`). |
| **Cấu trúc Đề IELTS** | `model Quiz` chỉ có duy nhất 1 trường `passage` và 1 trường `audioUrl`. | **Reading** chuẩn có 3 Passage dài; **Listening** chuẩn có 4 Section audio riêng; không thể nhồi nhét vào 1 trường text đơn. | Bổ sung cấu trúc `ExamSection`: Mỗi Passage/Section có văn bản đọc hoặc audio MP3 riêng và nhóm câu hỏi con. |
| **Cơ chế Giao bài** | Quiz chỉ gắn thụ động vào `courseId` hoặc `lessonId`. | Không có hạn nộp (Deadline), không quản lý được trạng thái nộp bài của từng học viên (Chưa nộp, Đang làm, Đã nộp, Chờ chấm). | Thêm Entity `ExamAssignment` quản lý việc giao đề cho Khóa học / Học viên cụ thể. |
| **Chấm bài & Band Score** | `QuizSubmission` chỉ đếm số câu trắc nghiệm đúng/sai. | Không có bảng quy đổi điểm thô ra Band điểm IELTS (0 - 9.0); chưa có giao diện cho Admin chấm tự luận Writing & Speaking 4 tiêu chí. | Tích hợp thuật toán quy đổi IELTS Band Calculator + Entity lưu điểm 4 tiêu chí và lời phê sư phạm. |

---

## 3. THIẾT KẾ MÔ HÌNH CƠ SỞ DỮ LIỆU (PRISMA SCHEMA DESIGN)

```prisma
// =========================================================================
// PHÂN HỆ QUẢN LÝ NGÂN HÀNG ĐỀ & BÀI THI IELTS 4 KỸ NĂNG (IELTS EXAM ENGINE)
// =========================================================================

enum ExamType {
  FULL_MOCK_TEST   // Đề thi thử hoàn chỉnh 4 kỹ năng (Listening, Reading, Writing, Speaking)
  SKILL_TEST       // Đề thi thử chuyên sâu 1 kỹ năng cụ thể
  MINI_TEST        // Đề kiểm tra ngắn (15-30 phút)
  DIAGNOSTIC_TEST  // Đề kiểm tra năng lực đầu vào
}

enum ExamAssignmentStatus {
  PENDING          // Học viên chưa bắt đầu
  IN_PROGRESS      // Học viên đang trong phòng thi / đang làm
  SUBMITTED        // Đã nộp bài, chờ chấm Writing/Speaking
  GRADED           // Đã hoàn tất chấm điểm & công bố Band
}

// 1. Kho Câu Hỏi Dùng Chung (Question Bank)
model QuestionBankItem {
  id               String       @id @default(uuid())
  skill            SkillType    // LISTENING, READING, WRITING, SPEAKING
  type             QuestionType // TRUE_FALSE_NOT_GIVEN, MATCHING_HEADINGS, SUMMARY_COMPLETION...
  targetBand       Float?       // Độ khó mục tiêu: 5.5, 6.5, 7.5, 8.5
  topic            String?      // Chủ đề: Environment, Technology, Education, History...
  
  // Nội dung ngữ cảnh (Reading passage, Listening audio, Writing chart image, Speaking cue-card)
  contextTitle     String?      // Tên bài đọc / Tên hội thoại
  contextPassage   String?      @db.LongText // Văn bản bài đọc
  contextAudioUrl  String?      // URL file nghe MP3
  contextImageUrl  String?      // URL hình ảnh biểu đồ / bản đồ Task 1
  
  // Câu hỏi & Hướng dẫn
  questionText     String       @db.Text
  explanation      String?      @db.Text     // Lời giải chi tiết
  points           Float        @default(1.0)
  
  // Dữ liệu đáp án cấu trúc JSON (Dùng cho cả Trắc nghiệm, Điền từ, Nối câu, hoặc Sample Answer)
  correctAnswers   Json         // Mảng chuỗi đáp án chấp nhận (ví dụ: ["architecture", "building design"])
  options          Json?        // Danh sách lựa chọn A, B, C, D (nếu là trắc nghiệm)
  
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  examQuestions    ExamQuestionLink[]

  @@index([skill])
  @@index([type])
  @@index([targetBand])
  @@map("question_bank_items")
}

// 2. Đề Thi Chuẩn IELTS (Exam)
model Exam {
  id               String       @id @default(uuid())
  title            String
  description      String?      @db.Text
  examType         ExamType     @default(SKILL_TEST)
  skill            SkillType?   // Null nếu là FULL_MOCK_TEST, có giá trị nếu là SKILL_TEST
  category         CourseCategory @default(IELTS)
  
  durationMinutes  Int          @default(60) // Tổng thời gian thi
  passScore        Float        @default(6.5) // Điểm Target mong đợi
  isPublished      Boolean      @default(false)
  
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  sections         ExamSection[]
  assignments      ExamAssignment[]

  @@map("exams")
}

// 3. Phân Đoạn Trong Đề Thi (Passage 1-3 của Reading, Section 1-4 của Listening, Task 1-2 của Writing, Part 1-3 của Speaking)
model ExamSection {
  id               String       @id @default(uuid())
  examId           String
  exam             Exam         @relation(fields: [examId], references: [id], onDelete: Cascade)
  
  skill            SkillType
  sectionOrder     Int          // 1, 2, 3, 4
  title            String       // "Reading Passage 1: The Roman Amphitheatre", "Listening Section 2"
  instructions     String?      @db.Text
  
  // Học liệu gắn liền với Section này
  passageText      String?      @db.LongText
  audioUrl         String?
  imageUrl         String?      // Biểu đồ Writing Task 1
  timeLimitMinutes Int?
  
  questions        ExamQuestionLink[]

  @@index([examId])
  @@map("exam_sections")
}

// 4. Liên Kết Câu Hỏi Vào Đề Thi
model ExamQuestionLink {
  id               String           @id @default(uuid())
  sectionId        String
  section          ExamSection      @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  questionBankId   String
  questionBankItem QuestionBankItem @relation(fields: [questionBankId], references: [id], onDelete: Cascade)
  
  orderIndex       Int              // Thứ tự câu hỏi trong đề: Câu 1, Câu 2... Câu 40
  points           Float            @default(1.0)

  @@index([sectionId])
  @@index([questionBankId])
  @@map("exam_question_links")
}

// 5. Quản Lý Giao Đề Thi Cho Học Viên (Exam Assignment)
model ExamAssignment {
  id               String               @id @default(uuid())
  examId           String
  exam             Exam                 @relation(fields: [examId], references: [id], onDelete: Cascade)
  
  courseId         String?              // Giao cho cả khóa học
  course           Course?              @relation(fields: [courseId], references: [id], onDelete: SetNull)
  
  assignedToUserId String?              // Hoặc giao riêng cho 1 học viên cụ thể
  assignedToUser   User?                @relation("DirectExamAssignments", fields: [assignedToUserId], references: [id], onDelete: Cascade)
  
  dueDate          DateTime?            // Hạn chót nộp bài
  allowReview      Boolean              @default(true) // Cho phép xem đáp án sau khi thi
  
  createdAt        DateTime             @default(now())

  submissions      ExamSubmission[]

  @@index([examId])
  @@index([courseId])
  @@index([assignedToUserId])
  @@map("exam_assignments")
}

// 6. Phiên Làm Bài & Bảng Điểm Tổng Hợp (Exam Submission & Band Evaluation)
model ExamSubmission {
  id               String               @id @default(uuid())
  assignmentId     String
  assignment       ExamAssignment       @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  
  studentId        String
  student          User                 @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  status           ExamAssignmentStatus @default(SUBMITTED)
  startedAt        DateTime             @default(now())
  submittedAt      DateTime?
  
  // Điểm số chi tiết từng kỹ năng
  readingScore     Float?               // Số câu đúng /40
  readingBand      Float?               // Band quy đổi (0.0 - 9.0)
  
  listeningScore   Float?               // Số câu đúng /40
  listeningBand    Float?               // Band quy đổi (0.0 - 9.0)
  
  writingBand      Float?               // Điểm Writing sau khi Thầy duyệt
  writingFeedback  String?              @db.Text
  
  speakingBand     Float?               // Điểm Speaking sau khi Thầy duyệt
  speakingFeedback String?              @db.Text
  
  overallBand      Float?               // Overall Band làm tròn theo quy tắc IELTS (.25 -> .5, .75 -> 1.0)
  teacherNote      String?              @db.Text // Lời nhận xét sư phạm tổng thể của Thầy Đông
  
  answers          ExamStudentAnswer[]

  @@index([assignmentId])
  @@index([studentId])
  @@map("exam_submissions")
}

// 7. Câu Trả Lời Chi Tiết Của Học Viên
model ExamStudentAnswer {
  id               String               @id @default(uuid())
  submissionId     String
  submission       ExamSubmission       @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  questionLinkId   String
  
  // Dữ liệu làm bài:
  textAnswer       String?              @db.Text // Câu trả lời trắc nghiệm / điền từ / bài luận Writing
  audioAnswerUrl   String?              // URL file ghi âm Speaking từng Part
  
  isCorrect        Boolean?             // Tự động đánh giá (đối với Listening & Reading)
  awardedPoints    Float?               @default(0)
  
  teacherComment   String?              @db.Text // Lời phê riêng cho câu hỏi này

  @@index([submissionId])
  @@map("exam_student_answers")
}
```

---

## 4. BỘ ĐẶC TẢ API RESTFUL (PHẦN ADMIN GIAO ĐỀ & QUẢN LÝ NGÂN HÀNG ĐỀ)

Tất cả các endpoint dưới đây yêu cầu `JwtAuthGuard` và `RolesGuard` với vai trò `ADMIN`.

### 4.1. Nhóm 1: Quản Lý Ngân Hàng Câu Hỏi (Question Bank APIs)

#### `GET /api/exam-bank/questions`
- **Mục đích**: Tìm kiếm, lọc danh sách câu hỏi trong ngân hàng đề.
- **Query Params**:
  - `skill`: `READING | LISTENING | WRITING | SPEAKING`
  - `type`: `TRUE_FALSE_NOT_GIVEN | MATCHING_HEADINGS | SUMMARY_COMPLETION...`
  - `targetBand`: `5.5 | 6.5 | 7.5 | 8.5`
  - `topic`: Từ khóa chủ đề
  - `search`: Từ khóa trong câu hỏi hoặc đoạn văn
  - `page`: Trang hiện tại (mặc định: 1)
  - `limit`: Số câu trên trang (mặc định: 20)
- **Response mẫu**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "items": [
        {
          "id": "qb-uuid-01",
          "skill": "READING",
          "type": "TRUE_FALSE_NOT_GIVEN",
          "contextTitle": "Passage 1: Marie Curie and the Discovery of Radium",
          "questionText": "Marie Curie's husband was also an accomplished scientist.",
          "correctAnswers": ["TRUE"],
          "targetBand": 6.5,
          "topic": "Science & History",
          "points": 1.0
        }
      ],
      "meta": { "total": 120, "page": 1, "limit": 20 }
    }
  }
  ```

#### `POST /api/exam-bank/questions`
- **Mục đích**: Thêm câu hỏi mới vào Ngân hàng đề (hỗ trợ nhập cả đoạn văn đọc hiểu / link audio kèm theo).
- **Request Body (CreateQuestionBankItemDto)**:
  ```json
  {
    "skill": "READING",
    "type": "TRUE_FALSE_NOT_GIVEN",
    "targetBand": 6.5,
    "topic": "Science & History",
    "contextTitle": "Passage 1: Marie Curie",
    "contextPassage": "Marie Curie was born in Warsaw in 1867...",
    "questionText": "Marie Curie's husband was also an accomplished scientist.",
    "correctAnswers": ["TRUE"],
    "explanation": "Pierre Curie was already a renowned physicist before they married."
  }
  ```

#### `POST /api/exam-bank/questions/bulk-import`
- **Mục đích**: Import nhanh hàng loạt câu hỏi từ file JSON hoặc trích xuất từ đề Cambridge.

---

### 4.2. Nhóm 2: Quản Lý Đề Thi & Bốc Đề Tự Động (Exam Management APIs)

#### `POST /api/exams`
- **Mục đích**: Tạo khung đề thi mới (Thủ công hoặc chọn câu hỏi từ ngân hàng).
- **Request Body**:
  ```json
  {
    "title": "IELTS Academic Reading Mock Test 05",
    "description": "Đề thi thử 3 Passage tiêu chuẩn Cambridge, thời gian làm bài 60 phút.",
    "examType": "SKILL_TEST",
    "skill": "READING",
    "category": "IELTS",
    "durationMinutes": 60,
    "passScore": 6.5,
    "sections": [
      {
        "sectionOrder": 1,
        "title": "Passage 1: The Roman Amphitheatre",
        "passageText": "The amphitheatre was one of the greatest architectural...",
        "questionBankIds": ["qb-uuid-01", "qb-uuid-02", "qb-uuid-03"]
      }
    ]
  }
  ```

#### `POST /api/exams/auto-generate`
- **Mục đích**: **Tự động bốc đề từ ngân hàng đề** theo ma trận phân bổ chuẩn IELTS.
- **Request Body**:
  ```json
  {
    "title": "IELTS Reading Practice Generated 2026",
    "skill": "READING",
    "targetBand": 6.5,
    "matrix": {
      "passage1Count": 13,
      "passage2Count": 13,
      "passage3Count": 14
    }
  }
  ```
- **Xử lý Backend**: Service tự động truy vấn `QuestionBankItem` theo kỹ năng và độ khó, nhóm theo Passage và sinh ra một Đề thi hoàn chỉnh với 40 câu hỏi.

---

### 4.3. Nhóm 3: Giao Đề Thi Cho Học Viên (Exam Assignment APIs)

#### `POST /api/exams/:id/assign`
- **Mục đích**: Admin giao đề thi cho một Khóa học hoặc danh sách Học viên.
- **Request Body**:
  ```json
  {
    "courseId": "course-ielts-master-uuid",
    "assignedToUserIds": ["student-uuid-01", "student-uuid-02"], // Tùy chọn nếu chỉ giao cho một số bạn
    "dueDate": "2026-11-28T23:59:59.000Z",
    "allowReview": true
  }
  ```
- **Hành vi Backend**:
  1. Tạo bản ghi `ExamAssignment` trong cơ sở dữ liệu.
  2. Bắn thông báo thời gian thực qua `NotificationsService` (In-app bell và Socket.IO) đến toàn bộ học viên được giao:
     *"Thầy Đông vừa giao Đề thi mới: [Tên đề]. Hạn nộp: [Hạn nộp]!"*

#### `GET /api/exams/assignments`
- **Mục đích**: Lấy danh sách các đợt giao đề thi kèm thống kê số lượng bài nộp:
  - `totalAssigned`: Tổng số học viên được giao.
  - `submittedCount`: Số bài đã nộp.
  - `gradedCount`: Số bài Thầy đã hoàn tất chấm điểm.
  - `pendingCount`: Số bài đang chờ Thầy chấm Writing/Speaking.

---

### 4.4. Nhóm 4: Chấm Bài & Phản Hồi Sư Phạm (Exam Submissions & Grading APIs)

#### `GET /api/exams/assignments/:assignmentId/submissions`
- **Mục đích**: Xem danh sách toàn bộ học viên đã nộp bài trong đợt giao đề này.

#### `GET /api/exams/submissions/:submissionId`
- **Mục đích**: Xem bài làm chi tiết của một học viên cụ thể (bao gồm bài trắc nghiệm, bài viết luận Writing, file ghi âm giọng nói Speaking).

#### `PUT /api/exams/submissions/:submissionId/grade`
- **Mục đích**: Thầy Đông chấm điểm Writing, Speaking, phê duyệt điểm và gửi nhận xét sư phạm.
- **Request Body**:
  ```json
  {
    "writingBand": 7.0,
    "writingFeedback": "Task 1 phân tích số liệu biểu đồ tốt. Task 2 cần mở rộng thêm luận điểm phản biện.",
    "speakingBand": 6.5,
    "speakingFeedback": "Phát âm rõ ràng, tuy nhiên Part 3 cần sử dụng thêm các từ nối học thuật (Furthermore, On the contrary).",
    "overallBand": 7.0,
    "teacherNote": "Tổng quan bài làm rất tiến bộ. Tiếp tục duy trì phong độ này trong kỳ thi thật!"
  }
  ```
- **Hành vi Backend**:
  1. Cập nhật `status = GRADED`.
  2. Lưu Band điểm tổng thể `overallBand` và các lời phê.
  3. Tự động gửi thông báo kết quả thi kèm Band Score chi tiết về chuông thông báo của học viên.

---

## 5. THUẬT TOÁN QUY ĐỔI BAND SCORE CHUẨN IELTS (BAND CALCULATOR)

Đối với **Reading (Academic)** và **Listening**:
Hệ thống tự động tính số câu đúng $RawScore \in [0, 40]$ và quy đổi sang Band điểm:

| Raw Score (Listening /40) | Raw Score (Academic Reading /40) | IELTS Band Score |
|---|---|---|
| 39 - 40 | 39 - 40 | **9.0** |
| 37 - 38 | 37 - 38 | **8.5** |
| 35 - 36 | 35 - 36 | **8.0** |
| 32 - 34 | 33 - 34 | **7.5** |
| 30 - 31 | 30 - 32 | **7.0** |
| 26 - 29 | 27 - 29 | **6.5** |
| 23 - 25 | 23 - 26 | **6.0** |
| 18 - 22 | 19 - 22 | **5.5** |
| 16 - 17 | 15 - 18 | **5.0** |
| 13 - 15 | 13 - 14 | **4.5** |
| 10 - 12 | 10 - 12 | **4.0** |

**Quy tắc làm tròn Overall Band Score chuẩn Quốc tế**:
- Trung bình cộng 4 kỹ năng: $Average = \frac{Listening + Reading + Writing + Speaking}{4}$
- Nếu phần thập phân $< 0.25$ &rarr; Làm tròn xuống $.0$ (ví dụ: $6.125 \rightarrow 6.0$).
- Nếu phần thập phân $\ge 0.25$ và $< 0.75$ &rarr; Làm tròn về $.5$ (ví dụ: $6.25 \rightarrow 6.5$; $6.625 \rightarrow 6.5$).
- Nếu phần thập phân $\ge 0.75$ &rarr; Làm tròn lên $.0$ tiếp theo (ví dụ: $6.75 \rightarrow 7.0$).

---

## 6. SEQUENCE DIAGRAM: LUỒNG TẠO & GIAO ĐỀ TỪ NGÂN HÀNG ĐỀ

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Thầy Đông (Admin)
    participant Client as Frontend Next.js
    participant Server as NestJS ExamController
    participant Service as ExamService
    participant DB as MySQL Database (Prisma)
    participant Notif as NotificationsService
    actor Student as Học viên (Student)

    Note over Admin, Client: 1. Thầy tạo đề thi & Bốc câu hỏi
    Admin->>Client: Mở giao diện "Tạo Đề Thi IELTS"
    Client->>Server: GET /api/exam-bank/questions?skill=READING
    Server->>DB: Lấy danh sách câu hỏi trong Ngân hàng đề
    DB-->>Server: Trả về câu hỏi kèm Passage/Audio
    Server-->>Client: Hiển thị bộ lọc Ngân hàng đề
    Admin->>Client: Chọn câu hỏi (hoặc ấn "Tự động bốc đề 40 câu")
    Admin->>Client: Nhấn "Tạo Đề Thi Mới"
    Client->>Server: POST /api/exams (Payload kèm ExamSections & Questions)
    Server->>DB: Lưu Exam & ExamQuestionLink
    DB-->>Server: Tạo đề thành công

    Note over Admin, Client: 2. Thầy giao đề cho học viên
    Admin->>Client: Nhấn "Giao Đề Cho Khóa Học", đặt Deadline
    Client->>Server: POST /api/exams/:id/assign { courseId, dueDate }
    Server->>Service: Tạo ExamAssignment & Kích hoạt thông báo
    Service->>DB: Lưu ExamAssignment
    Service->>Notif: Gửi thông báo đến học viên trong khóa
    Notif-->>Student: 🔔 Bắn thông báo: "Thầy Đông vừa giao đề thi mới!"

    Note over Student, Server: 3. Học viên làm bài trực tiếp trên Web
    Student->>Client: Mở phòng thi IELTS trên web
    Client->>Server: GET /api/exams/:id/start-test
    Server-->>Client: Dữ liệu đề thi (Passage, Audio, Questions)
    Student->>Client: Làm bài Reading, Listening, gõ Writing, ghi âm Speaking
    Student->>Client: Nhấn "Nộp bài thi"
    Client->>Server: POST /api/exams/submissions
    Server->>Service: Tự động chấm Listening & Reading
    Service->>DB: Lưu ExamSubmission (Điểm thô + Band L&R; trạng thái SUBMITTED)

    Note over Admin, Server: 4. Thầy chấm Writing & Speaking
    Admin->>Client: Vào màn hình Chấm bài thi
    Client->>Server: GET /api/exams/submissions/:id
    Server-->>Client: Xem bài viết luận & nghe file ghi âm
    Admin->>Client: Nhập điểm 4 tiêu chí, Overall Band & Lời phê
    Client->>Server: PUT /api/exams/submissions/:id/grade
    Server->>DB: Cập nhật status = GRADED, Overall Band
    Server->>Notif: Bắn thông báo điểm thi về cho Học viên!
```

---

## 7. LỘ TRÌNH TRIỂN KHAI THEO YÊU CẦU

- **Giai đoạn 1 (Ưu tiên số 1 - Đúng yêu cầu hiện tại của Thầy)**:
  - Mở rộng Prisma Schema (`QuestionBankItem`, `Exam`, `ExamSection`, `ExamAssignment`).
  - Xây dựng Backend Module `exams` với đầy đủ API Ngân hàng câu hỏi, Tạo đề, Bốc đề tự động và Giao đề cho học viên.
  - Cập nhật giao diện Modal Admin: Tích hợp tab **"Chọn câu hỏi từ Ngân hàng đề"** và **"Bốc đề tự động theo kỹ năng"**.
- **Giai đoạn 2**:
  - Xây dựng giao diện học viên làm bài 4 kỹ năng trên Web theo chuẩn Computer-delivered IELTS (chia 2 cột Reading, Audio player Listening, Editor đếm từ Writing, Recorder Speaking).
- **Giai đoạn 3**:
  - Giao diện Admin chấm bài tập trung: Nghe audio speaking, đọc bài viết luận writing, duyệt điểm và xuất bảng điểm Overall Band.
