import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Số điện thoại người dùng (dùng để liên hệ và in dynamic watermark bảo mật)',
    example: '0912345678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Họ và tên người dùng',
    example: 'Nguyen Thi Mai',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh đại diện avatar (tùy chọn)',
    example: 'https://res.cloudinary.com/dong-academy/image/upload/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
