import { useCallback, useEffect, useMemo, useState } from "react";
import type { DataTableSortDir } from "../components/ui/DataTable";
import { DEFAULT_PAGE_SIZE, type PaginationMeta } from "../lib/pagination";

export type ClientListState = {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDir: DataTableSortDir;
};

type SortValue = string | number | boolean;

type UseClientDataTableOptions<T> = {
  rows: T[];
  getSearchText: (row: T) => string;
  sortAccessors: Record<string, (row: T) => SortValue>;
  defaultSortBy: string;
  defaultSortDir?: DataTableSortDir;
  resetKey?: string | number;
};

const compareSortValues = (left: SortValue, right: SortValue) => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }

  return String(left).localeCompare(String(right), undefined, {
    sensitivity: "base",
  });
};

export const useClientDataTable = <T>({
  rows,
  getSearchText,
  sortAccessors,
  defaultSortBy,
  defaultSortDir = "asc",
  resetKey,
}: UseClientDataTableOptions<T>) => {
  const [listState, setListState] = useState<ClientListState>(() => ({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: "",
    sortBy: defaultSortBy,
    sortDir: defaultSortDir,
  }));

  useEffect(() => {
    setListState({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      search: "",
      sortBy: defaultSortBy,
      sortDir: defaultSortDir,
    });
  }, [resetKey, defaultSortBy, defaultSortDir]);

  const patchListState = useCallback((next: Partial<ClientListState>) => {
    setListState((current) => ({ ...current, ...next }));
  }, []);

  const filteredRows = useMemo(() => {
    const query = listState.search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      getSearchText(row).toLowerCase().includes(query),
    );
  }, [rows, listState.search, getSearchText]);

  const sortedRows = useMemo(() => {
    const accessor = sortAccessors[listState.sortBy];
    if (!accessor) {
      return filteredRows;
    }

    const sorted = [...filteredRows].sort((left, right) =>
      compareSortValues(accessor(left), accessor(right)),
    );

    return listState.sortDir === "desc" ? sorted.reverse() : sorted;
  }, [filteredRows, listState.sortBy, listState.sortDir, sortAccessors]);

  const meta = useMemo<PaginationMeta>(() => {
    const total = sortedRows.length;
    const totalPages = Math.max(1, Math.ceil(total / listState.pageSize) || 1);
    const page = Math.min(listState.page, totalPages);

    return {
      page,
      pageSize: listState.pageSize,
      total,
      totalPages,
    };
  }, [sortedRows.length, listState.page, listState.pageSize]);

  const pageRows = useMemo(() => {
    const start = (meta.page - 1) * meta.pageSize;
    return sortedRows.slice(start, start + meta.pageSize);
  }, [sortedRows, meta.page, meta.pageSize]);

  return {
    pageRows,
    meta,
    listState,
    patchListState,
    totalRows: rows.length,
  };
};
