import { formatCnpj } from "@letalk/shared";
import { InfoRow } from "@/components/info-row";
import {
  employeeRangeLabel,
  formatCurrency,
  formatDate,
  formatPhone,
} from "@/lib/formatters";
import { segmentBadgeClass } from "@/lib/segment-badge";
import type { Lead } from "@/types/lead";

interface LeadResultProps {
  lead: Lead;
  onReset: () => void;
}

export function LeadResult({ lead, onReset }: LeadResultProps) {
  const snapshot = lead.snapshot;
  const cnaeDisplay =
    snapshot?.cnaePrincipal !== null && snapshot?.cnaePrincipal !== undefined
      ? `${snapshot.cnaePrincipal} — ${snapshot.cnaeDescription ?? ""}`.trim()
      : "—";

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-4 text-brand-900">
        <p className="text-sm">
          <strong className="font-medium">Lead cadastrado com sucesso!</strong> Os dados enriquecidos da
          empresa aparecem abaixo.
        </p>
      </div>

      <article className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium text-ink">
              {snapshot?.razaoSocial ?? "Empresa"}
            </h2>
            {snapshot?.nomeFantasia !== null &&
              snapshot?.nomeFantasia !== undefined && (
                <p className="mt-0.5 text-sm text-ink-soft">
                  {snapshot.nomeFantasia}
                </p>
              )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${segmentBadgeClass(lead.segment)}`}
          >
            {lead.segment}
          </span>
        </header>

        <dl className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="CNPJ" value={formatCnpj(lead.cnpj)} />
          <InfoRow label="Faixa estimada" value={employeeRangeLabel(lead.employeeRange)} />
          <InfoRow label="Porte" value={snapshot?.porte ?? "—"} />
          <InfoRow label="CNAE principal" value={cnaeDisplay} />
          <InfoRow
            label="Capital social"
            value={formatCurrency(snapshot?.capitalSocial ?? null)}
          />
          <InfoRow label="Situação" value={snapshot?.situacao ?? "—"} />
          <InfoRow
            label="Data de abertura"
            value={formatDate(snapshot?.dataAbertura ?? null)}
          />
        </dl>
      </article>

      <article className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
        <h3 className="mb-5 text-base font-medium text-ink">Contato cadastrado</h3>
        <dl className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InfoRow label="Nome" value={lead.name} />
          <InfoRow label="E-mail" value={lead.email} />
          <InfoRow label="Telefone" value={formatPhone(lead.phone)} />
          <InfoRow label="Cargo" value={lead.contactRole ?? "—"} />
        </dl>
      </article>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-surface-border bg-surface px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft"
        >
          Cadastrar outro lead
        </button>
      </div>
    </section>
  );
}
