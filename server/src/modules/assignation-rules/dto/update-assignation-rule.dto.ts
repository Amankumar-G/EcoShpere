import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional } from 'class-validator';

export class UpdateAssignationRuleDto {
  @IsOptional()
  @IsInt()
  emissionFactorId?: number;

  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  partnerId?: number;

  @IsOptional()
  @IsInt()
  accountId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applicationPeriodStart?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applicationPeriodEnd?: Date;

  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean;
}
