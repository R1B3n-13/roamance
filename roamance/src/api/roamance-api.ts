import { USER_ENDPOINTS } from '@/constants/api';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { ApiError } from './errors';
import { ApiResponse } from '@/types';

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [USER_ENDPOINTS.LOGIN, USER_ENDPOINTS.REGISTER];

class Api {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

    this.instance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Skip adding token for public endpoints
        if (this.isPublicEndpoint(config.url || '')) {
          return config;
        }

        // Add token to request headers if available
        const token = this.getToken();
        if (token && config.headers) {
          // Ensure the token is properly formatted
          config.headers.Authorization = `Bearer ${token}`;
          // For debugging
          console.log(
            'Request with token:',
            config.url,
            token.substring(0, 10) + '...'
          );
        } else {
          console.warn('No token available for request:', config.url);
        }

        return config;
      },
      (error: AxiosError<ApiResponse>) => {
        const errorResponse = error.response?.data;
        const status = errorResponse?.status || error.response?.status || 500;
        const message = errorResponse?.message || error.message || 'Unknown error occurred';
        return Promise.reject(new ApiError(message, status));
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized errors (token expired)
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !this.isPublicEndpoint(originalRequest.url || '')
        ) {
          originalRequest._retry = true;

          // Handle token expiration - clear cookies and redirect to login
          if (typeof window !== 'undefined') {
            console.log('Unauthorized access, clearing tokens and redirecting');
            document.cookie =
              'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie =
              'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/auth/sign-in'; // Redirect to login page
          }
        }

        // Standard error handling using ApiResponse type
        const errorResponse = error.response?.data;
        const status = errorResponse?.status || error.response?.status || 500;
        const message = errorResponse?.message || error.message || 'Unknown error occurred';
        const success = errorResponse?.success || false;

        console.error('API Error:', message, 'Status:', status, 'Success:', success);
        return Promise.reject(new ApiError(message, status));
      }
    );
  }

  private isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      // Get token from cookies instead of localStorage
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('access_token=')
      );

      if (!tokenCookie) {
        console.warn('No token found in cookies');
        return null;
      }

      const token = tokenCookie.split('=')[1];
      console.log('Token retrieved from cookies');

      return token;
    } catch (error) {
      console.error('Error accessing cookies:', error);
      return null;
    }
  }

  // Expose the axios instance methods
  get<T, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.get<T, R>(url, config);
  }

  post<T, K, R = AxiosResponse<T>>(
    url: string,
    data?: K,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.post<T, R>(url, data, config);
  }

  put<T, K, R = AxiosResponse<T>>(
    url: string,
    data?: K,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.put<T, R>(url, data, config);
  }

  delete<T, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.delete<T, R>(url, config);
  }

  // Expose the axios instance directly if needed
  getInstance() {
    return this.instance;
  }
}

// Create and export the API singleton
export const api = new Api();
export default api;
