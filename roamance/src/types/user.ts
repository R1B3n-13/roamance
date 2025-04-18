import { Audit } from './audit';
import { BaseResponse } from './response';

export interface User extends Audit {
  id: string;
  email: string;
  name: string;
}

export type UserResponse = BaseResponse<User>;

export interface UserInfo extends Audit {
  id: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  birthday: string | null;
  profile_image: string | null;
  cover_image: string | null;
  user_id: string;
}

export type UserInfoResponse = BaseResponse<UserInfo>;

export enum TravelStyle {
  RELAXED = 'RELAXED',
  BALANCED = 'BALANCED',
  ADVENTUROUS = 'ADVENTUROUS'
}

export enum AccommodationType {
  HOTELS = 'HOTELS',
  RESORTS = 'RESORTS',
  APARTMENTS = 'APARTMENTS',
  HOSTELS = 'HOSTELS',
  CAMPING = 'CAMPING'
}

export enum ActivityType {
  SIGHTSEEING = 'SIGHTSEEING',
  NATURE_AND_OUTDOORS = 'NATURE_AND_OUTDOORS',
  CULTURAL_EXPERIENCE = 'CULTURAL_EXPERIENCE',
  FOOD_AND_DINING = 'FOOD_AND_DINING',
  ENTERTAINMENT = 'ENTERTAINMENT'
}

export enum CuisineType {
  LOCAL_CUISINE = 'LOCAL_CUISINE',
  INTERNATIONAL = 'INTERNATIONAL',
  FINE_DINING = 'FINE_DINING',
  STREET_FOOD = 'STREET_FOOD',
  VEGAN = 'VEGAN'
}

export enum ClimatePreference {
  WARM_AND_SUNNY = 'WARM_AND_SUNNY',
  COLD_AND_SNOWY = 'COLD_AND_SNOWY',
  MODERATE = 'MODERATE',
  ANY_CLIMATE = 'ANY_CLIMATE'
}

export enum BudgetLevel {
  BUDGET = 'BUDGET',
  ECONOMIC = 'ECONOMIC',
  MODERATE = 'MODERATE',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY'
}


/* ---------------------------- User Preferences ---------------------------- */


export interface UserPreferences {
  travel_style: TravelStyle;
  accommodation_types: AccommodationType[];
  activity_types: ActivityType[];
  cuisine_types: CuisineType[];
  climate_preference: ClimatePreference;
  budget_level: BudgetLevel;
}

export interface UserPreferencesWithAudit extends UserPreferences, Audit {
  id: string;
  user_id: string;
}

export type UserPreferencesResponse = BaseResponse<UserPreferencesWithAudit>;

export interface UserPreferencesUpdateRequest {
  travel_style?: TravelStyle;
  accommodation_types?: AccommodationType[];
  activity_types?: ActivityType[];
  cuisine_types?: CuisineType[];
  climate_preference?: ClimatePreference;
  budget_level?: BudgetLevel;
}
