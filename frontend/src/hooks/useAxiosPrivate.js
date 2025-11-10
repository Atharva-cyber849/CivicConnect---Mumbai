import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiRoutes';
import { STORAGE_KEYS } from '../config/constants';

// Create axios instance with interceptors for automatic token refresh
export const useAxiosPrivate = () => {
  const { token, logout } = useAuth();

  useEffect(() => {
    const requestIntercept = axios.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;

          try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            
            if (!refreshToken) {
              logout();
              return Promise.reject(error);
            }

            const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
              refresh: refreshToken
            });

            const newAccessToken = response.data.access;
            
            // Update stored tokens
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
            
            // Update the failed request with new token
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            return axios(prevRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestIntercept);
      axios.interceptors.response.eject(responseIntercept);
    };
  }, [token, logout]);

  return axios;
};