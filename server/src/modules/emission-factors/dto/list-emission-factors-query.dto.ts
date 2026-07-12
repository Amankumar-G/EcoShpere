import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ListEmissionFactorsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  scopeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sourceDatabaseId?: number;
}
