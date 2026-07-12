import { Matches } from 'class-validator';

export class RunFleetCommutingDto {
  /** Period to run, formatted YYYY-MM. */
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'period must be formatted YYYY-MM',
  })
  period: string;
}
