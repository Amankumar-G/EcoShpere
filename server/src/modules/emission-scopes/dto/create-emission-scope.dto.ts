import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmissionScopeDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
