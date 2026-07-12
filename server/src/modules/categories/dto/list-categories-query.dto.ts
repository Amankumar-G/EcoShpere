import { IsIn, IsOptional } from 'class-validator';
import { CATEGORY_TYPES } from './create-category.dto';

export class ListCategoriesQueryDto {
  @IsOptional()
  @IsIn(CATEGORY_TYPES)
  type?: string;
}
