import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BADGE_RULE_TYPES } from '../badge-unlock.evaluator';

export class UnlockRuleDto {
  @IsIn(BADGE_RULE_TYPES)
  type: string;

  @IsNumber()
  @Min(0)
  threshold: number;
}

export class CreateBadgeDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => UnlockRuleDto)
  unlockRule: UnlockRuleDto;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class UpdateBadgeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UnlockRuleDto)
  unlockRule?: UnlockRuleDto;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class ManualAwardDto {
  @IsInt()
  employeeId: number;
}

export class BadgeResponseDto {
  id: number;
  name: string;
  description: string | null;
  unlockRule: unknown;
  icon: string | null;
  status: string;
}

export class EmployeeBadgeResponseDto {
  id: number;
  employeeId: number;
  badgeId: number;
  badgeName: string;
  badgeIcon: string | null;
  status: string;
  awardedAt: Date;
}
