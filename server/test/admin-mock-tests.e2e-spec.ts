import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { MockPrismaService } from './mock-prisma.service';
import { Role, SkillType } from '@prisma/client';

describe('Admin Mock Tests Management & Automated Evaluation E2E Suite', () => {
  let app: INestApplication;
  let mockPrisma: MockPrismaService;

  let adminAccessToken: string;
  let studentAccessToken: string;
  let studentUserId: string;

  let createdReadingMockTestId: string;
  let createdListeningMockTestId: string;
  let createdReadingQ1Id: string;
  let createdReadingQ1OptionCorrectId: string;
  let createdReadingQ2Id: string;
  let createdReadingQ2OptionCorrectId: string;

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

    // Authenticate Admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@englishweb.com',
        password: 'Admin@123456',
      })
      .expect(200);

    adminAccessToken = adminLoginRes.body.accessToken;

    // Authenticate Student
    const studentLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'student@englishweb.com',
        password: 'Student@123456',
      })
      .expect(200);

    studentAccessToken = studentLoginRes.body.accessToken;
    studentUserId = studentLoginRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================
  // 1. RBAC & SECURITY CHECKS FOR MOCK TESTS
  // ==========================================
  describe('1. Role-Based Access Control (RBAC) Enforcement', () => {
    it('Student should be forbidden (403) from creating a Mock Test', async () => {
      await request(app.getHttpServer())
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          title: 'Unauthorized Student Quiz Creation',
          skill: 'READING',
          testType: 'FULL_MOCK_TEST',
        })
        .expect(403);
    });

    it('Student should be forbidden (403) from updating a Mock Test', async () => {
      await request(app.getHttpServer())
        .put('/api/quizzes/mock-reading-cambridge-academic')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          title: 'Hacked Title by Student',
        })
        .expect(403);
    });

    it('Student should be forbidden (403) from deleting a Mock Test', async () => {
      await request(app.getHttpServer())
        .delete('/api/quizzes/mock-reading-cambridge-academic')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(403);
    });

    it('Student should be forbidden (403) from adding questions to a Mock Test', async () => {
      await request(app.getHttpServer())
        .post('/api/quizzes/mock-reading-cambridge-academic/questions')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          content: 'Illegal question from student',
          skill: 'READING',
          options: [{ content: 'Option A', isCorrect: true }],
        })
        .expect(403);
    });

    it('Unauthenticated user should be rejected (401) on admin quizzes list', async () => {
      await request(app.getHttpServer())
        .get('/api/quizzes')
        .expect(401);
    });
  });

  // ==========================================
  // 2. ADMIN CREATES IELTS READING MOCK TEST
  // ==========================================
  describe('2. Admin Creates IELTS Academic Reading Mock Test', () => {
    it('Admin creates a new Full Reading Mock Test with academic passage and 60-min timer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'IELTS Academic Reading Mock Test 2026: Sustainable Urban Ecology',
          description: 'Official Cambridge standard Reading Full Mock Test covering biophilic urbanism and carbon neutrality.',
          skill: SkillType.READING,
          testType: 'FULL_MOCK_TEST',
          timeLimitMinutes: 60,
          passScore: 80,
          passage: 'READING PASSAGE 1: Over the past two decades, urban development paradigms have shifted towards environmental sustainability...',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('IELTS Academic Reading Mock Test 2026: Sustainable Urban Ecology');
      expect(res.body.skill).toBe(SkillType.READING);
      expect(res.body.testType).toBe('FULL_MOCK_TEST');
      expect(res.body.timeLimitMinutes).toBe(60);
      expect(res.body.passScore).toBe(80);
      expect(res.body.passage).toContain('READING PASSAGE 1');

      createdReadingMockTestId = res.body.id;
    });

    it('Admin adds Question 1 (Matching Headings) to the newly created Reading Mock Test', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/quizzes/${createdReadingMockTestId}/questions`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          content: 'Which heading corresponds to the main idea of Paragraph A?',
          skill: SkillType.READING,
          type: 'MATCHING_HEADINGS',
          explanation: 'Đoạn A tập trung trình bày những áp lực môi trường và khái niệm kiến trúc sinh thái (biophilic urbanism).',
          points: 1.0,
          options: [
            { content: 'i. Financial obstacles and equity challenges in green architecture', isCorrect: false },
            { content: 'ii. Urgent environmental pressures driving biological city planning', isCorrect: true },
            { content: 'iii. Maintenance hurdles and water system mechanics', isCorrect: false },
            { content: 'iv. Historical demolition of industrial districts', isCorrect: false },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toContain('Which heading corresponds to the main idea of Paragraph A?');
      expect(res.body.options).toHaveLength(4);

      createdReadingQ1Id = res.body.id;
      const correctOpt = res.body.options.find((o: any) => o.isCorrect === true);
      expect(correctOpt).toBeDefined();
      createdReadingQ1OptionCorrectId = correctOpt.id;
    });

    it('Admin adds Question 2 (True/False/Not Given) to the Reading Mock Test', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/quizzes/${createdReadingMockTestId}/questions`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          content: 'The Bosco Verticale towers absorb approximately thirty tons of carbon dioxide per year.',
          skill: SkillType.READING,
          type: 'TRUE_FALSE_NOT_GIVEN',
          explanation: 'Đoạn B khẳng định tán lá hấp thụ khoảng 30 tấn CO2 hàng năm -> TRUE.',
          points: 1.0,
          options: [
            { content: 'TRUE', isCorrect: true },
            { content: 'FALSE', isCorrect: false },
            { content: 'NOT GIVEN', isCorrect: false },
          ],
        })
        .expect(201);

      expect(res.body.content).toContain('Bosco Verticale');
      expect(res.body.options).toHaveLength(3);

      createdReadingQ2Id = res.body.id;
      const correctOpt = res.body.options.find((o: any) => o.isCorrect === true);
      expect(correctOpt).toBeDefined();
      createdReadingQ2OptionCorrectId = correctOpt.id;
    });
  });

  // ==========================================
  // 3. ADMIN CREATES IELTS LISTENING MOCK TEST & BULK QUESTIONS
  // ==========================================
  describe('3. Admin Creates IELTS Listening Mock Test & Bulk Questions', () => {
    it('Admin creates IELTS Listening Mock Test with Cloudinary Audio URL and 30-min timer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'IELTS Listening Full Mock Test: University Student Orientation & Facilities Registration',
          description: 'Official Listening Mock Test with 4 sections: Campus registration, library tour, research project review.',
          skill: SkillType.LISTENING,
          testType: 'FULL_MOCK_TEST',
          timeLimitMinutes: 30,
          passScore: 80,
          audioUrl: 'https://res.cloudinary.com/englishacademy/video/upload/ielts_mock_listening_full.mp3',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.skill).toBe(SkillType.LISTENING);
      expect(res.body.audioUrl).toBe('https://res.cloudinary.com/englishacademy/video/upload/ielts_mock_listening_full.mp3');

      createdListeningMockTestId = res.body.id;
    });

    it('Admin adds bulk questions to the Listening Mock Test', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/quizzes/${createdListeningMockTestId}/questions/bulk`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          questions: [
            {
              content: 'What is the full surname of the student registering at reception?',
              skill: SkillType.LISTENING,
              type: 'NOTE_COMPLETION',
              explanation: 'Người đăng ký phát âm rõ họ của mình là Westlake.',
              points: 1.0,
              options: [{ content: 'Westlake', isCorrect: true }],
            },
            {
              content: 'What room number is assigned for the introductory academic seminar?',
              skill: SkillType.LISTENING,
              type: 'NOTE_COMPLETION',
              explanation: 'Lễ khai mạc diễn ra tại hội trường Room 402B.',
              points: 1.0,
              options: [{ content: '402B', isCorrect: true }],
            },
          ],
        })
        .expect(201);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });
  });

  // ==========================================
  // 4. ADMIN CATALOG LISTING & FILTERING
  // ==========================================
  describe('4. Admin Catalog Listing, Search & Filters', () => {
    it('Admin lists all quizzes with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes?page=1&limit=20')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body.total).toBeGreaterThanOrEqual(4);
    });

    it('Admin filters quizzes by skill READING', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes?skill=READING')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      res.body.items.forEach((item: any) => {
        expect(item.skill).toBe(SkillType.READING);
      });
    });

    it('Admin filters quizzes by testType FULL_MOCK_TEST', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes?testType=FULL_MOCK_TEST')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      res.body.items.forEach((item: any) => {
        expect(item.testType).toBe('FULL_MOCK_TEST');
      });
    });

    it('Admin searches quizzes by keyword "Ecology"', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quizzes?search=Ecology')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.items[0].title).toContain('Sustainable Urban Ecology');
    });
  });

  // ==========================================
  // 5. ADMIN UPDATES MOCK TEST METADATA
  // ==========================================
  describe('5. Admin Updates Mock Test Metadata', () => {
    it('Admin updates Mock Test title and adjusts timeLimitMinutes to 65 mins', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/quizzes/${createdReadingMockTestId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'IELTS Academic Reading Mock Test 2026: Sustainable Urban Ecology (Updated Edition)',
          timeLimitMinutes: 65,
          passScore: 85,
        })
        .expect(200);

      expect(res.body.title).toContain('(Updated Edition)');
      expect(res.body.timeLimitMinutes).toBe(65);
      expect(res.body.passScore).toBe(85);
    });
  });

  // ==========================================
  // 6. STUDENT TAKES THE NEWLY CREATED MOCK TEST
  // ==========================================
  describe('6. Student Taking Newly Created Mock Test & Auto-Grading', () => {
    it('Student retrieves Mock Test details -> Correct answer flags (isCorrect) MUST be stripped', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/quizzes/${createdReadingMockTestId}`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      const quiz = res.body;
      expect(quiz.id).toBe(createdReadingMockTestId);
      expect(quiz.title).toContain('(Updated Edition)');
      expect(quiz.questions.length).toBeGreaterThanOrEqual(2);

      // Verify strict security sanitization: no student can see `isCorrect`
      quiz.questions.forEach((q: any) => {
        if (q.options) {
          q.options.forEach((opt: any) => {
            expect(opt.isCorrect).toBeUndefined();
          });
        }
      });
    });

    it('Student submits answers to the new Reading Mock Test -> Auto-graded 100% and PASSED', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/quizzes/${createdReadingMockTestId}/submit`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          answers: [
            {
              questionId: createdReadingQ1Id,
              selectedOptionId: createdReadingQ1OptionCorrectId,
            },
            {
              questionId: createdReadingQ2Id,
              selectedOptionId: createdReadingQ2OptionCorrectId,
            },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('score');
      expect(res.body.score).toBe(100);
      expect(res.body.isPassed).toBe(true);
      expect(res.body).toHaveProperty('submissionId');
    });

    it('Student reviews previous submission history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/quizzes/${createdReadingMockTestId}/my-submissions`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].isPassed).toBe(true);
    });
  });

  // ==========================================
  // 7. ADMIN DELETES MOCK TEST
  // ==========================================
  describe('7. Admin Deletes Mock Test', () => {
    it('Admin deletes the Listening Mock Test', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/quizzes/${createdListeningMockTestId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdListeningMockTestId);
    });

    it('Subsequent query for the deleted Mock Test should return 404 Not Found', async () => {
      await request(app.getHttpServer())
        .get(`/api/quizzes/${createdListeningMockTestId}`)
        .expect(404);
    });
  });
});
