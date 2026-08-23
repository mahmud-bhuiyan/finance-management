import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[linear-gradient(180deg,var(--fms-accent-soft),var(--fms-accent))] text-white shadow-[0_10px_24px_-12px_var(--fms-accent)] hover:brightness-110 dark:text-[#04110f]",
  ghost:
    "border border-(--fms-border-strong) bg-transparent text-(--fms-ink) hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)]",
  danger:
    "border border-[color-mix(in_srgb,var(--fms-rose)_40%,transparent)] bg-[color-mix(in_srgb,var(--fms-rose)_12%,transparent)] text-(--fms-ink) hover:bg-[color-mix(in_srgb,var(--fms-rose)_20%,transparent)]",
};

export const Button = ({
  children,
  type = "button",
  className = "",
  disabled,
  variant = "primary",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 text-sm font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
