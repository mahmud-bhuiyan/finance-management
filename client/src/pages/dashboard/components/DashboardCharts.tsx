import type { ReactNode } from "react";
import {
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

export const DashboardCharts = ({ charts }: DashboardChartsProps) => {
  const byDay = charts.expenseByDay.map((row) => ({
    date: row.date.slice(5),
    total: Number(row.total),
  }));
  const byCategory = charts.expenseByCategory.map((row) => ({
    name: row.name,
    total: Number(row.total),
  }));
  const byVendor = charts.expenseByVendor.slice(0, 8).map((row) => ({
    name: row.name,
    total: Number(row.total),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartShell title="Expense by day" empty={byDay.length === 0}>
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

      <ChartShell title="Expense by category" empty={byCategory.length === 0}>
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

      <ChartShell title="Expense by vendor" empty={byVendor.length === 0}>
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
    </div>
  );
};
