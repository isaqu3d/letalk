import { formatCnpj } from "@letalk/shared";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { InfoRow } from "@/components/info-row";
import {
  employeeRangeLabel,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhone,
} from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { segmentBadgeClass } from "@/lib/segment-badge";
import { useLead } from "../api/use-lead";

export function LeadDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const query = useLead(id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6">
        <Link
          to={ROUTES.history}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao histórico
        </Link>
      </header>

      {query.isLoading && (
        <p className="text-sm text-ink-soft">Carregando lead...</p>
      )}

      {query.isError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900"
        >
          <p className="text-sm">
            Não foi possível carregar este lead. Pode ter sido removido ou o ID
            está incorreto.
          </p>
        </div>
      )}

      {query.data !== undefined && (
        <article className="space-y-6">
          <section className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
            <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-700">
                  Empresa
                </p>
                <h1 className="mt-2 text-2xl font-medium text-ink">
                  {query.data.snapshot?.razaoSocial ?? "Empresa"}
                </h1>
                {query.data.snapshot?.nomeFantasia !== null &&
                  query.data.snapshot?.nomeFantasia !== undefined && (
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {query.data.snapshot.nomeFantasia}
                    </p>
                  )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${segmentBadgeClass(query.data.segment)}`}
              >
                {query.data.segment}
              </span>
            </header>

            <dl className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <InfoRow label="CNPJ" value={formatCnpj(query.data.cnpj)} />
              <InfoRow
                label="Faixa estimada"
                value={employeeRangeLabel(query.data.employeeRange)}
              />
              <InfoRow label="Porte" value={query.data.snapshot?.porte ?? "—"} />
              <InfoRow
                label="CNAE principal"
                value={
                  query.data.snapshot?.cnaePrincipal !== null &&
                  query.data.snapshot?.cnaePrincipal !== undefined
                    ? `${query.data.snapshot.cnaePrincipal} — ${query.data.snapshot.cnaeDescription ?? ""}`.trim()
                    : "—"
                }
              />
              <InfoRow
                label="Capital social"
                value={formatCurrency(query.data.snapshot?.capitalSocial ?? null)}
              />
              <InfoRow
                label="Situação"
                value={query.data.snapshot?.situacao ?? "—"}
              />
              <InfoRow
                label="Data de abertura"
                value={formatDate(query.data.snapshot?.dataAbertura ?? null)}
              />
            </dl>
          </section>

          <section className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
            <h2 className="mb-5 text-base font-medium text-ink">Contato</h2>
            <dl className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoRow label="Nome" value={query.data.name} />
              <InfoRow label="E-mail" value={query.data.email} />
              <InfoRow label="Telefone" value={formatPhone(query.data.phone)} />
              <InfoRow label="Cargo" value={query.data.contactRole ?? "—"} />
              <InfoRow
                label="Cadastrado em"
                value={formatDateTime(query.data.createdAt)}
              />
            </dl>
          </section>
        </article>
      )}
    </main>
  );
}
