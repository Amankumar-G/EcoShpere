export type EmissionSourceType = 'accounting' | 'fleet_commuting' | 'manual';

export interface EmittedEmission {
  id: number;
  name: string;
  departmentId: number;
  sourceType: EmissionSourceType;
  sourceRefId: number | null;
  emissionFactorId: number;
  employeeId: number | null;
  quantity: number;
  co2eValue: number;
  periodStart: string | null;
  periodEnd: string | null;
  date: string;
  evidenceUrl: string | null;
  createdAt: string;
}

export interface EmittedEmissionPayload {
  name: string;
  emissionFactorId: number;
  quantity: number;
  date: Date;
  departmentId: number;
  evidenceUrl?: string;
  businessTravelRefId?: number;
}
