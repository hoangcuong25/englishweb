import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Role } from '@prisma/client';

@ApiTags('Cloudinary Media Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload/image')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Upload hình ảnh lên Cloudinary (avatar, thumbnail, blog cover, tài liệu)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, description: 'Tên thư mục trên Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Upload hình ảnh lên Cloudinary thành công')
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    return this.cloudinaryService.uploadImage(file, folder || 'teacher_dong_academy/images');
  }

  @Post('upload/video')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Upload video lên Cloudinary (bài giảng video, blog review, speaking clip)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, description: 'Tên thư mục trên Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Upload video lên Cloudinary thành công')
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    return this.cloudinaryService.uploadVideo(file, folder || 'teacher_dong_academy/videos');
  }

  @Delete(':publicId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa asset khỏi Cloudinary' })
  @ApiQuery({ name: 'resourceType', required: false, enum: ['image', 'video'] })
  @ResponseMessage('Xóa asset khỏi Cloudinary thành công')
  async deleteAsset(
    @Param('publicId') publicId: string,
    @Query('resourceType') resourceType?: 'image' | 'video',
  ) {
    return this.cloudinaryService.deleteAsset(publicId, resourceType || 'image');
  }
}
