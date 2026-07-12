import { apiClient } from '@/lib/axios/api-client';
import { EsgConfigKey, EsgConfigValueMap } from '@/types/esg-config.interface';

export const getEsgConfigValue = async <K extends EsgConfigKey>(
  key: K,
): Promise<EsgConfigValueMap[K]> => {
  const { data } = await apiClient.get<EsgConfigValueMap[K]>(
    `/esg-config/${key}`,
  );
  return data;
};

export const updateEsgConfigValue = async <K extends EsgConfigKey>(
  key: K,
  value: EsgConfigValueMap[K],
): Promise<void> => {
  await apiClient.patch(`/esg-config/${key}`, { value });
};
