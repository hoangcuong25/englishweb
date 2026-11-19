import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';
import { MockPrismaService } from './mock-prisma.service';

describe('Blog & Media Content Management E2E Suite (FR-12)', () => {
  let app: INestApplication;
  let mockPrisma: MockPrismaService;

  let adminAccessToken: string;
  let studentAccessToken: string;

  let createdPublishedPostId: string;
  let createdPublishedPostSlug: string;
  let createdDraftPostId: string;
  let createdDraftPostSlug: string;

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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('1. POST /api/blogs - Create Blog Post', () => {
    it('should fail with 401 if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/blogs')
        .send({
          title: 'Chiến thuật IELTS Writing Task 2 Band 8.0',
          content: 'Nội dung hướng dẫn chi tiết cách viết mở bài và thân bài.',
        })
        .expect(401);
    });

    it('should fail with 403 if authenticated as STUDENT', async () => {
      await request(app.getHttpServer())
        .post('/api/blogs')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          title: 'Chiến thuật IELTS Writing Task 2 Band 8.0',
          content: 'Nội dung hướng dẫn chi tiết cách viết mở bài và thân bài.',
        })
        .expect(403);
    });

    it('should fail with 400 if required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/blogs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          // missing title and content
          category: 'IELTS Writing',
        })
        .expect(400);
    });

    it('should allow ADMIN to create a PUBLISHED blog post', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/blogs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Bí Quyết Chinh Phục IELTS Writing Task 1 & 2',
          summary: 'Tổng hợp lộ trình và phương pháp phân tích dạng bài Writing cho học viên.',
          content: '## Giới thiệu\nLuyện viết IELTS yêu cầu sự kiên trì.\n![Hình minh họa](https://res.cloudinary.com/demo/image/upload/sample.jpg)',
          category: 'IELTS Writing',
          tags: 'ielts, writing, tips, band8',
          status: 'PUBLISHED',
          isFeatured: true,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Bí Quyết Chinh Phục IELTS Writing Task 1 & 2');
      expect(res.body.slug).toContain('bi-quyet-chinh-phuc-ielts-writing-task-1-2');
      expect(res.body.status).toBe('PUBLISHED');
      expect(res.body.viewCount).toBe(0);

      createdPublishedPostId = res.body.id;
      createdPublishedPostSlug = res.body.slug;
    });

    it('should allow ADMIN to create a DRAFT blog post', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/blogs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Bản Nháp Phương Pháp Luyện Nói Shadowing',
          summary: 'Bản thảo đang biên soạn, chưa xuất bản công khai.',
          content: 'Nội dung bản nháp dành cho giáo viên kiểm duyệt.',
          category: 'IELTS Speaking',
          status: 'DRAFT',
          isFeatured: false,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('DRAFT');

      createdDraftPostId = res.body.id;
      createdDraftPostSlug = res.body.slug;
    });
  });

  describe('2. GET /api/blogs - List Blog Posts', () => {
    it('should return published posts for public guest/student', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/blogs')
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);

      // Verify that all returned posts for public are PUBLISHED
      for (const post of res.body.items) {
        expect(post.status).toBe('PUBLISHED');
      }
    });

    it('should filter posts by category', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/blogs?category=IELTS%20Writing')
        .expect(200);

      for (const post of res.body.items) {
        expect(post.category).toBe('IELTS Writing');
      }
    });

    it('should filter posts by search query keyword', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/blogs?search=Chinh%20Phục')
        .expect(200);

      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.items[0].title).toContain('Chinh Phục');
    });

    it('should allow ADMIN to view draft posts by query status=DRAFT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/blogs?status=DRAFT')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.items.some((p: any) => p.id === createdDraftPostId)).toBe(true);
    });
  });

  describe('3. GET /api/blogs/:slugOrId - View Blog Detail & Increment ViewCount', () => {
    it('should view published post by slug and auto-increment viewCount', async () => {
      // First read: viewCount should become 1
      const res1 = await request(app.getHttpServer())
        .get(`/api/blogs/${createdPublishedPostSlug}`)
        .expect(200);

      expect(res1.body.id).toBe(createdPublishedPostId);
      expect(res1.body.viewCount).toBe(1);

      // Second read: viewCount should become 2
      const res2 = await request(app.getHttpServer())
        .get(`/api/blogs/${createdPublishedPostId}`)
        .expect(200);

      expect(res2.body.viewCount).toBe(2);
    });

    it('should return 404 when public student requests non-existent post', async () => {
      await request(app.getHttpServer())
        .get('/api/blogs/non-existent-blog-slug-404')
        .expect(404);
    });

    it('should return 404 when public student attempts to read DRAFT post', async () => {
      await request(app.getHttpServer())
        .get(`/api/blogs/${createdDraftPostSlug}`)
        .expect(404);
    });

    it('should allow ADMIN to read DRAFT post', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/blogs/${createdDraftPostSlug}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdDraftPostId);
      expect(res.body.status).toBe('DRAFT');
    });
  });

  describe('4. PUT /api/blogs/:id - Update Blog Post', () => {
    it('should fail with 403 if STUDENT attempts to update', async () => {
      await request(app.getHttpServer())
        .put(`/api/blogs/${createdPublishedPostId}`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          title: 'Học viên sửa trộm bài viết',
        })
        .expect(403);
    });

    it('should allow ADMIN to update blog content and promote DRAFT to PUBLISHED', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/blogs/${createdDraftPostId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          title: 'Phương Pháp Luyện Nói Shadowing Chuẩn Quốc Tế',
          status: 'PUBLISHED',
          isFeatured: true,
        })
        .expect(200);

      expect(res.body.title).toBe('Phương Pháp Luyện Nói Shadowing Chuẩn Quốc Tế');
      expect(res.body.status).toBe('PUBLISHED');
      expect(res.body.isFeatured).toBe(true);
    });
  });

  describe('5. DELETE /api/blogs/:id - Delete Blog Post', () => {
    it('should fail with 403 if STUDENT attempts to delete', async () => {
      await request(app.getHttpServer())
        .delete(`/api/blogs/${createdPublishedPostId}`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .expect(403);
    });

    it('should allow ADMIN to delete blog post', async () => {
      await request(app.getHttpServer())
        .delete(`/api/blogs/${createdDraftPostId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      // Verify it no longer exists
      await request(app.getHttpServer())
        .get(`/api/blogs/${createdDraftPostId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});
