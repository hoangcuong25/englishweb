import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role, Language } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class MockPrismaService {
  public users: any[] = [];
  public refreshTokens: any[] = [];
  public googleAccounts: any[] = [];
  public classrooms: any[] = [];
  public attendanceRecords: any[] = [];
  public courses: any[] = [];
  public courseModules: any[] = [];
  public lessons: any[] = [];
  public materials: any[] = [];
  public enrollments: any[] = [];
  public lessonProgresses: any[] = [];
  public writingPrompts: any[] = [];
  public writingSubmissions: any[] = [];
  public speakingPrompts: any[] = [];
  public speakingSubmissions: any[] = [];
  public quizzes: any[] = [];
  public questions: any[] = [];
  public questionOptions: any[] = [];
  public quizSubmissions: any[] = [];
  public quizAnswers: any[] = [];
  public conversations: any[] = [];
  public messages: any[] = [];

  constructor() {
    this.seedInitialData();
  }

  private async seedInitialData() {
    const adminHash = bcrypt.hashSync('Admin@123456', 10);
    const studentHash = bcrypt.hashSync('Student@123456', 10);

    const adminUser = {
      id: 'admin-uuid-1',
      email: 'admin@englishweb.com',
      passwordHash: adminHash,
      fullName: 'Teacher & Admin Master',
      phone: '0987654321',
      role: Role.ADMIN,
      isActive: true,
      avatarUrl: null,
      preferredLang: Language.VI,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const studentUser = {
      id: 'student-uuid-1',
      email: 'student@englishweb.com',
      passwordHash: studentHash,
      fullName: 'Nguyen Thi Mai',
      phone: '0912345678',
      role: Role.STUDENT,
      isActive: true,
      avatarUrl: null,
      preferredLang: Language.VI,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(adminUser, studentUser);

    this.classrooms.push({
      id: 'room-uuid-1',
      name: 'ielts-masterclass-live',
      hostId: adminUser.id,
      scheduledStartTime: new Date(),
      scheduledEndTime: new Date(Date.now() + 3600000),
      status: 'SCHEDULED',
      createdAt: new Date(),
    });

    const sampleCourse = {
      id: 'course-uuid-1',
      title: 'IELTS Intensive Band 6.5 -> 7.5+ Masterclass',
      slug: 'ielts-masterclass',
      description: 'Chương trình luyện thi IELTS chuyên sâu',
      category: 'IELTS',
      thumbnail: 'https://images.unsplash.com/sample.jpg',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courses.push(sampleCourse);

    const sampleModule = {
      id: 'module-uuid-1',
      courseId: sampleCourse.id,
      title: 'Module 1: IELTS Writing Task 1 & 2',
      description: 'Cấu trúc và phương pháp',
      orderIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courseModules.push(sampleModule);

    const sampleLesson = {
      id: 'lesson-uuid-1',
      moduleId: sampleModule.id,
      title: 'Lesson 1.1: Comprehensive Overview of Criteria',
      description: 'Chi tiết 4 tiêu chí',
      orderIndex: 1,
      durationMinutes: 45,
      videoUrl: 'https://cdn.englishweb.com/lesson1.mp4',
      isFreePreview: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.push(sampleLesson);

    const sampleMaterial = {
      id: 'material-uuid-1',
      lessonId: sampleLesson.id,
      title: 'IELTS_Writing_Task2_Masterclass_Band_8.pdf',
      type: 'PDF',
      fileKey: 'materials/ielts-writing-task2-guide.pdf',
      fileSize: 2048576,
      durationSeconds: null,
      isPrivate: true,
      isWatermarked: true,
      createdAt: new Date(),
    };
    this.materials.push(sampleMaterial);

    this.enrollments.push({
      id: 'enrollment-uuid-1',
      userId: studentUser.id,
      courseId: sampleCourse.id,
      progressPercent: 25.0,
      enrolledAt: new Date(),
    });

    const sampleWritingPrompt = {
      id: 'writing-prompt-uuid-1',
      lessonId: sampleLesson.id,
      title: 'IELTS Writing Task 2: Remote Work',
      taskType: 'TASK_2',
      topic: 'Some people believe that working remotely from home is better...',
      targetWords: 250,
      timeLimitMinutes: 40,
      sampleEssay: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.writingPrompts.push(sampleWritingPrompt);

    const sampleSpeakingPrompt = {
      id: 'speaking-prompt-uuid-1',
      lessonId: sampleLesson.id,
      title: 'Speaking Part 2: Describe a memorable journey',
      topic: 'Describe a memorable journey you have taken...',
      sampleAudioUrl: null,
      minSeconds: 30,
      maxSeconds: 120,
      createdAt: new Date(),
    };
    this.speakingPrompts.push(sampleSpeakingPrompt);

    const sampleQuiz = {
      id: 'quiz-uuid-1',
      lessonId: sampleLesson.id,
      title: 'Quick Assessment: Grammar & Cohesion',
      description: 'Bài kiểm tra nhanh',
      timeLimitMinutes: 10,
      passScore: 80,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quizzes.push(sampleQuiz);

    const sampleQ = {
      id: 'question-uuid-1',
      quizId: sampleQuiz.id,
      content: 'Which word indicates contrast?',
      type: 'SINGLE_CHOICE',
      points: 1.0,
      explanation: '"However" indicates contrast.',
      orderIndex: 1,
    };
    this.questions.push(sampleQ);

    this.questionOptions.push(
      { id: 'opt-1', questionId: sampleQ.id, content: 'However', isCorrect: true },
      { id: 'opt-2', questionId: sampleQ.id, content: 'Moreover', isCorrect: false },
    );
  }

  // --- USER REPOSITORY ---
  user = {
    findUnique: async (args: any) => {
      let found: any = null;
      if (args.where.email) {
        found = this.users.find((u) => u.email.toLowerCase() === args.where.email.toLowerCase());
      } else if (args.where.id) {
        found = this.users.find((u) => u.id === args.where.id);
      }
      if (!found) return null;

      const clone = { ...found };
      if (args.include?.googleAccount) {
        clone.googleAccount = this.googleAccounts.find((g) => g.userId === found.id) || null;
      }
      if (args.select) {
        const selected: any = {};
        for (const key of Object.keys(args.select)) {
          if (args.select[key]) {
            if (key === 'googleAccount') {
              selected.googleAccount = this.googleAccounts.find((g) => g.userId === found.id) || null;
            } else {
              selected[key] = clone[key];
            }
          }
        }
        return selected;
      }
      return clone;
    },

    findFirst: async (args?: any) => {
      let list = [...this.users];
      if (args?.where?.role) {
        list = list.filter((u) => u.role === args.where.role);
      }
      if (args?.where?.email) {
        list = list.filter((u) => u.email.toLowerCase() === args.where.email.toLowerCase());
      }
      if (args?.where?.id) {
        list = list.filter((u) => u.id === args.where.id);
      }
      return list[0] ? { ...list[0] } : null;
    },

    create: async (args: any) => {
      const newUser = {
        id: randomUUID(),
        email: args.data.email.toLowerCase(),
        passwordHash: args.data.passwordHash || null,
        fullName: args.data.fullName,
        phone: args.data.phone || null,
        role: args.data.role || Role.STUDENT,
        isActive: args.data.isActive ?? true,
        avatarUrl: args.data.avatarUrl || null,
        preferredLang: args.data.preferredLang || Language.VI,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (args.data.googleAccount?.create) {
        const gData = args.data.googleAccount.create;
        this.googleAccounts.push({
          id: randomUUID(),
          googleId: gData.googleId,
          email: gData.email,
          userId: newUser.id,
          avatarUrl: gData.avatarUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      this.users.push(newUser);

      if (args.select) {
        const selected: any = {};
        for (const key of Object.keys(args.select)) {
          if (args.select[key]) selected[key] = (newUser as any)[key];
        }
        return selected;
      }
      return { ...newUser };
    },

    update: async (args: any) => {
      const idx = this.users.findIndex((u) => u.id === args.where.id);
      if (idx === -1) throw new Error('User not found in mock');

      this.users[idx] = {
        ...this.users[idx],
        ...args.data,
        updatedAt: new Date(),
      };

      if (args.select) {
        const selected: any = {};
        for (const key of Object.keys(args.select)) {
          if (args.select[key]) selected[key] = (this.users[idx] as any)[key];
        }
        return selected;
      }
      return { ...this.users[idx] };
    },

    count: async (args?: any) => {
      let list = [...this.users];
      if (args?.where?.role) {
        list = list.filter((u) => u.role === args.where.role);
      }
      return list.length;
    },

    findMany: async (args?: any) => {
      let list = [...this.users];
      if (args?.where?.role) {
        list = list.filter((u) => u.role === args.where.role);
      }
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      if (args?.take) {
        list = list.slice(0, args.take);
      }
      if (args?.select) {
        return list.map((u) => {
          const res: any = {};
          for (const k of Object.keys(args.select)) {
            if (args.select[k]) res[k] = (u as any)[k];
          }
          return res;
        });
      }
      return list;
    },
  };

  // --- REFRESH TOKEN REPOSITORY ---
  refreshToken = {
    create: async (args: any) => {
      const newToken = {
        id: randomUUID(),
        token: args.data.token,
        userId: args.data.userId,
        deviceId: args.data.deviceId || null,
        ipAddress: args.data.ipAddress || null,
        userAgent: args.data.userAgent || null,
        isRevoked: false,
        expiresAt: args.data.expiresAt,
        revokedAt: null,
        createdAt: new Date(),
      };
      this.refreshTokens.push(newToken);
      return { ...newToken };
    },

    findUnique: async (args: any) => {
      const found = this.refreshTokens.find((t) => t.token === args.where.token);
      if (!found) return null;
      const clone = { ...found };
      if (args.include?.user) {
        clone.user = this.users.find((u) => u.id === found.userId);
      }
      return clone;
    },

    findFirst: async (args: any) => {
      const found = this.refreshTokens.find((t) => {
        let match = true;
        if (args.where.id && t.id !== args.where.id) match = false;
        if (args.where.userId && t.userId !== args.where.userId) match = false;
        return match;
      });
      return found ? { ...found } : null;
    },

    findMany: async (args: any) => {
      let list = this.refreshTokens.filter((t) => {
        if (args.where?.userId && t.userId !== args.where.userId) return false;
        if (args.where?.revokedAt === null && t.revokedAt !== null) return false;
        if (args.where?.expiresAt?.gt && t.expiresAt <= args.where.expiresAt.gt) return false;
        return true;
      });

      if (args.select) {
        return list.map((t) => {
          const res: any = {};
          for (const key of Object.keys(args.select)) {
            if (args.select[key]) res[key] = t[key];
          }
          return res;
        });
      }
      return list.map((t) => ({ ...t }));
    },

    update: async (args: any) => {
      const idx = this.refreshTokens.findIndex((t) => t.id === args.where.id);
      if (idx !== -1) {
        this.refreshTokens[idx] = { ...this.refreshTokens[idx], ...args.data };
        return { ...this.refreshTokens[idx] };
      }
      return null;
    },

    updateMany: async (args: any) => {
      let count = 0;
      this.refreshTokens.forEach((t, i) => {
        let match = true;
        if (args.where.userId && t.userId !== args.where.userId) match = false;
        if (args.where.token && t.token !== args.where.token) match = false;
        if (args.where.revokedAt === null && t.revokedAt !== null) match = false;

        if (match) {
          this.refreshTokens[i] = { ...this.refreshTokens[i], ...args.data };
          count++;
        }
      });
      return { count };
    },
  };

  // --- GOOGLE ACCOUNT REPOSITORY ---
  googleAccount = {
    findUnique: async (args: any) => {
      let found: any = null;
      if (args.where.googleId) {
        found = this.googleAccounts.find((g) => g.googleId === args.where.googleId);
      } else if (args.where.userId) {
        found = this.googleAccounts.find((g) => g.userId === args.where.userId);
      }
      if (!found) return null;
      const clone = { ...found };
      if (args.include?.user) {
        clone.user = this.users.find((u) => u.id === found.userId);
      }
      return clone;
    },

    create: async (args: any) => {
      const newAcc = {
        id: randomUUID(),
        googleId: args.data.googleId,
        email: args.data.email,
        userId: args.data.userId,
        avatarUrl: args.data.avatarUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.googleAccounts.push(newAcc);
      const clone: any = { ...newAcc };
      if (args.include?.user) {
        clone.user = this.users.find((u) => u.id === newAcc.userId);
      }
      return clone;
    },

    delete: async (args: any) => {
      const idx = this.googleAccounts.findIndex((g) => g.userId === args.where.userId);
      if (idx !== -1) {
        const removed = this.googleAccounts.splice(idx, 1);
        return removed[0];
      }
      return null;
    },
  };


  // --- COURSE REPOSITORY ---
  course = {
    findMany: async (args?: any) => {
      let result = [...this.courses];
      if (args?.where) {
        if (args.where.isPublished !== undefined) {
          result = result.filter((c) => c.isPublished === args.where.isPublished);
        }
        if (args.where.category) {
          result = result.filter((c) => c.category === args.where.category);
        }
        if (args.where.OR) {
          const search = args.where.OR[0].title.contains.toLowerCase();
          result = result.filter(
            (c) =>
              c.title.toLowerCase().includes(search) ||
              (c.description && c.description.toLowerCase().includes(search)),
          );
        }
      }
      return result.map((c) => ({
        ...c,
        _count: {
          modules: this.courseModules.filter((m) => m.courseId === c.id).length,
          enrollments: this.enrollments.filter((e) => e.courseId === c.id).length,
        },
      }));
    },
    findUnique: async (args: any) => {
      let found = null;
      if (args.where.id) found = this.courses.find((c) => c.id === args.where.id);
      if (args.where.slug) found = this.courses.find((c) => c.slug === args.where.slug);
      return found ? { ...found } : null;
    },
    findFirst: async (args: any) => {
      let found = null;
      if (args.where.id) found = this.courses.find((c) => c.id === args.where.id);
      if (args.where.slug) found = this.courses.find((c) => c.slug === args.where.slug);
      if (!found) return null;

      const clone = { ...found };
      if (args.include?.modules) {
        const modules = this.courseModules
          .filter((m) => m.courseId === found.id)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((m) => ({
            ...m,
            lessons: this.lessons
              .filter((l) => l.moduleId === m.id)
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((l) => ({
                ...l,
                materials: this.materials.filter((mat) => mat.lessonId === l.id),
                quizzes: [],
                speakingPrompts: [],
                writingPrompts: [],
              })),
          }));
        clone.modules = modules;
      }
      if (args.include?._count) {
        clone._count = {
          enrollments: this.enrollments.filter((e) => e.courseId === found.id).length,
        };
      }
      return clone;
    },
    create: async (args: any) => {
      const newCourse = {
        id: randomUUID(),
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.courses.push(newCourse);
      return { ...newCourse };
    },
    update: async (args: any) => {
      const idx = this.courses.findIndex((c) => c.id === args.where.id);
      if (idx === -1) return null;
      this.courses[idx] = { ...this.courses[idx], ...args.data, updatedAt: new Date() };
      return { ...this.courses[idx] };
    },
    delete: async (args: any) => {
      const idx = this.courses.findIndex((c) => c.id === args.where.id);
      if (idx === -1) return null;
      const [removed] = this.courses.splice(idx, 1);
      return removed;
    },
    count: async () => this.courses.length,
  };

  // --- COURSE MODULE REPOSITORY ---
  courseModule = {
    findMany: async (args: any) => {
      let result = [...this.courseModules];
      if (args.where?.courseId) {
        result = result.filter((m) => m.courseId === args.where.courseId);
      }
      if (args.include?.lessons) {
        return result.map((m) => ({
          ...m,
          lessons: this.lessons.filter((l) => l.moduleId === m.id),
        }));
      }
      return result;
    },
    findUnique: async (args: any) => {
      const found = this.courseModules.find((m) => m.id === args.where.id);
      return found ? { ...found } : null;
    },
    findFirst: async (args: any) => {
      const list = this.courseModules.filter((m) => m.courseId === args.where.courseId);
      if (args.orderBy?.orderIndex === 'desc') {
        list.sort((a, b) => b.orderIndex - a.orderIndex);
      }
      return list[0] ? { ...list[0] } : null;
    },
    create: async (args: any) => {
      const newModule = {
        id: randomUUID(),
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.courseModules.push(newModule);
      return { ...newModule };
    },
    update: async (args: any) => {
      const idx = this.courseModules.findIndex((m) => m.id === args.where.id);
      if (idx === -1) return null;
      this.courseModules[idx] = { ...this.courseModules[idx], ...args.data, updatedAt: new Date() };
      return { ...this.courseModules[idx] };
    },
    delete: async (args: any) => {
      const idx = this.courseModules.findIndex((m) => m.id === args.where.id);
      if (idx === -1) return null;
      const [removed] = this.courseModules.splice(idx, 1);
      return removed;
    },
  };

  // --- LESSON REPOSITORY ---
  lesson = {
    findUnique: async (args: any) => {
      const found = this.lessons.find((l) => l.id === args.where.id);
      if (!found) return null;
      const clone = { ...found };
      if (args.include?.module) {
        const mod = this.courseModules.find((m) => m.id === found.moduleId);
        const course = mod ? this.courses.find((c) => c.id === mod.courseId) : null;
        clone.module = mod ? { ...mod, course } : null;
      }
      if (args.include?.materials) {
        clone.materials = this.materials.filter((m) => m.lessonId === found.id);
      }
      if (args.include?.quizzes) clone.quizzes = [];
      if (args.include?.speakingPrompts) clone.speakingPrompts = [];
      if (args.include?.writingPrompts) clone.writingPrompts = [];
      return clone;
    },
    findFirst: async (args: any) => {
      const list = this.lessons.filter((l) => l.moduleId === args.where.moduleId);
      if (args.orderBy?.orderIndex === 'desc') {
        list.sort((a, b) => b.orderIndex - a.orderIndex);
      }
      return list[0] ? { ...list[0] } : null;
    },
    create: async (args: any) => {
      const newLesson = {
        id: randomUUID(),
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.lessons.push(newLesson);
      return { ...newLesson };
    },
    update: async (args: any) => {
      const idx = this.lessons.findIndex((l) => l.id === args.where.id);
      if (idx === -1) return null;
      this.lessons[idx] = { ...this.lessons[idx], ...args.data, updatedAt: new Date() };
      return { ...this.lessons[idx] };
    },
    delete: async (args: any) => {
      const idx = this.lessons.findIndex((l) => l.id === args.where.id);
      if (idx === -1) return null;
      const [removed] = this.lessons.splice(idx, 1);
      return removed;
    },
    count: async () => this.lessons.length,
  };

  // --- MATERIAL REPOSITORY ---
  material = {
    findMany: async (args: any) => {
      let result = [...this.materials];
      if (args.where?.lessonId) {
        result = result.filter((m) => m.lessonId === args.where.lessonId);
      }
      return result;
    },
    findUnique: async (args: any) => {
      const found = this.materials.find((m) => m.id === args.where.id);
      if (!found) return null;
      const clone = { ...found };
      if (args.include?.lesson) {
        const lesson = this.lessons.find((l) => l.id === found.lessonId);
        if (lesson) {
          const mod = this.courseModules.find((m) => m.id === lesson.moduleId);
          clone.lesson = {
            ...lesson,
            module: mod ? { ...mod, courseId: mod.courseId } : null,
          };
        }
      }
      return clone;
    },
    create: async (args: any) => {
      const newMaterial = {
        id: randomUUID(),
        ...args.data,
        createdAt: new Date(),
      };
      this.materials.push(newMaterial);
      return { ...newMaterial };
    },
    update: async (args: any) => {
      const idx = this.materials.findIndex((m) => m.id === args.where.id);
      if (idx === -1) return null;
      this.materials[idx] = { ...this.materials[idx], ...args.data };
      return { ...this.materials[idx] };
    },
    delete: async (args: any) => {
      const idx = this.materials.findIndex((m) => m.id === args.where.id);
      if (idx === -1) return null;
      const [removed] = this.materials.splice(idx, 1);
      return removed;
    },
  };

  // --- ENROLLMENT REPOSITORY ---
  enrollment = {
    findMany: async (args: any) => {
      let result = [...this.enrollments];
      if (args.where?.userId) {
        result = result.filter((e) => e.userId === args.where.userId);
      }
      if (args.include?.course) {
        return result.map((e) => {
          const course = this.courses.find((c) => c.id === e.courseId);
          const modules = this.courseModules
            .filter((m) => m.courseId === e.courseId)
            .map((m) => ({
              ...m,
              lessons: this.lessons.filter((l) => l.moduleId === m.id),
            }));
          return {
            ...e,
            course: {
              ...course,
              modules,
              _count: { modules: modules.length },
            },
          };
        });
      }
      return result;
    },
    findUnique: async (args: any) => {
      const key = args.where.userId_courseId;
      const found = this.enrollments.find(
        (e) => e.userId === key.userId && e.courseId === key.courseId,
      );
      return found ? { ...found } : null;
    },
    upsert: async (args: any) => {
      const key = args.where.userId_courseId;
      const idx = this.enrollments.findIndex(
        (e) => e.userId === key.userId && e.courseId === key.courseId,
      );
      if (idx !== -1) {
        this.enrollments[idx] = { ...this.enrollments[idx], ...args.update };
        return { ...this.enrollments[idx] };
      } else {
        const newRecord = {
          id: randomUUID(),
          ...args.create,
          enrolledAt: new Date(),
        };
        this.enrollments.push(newRecord);
        return { ...newRecord };
      }
    },
    count: async (args?: any) => {
      let list = [...this.enrollments];
      if (args?.where?.userId) {
        list = list.filter((e) => e.userId === args.where.userId);
      }
      return list.length;
    },
  };

  // --- LESSON PROGRESS REPOSITORY ---
  lessonProgress = {
    findMany: async (args: any) => {
      let result = [...this.lessonProgresses];
      if (args.where?.userId) {
        result = result.filter((p) => p.userId === args.where.userId);
      }
      if (args.where?.isCompleted !== undefined) {
        result = result.filter((p) => p.isCompleted === args.where.isCompleted);
      }
      return result;
    },
    findUnique: async (args: any) => {
      const key = args.where.userId_lessonId;
      const found = this.lessonProgresses.find(
        (p) => p.userId === key.userId && p.lessonId === key.lessonId,
      );
      return found ? { ...found } : null;
    },
    count: async (args: any) => {
      let list = [...this.lessonProgresses];
      if (args.where?.userId) {
        list = list.filter((p) => p.userId === args.where.userId);
      }
      if (args.where?.lessonId?.in) {
        list = list.filter((p) => args.where.lessonId.in.includes(p.lessonId));
      }
      if (args.where?.isCompleted !== undefined) {
        list = list.filter((p) => p.isCompleted === args.where.isCompleted);
      }
      return list.length;
    },
    upsert: async (args: any) => {
      const key = args.where.userId_lessonId;
      const idx = this.lessonProgresses.findIndex(
        (p) => p.userId === key.userId && p.lessonId === key.lessonId,
      );
      if (idx !== -1) {
        this.lessonProgresses[idx] = { ...this.lessonProgresses[idx], ...args.update };
        return { ...this.lessonProgresses[idx] };
      } else {
        const newProg = {
          id: randomUUID(),
          ...args.create,
          createdAt: new Date(),
        };
        this.lessonProgresses.push(newProg);
        return { ...newProg };
      }
    },
  };

  // --- WRITING PROMPT REPOSITORY ---
  writingPrompt = {
    findMany: async (args?: any) => {
      let result = [...this.writingPrompts];
      if (args?.where?.taskType) {
        result = result.filter((p) => p.taskType === args.where.taskType);
      }
      if (args?.where?.lessonId) {
        result = result.filter((p) => p.lessonId === args.where.lessonId);
      }
      return result.map((p) => ({
        ...p,
        _count: {
          submissions: this.writingSubmissions.filter((s) => s.promptId === p.id).length,
        },
      }));
    },
    findUnique: async (args: any) => {
      const found = this.writingPrompts.find((p) => p.id === args.where.id);
      return found ? { ...found } : null;
    },
    create: async (args: any) => {
      const newPrompt = {
        id: randomUUID(),
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.writingPrompts.push(newPrompt);
      return { ...newPrompt };
    },
    update: async (args: any) => {
      const idx = this.writingPrompts.findIndex((p) => p.id === args.where.id);
      if (idx === -1) return null;
      this.writingPrompts[idx] = { ...this.writingPrompts[idx], ...args.data, updatedAt: new Date() };
      return { ...this.writingPrompts[idx] };
    },
    delete: async (args: any) => {
      const idx = this.writingPrompts.findIndex((p) => p.id === args.where.id);
      if (idx === -1) return null;
      const [removed] = this.writingPrompts.splice(idx, 1);
      return removed;
    },
  };

  // --- WRITING SUBMISSION REPOSITORY ---
  writingSubmission = {
    findMany: async (args?: any) => {
      let result = [...this.writingSubmissions];
      if (args?.where?.userId) {
        result = result.filter((s) => s.userId === args.where.userId);
      }
      if (args?.where?.status) {
        result = result.filter((s) => s.status === args.where.status);
      }
      return result.map((s) => {
        const prompt = this.writingPrompts.find((p) => p.id === s.promptId);
        const user = this.users.find((u) => u.id === s.userId);
        return {
          ...s,
          prompt: prompt ? { id: prompt.id, title: prompt.title, taskType: prompt.taskType } : null,
          user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
        };
      });
    },
    findUnique: async (args: any) => {
      const found = this.writingSubmissions.find((s) => s.id === args.where.id);
      if (!found) return null;
      const prompt = this.writingPrompts.find((p) => p.id === found.promptId);
      const user = this.users.find((u) => u.id === found.userId);
      const approvedBy = found.approvedById ? this.users.find((u) => u.id === found.approvedById) : null;
      return {
        ...found,
        prompt,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
        approvedBy: approvedBy ? { id: approvedBy.id, fullName: approvedBy.fullName } : null,
      };
    },
    create: async (args: any) => {
      const newSub = {
        id: randomUUID(),
        ...args.data,
        submittedAt: new Date(),
        updatedAt: new Date(),
      };
      this.writingSubmissions.push(newSub);
      const prompt = this.writingPrompts.find((p) => p.id === newSub.promptId);
      return {
        ...newSub,
        prompt: prompt ? { id: prompt.id, title: prompt.title, taskType: prompt.taskType } : null,
      };
    },
    update: async (args: any) => {
      const idx = this.writingSubmissions.findIndex((s) => s.id === args.where.id);
      if (idx === -1) return null;
      this.writingSubmissions[idx] = { ...this.writingSubmissions[idx], ...args.data, updatedAt: new Date() };
      const sub = this.writingSubmissions[idx];
      const prompt = this.writingPrompts.find((p) => p.id === sub.promptId);
      const user = this.users.find((u) => u.id === sub.userId);
      return {
        ...sub,
        prompt: prompt ? { id: prompt.id, title: prompt.title } : null,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
      };
    },
    count: async (args?: any) => {
      let list = [...this.writingSubmissions];
      if (args?.where?.studentId) {
        list = list.filter((s) => s.studentId === args.where.studentId || s.userId === args.where.studentId);
      }
      if (args?.where?.status) {
        list = list.filter((s) => s.status === args.where.status);
      }
      return list.length;
    },
  };

  // --- SPEAKING PROMPT REPOSITORY ---
  speakingPrompt = {
    findMany: async (args?: any) => {
      let result = [...this.speakingPrompts];
      if (args?.where?.lessonId) {
        result = result.filter((p) => p.lessonId === args.where.lessonId);
      }
      return result.map((p) => ({
        ...p,
        _count: {
          submissions: this.speakingSubmissions.filter((s) => s.promptId === p.id).length,
        },
      }));
    },
    findUnique: async (args: any) => {
      const found = this.speakingPrompts.find((p) => p.id === args.where.id);
      return found ? { ...found } : null;
    },
    create: async (args: any) => {
      const newPrompt = {
        id: randomUUID(),
        ...args.data,
        createdAt: new Date(),
      };
      this.speakingPrompts.push(newPrompt);
      return { ...newPrompt };
    },
    update: async (args: any) => {
      const idx = this.speakingPrompts.findIndex((p) => p.id === args.where.id);
      if (idx === -1) return null;
      this.speakingPrompts[idx] = { ...this.speakingPrompts[idx], ...args.data };
      return { ...this.speakingPrompts[idx] };
    },
    delete: async (args: any) => {
      const idx = this.speakingPrompts.findIndex((p) => p.id === args.where.id);
      if (idx === -1) return null;
      const [removed] = this.speakingPrompts.splice(idx, 1);
      return removed;
    },
  };

  // --- SPEAKING SUBMISSION REPOSITORY ---
  speakingSubmission = {
    findMany: async (args?: any) => {
      let result = [...this.speakingSubmissions];
      if (args?.where?.userId) {
        result = result.filter((s) => s.userId === args.where.userId);
      }
      if (args?.where?.status) {
        result = result.filter((s) => s.status === args.where.status);
      }
      return result.map((s) => {
        const prompt = this.speakingPrompts.find((p) => p.id === s.promptId);
        const user = this.users.find((u) => u.id === s.userId);
        return {
          ...s,
          prompt: prompt ? { id: prompt.id, title: prompt.title, topic: prompt.topic } : null,
          user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
        };
      });
    },
    findUnique: async (args: any) => {
      const found = this.speakingSubmissions.find((s) => s.id === args.where.id);
      if (!found) return null;
      const prompt = this.speakingPrompts.find((p) => p.id === found.promptId);
      const user = this.users.find((u) => u.id === found.userId);
      const gradedBy = found.gradedById ? this.users.find((u) => u.id === found.gradedById) : null;
      return {
        ...found,
        prompt,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
        gradedBy: gradedBy ? { id: gradedBy.id, fullName: gradedBy.fullName } : null,
      };
    },
    create: async (args: any) => {
      const newSub = {
        id: randomUUID(),
        ...args.data,
        submittedAt: new Date(),
      };
      this.speakingSubmissions.push(newSub);
      const prompt = this.speakingPrompts.find((p) => p.id === newSub.promptId);
      return {
        ...newSub,
        prompt: prompt ? { id: prompt.id, title: prompt.title } : null,
      };
    },
    update: async (args: any) => {
      const idx = this.speakingSubmissions.findIndex((s) => s.id === args.where.id);
      if (idx === -1) return null;
      this.speakingSubmissions[idx] = { ...this.speakingSubmissions[idx], ...args.data };
      const sub = this.speakingSubmissions[idx];
      const prompt = this.speakingPrompts.find((p) => p.id === sub.promptId);
      const user = this.users.find((u) => u.id === sub.userId);
      return {
        ...sub,
        prompt: prompt ? { id: prompt.id, title: prompt.title } : null,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
      };
    },
    count: async (args?: any) => {
      let list = [...this.speakingSubmissions];
      if (args?.where?.studentId) {
        list = list.filter((s) => s.studentId === args.where.studentId || s.userId === args.where.studentId);
      }
      if (args?.where?.status) {
        list = list.filter((s) => s.status === args.where.status);
      }
      return list.length;
    },
  };

  // --- QUIZ REPOSITORY ---
  quiz = {
    findMany: async (args?: any) => {
      let result = [...this.quizzes];
      if (args?.where?.lessonId) {
        result = result.filter((q) => q.lessonId === args.where.lessonId);
      }
      return result.map((q) => {
        const qs = this.questions
          .filter((quest) => quest.quizId === q.id)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((quest) => ({
            ...quest,
            options: this.questionOptions.filter((opt) => opt.questionId === quest.id),
          }));
        return { ...q, questions: qs };
      });
    },
    findUnique: async (args: any) => {
      const found = this.quizzes.find((q) => q.id === args.where.id);
      if (!found) return null;
      const clone = { ...found };
      if (args.include?.questions) {
        clone.questions = this.questions
          .filter((quest) => quest.quizId === found.id)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((quest) => ({
            ...quest,
            options: this.questionOptions.filter((opt) => opt.questionId === quest.id),
          }));
      }
      if (args.include?.lesson) {
        const lesson = this.lessons.find((l) => l.id === found.lessonId);
        const mod = lesson ? this.courseModules.find((m) => m.id === lesson.moduleId) : null;
        clone.lesson = {
          ...lesson,
          module: mod ? { ...mod, courseId: mod.courseId } : null,
        };
      }
      return clone;
    },
    create: async (args: any) => {
      const newQuiz = {
        id: randomUUID(),
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.quizzes.push(newQuiz);
      return { ...newQuiz };
    },
    delete: async (args: any) => {
      const idx = this.quizzes.findIndex((q) => q.id === args.where.id);
      if (idx === -1) return null;
      const [removed] = this.quizzes.splice(idx, 1);
      return removed;
    },
  };

  // --- QUESTION REPOSITORY ---
  question = {
    create: async (args: any) => {
      const newQ = {
        id: randomUUID(),
        quizId: args.data.quizId,
        content: args.data.content,
        type: args.data.type,
        points: args.data.points,
        explanation: args.data.explanation,
        orderIndex: args.data.orderIndex,
      };
      this.questions.push(newQ);
      const createdOptions: any[] = [];
      if (args.data.options?.create) {
        for (const opt of args.data.options.create) {
          const newOpt = {
            id: randomUUID(),
            questionId: newQ.id,
            content: opt.content,
            isCorrect: opt.isCorrect,
          };
          this.questionOptions.push(newOpt);
          createdOptions.push(newOpt);
        }
      }
      return { ...newQ, options: createdOptions };
    },
  };

  // --- QUIZ SUBMISSION REPOSITORY ---
  quizSubmission = {
    findMany: async (args: any) => {
      let result = [...this.quizSubmissions];
      if (args.where?.quizId) {
        result = result.filter((s) => s.quizId === args.where.quizId);
      }
      if (args.where?.userId) {
        result = result.filter((s) => s.userId === args.where.userId);
      }
      return result.map((s) => ({
        ...s,
        answers: this.quizAnswers.filter((a) => a.submissionId === s.id),
      }));
    },
    create: async (args: any) => {
      const newSub = {
        id: randomUUID(),
        quizId: args.data.quizId,
        userId: args.data.userId,
        score: args.data.score,
        totalQuestions: args.data.totalQuestions,
        correctAnswers: args.data.correctAnswers,
        isPassed: args.data.isPassed,
        submittedAt: new Date(),
      };
      this.quizSubmissions.push(newSub);
      if (args.data.answers?.create) {
        for (const a of args.data.answers.create) {
          this.quizAnswers.push({
            id: randomUUID(),
            submissionId: newSub.id,
            ...a,
          });
        }
      }
      return { ...newSub };
    },
    count: async (args?: any) => {
      let list = [...this.quizSubmissions];
      if (args?.where?.studentId) {
        list = list.filter((s) => s.userId === args.where.studentId || s.studentId === args.where.studentId);
      }
      if (args?.where?.isPassed !== undefined) {
        list = list.filter((s) => s.isPassed === args.where.isPassed);
      }
      return list.length;
    },
  };

  // --- CLASSROOM UPDATE REPOSITORY ---
  classroom = {
    findMany: async () => {
      return this.classrooms.map((c) => ({
        ...c,
        host: this.users.find((u) => u.id === c.hostId) || null,
        _count: {
          attendanceRecords: this.attendanceRecords.filter((a) => a.classroomId === c.id).length,
        },
      }));
    },
    findUnique: async (args: any) => {
      const found = this.classrooms.find((c) => c.id === args.where.id);
      return found ? { ...found } : null;
    },
    findFirst: async (args: any) => {
      const found = this.classrooms.find((c) => c.name === args.where.name);
      return found ? { ...found } : null;
    },
    create: async (args: any) => {
      const newClassroom = {
        id: randomUUID(),
        ...args.data,
        status: 'SCHEDULED',
        createdAt: new Date(),
      };
      this.classrooms.push(newClassroom);
      return { ...newClassroom };
    },
    updateMany: async (args: any) => {
      let count = 0;
      this.classrooms.forEach((c, idx) => {
        if (c.name === args.where.name) {
          this.classrooms[idx] = { ...this.classrooms[idx], ...args.data };
          count++;
        }
      });
      return { count };
    },
    count: async () => this.classrooms.length,
  };

  // --- ATTENDANCE UPDATE REPOSITORY ---
  attendanceRecord = {
    count: async () => this.attendanceRecords.length,
    findMany: async (args?: any) => {
      let result = [...this.attendanceRecords];
      if (args?.where?.classroomId) {
        result = result.filter((a) => a.classroomId === args.where.classroomId);
      }
      if (args?.where?.studentId) {
        result = result.filter((a) => a.studentId === args.where.studentId);
      }
      return result.map((a) => {
        const student = this.users.find((u) => u.id === a.studentId);
        const classroom = this.classrooms.find((c) => c.id === a.classroomId);
        return {
          ...a,
          student: student ? { id: student.id, fullName: student.fullName, email: student.email, phone: student.phone } : null,
          classroom,
        };
      });
    },
    findUnique: async (args: any) => {
      if (args.where.id) {
        const found = this.attendanceRecords.find((a) => a.id === args.where.id);
        return found ? { ...found } : null;
      }
      const key = args.where.classroomId_studentId;
      const found = this.attendanceRecords.find(
        (a) => a.classroomId === key.classroomId && a.studentId === key.studentId,
      );
      return found ? { ...found } : null;
    },
    upsert: async (args: any) => {
      const key = args.where.classroomId_studentId;
      const idx = this.attendanceRecords.findIndex(
        (a) => a.classroomId === key.classroomId && a.studentId === key.studentId,
      );
      if (idx !== -1) {
        this.attendanceRecords[idx] = { ...this.attendanceRecords[idx], ...args.update };
        return { ...this.attendanceRecords[idx] };
      } else {
        const newRecord = { id: randomUUID(), ...args.create, createdAt: new Date() };
        this.attendanceRecords.push(newRecord);
        return { ...newRecord };
      }
    },
    update: async (args: any) => {
      const idx = this.attendanceRecords.findIndex((a) => a.id === args.where.id);
      if (idx !== -1) {
        this.attendanceRecords[idx] = { ...this.attendanceRecords[idx], ...args.data };
        const student = this.users.find((u) => u.id === this.attendanceRecords[idx].studentId);
        return {
          ...this.attendanceRecords[idx],
          student: student ? { id: student.id, fullName: student.fullName, email: student.email } : null,
        };
      }
      return null;
    },
  };

  // --- CONVERSATION REPOSITORY ---
  conversation = {
    findFirst: async (args: any) => {
      let list = [...this.conversations];
      if (args?.where?.studentId) {
        list = list.filter((c) => c.studentId === args.where.studentId);
      }
      if (args?.where?.adminId) {
        list = list.filter((c) => c.adminId === args.where.adminId);
      }
      if (list.length === 0) return null;
      const c = list[0];
      const student = this.users.find((u) => u.id === c.studentId);
      const admin = this.users.find((u) => u.id === c.adminId);
      return {
        ...c,
        student: student ? { id: student.id, fullName: student.fullName, email: student.email, avatarUrl: student.avatarUrl, role: student.role } : null,
        admin: admin ? { id: admin.id, fullName: admin.fullName, email: admin.email, avatarUrl: admin.avatarUrl, role: admin.role } : null,
      };
    },
    findUnique: async (args: any) => {
      const c = this.conversations.find((conv) => conv.id === args.where.id);
      if (!c) return null;
      const student = this.users.find((u) => u.id === c.studentId);
      const admin = this.users.find((u) => u.id === c.adminId);
      return {
        ...c,
        student: student ? { id: student.id, fullName: student.fullName, email: student.email, avatarUrl: student.avatarUrl, role: student.role } : null,
        admin: admin ? { id: admin.id, fullName: admin.fullName, email: admin.email, avatarUrl: admin.avatarUrl, role: admin.role } : null,
      };
    },
    findMany: async (args?: any) => {
      let list = [...this.conversations];
      if (args?.where?.studentId) {
        list = list.filter((c) => c.studentId === args.where.studentId);
      }
      if (args?.where?.adminId) {
        list = list.filter((c) => c.adminId === args.where.adminId);
      }
      return list.map((c) => {
        const student = this.users.find((u) => u.id === c.studentId);
        const admin = this.users.find((u) => u.id === c.adminId);
        return {
          ...c,
          student: student ? { id: student.id, fullName: student.fullName, email: student.email, avatarUrl: student.avatarUrl, role: student.role } : null,
          admin: admin ? { id: admin.id, fullName: admin.fullName, email: admin.email, avatarUrl: admin.avatarUrl, role: admin.role } : null,
        };
      });
    },
    create: async (args: any) => {
      const newConv = {
        id: randomUUID(),
        studentId: args.data.studentId,
        adminId: args.data.adminId,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.conversations.push(newConv);
      const student = this.users.find((u) => u.id === newConv.studentId);
      const admin = this.users.find((u) => u.id === newConv.adminId);
      return {
        ...newConv,
        student: student ? { id: student.id, fullName: student.fullName, email: student.email, avatarUrl: student.avatarUrl, role: student.role } : null,
        admin: admin ? { id: admin.id, fullName: admin.fullName, email: admin.email, avatarUrl: admin.avatarUrl, role: admin.role } : null,
      };
    },
    update: async (args: any) => {
      const idx = this.conversations.findIndex((c) => c.id === args.where.id);
      if (idx === -1) return null;
      this.conversations[idx] = { ...this.conversations[idx], ...args.data, updatedAt: new Date() };
      return { ...this.conversations[idx] };
    },
  };

  // --- MESSAGE REPOSITORY ---
  message = {
    create: async (args: any) => {
      const newMsg = {
        id: randomUUID(),
        conversationId: args.data.conversationId,
        senderId: args.data.senderId,
        content: args.data.content,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
      };
      this.messages.push(newMsg);
      const sender = this.users.find((u) => u.id === newMsg.senderId);
      return {
        ...newMsg,
        sender: sender ? { id: sender.id, fullName: sender.fullName, avatarUrl: sender.avatarUrl, role: sender.role } : null,
      };
    },
    findFirst: async (args: any) => {
      let list = [...this.messages];
      if (args?.where?.conversationId) {
        list = list.filter((m) => m.conversationId === args.where.conversationId);
      }
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return list[0] ? { ...list[0] } : null;
    },
    findMany: async (args: any) => {
      let list = [...this.messages];
      if (args?.where?.conversationId) {
        list = list.filter((m) => m.conversationId === args.where.conversationId);
      }
      if (args?.orderBy?.createdAt === 'asc') {
        list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
      return list.map((m) => {
        const sender = this.users.find((u) => u.id === m.senderId);
        return {
          ...m,
          sender: sender ? { id: sender.id, fullName: sender.fullName, avatarUrl: sender.avatarUrl, role: sender.role } : null,
        };
      });
    },
    count: async (args?: any) => {
      let list = [...this.messages];
      if (args?.where?.conversationId) {
        list = list.filter((m) => m.conversationId === args.where.conversationId);
      }
      if (args?.where?.senderId?.not) {
        list = list.filter((m) => m.senderId !== args.where.senderId.not);
      }
      if (args?.where?.isRead !== undefined) {
        list = list.filter((m) => m.isRead === args.where.isRead);
      }
      return list.length;
    },
    updateMany: async (args: any) => {
      let count = 0;
      this.messages.forEach((m, idx) => {
        let match = true;
        if (args.where?.conversationId && m.conversationId !== args.where.conversationId) match = false;
        if (args.where?.senderId?.not && m.senderId === args.where.senderId.not) match = false;
        if (args.where?.isRead !== undefined && m.isRead !== args.where.isRead) match = false;
        if (match) {
          this.messages[idx] = { ...this.messages[idx], ...args.data };
          count++;
        }
      });
      return { count };
    },
  };

  async $transaction(queries: any) {
    if (Array.isArray(queries)) {
      return Promise.all(queries);
    }
    if (typeof queries === 'function') {
      return queries(this);
    }
    return queries;
  }

  async onModuleInit() {}
  async onModuleDestroy() {}
  async $connect() {}
  async $disconnect() {}
}
