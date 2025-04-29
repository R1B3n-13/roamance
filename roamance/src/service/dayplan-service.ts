import { DAY_PLAN_ENDPOINTS } from '@/constants/api';
import {
  BaseResponse,
  DayPlanCreateRequest,
  DayPlanDetailResponse,
  DayPlanListResponse,
  DayPlanUpdateRequest,
} from '@/types';
import { api } from '@/api/roamance-api';
import { ApiError } from '@/api/errors';

export const DayPlanService = {
  createDayPlan: async (
    dayPlan: DayPlanCreateRequest
  ): Promise<DayPlanDetailResponse> => {
    try {
      const response = await api.post<
        DayPlanDetailResponse,
        DayPlanCreateRequest
      >(DAY_PLAN_ENDPOINTS.CREATE, dayPlan);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create day plan: ${error.message}`);
      }
      throw error;
    }
  },

  getDayPlan: async (dayPlanId: string): Promise<DayPlanDetailResponse> => {
    try {
      const response = await api.get<DayPlanDetailResponse>(
        DAY_PLAN_ENDPOINTS.GET(dayPlanId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get day plan: ${error.message}`);
      }
      throw error;
    }
  },

  getDayPlansByItineraryId: async (
    itineraryId: string
  ): Promise<DayPlanListResponse> => {
    try {
      const response = await api.get<DayPlanListResponse>(
        DAY_PLAN_ENDPOINTS.GET_BY_ITINERARY_ID(itineraryId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(
          `Failed to get day plans by itinerary ID: ${error.message}`
        );
      }
      throw error;
    }
  },

  updateDayPlan: async (
    dayPlanId: string,
    dayPlan: DayPlanUpdateRequest
  ): Promise<DayPlanDetailResponse> => {
    try {
      const response = await api.put<
        DayPlanDetailResponse,
        DayPlanUpdateRequest
      >(DAY_PLAN_ENDPOINTS.UPDATE(dayPlanId), dayPlan);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update day plan: ${error.message}`);
      }
      throw error;
    }
  },

  deleteDayPlan: async (dayPlanId: string): Promise<BaseResponse<null>> => {
    try {
      const response = await api.delete<BaseResponse<null>>(
        DAY_PLAN_ENDPOINTS.DELETE(dayPlanId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete day plan: ${error.message}`);
      }
      throw error;
    }
  },
};
