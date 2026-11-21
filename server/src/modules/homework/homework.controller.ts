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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { GradeHomeworkDto } from './dto/grade-homework.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ResponseMessage } from '../../core/common/decorators/response-message.decorator';
import { Role } from '@prisma/client';

@ApiTags('Homework & Assignments System')
@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin giao bài tập về nhà mới cho khóa học' })
  @ApiResponse({ status: 201, description: 'Giao bài tập thành công' })
  @ResponseMessage('Giao bài tập về nhà thành công')
  create(@Body() dto: CreateHomeworkDto) {
    return this.homeworkService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài tập về nhà (có thể lọc theo khóa học)' })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Danh sách bài tập về nhà' })
  findAll(@Query('courseId') courseId?: string) {
    return this.homeworkService.findAll({ courseId });
  }

  @Get('student/my-homework')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Học viên lấy danh sách bài tập được giao kèm trạng thái nộp bài' })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Danh sách bài tập của học viên' })
  getMyHomeworks(
    @CurrentUser('id') studentId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.homeworkService.getMyHomeworks(studentId, courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết bài tập về nhà (Admin xem tất cả bài nộp, Học viên xem bài của mình)' })
  @ApiParam({ name: 'id', description: 'ID bài tập' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài tập' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.homeworkService.findOne(id, user.role, user.id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin cập nhật thông tin bài tập về nhà' })
  @ApiParam({ name: 'id', description: 'ID bài tập' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ResponseMessage('Cập nhật bài tập về nhà thành công')
  update(@Param('id') id: string, @Body() dto: UpdateHomeworkDto) {
    return this.homeworkService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xóa bài tập về nhà' })
  @ApiParam({ name: 'id', description: 'ID bài tập' })
  @ApiResponse({ status: 200, description: 'Xóa bài tập thành công' })
  @ResponseMessage('Xóa bài tập về nhà thành công')
  remove(@Param('id') id: string) {
    return this.homeworkService.remove(id);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Học viên nộp bài làm (văn bản hoặc file đính kèm)' })
  @ApiParam({ name: 'id', description: 'ID bài tập' })
  @ApiResponse({ status: 201, description: 'Nộp bài thành công' })
  @ResponseMessage('Nộp bài tập về nhà thành công')
  submitHomework(
    @Param('id') id: string,
    @CurrentUser('id') studentId: string,
    @Body() dto: SubmitHomeworkDto,
  ) {
    return this.homeworkService.submitHomework(id, studentId, dto);
  }

  @Put('submissions/:submissionId/grade')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin chấm điểm và nhận xét bài nộp của học viên' })
  @ApiParam({ name: 'submissionId', description: 'ID bài nộp' })
  @ApiResponse({ status: 200, description: 'Chấm điểm thành công' })
  @ResponseMessage('Đã lưu điểm và nhận xét bài tập')
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeHomeworkDto,
  ) {
    return this.homeworkService.gradeSubmission(submissionId, dto);
  }
}
