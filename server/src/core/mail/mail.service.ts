import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;
  private mailFrom = '"Teacher Dong Academy" <cuongpro1t123@gmail.com>';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.initTransporter();
  }

  onModuleDestroy() {
    if (this.transporter) {
      try {
        this.transporter.close();
      } catch {
        // ignore
      }
      this.transporter = null;
    }
  }

  private initTransporter() {
    const isTest = process.env.NODE_ENV === 'test';
    const user =
      this.configService.get<string>('MAIL_USER') || process.env.MAIL_USER || '';
    const pass =
      this.configService.get<string>('MAIL_PASSWORD') ||
      process.env.MAIL_PASSWORD ||
      '';
    const host =
      this.configService.get<string>('MAIL_HOST') ||
      process.env.MAIL_HOST ||
      'smtp.gmail.com';
    const port = Number(
      this.configService.get<number>('MAIL_PORT') ||
        process.env.MAIL_PORT ||
        465,
    );
    const secure =
      this.configService.get<string>('MAIL_SECURE') === 'true' || port === 465;

    this.mailFrom =
      this.configService.get<string>('MAIL_FROM') ||
      process.env.MAIL_FROM ||
      `"Teacher Dong Academy" <${user}>`;

    if (!user || !pass) {
      this.logger.warn(
        'Email credentials not fully provided. Mailer is running in mock/logging mode.',
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: host.includes('gmail') ? 'gmail' : undefined,
        host: !host.includes('gmail') ? host : undefined,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 8000,
      });

      this.isConfigured = true;
      this.logger.log(`Nodemailer transporter initialized successfully for ${user}`);
    } catch (err: any) {
      this.logger.error(`Failed to initialize Nodemailer: ${err.message}`);
      this.isConfigured = false;
    }
  }

  public getStatus() {
    return {
      configured: this.isConfigured,
      sender: this.mailFrom,
    };
  }

  /**
   * Send arbitrary email with graceful error handling
   */
  async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const isTest = process.env.NODE_ENV === 'test';
    if (isTest || !this.isConfigured || !this.transporter) {
      this.logger.log(
        `[MOCK/TEST EMAIL DISPATCHED] To: ${options.to} | Subject: "${options.subject}"`,
      );
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.mailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });

      this.logger.log(`Email successfully dispatched to ${options.to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.error(`Error sending email to ${options.to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * 1. Welcome Student & Account Credentials Email (In English)
   */
  async sendWelcomeStudentEmail(data: {
    email: string;
    fullName: string;
    rawPassword: string;
    targetBand?: number | string;
    loginUrl?: string;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const loginLink = data.loginUrl || `${frontendUrl}/login`;

    const subject = `Welcome to Teacher Dong Academy - Your Student Portal Credentials`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Teacher Dong Academy</h1>
          <p style="color: #e0f2fe; margin-top: 8px; font-size: 14px;">Next-Gen IELTS & Business English Training Platform</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome aboard, ${data.fullName}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            We are thrilled to welcome you to <strong>Teacher Dong Academy</strong>. Your dedicated student account has been created by your instructor. You now have full access to our interactive course curriculum, AI IELTS Writing Studio, Speaking Recording Studio, and live WebRTC classrooms.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #0369a1; margin-top: 0; font-size: 16px; margin-bottom: 12px;">Your Login Credentials</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #64748b; padding: 6px 0; width: 140px;">Portal URL:</td>
                <td style="color: #0f172a; font-weight: 600;"><a href="${loginLink}" style="color: #0284c7; text-decoration: none;">${loginLink}</a></td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Registered Email:</td>
                <td style="color: #0f172a; font-weight: 600;">${data.email}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Temporary Password:</td>
                <td style="color: #dc2626; font-weight: 700; font-family: monospace; font-size: 15px;">${data.rawPassword}</td>
              </tr>
              ${data.targetBand ? `
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Target IELTS Band:</td>
                <td style="color: #0f172a; font-weight: 600;">Band ${data.targetBand}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginLink}" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.4);">
              Log In to Student Portal
            </a>
          </div>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
            <p style="color: #991b1b; font-size: 13px; margin: 0; line-height: 1.5;">
              <strong>Security Recommendation:</strong> For your account security, please navigate to <em>Account Settings &gt; Change Password</em> immediately after your first sign-in.
            </p>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Teacher Dong Academy &bull; Building English Fluency with Pedagogical Excellence</p>
          <p style="margin: 4px 0 0 0;">This is an automated notification. If you need assistance, please contact support.</p>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 2. Password Changed / Security Notification (In English)
   */
  async sendPasswordChangedEmail(data: {
    email: string;
    fullName: string;
  }) {
    const subject = `Security Alert: Your Password Was Successfully Updated`;
    const formattedDate = new Date().toUTCString();

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Teacher Dong Academy Security Alert</h2>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 16px;">Hello <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            The password for your Teacher Dong Academy account (<strong>${data.email}</strong>) was successfully changed on <strong>${formattedDate}</strong>.
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            All previous active sessions on other browsers or devices have been automatically invalidated for your protection.
          </p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px; margin-top: 20px;">
            <p style="color: #b91c1c; font-size: 13px; margin: 0;">
              <strong>Didn't make this change?</strong> Please contact Teacher Dong immediately to lock your account and secure your learning data.
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 3. Password Reset by Admin Notification (In English)
   */
  async sendResetPasswordEmail(data: {
    email: string;
    fullName: string;
    newPassword: string;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const loginLink = `${frontendUrl}/login`;

    const subject = `Your Teacher Dong Academy Password Has Been Reset`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0284c7; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Password Reset Notification</h2>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 16px;">Dear <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your account password has been reset by the Academy Administrator. Please use the temporary credentials below to sign in:
          </p>
          <div style="background-color: #f8fafc; border: 1px dashed #0284c7; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 4px;">New Temporary Password:</span>
            <span style="color: #0f172a; font-size: 20px; font-weight: 700; font-family: monospace;">${data.newPassword}</span>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${loginLink}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Sign In to Your Account
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 3.1. Student Forgot Password Link Email
   */
  async sendForgotPasswordEmail(data: {
    email: string;
    fullName: string;
    resetToken: string;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${data.resetToken}&email=${encodeURIComponent(data.email)}`;

    const subject = `Khôi Phục Mật Khẩu - Teacher Dong Academy`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 16px;">Xin chào <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${data.email}</strong> của bạn.
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Liên kết dưới đây có hiệu lực trong vòng <strong>15 phút</strong>. Vui lòng bấm vào nút bên dưới để tiến hành đặt lại mật khẩu mới:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Đặt Lại Mật Khẩu
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 24px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, xin hãy bỏ qua email này. Mật khẩu hiện tại của bạn vẫn an toàn.
          </p>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 3.2. Student Password Reset OTP Email
   */
  async sendPasswordResetOtpEmail(data: {
    email: string;
    fullName: string;
    otpCode: string;
    expiresInMinutes?: number;
  }) {
    const minutes = data.expiresInMinutes || 10;
    const subject = `Mã OTP Đặt Lại Mật Khẩu - Teacher Dong Academy`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Mã Xác Thực Đặt Lại Mật Khẩu (OTP)</h2>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 16px;">Xin chào <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${data.email}</strong> của bạn.
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Dưới đây là mã xác thực OTP của bạn (có hiệu lực trong vòng <strong>${minutes} phút</strong>):
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background-color: #f0f9ff; border: 2px dashed #0284c7; padding: 14px 32px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0284c7;">
              ${data.otpCode}
            </div>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 20px;">
            ⚠️ <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã số này cho bất kỳ ai, kể cả nhân viên học viện. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
          </p>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 3.3. Change Password OTP Email
   */
  async sendChangePasswordOtpEmail(data: {
    email: string;
    fullName: string;
    otpCode: string;
    expiresInMinutes?: number;
  }) {
    const minutes = data.expiresInMinutes || 10;
    const subject = `Mã OTP Xác Thực Thay Đổi Mật Khẩu - Teacher Dong Academy`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Xác Thực Thay Đổi Mật Khẩu</h2>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 16px;">Xin chào <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Bạn đang yêu cầu thay đổi mật khẩu đăng nhập tại tài khoản <strong>${data.email}</strong>.
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Nhập mã OTP 6 chữ số dưới đây vào biểu mẫu để hoàn tất xác thực (có hiệu lực trong <strong>${minutes} phút</strong>):
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background-color: #f0f9ff; border: 2px dashed #0284c7; padding: 14px 32px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0284c7;">
              ${data.otpCode}
            </div>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 20px;">
            ⚠️ <strong>Lưu ý bảo mật:</strong> Nếu không phải bạn thực hiện yêu cầu này, hãy kiểm tra tài khoản hoặc liên hệ Quản trị viên để khóa phiên.
          </p>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 3.4. Student Registration Email Verification OTP
   */
  async sendRegisterOtpEmail(data: {
    email: string;
    fullName: string;
    otpCode: string;
    expiresInMinutes?: number;
  }) {
    const minutes = data.expiresInMinutes || 10;
    const subject = `Mã OTP Xác Thực Đăng Ký Tài Khoản - Teacher Dong Academy`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Teacher Dong Academy</h2>
          <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px;">Xác thực quyền sở hữu email để hoàn tất đăng ký</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 16px; margin-top: 0;">Xin chào <strong>${data.fullName || 'Học viên'}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Cảm ơn bạn đã lựa chọn đăng ký tài khoản tại <strong>Teacher Dong Academy</strong>. Để bảo vệ tài khoản và kích hoạt quyền truy cập, vui lòng nhập mã xác thực OTP 6 chữ số dưới đây:
          </p>
          <div style="text-align: center; margin: 26px 0;">
            <div style="display: inline-block; background-color: #f0f9ff; border: 2px dashed #0284c7; padding: 14px 36px; border-radius: 12px; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0284c7;">
              ${data.otpCode}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Mã xác thực có hiệu lực trong vòng <strong>${minutes} phút</strong></p>
          </div>
          <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px;">
            <p style="color: #334155; font-size: 13px; margin: 0; line-height: 1.5;">
              <strong>Bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho người khác. Nếu bạn không thực hiện yêu cầu này, xin vui lòng bỏ qua email.
            </p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Teacher Dong Academy &bull; Nền tảng Đào tạo IELTS & Phát triển Năng lực</p>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 4. IELTS Writing Assessment Approved & Ready (In English)
   */
  async sendWritingGradedEmail(data: {
    email: string;
    fullName: string;
    promptTitle: string;
    overallBand: number;
    adminFeedback?: string;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const reviewLink = `${frontendUrl}/student/writing`;

    const subject = `IELTS Writing Assessment Ready: "${data.promptTitle}" - Band ${data.overallBand}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 28px 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Writing Assessment Approved!</h2>
          <p style="color: #d1fae5; margin: 6px 0 0 0; font-size: 14px;">Teacher Dong has reviewed your IELTS essay</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 15px;">Hello <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Great news! Your essay for topic <strong>"${data.promptTitle}"</strong> has been thoroughly assessed and approved.
          </p>
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="color: #065f46; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Official Overall Score</span>
            <div style="color: #047857; font-size: 36px; font-weight: 800; margin: 8px 0;">Band ${data.overallBand}</div>
            <p style="color: #047857; font-size: 13px; margin: 0;">Evaluation Criteria: Task Response &bull; Coherence &bull; Lexical Resource &bull; Grammar</p>
          </div>
          ${data.adminFeedback ? `
          <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 16px; margin-bottom: 24px;">
            <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 4px;">Teacher's Comments:</strong>
            <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.5;">${data.adminFeedback}</p>
          </div>` : ''}
          <div style="text-align: center; margin: 28px 0;">
            <a href="${reviewLink}" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Full Essay & AI Inline Corrections
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 5. IELTS Speaking Assessment Ready (In English)
   */
  async sendSpeakingGradedEmail(data: {
    email: string;
    fullName: string;
    promptTitle: string;
    bandScore: number;
    feedback?: string;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const reviewLink = `${frontendUrl}/student/speaking`;

    const subject = `IELTS Speaking Assessment Ready: "${data.promptTitle}" - Band ${data.bandScore}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 28px 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Speaking Recording Evaluated!</h2>
          <p style="color: #ede9fe; margin: 6px 0 0 0; font-size: 14px;">Feedback and timestamp remarks are now available</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 15px;">Hello <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your audio recording for <strong>"${data.promptTitle}"</strong> has been listened to and graded by Teacher Dong.
          </p>
          <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="color: #5b21b6; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Overall Speaking Band</span>
            <div style="color: #6d28d9; font-size: 36px; font-weight: 800; margin: 8px 0;">Band ${data.bandScore}</div>
            <p style="color: #5b21b6; font-size: 13px; margin: 0;">Fluency &bull; Lexical Resource &bull; Grammatical Accuracy &bull; Pronunciation</p>
          </div>
          ${data.feedback ? `
          <div style="background-color: #f8fafc; border-left: 4px solid #7c3aed; padding: 14px 16px; margin-bottom: 24px;">
            <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 4px;">Instructor Remarks:</strong>
            <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.5;">${data.feedback}</p>
          </div>` : ''}
          <div style="text-align: center; margin: 28px 0;">
            <a href="${reviewLink}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Listen & Check Timeline Marker Feedback
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 6. New Exam / Mock Test Assigned Notification Email (In Vietnamese / English)
   */
  async sendNewExamAssignedEmail(data: {
    email: string;
    fullName: string;
    examTitle: string;
    skill: string;
    durationMinutes: number;
    dueDate?: string;
    examUrl?: string;
    hasAudio?: boolean;
    hasPdf?: boolean;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const testLink = data.examUrl || `${frontendUrl}/student/quizzes`;

    const subject = `[Teacher Dong Academy] Đề thi mới: "${data.examTitle}" - Kỹ năng ${data.skill}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Teacher Dong Academy</h1>
          <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px;">Thông báo giao đề thi / bài tập thực chiến mới</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #0f172a; font-size: 15px; margin-top: 0;">Xin chào <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Thầy Đông vừa phát hành đề thi mới trên hệ thống học tập của bạn. Dưới đây là thông tin chi tiết bài thi:
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #64748b; padding: 7px 0; width: 140px; font-weight: 500;">Tên đề thi:</td>
                <td style="color: #0f172a; font-weight: 700;">${data.examTitle}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 7px 0; font-weight: 500;">Kỹ năng khảo thí:</td>
                <td style="color: #0284c7; font-weight: 700;">${data.skill}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 7px 0; font-weight: 500;">Thời lượng:</td>
                <td style="color: #0f172a; font-weight: 600;">${data.durationMinutes} phút</td>
              </tr>
              ${data.dueDate ? `
              <tr>
                <td style="color: #dc2626; padding: 7px 0; font-weight: 600;">Hạn chót nộp bài:</td>
                <td style="color: #dc2626; font-weight: 700;">${data.dueDate}</td>
              </tr>` : ''}
              <tr>
                <td style="color: #64748b; padding: 7px 0; font-weight: 500;">Học liệu kèm theo:</td>
                <td style="color: #059669; font-weight: 600;">
                  ${data.hasAudio ? '🎧 Có tệp âm thanh Audio ' : ''}
                  ${data.hasPdf ? '📄 Có tệp đề PDF ' : ''}
                  ${!data.hasAudio && !data.hasPdf ? 'Hệ thống câu hỏi trực tuyến' : ''}
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${testLink}" style="background-color: #0284c7; color: #ffffff; padding: 14px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.4);">
              Bắt Đầu Làm Bài Ngay
            </a>
          </div>

          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px;">
            <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
              <strong>Lưu ý:</strong> Đảm bảo đường truyền internet ổn định và thiết bị tai nghe trước khi bấm bắt đầu làm bài.
            </p>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Teacher Dong Academy &bull; Nền tảng Đào tạo IELTS & Kỹ Năng Sư Phạm</p>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 7. Exam Submission Confirmed Email to Student
   */
  async sendExamSubmissionConfirmedEmail(data: {
    email: string;
    fullName: string;
    examTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    isPassed: boolean;
    submittedAt?: string;
    reviewUrl?: string;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const reviewLink = data.reviewUrl || `${frontendUrl}/student/quizzes`;
    const submittedTime = data.submittedAt || new Date().toLocaleString('vi-VN');

    const subject = `[Teacher Dong Academy] Xác nhận nộp bài thi: "${data.examTitle}" - Điểm: ${data.percentage}%`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: ${data.isPassed ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'}; padding: 26px 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Nộp Bài Thi Thành Công!</h2>
          <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px;">Hệ thống đã ghi nhận bài làm của bạn vào lúc ${submittedTime}</p>
        </div>
        <div style="padding: 30px 24px;">
          <p style="color: #0f172a; font-size: 15px;">Xin chào <strong>${data.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Bạn vừa hoàn thành và nộp bài cho đề thi <strong>"${data.examTitle}"</strong>. Dưới đây là kết quả tự động chấm tức thì:
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Điểm số trắc nghiệm</span>
            <div style="color: ${data.isPassed ? '#059669' : '#0284c7'}; font-size: 38px; font-weight: 800; margin: 8px 0;">${data.percentage}%</div>
            <p style="color: #334155; font-size: 14px; margin: 0; font-weight: 600;">
              Trả lời đúng: ${data.score} / ${data.totalQuestions} câu hỏi &bull; Trạng thái: ${data.isPassed ? 'Đạt điểm sàn' : 'Chưa đạt sàn'}
            </p>
          </div>

          <div style="text-align: center; margin: 26px 0;">
            <a href="${reviewLink}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
              Xem Chi Tiết Bài Làm & Lời Giải
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.email, subject, html });
  }

  /**
   * 8. New Submission Alert Email to Admin
   */
  async sendNewSubmissionToAdminEmail(data: {
    adminEmail: string;
    studentName: string;
    studentEmail: string;
    examTitle: string;
    skill: string;
    score?: number;
    gradingUrl?: string;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const gradingLink = data.gradingUrl || `${frontendUrl}/admin/assessments`;

    const subject = `[Admin Alert] Học viên ${data.studentName} vừa nộp bài: "${data.examTitle}"`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Thông Báo Bài Nộp Mới Cần Chấm</h2>
        </div>
        <div style="padding: 28px 24px;">
          <p style="color: #0f172a; font-size: 14px;">Thầy Đông thân mến,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Học viên <strong>${data.studentName}</strong> (<em>${data.studentEmail}</em>) vừa hoàn thành và nộp bài thi <strong>"${data.examTitle}"</strong> (${data.skill}).
          </p>
          ${data.score !== undefined ? `
          <div style="background-color: #f1f5f9; padding: 14px; border-radius: 8px; margin: 16px 0; font-size: 14px;">
            <strong>Điểm trắc nghiệm tự động:</strong> ${data.score}%
          </div>` : ''}
          <div style="text-align: center; margin: 24px 0;">
            <a href="${gradingLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
              Mở Trang Chấm Điểm & Phản Hồi
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendMail({ to: data.adminEmail, subject, html });
  }

  /**
   * Helper: Strip HTML tags to create plain-text fallback
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  }
}
