export type CategoryType = 'csr_activity' | 'challenge';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

export interface CategoryPayload {
  name: string;
  type: CategoryType;
}
