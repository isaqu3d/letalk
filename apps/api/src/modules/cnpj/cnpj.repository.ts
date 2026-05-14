import type { CompanySnapshot, Prisma, PrismaClient } from "@prisma/client";

export interface UpsertSnapshotInput {
  cnpj: string;
  rawData: unknown;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnaePrincipal: string | null;
  cnaeDescription: string | null;
  capitalSocial: number | null;
  porte: string | null;
  situacao: string | null;
  dataAbertura: Date | null;
}

export interface CnpjRepository {
  findByCnpj(cnpj: string): Promise<CompanySnapshot | null>;
  upsertSnapshot(input: UpsertSnapshotInput): Promise<CompanySnapshot>;
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new Error("rawData não é serializável em JSON");
  }
  return JSON.parse(serialized);
}

export class PrismaCnpjRepository implements CnpjRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCnpj(cnpj: string): Promise<CompanySnapshot | null> {
    return this.prisma.companySnapshot.findUnique({ where: { cnpj } });
  }

  async upsertSnapshot(input: UpsertSnapshotInput): Promise<CompanySnapshot> {
    const now = new Date();
    const rawData = toPrismaJson(input.rawData);

    return this.prisma.companySnapshot.upsert({
      where: { cnpj: input.cnpj },
      create: {
        cnpj: input.cnpj,
        rawData,
        razaoSocial: input.razaoSocial,
        nomeFantasia: input.nomeFantasia,
        cnaePrincipal: input.cnaePrincipal,
        cnaeDescription: input.cnaeDescription,
        capitalSocial: input.capitalSocial,
        porte: input.porte,
        situacao: input.situacao,
        dataAbertura: input.dataAbertura,
        fetchedAt: now,
      },
      update: {
        rawData,
        razaoSocial: input.razaoSocial,
        nomeFantasia: input.nomeFantasia,
        cnaePrincipal: input.cnaePrincipal,
        cnaeDescription: input.cnaeDescription,
        capitalSocial: input.capitalSocial,
        porte: input.porte,
        situacao: input.situacao,
        dataAbertura: input.dataAbertura,
        fetchedAt: now,
      },
    });
  }
}
