import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Res,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestRegisterOtpDto } from './dto/request-register-otp.dto';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AppThrottlerGuard } from '../../core/common/guards/app-throttler.guard';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';

@ApiTags('Authentication & Sessions')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    role: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('user_role', role, {
      httpOnly: false, // Accessible by Next.js middleware / client UI
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register/request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request OTP verification code for student registration',
  })
  @ApiResponse({
    status: 200,
    description: 'Registration verification OTP dispatched to email',
  })
  async requestRegisterOtp(@Body() dto: RequestRegisterOtpDto) {
    return this.authService.requestRegisterOtp(dto.email, dto.fullName);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new student account (strictly STUDENT role)',
  })
  @ApiResponse({ status: 201, description: 'Student registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.register(dto, ip, userAgent);
    this.setTokenCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.user.role,
    );
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AppThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Login with email and password (enforces Single Concurrent Session for students)',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.login(dto, ip, userAgent);
    this.setTokenCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.user.role,
    );
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu liên kết đặt lại mật khẩu qua email' })
  @ApiResponse({ status: 200, description: 'Gửi email khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Email không tồn tại trong hệ thống',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới bằng token 15 phút' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  @ApiResponse({
    status: 400,
    description: 'Token không hợp lệ hoặc đã hết hạn',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or auto-register via Google OAuth 2.0' })
  @ApiResponse({ status: 200, description: 'Google authentication successful' })
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.googleAuth(dto, ip, userAgent);
    this.setTokenCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.user.role,
    );
    return result;
  }

  @Post('google/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Link Google account to current authenticated profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Google account linked successfully',
  })
  async linkGoogle(@CurrentUser() user: any, @Body() dto: GoogleAuthDto) {
    return this.authService.linkGoogle(user.id, dto);
  }

  @Post('google/unlink')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink Google account from current profile' })
  @ApiResponse({ status: 200, description: 'Google account unlinked' })
  async unlinkGoogle(@CurrentUser() user: any) {
    return this.authService.unlinkGoogle(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token using HTTP-only cookie' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({
    status: 401,
    description: 'Invalid, revoked or expired refresh token',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.['refresh_token'] || req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const tokens = await this.authService.refreshTokens(
      refreshToken,
      ip,
      userAgent,
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    if ((tokens as any).role) {
      res.cookie('user_role', (tokens as any).role, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke current refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken =
      req.cookies?.['refresh_token'] || req.body?.refreshToken;
    await this.authService.logout(refreshToken);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth' });
    res.clearCookie('user_role');

    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout and terminate all active sessions across devices',
  })
  async logoutAll(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logoutAll(user.id);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth' });
    res.clearCookie('user_role');
    return result;
  }

  @Post('change-password/request-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for password change' })
  async requestChangePasswordOtp(@CurrentUser() user: any) {
    return this.authService.requestChangePasswordOtp(user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password and revoke other active sessions' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password and revoke other active sessions (PUT)',
  })
  async changePasswordPut(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active sessions of current user' })
  async getSessions(@CurrentUser() user: any) {
    return this.authService.getSessions(user.id);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Terminate a specific active session' })
  @ApiParam({ name: 'id', description: 'Session/Token ID' })
  async revokeSession(
    @CurrentUser() user: any,
    @Param('id') sessionId: string,
  ) {
    return this.authService.revokeSession(user.id, sessionId);
  }

  @Put('language')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update preferred interface language (VI, EN, ZH, JA)',
  })
  async updateLanguage(
    @CurrentUser() user: any,
    @Body() dto: UpdateLanguageDto,
  ) {
    return this.authService.updateLanguage(user.id, dto.language);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân (số điện thoại, họ tên)',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin thành công' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload và cập nhật ảnh đại diện avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật avatar thành công' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.updateAvatar(user.id, file);
  }
}
