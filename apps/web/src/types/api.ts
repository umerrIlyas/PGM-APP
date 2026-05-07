export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  links?: Record<string, string | null>;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
