import { Audit } from './audit';
import { Journal } from './journal';
import { BaseResponse } from './response';
import { Location } from './location';

export interface ChecklistItem {
  title: string;
  completed: boolean;
}

export enum SubsectionType {
  SIGHTSEEING = 'SIGHTSEEING',
  ACTIVITY = 'ACTIVITY',
  ROUTE = 'ROUTE',
}

export interface Subsection extends SubsectionRequestDto {
  id: string;
  journal: Journal;
  audit: Audit;
}

export interface SightseeingSubsection extends Subsection {
  type: SubsectionType.SIGHTSEEING;
  location: Location;
}

export interface ActivitySubsection extends Subsection {
  type: SubsectionType.ACTIVITY;
  location: Location;
  activity_type: string;
}

export interface RouteSubsection extends Subsection {
  type: SubsectionType.ROUTE;
  waypoints: Location[];
  total_time: number;
  total_distance: number;
}

/* --------------------------------- Create --------------------------------- */

export interface SubsectionRequestDto {
  title: string;
  journal_id: string;
  note: string;
  checklists: ChecklistItem[];
}

export interface SightseeingSubsectionRequest extends SubsectionRequestDto {
  type: SubsectionType.SIGHTSEEING;
  location: Location;
}

export interface ActivitySubsectionRequest extends SubsectionRequestDto {
  type: SubsectionType.ACTIVITY;
  location: Location;
  activity_type: string;
}

export interface RouteSubsectionRequest extends SubsectionRequestDto {
  type: SubsectionType.ROUTE;
  waypoints: Location[];
  total_time: number;
  total_distance: number;
}

export type SubsectionRequest =
  | ActivitySubsectionRequest
  | SightseeingSubsectionRequest
  | RouteSubsectionRequest;

/* -------------------------------- Response -------------------------------- */

export interface SubsectionBriefDto {
  id: string;
  title: string;
  type: SubsectionType;
  journal_id: string;
  audit: Audit;
}

export type SubsectionDetailDto = Omit<SubsectionBriefDto, 'type'> & {
  note: string;
  checklists: ChecklistItem[];
};

export interface SightseeingSubsectionDto extends SubsectionDetailDto {
  type: SubsectionType.SIGHTSEEING;
  location: Location;
}

export interface ActivitySubsectionDto extends SubsectionDetailDto {
  type: SubsectionType.ACTIVITY;
  location: Location;
  activity_type: string;
}

export interface RouteSubsectionDto extends SubsectionDetailDto {
  type: SubsectionType.ROUTE;
  waypoints: Location[];
  total_time: number;
  total_distance: number;
}

export type SubsectionDetailResponseDto =
  | SightseeingSubsectionDto
  | RouteSubsectionDto
  | ActivitySubsectionDto;

export type SubsectionBriefResponse = BaseResponse<SubsectionBriefDto>;
export type SubsectionListResponse = BaseResponse<SubsectionBriefDto[]>;
export type SubsectionDetailResponse = BaseResponse<
  SightseeingSubsectionDto | RouteSubsectionDto | ActivitySubsectionDto
>;
