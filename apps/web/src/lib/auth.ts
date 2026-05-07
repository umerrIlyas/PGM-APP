import { api } from './api';
import { clearToken, setToken } from './auth-storage';
import type { AuthUser, LoginData, LoginPayload } from '@/types/auth';

export async function loginRequest(payload: LoginPayload): Promise<LoginData> {
  const data = await api.post<LoginData>('/v1/auth/login', payload, { auth: false });
  setToken(data.access_token);
  return data;
}

export async function fetchCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  return api.get<AuthUser>('/v1/auth/me', { signal });
}

export async function logoutRequest(): Promise<void> {
  try {
    await api.post('/v1/auth/logout');
  } finally {
    clearToken();
  }
}
