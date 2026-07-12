import { apiClient } from '@/lib/axios/api-client';
import {
  EnvironmentalGoal,
  EnvironmentalGoalPayload,
} from '@/types/environmental.interface';

export const getEnvironmentalGoals = async (): Promise<EnvironmentalGoal[]> => {
  const { data } = await apiClient.get<EnvironmentalGoal[]>(
    '/environmental-goals',
  );
  return data;
};

export const createEnvironmentalGoal = async (
  payload: EnvironmentalGoalPayload,
): Promise<EnvironmentalGoal> => {
  const { data } = await apiClient.post<EnvironmentalGoal>(
    '/environmental-goals',
    payload,
  );
  return data;
};

export const updateEnvironmentalGoal = async (
  id: number,
  payload: EnvironmentalGoalPayload,
): Promise<EnvironmentalGoal> => {
  const { data } = await apiClient.patch<EnvironmentalGoal>(
    `/environmental-goals/${id}`,
    payload,
  );
  return data;
};

export const deleteEnvironmentalGoal = async (id: number): Promise<void> => {
  await apiClient.delete(`/environmental-goals/${id}`);
};
