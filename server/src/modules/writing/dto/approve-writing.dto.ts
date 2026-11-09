import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveWritingDto {
  @ApiPropertyOptional({ example: 7.5, description: 'Điểm Overall Band giáo viên điều chỉnh (0.0 - 9.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  adminOverrideBand?: number;

  @ApiPropertyOptional({
    example:
      'Bài viết có cấu trúc PEEL mạch lạc, tuy nhiên cần chú ý đa dạng cấu trúc câu bị động ở đoạn 2.',
  })
  @IsOptional()
  @IsString()
  adminFeedback?: string;
}
