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

export const TenantTable = () => {
  const {
    pageRows,
    meta,
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
        width: "24%",
        align: "left" as const,
        className: "truncate font-medium",
        cell: (tenant: Tenant) => tenant.name,
      },
      {
        id: "slug",
        header: "Slug",
        width: "18%",
        align: "left" as const,
        className: "truncate font-mono text-xs text-(--fms-muted)",
        cell: (tenant: Tenant) => tenant.slug,
      },
      {
        id: "status",
        header: "Status",
        width: "12%",
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
        width: "36%",
        align: "left" as const,
        className: "whitespace-nowrap",
        cell: (tenant: Tenant) => (
          <div className="flex flex-wrap items-center gap-3">
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
      emptyMessage="No companies yet. Create one to get started."
      filters={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-(--fms-muted)">
            {meta.total === 0
              ? "No companies"
              : `${meta.total} ${meta.total === 1 ? "company" : "companies"}`}
          </p>
          <Button type="button" onClick={openCreate}>
            Create company
          </Button>
        </div>
      }
    />
  );
};
