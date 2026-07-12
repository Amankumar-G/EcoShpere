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
}
