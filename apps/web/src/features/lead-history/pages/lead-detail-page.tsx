import { formatCnpj } from "@letalk/shared";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { InfoRow } from "@/components/info-row";
import {
  employeeRangeLabel,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatEndereco,
  formatPhone,
} from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { segmentBadgeClass } from "@/lib/segment-badge";
import { useLead } from "../api/use-lead";
import { LeadDetailSkeleton } from "../components/lead-detail-skeleton";

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

      {query.isLoading && <LeadDetailSkeleton />}

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
                  {query.data.company.razaoSocial}
                </h1>
                {query.data.company.nomeFantasia !== null && (
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {query.data.company.nomeFantasia}
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
              <InfoRow label="Porte" value={query.data.company.porte ?? "—"} />
              <InfoRow
                label="CNAE principal"
                value={
                  query.data.company.cnaePrincipal !== null
                    ? `${query.data.company.cnaePrincipal} — ${query.data.company.cnaeDescription ?? ""}`.trim()
                    : "—"
                }
              />
              <InfoRow
                label="Capital social"
                value={formatCurrency(query.data.company.capitalSocial)}
              />
              <InfoRow
                label="Situação"
                value={query.data.company.situacao ?? "—"}
              />
              <InfoRow
                label="Data de abertura"
                value={formatDate(query.data.company.dataAbertura)}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <InfoRow
                  label="Endereço"
                  value={formatEndereco(query.data.company.endereco)}
                />
              </div>
            </dl>
          </section>

          {query.data.company.socios.length > 0 && (
            <section className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
              <h2 className="mb-5 text-base font-medium text-ink">
                Quadro societário
              </h2>
              <ul className="flex flex-col divide-y divide-surface-border">
                {query.data.company.socios.map((socio) => (
                  <li
                    key={`${socio.nome}-${socio.qualificacao ?? ""}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-ink">
                      {socio.nome}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {socio.qualificacao ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
