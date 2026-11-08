import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { WritingModule } from './modules/writing/writing.module';
import { SpeakingModule } from './modules/speaking/speaking.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ChatModule } from './modules/chat/chat.module';
import { LivekitModule } from './core/livekit/livekit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    MaterialsModule,
    WritingModule,
    SpeakingModule,
    QuizzesModule,
    AttendanceModule,
    DashboardModule,
    ChatModule,
    LivekitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
