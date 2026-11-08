---
name: prisma-mysql-schema
description: >-
  Kỹ năng thiết kế, migrate và seed cơ sở dữ liệu MySQL 8.0 sử dụng Prisma ORM chuẩn hóa cho toàn bộ 11 phân hệ của Teacher Dong Academy.
---

# Prisma & MySQL Schema Skill

## 1. Nguyên Tắc Phân Quyền (2 Roles Only)
```prisma
enum Role {
  STUDENT
  ADMIN
}
```

## 2. Các Thực Thể Chính Theo 11 Phân Hệ
1. **User & Authentication**:
   - `User`: Quản lý tài khoản, vai trò (STUDENT, ADMIN), `preferredLang` (VI, EN, JA, ZH), avatar, sđt.
   - `RefreshToken`: Quản lý token, `deviceId`, `ipAddress`, `revokedAt` phục vụ cơ chế Single Concurrent Session.
   - `GoogleAccount`: Lưu ID OAuth, avatar, email liên kết.
2. **LMS Course Hierarchy**:
   - `Course`: Khóa học (IELTS, BUSINESS, KIDS, PEDAGOGY, LIFE_SKILLS), danh mục, thumbnail, publish status.
   - `CourseModule`: Chương học thuộc khóa học.
   - `Lesson`: Bài học với `orderIndex`, `durationMinutes`, videoUrl.
   - `Material`: Tài liệu số (PDF, AUDIO), fileKey, isPrivate, watermarking metadata.
   - `Enrollment` & `LessonProgress`: Theo dõi tiến độ học tập.
3. **AI IELTS Writing Studio**:
   - `WritingPrompt`: Đề bài IELTS Task 1 & Task 2.
   - `WritingSubmission`: Bài nộp, số từ, thời gian làm bài, điểm 4 tiêu chí (TR, CC, LR, GRA), nhận xét AI, điểm duyệt và ghi chú của Admin.
4. **IELTS Speaking Studio**:
   - `SpeakingPrompt`: Đề bài nói, audio mẫu, min/max thời lượng.
   - `SpeakingSubmission`: File ghi âm, điểm 4 tiêu chí (FC, LR, GRA, PR), timestamp comments JSON của Admin.
5. **Quiz Engine**:
   - `Quiz`: Bài trắc nghiệm, thời gian đếm ngược, điểm sàn pass (ví dụ 80%).
   - `Question`: Dạng SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK.
   - `QuestionOption`: Các phương án lựa chọn và đáp án đúng.
   - `QuizSubmission` & `QuizAnswer`: Lưu kết quả, trạng thái Đạt/Không đạt, tự động mở khóa bài học tiếp theo.
6. **Classroom & Attendance**:
   - `Classroom`: Phòng học trực tuyến LiveKit, hostId, lịch bắt đầu/kết thúc.
   - `AttendanceRecord`: Log vào/ra, tổng phút học thực tế, trạng thái PRESENT, LATE, ABSENT, điều chỉnh thủ công của Admin.
7. **Realtime Chat**:
   - `Conversation` & `Message`: Hội thoại trực tiếp giữa Admin và Học viên qua Socket.IO.
