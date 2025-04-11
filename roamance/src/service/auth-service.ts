import { AuthResponse, UserRequest } from '../types';
import { COOKIE_KEYS, STORAGE_KEYS } from '../constants/keys';
import { ApiError } from '../api/errors';
import { api } from '../api/roamance-api';
import { USER_ENDPOINTS } from '../constants/api';
import Cookies from 'js-cookie';

export class AuthService {
  private apiService: typeof api;

  constructor(apiService: typeof api) {
    this.apiService = apiService;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<
        AuthResponse,
        { email: string; password: string }
      >(USER_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      this.saveAuthData(response.data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw error;
    }
  }

  async register(userData: Partial<UserRequest>): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<AuthResponse, Partial<UserRequest>>(
        USER_ENDPOINTS.REGISTER,
        userData
      );
      this.saveAuthData(response.data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw error;
    }
  }

  logout(): void {
    Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN);
    Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN);

    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  isAuthenticated(): boolean {
    const accessToken = Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
    return !!accessToken;
  }

  getCurrentUser(): UserRequest | null {
    if (typeof window === 'undefined') return null;

    const accessToken = this.getAccessToken();
    if (!accessToken) return null;

    try {
      return {
        id: 'authenticated',
        email: 'authenticated@user.com'
      } as UserRequest;
    } catch (e) {
      console.error('Failed to get current user:', e);
      return null;
    }
  }

  getAccessToken(): string | null {
    return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN) || null;
  }

  getRefreshToken(): string | null {
    return Cookies.get(COOKIE_KEYS.REFRESH_TOKEN) || null;
  }

  private saveAuthData(authData: AuthResponse): void {
    if (typeof window === 'undefined') return;

    const accessTokenExpiry = new Date(
      new Date().getTime() + 24 * 60 * 60 * 1000
    ); // 24 hours
    const refreshTokenExpiry = new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days

    const cookieOptions = {
      secure: window.location.protocol === 'https:',  // More reliable than checking NODE_ENV
      sameSite: 'strict',
      path: '/',
    } as Cookies.CookieAttributes;

    if (authData.access_token) {
      Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, authData.access_token, {
        ...cookieOptions,
        expires: accessTokenExpiry,
      });
    }

    if (authData.refresh_token) {
      Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, authData.refresh_token, {
        ...cookieOptions,
        expires: refreshTokenExpiry,
      });
    }
  }
}

import { api as apiService } from '../api/roamance-api';
export const authService = new AuthService(apiService);
