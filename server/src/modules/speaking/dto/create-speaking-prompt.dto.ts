import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeakingPromptDto {
  @ApiPropertyOptional({ example: 'lesson-uuid-here' })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiProperty({ example: 'Speaking Part 2: Describe a memorable journey' })
  @IsNotEmpty({ message: 'Tiêu đề đề bài không được để trống' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example:
      'Describe a memorable journey you have taken. You should say: where you went, how you travelled, who you went with, and explain why it was memorable.',
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ example: 'https://cdn.englishweb.com/audio/sample_part2.mp3' })
  @IsOptional()
  @IsUrl({}, { message: 'sampleAudioUrl phải là một đường dẫn URL hợp lệ' })
  sampleAudioUrl?: string;

  @ApiPropertyOptional({ example: 30, default: 30 })
  @IsOptional()
  @IsInt()
  @Min(10)
  minSeconds?: number;

  @ApiPropertyOptional({ example: 120, default: 120 })
  @IsOptional()
  @IsInt()
  @Min(30)
  maxSeconds?: number;
}
