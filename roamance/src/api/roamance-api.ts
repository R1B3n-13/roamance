import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { STORAGE_KEYS } from '@/constants/keys';
import { USER_ENDPOINTS } from '@/constants/api';

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [USER_ENDPOINTS.LOGIN, USER_ENDPOINTS.REGISTER];

class Api {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
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

          // Handle token refresh logic here if you have refresh tokens
          // For now, just redirecting to login if token is expired
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
            window.location.href = '/auth/sign-in'; // Redirect to login page
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

    if (!token || !expiryStr) return null;

    const expiry = new Date(expiryStr);
    return expiry > new Date() ? token : null;
  }

  // Expose the axios instance methods
  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config);
  }

  post<T, K>(url: string, data?: K, config?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, config);
  }

  put<T, K>(url: string, data?: K, config?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete<T>(url, config);
  }

  // Expose the axios instance directly if needed
  getInstance() {
    return this.instance;
  }
}

// Create and export the API singleton
export const api = new Api();
export default api;
