import { formatMoney, type DashboardKpis } from "../../../lib/dashboard";

type KpiCardsProps = {
  kpis: DashboardKpis;
};

const Card = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </article>
);

export const KpiCards = ({ kpis }: KpiCardsProps) => (
  <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    <Card label="Total expense" value={formatMoney(kpis.totalExpense)} />
    <Card
      label="Total income"
      value={formatMoney(kpis.totalIncome)}
      hint="Income module lands in Step 14"
    />
    <Card
      label="Net balance"
      value={formatMoney(kpis.netBalance)}
      hint="Income − expense"
    />
    <Card
      label="Avg daily expense"
      value={formatMoney(kpis.avgDailyExpense)}
      hint={`${kpis.expenseCount} expense${kpis.expenseCount === 1 ? "" : "s"}`}
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
    />
  </section>
);
