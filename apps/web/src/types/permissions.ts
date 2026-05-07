export type Permission = {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
};

export type CreatePermissionPayload = {
  name: string;
};

export type UpdatePermissionPayload = {
  name?: string;
};
