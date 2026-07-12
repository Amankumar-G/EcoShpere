// Phase 3 — Environmental pillar shapes (goals + initiatives).

export const GOAL_STATUSES = [
  'active',
  'achieved',
  'missed',
  'archived',
] as const;

export const INITIATIVE_STATUSES = [
  'open',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export interface EnvironmentalGoal {
  id: number;
  departmentId: number | null;
  metric: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface EnvironmentalGoalPayload {
  departmentId?: number;
  metric: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface Initiative {
  id: number;
  title: string;
  description: string | null;
  departmentId: number | null;
  assigneeEmployeeId: number | null;
  estimatedCo2Reduction: number | null;
  actualCo2Reduction: number | null;
  progress: number;
  deadline: string | null;
  status: string;
  createdAt: string;
}

export interface InitiativePayload {
  title: string;
  description?: string;
  departmentId?: number;
  assigneeEmployeeId?: number;
  estimatedCo2Reduction?: number;
  actualCo2Reduction?: number;
  progress?: number;
  deadline?: string;
  status?: string;
}
