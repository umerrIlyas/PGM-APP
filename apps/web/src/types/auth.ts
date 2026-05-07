export type AuthUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles?: string[];
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginData = {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: AuthUser;
};
