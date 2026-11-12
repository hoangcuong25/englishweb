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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WritingService } from './writing.service';
import { CreateWritingPromptDto } from './dto/create-writing-prompt.dto';
import { SubmitWritingDto } from './dto/submit-writing.dto';
import { ApproveWritingDto } from './dto/approve-writing.dto';
import { SaveWritingDraftDto } from './dto/save-writing-draft.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role, WritingTaskType, WritingSubmissionStatus } from '@prisma/client';

@ApiTags('AI IELTS Writing Studio')
@Controller('writing')
export class WritingController {
  constructor(private readonly writingService: WritingService) {}

  // ==========================================
  // PROMPTS ENDPOINTS
  // ==========================================

  @Get('prompts')
  @ApiOperation({ summary: 'Lấy danh sách đề bài Writing Task 1 & 2' })
  @ApiQuery({ name: 'taskType', required: false, enum: WritingTaskType })
  @ApiQuery({ name: 'lessonId', required: false, type: String })
  findAllPrompts(
    @Query('taskType') taskType?: WritingTaskType,
    @Query('lessonId') lessonId?: string,
  ) {
    return this.writingService.findAllPrompts(taskType, lessonId);
  }

  @Get('prompts/:id')
  @ApiOperation({ summary: 'Lấy chi tiết đề bài Writing' })
  @ApiParam({ name: 'id', description: 'UUID của đề bài' })
  findPromptById(@Param('id') id: string) {
    return this.writingService.findPromptById(id);
  }

  @Post('prompts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo đề bài Writing mới' })
  @ApiResponse({ status: 201, description: 'Tạo đề bài thành công' })
  createPrompt(@Body() dto: CreateWritingPromptDto) {
    return this.writingService.createPrompt(dto);
  }

  @Put('prompts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật đề bài Writing' })
  @ApiParam({ name: 'id', description: 'UUID của đề bài' })
  updatePrompt(
    @Param('id') id: string,
    @Body() dto: Partial<CreateWritingPromptDto>,
  ) {
    return this.writingService.updatePrompt(id, dto);
  }

  @Delete('prompts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa đề bài Writing' })
  @ApiParam({ name: 'id', description: 'UUID của đề bài' })
  deletePrompt(@Param('id') id: string) {
    return this.writingService.deletePrompt(id);
  }

  // ==========================================
  // WRITING DRAFTS (AUTO-SAVE)
  // ==========================================

  @Post('drafts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên tự động lưu bản nháp bài viết đang làm' })
  saveDraft(@Body() dto: SaveWritingDraftDto, @CurrentUser() user: any) {
    return this.writingService.saveDraft(user.id, dto);
  }

  @Get('drafts/:promptId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên lấy bản nháp bài viết đang làm dở' })
  @ApiParam({ name: 'promptId', description: 'UUID của đề bài Writing' })
  getDraft(@Param('promptId') promptId: string, @CurrentUser() user: any) {
    return this.writingService.getDraft(user.id, promptId);
  }

  @Delete('drafts/:promptId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên xóa bản nháp bài viết' })
  @ApiParam({ name: 'promptId', description: 'UUID của đề bài Writing' })
  deleteDraft(@Param('promptId') promptId: string, @CurrentUser() user: any) {
    return this.writingService.deleteDraft(user.id, promptId);
  }

  // ==========================================
  // SUBMISSIONS & AI EVALUATION
  // ==========================================

  @Post('submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Học viên nộp bài viết -> Kích hoạt AI chấm 4 tiêu chí IELTS và sinh bài mẫu Band 8.0+',
  })
  @ApiResponse({ status: 201, description: 'Nộp bài và phân tích thành công' })
  submitEssay(@Body() dto: SubmitWritingDto, @CurrentUser() user: any) {
    return this.writingService.submitEssay(dto, user.id);
  }

  @Get('submissions/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên xem lịch sử các bài viết đã nộp của mình' })
  getMySubmissions(@CurrentUser() user: any) {
    return this.writingService.getMySubmissions(user.id);
  }

  @Get('submissions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem chi tiết bài nộp và kết quả phân tích AI' })
  @ApiParam({ name: 'id', description: 'UUID của bài nộp' })
  getSubmissionById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.writingService.getSubmissionById(id, user.id, user.role);
  }

  // ==========================================
  // ADMIN REVIEW & APPROVAL WORKFLOW
  // ==========================================

  @Get('admin/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xem danh sách bài viết học viên chờ duyệt hoặc đã duyệt' })
  @ApiQuery({ name: 'status', required: false, enum: WritingSubmissionStatus })
  getAdminSubmissions(
    @Query('status') status?: WritingSubmissionStatus,
  ) {
    return this.writingService.getAdminSubmissions(status);
  }

  @Post('admin/submissions/:id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Admin xem xét, điều chỉnh điểm (override) và phê duyệt công bố kết quả cho học viên',
  })
  @ApiParam({ name: 'id', description: 'UUID của bài nộp' })
  approveSubmission(
    @Param('id') id: string,
    @Body() dto: ApproveWritingDto,
    @CurrentUser() admin: any,
  ) {
    return this.writingService.approveSubmission(id, dto, admin.id);
  }
}
