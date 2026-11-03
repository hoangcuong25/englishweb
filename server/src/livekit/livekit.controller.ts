import { Controller, Post, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LivekitService } from './livekit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('LiveKit WebRTC')
@Controller('livekit')
export class LivekitController {
  constructor(private livekitService: LivekitService) {}

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate access token for WebRTC classroom' })
  async getToken(
    @Body('roomName') roomName: string,
    @CurrentUser() user: any,
  ) {
    return this.livekitService.createToken(
      roomName,
      user.id,
      user.fullName,
      user.role,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'LiveKit SFU webhook endpoint for participant events' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('authorization') authHeader: string,
  ) {
    // Body can be string or buffer or object
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    return this.livekitService.handleWebhook(rawBody, authHeader);
  }
}
