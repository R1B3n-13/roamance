import { UserEndpoints } from '@/types';
import { ENV_VARS } from './keys';

export const API_BASE_URL = ENV_VARS.API_URL;

export const USER_ENDPOINTS: UserEndpoints = {
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  UPDATE: `${API_BASE_URL}/users/update`,
  DELETE: `${API_BASE_URL}/users/delete`,
  PROFILE: `${API_BASE_URL}/users/profile`,
};
