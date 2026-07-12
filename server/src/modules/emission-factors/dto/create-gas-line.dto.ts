import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateGasLineDto {
  @IsInt()
  gasId: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  activityType?: string;

  @IsPositive()
  value: number;

  @IsString()
  @MinLength(1)
  unit: string;
}
