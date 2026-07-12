import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createExpense,
  deleteExpense,
  getExpenses,
  transitionExpense,
  updateExpense,
} from '@/data/expenses/expenses.api';
import { ExpensePayload } from '@/types/expense.interface';

export const expensesQueryKeys = {
  list: ['expenses', 'list'] as const,
};

export const useExpenses = () =>
  useQuery({ queryKey: expensesQueryKeys.list, queryFn: getExpenses });

const useInvalidateExpenses = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: expensesQueryKeys.list });
};

export const useCreateExpense = () => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: (payload: ExpensePayload) => createExpense(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateExpense = () => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ExpensePayload>;
    }) => updateExpense(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteExpense = () => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: invalidate,
  });
};

export const useTransitionExpense = () => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: 'submit' | 'approve' | 'reject' | 'post';
    }) => transitionExpense(id, action),
    onSuccess: invalidate,
  });
};
