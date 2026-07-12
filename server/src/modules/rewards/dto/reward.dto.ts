import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRewardDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  pointsRequired: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class UpdateRewardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsRequired?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class RewardResponseDto {
  id: number;
  name: string;
  description: string | null;
  pointsRequired: number;
  stock: number;
  status: string;
}

export class RewardRedemptionResponseDto {
  id: number;
  employeeId: number;
  rewardId: number;
  rewardName: string;
  pointsDeducted: number;
  status: string;
  redeemedAt: Date;
}
