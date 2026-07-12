import { apiClient } from '@/lib/axios/api-client';
import {
  AssignationRule,
  AssignationRulePayload,
} from '@/types/assignation-rule.interface';

export const getAssignationRules = async (): Promise<AssignationRule[]> => {
  const { data } = await apiClient.get<AssignationRule[]>('/assignation-rules');
  return data;
};

export const getAssignationRule = async (
  id: number,
): Promise<AssignationRule> => {
  const { data } = await apiClient.get<AssignationRule>(
    `/assignation-rules/${id}`,
  );
  return data;
};

export const createAssignationRule = async (
  payload: AssignationRulePayload,
): Promise<AssignationRule> => {
  const { data } = await apiClient.post<AssignationRule>(
    '/assignation-rules',
    payload,
  );
  return data;
};

export const updateAssignationRule = async (
  id: number,
  payload: Partial<AssignationRulePayload>,
): Promise<AssignationRule> => {
  const { data } = await apiClient.patch<AssignationRule>(
    `/assignation-rules/${id}`,
    payload,
  );
  return data;
};

export const deleteAssignationRule = async (id: number): Promise<void> => {
  await apiClient.delete(`/assignation-rules/${id}`);
};
