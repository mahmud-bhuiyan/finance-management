import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { ApiError, apiDownloadBlob } from "../../../lib/api";
import type { ExpenseAttachment } from "../../../lib/expenses";

type ExpenseAttachmentsProps = {
  expenseId: string;
  canWrite: boolean;
  listAttachments: (expenseId: string) => Promise<ExpenseAttachment[]>;
  uploadAttachment: (expenseId: string, file: File) => Promise<ExpenseAttachment>;
  deleteAttachment: (expenseId: string, attachmentId: string) => Promise<void>;
};

const formatBytes = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const ExpenseAttachments = ({
  expenseId,
  canWrite,
  listAttachments,
  uploadAttachment,
  deleteAttachment,
}: ExpenseAttachmentsProps) => {
  const [attachments, setAttachments] = useState<ExpenseAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const rows = await listAttachments(expenseId);
    setAttachments(rows);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const rows = await listAttachments(expenseId);
        if (!cancelled) {
          setAttachments(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load attachments",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expenseId, listAttachments]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await uploadAttachment(expenseId, file);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!window.confirm("Remove this attachment?")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteAttachment(expenseId, attachmentId);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (attachment: ExpenseAttachment) => {
    setError(null);
    try {
      const blob = await apiDownloadBlob(
        `/expenses/${expenseId}/attachments/${attachment.id}/download`,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = attachment.originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Download failed");
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Receipts</h3>
        {canWrite && (
          <label className="inline-flex cursor-pointer items-center rounded-lg bg-teal-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-900">
            {busy ? "Working…" : "Upload file"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={busy}
              onChange={(event) => void handleUpload(event)}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        JPEG, PNG, WebP, or PDF. Max 5 files per expense.
      </p>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="mt-3 text-sm text-slate-500">Loading attachments…</p>
      ) : attachments.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No receipts yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {attachment.originalName}
                </p>
                <p className="text-xs text-slate-500">
                  {attachment.mimeType} · {formatBytes(attachment.sizeBytes)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleDownload(attachment)}
                  className="font-medium text-teal-800 hover:underline"
                >
                  Download
                </button>
                {canWrite && (
                  <Button
                    disabled={busy}
                    onClick={() => void handleDelete(attachment.id)}
                    className="bg-red-700 px-3 py-1 hover:bg-red-800"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
