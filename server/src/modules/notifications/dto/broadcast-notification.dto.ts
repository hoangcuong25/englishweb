import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, Role } from '@prisma/client';

export class BroadcastNotificationDto {
  @ApiProperty({ description: 'Tiêu đề thông báo', example: 'Lịch học LiveKit tối nay cập nhật' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Nội dung chi tiết thông báo', example: 'Lớp học IELTS Speaking chuyển sang 20:00 tối nay.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Đường dẫn chuyển tiếp khi bấm vào thông báo', example: '/student/classroom' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Đối tượng nhận: STUDENT hoặc ADMIN. Nếu để trống sẽ gửi toàn bộ học viện' })
  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;
}

