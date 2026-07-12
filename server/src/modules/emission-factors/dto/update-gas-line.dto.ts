import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';
import {
  ACTIVITY_TYPES,
  GAS_QUANTITY_UNITS,
} from '../../../common/constants/activity-type.constant';

export class UpdateGasLineDto {
  @IsOptional()
  @IsInt()
  gasId?: number;

  @IsOptional()
  @IsIn(ACTIVITY_TYPES)
  activityType?: string;

  @IsOptional()
  @IsPositive()
  value?: number;

  @IsOptional()
  @IsIn(GAS_QUANTITY_UNITS)
  unit?: string;
}
