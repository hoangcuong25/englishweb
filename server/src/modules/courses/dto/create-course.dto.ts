import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseCategory } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'IELTS Intensive Band 6.5 -> 7.5+ Masterclass' })
  @IsNotEmpty({ message: 'Tiêu đề khóa học không được để trống' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'ielts-intensive-masterclass' })
  @IsNotEmpty({ message: 'Đường dẫn định danh (slug) không được để trống' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Khóa học IELTS chuyên sâu 4 kỹ năng bám sát đề thi thật...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CourseCategory, default: CourseCategory.IELTS })
  @IsEnum(CourseCategory, { message: 'Danh mục khóa học không hợp lệ' })
  category: CourseCategory;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173' })
  @IsOptional()
  @IsUrl({}, { message: 'Ảnh thu nhỏ phải là một URL hợp lệ' })
  thumbnail?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
