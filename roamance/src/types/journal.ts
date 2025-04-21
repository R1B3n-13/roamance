import { Audit } from './audit';
import { BaseResponse } from './response';
import { Subsection } from './subsection';
import { User } from './user';

export interface Journal {
  id: string;
  title: string;
  destination: Location;
  description: string;
  subsections: Subsection[];
  user: User;
  audit: Audit;
}

/* --------------------------------- Create --------------------------------- */

export interface JournalCreateRequest {
  title: string;
  destination: Location;
  description: string;
  subsections: Subsection[];
}

/* -------------------------------- Response -------------------------------- */

export interface JournalDto {
  id: string;
  title: string;
  destination: Location;
  description: string;
  audit: Audit;
}

export interface JournalBrief extends JournalDto {
  total_subsections: number;
}

export interface JournalDetail extends JournalDto {
  subsections: Subsection[];
}

export type JournalBriefResponse = BaseResponse<JournalBrief>;
export type JournalListResponse = BaseResponse<JournalBrief[]>;
export type JournalDetailResponse = BaseResponse<JournalDetail>;
