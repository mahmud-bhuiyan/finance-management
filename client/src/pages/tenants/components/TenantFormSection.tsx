import type { ReactNode } from "react";

type TenantFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const tenantFormSectionClass =
  "rounded-2xl border border-(--fms-border) bg-(--fms-surface) p-5";

export const TenantFormSection = ({
  title,
  description,
  children,
}: TenantFormSectionProps) => (
  <section className={tenantFormSectionClass}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-(--fms-ink)">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-(--fms-muted)">{description}</p>
      ) : null}
    </div>
    {children}
  </section>
);
