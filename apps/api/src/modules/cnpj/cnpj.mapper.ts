import {
  type CnaeSegment,
  type EmployeeRange,
  estimateEmployeeRange,
  segmentFromCnae,
} from "@letalk/shared";
import type { CompanySnapshot } from "@prisma/client";
import type { BrasilApiCnpjData } from "./brasil-api.schema";

export interface CompanyData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnaePrincipal: string | null;
  cnaeDescription: string | null;
  capitalSocial: number | null;
  porte: string | null;
  situacao: string | null;
  dataAbertura: Date | null;
  segment: CnaeSegment;
  employeeRange: EmployeeRange;
}

const CNAE_CODE_LENGTH = 7;

function parseCnaePrincipal(raw: BrasilApiCnpjData): string | null {
  if (raw.cnae_fiscal === null || raw.cnae_fiscal === undefined) {
    return null;
  }
  return raw.cnae_fiscal.toString().padStart(CNAE_CODE_LENGTH, "0");
}

function parseOpeningDate(raw: BrasilApiCnpjData): Date | null {
  if (!raw.data_inicio_atividade) {
    return null;
  }
  const parsed = new Date(raw.data_inicio_atividade);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toCompanyData(raw: BrasilApiCnpjData): CompanyData {
  const cnaePrincipal = parseCnaePrincipal(raw);

  return {
    cnpj: raw.cnpj,
    razaoSocial: raw.razao_social,
    nomeFantasia: raw.nome_fantasia ?? null,
    cnaePrincipal,
    cnaeDescription: raw.cnae_fiscal_descricao ?? null,
    capitalSocial: raw.capital_social ?? null,
    porte: raw.porte ?? null,
    situacao: raw.descricao_situacao_cadastral ?? null,
    dataAbertura: parseOpeningDate(raw),
    segment: segmentFromCnae(cnaePrincipal),
    employeeRange: estimateEmployeeRange({
      porte: raw.porte ?? null,
      capitalSocial: raw.capital_social ?? null,
    }),
  };
}

export function snapshotToCompanyData(snapshot: CompanySnapshot): CompanyData {
  return {
    cnpj: snapshot.cnpj,
    razaoSocial: snapshot.razaoSocial,
    nomeFantasia: snapshot.nomeFantasia,
    cnaePrincipal: snapshot.cnaePrincipal,
    cnaeDescription: snapshot.cnaeDescription,
    capitalSocial: snapshot.capitalSocial,
    porte: snapshot.porte,
    situacao: snapshot.situacao,
    dataAbertura: snapshot.dataAbertura,
    segment: segmentFromCnae(snapshot.cnaePrincipal),
    employeeRange: estimateEmployeeRange({
      porte: snapshot.porte,
      capitalSocial: snapshot.capitalSocial,
    }),
  };
}
