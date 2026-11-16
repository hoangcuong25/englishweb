import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Mã token khôi phục mật khẩu (15 phút)' })
  @IsNotEmpty({ message: 'Mã xác thực token không được để trống' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecret123@', description: 'Mật khẩu mới (tối thiểu 6 ký tự)' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' })
  newPassword: string;
}

