import { Location } from './location';
import { Audit } from './audit';
import { BaseResponse } from './response';

export enum ActivityType {
  SIGHTSEEING = 'SIGHTSEEING',
  NATURE_AND_OUTDOORS = 'NATURE_AND_OUTDOORS',
  CULTURAL_EXPERIENCE = 'CULTURAL_EXPERIENCE',
  FOOD_AND_DINING = 'FOOD_AND_DINING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
}

export interface Activity {
  id: string;
  location: Location;
  start_time: string;
  end_time: string;
  type: ActivityType;
  other_type_name: string;
  note: string;
  cost: number;
  audit: Audit;
}

export interface ActivityCreateRequest {
  day_plan_id: string;
  location: Location;
  start_time: string;
  end_time: string;
  type: ActivityType;
  note: string;
  cost: number;
}

export interface ActivityUpdateRequest {
  location?: Location;
  start_time?: string;
  end_time?: string;
  type?: ActivityType;
  note?: string;
  cost?: number;
}

export type ActivityResponse = BaseResponse<Activity>;
export type ActivityListResponse = BaseResponse<Activity[]>;

export type ActivityDtoByEndpoints = {
  CREATE: { request: ActivityCreateRequest; response: ActivityResponse };
  GET: { request: undefined; response: ActivityResponse };
  GET_BY_DAY_PLAN_ID: { request: undefined; response: ActivityListResponse };
  UPDATE: { request: ActivityUpdateRequest; response: ActivityResponse };
  DELETE: { request: undefined; response: BaseResponse<null> };
};
