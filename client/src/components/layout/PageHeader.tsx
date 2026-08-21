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
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        {kicker}
      </p>
    ) : null}
    <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-slate-600">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
    {children}
  </div>
);
