export const TRAVEL_MODES = ['flight', 'train', 'car', 'bus'] as const;

export interface BusinessTravel {
  id: number;
  employeeId: number;
  mode: string;
  origin: string | null;
  destination: string | null;
  // Prisma Decimal is serialized as a string over JSON.
  distanceKm: string | null;
  date: string;
  purpose: string | null;
}

export interface BusinessTravelPayload {
  employeeId: number;
  mode: string;
  origin?: string;
  destination?: string;
  distanceKm?: number;
  date: string;
  purpose?: string;
}
