import { EmissionSourceType } from '@prisma/client';

export class EmittedEmissionResponseDto {
  id: number;
  name: string;
  departmentId: number | null;
  sourceType: EmissionSourceType;
  sourceRefId: number | null;
  emissionFactorId: number | null;
  employeeId: number | null;
  quantity: number;
  co2eValue: number;
  periodStart: Date | null;
  periodEnd: Date | null;
  date: Date;
  evidenceUrl: string | null;
  createdAt: Date;
}
