import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export const Button = ({
  children,
  type = "button",
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
