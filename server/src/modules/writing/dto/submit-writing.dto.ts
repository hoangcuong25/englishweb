import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitWritingDto {
  @ApiProperty({ example: 'prompt-uuid-here' })
  @IsNotEmpty({ message: 'promptId không được để trống' })
  @IsString()
  promptId: string;

  @ApiProperty({
    example:
      'In contemporary society, the proliferation of telecommuting has revolutionized the corporate landscape. While proponents advocate for its flexibility...',
  })
  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 1800, description: 'Thời gian làm bài tính bằng giây' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}
