import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestRegisterOtpDto {
  @ApiProperty({
    example: 'student@example.com',
    description: 'Địa chỉ email cần nhận mã xác thực OTP đăng ký',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email: string;

  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên của người dùng',
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}
