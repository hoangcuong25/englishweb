import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Res,
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
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { OverrideAttendanceDto } from './dto/override-attendance.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { Response } from 'express';

@ApiTags('Automated Attendance & Reporting')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('classrooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo phòng học trực tuyến mới theo lịch' })
  @ApiResponse({ status: 201, description: 'Tạo phòng học thành công' })
  createClassroom(
    @Body() dto: CreateClassroomDto,
    @CurrentUser() admin: any,
  ) {
    return this.attendanceService.createClassroom(dto, admin.id);
  }

  @Get('classrooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xem danh sách các phòng học trực tuyến' })
  getClassrooms() {
    return this.attendanceService.getClassrooms();
  }

  @Get('classroom/:classroomId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xem danh sách điểm danh của một phòng học' })
  @ApiParam({ name: 'classroomId', description: 'UUID của phòng học' })
  getAttendanceByClassroom(@Param('classroomId') classroomId: string) {
    return this.attendanceService.getAttendanceByClassroom(classroomId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên xem lịch sử điểm danh của cá nhân' })
  getMyAttendance(@CurrentUser() user: any) {
    return this.attendanceService.getMyAttendance(user.id);
  }

  @Put(':id/override')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Admin điều chỉnh thủ công trạng thái điểm danh (PRESENT/LATE/ABSENT) và lưu ghi chú',
  })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi điểm danh' })
  overrideAttendance(
    @Param('id') id: string,
    @Body() dto: OverrideAttendanceDto,
  ) {
    return this.attendanceService.overrideAttendance(id, dto);
  }

  @Get('classroom/:classroomId/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xuất báo cáo điểm danh dưới định dạng Excel (.xlsx)' })
  @ApiParam({ name: 'classroomId', description: 'UUID của phòng học' })
  async exportExcel(
    @Param('classroomId') classroomId: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } =
      await this.attendanceService.exportAttendanceToExcel(classroomId);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
