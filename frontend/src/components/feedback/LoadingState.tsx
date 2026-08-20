export const LoadingState = ({
  message = "Loading…",
}: {
  message?: string;
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-600">
      {message}
    </div>
  );
};
