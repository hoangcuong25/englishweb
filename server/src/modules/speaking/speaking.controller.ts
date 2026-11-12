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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SpeakingService } from './speaking.service';
import { CreateSpeakingPromptDto } from './dto/create-speaking-prompt.dto';
import { SubmitSpeakingDto } from './dto/submit-speaking.dto';
import { GradeSpeakingDto } from './dto/grade-speaking.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role, SubmissionStatus } from '@prisma/client';

@ApiTags('IELTS Speaking Studio')
@Controller('speaking')
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

  // ==========================================
  // PROMPTS ENDPOINTS
  // ==========================================

  @Get('prompts')
  @ApiOperation({ summary: 'Lấy danh sách đề bài luyện Speaking' })
  @ApiQuery({ name: 'lessonId', required: false, type: String })
  findAllPrompts(@Query('lessonId') lessonId?: string) {
    return this.speakingService.findAllPrompts(lessonId);
  }

  @Get('prompts/:id')
  @ApiOperation({ summary: 'Lấy chi tiết đề bài Speaking' })
  @ApiParam({ name: 'id', description: 'UUID của đề bài' })
  findPromptById(@Param('id') id: string) {
    return this.speakingService.findPromptById(id);
  }

  @Post('prompts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo đề bài Speaking mới' })
  @ApiResponse({ status: 201, description: 'Tạo đề bài thành công' })
  createPrompt(@Body() dto: CreateSpeakingPromptDto) {
    return this.speakingService.createPrompt(dto);
  }

  @Put('prompts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật đề bài Speaking' })
  @ApiParam({ name: 'id', description: 'UUID của đề bài' })
  updatePrompt(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSpeakingPromptDto>,
  ) {
    return this.speakingService.updatePrompt(id, dto);
  }

  @Delete('prompts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa đề bài Speaking' })
  @ApiParam({ name: 'id', description: 'UUID của đề bài' })
  deletePrompt(@Param('id') id: string) {
    return this.speakingService.deletePrompt(id);
  }

  // ==========================================
  // SUBMISSIONS ENDPOINTS
  // ==========================================

  @Post('submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên nộp file ghi âm bài nói Speaking' })
  @ApiResponse({ status: 201, description: 'Nộp bài nói thành công' })
  submitRecording(@Body() dto: SubmitSpeakingDto, @CurrentUser() user: any) {
    return this.speakingService.submitRecording(dto, user.id);
  }

  @Post('submissions/with-audio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('audioFile'))
  @ApiOperation({ summary: 'Học viên upload trực tiếp file âm thanh và nộp bài Speaking lên Cloudinary' })
  @ApiResponse({ status: 201, description: 'Upload và nộp bài nói thành công' })
  submitRecordingWithFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('promptId') promptId: string,
    @Body('durationSeconds') durationSeconds: number,
    @CurrentUser() user: any,
  ) {
    return this.speakingService.submitRecordingWithFile(
      file,
      promptId,
      durationSeconds,
      user.id,
    );
  }

  @Get('submissions/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên xem danh sách các bài ghi âm đã nộp và điểm đánh giá' })
  getMySubmissions(@CurrentUser() user: any) {
    return this.speakingService.getMySubmissions(user.id);
  }

  @Get('submissions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem chi tiết bài ghi âm, điểm 4 tiêu chí và timestamp feedback' })
  @ApiParam({ name: 'id', description: 'UUID của bài nộp' })
  getSubmissionById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.speakingService.getSubmissionById(id, user.id, user.role);
  }

  // ==========================================
  // ADMIN TEACHER GRADING STUDIO
  // ==========================================

  @Get('admin/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xem danh sách bài nói chờ chấm hoặc đã chấm' })
  @ApiQuery({ name: 'status', required: false, enum: SubmissionStatus })
  getAdminSubmissions(
    @Query('status') status?: SubmissionStatus,
  ) {
    return this.speakingService.getAdminSubmissions(status);
  }

  @Post('admin/submissions/:id/grade')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Giáo viên chấm điểm 4 tiêu chí (FC, LR, GRA, PR), nhập nhận xét và gắn timestamp feedback',
  })
  @ApiParam({ name: 'id', description: 'UUID của bài nộp' })
  gradeSubmission(
    @Param('id') id: string,
    @Body() dto: GradeSpeakingDto,
    @CurrentUser() admin: any,
  ) {
    return this.speakingService.gradeSubmission(id, dto, admin.id);
  }
}
