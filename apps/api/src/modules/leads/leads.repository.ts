import type { Prisma, PrismaClient } from "@prisma/client";

export interface CreateLeadInput {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  contactRole: string | null;
  segment: string;
  employeeRange: string;
  snapshotId: string;
}

export interface ListLeadsOptions {
  limit: number;
  offset: number;
}

export type LeadWithSnapshot = Prisma.LeadGetPayload<{
  include: { snapshot: true };
}>;

export interface ListLeadsResult {
  items: LeadWithSnapshot[];
  total: number;
}

export interface LeadsRepository {
  create(input: CreateLeadInput): Promise<LeadWithSnapshot>;
  findById(id: string): Promise<LeadWithSnapshot | null>;
  list(options: ListLeadsOptions): Promise<ListLeadsResult>;
}

export class PrismaLeadsRepository implements LeadsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateLeadInput): Promise<LeadWithSnapshot> {
    return this.prisma.lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        cnpj: input.cnpj,
        contactRole: input.contactRole,
        segment: input.segment,
        employeeRange: input.employeeRange,
        snapshotId: input.snapshotId,
      },
      include: { snapshot: true },
    });
  }

  async findById(id: string): Promise<LeadWithSnapshot | null> {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { snapshot: true },
    });
  }

  async list(options: ListLeadsOptions): Promise<ListLeadsResult> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        skip: options.offset,
        take: options.limit,
        orderBy: { createdAt: "desc" },
        include: { snapshot: true },
      }),
      this.prisma.lead.count(),
    ]);

    return { items, total };
  }
}
