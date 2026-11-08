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
});
