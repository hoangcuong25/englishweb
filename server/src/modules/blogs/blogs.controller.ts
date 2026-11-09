import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ResponseMessage } from '../../core/common/decorators/response-message.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Blogs & Cloudinary Media')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin đăng bài viết Blog mới kèm ảnh và video Cloudinary' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @ResponseMessage('Đăng bài viết Blog thành công')
  async create(
    @CurrentUser('id') authorId: string,
    @Body() dto: CreateBlogDto,
    @UploadedFiles()
    files?: {
      coverImage?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const coverFile = files?.coverImage?.[0];
    const videoFile = files?.video?.[0];
    return this.blogsService.createBlog(authorId, dto, coverFile, videoFile);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật bài viết Blog' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @ResponseMessage('Cập nhật bài viết Blog thành công')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @UploadedFiles()
    files?: {
      coverImage?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const coverFile = files?.coverImage?.[0];
    const videoFile = files?.video?.[0];
    return this.blogsService.updateBlog(id, dto, coverFile, videoFile);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài viết Blog (công khai / học viên / admin)' })
  @ResponseMessage('Lấy danh sách bài viết Blog thành công')
  async findAll(@Query() query: QueryBlogsDto, @Req() req: Request) {
    const userRole = (req as any).user?.role;
    return this.blogsService.findAll(query, userRole);
  }

  @Get(':slugOrId')
  @ApiOperation({ summary: 'Xem chi tiết bài viết Blog qua Slug hoặc ID (tự động tăng viewCount)' })
  @ResponseMessage('Lấy chi tiết bài viết Blog thành công')
  async findOne(@Param('slugOrId') slugOrId: string, @Req() req: Request) {
    const userRole = (req as any).user?.role;
    return this.blogsService.findBySlugOrId(slugOrId, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa bài viết Blog và giải phóng Cloudinary assets' })
  @ResponseMessage('Xóa bài viết Blog thành công')
  async delete(@Param('id') id: string) {
    return this.blogsService.deleteBlog(id);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload ảnh bìa bài viết lên Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Upload ảnh bìa bài viết thành công')
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.blogsService.uploadCoverImage(id, file);
  }

  @Post(':id/video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload video đính kèm bài viết lên Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Upload video bài viết thành công')
  async uploadVideo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.blogsService.uploadBlogVideo(id, file);
  }
}
