export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSizeOption = 25;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const emptyPaginationMeta = (
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginationMeta => ({
  page: 1,
  pageSize,
  total: 0,
  totalPages: 1,
});
