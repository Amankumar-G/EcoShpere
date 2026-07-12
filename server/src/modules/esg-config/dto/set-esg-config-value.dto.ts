import { IsDefined } from 'class-validator';

export class SetEsgConfigValueDto {
  @IsDefined()
  value: unknown;
}
