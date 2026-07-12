export type Role = 'admin' | 'manager' | 'employee';

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  departmentId: number | null;
}

export interface AuthResponse {
  accessToken: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name?: string;
}
