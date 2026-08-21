import { formatMoney, type ReportSlice, type ReportSummary } from "../../../lib/reports";

type ReportTablesProps = {
  data: ReportSummary;
};

const SliceTable = ({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: ReportSlice[];
  emptyLabel: string;
}) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    {rows.length === 0 ? (
      <p className="mt-3 text-sm text-slate-500">{emptyLabel}</p>
    ) : (
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Count</th>
              <th className="py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.id ?? "none"}-${row.name}`}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-2 pr-4 text-slate-800">{row.name}</td>
                <td className="py-2 pr-4 text-slate-600">{row.count}</td>
                <td className="py-2 font-medium text-slate-900">
                  {formatMoney(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export const ReportTables = ({ data }: ReportTablesProps) => (
  <div className="flex flex-col gap-4">
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">
        Monthly (expense vs income)
      </h2>
      {data.byMonth.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No months in this range.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Month</th>
                <th className="py-2 pr-4 font-medium">Expense</th>
                <th className="py-2 pr-4 font-medium">Income</th>
                <th className="py-2 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {data.byMonth.map((row) => (
                <tr
                  key={row.month}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-2 pr-4 text-slate-800">{row.month}</td>
                  <td className="py-2 pr-4 text-slate-700">
                    {formatMoney(row.expense)}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">
                    {formatMoney(row.income)}
                  </td>
                  <td className="py-2 font-medium text-slate-900">
                    {formatMoney(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      <SliceTable
        title="By category"
        rows={data.byCategory}
        emptyLabel="No category totals."
      />
      <SliceTable
        title="By department"
        rows={data.byDepartment}
        emptyLabel="No department totals."
      />
      <SliceTable
        title="By vendor"
        rows={data.byVendor}
        emptyLabel="No vendor totals."
      />
      <SliceTable
        title="By payment method"
        rows={data.byPaymentMethod}
        emptyLabel="No payment-method totals."
      />
    </div>
  </div>
);
