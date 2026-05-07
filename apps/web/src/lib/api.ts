import type { ApiError, ApiResponse, ApiSuccess, Paginated, PaginationMeta } from '@/types/api';
import { getToken } from './auth-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export class ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  if (!query) return `${BASE_URL}${path}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${BASE_URL}${path}?${qs}` : `${BASE_URL}${path}`;
}

const inflightGets = new Map<string, Promise<ApiSuccess<unknown>>>();

async function performFetch<T>(
  url: string,
  init: RequestInit,
): Promise<ApiSuccess<T>> {
  const response = await fetch(url, init);

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success === false) {
    const errPayload = payload as ApiError | null;
    throw new ApiRequestError(
      errPayload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errPayload?.errors,
    );
  }

  return payload;
}

async function apiFetchRaw<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  const { body, auth = true, headers, query, method = 'GET', signal, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const url = buildUrl(path, query);
  const init: RequestInit = {
    ...rest,
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  };

  const reject = signal?.aborted
    ? Promise.reject(new DOMException('Aborted', 'AbortError'))
    : null;
  if (reject) return reject as Promise<ApiSuccess<T>>;

  let resultPromise: Promise<ApiSuccess<T>>;
  if (method === 'GET') {
    const cacheKey = `${finalHeaders.Authorization ?? 'anon'}|${url}`;
    const existing = inflightGets.get(cacheKey);
    if (existing) {
      resultPromise = existing as Promise<ApiSuccess<T>>;
    } else {
      const promise = performFetch<T>(url, init).finally(() => {
        inflightGets.delete(cacheKey);
      });
      inflightGets.set(cacheKey, promise as Promise<ApiSuccess<unknown>>);
      resultPromise = promise;
    }
  } else {
    resultPromise = performFetch<T>(url, init);
  }

  if (!signal) return resultPromise;

  return new Promise<ApiSuccess<T>>((resolve, rejectPromise) => {
    const onAbort = () => rejectPromise(new DOMException('Aborted', 'AbortError'));
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
    resultPromise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        if (signal.aborted) {
          rejectPromise(new DOMException('Aborted', 'AbortError'));
          return;
        }
        resolve(value);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        rejectPromise(err);
      },
    );
  });
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const payload = await apiFetchRaw<T>(path, options);
  return payload.data;
}

export async function apiFetchPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paginated<T>> {
  const payload = await apiFetchRaw<T[]>(path, options);
  const fallback: PaginationMeta = {
    current_page: 1,
    per_page: payload.data.length,
    total: payload.data.length,
    last_page: 1,
  };
  return { data: payload.data, meta: payload.meta ?? fallback };
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  getPaginated: <T>(path: string, options?: RequestOptions) =>
    apiFetchPaginated<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
