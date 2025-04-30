import { ApiError } from '@/api/errors';
import { api } from '@/api/roamance-api';
import { ITINERARY_ENDPOINTS, AI_ENDPOINTS } from '@/constants/api';
import {
  BaseResponse,
  ItineraryCreateRequest,
  ItineraryDetailResponse,
  ItineraryListResponse,
  ItineraryWithDetailsRequest,
  AiPoweredItineraryCreateRequest,
  AiPoweredItineraryResponse,
} from '@/types';



export const ItineraryService = {
  createItinerary: async (
    itinerary: ItineraryCreateRequest
  ): Promise<ItineraryDetailResponse> => {
    try {
      const response = await api.post<
        ItineraryDetailResponse,
        ItineraryCreateRequest
      >(ITINERARY_ENDPOINTS.CREATE, itinerary);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create itinerary: ${error.message}`);
      }
      throw error;
    }
  },

  createItineraryWithDetails: async (
    itineraryWithDetails: ItineraryWithDetailsRequest
  ): Promise<ItineraryDetailResponse> => {
    try {
      const response = await api.post<
        ItineraryDetailResponse,
        ItineraryWithDetailsRequest
      >(
        ITINERARY_ENDPOINTS.CREATE_WITH_DETAILS,
        itineraryWithDetails
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create itinerary with details: ${error.message}`);
      }
      throw error;
    }
  },

  getItinerary: async (
    itineraryId: string
  ): Promise<ItineraryDetailResponse> => {
    try {
      const response = await api.get<ItineraryDetailResponse>(
        ITINERARY_ENDPOINTS.GET_BY_ID(itineraryId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get itinerary: ${error.message}`);
      }
      throw error;
    }
  },

  getAllItineraries: async (): Promise<ItineraryListResponse> => {
    try {
      const response = await api.get<ItineraryListResponse>(
        ITINERARY_ENDPOINTS.GET_ALL
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to get all itineraries: ${error.message}`);
      }
      throw error;
    }
  },

  getItinerariesByUserId: async (
    userId: string
  ): Promise<ItineraryListResponse> => {
    try {
      const response = await api.get<ItineraryListResponse>(
        ITINERARY_ENDPOINTS.GET_BY_USER_ID(userId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(
          `Failed to get itineraries by user ID: ${error.message}`
        );
      }
      throw error;
    }
  },

  updateItinerary: async (
    itineraryId: string,
    itinerary: ItineraryCreateRequest
  ): Promise<ItineraryDetailResponse> => {
    try {
      const response = await api.put<
        ItineraryDetailResponse,
        ItineraryCreateRequest
      >(ITINERARY_ENDPOINTS.UPDATE(itineraryId), itinerary);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update itinerary: ${error.message}`);
      }
      throw error;
    }
  },

  deleteItinerary: async (itineraryId: string): Promise<BaseResponse<null>> => {
    try {
      const response = await api.delete<BaseResponse<null>>(
        ITINERARY_ENDPOINTS.DELETE(itineraryId)
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete itinerary: ${error.message}`);
      }
      throw error;
    }
  },

  generateItinerary: async (
    request: AiPoweredItineraryCreateRequest
  ): Promise<AiPoweredItineraryResponse> => {
    try {
      const response = await api.post<
        AiPoweredItineraryResponse,
        AiPoweredItineraryCreateRequest
      >(AI_ENDPOINTS.GENERATE_ITINERARY, request);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to generate itinerary: ${error.message}`);
      }
      throw error;
    }
  },
};
