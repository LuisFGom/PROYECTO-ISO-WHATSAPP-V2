// frontend/src/infrastructure/api/apiClient.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { useAuthStore } from '../../presentation/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private static instance: ApiClient;
  public axios: AxiosInstance;

  private constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        // 👇 Agrega esto para saltar el aviso de ngrok
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // Interceptor de request
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de respuesta
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const token = localStorage.getItem('token');

        if (status === 401 && token) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
}

export const apiClient = ApiClient.getInstance().axios;
