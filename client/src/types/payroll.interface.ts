export const CONTRACT_TYPES = ['permanent', 'temporary'] as const;

export const LEADERSHIP_LEVELS = ['management', 'non_management'] as const;

export interface PayrollContract {
  id: number;
  employeeId: number;
  jobPosition: string;
  contractType: string;
  leadershipLevel: string | null;
  country: string | null;
  // Prisma Decimal is serialized as a string over JSON.
  wage: string;
  startDate: string;
  endDate: string | null;
}

export interface PayrollContractPayload {
  employeeId: number;
  jobPosition: string;
  contractType: string;
  leadershipLevel?: string;
  country?: string;
  wage: number;
  startDate: string;
  endDate?: string;
}
