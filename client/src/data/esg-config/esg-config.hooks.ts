import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEsgConfigValue,
  updateEsgConfigValue,
} from '@/data/esg-config/esg-config.api';
import { EsgConfigKey, EsgConfigValueMap } from '@/types/esg-config.interface';

export const esgConfigQueryKeys = {
  value: (key: EsgConfigKey) => ['esg-config', key] as const,
};

export const useEsgConfigValue = <K extends EsgConfigKey>(key: K) => {
  return useQuery({
    queryKey: esgConfigQueryKeys.value(key),
    queryFn: () => getEsgConfigValue(key),
  });
};

export const useUpdateEsgConfigValue = <K extends EsgConfigKey>(key: K) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: EsgConfigValueMap[K]) =>
      updateEsgConfigValue(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: esgConfigQueryKeys.value(key),
      });
    },
  });
};
