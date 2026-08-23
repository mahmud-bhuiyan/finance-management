import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiDownloadBlob, apiFetch, apiUpload } from "../../../lib/api";
import type { ExpenseAttachment } from "../../../lib/expenses";
import { toQueryErrorMessage } from "../../../lib/queryClient";
import { expenseQueryKeys } from "./useExpenses";

const fetchExpenseAttachments = (expenseId: string) =>
  apiFetch<{ attachments: ExpenseAttachment[] }>(
    `/expenses/${expenseId}/attachments`,
  ).then((data) => data.attachments);

export const useExpenseAttachments = (expenseId: string) => {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: expenseQueryKeys.attachments(expenseId),
    queryFn: () => fetchExpenseAttachments(expenseId),
    enabled: Boolean(expenseId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: expenseQueryKeys.attachments(expenseId),
    });
    void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.lists() });
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload<{ attachment: ExpenseAttachment }>(
        `/expenses/${expenseId}/attachments`,
        formData,
      );
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      apiFetch(`/expenses/${expenseId}/attachments/${attachmentId}`, {
        method: "DELETE",
      }),
    onSuccess: invalidate,
  });

  const downloadMutation = useMutation({
    mutationFn: (attachment: ExpenseAttachment) =>
      apiDownloadBlob(
        `/expenses/${expenseId}/attachments/${attachment.id}/download`,
      ).then((blob) => ({ blob, attachment })),
    onSuccess: ({ blob, attachment }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = attachment.originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });

  const busy =
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    downloadMutation.isPending;

  const mutationError =
    uploadMutation.error ??
    deleteMutation.error ??
    downloadMutation.error;

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load attachments")
    : null;

  const error = actionError
    ?? (mutationError
      ? toQueryErrorMessage(mutationError, "Attachment action failed")
      : null)
    ?? queryError;

  const upload = async (file: File) => {
    setActionError(null);
    try {
      await uploadMutation.mutateAsync(file);
    } catch (err) {
      setActionError(toQueryErrorMessage(err, "Upload failed"));
      throw err;
    }
  };

  const remove = async (attachmentId: string) => {
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(attachmentId);
    } catch (err) {
      setActionError(toQueryErrorMessage(err, "Delete failed"));
      throw err;
    }
  };

  const download = async (attachment: ExpenseAttachment) => {
    setActionError(null);
    try {
      await downloadMutation.mutateAsync(attachment);
    } catch (err) {
      setActionError(toQueryErrorMessage(err, "Download failed"));
      throw err;
    }
  };

  return {
    attachments: listQuery.data ?? [],
    loading: listQuery.isPending,
    busy,
    error,
    upload,
    remove,
    download,
  };
};
