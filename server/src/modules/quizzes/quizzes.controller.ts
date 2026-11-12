import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateBulkQuestionsDto } from './dto/create-bulk-questions.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../core/common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role, SkillType } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Quiz Engine & Instant Assessment')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo bài trắc nghiệm / Test 4 kỹ năng mới' })
  @ApiResponse({ status: 201, description: 'Tạo Quiz thành công' })
  createQuiz(@Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin lấy danh sách tất cả các bài Quiz / Test trong hệ thống' })
  @ApiQuery({ name: 'skill', required: false, enum: SkillType })
  @ApiQuery({ name: 'testType', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAllQuizzes(
    @Query('skill') skill?: SkillType,
    @Query('testType') testType?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.quizzesService.findAllQuizzes({
      skill,
      testType,
      search,
      page,
      limit,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật thông tin bài Quiz' })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  updateQuiz(
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzesService.updateQuiz(id, dto);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin thêm câu hỏi phân loại theo dạng bài và kỹ năng' })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  addQuestion(
    @Param('id') id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzesService.addQuestion(id, dto);
  }

  @Post(':id/questions/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin thêm hàng loạt câu hỏi vào đề thi' })
  @ApiParam({ name: 'id', description: 'UUID của bài Quiz' })
  addQuestionsBulk(
    @Param('id') id: string,
    @Body() dto: CreateBulkQuestionsDto,
  ) {
    return this.quizzesService.addQuestionsBulk(id, dto.questions);
  }

  // ==========================================
  // 4-SKILLS DIAGNOSTIC ANALYTICS ENDPOINTS
  // ==========================================

  @Get('skills/tests')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách đề thi phân loại theo 4 kỹ năng (Reading, Listening, Writing, Speaking)' })
  @ApiQuery({ name: 'skill', required: false, enum: SkillType })
  findSkillsTests(@Query('skill') skill?: SkillType, @Req() req?: Request) {
    const user = (req as any)?.user;
    return this.quizzesService.findSkillsTests(skill, user?.role);
  }

  @Get('diagnostic/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Học viên xem báo cáo chẩn đoán năng lực 4 kỹ năng: phân tích dạng bài hay làm sai, điểm yếu, điểm mạnh và gợi ý cải thiện',
  })
  @ApiQuery({ name: 'skill', required: false, enum: SkillType })
  getMyDiagnostic(
    @CurrentUser('id') userId: string,
    @Query('skill') skill?: SkillType,
  ) {
    return this.quizzesService.getStudentSkillsDiagnostic(userId, skill);
  }

  @Get('diagnostic/admin/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Admin xem tổng quan chẩn đoán toàn học viện: thống kê các dạng câu hỏi học sinh hay làm sai nhất',
  })
  @ApiQuery({ name: 'skill', required: false, enum: SkillType })
  getAdminDiagnosticOverview(@Query('skill') skill?: SkillType) {
    return this.quizzesService.getAdminSkillsDiagnosticOverview(skill);
  }

  @Get('diagnostic/students/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xem chi tiết chẩn đoán năng lực và các dạng câu hỏi yếu của một học viên' })
  @ApiParam({ name: 'studentId', description: 'UUID của học viên' })
  @ApiQuery({ name: 'skill', required: false, enum: SkillType })
  getStudentDiagnosticByAdmin(
    @Param('studentId') studentId: string,
    @Query('skill') skill?: SkillType,
  ) {
    return this.quizzesService.getStudentSkillsDiagnostic(studentId, skill);
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
