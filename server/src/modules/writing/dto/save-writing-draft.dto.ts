import { IsNotEmpty, IsString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveWritingDraftDto {
  @ApiProperty({ example: 'prompt-uuid-here' })
  @IsNotEmpty({ message: 'promptId không được để trống' })
  @IsString()
  promptId: string;

  @ApiProperty({ example: 'In contemporary society, higher education plays...' })
  @IsNotEmpty({ message: 'Nội dung bản nháp không được để trống' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  wordCount?: number;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
