import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestEnrollDto {
  @ApiPropertyOptional({ example: 'TD 0912345678 IELTS-MASTERCLASS' })
  @IsOptional()
  @IsString()
  @MaxLength(190, {
    message: 'Nội dung chuyển khoản không được vượt quá 190 ký tự',
  })
  paymentNote?: string;

  @ApiPropertyOptional({ example: 2500000 })
  @IsOptional()
  @IsNumber({}, { message: 'Số tiền thanh toán phải là số hợp lệ' })
  @Min(0, { message: 'Số tiền thanh toán không được âm' })
  @Max(1000000000, {
    message: 'Số tiền thanh toán không được vượt quá 1 tỷ VNĐ',
  })
  paymentAmount?: number;
}
