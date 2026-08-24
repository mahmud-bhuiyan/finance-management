import { useEffect } from "react";
import { toastError } from "../../lib/toast";

export const ErrorBanner = ({ message }: { message: string }) => {
  useEffect(() => {
    toastError(message);
  }, [message]);

  return null;
};
