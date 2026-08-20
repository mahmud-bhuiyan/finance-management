import { monthLabel } from "../../../lib/expenses";

type MonthPickerProps = {
  year: number;
  month: number;
  onChange: (next: { year: number; month: number }) => void;
};

const YEARS = (() => {
  const current = new Date().getFullYear();
  return [current - 2, current - 1, current, current + 1];
})();

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export const ExpenseMonthPicker = ({
  year,
  month,
  onChange,
}: MonthPickerProps) => (
  <div className="flex flex-wrap gap-3">
    <label className="block space-y-1.5 text-sm text-slate-700">
      <span className="font-medium text-slate-800">Month</span>
      <select
        value={month}
        onChange={(event) =>
          onChange({ year, month: Number(event.target.value) })
        }
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
      >
        {MONTHS.map((value) => (
          <option key={value} value={value}>
            {monthLabel(value)}
          </option>
        ))}
      </select>
    </label>
    <label className="block space-y-1.5 text-sm text-slate-700">
      <span className="font-medium text-slate-800">Year</span>
      <select
        value={year}
        onChange={(event) =>
          onChange({ year: Number(event.target.value), month })
        }
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
      >
        {YEARS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  </div>
);
