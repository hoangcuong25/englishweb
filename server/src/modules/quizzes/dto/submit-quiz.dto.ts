import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuizAnswerItemDto {
  @ApiProperty({ example: 'question-uuid-here' })
  @IsNotEmpty({ message: 'questionId không được để trống' })
  @IsString()
  questionId: string;

  @ApiPropertyOptional({ example: 'option-uuid-here' })
  @IsOptional()
  @IsString()
  selectedOptionId?: string;

  @ApiPropertyOptional({ example: 'telecommuting' })
  @IsOptional()
  @IsString()
  textAnswer?: string;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [QuizAnswerItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerItemDto)
  answers: QuizAnswerItemDto[];
}
