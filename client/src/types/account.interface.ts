export const ACCOUNT_TYPES = [
  'expense',
  'asset',
  'liability',
  'income',
  'equity',
] as const;

export interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
}

export interface AccountPayload {
  code: string;
  name: string;
  type: string;
  status?: string;
}
