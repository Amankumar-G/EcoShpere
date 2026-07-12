import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  postInvoice,
  updateInvoice,
} from '@/data/invoices/invoices.api';
import { InvoicePayload } from '@/types/invoice.interface';

export const invoicesQueryKeys = {
  list: ['invoices', 'list'] as const,
};

export const useInvoices = () =>
  useQuery({ queryKey: invoicesQueryKeys.list, queryFn: getInvoices });

const useInvalidateInvoices = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.list });
};

export const useCreateInvoice = () => {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (payload: InvoicePayload) => createInvoice(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateInvoice = () => {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<InvoicePayload>;
    }) => updateInvoice(id, payload),
    onSuccess: invalidate,
  });
};

export const usePostInvoice = () => {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (id: number) => postInvoice(id),
    onSuccess: invalidate,
  });
};

export const useDeleteInvoice = () => {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: invalidate,
  });
};
