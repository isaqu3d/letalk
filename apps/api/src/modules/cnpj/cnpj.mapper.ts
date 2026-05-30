import {
  type CnaeSegment,
  type EmployeeRange,
  estimateEmployeeRange,
  segmentFromCnae,
} from "@letalk/shared";
import type { BrasilApiCnpjData } from "./brasil-api.schema";

export interface CompanySocio {
  nome: string;
  qualificacao: string | null;
}

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
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  socios: CompanySocio[];
}

const CNAE_CODE_LENGTH = 7;

function emptyToNull(value: string | null | undefined): string | null {
  return value ? value : null;
}

function parseSocios(raw: BrasilApiCnpjData): CompanySocio[] {
  return (raw.qsa ?? []).map((socio) => ({
    nome: socio.nome_socio,
    qualificacao: emptyToNull(socio.qualificacao_socio),
  }));
}

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
    logradouro: emptyToNull(raw.logradouro),
    numero: emptyToNull(raw.numero),
    complemento: emptyToNull(raw.complemento),
    bairro: emptyToNull(raw.bairro),
    municipio: emptyToNull(raw.municipio),
    uf: emptyToNull(raw.uf),
    cep: emptyToNull(raw.cep),
    socios: parseSocios(raw),
  };
}
