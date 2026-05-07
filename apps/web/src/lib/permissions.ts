import { api } from './api';
import type { Paginated } from '@/types/api';
import type {
  CreatePermissionPayload,
  Permission,
  UpdatePermissionPayload,
} from '@/types/permissions';

export type PermissionsListParams = {
  page?: number;
  per_page?: number;
};

export function listPermissions(
  params: PermissionsListParams = {},
): Promise<Paginated<Permission>> {
  return api.getPaginated<Permission>('/v1/permissions', { query: params });
}

export async function listAllPermissions(): Promise<Permission[]> {
  const result = await listPermissions({ per_page: 200 });
  return result.data;
}

export function getPermission(id: number): Promise<Permission> {
  return api.get<Permission>(`/v1/permissions/${id}`);
}

export function createPermission(payload: CreatePermissionPayload): Promise<Permission> {
  return api.post<Permission>('/v1/permissions', payload);
}

export function updatePermission(
  id: number,
  payload: UpdatePermissionPayload,
): Promise<Permission> {
  return api.put<Permission>(`/v1/permissions/${id}`, payload);
}

export function deletePermission(id: number): Promise<unknown> {
  return api.delete(`/v1/permissions/${id}`);
}
