import { employeeRangeLabel, formatDateTime } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { segmentBadgeClass } from "@/lib/segment-badge";
import type { Lead } from "@/types/lead";
import { formatCnpj } from "@letalk/shared";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ROW_HEIGHT = "h-[72px]";
const TABLE_COLUMNS = 6;

const COLUMN_WIDTHS = [
  "19%",
  "22%",
  "12%",
  "13%",
  "17%",
  "17%",
] as const;

interface LeadsTableProps {
  leads: Lead[];
  pageSize?: number;
}

export function LeadsTable({ leads, pageSize }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface px-6 py-16 text-center">
        <p className="text-sm text-ink-soft">Nenhum lead cadastrado ainda.</p>
        <Link
          to={ROUTES.home}
          className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Cadastrar o primeiro lead
        </Link>
      </div>
    );
  }

  const emptyRowsCount =
    pageSize !== undefined ? Math.max(0, pageSize - leads.length) : 0;

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm md:block">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          {COLUMN_WIDTHS.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <thead className="bg-surface-soft">
          <tr>
            <Th>Contato</Th>
            <Th>Empresa</Th>
            <Th>Segmento</Th>
            <Th>Faixa</Th>
            <Th className="text-center">Cadastrado em</Th>
            <Th className="text-center" aria-label="Ações" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className={`${ROW_HEIGHT} border-t border-surface-border transition hover:bg-surface-soft/60`}
            >
              <Td>
                <div
                  className="line-clamp-1 font-medium text-ink"
                  title={lead.name}
                >
                  {lead.name}
                </div>
                <div
                  className="line-clamp-1 text-xs text-ink-soft"
                  title={lead.email}
                >
                  {lead.email}
                </div>
              </Td>
              <Td>
                <div
                  className="line-clamp-1 text-ink"
                  title={lead.snapshot?.razaoSocial ?? undefined}
                >
                  {lead.snapshot?.razaoSocial ?? "—"}
                </div>
                <div className="text-xs text-ink-soft">
                  {formatCnpj(lead.cnpj)}
                </div>
              </Td>
              <Td>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${segmentBadgeClass(lead.segment)}`}
                >
                  {lead.segment}
                </span>
              </Td>
              <Td className="text-ink-soft">
                <span className="line-clamp-2" title={employeeRangeLabel(lead.employeeRange)}>
                  {employeeRangeLabel(lead.employeeRange)}
                </span>
              </Td>
              <Td className="whitespace-nowrap text-center text-ink-soft">
                {formatDateTime(lead.createdAt)}
              </Td>
              <Td className="whitespace-nowrap text-center">
                <Link
                  to={ROUTES.detail(lead.id)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
                >
                  Ver detalhes
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Td>
            </tr>
          ))}
          {Array.from({ length: emptyRowsCount }).map((_, index) => (
            <tr
              key={`empty-${index}`}
              aria-hidden="true"
              className={`${ROW_HEIGHT} border-t border-surface-border`}
            >
              {COLUMN_WIDTHS.map((_w, colIndex) => (
                <td
                  key={colIndex}
                  className={
                    colIndex < TABLE_COLUMNS - 1
                      ? "border-r border-surface-border"
                      : ""
                  }
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

interface LeadCardProps {
  lead: Lead;
}

function LeadCard({ lead }: LeadCardProps) {
  return (
    <li>
      <Link
        to={ROUTES.detail(lead.id)}
        className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:bg-surface-soft/60"
      >
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div
              className="truncate font-medium text-ink"
              title={lead.name}
            >
              {lead.name}
            </div>
            <div className="truncate text-xs text-ink-soft" title={lead.email}>
              {lead.email}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${segmentBadgeClass(lead.segment)}`}
          >
            {lead.segment}
          </span>
        </header>
        <div className="border-t border-surface-border pt-3">
          <div
            className="line-clamp-1 text-sm text-ink"
            title={lead.snapshot?.razaoSocial ?? undefined}
          >
            {lead.snapshot?.razaoSocial ?? "—"}
          </div>
          <div className="text-xs text-ink-soft">{formatCnpj(lead.cnpj)}</div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
          <span>{employeeRangeLabel(lead.employeeRange)}</span>
          <span>{formatDateTime(lead.createdAt)}</span>
        </footer>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
          Ver detalhes
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

interface CellProps {
  children?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

function Th({ children, className = "", "aria-label": ariaLabel }: CellProps) {
  const alignment = /\btext-(left|center|right)\b/.test(className)
    ? ""
    : "text-left";
  return (
    <th
      scope="col"
      aria-label={ariaLabel}
      className={`border-r border-surface-border px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft last:border-r-0 ${alignment} ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: CellProps) {
  return (
    <td
      className={`border-r border-surface-border px-4 py-3.5 align-middle text-sm last:border-r-0 ${className}`}
    >
      {children}
    </td>
  );
}
