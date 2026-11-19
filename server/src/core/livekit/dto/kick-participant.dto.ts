import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KickParticipantDto {
  @ApiProperty({ description: 'Tên phòng học WebRTC', example: 'ielts-speaking-live-01' })
  @IsString()
  @IsNotEmpty()
  roomName: string;

  @ApiProperty({ description: 'Mã định danh của học viên cần kick khỏi phòng', example: 'usr_student_123' })
  @IsString()
  @IsNotEmpty()
  identity: string;
}

