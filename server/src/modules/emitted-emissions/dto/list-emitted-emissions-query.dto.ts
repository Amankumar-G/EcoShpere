import { Type } from 'class-transformer';
import { EmissionSourceType } from '@prisma/client';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';

export class ListEmittedEmissionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  scopeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsEnum(EmissionSourceType)
  sourceType?: EmissionSourceType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}
