import type { ReactNode } from "react";

export const Button = ({
  children,
  type = "button",
  onClick,
  className = "",
}: {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 ${className}`}
    >
      {children}
    </button>
  );
};
