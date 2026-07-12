import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateEmittedEmissionDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  emissionFactorId: number;

  @IsNumber()
  quantity: number;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsInt()
  departmentId: number;

  @IsOptional()
  @IsUrl()
  evidenceUrl?: string;

  /** Optional link to a Phase 1 BusinessTravel record (Scope 3 Cat 6). Stored on sourceRefId. */
  @IsOptional()
  @IsInt()
  businessTravelRefId?: number;
}
