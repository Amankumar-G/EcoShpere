import { ComputeMethod } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

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

  @IsString()
  @MinLength(1)
  unitOfMeasure: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uncertainty?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  status?: string;
}
