import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendTestMailDto, SendCustomMailDto } from './dto/send-mail.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Mail Service')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current email dispatch status and configured sender' })
  getStatus() {
    return this.mailService.getStatus();
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin test email dispatch with English content' })
  @ApiResponse({ status: 200, description: 'Test email dispatch attempt result' })
  async sendTestMail(@Body() dto: SendTestMailDto) {
    const subject = dto.subject || 'Teacher Dong Academy - System SMTP Verification Test';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0284c7; margin-top: 0;">Teacher Dong Academy &bull; SMTP Test</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          This is an automated test email confirming that the Nodemailer dispatch pipeline is fully operational.
        </p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; margin: 16px 0;">
          <strong style="color: #166534; font-size: 13px;">Status: SMTP Service Active & Verified</strong>
          <p style="color: #15803d; font-size: 12px; margin: 4px 0 0 0;">Timestamp: ${new Date().toISOString()}</p>
        </div>
        ${dto.content ? `<p style="color: #475569; font-size: 14px;"><strong>Custom Note:</strong> ${dto.content}</p>` : ''}
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Teacher Dong Academy &bull; Automated Infrastructure Verification</p>
      </div>
    `;

    return this.mailService.sendMail({
      to: dto.to,
      subject,
      html,
    });
  }

  @Post('send-custom')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin dispatch custom English announcement email' })
  async sendCustomMail(@Body() dto: SendCustomMailDto) {
    return this.mailService.sendMail({
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
    });
  }
}
