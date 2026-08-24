import { toast } from "sonner";

const toastBaseOptions = {
  icon: null,
  closeButton: true,
} as const;

export const toastError = (message: string) => {
  const trimmed = message.trim();
  if (!trimmed) {
    return;
  }

  toast.error(trimmed, {
    ...toastBaseOptions,
    id: "app-error",
  });
};

export const toastSuccess = (message: string) => {
  const trimmed = message.trim();
  if (!trimmed) {
    return;
  }

  toast.success(trimmed, {
    ...toastBaseOptions,
    id: "app-success",
  });
};

export const toastInfo = (message: string) => {
  const trimmed = message.trim();
  if (!trimmed) {
    return;
  }

  toast.info(trimmed, {
    ...toastBaseOptions,
    id: "app-info",
  });
};
