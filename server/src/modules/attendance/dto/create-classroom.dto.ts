import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassroomDto {
  @ApiProperty({ example: 'ielts-speaking-live-01' })
  @IsNotEmpty({ message: 'Tên phòng học không được để trống' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'course-uuid-here' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ example: '2026-11-08T19:30:00.000Z' })
  @IsDateString({}, { message: 'scheduledStartTime phải là định dạng ISO date' })
  scheduledStartTime: string;

  @ApiProperty({ example: '2026-11-08T20:30:00.000Z' })
  @IsDateString({}, { message: 'scheduledEndTime phải là định dạng ISO date' })
  scheduledEndTime: string;
}
