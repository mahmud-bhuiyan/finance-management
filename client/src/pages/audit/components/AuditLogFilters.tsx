import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { DebouncedSearchInput } from "../../../components/ui/DebouncedSearchInput";
import { Select } from "../../../components/ui/Select";
import { useAudit, type AuditListFilters } from "../hooks/useAudit";

export const AuditLogFilters = () => {
  const { filters, patchFilters, resetFilters, filterResetKey } = useAudit();
  const [searchDraft, setSearchDraft] = useState("");
  const hasActiveFilters = Boolean(
    filters.action || filters.search.trim() || searchDraft.trim(),
  );

  const handleReset = () => {
    resetFilters();
    setSearchDraft("");
  };

  return (
    <div className="surface p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-(--fms-muted)">
        Filters
      </h2>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
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

          <DebouncedSearchInput
            key={filterResetKey}
            value={filters.search}
            onDraftChange={setSearchDraft}
            onDebouncedChange={(search) => patchFilters({ search, page: 1 })}
            label="Search"
            placeholder="Actor, entity type, or entity id…"
          />
        </div>

        <Button
          type="button"
          variant={hasActiveFilters ? "primary" : "ghost"}
          disabled={!hasActiveFilters}
          onClick={handleReset}
          className="w-full shrink-0 lg:w-auto"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
