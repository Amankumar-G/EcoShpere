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
}
