import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "../../../components/ui/DataTable";
import { useAudit, type AuditLogEntry } from "../hooks/useAudit";

const truncateId = (value: string, length = 10) =>
  value.length <= length ? value : `${value.slice(0, length)}…`;

const actionBadgeClass: Record<AuditLogEntry["action"], string> = {
  CREATE:
    "bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-(--fms-accent)",
  UPDATE:
    "bg-[color-mix(in_srgb,var(--fms-gold)_22%,transparent)] text-(--fms-gold)",
  DELETE:
    "bg-[color-mix(in_srgb,var(--fms-rose)_18%,transparent)] text-(--fms-rose)",
};

export const AuditLogTable = () => {
  const { logs, meta, patchFilters, openLog } = useAudit();

  const columns = useMemo<DataTableColumn<AuditLogEntry>[]>(
    () => [
      {
        id: "when",
        header: "When",
        width: "25%",
        align: "left",
        className: "truncate whitespace-nowrap",
        cell: (log: AuditLogEntry) =>
          new Date(log.createdAt).toLocaleString(),
      },
      {
        id: "actor",
        header: "Actor",
        width: "30%",
        align: "left",
        className: "truncate",
        cell: (log: AuditLogEntry) => (
          <span className="text-(--fms-muted)" title={log.actor.email}>
            {log.actor.email}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        width: "10%",
        align: "center",
        cell: (log: AuditLogEntry) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${actionBadgeClass[log.action]}`}
          >
            {log.action}
          </span>
        ),
      },
      {
        id: "entity",
        header: "Entity",
        width: "10%",
        align: "left",
        className: "truncate",
        cell: (log: AuditLogEntry) => log.entityType,
      },
      {
        id: "entityId",
        header: "Entity ID",
        width: "15%",
        align: "left",
        className: "truncate font-mono text-xs text-(--fms-muted)",
        cell: (log: AuditLogEntry) => (
          <span title={log.entityId}>{truncateId(log.entityId)}</span>
        ),
      },
      {
        id: "view",
        header: "",
        width: "10%",
        align: "right",
        className: "whitespace-nowrap",
        cell: (log: AuditLogEntry) => (
          <button
            type="button"
            onClick={() => openLog(log)}
            className="text-sm font-medium text-(--fms-accent) hover:underline"
          >
            View
          </button>
        ),
      },
    ],
    [openLog],
  );

  return (
    <DataTable
      columns={columns}
      rows={logs}
      rowKey={(log) => log.id}
      meta={meta}
      onPageChange={(page) => patchFilters({ page })}
      onPageSizeChange={(pageSize) => patchFilters({ pageSize, page: 1 })}
      emptyMessage="No audit entries match these filters."
    />
  );
};
