import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useListLeads } from "../api/use-list-leads";
import { LeadsTable } from "../components/leads-table";
import { LeadsTableSkeleton } from "../components/leads-table-skeleton";
import { Pagination } from "../components/pagination";

const PAGE_SIZE = 5;

export function LeadHistoryPage() {
  const [offset, setOffset] = useState(0);
  const query = useListLeads({ limit: PAGE_SIZE, offset });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-700">
            Histórico
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">
            Leads cadastrados
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Todos os leads com dados enriquecidos da Receita Federal.
          </p>
        </div>
        <Link
          to={ROUTES.home}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700"
        >
          Cadastrar novo lead
        </Link>
      </header>

      {query.isLoading && <LeadsTableSkeleton pageSize={PAGE_SIZE} />}

      {query.isError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900"
        >
          <p className="text-sm">
            Não foi possível carregar os leads. Verifique se a API está rodando
            e tente novamente.
          </p>
        </div>
      )}

      {query.data !== undefined && (
        <div className="space-y-6">
          <LeadsTable leads={query.data.items} pageSize={PAGE_SIZE} />
          {query.data.total > PAGE_SIZE && (
            <Pagination
              total={query.data.total}
              limit={PAGE_SIZE}
              offset={offset}
              onOffsetChange={setOffset}
            />
          )}
        </div>
      )}
    </main>
  );
}
