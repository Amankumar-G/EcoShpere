export interface Product {
  id: number;
  name: string;
  code: string;
  uom: string;
  defaultAccountId: number | null;
  status: string;
}

export interface ProductPayload {
  name: string;
  code: string;
  uom: string;
  defaultAccountId?: number | null;
  status?: string;
}
