import { useMemo } from "react";
import { Link } from "react-router-dom";
import { DataTable, type DataTableColumn } from "../../../components/ui/DataTable";
import type { Tenant } from "../lib/tenantApi";
import { TenantTableActions } from "./TenantTableActions";
import { useTenants, type TenantSortBy } from "../hooks/useTenants";

const searchFieldClass =
  "w-full min-w-48 max-w-md rounded-lg border border-(--fms-border-strong) bg-(--fms-surface-strong) px-3 py-2 text-(--fms-ink) outline-none ring-(--fms-ring) focus:ring-2";

export const TenantTable = () => {
  const {
    status,
    pageRows,
    meta,
    listState,
    patchListState,
    openConfirm,
    isUpdating,
    isDeleting,
  } = useTenants();

  const isActiveTab = status === "ACTIVE";

  const columns = useMemo<DataTableColumn<Tenant>[]>(
    () => [
      {
        id: "name",
        header: "Company",
        width: "30%",
        align: "left",
        sortable: true,
        className: "truncate font-medium",
        cell: (tenant: Tenant) => tenant.name,
      },
      {
        id: "slug",
        header: "Slug",
        width: "25%",
        align: "left",
        sortable: true,
        className: "truncate font-mono text-xs text-(--fms-muted)",
        cell: (tenant: Tenant) => tenant.slug,
      },
      {
        id: "admins",
        header: "Admins",
        width: "15%",
        align: "center",
        sortable: true,
        cell: (tenant: Tenant) => tenant.admins.length,
      },
      {
        id: "actions",
        header: "Actions",
        width: "30%",
        align: "center",
        className: "whitespace-nowrap",
        cell: (tenant: Tenant) => (
          <TenantTableActions
            tenant={tenant}
            isActiveTab={isActiveTab}
            disabled={isUpdating || isDeleting}
            onDeactivate={() => openConfirm("deactivate", tenant)}
            onActivate={() => openConfirm("activate", tenant)}
            onDelete={() => openConfirm("delete", tenant)}
          />
        ),
      },
    ],
    [isActiveTab, isDeleting, isUpdating, openConfirm],
  );

  const emptyMessage = listState.search.trim()
    ? "No companies match your search."
    : isActiveTab
      ? "No active companies yet. Create one to get started."
      : "No inactive companies.";

  return (
    <DataTable
      columns={columns}
      rows={pageRows}
      rowKey={(tenant) => tenant.id}
      meta={meta}
      sortBy={listState.sortBy}
      sortDir={listState.sortDir}
      onSortChange={(sortBy, sortDir) =>
        patchListState({
          sortBy: sortBy as TenantSortBy,
          sortDir,
          page: 1,
        })
      }
      onPageChange={(page) => patchListState({ page })}
      onPageSizeChange={(pageSize) => patchListState({ pageSize, page: 1 })}
      emptyMessage={emptyMessage}
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
              placeholder="Search name, slug, admin…"
              className={searchFieldClass}
            />
          </label>
          {isActiveTab ? (
            <Link
              to="/tenants/new"
              className="ml-auto inline-flex items-center rounded-xl bg-[linear-gradient(180deg,var(--fms-accent-soft),var(--fms-accent))] px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_10px_24px_-12px_var(--fms-accent)] transition-[filter] hover:brightness-110 dark:text-[#04110f]"
            >
              Create company
            </Link>
          ) : null}
        </div>
      }
    />
  );
};
