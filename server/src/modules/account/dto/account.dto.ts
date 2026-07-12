import { IsIn, IsOptional, IsString } from 'class-validator';

export const ACCOUNT_TYPES = [
  'expense',
  'asset',
  'liability',
  'income',
  'equity',
] as const;

export const RECORD_STATUSES = ['active', 'inactive'] as const;

export class CreateAccountDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsIn(ACCOUNT_TYPES)
  type: string;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(ACCOUNT_TYPES)
  type?: string;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}
