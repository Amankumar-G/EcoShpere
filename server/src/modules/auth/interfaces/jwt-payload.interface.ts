import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  departmentId: number | null;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  departmentId: number | null;
  // Enriched by JwtStrategy on every authenticated request (optional so the
  // login-time principal and test fixtures need not construct them).
  departmentName?: string | null;
  xp?: number;
  points?: number;
}
