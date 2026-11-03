import { Controller, Post, Body, Headers, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LivekitService } from './livekit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
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

  @Post('end-room')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Host ends class for everyone' })
  async endRoom(@Body('roomName') roomName: string) {
    return this.livekitService.endRoom(roomName);
  }

  @Post('mute-participant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Host mutes a participant track' })
  async muteParticipant(
    @Body('roomName') roomName: string,
    @Body('identity') identity: string,
    @Body('trackSid') trackSid: string,
    @Body('muted') muted: boolean,
  ) {
    return this.livekitService.muteParticipantTrack(roomName, identity, trackSid, muted);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'LiveKit SFU webhook endpoint for participant events' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('authorization') authHeader: string,
  ) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    return this.livekitService.handleWebhook(rawBody, authHeader);
  }
}
