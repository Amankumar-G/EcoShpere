import { apiClient } from '@/lib/axios/api-client';
import { AuthResponse, AuthUser, LoginPayload } from '@/types/auth.interface';

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const getMe = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
