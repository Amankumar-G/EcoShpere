import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export const PARTNER_TYPES = ['vendor', 'customer', 'both'] as const;
export const RECORD_STATUSES = ['active', 'inactive'] as const;

export class CreatePartnerDto {
  @IsString()
  name: string;

  @IsIn(PARTNER_TYPES)
  type: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(PARTNER_TYPES)
  type?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsIn(RECORD_STATUSES)
  status?: string;
}
