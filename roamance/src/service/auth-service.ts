import { AuthResponse, User } from '../types';
import { STORAGE_KEYS } from '../constants/keys';
import { ApiError } from '../api/errors';
import { ApiService } from '../api/roamance-api';

export class AuthService {
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      this.saveAuthData(response);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw error;
    }
  }

  async register(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<AuthResponse>(
        '/auth/register',
        userData
      );
      this.saveAuthData(response);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw error;
    }
  }

  logout(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

    if (!token || !expiryStr) return false;

    const expiry = new Date(expiryStr);
    return expiry > new Date();
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      console.error('Failed to parse user data:', e);
      return null;
    }
  }

  private saveAuthData(authData: AuthResponse): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toISOString());
  }
}

import { apiService } from '../api/roamance-api';
export const authService = new AuthService(apiService);
