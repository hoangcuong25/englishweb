import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHomeworkDto {
  @ApiProperty({ description: 'ID khóa học được giao bài tập' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: 'ID bài học tương ứng (nếu có)' })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiProperty({ description: 'Tiêu đề bài tập về nhà' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Nội dung đề bài và hướng dẫn làm bài' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Hạn chót nộp bài (ISO string)' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Thang điểm tối đa', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Đường dẫn tệp đính kèm đề bài (PDF, DOCX, MP3...)' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
