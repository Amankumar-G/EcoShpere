import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const TRAVEL_MODES = ['flight', 'train', 'car', 'bus'] as const;

export class CreateBusinessTravelDto {
  @IsInt()
  employeeId: number;

  @IsIn(TRAVEL_MODES)
  mode: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distanceKm?: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class UpdateBusinessTravelDto {
  @IsOptional()
  @IsIn(TRAVEL_MODES)
  mode?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}
