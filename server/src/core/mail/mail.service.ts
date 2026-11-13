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
   * Helper: Strip HTML tags to create plain-text fallback
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  }
}
