import axios, { AxiosError } from 'axios';
import { USER_ENDPOINTS } from '@/constants/api';
import {
  ApiAuthUserResponse,
  UserAuthForm,
  UserRegisterForm,
} from '@/types/auth';
import { ApiResponse } from '@/types';
import { ApiError } from './errors';

export async function registerUser(
  data: UserRegisterForm
): Promise<ApiResponse> {
  try {
    const response = await axios.post(USER_ENDPOINTS.REGISTER, data);
    return response.data;
  } catch (error) {
    console.error('Failed to register user', error);

    // Handle error as ApiResponse
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorResponse = axiosError.response?.data;
      const status = errorResponse?.status || axiosError.response?.status || 500;
      const message = errorResponse?.message || 'Failed to register user';
      throw new ApiError(message, status);
    }

    throw new ApiError('Failed to register user', 500);
  }
}

export async function loginUser(
  data: UserAuthForm
): Promise<ApiAuthUserResponse> {
  try {
    const response = await axios.post(USER_ENDPOINTS.LOGIN, data);
    return response.data;
  } catch (error) {
    console.error('Failed to login user', error);

    // Handle error as ApiResponse
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorResponse = axiosError.response?.data;
      const status = errorResponse?.status || axiosError.response?.status || 500;
      const message = errorResponse?.message || 'Failed to login';
      throw new ApiError(message, status);
    }

    throw new ApiError('Failed to login', 500);
  }
}
