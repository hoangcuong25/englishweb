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

  async onModuleInit() {}
  async onModuleDestroy() {}
  async $connect() {}
  async $disconnect() {}
}
