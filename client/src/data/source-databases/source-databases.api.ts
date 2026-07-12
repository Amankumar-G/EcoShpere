import { apiClient } from '@/lib/axios/api-client';
import {
  SourceDatabase,
  SourceDatabasePayload,
} from '@/types/source-database.interface';

export const getSourceDatabases = async (): Promise<SourceDatabase[]> => {
  const { data } = await apiClient.get<SourceDatabase[]>('/source-databases');
  return data;
};

export const createSourceDatabase = async (
  payload: SourceDatabasePayload,
): Promise<SourceDatabase> => {
  const { data } = await apiClient.post<SourceDatabase>(
    '/source-databases',
    payload,
  );
  return data;
};

export const updateSourceDatabase = async (
  id: number,
  payload: SourceDatabasePayload,
): Promise<SourceDatabase> => {
  const { data } = await apiClient.patch<SourceDatabase>(
    `/source-databases/${id}`,
    payload,
  );
  return data;
};

export const deleteSourceDatabase = async (id: number): Promise<void> => {
  await apiClient.delete(`/source-databases/${id}`);
};
