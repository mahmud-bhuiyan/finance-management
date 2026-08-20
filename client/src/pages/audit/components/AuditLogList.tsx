import type { AuditLogEntry } from "../hooks/useAuditLogs";

type AuditLogListProps = {
  logs: AuditLogEntry[];
};

const formatValues = (values: Record<string, unknown> | null) => {
  if (!values) {
    return "—";
  }

  return JSON.stringify(values, null, 2);
};

export const AuditLogList = ({ logs }: AuditLogListProps) => {
  if (logs.length === 0) {
    return <p className="text-sm text-slate-500">No audit entries yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {logs.map((log) => (
        <li
          key={log.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {log.action} {log.entityType}
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
              {log.action}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Entity id: <span className="font-mono text-xs">{log.entityId}</span>
          </p>
          <p className="text-sm text-slate-600">
            Actor: {log.actor.email} ({log.actor.role})
          </p>
          <p className="text-sm text-slate-600">
            When: {new Date(log.createdAt).toLocaleString()}
          </p>
          {(log.oldValues || log.newValues) && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                  Before
                </p>
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  {formatValues(log.oldValues)}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                  After
                </p>
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  {formatValues(log.newValues)}
                </pre>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
