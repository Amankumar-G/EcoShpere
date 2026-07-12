import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsOptional } from 'class-validator';

export type FootprintGroupBy = 'scope' | 'department' | 'period';

export class FootprintQueryDto {
  @IsIn(['scope', 'department', 'period'])
  groupBy: FootprintGroupBy;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  scopeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}
