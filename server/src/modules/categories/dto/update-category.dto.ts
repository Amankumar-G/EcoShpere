import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { CATEGORY_TYPES } from './create-category.dto';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsIn(CATEGORY_TYPES)
  type?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
