import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPayrollContract,
  deletePayrollContract,
  getPayrollContracts,
  updatePayrollContract,
} from '@/data/payroll/payroll.api';
import { PayrollContractPayload } from '@/types/payroll.interface';

export const payrollQueryKeys = {
  list: ['payroll-contracts', 'list'] as const,
};

export const usePayrollContracts = () =>
  useQuery({
    queryKey: payrollQueryKeys.list,
    queryFn: getPayrollContracts,
    retry: false,
  });

const useInvalidatePayroll = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: payrollQueryKeys.list });
};

export const useCreatePayrollContract = () => {
  const invalidate = useInvalidatePayroll();
  return useMutation({
    mutationFn: (payload: PayrollContractPayload) =>
      createPayrollContract(payload),
    onSuccess: invalidate,
  });
};

export const useUpdatePayrollContract = () => {
  const invalidate = useInvalidatePayroll();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PayrollContractPayload;
    }) => updatePayrollContract(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeletePayrollContract = () => {
  const invalidate = useInvalidatePayroll();
  return useMutation({
    mutationFn: (id: number) => deletePayrollContract(id),
    onSuccess: invalidate,
  });
};
