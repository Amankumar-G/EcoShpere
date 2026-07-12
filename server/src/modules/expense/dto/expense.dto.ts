import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UNITS_OF_MEASURE } from '../../../common/constants/uom.constant';

export class CreateExpenseDto {
  @IsInt()
  employeeId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  accountId?: number;

  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsIn(UNITS_OF_MEASURE)
  uom?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  accountId?: number;

  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsIn(UNITS_OF_MEASURE)
  uom?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;
}
