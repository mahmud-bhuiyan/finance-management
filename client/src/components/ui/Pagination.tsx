import { buildPaginationItems } from "../../lib/pagination";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const navButtonClass =
  "rounded-lg border border-(--fms-border-strong) px-3 py-1.5 text-(--fms-ink) hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-40";

const pageButtonClass = (isActive: boolean) =>
  isActive
    ? "min-w-9 rounded-lg border border-(--fms-border-strong) bg-[color-mix(in_srgb,var(--fms-accent)_15%,transparent)] px-3 py-1.5 font-medium text-(--fms-ink)"
    : `${navButtonClass} min-w-9`;

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const items = buildPaginationItems(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(1)}
        className={navButtonClass}
      >
        First
      </button>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={navButtonClass}
      >
        Previous
      </button>

      {items.map((item, index) =>
        item.type === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-(--fms-muted)"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={item.page}
            type="button"
            aria-current={item.page === page ? "page" : undefined}
            onClick={() => onPageChange(item.page)}
            className={pageButtonClass(item.page === page)}
          >
            {item.page}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={navButtonClass}
      >
        Next
      </button>
    </nav>
  );
};
