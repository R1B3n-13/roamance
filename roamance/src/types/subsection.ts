import { Audit } from './audit';
import { Journal } from './journal';
import { BaseResponse } from './response';

export enum SubsectionType {
  SIGHTSEEING = 'SIGHTSEEING',
  ACTIVITY = 'ACTIVITY',
  ROUTE = 'ROUTE',
}

export interface Subsection extends SubsectionCreateRequest {
  id: string;
  journal: Journal;
  audit: Audit;
}

export interface SightseeingSubsection extends Subsection {
  location: Location;
}

export interface ActivitySubsection extends Subsection {
  location: Location;
  activity_name: string;
}

export interface RouteSubsection extends Subsection {
  locations: Location[];
  total_time: number;
  total_distance: number;
}

/* --------------------------------- Create --------------------------------- */

export interface SubsectionCreateRequest {
  title: string;
  type: SubsectionType;
  journal_id: string;
  notes: string[];
  checklists: string[];
}

export interface SightseeingSubsectionCreateRequest
  extends SubsectionCreateRequest {
  type: SubsectionType.SIGHTSEEING;
  location: Location;
}

export interface ActivitySubsectionCreateRequest
  extends SubsectionCreateRequest {
  type: SubsectionType.ACTIVITY;
  location: Location;
  activity_name: string;
}

export interface RouteSubsectionCreateRequest extends SubsectionCreateRequest {
  type: SubsectionType.ROUTE;
  locations: Location[];
  total_time: number;
  total_distance: number;
}

/* -------------------------------- Response -------------------------------- */

export interface SubsectionBrief {
  id: string;
  title: string;
  type: SubsectionType;
  journal_id: string;
  audit: Audit;
}

export interface SubsectionDetail {
  notes: string[];
  checklists: string[];
}

export type SubsectionBriefResponse = BaseResponse<SubsectionBrief>;
export type SubsectionListResponse = BaseResponse<SubsectionBrief[]>;
export type SubsectionDetailResponse = BaseResponse<SubsectionDetail>;
