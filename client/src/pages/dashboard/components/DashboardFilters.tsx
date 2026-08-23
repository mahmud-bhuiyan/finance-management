import type { SupportItem } from "../../../lib/supportData";
import type { DashboardFilters, DashboardPreset } from "../../../lib/dashboard";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "../../../lib/paymentMethods";

const PRESETS: { value: DashboardPreset; label: string }[] = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

type DashboardFiltersProps = {
  filters: DashboardFilters;
  categories: SupportItem[];
  departments: SupportItem[];
  vendors: SupportItem[];
  onChange: (next: Partial<DashboardFilters>) => void;
};

export const DashboardFiltersPanel = ({
  filters,
  categories,
  departments,
  vendors,
  onChange,
}: DashboardFiltersProps) => (
  <section className="surface p-4">
    <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Period
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={filters.preset}
          onChange={(event) =>
            onChange({ preset: event.target.value as DashboardPreset })
          }
        >
          {PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      {filters.preset === "custom" && (
        <>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            From
            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={filters.from}
              onChange={(event) => onChange({ from: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            To
            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={filters.to}
              onChange={(event) => onChange({ to: event.target.value })}
            />
          </label>
        </>
      )}

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Category
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={filters.categoryId}
          onChange={(event) => onChange({ categoryId: event.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Department
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={filters.departmentId}
          onChange={(event) => onChange({ departmentId: event.target.value })}
        >
          <option value="">All departments</option>
          {departments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Vendor
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={filters.vendorId}
          onChange={(event) => onChange({ vendorId: event.target.value })}
        >
          <option value="">All vendors</option>
          {vendors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Payment method
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={filters.paymentMethod}
          onChange={(event) => onChange({ paymentMethod: event.target.value })}
        >
          <option value="">All methods</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </option>
          ))}
        </select>
      </label>
    </div>
  </section>
);
