import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class UpdateLanguageDto {
  @ApiProperty({ enum: Language, description: 'Preferred user interface language', example: Language.VI })
  @IsNotEmpty()
  @IsEnum(Language)
  language: Language;
}
