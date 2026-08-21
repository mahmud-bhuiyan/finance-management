import { formatMoney, type ReportSummary } from "../../../lib/reports";

type ReportSummaryCardsProps = {
  summary: ReportSummary["summary"];
};

export const ReportSummaryCards = ({ summary }: ReportSummaryCardsProps) => (
  <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Total expense
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">
        {formatMoney(summary.totalExpense)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {summary.expenseCount} transaction{summary.expenseCount === 1 ? "" : "s"}
      </p>
    </article>
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Total income
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">
        {formatMoney(summary.totalIncome)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {summary.incomeCount} transaction{summary.incomeCount === 1 ? "" : "s"}
        {" · "}
        zero until Step 14
      </p>
    </article>
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Net balance
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">
        {formatMoney(summary.netBalance)}
      </p>
      <p className="mt-1 text-xs text-slate-500">Income − expense</p>
    </article>
  </section>
);
