import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '@prisma/client';

export class CreateBlogDto {
  @ApiProperty({ description: 'Tiêu đề bài viết Blog', example: 'Chiến thuật đạt Band 8.0 IELTS Writing Task 2' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề bài viết không được để trống' })
  title: string;

  @ApiPropertyOptional({ description: 'Slug định danh URL thân thiện (tự động sinh nếu để trống)', example: 'chien-thuat-band-8-ielts-writing-task-2' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Đoạn mô tả ngắn tóm tắt nội dung bài viết' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: 'Nội dung chi tiết bài viết (định dạng Markdown hoặc HTML)' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống' })
  content: string;

  @ApiPropertyOptional({ description: 'URL ảnh bìa Cloudinary', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Cloudinary Public ID của ảnh bìa' })
  @IsOptional()
  @IsString()
  coverImagePublicId?: string;

  @ApiPropertyOptional({ description: 'URL video Cloudinary đính kèm bài viết', example: 'https://res.cloudinary.com/demo/video/upload/sample.mp4' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Cloudinary Public ID của video' })
  @IsOptional()
  @IsString()
  videoPublicId?: string;

  @ApiPropertyOptional({ description: 'Chuyên mục bài viết', example: 'IELTS Writing' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Từ khóa bài viết phân cách bởi dấu phẩy', example: 'ielts,writing,band8' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Trạng thái bài viết', enum: BlogStatus, default: BlogStatus.DRAFT })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ description: 'Đánh dấu bài viết nổi bật', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  isFeatured?: boolean;
}
