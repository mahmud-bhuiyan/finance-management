import type { ReactNode } from "react";
import {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type PaginationMeta,
} from "../../lib/pagination";
import { DebouncedSearchInput } from "./DebouncedSearchInput";
import { Pagination } from "./Pagination";

export type DataTableColumnAlign = "left" | "center" | "right";
export type DataTableSortDir = "asc" | "desc";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  /** Shorthand for both header and cell alignment. */
  align?: DataTableColumnAlign;
  headerAlign?: DataTableColumnAlign;
  cellAlign?: DataTableColumnAlign;
  sortable?: boolean;
};

export type DataTableSearchConfig = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  srOnlyLabel?: string;
  className?: string;
  wrapperClassName?: string;
  resetKey?: number | string;
};

const headerAlignClass = (align: DataTableColumnAlign = "left") => {
  if (align === "center") {
    return "text-center";
  }
  if (align === "right") {
    return "text-right";
  }
  return "text-left";
};

const cellAlignClass = (align: DataTableColumnAlign = "left") => {
  if (align === "center") {
    return "flex justify-center";
  }
  if (align === "right") {
    return "flex justify-end";
  }
  return "flex justify-start";
};

const resolveColumnAlign = <T,>(
  column: DataTableColumn<T>,
  target: "header" | "cell",
): DataTableColumnAlign => {
  if (target === "header") {
    return column.headerAlign ?? column.align ?? "left";
  }
  return column.cellAlign ?? column.align ?? "left";
};

const searchFieldClass =
  "w-full min-w-48 max-w-md rounded-lg border border-(--fms-border-strong) bg-(--fms-surface-strong) px-3 py-2 text-(--fms-ink) outline-none ring-(--fms-ring) focus:ring-2";

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  emptyMessage?: string;
  search?: DataTableSearchConfig;
  filters?: ReactNode;
  getRowClassName?: (row: T) => string;
  sortBy?: string;
  sortDir?: DataTableSortDir;
  onSortChange?: (sortBy: string, sortDir: DataTableSortDir) => void;
};

const sortIconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const SortIcon = ({ dir }: { dir: DataTableSortDir | null }) => {
  if (dir === "asc") {
    return (
      <svg {...sortIconProps}>
        <path d="m6 9 6-6 6 6" />
        <path d="M12 3v18" />
      </svg>
    );
  }

  if (dir === "desc") {
    return (
      <svg {...sortIconProps}>
        <path d="m6 15 6 6 6-6" />
        <path d="M12 21V3" />
      </svg>
    );
  }

  return (
    <svg {...sortIconProps} className="opacity-40">
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
};

const sortableHeaderClass = (align: DataTableColumnAlign = "left") => {
  const base =
    "inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-inherit transition-colors hover:text-(--fms-ink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--fms-ring)";

  if (align === "center") {
    return `${base} justify-center`;
  }
  if (align === "right") {
    return `${base} justify-end`;
  }
  return `${base} justify-start`;
};

const pageSizeSelectClass =
  "rounded-lg border border-(--fms-border-strong) bg-(--fms-surface-strong) px-2 py-1.5 text-(--fms-ink) outline-none ring-(--fms-ring) focus:ring-2";

export const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  meta,
  onPageChange,
  onPageSizeChange,
  emptyMessage = "No rows match these filters.",
  search,
  filters,
  getRowClassName,
  sortBy,
  sortDir,
  onSortChange,
}: DataTableProps<T>) => {
  const handleSort = (columnId: string) => {
    if (!onSortChange) {
      return;
    }

    if (sortBy === columnId) {
      onSortChange(columnId, sortDir === "asc" ? "desc" : "asc");
      return;
    }

    onSortChange(columnId, "asc");
  };
  const rangeStart =
    meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.total);
  const showPageSizeSelector = meta.total >= MIN_PAGE_SIZE;
  const showPaginationFooter =
    showPageSizeSelector || meta.totalPages > 1;

  const toolbar = search || filters;

  return (
    <div className="space-y-3">
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-3">
          {search ? (
            <DebouncedSearchInput
              value={search.value}
              onDebouncedChange={search.onChange}
              srOnlyLabel={search.srOnlyLabel ?? "Search table"}
              wrapperClassName={
                search.wrapperClassName ??
                "flex min-w-48 flex-1 max-w-md items-center"
              }
              placeholder={search.placeholder ?? "Search…"}
              className={search.className ?? searchFieldClass}
              resetKey={search.resetKey}
              clearable
            />
          ) : null}
          {filters}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="surface-dashed p-6 text-sm text-(--fms-muted)">
          {emptyMessage}
        </p>
      ) : (
        <div className="surface overflow-x-auto p-0!">
          <table className="w-full table-fixed text-sm">
            <thead className="border-b border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-accent)_6%,transparent)] text-(--fms-muted)">
              <tr>
                {columns.map((column) => {
                  const isSortable = column.sortable && onSortChange;
                  const activeSort: DataTableSortDir | null =
                    isSortable && sortBy === column.id ? (sortDir ?? null) : null;
                  const headerAlign = resolveColumnAlign(column, "header");

                  return (
                    <th
                      key={column.id}
                      style={column.width ? { width: column.width } : undefined}
                      className={`px-4 py-3 align-middle font-medium ${headerAlignClass(headerAlign)} ${column.headerClassName ?? ""}`}
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          className={sortableHeaderClass(headerAlign)}
                          onClick={() => handleSort(column.id)}
                          aria-sort={
                            activeSort
                              ? activeSort === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <span>{column.header}</span>
                          <SortIcon dir={activeSort} />
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`border-b border-(--fms-border) last:border-0 ${getRowClassName?.(row) ?? ""}`}
                >
                  {columns.map((column) => {
                    const cellAlign = resolveColumnAlign(column, "cell");

                    return (
                      <td
                        key={column.id}
                        style={column.width ? { width: column.width } : undefined}
                        className="px-4 py-3 align-middle text-(--fms-ink)"
                      >
                        <div
                          className={`min-w-0 ${cellAlignClass(cellAlign)} ${column.className ?? ""}`}
                        >
                          {column.cell(row)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPaginationFooter ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-(--fms-muted)">
          <div className="flex flex-wrap items-center gap-3">
            {showPageSizeSelector ? (
              <label className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  value={meta.pageSize}
                  onChange={(event) =>
                    onPageSizeChange(Number(event.target.value))
                  }
                  className={pageSizeSelectClass}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <p>
              {meta.total === 0
                ? "0 results"
                : `${rangeStart}–${rangeEnd} of ${meta.total}`}
            </p>
          </div>

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </div>
  );
};

export { DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, PAGE_SIZE_OPTIONS };
