import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SubmitHomeworkDto {
  @ApiPropertyOptional({ description: 'Nội dung bài làm dạng văn bản' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn tệp đính kèm bài làm của học viên' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
