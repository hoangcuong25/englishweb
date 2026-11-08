import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSpeakingDto {
  @ApiProperty({ example: 'prompt-uuid-here' })
  @IsNotEmpty({ message: 'promptId không được để trống' })
  @IsString()
  promptId: string;

  @ApiProperty({ example: 'https://cdn.englishweb.com/recordings/student_part2_rec.mp3' })
  @IsNotEmpty({ message: 'audioUrl không được để trống' })
  @IsString()
  audioUrl: string;

  @ApiProperty({ example: 85, description: 'Thời lượng file ghi âm tính bằng giây' })
  @IsInt()
  @Min(5)
  durationSeconds: number;
}
