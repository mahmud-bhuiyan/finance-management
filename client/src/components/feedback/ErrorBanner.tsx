export const ErrorBanner = ({ message }: { message: string }) => {
  return (
    <p className="border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black shadow-[3px_3px_0_0_#000]">
      {message}
    </p>
  );
};
