import { IsNotEmpty, IsOptional, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Mã token khôi phục mật khẩu (15 phút)', required: false })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ description: 'Mã OTP 6 chữ số gửi qua email', required: false })
  @IsOptional()
  @IsString()
  otp?: string;

  @ApiProperty({ description: 'Email của tài khoản khi dùng mã OTP', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Địa chỉ email không hợp lệ' })
  email?: string;

  @ApiProperty({ example: 'NewSecret123@', description: 'Mật khẩu mới (tối thiểu 6 ký tự)' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' })
  newPassword: string;
}

