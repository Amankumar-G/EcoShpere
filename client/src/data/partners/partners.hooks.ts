import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPartner,
  deletePartner,
  getPartners,
  importPartnersCsv,
  updatePartner,
} from '@/data/partners/partners.api';
import { PartnerPayload } from '@/types/partner.interface';

export const partnersQueryKeys = {
  list: ['partners', 'list'] as const,
};

export const usePartners = () =>
  useQuery({ queryKey: partnersQueryKeys.list, queryFn: getPartners });

const useInvalidatePartners = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: partnersQueryKeys.list });
};

export const useCreatePartner = () => {
  const invalidate = useInvalidatePartners();
  return useMutation({
    mutationFn: (payload: PartnerPayload) => createPartner(payload),
    onSuccess: invalidate,
  });
};

export const useUpdatePartner = () => {
  const invalidate = useInvalidatePartners();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PartnerPayload }) =>
      updatePartner(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeletePartner = () => {
  const invalidate = useInvalidatePartners();
  return useMutation({
    mutationFn: (id: number) => deletePartner(id),
    onSuccess: invalidate,
  });
};

export const useImportPartnersCsv = () => {
  const invalidate = useInvalidatePartners();
  return useMutation({
    mutationFn: (csv: string) => importPartnersCsv(csv),
    onSuccess: invalidate,
  });
};
