import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

export class CreateMaterialDto {
  @ApiProperty({ example: 'lesson-uuid-here' })
  @IsNotEmpty({ message: 'lessonId không được để trống' })
  @IsString()
  lessonId: string;

  @ApiProperty({ example: 'IELTS Writing Task 2 Masterclass Guide.pdf' })
  @IsNotEmpty({ message: 'Tiêu đề tài liệu không được để trống' })
  @IsString()
  title: string;

  @ApiProperty({ enum: MaterialType, default: MaterialType.PDF })
  @IsEnum(MaterialType, { message: 'Loại tài liệu phải là PDF hoặc AUDIO' })
  type: MaterialType;

  @ApiProperty({ example: 'materials/ielts-writing-task2-guide.pdf' })
  @IsNotEmpty({ message: 'fileKey lưu trữ không được để trống' })
  @IsString()
  fileKey: string;

  @ApiPropertyOptional({ example: 2048576 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 340 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isWatermarked?: boolean;
}
