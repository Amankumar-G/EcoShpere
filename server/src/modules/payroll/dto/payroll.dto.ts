import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const CONTRACT_TYPES = ['permanent', 'temporary'] as const;

export const LEADERSHIP_LEVELS = ['management', 'non_management'] as const;

export class CreatePayrollContractDto {
  @IsInt()
  employeeId: number;

  @IsString()
  jobPosition: string;

  @IsIn(CONTRACT_TYPES)
  contractType: string;

  @IsOptional()
  @IsIn(LEADERSHIP_LEVELS)
  leadershipLevel?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  wage: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdatePayrollContractDto {
  @IsOptional()
  @IsString()
  jobPosition?: string;

  @IsOptional()
  @IsIn(CONTRACT_TYPES)
  contractType?: string;

  @IsOptional()
  @IsIn(LEADERSHIP_LEVELS)
  leadershipLevel?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  wage?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
