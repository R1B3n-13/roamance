import { ApiResponse } from './api';

export interface UserAuthForm {
  email: string;
  password: string;
}

export interface UserRegisterForm extends UserAuthForm {
  name: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthResponse extends ApiResponse {
  access_token: string;
  refresh_token: string;
}
