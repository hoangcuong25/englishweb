import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    example: 'Thầy cho em hỏi bài tập Writing Task 2 cần nộp trước mấy giờ ạ?',
    description: 'Nội dung tin nhắn',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @MaxLength(2000, { message: 'Tin nhắn tối đa 2000 ký tự' })
  content: string;
}
