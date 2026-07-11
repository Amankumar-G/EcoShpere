const AUTH_TOKEN_KEY = "accessToken";

export const useAuthToken = () => {
  const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
  const setToken = (token: string) =>
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  const clearToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

  return { getToken, setToken, clearToken };
};
