import { apiClient } from '@/lib/axios/api-client';
import { FleetCommutingRunResult } from '@/types/fleet-commuting.interface';

export const runFleetCommuting = async (
  period: string,
): Promise<FleetCommutingRunResult> => {
  const { data } = await apiClient.post<FleetCommutingRunResult>(
    '/fleet-commuting/run',
    { period },
  );
  return data;
};
