import { apiClient } from '@/lib/axios/api-client';
import { getApiBaseUrl } from '@/configuration/configuration';

export interface UploadedFile {
  filename: string;
  url: string;
}

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<UploadedFile>('/uploads', formData);
  return data;
};

/** Resolve a stored relative url (`/uploads/x`) to an absolute, viewable URL. */
export const toAbsoluteUploadUrl = (url: string): string =>
  url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`;
