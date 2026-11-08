import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../core/common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Quiz Engine & Instant Assessment')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo bài trắc nghiệm (Quiz) mới gắn với bài học' })
  @ApiResponse({ status: 201, description: 'Tạo Quiz thành công' })
  createQuiz(@Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(dto);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin thêm câu hỏi và đáp án vào bài Quiz' })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  addQuestion(
    @Param('id') id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzesService.addQuestion(id, dto);
  }

  @Get('lesson/:lessonId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy bài Quiz theo bài học' })
  @ApiParam({ name: 'lessonId', description: 'UUID của bài học' })
  getQuizByLesson(@Param('lessonId') lessonId: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.quizzesService.getQuizByLesson(lessonId, user?.role);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy nội dung bài Quiz (ẩn đáp án đúng đối với học viên)' })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  getQuizById(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.quizzesService.getQuizById(id, user?.role);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Học viên nộp bài làm Quiz -> Chấm tức thì, đạt sàn >= 80% tự động mở khóa / hoàn thành bài học',
  })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  submitQuiz(
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizzesService.submitQuiz(id, dto, user.id);
  }

  @Get(':id/my-submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên xem lịch sử điểm số và lời giải bài Quiz' })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  getMySubmissions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quizzesService.getMySubmissions(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa bài Quiz' })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  deleteQuiz(@Param('id') id: string) {
    return this.quizzesService.deleteQuiz(id);
  }
}
