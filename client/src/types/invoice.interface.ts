export interface InvoiceLine {
  id: number;
  invoiceId: number;
  productId: number | null;
  accountId: number;
  description: string | null;
  // Prisma Decimal fields are serialized as strings over JSON.
  quantity: string;
  uom: string;
  unitPrice: string;
  amount: string;
}

export interface Invoice {
  id: number;
  partnerId: number;
  date: string;
  currency: string;
  status: string;
  totalAmount: string;
  postedAt: string | null;
  lines: InvoiceLine[];
}

export interface InvoiceLinePayload {
  productId?: number;
  accountId: number;
  description?: string;
  quantity: number;
  uom: string;
  unitPrice: number;
}

export interface InvoicePayload {
  partnerId: number;
  date: string;
  currency?: string;
  lines: InvoiceLinePayload[];
}
