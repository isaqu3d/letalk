import { z } from "zod";

export const cnpjParamsSchema = z.object({
  cnpj: z
    .string()
    .min(14)
    .max(18)
    .describe("CNPJ com ou sem máscara"),
});

export const enderecoResponseSchema = z.object({
  logradouro: z.string().nullable(),
  numero: z.string().nullable(),
  complemento: z.string().nullable(),
  bairro: z.string().nullable(),
  municipio: z.string().nullable(),
  uf: z.string().nullable(),
  cep: z.string().nullable(),
});

export const socioResponseSchema = z.object({
  nome: z.string(),
  qualificacao: z.string().nullable(),
});

export const companyDataResponseSchema = z.object({
  cnpj: z.string(),
  razaoSocial: z.string(),
  nomeFantasia: z.string().nullable(),
  cnaePrincipal: z.string().nullable(),
  cnaeDescription: z.string().nullable(),
  capitalSocial: z.number().nullable(),
  porte: z.string().nullable(),
  situacao: z.string().nullable(),
  dataAbertura: z.string().nullable().describe("Data ISO 8601"),
  segment: z.string().describe("Segmento derivado do CNAE principal"),
  employeeRange: z
    .string()
    .describe("Faixa estimada de funcionários (1-9, 10-49, 50-249, 250+, unknown)"),
  endereco: enderecoResponseSchema,
  socios: z.array(socioResponseSchema),
});

export const apiErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  issues: z.array(
    z.object({
      path: z.string(),
      message: z.string(),
    }),
  ),
});

export type CompanyDataResponse = z.infer<typeof companyDataResponseSchema>;

interface CompanyDataDomain {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnaePrincipal: string | null;
  cnaeDescription: string | null;
  capitalSocial: number | null;
  porte: string | null;
  situacao: string | null;
  dataAbertura: Date | null;
  segment: string;
  employeeRange: string;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  socios: Array<{ nome: string; qualificacao: string | null }>;
}

export const toCompanyDataResponse = (
  data: CompanyDataDomain,
): CompanyDataResponse => ({
  cnpj: data.cnpj,
  razaoSocial: data.razaoSocial,
  nomeFantasia: data.nomeFantasia,
  cnaePrincipal: data.cnaePrincipal,
  cnaeDescription: data.cnaeDescription,
  capitalSocial: data.capitalSocial,
  porte: data.porte,
  situacao: data.situacao,
  dataAbertura: data.dataAbertura?.toISOString() ?? null,
  segment: data.segment,
  employeeRange: data.employeeRange,
  endereco: {
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    municipio: data.municipio,
    uf: data.uf,
    cep: data.cep,
  },
  socios: data.socios,
});
