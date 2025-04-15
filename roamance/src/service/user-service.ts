import { ApiError } from '../api/errors';
import { api } from '../api/roamance-api';
import { USER_ENDPOINTS, USER_INFO_ENDPOINTS } from '../constants/api';
import { User, UserInfo, UserInfoResponse, UserResponse } from '../types';

export class UserService {
  private apiService: typeof api;

  constructor(apiService: typeof api) {
    this.apiService = apiService;
  }

  /**
   * Fetches the basic user profile data
   */
  async getUserProfile(): Promise<User> {
    try {
      const response = await this.apiService.get<UserResponse>(USER_ENDPOINTS.PROFILE);
      return response.data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches the extended user information
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      const response = await this.apiService.get<UserInfoResponse>(USER_INFO_ENDPOINTS.ME);
      return response.data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch user info: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches both user profile and extended info in parallel
   */
  async getFullUserProfile(): Promise<{ user: User; userInfo: UserInfo }> {
    try {
      const [userProfile, userInfo] = await Promise.all([
        this.getUserProfile(),
        this.getUserInfo(),
      ]);

      return {
        user: userProfile,
        userInfo: userInfo,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch full user profile: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Updates the extended user information
   */
  async updateUserInfo(userInfo: Partial<UserInfo>): Promise<UserInfo> {
    try {
      const response = await this.apiService.put<UserInfoResponse, Partial<UserInfo>>(
        USER_INFO_ENDPOINTS.UPDATE,
        userInfo
      );
      return response.data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update user info: ${error.message}`);
      }
      throw error;
    }
  }
}

export const userService = new UserService(api);
