export const getTokenFromLocalStorage = (key: string) : string | null=> {
  const token = localStorage.getItem(key);
  if (token) {
    return token;
  }
  return null;
}

export const setTokenToLocalStorage = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}