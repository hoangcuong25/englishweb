import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WhiteboardStrokeDto {
  @ApiProperty({ description: 'Công cụ vẽ (pen, highlighter, eraser, rectangle, circle, line, text, image)', example: 'pen' })
  @IsString()
  @IsNotEmpty()
  tool: string;

  @ApiPropertyOptional({ description: 'Mã màu nét vẽ HEX/RGBA', example: '#0284c7' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Độ dày nét vẽ hoặc kích thước font', example: 3 })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiPropertyOptional({ description: 'Danh sách tọa độ điểm vẽ canvas' })
  @IsOptional()
  @IsArray()
  points?: Array<{ x: number; y: number }>;

  @ApiPropertyOptional({ description: 'Văn bản (nếu dùng tool text)', example: 'IELTS Writing Strategy' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'URL hình ảnh được chèn vào bảng', example: 'https://cdn.example.com/diagram.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class SetWhiteboardPermissionDto {
  @ApiProperty({ description: 'Cho phép học viên thao tác vẽ lên bảng', example: true })
  @IsBoolean()
  allowStudentDrawing: boolean;
}
