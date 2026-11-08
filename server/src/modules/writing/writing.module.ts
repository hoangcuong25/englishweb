import { Module } from '@nestjs/common';
import { WritingService } from './writing.service';
import { WritingController } from './writing.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { GeminiModule } from '../../core/gemini/gemini.module';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [WritingController],
  providers: [WritingService],
  exports: [WritingService],
})
export class WritingModule {}
