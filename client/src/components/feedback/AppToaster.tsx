import { Toaster } from "sonner";
import { useTheme } from "../../hooks/useTheme";

export const AppToaster = () => {
  const { themePreference } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      theme={themePreference === "DARK" ? "dark" : "light"}
      expand
      visibleToasts={4}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "fms-toast",
          error: "fms-toast-error",
          success: "fms-toast-success",
          info: "fms-toast-info",
          closeButton: "fms-toast-close",
        },
      }}
    />
  );
};
