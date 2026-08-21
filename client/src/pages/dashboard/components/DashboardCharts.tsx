import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "../../../lib/dashboard";

const COLORS = ["#0f766e", "#0369a1", "#b45309", "#7c3aed", "#be123c", "#475569"];

type DashboardChartsProps = {
  charts: DashboardSummary["charts"];
};

const ChartShell = ({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: ReactNode;
}) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    {empty ? (
      <p className="mt-8 text-center text-sm text-slate-500">
        No expense data for this filter range.
      </p>
    ) : (
      <div className="mt-4 h-64 w-full">{children}</div>
    )}
  </section>
);

const buildStackedRows = (
  rows: DashboardSummary["charts"]["expenseStackedByMonthCategory"],
) => {
  const categoryNames = [
    ...new Set(rows.map((row) => row.categoryName)),
  ].sort();
  const byMonth = new Map<string, Record<string, number>>();

  for (const row of rows) {
    const current = byMonth.get(row.month) ?? {};
    current[row.categoryName] = Number(row.total);
    byMonth.set(row.month, current);
  }

  const data = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => {
      const entry: Record<string, string | number> = { month };
      for (const name of categoryNames) {
        entry[name] = values[name] ?? 0;
      }
      return entry;
    });

  return { data, categoryNames };
};

export const DashboardCharts = ({ charts }: DashboardChartsProps) => {
  const byDay = charts.expenseByDay.map((row) => ({
    date: row.date.slice(5),
    total: Number(row.total),
  }));
  const byCategory = charts.expenseByCategory.map((row) => ({
    name: row.name,
    total: Number(row.total),
  }));
  const byDepartment = charts.expenseByDepartment.map((row) => ({
    name: row.name,
    total: Number(row.total),
  }));
  const byVendor = charts.expenseByVendor.slice(0, 8).map((row) => ({
    name: row.name,
    total: Number(row.total),
  }));
  const byPayment = charts.expenseByPaymentMethod.map((row) => ({
    name: row.name,
    total: Number(row.total),
  }));
  const byMonth = charts.expenseByMonth.map((row) => ({
    month: row.month,
    total: Number(row.total),
  }));
  const incomeVsExpense = charts.incomeVsExpenseByMonth.map((row) => ({
    month: row.month,
    expense: Number(row.expense),
    income: Number(row.income),
  }));
  const stacked = buildStackedRows(charts.expenseStackedByMonthCategory);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartShell title="Expense by day (line)" empty={byDay.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={byDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0f766e"
              strokeWidth={2}
              dot={false}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Monthly expense trend (area)" empty={byMonth.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0f766e"
              fill="#99f6e4"
              name="Expense"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Expense by category (doughnut)" empty={byCategory.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={byCategory}
              dataKey="total"
              nameKey="name"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
            >
              {byCategory.map((_, index) => (
                <Cell
                  key={`cat-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Expense by department (pie)" empty={byDepartment.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={byDepartment}
              dataKey="total"
              nameKey="name"
              outerRadius={85}
              paddingAngle={1}
            >
              {byDepartment.map((_, index) => (
                <Cell
                  key={`dept-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Expense by vendor (bar)" empty={byVendor.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byVendor} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Bar
              dataKey="total"
              fill="#0369a1"
              name="Expense"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Expense by payment method (bar)"
        empty={byPayment.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byPayment}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="total" fill="#b45309" name="Expense" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Expense by month × category (stacked bar)"
        empty={stacked.data.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stacked.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {stacked.categoryNames.map((name, index) => (
              <Bar
                key={name}
                dataKey={name}
                stackId="expense"
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Income vs expense by month"
        empty={incomeVsExpense.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={incomeVsExpense}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="expense" fill="#be123c" name="Expense" radius={[4, 4, 0, 0]} />
            <Bar dataKey="income" fill="#0f766e" name="Income" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  );
};
