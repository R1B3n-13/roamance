import { ACTIVITIES_ENDPOINTS } from '@/constants/api';
import { api } from '@/api/roamance-api';
import { ApiError } from '@/api/errors';
import {
  ActivityCreateRequest,
  ActivityUpdateRequest,
  ActivityResponse,
  ActivityListResponse,
} from '@/types/activity';

export const ActivityService = {
  createActivity: async (
    activity: ActivityCreateRequest
  ): Promise<ActivityResponse> => {
    try {
      const response = await api.post<ActivityResponse, ActivityCreateRequest>(
        ACTIVITIES_ENDPOINTS.CREATE,
        activity
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create activity: ${error.message}`);
      }
      throw error;
    }
  },

  getActivity: async (
    activityId: string
  ): Promise<ActivityResponse> => {
    try {
      const response = await api.get<ActivityResponse>(
        ACTIVITIES_ENDPOINTS.GET(activityId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get activity: ${error.message}`);
      }
      throw error;
    }
  },

  getActivitiesByDayPlanId: async (
    dayPlanId: string
  ): Promise<ActivityListResponse> => {
    try {
      const response = await api.get<ActivityListResponse>(
        ACTIVITIES_ENDPOINTS.GET_BY_DAY_PLAN_ID(dayPlanId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get activities: ${error.message}`);
      }
      throw error;
    }
  },

  updateActivity: async (
    activityId: string,
    activity: ActivityUpdateRequest
  ): Promise<ActivityResponse> => {
    try {
      const response = await api.put<ActivityResponse, ActivityUpdateRequest>(
        ACTIVITIES_ENDPOINTS.UPDATE(activityId),
        activity
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update activity: ${error.message}`);
      }
      throw error;
    }
  },

  deleteActivity: async (
    activityId: string
  ): Promise<{ data: null }> => {
    try {
      const response = await api.delete<{ data: null }>(
        ACTIVITIES_ENDPOINTS.DELETE(activityId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete activity: ${error.message}`);
      }
      throw error;
    }
  },
};
