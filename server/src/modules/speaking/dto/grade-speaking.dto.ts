import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeSpeakingDto {
  @ApiProperty({ example: 7.0, description: 'Fluency & Coherence (0.0 - 9.0)' })
  @IsNumber()
  @Min(0)
  @Max(9)
  fluencyScore: number;

  @ApiProperty({ example: 7.5, description: 'Lexical Resource (0.0 - 9.0)' })
  @IsNumber()
  @Min(0)
  @Max(9)
  lexicalScore: number;

  @ApiProperty({ example: 6.5, description: 'Grammatical Range & Accuracy (0.0 - 9.0)' })
  @IsNumber()
  @Min(0)
  @Max(9)
  grammarScore: number;

  @ApiProperty({ example: 7.0, description: 'Pronunciation (0.0 - 9.0)' })
  @IsNumber()
  @Min(0)
  @Max(9)
  pronunciationScore: number;

  @ApiPropertyOptional({ example: 7.0, description: 'Điểm Overall Band (Tự tính nếu bỏ trống)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  bandScore?: number;

  @ApiPropertyOptional({ example: 'Phát âm tự nhiên, ngữ điệu tốt, cần hạn chế ậm ừ ở phần triển khai ý thứ 3.' })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    example: [
      { timestamp: '00:15', note: 'Phát âm ending sound /s/ chưa chuẩn ở từ "destinations"' },
      { timestamp: '00:48', note: 'Collocation học thuật tốt: "breathtaking scenery"' },
    ],
  })
  @IsOptional()
  @IsArray()
  timestampFeedback?: { timestamp: string; note: string }[];
}
