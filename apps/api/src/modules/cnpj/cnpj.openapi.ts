import { z } from "zod";

export const cnpjParamsSchema = z.object({
  cnpj: z
    .string()
    .min(14)
    .max(18)
    .describe("CNPJ com ou sem máscara"),
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
});
