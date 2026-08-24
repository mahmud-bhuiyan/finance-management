import { useMemo } from "react";
import { Button } from "../../../components/ui/Button";
import { DataTable } from "../../../components/ui/DataTable";
import { useTenants, type Tenant } from "../hooks/useTenants";

const statusBadgeClass: Record<Tenant["status"], string> = {
  ACTIVE:
    "bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-(--fms-accent)",
  INACTIVE:
    "bg-[color-mix(in_srgb,var(--fms-muted)_18%,transparent)] text-(--fms-muted)",
};

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
    openCreate,
    openEdit,
    openConfirm,
    isUpdating,
    isDeleting,
  } = useTenants();

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Company",
        width: "25%",
        className: "truncate font-medium",
        cell: (tenant: Tenant) => tenant.name,
      },
      {
        id: "slug",
        header: "Slug",
        width: "20%",
        className: "truncate font-mono text-xs text-(--fms-muted)",
        cell: (tenant: Tenant) => tenant.slug,
      },
      {
        id: "status",
        header: "Status",
        width: "10%",
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
        cell: (tenant: Tenant) => tenant.admins.length,
      },
      {
        id: "actions",
        header: "Actions",
        width: "35%",
        className: "whitespace-nowrap",
        cell: (tenant: Tenant) => (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className={actionButtonClass}
              onClick={() => openEdit(tenant)}
            >
              Edit
            </button>
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
    [isDeleting, isUpdating, openConfirm, openEdit],
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
          <Button type="button" onClick={openCreate} className="ml-auto">
            Create company
          </Button>
        </div>
      }
    />
  );
};
