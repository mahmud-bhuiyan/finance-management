import type { ReactNode } from "react";
import { Modal } from "../../../components/ui/Modal";
import { useAudit } from "../hooks/useAudit";

const formatValues = (values: Record<string, unknown> | null) => {
  if (!values) {
    return "—";
  }

  return JSON.stringify(values, null, 2);
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className="grid gap-1 sm:grid-cols-[7rem_1fr]">
    <dt className="text-xs font-semibold uppercase tracking-wide text-(--fms-muted)">
      {label}
    </dt>
    <dd className="text-sm text-(--fms-ink)">{value}</dd>
  </div>
);

export const AuditLogDetailModal = () => {
  const { selectedLog, closeLog } = useAudit();

  return (
    <Modal
      open={!!selectedLog}
      title={
        selectedLog ? `${selectedLog.action} ${selectedLog.entityType}` : "Audit entry"
      }
      onClose={closeLog}
      wide
    >
      {selectedLog && (
        <div className="space-y-5">
          <dl className="space-y-3">
            <DetailRow
              label="When"
              value={new Date(selectedLog.createdAt).toLocaleString()}
            />
            <DetailRow label="Action" value={selectedLog.action} />
            <DetailRow label="Entity" value={selectedLog.entityType} />
            <DetailRow
              label="Entity ID"
              value={
                <span className="font-mono text-xs">{selectedLog.entityId}</span>
              }
            />
            <DetailRow
              label="Actor"
              value={`${selectedLog.actor.email} (${selectedLog.actor.role})`}
            />
            {selectedLog.tenantId && (
              <DetailRow
                label="Tenant"
                value={
                  <span className="font-mono text-xs">{selectedLog.tenantId}</span>
                }
              />
            )}
          </dl>

          {(selectedLog.oldValues || selectedLog.newValues) && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-(--fms-muted)">
                  Before
                </p>
                <pre className="overflow-x-auto rounded-lg bg-[color-mix(in_srgb,var(--fms-accent)_6%,transparent)] p-3 text-xs text-(--fms-ink)">
                  {formatValues(selectedLog.oldValues)}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-(--fms-muted)">
                  After
                </p>
                <pre className="overflow-x-auto rounded-lg bg-[color-mix(in_srgb,var(--fms-accent)_6%,transparent)] p-3 text-xs text-(--fms-ink)">
                  {formatValues(selectedLog.newValues)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
