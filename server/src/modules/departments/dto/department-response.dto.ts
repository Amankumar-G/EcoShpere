export class DepartmentResponseDto {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  headEmployeeId: number | null;
  employeeCount: number;
  status: string;
}
