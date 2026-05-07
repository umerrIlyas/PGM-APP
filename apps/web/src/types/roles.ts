export type Role = {
  id: number;
  name: string;
  guard_name: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
};

export type CreateRolePayload = {
  name: string;
  permissions?: string[];
};

export type UpdateRolePayload = {
  name?: string;
  permissions?: string[];
};
