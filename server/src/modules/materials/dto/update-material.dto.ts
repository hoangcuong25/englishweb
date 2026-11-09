import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMaterialDto } from './create-material.dto';

export class UpdateMaterialDto extends PartialType(
  OmitType(CreateMaterialDto, ['lessonId'] as const),
) {}
