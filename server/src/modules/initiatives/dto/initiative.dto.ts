import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export const INITIATIVE_STATUSES = [
  'open',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export class CreateInitiativeDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  assigneeEmployeeId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedCo2Reduction?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualCo2Reduction?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsIn(INITIATIVE_STATUSES)
  status?: string;
}

export class UpdateInitiativeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  assigneeEmployeeId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedCo2Reduction?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualCo2Reduction?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsIn(INITIATIVE_STATUSES)
  status?: string;
}

export class InitiativeResponseDto {
  id: number;
  title: string;
  description: string | null;
  departmentId: number | null;
  assigneeEmployeeId: number | null;
  estimatedCo2Reduction: number | null;
  actualCo2Reduction: number | null;
  progress: number;
  deadline: Date | null;
  status: string;
  createdAt: Date;
}
