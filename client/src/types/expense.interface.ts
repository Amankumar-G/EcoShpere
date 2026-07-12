export interface ExpenseRecord {
  id: number;
  employeeId: number;
  date: string;
  accountId: number | null;
  productId: number | null;
  description: string | null;
  // Prisma Decimal fields are serialized as strings over JSON.
  quantity: string | null;
  uom: string | null;
  amount: string;
  status: string;
  postedAt: string | null;
}

export interface ExpensePayload {
  employeeId: number;
  date: string;
  accountId?: number;
  productId?: number;
  description?: string;
  quantity?: number;
  uom?: string;
  amount: number;
}
