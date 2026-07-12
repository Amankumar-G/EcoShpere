import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBusinessTravel,
  deleteBusinessTravel,
  getBusinessTravels,
  updateBusinessTravel,
} from '@/data/business-travel/business-travel.api';
import { BusinessTravelPayload } from '@/types/business-travel.interface';

export const businessTravelQueryKeys = {
  list: ['business-travels', 'list'] as const,
};

export const useBusinessTravels = () =>
  useQuery({
    queryKey: businessTravelQueryKeys.list,
    queryFn: getBusinessTravels,
  });

const useInvalidateBusinessTravels = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: businessTravelQueryKeys.list });
};

export const useCreateBusinessTravel = () => {
  const invalidate = useInvalidateBusinessTravels();
  return useMutation({
    mutationFn: (payload: BusinessTravelPayload) =>
      createBusinessTravel(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateBusinessTravel = () => {
  const invalidate = useInvalidateBusinessTravels();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: BusinessTravelPayload;
    }) => updateBusinessTravel(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteBusinessTravel = () => {
  const invalidate = useInvalidateBusinessTravels();
  return useMutation({
    mutationFn: (id: number) => deleteBusinessTravel(id),
    onSuccess: invalidate,
  });
};
