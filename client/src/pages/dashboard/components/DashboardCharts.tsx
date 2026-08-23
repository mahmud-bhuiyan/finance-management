import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
import { useTheme } from "../../../hooks/useTheme";
import type { DashboardSummary } from "../../../lib/dashboard";

const LIGHT_COLORS = [
  "#0b6d5e",
  "#b8892d",
  "#6b5ce0",
  "#c45c5c",
  "#1d6f9a",
  "#8a6a3a",
];
const DARK_COLORS = [
  "#3ee0c0",
  "#e8c97a",
  "#b8a8ff",
  "#f08a8a",
  "#7ec8e8",
  "#d4b48a",
];

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
  <section className="surface p-5">
    <h2 className="text-sm font-semibold tracking-wide text-(--fms-ink)">
      {title}
    </h2>
    {empty ? (
      <p className="mt-8 text-center text-sm text-(--fms-muted)">
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
  const { themePreference } = useTheme();
  const isDark = themePreference === "DARK";
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const grid = isDark ? "rgba(62,224,192,0.12)" : "rgba(18,33,28,0.08)";
  const tick = { fontSize: 11, fill: isDark ? "#93aea5" : "#5d6f68" };
  const tooltipStyle = {
    background: isDark ? "#0c2622" : "#fffaf2",
    border: `1px solid ${isDark ? "rgba(62,224,192,0.18)" : "rgba(18,33,28,0.1)"}`,
    borderRadius: 12,
    color: isDark ? "#e8f5f0" : "#12211c",
    fontSize: 12,
  };
  const accent = isDark ? "#3ee0c0" : "#0b6d5e";
  const gold = isDark ? "#e8c97a" : "#b8892d";
  const rose = isDark ? "#f08a8a" : "#c45c5c";

  const byDay = charts.expenseByDay.map((row) => ({
    date: row.date.slice(5),
    total: Number(row.total),
  }));
  const byCategory = charts.expenseByCategory.map((row, index) => ({
    name: row.name,
    total: Number(row.total),
    fill: colors[index % colors.length],
  }));
  const byDepartment = charts.expenseByDepartment.map((row, index) => ({
    name: row.name,
    total: Number(row.total),
    fill: colors[index % colors.length],
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
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="date" tick={tick} />
            <YAxis tick={tick} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="total"
              stroke={accent}
              strokeWidth={2.4}
              dot={false}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Monthly expense trend (area)" empty={byMonth.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="month" tick={tick} />
            <YAxis tick={tick} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="total"
              stroke={accent}
              fill={isDark ? "rgba(62,224,192,0.22)" : "rgba(11,109,94,0.18)"}
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
            />
            <Tooltip contentStyle={tooltipStyle} />
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
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Expense by vendor (bar)" empty={byVendor.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byVendor} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis type="number" tick={tick} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={tick}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey="total"
              fill={isDark ? "#7ec8e8" : "#1d6f9a"}
              name="Expense"
              radius={[0, 6, 6, 0]}
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
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="name" tick={tick} />
            <YAxis tick={tick} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="total" fill={gold} name="Expense" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Expense by month × category (stacked bar)"
        empty={stacked.data.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stacked.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="month" tick={tick} />
            <YAxis tick={tick} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {stacked.categoryNames.map((name, index) => (
              <Bar
                key={name}
                dataKey={name}
                stackId="expense"
                fill={colors[index % colors.length]}
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
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="month" tick={tick} />
            <YAxis tick={tick} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="expense" fill={rose} name="Expense" radius={[6, 6, 0, 0]} />
            <Bar dataKey="income" fill={accent} name="Income" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  );
};
