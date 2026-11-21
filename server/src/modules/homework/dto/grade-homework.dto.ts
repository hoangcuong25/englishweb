import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GradeHomeworkDto {
  @ApiProperty({ description: 'Điểm số bài làm' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  score: number;

  @ApiPropertyOptional({ description: 'Lời phê & nhận xét chi tiết của giáo viên' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
