import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSourceDatabaseDto {
  @IsString()
  @MinLength(1)
  name: string;

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
