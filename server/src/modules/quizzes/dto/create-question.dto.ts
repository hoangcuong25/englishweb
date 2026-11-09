import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType, SkillType } from '@prisma/client';

export class QuestionOptionDto {
  @ApiProperty({ example: 'Moreover / In addition' })
  @IsNotEmpty({ message: 'Nội dung phương án không được để trống' })
  @IsString()
  content: string;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({
    example:
      'Which transition word is best suited to introduce a contrasting academic viewpoint?',
  })
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: SkillType, default: SkillType.READING, description: 'Kỹ năng câu hỏi (READING, LISTENING, WRITING, SPEAKING)' })
  @IsOptional()
  @IsEnum(SkillType)
  skill?: SkillType;

  @ApiProperty({ enum: QuestionType, default: QuestionType.SINGLE_CHOICE, description: 'Dạng bài câu hỏi (MCQ, TRUE_FALSE_NOT_GIVEN, MATCHING_HEADINGS...)' })
  @IsEnum(QuestionType, { message: 'Loại câu hỏi không hợp lệ' })
  type: QuestionType;

  @ApiPropertyOptional({ example: 'Skimming & Scanning', description: 'Phân loại chi tiết kỹ năng phụ' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ example: 1.0, default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  points?: number;

  @ApiPropertyOptional({
    example: '"Conversely" and "In contrast" indicate juxtaposition of two opposing concepts.',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiProperty({ type: [QuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];
}
