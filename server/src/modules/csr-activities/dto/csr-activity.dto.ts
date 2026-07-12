import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export const CSR_ACTIVITY_STATUSES = [
  'draft',
  'active',
  'completed',
  'archived',
] as const;

export class CreateCsrActivityDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(CSR_ACTIVITY_STATUSES)
  status?: string;
}

export class UpdateCsrActivityDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(CSR_ACTIVITY_STATUSES)
  status?: string;
}

export class JoinCsrActivityDto {
  @IsOptional()
  @IsString()
  proofUrl?: string;
}

export class CsrActivityResponseDto {
  id: number;
  title: string;
  description: string | null;
  categoryId: number | null;
  departmentId: number | null;
  points: number;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  createdAt: Date;
}

export class ParticipationResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  csrActivityId: number;
  csrActivityTitle: string;
  proofUrl: string | null;
  approvalStatus: string;
  pointsEarned: number;
  completionDate: Date | null;
}
