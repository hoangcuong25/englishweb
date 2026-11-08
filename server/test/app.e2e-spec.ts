import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { MockPrismaService } from './mock-prisma.service';
import { Language } from '@prisma/client';

describe('English Learning LMS & WebRTC E2E Test Suite (Comprehensive)', () => {
  let app: INestApplication;
  let mockPrisma: MockPrismaService;

  let adminAccessToken: string;
  let studentAccessToken: string;
  let testRefreshToken: string;
  let registeredStudentEmail: string;

  beforeAll(async () => {
    mockPrisma = new MockPrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
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
  // 1. BASIC HEALTH CHECK
  // ==========================================
  describe('1. Health Check', () => {
    it('GET /api should return 200 and greeting', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('Hello World!');
    });
  });

  // ==========================================
  // 2. AUTHENTICATION & RBAC FLOW
  // ==========================================
  describe('2. Auth & RBAC Flow (Student & Admin)', () => {
    registeredStudentEmail = `student_${Date.now()}@test.com`;

    it('FR-1.1: Student Self-Registration -> should strictly assign role STUDENT', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: registeredStudentEmail,
          password: 'Password123!',
          fullName: 'Nguyen Van Test',
          phone: '0909999888',
          preferredLang: Language.VI,
          deviceId: 'device-initial',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', registeredStudentEmail.toLowerCase());
      expect(response.body.user).toHaveProperty('role', 'STUDENT');

      // Check cookies
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('access_token='))).toBeTruthy();
      expect(cookies.some((c: string) => c.includes('user_role=STUDENT'))).toBeTruthy();
    });

    it('FR-1.1: Registration with existing email should fail (409 Conflict)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: registeredStudentEmail,
          password: 'Password123!',
          fullName: 'Duplicate User',
        })
        .expect(409);
    });

    it('FR-1.2: Login as Seeded Admin -> should return role ADMIN and proper cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@englishweb.com',
          password: 'Admin@123456',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('role', 'ADMIN');
      adminAccessToken = response.body.accessToken;

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.includes('user_role=ADMIN'))).toBeTruthy();
    });

    it('FR-1.2: Login as Seeded Student -> should return role STUDENT', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'student@englishweb.com',
          password: 'Student@123456',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('role', 'STUDENT');
      studentAccessToken = response.body.accessToken;
      testRefreshToken = response.body.refreshToken;
    });

    it('FR-1.2: Login with wrong password should fail (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@englishweb.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  // ==========================================
  // 3. SINGLE CONCURRENT SESSION ENFORCEMENT
  // ==========================================
  describe('3. Single Concurrent Session Enforcement (Student)', () => {
    it('FR-1.3: Logging in from Device 2 should revoke Device 1 refresh token', async () => {
      // Step 1: Login from Device 1
      const loginDev1 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registeredStudentEmail,
          password: 'Password123!',
          deviceId: 'device-1',
        })
        .expect(200);

      const tokenDev1 = loginDev1.body.refreshToken;

      // Step 2: Login from Device 2
      const loginDev2 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registeredStudentEmail,
          password: 'Password123!',
          deviceId: 'device-2',
        })
        .expect(200);

      const tokenDev2 = loginDev2.body.refreshToken;

      // Step 3: Device 1 attempts to refresh its token -> must be rejected (401)
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: tokenDev1 })
        .expect(401);

      // Step 4: Device 2 refreshes its token -> must succeed (200)
      const refreshDev2 = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: tokenDev2 })
        .expect(200);

      expect(refreshDev2.body).toHaveProperty('accessToken');
    });
  });

  // ==========================================
  // 4. GOOGLE OAUTH 2.0 FLOW
  // ==========================================
  describe('4. Google OAuth 2.0 Integration', () => {
    const googleId = 'google_oauth_test_999';

    it('FR-1.4: Google Auth -> should register/login and link google account', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({
          idToken: googleId,
          email: 'google_user@test.com',
          fullName: 'Google Student',
          avatarUrl: 'https://example.com/avatar.jpg',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('isGoogleLinked', true);
      expect(response.body.user).toHaveProperty('role', 'STUDENT');
    });

    it('FR-1.4: Link Google account to current authenticated profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/google/link')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          idToken: 'google_linked_id_student',
          email: 'student_google@gmail.com',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Google account linked successfully');
    });

    it('FR-1.4: Unlink Google account from profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/google/unlink')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Google account unlinked successfully');
    });
  });

  // ==========================================
  // 5. PROFILE, I18N & PASSWORD MANAGEMENT
  // ==========================================
  describe('5. Profile, i18n & Password Management', () => {
    it('FR-1.5: GET /api/auth/me -> Authenticated profile check', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', 'student@englishweb.com');
      expect(response.body).toHaveProperty('role', 'STUDENT');
      expect(response.body).toHaveProperty('preferredLang');
    });

    it('FR-1.5: GET /api/auth/me without token should return 401', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('FR-1.5: PUT /api/auth/language -> Update interface language to EN', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/auth/language')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({ language: Language.EN })
        .expect(200);

      expect(response.body).toHaveProperty('preferredLang', Language.EN);
    });

    it('FR-1.5: POST /api/auth/change-password -> Should update password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          oldPassword: 'Student@123456',
          newPassword: 'NewStudent@654321',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify login with new password works
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'student@englishweb.com',
          password: 'NewStudent@654321',
        })
        .expect(200);
    });

    it('FR-1.5: POST /api/auth/change-password with wrong old password should fail (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          oldPassword: 'IncorrectOldPassword',
          newPassword: 'AnotherPassword123!',
        })
        .expect(400);
    });
  });

  // ==========================================
  // 6. SESSIONS MANAGEMENT & TOKEN ROTATION
  // ==========================================
  describe('6. Sessions Management & Token Rotation', () => {
    let currentSessionId: string;

    it('FR-1.6: GET /api/auth/sessions -> List active sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      currentSessionId = response.body[0].id;
    });

    it('FR-1.6: DELETE /api/auth/sessions/:id -> Terminate specific session', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/auth/sessions/${currentSessionId}`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Session terminated successfully');
    });

    it('FR-1.6: POST /api/auth/refresh -> Token Rotation and reuse prevention', async () => {
      // Create a fresh session
      const login = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@englishweb.com',
          password: 'Admin@123456',
        })
        .expect(200);

      const oldRefresh = login.body.refreshToken;

      const refreshRes = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: oldRefresh })
        .expect(200);

      expect(refreshRes.body).toHaveProperty('accessToken');
      expect(refreshRes.body).toHaveProperty('refreshToken');
      expect(refreshRes.body.refreshToken).not.toBe(oldRefresh);

      // Attempting to reuse old token must be rejected
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: oldRefresh })
        .expect(401);
    });

    it('FR-1.6: POST /api/auth/logout -> Revoke token and clear cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({ refreshToken: testRefreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.includes('access_token=;'))).toBeTruthy();
    });

    it('FR-1.6: POST /api/auth/logout-all -> Revoke all user sessions', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out from all devices successfully');
    });
  });

  // ==========================================
  // 7. LIVEKIT WEBRTC CLASSROOM & RBAC FLOW
  // ==========================================
  describe('7. LiveKit WebRTC Token & Host Controls Flow', () => {
    it('FR-5.1: Admin requests LiveKit Token -> should grant Host (isHost: true)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ roomName: 'ielts-masterclass-live' })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('isHost', true);
      expect(response.body).toHaveProperty('role', 'ADMIN');
      expect(response.body).toHaveProperty('roomName', 'ielts-masterclass-live');
    });

    it('FR-5.1: Student requests LiveKit Token -> should grant Participant (isHost: false)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({ roomName: 'ielts-masterclass-live' })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('isHost', false);
      expect(response.body).toHaveProperty('role', 'STUDENT');
      expect(response.body).toHaveProperty('roomName', 'ielts-masterclass-live');
    });

    it('FR-5.2: Student tries to End Room -> RolesGuard must reject with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/api/livekit/end-room')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({ roomName: 'ielts-masterclass-live' })
        .expect(403);
    });

    it('FR-5.2: Admin Host calls End Room -> RolesGuard permits request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/livekit/end-room')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ roomName: 'ielts-masterclass-live' })
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });

    it('FR-5.3: GET /api/livekit/rooms as Student -> should return list of active/scheduled classrooms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/livekit/rooms')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('name');
    });

    it('FR-5.4: POST /api/livekit/rooms as Admin -> should schedule a new live room', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/livekit/rooms')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'ielts-speaking-intensive-stream',
          scheduledStartTime: new Date().toISOString(),
          scheduledEndTime: new Date(Date.now() + 5400000).toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'ielts-speaking-intensive-stream');
      expect(response.body).toHaveProperty('status', 'SCHEDULED');
    });

    it('FR-5.5: POST /api/livekit/rooms as Student -> should be forbidden (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/livekit/rooms')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          name: 'student-illegal-stream-room',
          scheduledStartTime: new Date().toISOString(),
          scheduledEndTime: new Date(Date.now() + 3600000).toISOString(),
        })
        .expect(403);
    });

    it('FR-5.6: POST /api/livekit/mute-participant as Student -> should be forbidden (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/livekit/mute-participant')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          roomName: 'ielts-masterclass-live',
          identity: 'student-uuid-1',
          trackSid: 'TR_MOCK_123',
          muted: true,
        })
        .expect(403);
    });
  });

  // ==========================================
  // 8. LIVEKIT WEBHOOK & ATTENDANCE FLOW
  // ==========================================
  describe('8. LiveKit Webhook Attendance Flow', () => {
    it('FR-6.1: Webhook endpoint should be reachable', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/livekit/webhook')
        .send({ event: 'test' })
        .expect(201);

      expect(response.body).toBeDefined();
    });
  });

  // ==========================================
  // 9. LMS COURSE ENGINE FLOW (FR-03)
  // ==========================================
  describe('9. LMS Course Engine Flow (FR-03)', () => {
    let createdCourseId: string;

    it('FR-3.1: GET /api/courses/categories -> should return 5 training pillars', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courses/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(5);
      expect(response.body.map((c: any) => c.key)).toContain('IELTS');
      expect(response.body.map((c: any) => c.key)).toContain('BUSINESS');
    });

    it('FR-3.2: GET /api/courses -> should list published courses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courses')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('slug', 'ielts-masterclass');
      expect(response.body[0]).toHaveProperty('moduleCount');
      expect(response.body[0]).toHaveProperty('studentCount');
    });

    it('FR-3.3: POST /api/courses as Student -> should be forbidden (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          title: 'Unauthorized Course',
          slug: 'unauthorized-course',
          category: 'IELTS',
        })
        .expect(403);
    });

    it('FR-3.4: POST /api/courses as Admin -> should create a new course', async () => {
      const newCourseSlug = `business-comm-${Date.now()}`;
      const response = await request(app.getHttpServer())
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Business English Communication Masterclass',
          slug: newCourseSlug,
          description: 'Giao tiếp công sở & đàm phán hợp đồng',
          category: 'BUSINESS',
          thumbnail: 'https://images.unsplash.com/sample-biz.jpg',
          isPublished: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('slug', newCourseSlug);
      createdCourseId = response.body.id;
    });

    it('FR-3.5: PUT /api/courses/:id as Admin -> should update course title', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Business English Advanced 2026',
        })
        .expect(200);

      expect(response.body.title).toBe('Business English Advanced 2026');
    });

    it('FR-3.6: POST /api/courses/:id/enroll as Student -> should enroll successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/courses/${createdCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('enrollment');
      expect(response.body.enrollment.courseId).toBe(createdCourseId);
    });

    it('FR-3.7: GET /api/courses/my-learning as Student -> should return enrolled courses with progress', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courses/my-learning')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.some((e: any) => e.courseId === createdCourseId)).toBeTruthy();
    });

    it('FR-3.8: GET /api/courses/:slugOrId -> should return course with syllabus tree', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courses/ielts-masterclass')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('slug', 'ielts-masterclass');
      expect(response.body).toHaveProperty('modules');
      expect(response.body.modules.length).toBeGreaterThanOrEqual(1);
      expect(response.body.modules[0]).toHaveProperty('lessons');
    });
  });

  // ==========================================
  // 10. CURRICULUM & LESSON ENGINE FLOW (FR-03)
  // ==========================================
  describe('10. Curriculum & Lesson Engine Flow (FR-03)', () => {
    let testModuleId: string;
    let testLessonId: string;

    it('FR-3.9: POST /api/lessons/modules as Admin -> should create module in course', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/lessons/modules')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          courseId: 'course-uuid-1',
          title: 'Module 2: Advanced Cohesion and Task 2',
          description: 'Luyện cấu trúc PEEL 4 đoạn',
          orderIndex: 2,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Module 2: Advanced Cohesion and Task 2');
      testModuleId = response.body.id;
    });

    it('FR-3.10: POST /api/lessons as Admin -> should create lesson in module', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/lessons')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          moduleId: testModuleId,
          title: 'Lesson 2.1: Master PEEL Paragraph Architecture',
          description: 'Cách viết Point, Explanation, Example, Link',
          orderIndex: 1,
          durationMinutes: 40,
          isFreePreview: false,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Lesson 2.1: Master PEEL Paragraph Architecture');
      testLessonId = response.body.id;
    });

    it('FR-3.11: POST /api/lessons/reorder as Admin -> should reorder lessons', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/lessons/reorder')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          items: [{ id: testLessonId, orderIndex: 5 }],
        })
        .expect(201);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('FR-3.12: GET /api/lessons/:id -> should get lesson details and access flag', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/lessons/${testLessonId}`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testLessonId);
      expect(response.body).toHaveProperty('isAccessible');
    });

    it('FR-3.13: POST /api/lessons/:id/complete as Student -> should mark completed and calculate %', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/lessons/${testLessonId}/complete`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('isCompleted', true);
      expect(response.body).toHaveProperty('progressPercent');
    });
  });

  // ==========================================
  // 11. SECURED DIGITAL LIBRARY & WATERMARK FLOW (FR-04)
  // ==========================================
  describe('11. Secured Digital Library & Watermark Flow (FR-04)', () => {
    let createdMaterialId: string;
    let signedToken: string;

    it('FR-4.1: POST /api/materials as Admin -> should create PDF material metadata', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          lessonId: 'lesson-uuid-1',
          title: 'IELTS_Writing_Task2_Masterclass_Band_8.pdf',
          type: 'PDF',
          fileKey: 'materials/ielts-task2-guide.pdf',
          fileSize: 1048576,
          isPrivate: true,
          isWatermarked: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('PDF');
      createdMaterialId = response.body.id;
    });

    it('FR-4.2: GET /api/materials/lesson/:lessonId as Student -> should list materials', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/materials/lesson/lesson-uuid-1')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('FR-4.3: POST /api/materials/:id/signed-url -> should issue 15-min token & Dynamic Watermark payload', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/materials/${createdMaterialId}/signed-url`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('signedUrl');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresInSeconds', 900);
      expect(response.body).toHaveProperty('watermark');
      expect(response.body.watermark).toHaveProperty('studentName');
      expect(response.body.watermark).toHaveProperty('studentCode');
      expect(response.body.watermark).toHaveProperty('maskedPhone');
      expect(response.body.watermark).toHaveProperty('renderedTimestamp');

      signedToken = response.body.token;
    });

    it('FR-4.4: GET /api/materials/:id/stream with signed token -> should stream inline document (nosniff & inline)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/materials/${createdMaterialId}/stream?token=${signedToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('inline;');
      expect(response.headers['cache-control']).toContain('no-store');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('FR-4.5: GET /api/materials/:id/stream without token or expired token -> should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/api/materials/${createdMaterialId}/stream?token=invalid.expired.token`)
        .expect(401);
    });

    it('FR-4.6: DELETE /api/materials/:id as Admin -> should remove material', async () => {
      await request(app.getHttpServer())
        .delete(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });
  });

  // ==========================================
  // 12. AI IELTS WRITING STUDIO FLOW (FR-06)
  // ==========================================
  describe('12. AI IELTS Writing Studio Flow (FR-06)', () => {
    let testPromptId: string;
    let testSubmissionId: string;

    it('FR-6.1: GET /api/writing/prompts -> should list prompts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/writing/prompts')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('FR-6.2: POST /api/writing/prompts as Admin -> should create a new writing prompt', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/writing/prompts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'IELTS Writing Task 2: Artificial Intelligence in Education',
          taskType: 'TASK_2',
          topic: 'Some people think that AI will completely replace human teachers in the future. Discuss both views and give your opinion.',
          targetWords: 250,
          timeLimitMinutes: 40,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      testPromptId = response.body.id;
    });

    it('FR-6.3: POST /api/writing/submissions as Student -> should trigger AI evaluation across 4 criteria', async () => {
      const essayContent = `
        In contemporary educational discourse, the escalating integration of artificial intelligence has precipitated intense debate regarding whether autonomous algorithmic tutors could ultimately supersede pedagogical human instructors. From my perspective, while advanced AI tools undeniably furnish unprecedented personalized learning opportunities, the irreplaceable empathetic guidance and social-emotional mentoring provided by human educators ensure their persistent indispensability.

        On the one hand, AI systems possess peerless efficiency in diagnostic feedback and adaptive curricula. Through the proliferation of machine learning algorithms, digital platforms can instantly detect lexical deficiencies and grammatical discrepancies. Furthermore, learners can progress at their bespoke pacing without experiencing stigmatization. Consequently, routine linguistic instruction and repetitive drills can be automated effectively.

        On the other hand, authentic pedagogy transcends the mere mechanical dissemination of factual knowledge. Inspiring intellectual curiosity, instilling moral ethical values, and cultivating critical thinking require human emotional resonance that artificial neural networks cannot replicate. When encountering cognitive plateaus, students derive resilience from empathetic encouragement rather than cold algorithmic prompts.

        In conclusion, although artificial intelligence will unquestionably augment instructional methodologies, human teachers will remain the cornerstone of holistic education.
      `.trim();

      const response = await request(app.getHttpServer())
        .post('/api/writing/submissions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          promptId: testPromptId,
          content: essayContent,
          timeSpentSeconds: 1980,
        })
        .expect(201);

      expect(response.body).toHaveProperty('submission');
      const sub = response.body.submission;
      expect(sub.status).toBe('AI_EVALUATED');
      expect(sub.wordCount).toBeGreaterThanOrEqual(150);
      expect(sub).toHaveProperty('overallBand');
      expect(sub).toHaveProperty('taskAchievementScore');
      expect(sub).toHaveProperty('coherenceCohesionScore');
      expect(sub).toHaveProperty('lexicalResourceScore');
      expect(sub).toHaveProperty('grammarScore');
      expect(sub).toHaveProperty('aiFeedback');
      expect(sub).toHaveProperty('aiSuggestions');
      expect(sub).toHaveProperty('sampleBand8Essay');

      testSubmissionId = sub.id;
    });

    it('FR-6.4: GET /api/writing/submissions/my as Student -> should list own essays', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/writing/submissions/my')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.some((s: any) => s.id === testSubmissionId)).toBeTruthy();
    });

    it('FR-6.5: GET /api/writing/admin/submissions as Admin -> should list submissions for approval', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/writing/admin/submissions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.some((s: any) => s.id === testSubmissionId)).toBeTruthy();
    });

    it('FR-6.6: POST /api/writing/admin/submissions/:id/approve as Admin -> should override score and publish approved result', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/writing/admin/submissions/${testSubmissionId}/approve`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          adminOverrideBand: 8.0,
          adminFeedback: 'Bài viết lập luận rất sắc bén, dùng nhiều từ vựng C1/C2 xuất sắc!',
        })
        .expect(200);

      expect(response.body.status).toBe('APPROVED');
      expect(response.body.adminOverrideBand).toBe(8.0);
      expect(response.body).toHaveProperty('approvedAt');
    });
  });

  // ==========================================
  // 13. IELTS SPEAKING STUDIO FLOW (FR-07)
  // ==========================================
  describe('13. IELTS Speaking Studio Flow (FR-07)', () => {
    let testSpeakingPromptId: string;
    let testSpeakingSubmissionId: string;

    it('FR-7.1: GET /api/speaking/prompts -> should list prompts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/speaking/prompts')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('FR-7.2: POST /api/speaking/prompts as Admin -> should create speaking prompt', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/speaking/prompts')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Speaking Part 2: Describe a book that had a major influence on you',
          topic: 'You should say: what the book is, who wrote it, what it is about, and explain why it influenced you.',
          minSeconds: 40,
          maxSeconds: 120,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      testSpeakingPromptId = response.body.id;
    });

    it('FR-7.3: POST /api/speaking/submissions as Student -> should submit audio recording (status PENDING)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/speaking/submissions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          promptId: testSpeakingPromptId,
          audioUrl: 'https://cdn.englishweb.com/recordings/student_sample_audio.mp3',
          durationSeconds: 95,
        })
        .expect(201);

      expect(response.body).toHaveProperty('submission');
      expect(response.body.submission.status).toBe('PENDING');
      testSpeakingSubmissionId = response.body.submission.id;
    });

    it('FR-7.4: GET /api/speaking/submissions/my as Student -> should list submissions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/speaking/submissions/my')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.some((s: any) => s.id === testSpeakingSubmissionId)).toBeTruthy();
    });

    it('FR-7.5: POST /api/speaking/admin/submissions/:id/grade as Admin -> should grade 4 criteria & add timestamp feedback', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/speaking/admin/submissions/${testSpeakingSubmissionId}/grade`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          fluencyScore: 7.5,
          lexicalScore: 7.0,
          grammarScore: 7.0,
          pronunciationScore: 7.5,
          feedback: 'Bài nói trôi chảy, phát âm rõ ràng, nhịp điệu tự nhiên.',
          timestampFeedback: [
            { timestamp: '00:18', note: 'Từ vựng hay: "profound impact"' },
            { timestamp: '00:52', note: 'Cần chú ý nối âm tại "read it"' },
          ],
        })
        .expect(200);

      expect(response.body.status).toBe('GRADED');
      expect(response.body.bandScore).toBe(7.5);
      expect(response.body.fluencyScore).toBe(7.5);
      expect(response.body.pronunciationScore).toBe(7.5);
      expect(response.body).toHaveProperty('gradedAt');
    });
  });

  // ==========================================
  // 14. QUIZ ENGINE FLOW (FR-08)
  // ==========================================
  describe('14. Quiz Engine Flow (FR-08)', () => {
    let testQuizId: string;
    let testQuestionId: string;
    let correctOptionId: string;
    let wrongOptionId: string;

    it('FR-8.1: POST /api/quizzes as Admin -> should create quiz linked to lesson', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          lessonId: 'lesson-uuid-1',
          title: 'IELTS Academic Writing Criteria Test',
          description: 'Kiểm tra 4 tiêu chí chấm điểm IELTS Writing',
          timeLimitMinutes: 10,
          passScore: 80,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      testQuizId = response.body.id;
    });

    it('FR-8.2: POST /api/quizzes/:id/questions as Admin -> should add question with options', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/quizzes/${testQuizId}/questions`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          content: 'What does TR stand for in IELTS Writing Task 2 assessment criteria?',
          type: 'SINGLE_CHOICE',
          points: 1.0,
          explanation: 'TR stands for Task Response in Task 2.',
          orderIndex: 1,
          options: [
            { content: 'Task Response', isCorrect: true },
            { content: 'Topic Relevance', isCorrect: false },
            { content: 'Text Review', isCorrect: false },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.options.length).toBe(3);
      testQuestionId = response.body.id;
      correctOptionId = response.body.options.find((o: any) => o.isCorrect).id;
      wrongOptionId = response.body.options.find((o: any) => !o.isCorrect).id;
    });

    it('FR-8.3: GET /api/quizzes/:id as Student -> should sanitize options (hide isCorrect)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/quizzes/${testQuizId}`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testQuizId);
      expect(response.body.questions.length).toBeGreaterThanOrEqual(1);
      // Student cannot see isCorrect property
      expect(response.body.questions[0].options[0]).not.toHaveProperty('isCorrect');
    });

    it('FR-8.4: POST /api/quizzes/:id/submit with wrong answer -> should fail passScore', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/quizzes/${testQuizId}/submit`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          answers: [{ questionId: testQuestionId, selectedOptionId: wrongOptionId }],
        })
        .expect(201);

      expect(response.body.isPassed).toBe(false);
      expect(response.body.score).toBe(0);
    });

    it('FR-8.5: POST /api/quizzes/:id/submit with correct answer -> score >= 80% should pass & unlock lesson', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/quizzes/${testQuizId}/submit`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          answers: [{ questionId: testQuestionId, selectedOptionId: correctOptionId }],
        })
        .expect(201);

      expect(response.body.isPassed).toBe(true);
      expect(response.body.score).toBe(100);
      expect(response.body.correctAnswers).toBe(1);
    });
  });

  // ==========================================
  // 15. AUTOMATED ATTENDANCE FLOW (FR-09)
  // ==========================================
  describe('15. Automated Attendance Flow (FR-09)', () => {
    let testClassroomId: string;
    let attendanceRecordId: string;

    it('FR-9.1: POST /api/attendance/classrooms as Admin -> should schedule classroom', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/attendance/classrooms')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `ielts-live-session-${Date.now()}`,
          scheduledStartTime: '2026-11-08T19:30:00.000Z',
          scheduledEndTime: '2026-11-08T20:30:00.000Z',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      testClassroomId = response.body.id;
    });

    it('FR-9.2: GET /api/attendance/classrooms as Admin -> should list classrooms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/attendance/classrooms')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('FR-9.3: PUT /api/attendance/:id/override as Admin -> should manually override status with note', async () => {
      // First ensure an attendance record exists in mock
      const rec = await mockPrisma.attendanceRecord.upsert({
        where: {
          classroomId_studentId: {
            classroomId: testClassroomId,
            studentId: 'student-uuid-1',
          },
        },
        create: {
          classroomId: testClassroomId,
          studentId: 'student-uuid-1',
          totalMinutes: 10,
          status: 'ABSENT',
        },
        update: {},
      });
      attendanceRecordId = rec.id;

      const response = await request(app.getHttpServer())
        .put(`/api/attendance/${attendanceRecordId}/override`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          status: 'PRESENT',
          note: 'Học viên có phép vì sự cố đường truyền mạng gia đình',
        })
        .expect(200);

      expect(response.body.status).toBe('PRESENT');
      expect(response.body.isManualOverride).toBe(true);
      expect(response.body.note).toContain('Học viên có phép');
    });

    it('FR-9.4: GET /api/attendance/classroom/:id/export as Admin -> should generate Excel report (.xlsx)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/attendance/classroom/${testClassroomId}/export`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .buffer(true)
        .expect(200);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain('.xlsx');
      expect(response.body).toBeDefined();
    });
  });

  // ==========================================
  // 16. DASHBOARD & ANALYTICS FLOW (FR-10)
  // ==========================================
  describe('16. Dashboard & Analytics Flow (FR-10)', () => {
    it('FR-10.1: GET /api/dashboard/student as Student -> should return learning overview & upcoming events', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/student')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('overview');
      expect(response.body.overview).toHaveProperty('enrolledCoursesCount');
      expect(response.body.overview).toHaveProperty('averageProgress');
      expect(response.body).toHaveProperty('recentCourses');
      expect(Array.isArray(response.body.recentCourses)).toBeTruthy();
      expect(response.body).toHaveProperty('upcomingClassrooms');
      expect(response.body).toHaveProperty('recentWriting');
      expect(response.body).toHaveProperty('recentSpeaking');
      expect(response.body).toHaveProperty('attendanceSummary');
      expect(response.body.attendanceSummary).toHaveProperty('present');
    });

    it('FR-10.2: GET /api/dashboard/student as Unauthenticated -> should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/student')
        .expect(401);
    });

    it('FR-10.3: GET /api/dashboard/admin as Student -> should be forbidden (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(403);
    });

    it('FR-10.4: GET /api/dashboard/admin as Admin -> should return academy metrics, action items, and live classrooms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('totalStudents');
      expect(response.body.metrics).toHaveProperty('totalCourses');
      expect(response.body).toHaveProperty('actionItems');
      expect(response.body.actionItems).toHaveProperty('pendingWritingApprovals');
      expect(response.body.actionItems).toHaveProperty('pendingSpeakingGradings');
      expect(response.body).toHaveProperty('attendanceOverview');
      expect(response.body).toHaveProperty('recentStudents');
      expect(Array.isArray(response.body.recentStudents)).toBeTruthy();
      expect(response.body).toHaveProperty('recentSubmissions');
    });
  });

  // ==========================================
  // 17. REALTIME CHAT & MESSAGING FLOW (FR-11)
  // ==========================================
  describe('17. Realtime Chat & Messaging Flow (FR-11)', () => {
    let studentConversationId: string;

    it('FR-11.1: GET /api/chat/conversations as Student -> should return or auto-create conversation with Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      const conv = response.body[0];
      expect(conv).toHaveProperty('id');
      expect(conv).toHaveProperty('studentId');
      expect(conv).toHaveProperty('adminId');
      studentConversationId = conv.id;
    });

    it('FR-11.2: POST /api/chat/conversations/:id/messages as Student -> should send message to Admin', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/chat/conversations/${studentConversationId}/messages`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          content: 'Thầy Dong ơi, em muốn hỏi bài tập Writing Task 2 nộp trước mấy giờ ạ?',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toContain('Writing Task 2');
      expect(response.body.isRead).toBe(false);
      expect(response.body.sender.role).toBe('STUDENT');
    });

    it('FR-11.3: GET /api/chat/conversations/:id/messages as Student -> should retrieve message history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/chat/conversations/${studentConversationId}/messages`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(response.body.messages)).toBeTruthy();
      expect(
        response.body.messages.some((m: any) => m.content.includes('Writing Task 2')),
      ).toBeTruthy();
    });

    it('FR-11.4: GET /api/chat/conversations as Admin -> should see student conversation with unread count', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      const targetConv = response.body.find((c: any) => c.id === studentConversationId);
      expect(targetConv).toBeDefined();
      expect(targetConv.unreadCount).toBeGreaterThanOrEqual(1);
    });

    it('FR-11.5: POST /api/chat/conversations/:id/messages as Admin -> should reply to student', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/chat/conversations/${studentConversationId}/messages`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          content: 'Chào em, bài tập nộp trước 22:00 tối nay nhé em!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toContain('22:00');
      expect(response.body.sender.role).toBe('ADMIN');
    });

    it('FR-11.6: PUT /api/chat/conversations/:id/read as Student -> should mark received admin messages as read', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/chat/conversations/${studentConversationId}/read`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('conversationId', studentConversationId);
      expect(response.body).toHaveProperty('markedCount');
      expect(response.body.markedCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 18. USER & STUDENT MANAGEMENT FLOW (FR-12)
  // ==========================================
  describe('18. User & Student Management Flow (FR-12)', () => {
    it('FR-12.1: GET /api/users as Student -> should be forbidden (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(403);
    });

    it('FR-12.2: GET /api/users as Admin -> should list students with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?role=STUDENT')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0]).toHaveProperty('role', 'STUDENT');
    });

    it('FR-12.3: GET /api/users/:id as Admin -> should return student full learning profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/student-uuid-1')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 'student-uuid-1');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('enrollments');
      expect(response.body).toHaveProperty('attendanceRecords');
    });

    it('FR-12.4: PUT /api/users/:id/status as Admin -> should toggle student isActive status', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/users/student-uuid-1/status')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ isActive: true })
        .expect(200);

      expect(response.body).toHaveProperty('isActive', true);
    });

    it('FR-12.5: PUT /api/users/:id/reset-password as Admin -> should reset student password', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/users/student-uuid-1/reset-password')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ newPassword: 'NewPassword@2026' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('userId', 'student-uuid-1');
    });

    it('FR-12.6: Login with newly reset password -> should succeed', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'student@englishweb.com',
          password: 'NewPassword@2026',
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('role', 'STUDENT');
      expect(response.body).toHaveProperty('accessToken');
    });
  });

  // ==========================================
  // 19. GOOGLE GEMINI AI WRITING PIPELINE
  // ==========================================
  describe('19. Google Gemini AI IELTS Writing Evaluation Flow', () => {
    it('FR-19.1: Student submits essay -> triggers Gemini AI evaluation with 4 IELTS criteria & C1/C2 suggestions', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/writing/submissions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          promptId: 'writing-prompt-uuid-1',
          content: 'In modern society, technological advancement has engendered notable transformation. Furthermore, remote instruction offers substantial flexibility for students across disparate geographical regions.',
          timeSpentSeconds: 1200,
        })
        .expect(201);

      expect(response.body).toHaveProperty('submission');
      const sub = response.body.submission;
      expect(sub).toHaveProperty('taskAchievementScore');
      expect(sub).toHaveProperty('coherenceCohesionScore');
      expect(sub).toHaveProperty('lexicalResourceScore');
      expect(sub).toHaveProperty('grammarScore');
      expect(sub).toHaveProperty('overallBand');
      expect(sub).toHaveProperty('aiFeedback');
      expect(sub).toHaveProperty('aiSuggestions');
      expect(Array.isArray(sub.aiSuggestions)).toBeTruthy();
      expect(sub.aiSuggestions.length).toBeGreaterThanOrEqual(1);
      expect(sub).toHaveProperty('sampleBand8Essay');
    });
  });

  // ==========================================
  // 20. 2-WAY INTERACTIVE WHITEBOARD SYNCHRONIZATION (FR-05)
  // ==========================================
  describe('20. 2-Way Interactive Whiteboard Synchronization Flow (FR-05)', () => {
    const roomName = 'Classroom-IELTS-Whiteboard-Test';

    it('FR-20.1: GET /api/livekit/rooms/:roomName/whiteboard -> returns initial snapshot', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/livekit/rooms/${roomName}/whiteboard`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('roomName', roomName);
      expect(response.body).toHaveProperty('allowStudentDrawing', false);
      expect(response.body).toHaveProperty('strokes');
      expect(Array.isArray(response.body.strokes)).toBeTruthy();
      expect(response.body.strokes.length).toBe(0);
    });

    it('FR-20.2: POST stroke as Student when allowStudentDrawing is false -> should return 403 (MSG-CLASS-005)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/livekit/rooms/${roomName}/whiteboard/stroke`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          tool: 'pen',
          color: '#0284c7',
          size: 3,
          points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
        })
        .expect(403);

      expect(response.body.message).toContain('Bạn chưa được cấp quyền thao tác bảng trắng');
    });

    it('FR-20.3: POST /api/livekit/rooms/:roomName/whiteboard/permission as Admin -> grant student drawing', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/livekit/rooms/${roomName}/whiteboard/permission`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ allowStudentDrawing: true })
        .expect(200);

      expect(response.body).toHaveProperty('allowStudentDrawing', true);
    });

    it('FR-20.4: POST stroke as Student after permission granted -> succeeds', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/livekit/rooms/${roomName}/whiteboard/stroke`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          tool: 'pen',
          color: '#0284c7',
          size: 3,
          points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('stroke');
      expect(response.body.stroke).toHaveProperty('tool', 'pen');
    });

    it('FR-20.5: POST stroke as Admin (Host) -> succeeds unconditionally', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/livekit/rooms/${roomName}/whiteboard/stroke`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          tool: 'text',
          color: '#ef4444',
          size: 16,
          text: 'Welcome to IELTS Class with Teacher Dong',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.stroke).toHaveProperty('text', 'Welcome to IELTS Class with Teacher Dong');
    });

    it('FR-20.6: GET whiteboard snapshot -> reflects both strokes', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/livekit/rooms/${roomName}/whiteboard`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body.strokes.length).toBe(2);
      expect(response.body.allowStudentDrawing).toBe(true);
    });

    it('FR-20.7: POST /api/livekit/rooms/:roomName/whiteboard/clear -> clears whiteboard', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/livekit/rooms/${roomName}/whiteboard/clear`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      const check = await request(app.getHttpServer())
        .get(`/api/livekit/rooms/${roomName}/whiteboard`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(check.body.strokes.length).toBe(0);
    });
  });

  // ==========================================
  // 21. CLOUDINARY MEDIA STORAGE FLOW
  // ==========================================
  describe('21. Cloudinary Media Storage Flow', () => {
    it('FR-21.1: POST /api/media/upload/image -> uploads image to Cloudinary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/media/upload/image')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', Buffer.from('fake image binary content'), 'test-avatar.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('secureUrl');
      expect(response.body.secureUrl).toContain('cloudinary.com');
      expect(response.body).toHaveProperty('publicId');
      expect(response.body).toHaveProperty('resourceType', 'image');
    });

    it('FR-21.2: POST /api/media/upload/video -> uploads video to Cloudinary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/media/upload/video')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', Buffer.from('fake video binary content'), 'test-video.mp4')
        .expect(201);

      expect(response.body).toHaveProperty('secureUrl');
      expect(response.body.secureUrl).toContain('cloudinary.com');
      expect(response.body).toHaveProperty('resourceType', 'video');
    });

    it('FR-21.3: POST /api/users/:id/avatar -> updates user avatar via Cloudinary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/student-uuid-1/avatar')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', Buffer.from('new avatar binary data'), 'avatar.png')
        .expect(201);

      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toContain('cloudinary.com');
    });

    it('FR-21.4: POST /api/courses/:id/thumbnail -> updates course thumbnail via Cloudinary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/courses/course-uuid-1/thumbnail')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', Buffer.from('course thumbnail binary data'), 'thumbnail.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('thumbnail');
      expect(response.body.thumbnail).toContain('cloudinary.com');
    });

    it('FR-21.5: POST /api/lessons/:id/video -> updates lesson video via Cloudinary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/lessons/lesson-uuid-1/video')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('file', Buffer.from('lesson video binary data'), 'lesson.mp4')
        .expect(201);

      expect(response.body).toHaveProperty('videoUrl');
      expect(response.body.videoUrl).toContain('cloudinary.com');
    });
  });

  // ==========================================
  // 22. BLOGS MODULE WITH CLOUDINARY MEDIA (FR-13)
  // ==========================================
  describe('22. Blogs Module with Cloudinary Media Flow (FR-13)', () => {
    let createdBlogId: string;
    let createdBlogSlug: string;

    it('FR-22.1: POST /api/blogs as Student -> should be forbidden (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/blogs')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          title: 'Student Attempting Blog Creation',
          content: 'This should be blocked',
        })
        .expect(403);
    });

    it('FR-22.2: POST /api/blogs as Admin -> creates new blog with Cloudinary media & slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/blogs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .field('title', 'Bi quyet dat 8.0 IELTS Writing Task 2')
        .field('summary', 'Huong dan chi tiet cach viet mo bai, than bai va ket bai theo tieu chuan Cambridge.')
        .field('content', '## 1. Phan tich de\nDe thi yeu cau...')
        .field('category', 'IELTS Writing')
        .field('tags', 'ielts,writing,band8')
        .field('status', 'PUBLISHED')
        .field('isFeatured', 'true')
        .attach('coverImage', Buffer.from('blog cover image data'), 'cover.jpg')
        .attach('video', Buffer.from('blog explanation video data'), 'video.mp4')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Bi quyet dat 8.0 IELTS Writing Task 2');
      expect(response.body).toHaveProperty('slug');
      expect(response.body).toHaveProperty('coverImage');
      expect(response.body.coverImage).toContain('cloudinary.com');
      expect(response.body).toHaveProperty('videoUrl');
      expect(response.body.videoUrl).toContain('cloudinary.com');
      expect(response.body).toHaveProperty('status', 'PUBLISHED');

      createdBlogId = response.body.id;
      createdBlogSlug = response.body.slug;
    });

    it('FR-22.3: GET /api/blogs as Public / Student -> lists published blogs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/blogs?category=IELTS Writing')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0]).toHaveProperty('title');
      expect(response.body.items[0]).toHaveProperty('coverImage');
    });

    it('FR-22.4: GET /api/blogs/:slugOrId -> returns blog details and increments viewCount', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/blogs/${createdBlogSlug}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdBlogId);
      expect(response.body).toHaveProperty('viewCount');
      expect(response.body.viewCount).toBeGreaterThanOrEqual(1);
      expect(response.body).toHaveProperty('author');
      expect(response.body.author).toHaveProperty('fullName');
    });

    it('FR-22.5: PUT /api/blogs/:id as Admin -> updates blog fields', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/blogs/${createdBlogId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Bi quyet dat 8.5 IELTS Writing Task 2 (Updated)',
          isFeatured: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Bi quyet dat 8.5 IELTS Writing Task 2 (Updated)');
      expect(response.body).toHaveProperty('isFeatured', true);
    });

    it('FR-22.6: DELETE /api/blogs/:id as Admin -> deletes blog', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/blogs/${createdBlogId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
