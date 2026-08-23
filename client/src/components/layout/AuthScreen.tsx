import type { ReactNode } from "react";
import { Surface } from "../ui/Surface";
import { BrandMark } from "./NavIcons";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export const AuthScreen = ({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenProps) => {
  return (
    <div className="relative z-1 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark />
          <p className="mt-5 text-[0.7rem] font-semibold tracking-[0.22em] text-(--fms-accent) uppercase">
            Finance Management System
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-tight text-(--fms-ink) italic lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-(--fms-muted)">
            {subtitle}
          </p>
        </div>

        <Surface padded={false} className="p-8 sm:p-9">
          {children}
          <div className="mt-8 border-t border-(--fms-border) pt-6 text-center text-sm text-(--fms-muted)">
            {footer}
          </div>
        </Surface>
      </div>
    </div>
  );
};
