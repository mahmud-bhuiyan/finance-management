import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiDownloadBlob, apiFetch, apiUpload } from "../../../lib/api";
import type { IncomeAttachment } from "../../../lib/incomes";
import { toQueryErrorMessage } from "../../../lib/queryClient";
import { incomeQueryKeys } from "./useIncomes";

const fetchIncomeAttachments = (incomeId: string) =>
  apiFetch<{ attachments: IncomeAttachment[] }>(
    `/incomes/${incomeId}/attachments`,
  ).then((data) => data.attachments);

export const useIncomeAttachments = (incomeId: string) => {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: incomeQueryKeys.attachments(incomeId),
    queryFn: () => fetchIncomeAttachments(incomeId),
    enabled: Boolean(incomeId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: incomeQueryKeys.attachments(incomeId),
    });
    void queryClient.invalidateQueries({ queryKey: incomeQueryKeys.lists() });
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload<{ attachment: IncomeAttachment }>(
        `/incomes/${incomeId}/attachments`,
        formData,
      );
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      apiFetch(`/incomes/${incomeId}/attachments/${attachmentId}`, {
        method: "DELETE",
      }),
    onSuccess: invalidate,
  });

  const downloadMutation = useMutation({
    mutationFn: (attachment: IncomeAttachment) =>
      apiDownloadBlob(
        `/incomes/${incomeId}/attachments/${attachment.id}/download`,
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

  const download = async (attachment: IncomeAttachment) => {
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
