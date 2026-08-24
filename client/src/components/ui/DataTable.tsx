import type { ReactNode } from "react";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type PaginationMeta,
} from "../../lib/pagination";

export type DataTableColumnAlign = "left" | "center" | "right";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  align?: DataTableColumnAlign;
};

const alignClass = (align: DataTableColumnAlign = "center") => {
  if (align === "left") {
    return "text-left";
  }
  if (align === "right") {
    return "text-right";
  }
  return "text-center";
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  emptyMessage?: string;
  filters?: ReactNode;
  getRowClassName?: (row: T) => string;
};

const pageSizeSelectClass =
  "rounded-lg border border-(--fms-border-strong) bg-(--fms-surface-strong) px-2 py-1.5 text-(--fms-ink) outline-none ring-(--fms-ring) focus:ring-2";

const pagerButtonClass =
  "rounded-lg border border-(--fms-border-strong) px-3 py-1.5 text-(--fms-ink) hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-40";

export const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  meta,
  onPageChange,
  onPageSizeChange,
  emptyMessage = "No rows match these filters.",
  filters,
  getRowClassName,
}: DataTableProps<T>) => {
  const rangeStart =
    meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="space-y-3">
      {filters}

      {rows.length === 0 ? (
        <p className="surface-dashed p-6 text-sm text-(--fms-muted)">
          {emptyMessage}
        </p>
      ) : (
        <div className="surface overflow-x-auto p-0!">
          <table className="w-full table-fixed text-sm">
            <thead className="border-b border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-accent)_6%,transparent)] text-(--fms-muted)">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    style={column.width ? { width: column.width } : undefined}
                    className={`px-4 py-3 font-medium ${alignClass(column.align)} ${column.headerClassName ?? ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`border-b border-(--fms-border) last:border-0 ${getRowClassName?.(row) ?? ""}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      style={column.width ? { width: column.width } : undefined}
                      className={`px-4 py-3 text-(--fms-ink) ${alignClass(column.align)} ${column.className ?? ""}`}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-(--fms-muted)">
        <div className="flex flex-wrap items-center gap-3">
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
          <p>
            {meta.total === 0
              ? "0 results"
              : `${rangeStart}–${rangeEnd} of ${meta.total}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p>
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              className={pagerButtonClass}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              className={pagerButtonClass}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS };
