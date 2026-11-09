import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ResponseMessage } from '../../core/common/decorators/response-message.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('student')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get student learning analytics and overview' })
  @ApiResponse({ status: 200, description: 'Student dashboard overview data' })
  @ResponseMessage('Lấy thông tin dashboard học viên thành công')
  async getStudentDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStudentDashboard(userId);
  }

  @Get('admin')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get overall academy metrics, action items, and live classrooms' })
  @ApiResponse({ status: 200, description: 'Admin academy metrics and analytics' })
  @ResponseMessage('Lấy thông tin dashboard quản trị viên thành công')
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }
}
