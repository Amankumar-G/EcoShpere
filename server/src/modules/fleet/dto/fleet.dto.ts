import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const RECORD_STATUSES = ['active', 'inactive'] as const;

export class CreateFleetModelDto {
  @IsString()
  name: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  co2Emissions: number; // kgCO2e per km

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}

export class UpdateFleetModelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  co2Emissions?: number;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}

export class CreateFleetVehicleDto {
  @IsInt()
  employeeId: number;

  @IsInt()
  modelId: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateFleetVehicleDto {
  @IsOptional()
  @IsInt()
  modelId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
