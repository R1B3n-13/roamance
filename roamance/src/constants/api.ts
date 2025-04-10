import { UserEndpoints } from '@/types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const USER_ENDPOINTS: UserEndpoints = {
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
};
