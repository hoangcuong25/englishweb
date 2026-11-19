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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../core/common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role, CourseCategory } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Courses & LMS Catalog')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh mục 5 trụ cột đào tạo của Teacher Dong Academy' })
  getCategories() {
    return this.coursesService.getCategories();
  }

  @Get('my-learning')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách khóa học mà học viên đã ghi danh kèm tiến độ %' })
  getMyLearning(@CurrentUser() user: any) {
    return this.coursesService.findMyLearning(user.id);
  }

  @Get('ielts-access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra học viên có quyền truy cập phân hệ IELTS 4 kỹ năng hay không (yêu cầu sở hữu khóa Tiếng Anh)' })
  checkIeltsAccess(@CurrentUser() user: any) {
    return this.coursesService.checkIeltsAccess(user.id, user.role);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách khóa học (lọc theo trụ cột danh mục và từ khóa tìm kiếm)' })
  @ApiQuery({ name: 'category', required: false, enum: CourseCategory })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Req() req: Request,
    @Query('category') category?: CourseCategory,
    @Query('search') search?: string,
  ) {
    const user = (req as any).user;
    return this.coursesService.findAll(user?.role, category, search);
  }

  @Get(':slugOrId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết khóa học, toàn bộ Modules và Bài học' })
  @ApiParam({ name: 'slugOrId', description: 'Slug hoặc UUID của khóa học' })
  findOne(@Param('slugOrId') slugOrId: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.coursesService.findBySlugOrId(slugOrId, user?.id, user?.role);
  }

  @Post('upload-thumbnail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tải lên ảnh bìa cho khóa học và nhận về URL' })
  uploadThumbnailGeneral(@UploadedFile() file: Express.Multer.File) {
    return this.coursesService.uploadThumbnailGeneral(file);
  }

  @Post(':id/thumbnail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tải lên ảnh bìa và cập nhật trực tiếp vào khóa học' })
  @ApiParam({ name: 'id', description: 'UUID của khóa học' })
  uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.uploadThumbnail(id, file);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo khóa học mới' })
  @ApiResponse({ status: 201, description: 'Tạo khóa học thành công' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật thông tin khóa học' })
  @ApiParam({ name: 'id', description: 'UUID của khóa học' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa khóa học' })
  @ApiParam({ name: 'id', description: 'UUID của khóa học' })
  remove(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên ghi danh trực tiếp tham gia khóa học' })
  @ApiParam({ name: 'id', description: 'UUID của khóa học cần ghi danh' })
  enroll(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.enrollCourse(id, user.id);
  }

  @Post(':id/enroll-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên gửi yêu cầu đăng ký kèm xác nhận chuyển khoản QR' })
  @ApiParam({ name: 'id', description: 'UUID của khóa học' })
  requestEnroll(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { paymentNote?: string; paymentAmount?: number },
  ) {
    return this.coursesService.requestEnrollment(
      id,
      user.id,
      body?.paymentNote,
      body?.paymentAmount,
    );
  }

  @Get('admin/enrollments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin lấy danh sách tất cả yêu cầu đăng ký / ghi danh khóa học' })
  @ApiQuery({ name: 'status', required: false, description: 'PENDING | ACTIVE | REJECTED' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Lọc theo khóa học' })
  getAdminEnrollments(
    @Query('status') status?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.coursesService.getAdminEnrollments(status, courseId);
  }

  @Put('admin/enrollments/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xác nhận chuyển khoản thành công và kích hoạt khóa học cho học viên' })
  @ApiParam({ name: 'id', description: 'UUID của enrollment' })
  approveEnrollment(@Param('id') id: string) {
    return this.coursesService.approveEnrollment(id);
  }

  @Put('admin/enrollments/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin từ chối yêu cầu đăng ký khóa học' })
  @ApiParam({ name: 'id', description: 'UUID của enrollment' })
  rejectEnrollment(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.coursesService.rejectEnrollment(id, reason);
  }

  @Post('admin/manual-enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin ghi danh thủ công học viên vào khóa học' })
  manualEnroll(@Body() body: { courseId: string; userId: string }) {
    return this.coursesService.manualEnroll(body.courseId, body.userId);
  }
}
