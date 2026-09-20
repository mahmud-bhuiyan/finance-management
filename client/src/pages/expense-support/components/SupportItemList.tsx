import { useCallback, useMemo } from "react";
import {
  DeleteIcon,
  EditIcon,
  IconActionButton,
  PauseIcon,
  ReactivateIcon,
} from "../../../components/ui/ActionIcons";
import { DataTable, type DataTableColumn } from "../../../components/ui/DataTable";
import { useClientDataTable } from "../../../hooks/useClientDataTable";
import type { SupportItem, SupportKind } from "../../../lib/supportData";
import { supportKindSingular } from "../../../lib/supportData";

type SupportItemListProps = {
  items: SupportItem[];
  kind: SupportKind;
  busyId: string | null;
  emptyLabel: string;
  onEdit: (item: SupportItem) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
};

export const SupportItemList = ({
  items,
  kind,
  busyId,
  emptyLabel,
  onEdit,
  onToggleActive,
  onDelete,
}: SupportItemListProps) => {
  const getSearchText = useCallback(
    (item: SupportItem) => `${item.name} ${item.notes ?? ""}`,
    [],
  );

  const sortAccessors = useMemo(
    () => ({
      name: (item: SupportItem) => item.name,
      notes: (item: SupportItem) => item.notes ?? "",
      status: (item: SupportItem) => item.active,
    }),
    [],
  );

  const { pageRows, meta, listState, patchListState, totalRows } =
    useClientDataTable({
      rows: items,
      getSearchText,
      sortAccessors,
      defaultSortBy: "name",
      resetKey: kind,
    });

  const columns = useMemo<DataTableColumn<SupportItem>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        width: "30%",
        align: "left",
        sortable: true,
        className: "truncate font-medium",
        cell: (item) => item.name,
      },
      {
        id: "notes",
        header: "Notes",
        width: "35%",
        align: "left",
        sortable: true,
        className: "truncate text-(--fms-muted)",
        cell: (item) => item.notes || "—",
      },
      {
        id: "status",
        header: "Status",
        width: "15%",
        headerAlign: "center",
        cellAlign: "center",
        sortable: true,
        cell: (item) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              item.active
                ? "bg-teal-50 text-teal-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {item.active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        width: "20%",
        headerAlign: "center",
        cellAlign: "center",
        className: "whitespace-nowrap",
        cell: (item) => {
          const busy = busyId === item.id;

          return (
            <div className="flex items-center justify-center gap-1">
              <IconActionButton
                label="Edit item"
                disabled={busy}
                onClick={() => onEdit(item)}
              >
                <EditIcon />
              </IconActionButton>
              {item.active ? (
                <IconActionButton
                  label="Deactivate item"
                  disabled={busy}
                  onClick={() => onToggleActive(item.id, false)}
                >
                  <PauseIcon />
                </IconActionButton>
              ) : (
                <IconActionButton
                  label="Activate item"
                  disabled={busy}
                  onClick={() => onToggleActive(item.id, true)}
                >
                  <ReactivateIcon />
                </IconActionButton>
              )}
              <IconActionButton
                label="Delete item"
                tone="rose"
                disabled={busy}
                onClick={() => onDelete(item.id)}
              >
                <DeleteIcon />
              </IconActionButton>
            </div>
          );
        },
      },
    ],
    [busyId, onDelete, onEdit, onToggleActive],
  );

  const emptyMessage =
    totalRows === 0
      ? emptyLabel
      : listState.search.trim()
        ? `No ${supportKindSingular(kind).toLowerCase()}s match your search.`
        : emptyLabel;

  return (
    <DataTable
      columns={columns}
      rows={pageRows}
      rowKey={(item) => item.id}
      meta={meta}
      sortBy={listState.sortBy}
      sortDir={listState.sortDir}
      onSortChange={(sortBy, sortDir) =>
        patchListState({ sortBy, sortDir, page: 1 })
      }
      onPageChange={(page) => patchListState({ page })}
      onPageSizeChange={(pageSize) => patchListState({ pageSize, page: 1 })}
      emptyMessage={emptyMessage}
      search={{
        value: listState.search,
        onChange: (search) => patchListState({ search, page: 1 }),
        placeholder: "Search name or notes…",
        srOnlyLabel: `Search ${supportKindSingular(kind).toLowerCase()}s`,
        resetKey: kind,
      }}
    />
  );
};
