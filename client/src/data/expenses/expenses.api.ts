import { apiClient } from '@/lib/axios/api-client';
import { ExpensePayload, ExpenseRecord } from '@/types/expense.interface';

export const getExpenses = async (): Promise<ExpenseRecord[]> => {
  const { data } = await apiClient.get<ExpenseRecord[]>('/expenses');
  return data;
};

export const createExpense = async (
  payload: ExpensePayload,
): Promise<ExpenseRecord> => {
  const { data } = await apiClient.post<ExpenseRecord>('/expenses', payload);
  return data;
};

export const updateExpense = async (
  id: number,
  payload: Partial<ExpensePayload>,
): Promise<ExpenseRecord> => {
  const { data } = await apiClient.patch<ExpenseRecord>(
    `/expenses/${id}`,
    payload,
  );
  return data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await apiClient.delete(`/expenses/${id}`);
};

/** Lifecycle transitions: submit | approve | reject | post. */
export const transitionExpense = async (
  id: number,
  action: 'submit' | 'approve' | 'reject' | 'post',
): Promise<ExpenseRecord> => {
  const { data } = await apiClient.post<ExpenseRecord>(
    `/expenses/${id}/${action}`,
  );
  return data;
};
