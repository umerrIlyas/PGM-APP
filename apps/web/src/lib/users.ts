import { api } from './api';
import type { Paginated } from '@/types/api';
import type { CreateUserPayload, UpdateUserPayload, User } from '@/types/users';

export type UsersListParams = {
  page?: number;
  per_page?: number;
  search?: string;
};

export function listUsers(params: UsersListParams = {}): Promise<Paginated<User>> {
  return api.getPaginated<User>('/v1/users', { query: params });
}

export function getUser(id: number): Promise<User> {
  return api.get<User>(`/v1/users/${id}`);
}

export function createUser(payload: CreateUserPayload): Promise<User> {
  return api.post<User>('/v1/users', payload);
}

export function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  return api.put<User>(`/v1/users/${id}`, payload);
}

export function deleteUser(id: number): Promise<unknown> {
  return api.delete(`/v1/users/${id}`);
}
