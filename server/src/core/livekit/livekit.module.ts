import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LivekitService } from './livekit.service';
import { LivekitController } from './livekit.controller';
import { WhiteboardService } from './whiteboard.service';
import { WhiteboardGateway } from './whiteboard.gateway';

@Module({
  imports: [ConfigModule],
  controllers: [LivekitController],
  providers: [LivekitService, WhiteboardService, WhiteboardGateway],
  exports: [LivekitService, WhiteboardService],
})
export class LivekitModule {}
