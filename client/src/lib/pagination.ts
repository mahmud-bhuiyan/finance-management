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

export type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis" };

export const buildPaginationItems = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] => {
  if (totalPages <= 1) {
    return [];
  }

  const pages = new Set<number>([1, totalPages]);

  for (
    let page = currentPage - siblingCount;
    page <= currentPage + siblingCount;
    page += 1
  ) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((left, right) => left - right);
  const items: PaginationItem[] = [];
  let previousPage = 0;

  for (const page of sortedPages) {
    if (previousPage > 0 && page - previousPage > 1) {
      items.push({ type: "ellipsis" });
    }
    items.push({ type: "page", page });
    previousPage = page;
  }

  return items;
};
