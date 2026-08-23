import type { CSSProperties } from "react";
import { formatMoney, type ReportSummary } from "../../../lib/reports";

type ReportSummaryCardsProps = {
  summary: ReportSummary["summary"];
};

const Card = ({
  label,
  value,
  hint,
  tone,
  className = "",
}: {
  label: string;
  value: string;
  hint: string;
  tone: string;
  className?: string;
}) => (
  <article
    className={`surface kpi-card p-5 ${className}`}
    style={{ "--kpi-tone": tone } as CSSProperties}
  >
    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-(--fms-faint) uppercase">
      {label}
    </p>
    <p className="font-display mt-3 text-3xl font-medium tracking-tight text-(--fms-ink) tabular-nums">
      {value}
    </p>
    <p className="mt-2 text-xs text-(--fms-muted)">{hint}</p>
  </article>
);

export const ReportSummaryCards = ({ summary }: ReportSummaryCardsProps) => {
  const netTone =
    Number(summary.netBalance) < 0 ? "var(--fms-rose)" : "var(--fms-gold)";

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        label="Total expense"
        value={formatMoney(summary.totalExpense)}
        hint={`${summary.expenseCount} transaction${summary.expenseCount === 1 ? "" : "s"}`}
        tone="var(--fms-rose)"
      />
      <Card
        label="Total income"
        value={formatMoney(summary.totalIncome)}
        hint={`${summary.incomeCount} transaction${summary.incomeCount === 1 ? "" : "s"}`}
        tone="var(--fms-accent)"
      />
      <Card
        label="Net balance"
        value={formatMoney(summary.netBalance)}
        hint="Income − expense"
        tone={netTone}
        className="sm:col-span-2 lg:col-span-1"
      />
    </section>
  );
};
