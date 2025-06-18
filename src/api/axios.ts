import axios from "axios";
import { getTokenFromLocalStorage, setTokenToLocalStorage } from "../utils/storage";
 
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000, // 60 seconds
});

API.interceptors.request.use(
  (config) => {
    const token = getTokenFromLocalStorage("accessToken");
    if (token){
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
          const token = getTokenFromLocalStorage("refreshToken");
          if (!token) {
            return Promise.reject(error);
          }

          const response = await API.post("/v1/auth/token", {
            token: token
          });

          if (response.status !== 200) {
            return Promise.reject(error);
          }

          const accessToken = response.data.accessToken;
          const refreshToken = response.data.refreshToken;
          API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

            setTokenToLocalStorage(accessToken, refreshToken);
            return API(originalRequest);
      } catch (error) {
          console.error("Error refreshing token:", error);
          return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
