import { useMemo } from "react";
import { Link } from "react-router-dom";
import { DataTable, type DataTableColumn } from "../../../components/ui/DataTable";
import type { Tenant } from "../lib/tenantApi";
import { statusBadgeClass } from "../lib/tenantDisplay";
import { useTenants } from "../hooks/useTenants";

const actionButtonClass =
  "text-sm font-medium text-(--fms-accent) hover:underline disabled:cursor-not-allowed disabled:opacity-40";

const searchFieldClass =
  "w-full min-w-48 max-w-md rounded-lg border border-(--fms-border-strong) bg-(--fms-surface-strong) px-3 py-2 text-(--fms-ink) outline-none ring-(--fms-ring) focus:ring-2";

export const TenantTable = () => {
  const {
    pageRows,
    meta,
    listState,
    patchListState,
    openConfirm,
    isUpdating,
    isDeleting,
  } = useTenants();

  const columns = useMemo<DataTableColumn<Tenant>[]>(
    () => [
      {
        id: "name",
        header: "Company",
        width: "25%",
        align: "left",
        className: "truncate font-medium",
        cell: (tenant: Tenant) => tenant.name,
      },
      {
        id: "slug",
        header: "Slug",
        width: "20%",
        align: "left",
        className: "truncate font-mono text-xs text-(--fms-muted)",
        cell: (tenant: Tenant) => tenant.slug,
      },
      {
        id: "status",
        header: "Status",
        width: "10%",
        align: "center",
        cell: (tenant: Tenant) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${statusBadgeClass[tenant.status]}`}
          >
            {tenant.status}
          </span>
        ),
      },
      {
        id: "admins",
        header: "Admins",
        width: "10%",
        align: "center",
        cell: (tenant: Tenant) => tenant.admins.length,
      },
      {
        id: "actions",
        header: "Actions",
        width: "35%",
        align: "center",
        className: "whitespace-nowrap",
        cell: (tenant: Tenant) => (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/tenants/${tenant.id}/edit`}
              className={actionButtonClass}
            >
              Edit
            </Link>
            {tenant.status === "ACTIVE" ? (
              <button
                type="button"
                disabled={isUpdating || isDeleting}
                className={actionButtonClass}
                onClick={() => openConfirm("deactivate", tenant)}
              >
                Mark inactive
              </button>
            ) : (
              <button
                type="button"
                disabled={isUpdating || isDeleting}
                className={actionButtonClass}
                onClick={() => openConfirm("activate", tenant)}
              >
                Reactivate
              </button>
            )}
            <button
              type="button"
              disabled={isUpdating || isDeleting}
              className="text-sm font-medium text-(--fms-rose) hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => openConfirm("delete", tenant)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [isDeleting, isUpdating, openConfirm],
  );

  return (
    <DataTable
      columns={columns}
      rows={pageRows}
      rowKey={(tenant) => tenant.id}
      meta={meta}
      onPageChange={(page) => patchListState({ page })}
      onPageSizeChange={(pageSize) => patchListState({ pageSize, page: 1 })}
      emptyMessage={
        listState.search.trim()
          ? "No companies match your search."
          : "No companies yet. Create one to get started."
      }
      filters={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-48 flex-1 max-w-md items-center">
            <span className="sr-only">Search companies</span>
            <input
              type="search"
              value={listState.search}
              onChange={(event) =>
                patchListState({ search: event.target.value, page: 1 })
              }
              placeholder="Search name, slug, status, admin…"
              className={searchFieldClass}
            />
          </label>
          <Link
            to="/tenants/new"
            className="ml-auto inline-flex items-center rounded-xl bg-[linear-gradient(180deg,var(--fms-accent-soft),var(--fms-accent))] px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_10px_24px_-12px_var(--fms-accent)] transition-[filter] hover:brightness-110 dark:text-[#04110f]"
          >
            Create company
          </Link>
        </div>
      }
    />
  );
};
