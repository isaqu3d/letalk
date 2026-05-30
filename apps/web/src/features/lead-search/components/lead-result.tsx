import { formatCnpj } from "@letalk/shared";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { InfoRow } from "@/components/info-row";
import {
  employeeRangeLabel,
  formatCurrency,
  formatDate,
  formatEndereco,
  formatPhone,
} from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { segmentBadgeClass } from "@/lib/segment-badge";
import type { Lead } from "@/types/lead";

interface LeadResultProps {
  lead: Lead;
  onReset: () => void;
}

export function LeadResult({ lead, onReset }: LeadResultProps) {
  const { company } = lead;
  const cnaeDisplay =
    company.cnaePrincipal !== null
      ? `${company.cnaePrincipal} — ${company.cnaeDescription ?? ""}`.trim()
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
              {company.razaoSocial}
            </h2>
            {company.nomeFantasia !== null && (
              <p className="mt-0.5 text-sm text-ink-soft">
                {company.nomeFantasia}
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
          <InfoRow label="Porte" value={company.porte ?? "—"} />
          <InfoRow label="CNAE principal" value={cnaeDisplay} />
          <InfoRow
            label="Capital social"
            value={formatCurrency(company.capitalSocial)}
          />
          <InfoRow label="Situação" value={company.situacao ?? "—"} />
          <InfoRow
            label="Data de abertura"
            value={formatDate(company.dataAbertura)}
          />
          <div className="md:col-span-2 lg:col-span-3">
            <InfoRow label="Endereço" value={formatEndereco(company.endereco)} />
          </div>
        </dl>

        {company.socios.length > 0 && (
          <div className="mt-6 border-t border-surface-border pt-5">
            <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
              Quadro societário
            </h3>
            <ul className="flex flex-col divide-y divide-surface-border">
              {company.socios.map((socio) => (
                <li
                  key={`${socio.nome}-${socio.qualificacao ?? ""}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
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
          </div>
        )}
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

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-surface-border bg-surface px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft"
        >
          Cadastrar outro lead
        </button>
        <Link
          to={ROUTES.history}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700"
        >
          Ver no histórico
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
