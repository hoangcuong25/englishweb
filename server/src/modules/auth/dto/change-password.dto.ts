import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: 'Mã xác thực OTP (6 chữ số gửi qua email)', required: false })
  @IsOptional()
  @IsString()
  otp?: string;

  @ApiProperty({ description: 'New password (minimum 6 characters)', minLength: 6 })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' })
  newPassword: string;
}
