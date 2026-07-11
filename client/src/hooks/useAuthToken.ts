const AUTH_TOKEN_KEY = 'accessToken';

const isBrowser = () => typeof window !== 'undefined';

export const useAuthToken = () => {
  const getToken = () =>
    isBrowser() ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const setToken = (token: string) => {
    if (isBrowser()) localStorage.setItem(AUTH_TOKEN_KEY, token);
  };
  const clearToken = () => {
    if (isBrowser()) localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return { getToken, setToken, clearToken };
};
