import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'module-uuid-here' })
  @IsNotEmpty({ message: 'moduleId không được để trống' })
  @IsString()
  moduleId: string;

  @ApiProperty({ example: 'Lesson 1.1: Comprehensive Overview of IELTS Writing Assessment' })
  @IsNotEmpty({ message: 'Tiêu đề bài học không được để trống' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Chi tiết 4 tiêu chí TR, CC, LR, GRA' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ example: 45, default: 45 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'https://cdn.englishweb.com/videos/lesson1.mp4' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;
}
