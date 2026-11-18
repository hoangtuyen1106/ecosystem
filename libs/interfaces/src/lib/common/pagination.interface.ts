export interface OffsetPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPaginationMeta {
  take: number;
  hasNextPage: boolean;
  nextCursor: string | number | null;
}

export interface PaginationResult<T, M> {
  items: T[];
  meta: M;
}

export type OffsetPaginationResult<T> = PaginationResult<
  T,
  OffsetPaginationMeta
>;

export type CursorPaginationResult<T> = PaginationResult<
  T,
  CursorPaginationMeta
>;
