import { apiClient } from '@/lib/axios/api-client';
import {
  PayrollContract,
  PayrollContractPayload,
} from '@/types/payroll.interface';

export const getPayrollContracts = async (): Promise<PayrollContract[]> => {
  const { data } = await apiClient.get<PayrollContract[]>('/payroll-contracts');
  return data;
};

export const createPayrollContract = async (
  payload: PayrollContractPayload,
): Promise<PayrollContract> => {
  const { data } = await apiClient.post<PayrollContract>(
    '/payroll-contracts',
    payload,
  );
  return data;
};

export const updatePayrollContract = async (
  id: number,
  payload: PayrollContractPayload,
): Promise<PayrollContract> => {
  const { data } = await apiClient.patch<PayrollContract>(
    `/payroll-contracts/${id}`,
    payload,
  );
  return data;
};

export const deletePayrollContract = async (id: number): Promise<void> => {
  await apiClient.delete(`/payroll-contracts/${id}`);
};
