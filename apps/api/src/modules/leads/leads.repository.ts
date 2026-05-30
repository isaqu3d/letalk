import type { Lead, Prisma, PrismaClient } from "@prisma/client";
import type { CompanySocio } from "../cnpj/cnpj.mapper";

export interface CreateLeadInput {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  contactRole: string | null;
  segment: string;
  employeeRange: string;
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
  socios: CompanySocio[];
}

export interface ListLeadsOptions {
  limit: number;
  offset: number;
}

export type LeadRecord = Lead;

export interface ListLeadsResult {
  items: LeadRecord[];
  total: number;
}

export interface LeadsRepository {
  create(input: CreateLeadInput): Promise<LeadRecord>;
  findById(id: string): Promise<LeadRecord | null>;
  list(options: ListLeadsOptions): Promise<ListLeadsResult>;
}

export class PrismaLeadsRepository implements LeadsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateLeadInput): Promise<LeadRecord> {
    const { socios, ...rest } = input;
    return this.prisma.lead.create({
      data: { ...rest, socios: socios as unknown as Prisma.InputJsonValue },
    });
  }

  async findById(id: string): Promise<LeadRecord | null> {
    return this.prisma.lead.findUnique({ where: { id } });
  }

  async list(options: ListLeadsOptions): Promise<ListLeadsResult> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        skip: options.offset,
        take: options.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.lead.count(),
    ]);

    return { items, total };
  }
}
