import { Role } from '@prisma/client';

export class EmployeeResponseDto {
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

export class EmployeeListResponseDto {
  items: EmployeeResponseDto[];
  total: number;
}
