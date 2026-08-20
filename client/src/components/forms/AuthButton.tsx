import type { ReactNode, ButtonHTMLAttributes } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export const AuthButton = ({
  children,
  type = "button",
  className = "",
  disabled,
  ...props
}: AuthButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full border-2 border-black bg-[#ffd644] px-4 py-3 text-sm font-extrabold tracking-wide text-black uppercase shadow-[4px_4px_0_0_#000] transition-transform hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#000] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
