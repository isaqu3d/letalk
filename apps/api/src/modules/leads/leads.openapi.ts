import { z } from "zod";
import { companyDataResponseSchema } from "../cnpj/cnpj.openapi";

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

const companySnapshotResponseSchema = z.object({
  id: z.string(),
  cnpj: z.string(),
  razaoSocial: z.string(),
  nomeFantasia: z.string().nullable(),
  cnaePrincipal: z.string().nullable(),
  cnaeDescription: z.string().nullable(),
  capitalSocial: z.number().nullable(),
  porte: z.string().nullable(),
  situacao: z.string().nullable(),
  dataAbertura: z.string().nullable(),
  fetchedAt: z.string().describe("Timestamp ISO 8601"),
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
  snapshotId: z.string().nullable(),
  snapshot: companySnapshotResponseSchema.nullable(),
});

export const listLeadsResponseSchema = z.object({
  items: z.array(leadResponseSchema),
  total: z.number().int().nonnegative(),
});

export type LeadResponse = z.infer<typeof leadResponseSchema>;
export type ListLeadsResponse = z.infer<typeof listLeadsResponseSchema>;

export { companyDataResponseSchema };

interface PrismaLeadWithSnapshot {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  contactRole: string | null;
  segment: string;
  employeeRange: string;
  createdAt: Date;
  snapshotId: string | null;
  snapshot: {
    id: string;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnaePrincipal: string | null;
    cnaeDescription: string | null;
    capitalSocial: number | null;
    porte: string | null;
    situacao: string | null;
    dataAbertura: Date | null;
    fetchedAt: Date;
  } | null;
}

export const toLeadResponse = (lead: PrismaLeadWithSnapshot): LeadResponse => ({
  id: lead.id,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  cnpj: lead.cnpj,
  contactRole: lead.contactRole,
  segment: lead.segment,
  employeeRange: lead.employeeRange,
  createdAt: lead.createdAt.toISOString(),
  snapshotId: lead.snapshotId,
  snapshot: lead.snapshot
    ? {
        id: lead.snapshot.id,
        cnpj: lead.snapshot.cnpj,
        razaoSocial: lead.snapshot.razaoSocial,
        nomeFantasia: lead.snapshot.nomeFantasia,
        cnaePrincipal: lead.snapshot.cnaePrincipal,
        cnaeDescription: lead.snapshot.cnaeDescription,
        capitalSocial: lead.snapshot.capitalSocial,
        porte: lead.snapshot.porte,
        situacao: lead.snapshot.situacao,
        dataAbertura: lead.snapshot.dataAbertura?.toISOString() ?? null,
        fetchedAt: lead.snapshot.fetchedAt.toISOString(),
      }
    : null,
});

export const toListLeadsResponse = (input: {
  items: PrismaLeadWithSnapshot[];
  total: number;
}): ListLeadsResponse => ({
  items: input.items.map(toLeadResponse),
  total: input.total,
});
