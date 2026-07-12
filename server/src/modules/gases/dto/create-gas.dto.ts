import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateGasDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  symbol: string;

  @IsNumber()
  @IsPositive()
  gwp: number;
}
