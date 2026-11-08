import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WritingTaskType } from '@prisma/client';

export class CreateWritingPromptDto {
  @ApiPropertyOptional({ example: 'lesson-uuid-here' })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiProperty({ example: 'IELTS Writing Task 2: Remote Work vs Office Work' })
  @IsNotEmpty({ message: 'Tiêu đề đề bài không được để trống' })
  @IsString()
  title: string;

  @ApiProperty({ enum: WritingTaskType, default: WritingTaskType.TASK_2 })
  @IsEnum(WritingTaskType, { message: 'Loại bài viết phải là TASK_1 hoặc TASK_2' })
  taskType: WritingTaskType;

  @ApiProperty({
    example:
      'Some people believe that working remotely from home is better for both employees and companies. To what extent do you agree or disagree?',
  })
  @IsNotEmpty({ message: 'Nội dung đề bài không được để trống' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ example: 250, default: 250 })
  @IsOptional()
  @IsInt()
  @Min(50)
  targetWords?: number;

  @ApiPropertyOptional({ example: 40, default: 40 })
  @IsOptional()
  @IsInt()
  @Min(5)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({
    example: 'Sample Band 8.5 essay outlining advantages and balanced rebuttal...',
  })
  @IsOptional()
  @IsString()
  sampleEssay?: string;
}
