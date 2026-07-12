export const PARTNER_TYPES = ['vendor', 'customer', 'both'] as const;

export interface Partner {
  id: number;
  name: string;
  type: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
}

export interface PartnerPayload {
  name: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}
