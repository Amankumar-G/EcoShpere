export class EmissionScopeResponseDto {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  children?: EmissionScopeResponseDto[];
}
