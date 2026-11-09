import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ example: 'course-uuid-here' })
  @IsNotEmpty({ message: 'courseId không được để trống' })
  @IsString()
  courseId: string;

  @ApiProperty({ example: 'Module 1: IELTS Writing Task 1 & 2 Fundamentals' })
  @IsNotEmpty({ message: 'Tiêu đề chương học không được để trống' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Nắm vững cấu trúc bài viết và tiêu chí chấm điểm' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
