import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateGasLineDto {
  @IsOptional()
  @IsInt()
  gasId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  activityType?: string;

  @IsOptional()
  @IsPositive()
  value?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  unit?: string;
}
