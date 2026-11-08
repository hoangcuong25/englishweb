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

  // --- CLASSROOM REPOSITORY ---
  classroom = {
    findFirst: async (args: any) => {
      const found = this.classrooms.find((c) => c.name === args.where.name);
      return found ? { ...found } : null;
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
  };

  // --- ATTENDANCE RECORD REPOSITORY ---
  attendanceRecord = {
    findUnique: async (args: any) => {
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
        return { ...this.attendanceRecords[idx] };
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
