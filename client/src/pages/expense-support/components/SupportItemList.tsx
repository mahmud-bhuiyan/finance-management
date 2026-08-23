import { Button } from "../../../components/ui/Button";
import type { SupportItem } from "../../../lib/supportData";

type SupportItemListProps = {
  items: SupportItem[];
  busyId: string | null;
  emptyLabel: string;
  onEdit: (item: SupportItem) => void;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export const SupportItemList = ({
  items,
  busyId,
  emptyLabel,
  onEdit,
  onToggleActive,
  onDelete,
}: SupportItemListProps) => {
  if (items.length === 0) {
    return (
      <p className="surface-dashed p-6 text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="surface overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Notes</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const busy = busyId === item.id;
            return (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.name}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                  {item.notes || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.active
                        ? "bg-teal-50 text-teal-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(item)}
                      className="text-sm font-medium text-teal-800 hover:underline disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onToggleActive(item.id, !item.active)}
                      className="text-sm font-medium text-slate-700 hover:underline disabled:opacity-50"
                    >
                      {item.active ? "Deactivate" : "Activate"}
                    </button>
                    <Button
                      variant="danger"
                      disabled={busy}
                      onClick={() => void onDelete(item.id)}
                      className="px-3 py-1"
                    >
                      {busy ? "…" : "Delete"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
