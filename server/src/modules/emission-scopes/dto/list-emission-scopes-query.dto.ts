import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEmissionScopesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}
