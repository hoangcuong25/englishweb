import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { ResponseMessage } from '../../core/common/decorators/response-message.decorator';
import { Role } from '@prisma/client';

@ApiTags('User & Student Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Admin tạo tài khoản học viên mới' })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản học viên thành công' })
  @ResponseMessage('Tạo tài khoản học viên thành công')
  async createStudent(@Body() dto: CreateUserDto) {
    return this.usersService.createStudent(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Admin lấy danh sách học viên và người dùng (có lọc & phân trang)' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng' })
  @ResponseMessage('Lấy danh sách người dùng thành công')
  async findAll(
    @Query('role') role?: Role,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({ role, search, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin xem chi tiết hồ sơ học viên kèm tiến độ học tập' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({ status: 200, description: 'Chi tiết hồ sơ học viên' })
  @ResponseMessage('Lấy chi tiết hồ sơ người dùng thành công')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Admin khóa hoặc kích hoạt tài khoản học viên' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ResponseMessage('Cập nhật trạng thái tài khoản thành công')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto.isActive);
  }

  @Put(':id/reset-password')
  @ApiOperation({ summary: 'Admin cấp lại mật khẩu cho học viên' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  @ResponseMessage('Cấp lại mật khẩu cho học viên thành công')
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: AdminResetPasswordDto,
  ) {
    return this.usersService.resetPassword(id, dto.newPassword);
  }

  @Post(':id/avatar')
  @ApiOperation({ summary: 'Upload avatar người dùng lên Cloudinary' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Cập nhật avatar người dùng lên Cloudinary thành công')
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(id, file);
  }
}
