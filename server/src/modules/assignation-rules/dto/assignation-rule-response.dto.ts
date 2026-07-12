export class AssignationRuleResponseDto {
  id: number;
  emissionFactorId: number;
  productId: number | null;
  partnerId: number | null;
  accountId: number | null;
  applicationPeriodStart: Date | null;
  applicationPeriodEnd: Date | null;
  replaceExisting: boolean;
  createdAt: Date;
}
