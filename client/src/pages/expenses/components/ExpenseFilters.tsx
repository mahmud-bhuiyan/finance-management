import type { ExpenseListFilters } from "../../../lib/expenses";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "../../../lib/paymentMethods";
import type { SupportItem } from "../../../lib/supportData";

type ExpenseFiltersProps = {
  filters: ExpenseListFilters;
  categories: SupportItem[];
  departments: SupportItem[];
  vendors: SupportItem[];
  onChange: (next: Partial<ExpenseListFilters>) => void;
};

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SupportItem[];
  onChange: (value: string) => void;
}) => (
  <label className="block space-y-1 text-sm text-slate-700">
    <span className="font-medium text-slate-800">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </label>
);

export const ExpenseFilters = ({
  filters,
  categories,
  departments,
  vendors,
  onChange,
}: ExpenseFiltersProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
      Filters
    </h2>
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="block space-y-1 text-sm text-slate-700 sm:col-span-2 lg:col-span-1">
        <span className="font-medium text-slate-800">Search notes</span>
        <input
          type="search"
          value={filters.q}
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
          placeholder="e.g. taxi"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
        />
      </label>
      <FilterSelect
        label="Category"
        value={filters.categoryId}
        options={categories}
        onChange={(categoryId) => onChange({ categoryId, page: 1 })}
      />
      <FilterSelect
        label="Department"
        value={filters.departmentId}
        options={departments}
        onChange={(departmentId) => onChange({ departmentId, page: 1 })}
      />
      <FilterSelect
        label="Vendor"
        value={filters.vendorId}
        options={vendors}
        onChange={(vendorId) => onChange({ vendorId, page: 1 })}
      />
      <label className="block space-y-1 text-sm text-slate-700">
        <span className="font-medium text-slate-800">Payment method</span>
        <select
          value={filters.paymentMethod}
          onChange={(event) =>
            onChange({ paymentMethod: event.target.value, page: 1 })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
        >
          <option value="">All</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm text-slate-700">
        <span className="font-medium text-slate-800">Sort by</span>
        <select
          value={filters.sortBy}
          onChange={(event) =>
            onChange({
              sortBy: event.target.value as ExpenseListFilters["sortBy"],
              page: 1,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
        >
          <option value="occurredOn">Date</option>
          <option value="amount">Amount</option>
          <option value="createdAt">Created</option>
        </select>
      </label>
      <label className="block space-y-1 text-sm text-slate-700">
        <span className="font-medium text-slate-800">Direction</span>
        <select
          value={filters.sortDir}
          onChange={(event) =>
            onChange({
              sortDir: event.target.value as ExpenseListFilters["sortDir"],
              page: 1,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
        >
          <option value="desc">Newest / highest first</option>
          <option value="asc">Oldest / lowest first</option>
        </select>
      </label>
    </div>
  </div>
);
