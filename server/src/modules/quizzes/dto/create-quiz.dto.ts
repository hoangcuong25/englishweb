import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SkillType } from '@prisma/client';

export class CreateQuizDto {
  @ApiPropertyOptional({ example: 'lesson-uuid-here', description: 'ID bài học (nếu là bài kiểm tra trong bài học)' })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiProperty({ example: 'IELTS Academic Reading Mock Test 1' })
  @IsNotEmpty({ message: 'Tiêu đề bài Test không được để trống' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Kiểm tra kỹ năng Reading với 3 Passage thực chiến' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: SkillType, default: SkillType.READING, description: 'Kỹ năng IELTS (READING, LISTENING, WRITING, SPEAKING)' })
  @IsOptional()
  @IsEnum(SkillType)
  skill?: SkillType;

  @ApiPropertyOptional({ example: 'FULL_MOCK_TEST', description: 'Loại bài thi (LESSON_QUIZ, PRACTICE_TEST, FULL_MOCK_TEST)' })
  @IsOptional()
  @IsString()
  testType?: string;

  @ApiPropertyOptional({ description: 'Đoạn văn đọc hiểu (dành cho Reading)', example: 'The history of architecture...' })
  @IsOptional()
  @IsString()
  passage?: string;

  @ApiPropertyOptional({ description: 'URL file nghe Cloudinary (dành cho Listening)', example: 'https://res.cloudinary.com/.../audio.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 60, default: 15, description: 'Thời gian làm bài tính bằng phút' })
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
