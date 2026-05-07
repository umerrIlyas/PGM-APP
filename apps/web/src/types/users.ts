export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles?: string[];
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  roles?: string[];
  permissions?: string[];
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  roles?: string[];
  permissions?: string[];
};
