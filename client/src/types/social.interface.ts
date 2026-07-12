// Phase 3 — Social pillar shapes (CSR activities + participation).

export const CSR_ACTIVITY_STATUSES = [
  'draft',
  'active',
  'completed',
  'archived',
] as const;

export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;

export interface CsrActivity {
  id: number;
  title: string;
  description: string | null;
  categoryId: number | null;
  departmentId: number | null;
  points: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
}

export interface CsrActivityPayload {
  title: string;
  description?: string;
  categoryId?: number;
  departmentId?: number;
  points?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Participation {
  id: number;
  employeeId: number;
  employeeName: string;
  csrActivityId: number;
  csrActivityTitle: string;
  proofUrl: string | null;
  approvalStatus: string;
  pointsEarned: number;
  completionDate: string | null;
}
