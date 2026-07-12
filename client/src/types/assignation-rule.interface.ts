export interface AssignationRule {
  id: number;
  emissionFactorId: number;
  productId: number | null;
  partnerId: number | null;
  accountId: number | null;
  applicationPeriodStart: string | null;
  applicationPeriodEnd: string | null;
  replaceExisting: boolean;
  createdAt: string;
}

export interface AssignationRulePayload {
  emissionFactorId: number;
  productId?: number;
  partnerId?: number;
  accountId?: number;
  applicationPeriodStart?: string;
  applicationPeriodEnd?: string;
  replaceExisting?: boolean;
}
