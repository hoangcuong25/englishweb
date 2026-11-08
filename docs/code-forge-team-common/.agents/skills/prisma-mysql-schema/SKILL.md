---
name: prisma-mysql-schema
description: >-
  Use this skill to design, migrate, and seed the MySQL database schema using Prisma ORM with strict 2-role RBAC (STUDENT and ADMIN), courses, lessons, quizzes, speaking submissions, and attendance tracking.
---

# Prisma & MySQL Schema Skill

This skill outlines the schema structure, data relations, and seeding procedures for the English Learning Platform.

## 1. Role Definition (2 Roles Only)
```prisma
enum Role {
  STUDENT
  ADMIN
}
```

## 2. Core Entities
1. **User & Auth**:
   - `User`: id, email, passwordHash, fullName, phone, role (enum), isActive, createdAt, updatedAt
   - `RefreshToken`: id, token, userId, expiresAt, revokedAt
2. **Course & Hierarchy (4-level)**:
   - `Course`: id, title, slug, description, category (IELTS, Business, Kids), thumbnail, isPublished, createdAt
   - `Module`: id, courseId, title, orderIndex
   - `Lesson`: id, moduleId, title, orderIndex, durationMinutes
   - `Material`: id, lessonId, title, type (PDF, AUDIO, VIDEO), fileKey, isPrivate
   - `Enrollment`: id, userId, courseId, enrolledAt, progressPercent
3. **Assessment & Quizzes**:
   - `Quiz`: id, lessonId, title, durationSeconds, passScore, createdAt
   - `Question`: id, quizId, content, type (SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK), points, explanation
   - `Option`: id, questionId, content, isCorrect
   - `QuizSubmission`: id, quizId, userId, score, isPassed, submittedAt
4. **Speaking Module**:
   - `SpeakingPrompt`: id, lessonId, title, instructions, audioUrl (sample audio), minSeconds, maxSeconds
   - `SpeakingSubmission`: id, promptId, userId, audioKey, durationSeconds, submittedAt, bandScore, feedback, gradedAt, gradedById
5. **Classroom & Attendance**:
   - `Room`: id, name, courseId, hostId, scheduledAt, endedAt, status (SCHEDULED, ACTIVE, ENDED)
   - `AttendanceRecord`: id, roomId, userId, joinedAt, leftAt, totalMinutes, status (PRESENT, LATE, ABSENT), isManualOverride, note

## 3. Seeding Guidelines
- Always seed a default Admin user:
  - Email: `admin@englishweb.com`
  - Role: `ADMIN`
- Seed sample categories: `IELTS Preparation`, `Business English`, `English for Kids`.
- Seed a demo course with chapters, lessons, quizzes, and speaking prompt.
