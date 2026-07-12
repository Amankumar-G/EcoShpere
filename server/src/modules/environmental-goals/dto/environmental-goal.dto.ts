import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export const GOAL_STATUSES = [
  'active',
  'achieved',
  'missed',
  'archived',
] as const;

export class CreateEnvironmentalGoalDto {
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsString()
  @MinLength(1)
  metric: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  targetValue: number;

  @IsString()
  @MinLength(1)
  unit: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsIn(GOAL_STATUSES)
  status?: string;
}

export class UpdateEnvironmentalGoalDto {
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  metric?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  targetValue?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  unit?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(GOAL_STATUSES)
  status?: string;
}

export class EnvironmentalGoalResponseDto {
  id: number;
  departmentId: number | null;
  metric: string;
  targetValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
}
