import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { useAudit, type AuditListFilters } from "../hooks/useAudit";

export const AuditLogFilters = () => {
  const { filters, patchFilters } = useAudit();

  return (
    <div className="surface p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-(--fms-muted)">
        Filters
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Action"
          value={filters.action}
          onChange={(event) =>
            patchFilters({
              action: event.target.value as AuditListFilters["action"],
              page: 1,
            })
          }
        >
          <option value="">All</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </Select>

        <Input
          label="Entity type"
          type="search"
          value={filters.entityType}
          onChange={(event) =>
            patchFilters({ entityType: event.target.value, page: 1 })
          }
          placeholder="e.g. User, Tenant"
        />

        <Input
          label="Entity ID"
          type="search"
          value={filters.entityId}
          onChange={(event) =>
            patchFilters({ entityId: event.target.value, page: 1 })
          }
          placeholder="Exact entity id"
        />
      </div>
    </div>
  );
};
