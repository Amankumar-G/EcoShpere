import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, register } from "@/data/auth/auth.api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { LoginPayload, RegisterPayload } from "@/types/auth.interface";

export const authQueryKeys = {
  me: ["auth", "me"] as const,
};

export const useMe = () => {
  const { getToken } = useAuthToken();
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    enabled: Boolean(getToken()),
  });
};

export const useLogin = () => {
  const { setToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: ({ accessToken }) => {
      setToken(accessToken);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
    },
  });
};

export const useRegister = () => {
  const { setToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: ({ accessToken }) => {
      setToken(accessToken);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
    },
  });
};

export const useLogout = () => {
  const { clearToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearToken();
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
    },
  });
};
