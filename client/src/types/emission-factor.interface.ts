export type ComputeMethod = 'physical' | 'monetary';

export interface EmissionFactorGasLine {
  id: number;
  emissionFactorId: number;
  gasId: number;
  gas: { id: number; name: string; symbol: string; gwp: number };
  activityType: string | null;
  value: number;
  unit: string;
}

export interface EmissionFactor {
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
  gasLines: EmissionFactorGasLine[];
}

export interface EmissionFactorPayload {
  name: string;
  scopeId: number;
  sourceDatabaseId: number;
  computeMethod: ComputeMethod;
  unitOfMeasure: string;
  uncertainty?: number;
  status?: string;
}

export interface GasLinePayload {
  gasId: number;
  activityType?: string;
  value: number;
  unit: string;
}
