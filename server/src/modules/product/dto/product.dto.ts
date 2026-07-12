import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { UNITS_OF_MEASURE } from '../../../common/constants/uom.constant';

export const RECORD_STATUSES = ['active', 'inactive'] as const;

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsIn(UNITS_OF_MEASURE)
  uom: string;

  @IsOptional()
  @IsInt()
  defaultAccountId?: number;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsIn(UNITS_OF_MEASURE)
  uom?: string;

  @IsOptional()
  @IsInt()
  defaultAccountId?: number;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}
