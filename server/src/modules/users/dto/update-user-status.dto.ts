import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: false,
    description: 'Trạng thái hoạt động của tài khoản (true = Kích hoạt, false = Khóa)',
  })
  @IsBoolean({ message: 'isActive phải là kiểu boolean' })
  @IsNotEmpty({ message: 'isActive không được để trống' })
  isActive: boolean;
}
