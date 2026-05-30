import { z } from "zod";
import {
  companyDataResponseSchema,
  enderecoResponseSchema,
  socioResponseSchema,
} from "../cnpj/cnpj.openapi";

export const leadIdParamsSchema = z.object({
  id: z.string().min(1).describe("ID do lead (cuid)"),
});

export const listLeadsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
    .describe("Quantidade de itens por página"),
  offset: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe("Deslocamento para paginação"),
});

const companyResponseSchema = z.object({
  razaoSocial: z.string(),
  nomeFantasia: z.string().nullable(),
  cnaePrincipal: z.string().nullable(),
  cnaeDescription: z.string().nullable(),
  capitalSocial: z.number().nullable(),
  porte: z.string().nullable(),
  situacao: z.string().nullable(),
  dataAbertura: z.string().nullable(),
  endereco: enderecoResponseSchema,
  socios: z.array(socioResponseSchema),
});

export const leadResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  cnpj: z.string(),
  contactRole: z.string().nullable(),
  segment: z.string(),
  employeeRange: z.string(),
  createdAt: z.string().describe("Timestamp ISO 8601"),
  company: companyResponseSchema,
});

export const listLeadsResponseSchema = z.object({
  items: z.array(leadResponseSchema),
  total: z.number().int().nonnegative(),
});

export type LeadResponse = z.infer<typeof leadResponseSchema>;
export type ListLeadsResponse = z.infer<typeof listLeadsResponseSchema>;

export { companyDataResponseSchema };

type SocioResponse = z.infer<typeof socioResponseSchema>;

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  contactRole: string | null;
  segment: string;
  employeeRange: string;
  createdAt: Date;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnaePrincipal: string | null;
  cnaeDescription: string | null;
  capitalSocial: number | null;
  porte: string | null;
  situacao: string | null;
  dataAbertura: Date | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  socios: unknown;
}

function toSocios(socios: unknown): SocioResponse[] {
  const parsed = z.array(socioResponseSchema).safeParse(socios);
  return parsed.success ? parsed.data : [];
}

export const toLeadResponse = (lead: LeadRow): LeadResponse => ({
  id: lead.id,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  cnpj: lead.cnpj,
  contactRole: lead.contactRole,
  segment: lead.segment,
  employeeRange: lead.employeeRange,
  createdAt: lead.createdAt.toISOString(),
  company: {
    razaoSocial: lead.razaoSocial,
    nomeFantasia: lead.nomeFantasia,
    cnaePrincipal: lead.cnaePrincipal,
    cnaeDescription: lead.cnaeDescription,
    capitalSocial: lead.capitalSocial,
    porte: lead.porte,
    situacao: lead.situacao,
    dataAbertura: lead.dataAbertura?.toISOString() ?? null,
    endereco: {
      logradouro: lead.logradouro,
      numero: lead.numero,
      complemento: lead.complemento,
      bairro: lead.bairro,
      municipio: lead.municipio,
      uf: lead.uf,
      cep: lead.cep,
    },
    socios: toSocios(lead.socios),
  },
});

export const toListLeadsResponse = (input: {
  items: LeadRow[];
  total: number;
}): ListLeadsResponse => ({
  items: input.items.map(toLeadResponse),
  total: input.total,
});
