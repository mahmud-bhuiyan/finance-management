import { useAudit, type AuditListFilters } from "../hooks/useAudit";

const fieldClass =
  "w-full rounded-lg border border-(--fms-border-strong) bg-(--fms-surface-strong) px-3 py-2 text-(--fms-ink) outline-none ring-(--fms-ring) focus:ring-2";

export const AuditLogFilters = () => {
  const { filters, patchFilters } = useAudit();

  return (
    <div className="surface p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-(--fms-muted)">
        Filters
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-(--fms-ink)">Action</span>
          <select
            value={filters.action}
            onChange={(event) =>
              patchFilters({
                action: event.target.value as AuditListFilters["action"],
                page: 1,
              })
            }
            className={fieldClass}
          >
            <option value="">All</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-(--fms-ink)">Entity type</span>
          <input
            type="search"
            value={filters.entityType}
            onChange={(event) =>
              patchFilters({ entityType: event.target.value, page: 1 })
            }
            placeholder="e.g. User, Tenant"
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-(--fms-ink)">Entity ID</span>
          <input
            type="search"
            value={filters.entityId}
            onChange={(event) =>
              patchFilters({ entityId: event.target.value, page: 1 })
            }
            placeholder="Exact entity id"
            className={fieldClass}
          />
        </label>
      </div>
    </div>
  );
};
