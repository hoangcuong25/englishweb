import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@englishweb.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AdminPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
