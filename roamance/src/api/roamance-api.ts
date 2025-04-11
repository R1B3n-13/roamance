import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { STORAGE_KEYS } from '../constants/keys';
import { ApiError } from './errors';

export class ApiService {
  private api: AxiosInstance;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5000/api'
  ) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ?
        localStorage.getItem(STORAGE_KEYS.TOKEN) : null;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      this.handleRequestError
    );
  }

  private handleRequestError(error: AxiosError): never {
    if (error.response) {
      const message =
        (error.response.data as { message?: string })?.message ||
        'An error occurred';
      throw new ApiError(
        message,
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new ApiError('No response from server', 503);
    } else {
      throw new ApiError(
        error.message || 'Request configuration error',
        500
      );
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
