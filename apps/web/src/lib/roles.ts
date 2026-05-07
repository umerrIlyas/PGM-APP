import { api } from './api';
import type { Paginated } from '@/types/api';
import type { CreateRolePayload, Role, UpdateRolePayload } from '@/types/roles';

export type RolesListParams = {
  page?: number;
  per_page?: number;
};

export function listRoles(params: RolesListParams = {}): Promise<Paginated<Role>> {
  return api.getPaginated<Role>('/v1/roles', { query: params });
}

export async function listAllRoles(): Promise<Role[]> {
  const result = await listRoles({ per_page: 100 });
  return result.data;
}

export function getRole(id: number): Promise<Role> {
  return api.get<Role>(`/v1/roles/${id}`);
}

export function createRole(payload: CreateRolePayload): Promise<Role> {
  return api.post<Role>('/v1/roles', payload);
}

export function updateRole(id: number, payload: UpdateRolePayload): Promise<Role> {
  return api.put<Role>(`/v1/roles/${id}`, payload);
}

export function deleteRole(id: number): Promise<unknown> {
  return api.delete(`/v1/roles/${id}`);
}
