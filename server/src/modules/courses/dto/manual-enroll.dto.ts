import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManualEnrollDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID hoặc Slug của khóa học',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn khóa học cần ghi danh' })
  @IsString({ message: 'Khóa học ID hoặc Slug phải là chuỗi hợp lệ' })
  @MaxLength(100, { message: 'Khóa học ID không được vượt quá 100 ký tự' })
  courseId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID của học viên',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn học viên cần ghi danh' })
  @IsString({ message: 'Học viên ID phải là chuỗi hợp lệ' })
  @MaxLength(100, { message: 'Học viên ID không được vượt quá 100 ký tự' })
  userId: string;

  @ApiPropertyOptional({ example: 'Đã thanh toán tiền mặt tại trung tâm' })
  @IsOptional()
  @IsString()
  @MaxLength(190, { message: 'Ghi chú ghi danh không được vượt quá 190 ký tự' })
  note?: string;
}
