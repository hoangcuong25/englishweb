import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
  @ApiProperty({ description: 'ID phòng học cần điểm danh', example: 'cls-demo-001' })
  @IsNotEmpty({ message: 'classroomId không được để trống' })
  @IsString()
  classroomId: string;

  @ApiProperty({ description: 'ID học viên cần điểm danh', example: 'usr-student-001' })
  @IsNotEmpty({ message: 'studentId không được để trống' })
  @IsString()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus, { message: 'Trạng thái điểm danh phải là PRESENT, LATE hoặc ABSENT' })
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Thời lượng học (phút)', example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMinutes?: number;

  @ApiPropertyOptional({ example: 'Giảng viên xác nhận học viên tham gia đầy đủ' })
  @IsOptional()
  @IsString()
  note?: string;
}
