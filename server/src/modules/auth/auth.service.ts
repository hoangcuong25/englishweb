import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { Role, Language } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 1. Register a new student account
   */
  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        preferredLang: dto.preferredLang || Language.VI,
        role: Role.STUDENT, // Strictly STUDENT for public registration
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        preferredLang: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, dto.deviceId, ipAddress, userAgent);
    return { user, ...tokens };
  }

  /**
   * 2. Login with email & password (with Single Concurrent Session enforcement for students)
   */
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { googleAccount: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Single Concurrent Session: Revoke existing active tokens for STUDENT
    if (user.role === Role.STUDENT) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          isRevoked: true,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, dto.deviceId, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preferredLang: user.preferredLang,
        isGoogleLinked: !!user.googleAccount,
      },
      ...tokens,
    };
  }

  /**
   * 3. Google OAuth 2.0 Login / Auto-Registration
   */
  async googleAuth(dto: GoogleAuthDto, ipAddress?: string, userAgent?: string) {
    // In production, verify idToken with Google OAuth Client SDK
    const googleId = dto.idToken;
    const email = (dto.email || `google_${googleId}@englishweb.com`).toLowerCase();

    // Check if google account is already linked
    let googleAccount = await this.prisma.googleAccount.findUnique({
      where: { googleId },
      include: { user: true },
    });

    let user;

    if (googleAccount) {
      user = googleAccount.user;
    } else {
      // Check if user with this email exists
      let existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link Google account to existing user
        googleAccount = await this.prisma.googleAccount.create({
          data: {
            googleId,
            email,
            userId: existingUser.id,
            avatarUrl: dto.avatarUrl,
          },
          include: { user: true },
        });
        user = existingUser;
      } else {
        // Create new user & link Google account
        user = await this.prisma.user.create({
          data: {
            email,
            fullName: dto.fullName || 'Google Student',
            avatarUrl: dto.avatarUrl,
            role: Role.STUDENT,
            googleAccount: {
              create: {
                googleId,
                email,
                avatarUrl: dto.avatarUrl,
              },
            },
          },
        });
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    if (user.role === Role.STUDENT) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date(), isRevoked: true },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, dto.deviceId, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preferredLang: user.preferredLang,
        isGoogleLinked: true,
      },
      ...tokens,
    };
  }

  /**
   * 4. Link Google Account
   */
  async linkGoogle(userId: string, dto: GoogleAuthDto) {
    const existing = await this.prisma.googleAccount.findUnique({
      where: { googleId: dto.idToken },
    });

    if (existing) {
      throw new ConflictException('This Google account is already linked to another user');
    }

    await this.prisma.googleAccount.create({
      data: {
        googleId: dto.idToken,
        email: dto.email || 'linked@gmail.com',
        userId,
        avatarUrl: dto.avatarUrl,
      },
    });

    return { message: 'Google account linked successfully' };
  }

  /**
   * 5. Unlink Google Account
   */
  async unlinkGoogle(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { googleAccount: true },
    });

    if (!user?.googleAccount) {
      throw new BadRequestException('No Google account is currently linked');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Cannot unlink Google account without setting a local password first');
    }

    await this.prisma.googleAccount.delete({
      where: { userId },
    });

    return { message: 'Google account unlinked successfully' };
  }

  /**
   * 6. Change Password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestException('Current password does not match');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all other active sessions for security
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), isRevoked: true },
    });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  /**
   * 7. Refresh Token Rotation
   */
  async refreshTokens(refreshToken: string, ipAddress?: string, userAgent?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Invalid, revoked or expired refresh token');
    }

    // Revoke old refresh token (Rotation)
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date(), isRevoked: true },
    });

    return this.generateTokens(tokenRecord.user.id, tokenRecord.user.email, tokenRecord.user.role, tokenRecord.deviceId, ipAddress, userAgent);
  }

  /**
   * 8. Logout
   */
  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date(), isRevoked: true },
      });
    }
    return { message: 'Logged out successfully' };
  }

  /**
   * 9. Logout All Active Sessions
   */
  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), isRevoked: true },
    });
    return { message: 'Logged out from all devices successfully' };
  }

  /**
   * 10. List Active Sessions
   */
  async getSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        deviceId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 11. Revoke Specific Session
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date(), isRevoked: true },
    });

    return { message: 'Session terminated successfully' };
  }

  /**
   * 12. Update Preferred Language (i18n)
   */
  async updateLanguage(userId: string, language: Language) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { preferredLang: language },
      select: { id: true, preferredLang: true },
    });
    return user;
  }

  /**
   * 13. Get Current User Profile
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        preferredLang: true,
        createdAt: true,
        googleAccount: {
          select: {
            googleId: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      isGoogleLinked: !!user.googleAccount,
    };
  }

  /**
   * Helper: Generate Access Token & Refresh Token
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'your_super_secret_jwt_key_2026'),
      expiresIn: '15m', // 15 minutes as per SRS Security Standard
    });

    const refreshTokenString = randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId,
        deviceId,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  }
}
