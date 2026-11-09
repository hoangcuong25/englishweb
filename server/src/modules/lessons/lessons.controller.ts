import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderItemsDto } from './dto/reorder-items.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../core/common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Curriculum & Lessons Engine')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // ==========================================
  // MODULES (CHƯƠNG HỌC)
  // ==========================================

  @Post('modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo Module (Chương học) mới' })
  @ApiResponse({ status: 201, description: 'Tạo chương học thành công' })
  createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.lessonsService.createModule(createModuleDto);
  }

  @Put('modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật chương học' })
  @ApiParam({ name: 'id', description: 'UUID của chương học' })
  updateModule(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.lessonsService.updateModule(id, updateModuleDto);
  }

  @Delete('modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa chương học' })
  @ApiParam({ name: 'id', description: 'UUID của chương học' })
  removeModule(@Param('id') id: string) {
    return this.lessonsService.deleteModule(id);
  }

  @Post('modules/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin sắp xếp lại thứ tự các chương học trong khóa' })
  reorderModules(@Body() reorderDto: ReorderItemsDto) {
    return this.lessonsService.reorderModules(reorderDto.items);
  }

  // ==========================================
  // LESSONS (BÀI HỌC)
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo bài học mới trong chương' })
  @ApiResponse({ status: 201, description: 'Tạo bài học thành công' })
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật bài học' })
  @ApiParam({ name: 'id', description: 'UUID của bài học' })
  updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa bài học' })
  @ApiParam({ name: 'id', description: 'UUID của bài học' })
  removeLesson(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin sắp xếp lại thứ tự bài học trong chương' })
  reorderLessons(@Body() reorderDto: ReorderItemsDto) {
    return this.lessonsService.reorderLessons(reorderDto.items);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết bài học (nội dung, video, tài liệu, quiz)' })
  @ApiParam({ name: 'id', description: 'UUID của bài học' })
  getLesson(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.lessonsService.getLesson(id, user?.id, user?.role);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên đánh dấu hoàn thành bài học và tự động tính lại % tiến độ khóa học' })
  @ApiParam({ name: 'id', description: 'UUID của bài học' })
  completeLesson(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lessonsService.completeLesson(id, user.id);
  }

  @Post(':id/video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin upload video bài giảng lên Cloudinary' })
  @ApiParam({ name: 'id', description: 'UUID của bài học' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.lessonsService.updateLessonVideo(id, file);
  }
}
