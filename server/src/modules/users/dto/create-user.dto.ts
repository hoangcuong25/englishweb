import { IsNotEmpty, IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'student.a@dongacademy.edu.vn' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'DongAcademy@2026' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  password?: string;

  @ApiPropertyOptional({ example: 'course-uuid' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ example: '7.5' })
  @IsOptional()
  @IsString()
  targetBand?: string;
}
