import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';
import {
  ACTIVITY_TYPES,
  GAS_QUANTITY_UNITS,
} from '../../../common/constants/activity-type.constant';

export class CreateGasLineDto {
  @IsInt()
  gasId: number;

  @IsOptional()
  @IsIn(ACTIVITY_TYPES)
  activityType?: string;

  @IsPositive()
  value: number;

  @IsIn(GAS_QUANTITY_UNITS)
  unit: string;
}
