import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSourceDatabaseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsDateString()
  lastImportedAt?: string;
}
