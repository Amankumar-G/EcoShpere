import { IsIn, IsString, MinLength } from 'class-validator';

export const CATEGORY_TYPES = ['csr_activity', 'challenge'] as const;

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsIn(CATEGORY_TYPES)
  type: string;
}
