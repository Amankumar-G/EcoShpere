import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const NOTIFICATION_CHANNELS = ['in_app'] as const;

export class CreateNotificationDto {
  @IsInt()
  employeeId: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsIn(NOTIFICATION_CHANNELS)
  channel?: string;

  @IsOptional()
  payload?: Record<string, unknown>;
}
