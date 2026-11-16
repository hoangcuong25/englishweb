import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { MockPrismaService } from './mock-prisma.service';
import { Role } from '@prisma/client';

describe('Teacher Dong Academy - IELTS Mock Tests & Integrated Full-Flow E2E Suite', () => {
  let app: INestApplication;
  let mockPrisma: MockPrismaService;

  let adminAccessToken: string;
  let studentAccessToken: string;
  let studentUserId: string;

  beforeAll(async () => {
    mockPrisma = new MockPrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================
  // 1. AUTHENTICATION & ACCESS TOKENS
  // ==========================================
  describe('1. Authentication & Role-Based Access Control (RBAC)', () => {
    it('Admin login should succeed and return ADMIN role access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@englishweb.com',
          password: 'Admin@123456',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.role).toBe(Role.ADMIN);
      adminAccessToken = res.body.accessToken;
    });

    it('Student login should succeed and return STUDENT role access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'student@englishweb.com',
          password: 'Student@123456',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.role).toBe(Role.STUDENT);
      studentAccessToken = res.body.accessToken;
      studentUserId = res.body.user.id;
    });

    it('Profile me endpoint should return authenticated student profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(res.body.email).toBe('student@englishweb.com');
      expect(res.body.role).toBe(Role.STUDENT);
    });

    it('Student attempting to access Admin diagnostic overview should be rejected with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/quizzes/diagnostic/admin/overview')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(403);
    });

    it('Unauthenticated request to protected endpoint should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/quizzes/diagnostic/me')
        .expect(401);
    });
  });

  // ==========================================
  // 2. IELTS MOCK TESTS (READING & LISTENING) CATALOG
  // ==========================================
  describe('2. IELTS Mock Tests Engine & Question Types', () => {
    it('GET /api/quizzes/skills/tests should return list of IELTS tests', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes/skills/tests')
        .expect(200);

      const tests = res.body;
      expect(Array.isArray(tests)).toBe(true);
      expect(tests.length).toBeGreaterThanOrEqual(2);

      const readingTest = tests.find((t: any) => t.skill === 'READING' && t.passage);
      expect(readingTest).toBeDefined();
      expect(readingTest.title).toContain('IELTS Academic Reading Mock Test');
      expect(readingTest.passage).toContain('READING PASSAGE 1');

      const listeningTest = tests.find((t: any) => t.skill === 'LISTENING' && t.audioUrl);
      expect(listeningTest).toBeDefined();
      expect(listeningTest.title).toContain('IELTS Listening Mock Test');
      expect(listeningTest.audioUrl).toBeDefined();
    });

    it('GET /api/quizzes/skills/tests?skill=READING should return only reading mock tests', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes/skills/tests?skill=READING')
        .expect(200);

      const tests = res.body;
      expect(Array.isArray(tests)).toBe(true);
      tests.forEach((t: any) => {
        expect(t.skill).toBe('READING');
      });
    });

    it('GET /api/quizzes/skills/tests?skill=LISTENING should return only listening mock tests', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes/skills/tests?skill=LISTENING')
        .expect(200);

      const tests = res.body;
      expect(Array.isArray(tests)).toBe(true);
      tests.forEach((t: any) => {
        expect(t.skill).toBe('LISTENING');
      });
    });

    it('GET /api/quizzes/:id as student should hide correct answer flags', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes/mock-reading-cambridge-academic')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      const quiz = res.body;
      expect(quiz.id).toBe('mock-reading-cambridge-academic');
      expect(quiz.questions.length).toBeGreaterThanOrEqual(2);

      quiz.questions.forEach((q: any) => {
        if (q.options) {
          q.options.forEach((o: any) => {
            expect(o.isCorrect).toBeUndefined();
          });
        }
      });
    });

    it('Student submits answers to IELTS Reading Mock Test (Matching Headings + True/False/Not Given) -> Auto-graded 100%', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quizzes/mock-reading-cambridge-academic/submit')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          answers: [
            {
              questionId: 'reading-q-1',
              selectedOptionId: 'ro-2',
            },
            {
              questionId: 'reading-q-2',
              textAnswer: 'TRUE',
            },
          ],
        })
        .expect(201);

      const result = res.body;
      expect(result.score).toBe(100);
      expect(result.isPassed).toBe(true);
      expect(result.correctAnswers).toBe(2);
      expect(result.totalQuestions).toBe(2);
      expect(result.submissionId).toBeDefined();
    });

    it('Student submits answers to IELTS Listening Mock Test (Note Completion) -> Auto-graded 100%', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quizzes/mock-listening-cambridge-section-1/submit')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          answers: [
            {
              questionId: 'listening-q-1',
              textAnswer: 'Westlake',
            },
          ],
        })
        .expect(201);

      const result = res.body;
      expect(result.score).toBe(100);
      expect(result.isPassed).toBe(true);
      expect(result.correctAnswers).toBe(1);
    });

    it('Student views submission history with full explanations', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes/mock-reading-cambridge-academic/my-submissions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      const submissions = res.body;
      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions.length).toBeGreaterThanOrEqual(1);
      expect(submissions[0].score).toBe(100);
      expect(submissions[0].answers).toBeDefined();
    });
  });

  // ==========================================
  // 3. 4-SKILLS DIAGNOSTIC ANALYTICS & SPIDER / RADAR CHART DATA
  // ==========================================
  describe('3. 4-Skills Diagnostic Analytics & Spider/Radar Chart Metrics', () => {
    it('GET /api/quizzes/diagnostic/me returns student diagnostic report with question type stats and strengths', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes/diagnostic/me')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      const data = res.body;
      expect(data).toBeDefined();
      expect(data.skillsBreakdown).toBeDefined();
      expect(data.questionTypesBreakdown).toBeDefined();
      expect(data.diagnosticSummary).toBeDefined();

      expect(Array.isArray(data.strengths)).toBe(true);
      expect(Array.isArray(data.weaknesses)).toBe(true);

      // Verify Question Types are tracked
      expect(data.questionTypesBreakdown.length).toBeGreaterThan(0);
    });

    it('Admin retrieves aggregate academy diagnostic overview', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes/diagnostic/admin/overview')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const data = res.body;
      expect(data.totalQuestionsAttempted).toBeGreaterThanOrEqual(1);
      expect(data.topDifficultTypes).toBeDefined();
      expect(data.academyQuestionTypes).toBeDefined();
    });
  });

  // ==========================================
  // 4. IELTS WRITING STUDIO PIPELINE
  // ==========================================
  describe('4. AI IELTS Writing Studio Flow', () => {
    let writingPromptId: string;
    let submissionId: string;

    it('Admin creates an IELTS Writing Prompt (Task 2)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/writing/prompts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Renewable Energy vs Fossil Fuels Investment (Task 2)',
          topic: 'Governments should invest in renewable energy rather than fossil fuels. To what extent do you agree or disagree?',
          taskType: 'TASK_2',
          targetWords: 250,
          timeLimitMinutes: 40,
        })
        .expect(201);

      const prompt = res.body;
      expect(prompt.id).toBeDefined();
      writingPromptId = prompt.id;
    });

    it('Student auto-saves draft essay', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/writing/drafts')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          promptId: writingPromptId,
          content: 'In the contemporary era, the global transition towards sustainable energy is undeniable...',
          wordCount: 15,
          durationSeconds: 120,
        })
        .expect(201);

      const draft = res.body;
      expect(draft.content).toContain('sustainable energy');
    });

    it('Student retrieves auto-saved draft', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/writing/drafts/${writingPromptId}`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      const draft = res.body;
      expect(draft.content).toContain('sustainable energy');
    });

    it('Student submits completed essay -> Evaluated by AI with 4 IELTS criteria', async () => {
      const fullEssay =
        'In the contemporary era, the transition towards sustainable energy infrastructure has emerged as an imperative priority for municipal and national governance alike. While detractors argue that petroleum exploration remains economically indispensable, I firmly contend that public investment in renewable resources exerts profound dividends on environmental mitigation and industrial security. First and foremost, biophilic and solar technologies foster long-term fiscal resilience...';

      const res = await request(app.getHttpServer())
        .post('/api/writing/submissions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          promptId: writingPromptId,
          content: fullEssay,
          timeSpentSeconds: 1500,
        })
        .expect(201);

      const sub = res.body.submission || res.body;
      expect(sub.id).toBeDefined();
      expect(sub.status).toBe('AI_EVALUATED');
      expect(sub.overallBand).toBeGreaterThanOrEqual(5.0);
      submissionId = sub.id;
    });

    it('Admin reviews and approves writing submission with score override', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/writing/admin/submissions/${submissionId}/approve`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          adminOverrideBand: 7.5,
          adminFeedback: 'Xuất sắc! Luận điểm chặt chẽ, từ vựng học thuật C1/C2 tự nhiên.',
        })
        .expect(200);

      const approved = res.body.submission || res.body;
      expect(approved.status).toBe('APPROVED');
      expect(approved.adminOverrideBand).toBe(7.5);
    });
  });

  // ==========================================
  // 5. IELTS SPEAKING STUDIO PIPELINE
  // ==========================================
  describe('5. IELTS Speaking Studio Flow', () => {
    let speakingPromptId: string;
    let speakingSubmissionId: string;

    it('Admin creates an IELTS Speaking Prompt (Part 2 Cue Card)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/speaking/prompts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Describe an eco-friendly architectural project in your city',
          topic: 'You should say where it is, what features make it sustainable, and explain why it inspires you.',
          minSeconds: 60,
          maxSeconds: 120,
        })
        .expect(201);

      const prompt = res.body;
      expect(prompt.id).toBeDefined();
      speakingPromptId = prompt.id;
    });

    it('Student submits recorded speech session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/speaking/submissions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          promptId: speakingPromptId,
          audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room_tone.ogg',
          durationSeconds: 110,
        })
        .expect(201);

      const sub = res.body.submission || res.body;
      expect(sub.id).toBeDefined();
      expect(sub.status).toBe('PENDING');
      speakingSubmissionId = sub.id;
    });

    it('Admin views pending speaking submissions and grades with timestamp comments', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/speaking/admin/submissions/${speakingSubmissionId}/grade`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          fluencyScore: 7.5,
          lexicalScore: 8.0,
          grammarScore: 7.5,
          pronunciationScore: 7.0,
          feedback: 'Phát âm tự nhiên, ngữ điệu phong phú.',
          timestampFeedback: [
            { timestamp: '00:15', note: 'Dùng từ vựng "biophilic infrastructure" rất đắt giá.' },
            { timestamp: '01:00', note: 'Ngắt nghỉ nhịp nhàng, liên kết ý trôi chảy.' },
          ],
        })
        .expect(200);

      const graded = res.body;
      expect(graded.status).toBe('GRADED');
      expect(graded.bandScore).toBe(7.5);
    });
  });

  // ==========================================
  // 6. LIVEKIT WEBRTC & AUTOMATED ATTENDANCE
  // ==========================================
  describe('6. LiveKit Classroom & Attendance Webhook Flow', () => {
    let classroomId: string;
    let attendanceRecordId: string;

    it('Admin schedules a LiveKit classroom', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/attendance/classrooms')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `IELTS Weekend Masterclass ${Date.now()}`,
          scheduledStartTime: '2026-11-08T19:30:00.000Z',
          scheduledEndTime: '2026-11-08T21:00:00.000Z',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      classroomId = res.body.id;
    });

    it('Student requests LiveKit WebRTC Token for the room', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/livekit/token')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          roomName: 'IELTS Intensive Weekend Masterclass',
        })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
    });

    it('Admin overrides attendance status with audit note', async () => {
      const rec = await mockPrisma.attendanceRecord.upsert({
        where: {
          classroomId_studentId: {
            classroomId,
            studentId: studentUserId,
          },
        },
        create: {
          classroomId,
          studentId: studentUserId,
          totalMinutes: 85,
          status: 'PRESENT',
          notes: 'Tham gia đầy đủ.',
        },
        update: {},
      });
      attendanceRecordId = rec.id;

      const res = await request(app.getHttpServer())
        .put(`/api/attendance/${attendanceRecordId}/override`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          status: 'PRESENT',
          notes: 'Admin duyệt: Tham gia tích cực buổi học.',
        })
        .expect(200);

      expect(res.body.status).toBe('PRESENT');
    });

    it('Admin exports attendance report as Excel spreadsheet', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/attendance/export')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('spreadsheetml');
    });
  });

  // ==========================================
  // 7. SECURED DIGITAL LIBRARY & WATERMARK
  // ==========================================
  describe('7. Secured Digital Library & Signed Watermark Flow', () => {
    let materialId: string;

    it('Admin creates secured PDF material for a lesson', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          lessonId: 'lesson-uuid-1',
          title: 'IELTS Academic Collocations Comprehensive Guide 2026.pdf',
          type: 'PDF',
          fileKey: 'materials/ielts-collocations-guide-2026.pdf',
          fileSize: 8500000,
          isPrivate: true,
          isWatermarked: true,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      materialId = res.body.id;
    });

    it('Student requests signed URL with dynamic watermark metadata', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/materials/${materialId}/signed-url`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(res.body.signedUrl).toContain('stream?token=');
      expect(res.body.expiresInSeconds).toBe(900); // 15 minutes
      expect(res.body.watermark).toBeDefined();
      expect(res.body.watermark.studentName).toBe('Nguyen Thi Mai');
      expect(res.body.watermark.studentCode).toBeDefined();
    });
  });

  // ==========================================
  // 8. ADMIN USER MANAGEMENT
  // ==========================================
  describe('8. Admin Student User Management Flow', () => {
    it('Admin searches student users list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users?role=STUDENT')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });

    it('Admin locks student account status', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/users/${studentUserId}/status`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(res.body.isActive).toBe(false);
    });

    it('Admin unlocks student account status', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/users/${studentUserId}/status`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ isActive: true })
        .expect(200);

      expect(res.body.isActive).toBe(true);
    });

    it('Admin resets student password to default', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/users/${studentUserId}/reset-password`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ newPassword: 'DongAcademy@2026' })
        .expect(200);

      expect(res.body.message).toBeDefined();
    });
  });

  // ==========================================
  // 9. DASHBOARD & NOTIFICATIONS
  // ==========================================
  describe('9. Dashboard Analytics & Notifications Flow', () => {
    it('Student dashboard statistics should load successfully', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/student')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(res.body.overview).toBeDefined();
    });

    it('Admin dashboard statistics should load successfully', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(res.body.metrics).toBeDefined();
      expect(res.body.actionItems).toBeDefined();
    });

    it('Admin broadcasts system notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notifications/broadcast')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Thông báo ca học IELTS Speaking tối nay',
          content: 'Lớp học WebRTC sẽ diễn ra lúc 19:30, các bạn học viên vui lòng vào đúng giờ.',
          type: 'LIVE',
          link: '/student/classroom',
        })
        .expect(201);

      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('Student fetches notifications and marks all as read', async () => {
      const getRes = await request(app.getHttpServer())
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(getRes.body.items)).toBe(true);

      const readRes = await request(app.getHttpServer())
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(readRes.body.success).toBe(true);
    });
  });
});
