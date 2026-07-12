import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmissionScopeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
