import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('English Learning LMS & WebRTC E2E Test Suite', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let studentAccessToken: string;
  let testRefreshToken: string;
  let registeredStudentEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    it('/api (GET) should return 200 and greeting', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('Hello World!');
    });
  });

  // ==========================================
  // 2. AUTHENTICATION & 2-ROLES RBAC FLOW
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

    it('FR-1.2: Login as Seeded Admin -> should return role ADMIN', async () => {
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

    it('FR-1.2: GET /api/auth/me -> Authenticated profile check', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', 'student@englishweb.com');
      expect(response.body).toHaveProperty('role', 'STUDENT');
    });

    it('FR-1.2: GET /api/auth/me without token should return 401', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('FR-1.2: Refresh Token Rotation -> should revoke old token and return new tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: testRefreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.refreshToken).not.toBe(testRefreshToken);

      // Re-using the old revoked refresh token should now fail
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: testRefreshToken })
        .expect(401);
    });

    it('FR-1.2: Logout -> should revoke token and clear cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({ refreshToken: testRefreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.includes('access_token=;'))).toBeTruthy();
    });
  });

  // ==========================================
  // 3. LIVEKIT WEBRTC CLASSROOM & RBAC FLOW
  // ==========================================
  describe('3. LiveKit WebRTC Token & Host Controls Flow', () => {
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

      // Successfully processed by admin handler
      expect(response.body).toHaveProperty('success');
    });
  });

  // ==========================================
  // 4. LIVEKIT WEBHOOK & ATTENDANCE FLOW
  // ==========================================
  describe('4. LiveKit Webhook Attendance Flow', () => {
    it('FR-6.1: Webhook endpoint should be reachable', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/livekit/webhook')
        .send({ event: 'test' })
        .expect(201);

      expect(response.body).toBeDefined();
    });
  });
});
