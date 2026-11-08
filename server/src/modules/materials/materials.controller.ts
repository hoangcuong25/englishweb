import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { Response } from 'express';

@ApiTags('Secured Digital Library & Content Protection')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tải lên / tạo metadata tài liệu số PDF/Audio mới' })
  @ApiResponse({ status: 201, description: 'Tạo tài liệu thành công' })
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật thông tin tài liệu' })
  @ApiParam({ name: 'id', description: 'UUID của tài liệu' })
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa tài liệu số' })
  @ApiParam({ name: 'id', description: 'UUID của tài liệu' })
  remove(@Param('id') id: string) {
    return this.materialsService.delete(id);
  }

  @Get('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tài liệu thuộc bài học' })
  @ApiParam({ name: 'lessonId', description: 'UUID của bài học' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.materialsService.findByLessonId(lessonId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của tài liệu' })
  @ApiParam({ name: 'id', description: 'UUID của tài liệu' })
  findOne(@Param('id') id: string) {
    return this.materialsService.findById(id);
  }

  @Post(':id/signed-url')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Cấp URL ký số có thời hạn 15 phút (900s) kèm Watermark payload chống sao chép',
  })
  @ApiParam({ name: 'id', description: 'UUID của tài liệu' })
  generateSignedUrl(@Param('id') id: string, @CurrentUser() user: any) {
    return this.materialsService.generateSignedUrl(id, user);
  }

  @Get(':id/stream')
  @ApiOperation({
    summary:
      'Stream trực tiếp tài liệu bảo mật inline với token ký số 15 phút (chặn tải file)',
  })
  @ApiParam({ name: 'id', description: 'UUID của tài liệu' })
  @ApiQuery({ name: 'token', description: 'Token ký số bảo mật' })
  async streamMaterial(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const { contentType, buffer, material } =
      await this.materialsService.verifyTokenAndGetStream(id, token);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(material.title)}"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
