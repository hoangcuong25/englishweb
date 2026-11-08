import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ example: 'lesson-uuid-here' })
  @IsNotEmpty({ message: 'lessonId không được để trống' })
  @IsString()
  lessonId: string;

  @ApiProperty({ example: 'Quick Quiz: Cohesion & Sentence Connectors' })
  @IsNotEmpty({ message: 'Tiêu đề Quiz không được để trống' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Kiểm tra mức độ thành thạo các liên từ học thuật Band 7.5+' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 15, default: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({ example: 80, default: 80, description: 'Điểm sàn đạt (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passScore?: number;
}
