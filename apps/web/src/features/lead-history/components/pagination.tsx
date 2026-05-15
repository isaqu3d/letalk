interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
}

export function Pagination({
  total,
  limit,
  offset,
  onOffsetChange,
}: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <nav className="flex items-center justify-between text-sm text-ink-soft">
      <span>
        Página <strong className="text-ink">{currentPage}</strong> de{" "}
        <strong className="text-ink">{totalPages}</strong>
        <span className="ml-2">({total} no total)</span>
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          disabled={!hasPrev}
          className="rounded-full border border-surface-border bg-surface px-5 py-2 text-sm font-medium text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onOffsetChange(offset + limit)}
          disabled={!hasNext}
          className="rounded-full border border-surface-border bg-surface px-5 py-2 text-sm font-medium text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </nav>
  );
}
