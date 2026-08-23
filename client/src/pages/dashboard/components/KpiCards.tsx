import type { CSSProperties } from "react";
import { formatMoney, type DashboardKpis } from "../../../lib/dashboard";

type KpiCardsProps = {
  kpis: DashboardKpis;
};

const Card = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: string;
}) => (
  <article
    className="surface kpi-card p-5"
    style={{ "--kpi-tone": tone } as CSSProperties}
  >
    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-(--fms-faint) uppercase">
      {label}
    </p>
    <p className="font-display mt-3 text-3xl font-medium tracking-tight text-(--fms-ink) tabular-nums">
      {value}
    </p>
    {hint && <p className="mt-2 text-xs text-(--fms-muted)">{hint}</p>}
  </article>
);

export const KpiCards = ({ kpis }: KpiCardsProps) => {
  const netTone =
    Number(kpis.netBalance) < 0 ? "var(--fms-rose)" : "var(--fms-gold)";

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card
        label="Total expense"
        value={formatMoney(kpis.totalExpense)}
        tone="var(--fms-rose)"
      />
      <Card
        label="Total income"
        value={formatMoney(kpis.totalIncome)}
        hint={`${kpis.incomeCount} income${kpis.incomeCount === 1 ? "" : "s"}`}
        tone="var(--fms-accent)"
      />
      <Card
        label="Net balance"
        value={formatMoney(kpis.netBalance)}
        hint="Income − expense"
        tone={netTone}
      />
      <Card
        label="Avg daily expense"
        value={formatMoney(kpis.avgDailyExpense)}
        hint={`${kpis.expenseCount} expense${kpis.expenseCount === 1 ? "" : "s"}`}
        tone="var(--fms-violet)"
      />
      <Card
        label="Highest expense"
        value={
          kpis.highestExpense
            ? formatMoney(kpis.highestExpense.amount)
            : "—"
        }
        hint={
          kpis.highestExpense
            ? `${kpis.highestExpense.occurredOn}${
                kpis.highestExpense.notes
                  ? ` · ${kpis.highestExpense.notes}`
                  : ""
              }`
            : "No expenses in range"
        }
        tone="var(--fms-gold)"
      />
    </section>
  );
};
