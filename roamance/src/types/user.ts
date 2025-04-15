import { Audit } from './audit';

export interface User extends Audit {
  id: string;
  email: string;
  name: string;
}

export interface UserResponse {
  data: User;
  message: string;
  status: number;
}

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

export interface UserInfoResponse {
  data: UserInfo;
  message: string;
  status: number;
}
