export const LoadingState = ({
  message = "Loading…",
  fullPage = false,
}: {
  message?: string;
  fullPage?: boolean;
}) => {
  return (
    <div
      className={
        fullPage
          ? "relative z-1 flex min-h-screen flex-col items-center justify-center gap-3 text-(--fms-muted)"
          : "flex items-center justify-center gap-3 py-16 text-(--fms-muted)"
      }
    >
      <span className="spinner" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
