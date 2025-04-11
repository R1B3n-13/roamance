export interface UserEndpoints {
  REGISTER: string;
  LOGIN: string;
  UPDATE: string;
  DELETE: string;
  PROFILE: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_modified_at: string;
}
