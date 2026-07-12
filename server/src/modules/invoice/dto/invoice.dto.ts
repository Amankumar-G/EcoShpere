import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { UNITS_OF_MEASURE } from '../../../common/constants/uom.constant';

export class InvoiceLineDto {
  @IsOptional()
  @IsInt()
  productId?: number;

  @IsInt()
  accountId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  quantity: number;

  @IsIn(UNITS_OF_MEASURE)
  uom: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsInt()
  partnerId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines: InvoiceLineDto[];
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsInt()
  partnerId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines?: InvoiceLineDto[];
}
