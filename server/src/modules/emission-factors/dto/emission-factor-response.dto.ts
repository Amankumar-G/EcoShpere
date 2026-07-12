import { ComputeMethod } from '@prisma/client';

export class GasLineResponseDto {
  id: number;
  emissionFactorId: number;
  gasId: number;
  gas: { id: number; name: string; symbol: string; gwp: number };
  activityType: string | null;
  value: number;
  unit: string;
}

export class EmissionFactorResponseDto {
  id: number;
  name: string;
  scopeId: number;
  scope: { id: number; name: string; code: string };
  sourceDatabaseId: number;
  sourceDatabase: { id: number; name: string };
  uncertainty: number | null;
  computeMethod: ComputeMethod;
  unitOfMeasure: string;
  status: string;
  value: number;
  gasLines: GasLineResponseDto[];
}
