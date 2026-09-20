import { useCallback, useState, type ReactNode } from "react";

export type ConfirmActionOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
};

export const useConfirmAction = () => {
  const [pending, setPending] = useState<ConfirmActionOptions | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requestConfirm = useCallback((options: ConfirmActionOptions) => {
    setPending(options);
  }, []);

  const closeConfirm = useCallback(() => {
    if (!submitting) {
      setPending(null);
    }
  }, [submitting]);

  const confirm = useCallback(async () => {
    if (!pending) {
      return;
    }

    setSubmitting(true);
    try {
      await pending.onConfirm();
      setPending(null);
    } finally {
      setSubmitting(false);
    }
  }, [pending]);

  return {
    pending,
    requestConfirm,
    closeConfirm,
    confirm,
    submitting,
  };
};
