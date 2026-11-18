import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConsultationRequestDto {
  @ApiProperty({ description: 'Họ và tên người đăng ký tư vấn', example: 'Nguyễn Văn Minh' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  fullName: string;

  @ApiProperty({ description: 'Email liên hệ', example: 'minh.nguyen@example.com' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  email: string;

  @ApiProperty({ description: 'Số điện thoại liên hệ', example: '0912345678' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phone: string;

  @ApiPropertyOptional({ description: 'Mã hoặc tên chương trình học quan tâm', example: 'IELTS Masterclass 7.5+' })
  @IsString()
  @IsOptional()
  interestedProgram?: string;

  @ApiPropertyOptional({ description: 'Nội dung câu hỏi hoặc lời nhắn', example: 'Tôi muốn tư vấn lộ trình học từ Band 5.5 lên 7.0' })
  @IsString()
  @IsOptional()
  message?: string;
}
