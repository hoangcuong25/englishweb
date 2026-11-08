import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'student@englishweb.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Student@123456' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Client device ID for Single Concurrent Session tracking' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
