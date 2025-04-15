import { ENV_VARS } from './keys';

export const API_BASE_URL = ENV_VARS.API_URL;

export const USER_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  UPDATE: `${API_BASE_URL}/users/update`,
  DELETE: `${API_BASE_URL}/users/delete`,
  PROFILE: `${API_BASE_URL}/users/profile`,
} as const;

const USER_INFO = `${API_BASE_URL}/users/info`;
export const USER_INFO_ENDPOINTS = {
  ROOT: USER_INFO,
  ME: `${USER_INFO}/me`,
  UPDATE: `${USER_INFO}`,
  DELETE: `${USER_INFO}`,
};
