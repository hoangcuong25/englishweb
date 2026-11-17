import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AppException } from '../../core/common/errors/app.exception';
import { AppErrorCode } from '../../core/common/errors/error-codes.enum';
import { MailService } from '../../core/mail/mail.service';
import { RedisService } from '../../core/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { Role, Language } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private redisService: RedisService,
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

      // Revoke prior active session in Redis
      const oldSessionToken = await this.redisService.get(`user:session:${user.id}`);
      if (oldSessionToken) {
        await this.redisService.set(`blacklist:token:${oldSessionToken}`, 'revoked', 7 * 24 * 3600);
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, dto.deviceId, ipAddress, userAgent);

    // Track latest active session in Redis for instant invalidation
    if (user.role === Role.STUDENT) {
      await this.redisService.set(`user:session:${user.id}`, tokens.refreshToken, 7 * 24 * 3600);
    }

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
    let googleId = dto.idToken;
    let email = dto.email;
    let fullName = dto.fullName;
    let avatarUrl = dto.avatarUrl;

    // Auto decode payload if idToken is a JWT from Google Identity Services
    if (dto.idToken && dto.idToken.includes('.')) {
      try {
        const parts = dto.idToken.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          if (payload.sub) {
            googleId = payload.sub;
          }
          if (!email && payload.email) {
            email = payload.email;
          }
          if (!fullName && (payload.name || payload.given_name)) {
            fullName = payload.name || payload.given_name;
          }
          if (!avatarUrl && payload.picture) {
            avatarUrl = payload.picture;
          }
        }
      } catch (err) {
        // Fallback to original dto
      }
    }

    const realEmail = email ? email.trim().toLowerCase() : null;
    const fallbackEmail = `google_${googleId}@englishweb.com`.toLowerCase();
    const resolvedEmail = realEmail || fallbackEmail;

    // Check if google account is already linked
    let googleAccount = await this.prisma.googleAccount.findUnique({
      where: { googleId },
      include: { user: true },
    });

    let user;

    if (googleAccount) {
      user = googleAccount.user;
      const updateData: { fullName?: string; avatarUrl?: string; email?: string } = {};

      // Sync latest Google name & avatar if changed
      if (fullName && fullName !== 'Google Student' && user.fullName !== fullName) {
        updateData.fullName = fullName;
      }
      if (avatarUrl && user.avatarUrl !== avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }
      // Sync real Google email into user profile
      if (realEmail && user.email !== realEmail) {
        const existingWithEmail = await this.prisma.user.findUnique({
          where: { email: realEmail },
        });
        if (!existingWithEmail || existingWithEmail.id === user.id) {
          updateData.email = realEmail;
          await this.prisma.googleAccount
            .update({
              where: { id: googleAccount.id },
              data: { email: realEmail },
            })
            .catch(() => {});
        }
      }

      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Check if user with this email exists
      let existingUser = await this.prisma.user.findUnique({
        where: { email: resolvedEmail },
      });

      if (existingUser) {
        // Link Google account to existing user and update name, avatar & email
        googleAccount = await this.prisma.googleAccount.create({
          data: {
            googleId,
            email: resolvedEmail,
            userId: existingUser.id,
            avatarUrl,
          },
          include: { user: true },
        });
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            fullName:
              fullName && fullName !== 'Google Student'
                ? fullName
                : existingUser.fullName,
            avatarUrl: avatarUrl || existingUser.avatarUrl,
            email: realEmail || existingUser.email,
          },
        });
      } else {
        // Create new user with real Google account name, email & link Google account
        user = await this.prisma.user.create({
          data: {
            email: resolvedEmail,
            fullName: fullName || 'Google Student',
            avatarUrl,
            role: Role.STUDENT,
            googleAccount: {
              create: {
                googleId,
                email: resolvedEmail,
                avatarUrl,
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
    let googleId = dto.idToken;
    let email = dto.email;
    let avatarUrl = dto.avatarUrl;

    if (dto.idToken && dto.idToken.includes('.')) {
      try {
        const parts = dto.idToken.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          if (payload.sub) googleId = payload.sub;
          if (!email && payload.email) email = payload.email;
          if (!avatarUrl && payload.picture) avatarUrl = payload.picture;
        }
      } catch (err) {
        // Fallback
      }
    }

    const existing = await this.prisma.googleAccount.findUnique({
      where: { googleId },
    });

    if (existing) {
      throw new ConflictException('This Google account is already linked to another user');
    }

    await this.prisma.googleAccount.create({
      data: {
        googleId,
        email: email || 'linked@gmail.com',
        userId,
        avatarUrl,
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

    // Invalidate user in Redis session store
    await this.redisService.set(`blacklist:user:${userId}`, 'revoked', 7 * 24 * 3600);
    await this.redisService.del(`user:session:${userId}`);
    await this.redisService.del(`user:active_session:${userId}`);

    // Dispatch English security alert email asynchronously
    try {
      await this.mailService.sendPasswordChangedEmail({
        email: user.email,
        fullName: user.fullName,
      });
    } catch {
      // Non-blocking
    }

    return { message: 'Password changed successfully. Please log in again.' };
  }

  /**
   * 7. Refresh Token Rotation
   */
  async refreshTokens(refreshToken: string, ipAddress?: string, userAgent?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Fast check against Redis blacklist
    const isTokenBlacklisted = await this.redisService.get(`blacklist:token:${refreshToken}`);
    if (isTokenBlacklisted) {
      throw new UnauthorizedException('Invalid, revoked or expired refresh token');
    }

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Invalid, revoked or expired refresh token');
    }

    const isUserBlacklisted = await this.redisService.get(`blacklist:user:${tokenRecord.userId}`);
    if (isUserBlacklisted) {
      throw new UnauthorizedException('User sessions have been invalidated');
    }

    // Revoke old refresh token (Rotation)
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date(), isRevoked: true },
    });

    // Blacklist rotated token in Redis
    await this.redisService.set(`blacklist:token:${refreshToken}`, 'revoked', 7 * 24 * 3600);

    return this.generateTokens(tokenRecord.user.id, tokenRecord.user.email, tokenRecord.user.role, tokenRecord.deviceId, ipAddress, userAgent);
  }

  /**
   * 8. Logout
   */
  async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        select: { userId: true },
      });
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date(), isRevoked: true },
      });
      await this.redisService.set(`blacklist:token:${refreshToken}`, 'revoked', 7 * 24 * 3600);
      if (tokenRecord?.userId) {
        await this.redisService.del(`user:session:${tokenRecord.userId}`);
        await this.redisService.del(`user:active_session:${tokenRecord.userId}`);
      }
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
    await this.redisService.set(`blacklist:user:${userId}`, 'revoked', 7 * 24 * 3600);
    await this.redisService.del(`user:session:${userId}`);
    await this.redisService.del(`user:active_session:${userId}`);
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
    const sessionId = randomBytes(16).toString('hex');
    const payload = { sub: userId, email, role, sessionId };

    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
      'your_super_secret_jwt_key_teacher_dong_2026';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
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

    if (role === Role.STUDENT) {
      await this.redisService.set(`user:active_session:${userId}`, sessionId, 7 * 24 * 3600);
    }

    return {
      accessToken,
      refreshToken: refreshTokenString,
      role,
    };
  }

  /**
   * 11. Request Password Reset Link via Email
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw AppException.notFound(
        AppErrorCode.AUTH_EMAIL_NOT_FOUND,
        'Không tìm thấy tài khoản với địa chỉ email này.',
      );
    }

    if (!user.isActive) {
      throw AppException.forbidden(
        AppErrorCode.AUTH_ACCOUNT_DEACTIVATED,
        'Tài khoản này đã bị tạm khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    const resetToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'PASSWORD_RESET',
      },
      {
        secret,
        expiresIn: '15m',
      },
    );

    try {
      await this.redisService.set(`password_reset:${user.id}`, resetToken, 15 * 60);
    } catch {}

    await this.mailService.sendForgotPasswordEmail({
      email: user.email,
      fullName: user.fullName,
      resetToken,
    });

    return {
      success: true,
      message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.',
    };
  }

  /**
   * 12. Reset Password using token
   */
  async resetPassword(dto: ResetPasswordDto) {
    const secret = this.configService.get<string>('JWT_SECRET');
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.token, { secret });
    } catch {
      throw AppException.badRequest(
        AppErrorCode.AUTH_RESET_TOKEN_EXPIRED,
        'Mã xác thực đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (quá 15 phút).',
      );
    }

    if (payload?.type !== 'PASSWORD_RESET' || !payload?.sub) {
      throw AppException.badRequest(
        AppErrorCode.AUTH_RESET_TOKEN_INVALID,
        'Mã xác thực đặt lại mật khẩu không đúng mục đích.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw AppException.notFound(
        AppErrorCode.AUTH_EMAIL_NOT_FOUND,
        'Không tìm thấy thông tin tài khoản người dùng tương ứng.',
      );
    }

    if (dto.newPassword.length < 6) {
      throw AppException.badRequest(
        AppErrorCode.AUTH_WEAK_PASSWORD,
        'Mật khẩu mới phải có tối thiểu 6 ký tự.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.logoutAll(user.id);

    try {
      await this.mailService.sendPasswordChangedEmail({
        email: user.email,
        fullName: user.fullName,
      });
    } catch {}

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
    };
  }
}
