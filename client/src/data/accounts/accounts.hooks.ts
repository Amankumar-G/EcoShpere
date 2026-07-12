import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAccount,
  deleteAccount,
  getAccounts,
  importAccountsCsv,
  updateAccount,
} from '@/data/accounts/accounts.api';
import { AccountPayload } from '@/types/account.interface';

export const accountsQueryKeys = {
  list: ['accounts', 'list'] as const,
};

export const useAccounts = () =>
  useQuery({ queryKey: accountsQueryKeys.list, queryFn: getAccounts });

const useInvalidateAccounts = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: accountsQueryKeys.list });
};

export const useCreateAccount = () => {
  const invalidate = useInvalidateAccounts();
  return useMutation({
    mutationFn: (payload: AccountPayload) => createAccount(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateAccount = () => {
  const invalidate = useInvalidateAccounts();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AccountPayload }) =>
      updateAccount(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteAccount = () => {
  const invalidate = useInvalidateAccounts();
  return useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: invalidate,
  });
};

export const useImportAccountsCsv = () => {
  const invalidate = useInvalidateAccounts();
  return useMutation({
    mutationFn: (csv: string) => importAccountsCsv(csv),
    onSuccess: invalidate,
  });
};
