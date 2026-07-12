import { apiClient } from '@/lib/axios/api-client';
import { Account, AccountPayload } from '@/types/account.interface';
import { CsvImportResult } from '@/types/records.interface';

export const getAccounts = async (): Promise<Account[]> => {
  const { data } = await apiClient.get<Account[]>('/accounts');
  return data;
};

export const createAccount = async (
  payload: AccountPayload,
): Promise<Account> => {
  const { data } = await apiClient.post<Account>('/accounts', payload);
  return data;
};

export const updateAccount = async (
  id: number,
  payload: AccountPayload,
): Promise<Account> => {
  const { data } = await apiClient.patch<Account>(`/accounts/${id}`, payload);
  return data;
};

export const deleteAccount = async (id: number): Promise<void> => {
  await apiClient.delete(`/accounts/${id}`);
};

export const importAccountsCsv = async (
  csv: string,
): Promise<CsvImportResult> => {
  const { data } = await apiClient.post<CsvImportResult>('/accounts/import', {
    csv,
  });
  return data;
};
