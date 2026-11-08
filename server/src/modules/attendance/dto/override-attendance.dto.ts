import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class OverrideAttendanceDto {
  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus, { message: 'Trạng thái điểm danh phải là PRESENT, LATE hoặc ABSENT' })
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Học viên có phép do lỗi đường truyền mạng được Admin phê duyệt' })
  @IsOptional()
  @IsString()
  note?: string;
}
