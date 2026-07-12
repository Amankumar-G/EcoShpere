import { Role } from '@/types/auth.interface';

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: Role;
  gender: string | null;
  homeWorkDistance: number | null;
  xp: number;
  points: number;
  status: string;
  departmentId: number | null;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
}

export interface EmployeeQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: string;
}

export interface EmployeePayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
  departmentId?: number | null;
  gender?: string | null;
  homeWorkDistance?: number | null;
}
