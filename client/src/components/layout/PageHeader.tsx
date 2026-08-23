import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export const PageHeader = ({
  kicker,
  title,
  description,
  actions,
  children,
}: PageHeaderProps) => (
  <div>
    {kicker ? (
      <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-(--fms-accent) uppercase">
        {kicker}
      </p>
    ) : null}
    <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-(--fms-ink) italic lg:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-(--fms-muted)">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
    {children}
  </div>
);
