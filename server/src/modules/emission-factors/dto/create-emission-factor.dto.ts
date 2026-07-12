import { ComputeMethod } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  IsString,
  MinLength,
} from 'class-validator';
import { UNITS_OF_MEASURE } from '../../../common/constants/uom.constant';
import { RECORD_STATUSES } from '../../../common/constants/record-status.constant';

export class CreateEmissionFactorDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  scopeId: number;

  @IsInt()
  sourceDatabaseId: number;

  @IsEnum(ComputeMethod)
  computeMethod: ComputeMethod;

  @IsIn(UNITS_OF_MEASURE)
  unitOfMeasure: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uncertainty?: number;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}
