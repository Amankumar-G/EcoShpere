export interface EmissionScope {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  children?: EmissionScope[];
}

export interface EmissionScopePayload {
  name: string;
  code: string;
  parentId?: number | null;
}
