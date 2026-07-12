import {
  IsBoolean,
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

export const CHALLENGE_STATUSES = [
  'draft',
  'active',
  'under_review',
  'completed',
  'archived',
] as const;

export const CHALLENGE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export class CreateChallengeDto {
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
  @Min(0)
  xp?: number;

  @IsOptional()
  @IsIn(CHALLENGE_DIFFICULTIES)
  difficulty?: string;

  @IsOptional()
  @IsBoolean()
  evidenceRequired?: boolean;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsIn(CHALLENGE_STATUSES)
  status?: string;
}

export class UpdateChallengeDto {
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
  @Min(0)
  xp?: number;

  @IsOptional()
  @IsIn(CHALLENGE_DIFFICULTIES)
  difficulty?: string;

  @IsOptional()
  @IsBoolean()
  evidenceRequired?: boolean;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsIn(CHALLENGE_STATUSES)
  status?: string;
}

export class JoinChallengeDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  proofUrl?: string;
}

export class ChallengeResponseDto {
  id: number;
  title: string;
  description: string | null;
  categoryId: number | null;
  xp: number;
  difficulty: string | null;
  evidenceRequired: boolean;
  deadline: Date | null;
  status: string;
  createdAt: Date;
}

export class ChallengeParticipationResponseDto {
  id: number;
  challengeId: number;
  challengeTitle: string;
  employeeId: number;
  employeeName: string;
  progress: number;
  proofUrl: string | null;
  approvalStatus: string;
  xpAwarded: number;
}
