import { apiClient } from '@/lib/axios/api-client';
import { Invoice, InvoicePayload } from '@/types/invoice.interface';

export const getInvoices = async (): Promise<Invoice[]> => {
  const { data } = await apiClient.get<Invoice[]>('/invoices');
  return data;
};

export const createInvoice = async (
  payload: InvoicePayload,
): Promise<Invoice> => {
  const { data } = await apiClient.post<Invoice>('/invoices', payload);
  return data;
};

export const updateInvoice = async (
  id: number,
  payload: Partial<InvoicePayload>,
): Promise<Invoice> => {
  const { data } = await apiClient.patch<Invoice>(`/invoices/${id}`, payload);
  return data;
};

export const postInvoice = async (id: number): Promise<Invoice> => {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/post`);
  return data;
};

export const deleteInvoice = async (id: number): Promise<void> => {
  await apiClient.delete(`/invoices/${id}`);
};
