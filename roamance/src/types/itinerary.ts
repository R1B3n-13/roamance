import { Location } from './location';
import { User } from './user';
import { Audit } from './audit';
import { BaseResponse } from './response';

/* ------------------------------ DayPlan types ----------------------------- */

export interface RoutePlanResponse {
  total_distance: number;
  total_time: number;
  description: string;
  locations: Location[];
}

export interface RoutePlanRequest {
  total_distance: number;
  total_time: number;
  description: string;
  locations: Location[];
}

export interface DayPlanBrief {
  id: string;
  date: string;
  total_cost: number;
  audit: Audit;
}

export interface DayPlanDetail extends DayPlanBrief {
  route_plan: RoutePlanResponse;
  notes: string[];
}

export interface DayPlanCreateRequest {
  itinerary_id: string;
  date: string;
  route_plan?: RoutePlanRequest;
  notes?: string[];
}

export interface DayPlanUpdateRequest {
  date?: string;
  route_plan?: RoutePlanRequest;
  notes?: string[];
}

export type DayPlanBriefResponse = BaseResponse<DayPlanBrief>;
export type DayPlanListResponse = BaseResponse<DayPlanBrief[]>;
export type DayPlanDetailResponse = BaseResponse<DayPlanDetail>;

export type DayPlanDtoByEndpoints = {
  CREATE: { request: DayPlanCreateRequest; response: DayPlanDetailResponse };
  GET: { request: undefined; response: DayPlanDetailResponse };
  GET_ALL: { request: undefined; response: DayPlanListResponse };
  UPDATE: { request: DayPlanUpdateRequest; response: DayPlanDetailResponse };
  GET_BY_ITINERARY_ID: { request: undefined; response: DayPlanListResponse };
  DELETE: { request: undefined; response: BaseResponse<null> };
};

/* -------------------------------- Itinerary ------------------------------- */

export interface BaseItinerary {
  locations: Location[];
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  notes: string[];
}

export interface Itinerary extends BaseItinerary {
  id: string;
  total_cost: number;
  user: User;
  audit: Audit;
}

export interface ItineraryCreateRequest extends BaseItinerary {}

export type ItineraryDto = Omit<Itinerary, 'notes' | 'location'>;

export interface ItineraryBrief extends Itinerary {}

export interface ItineraryDetail extends ItineraryBrief {
  locations: Location[];
  notes: string[];
}

export type ItineraryBriefResponse = BaseResponse<ItineraryBrief>;
export type ItineraryListResponse = BaseResponse<ItineraryBrief[]>;
export type ItineraryDetailResponse = BaseResponse<ItineraryDetail>;

export type ItineraryDtoByEndpoints = {
  CREATE: { request: ItineraryCreateRequest; response: ItineraryDetailResponse };
  GET: { request: undefined; response: ItineraryDetailResponse };
  GET_ALL: { request: undefined; response: ItineraryListResponse };
  UPDATE: { request: ItineraryCreateRequest; response: ItineraryDetailResponse };
  GET_BY_USER_ID: { request: undefined; response: ItineraryListResponse };
  DELETE: { request: undefined; response: BaseResponse<null> };
};
