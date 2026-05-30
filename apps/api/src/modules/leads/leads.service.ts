import type { CreateLeadInput } from "@letalk/shared";
import { Prisma } from "@prisma/client";
import type { CnpjService } from "../cnpj/cnpj.service";
import { DuplicateLeadError, LeadNotFoundError } from "./leads.errors";
import type {
  LeadRecord,
  LeadsRepository,
  ListLeadsOptions,
  ListLeadsResult,
} from "./leads.repository";

const PRISMA_UNIQUE_CONSTRAINT_CODE = "P2002";

export type CnpjServiceDeps = Pick<CnpjService, "getCompanyData">;

const isUniqueConstraintViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === PRISMA_UNIQUE_CONSTRAINT_CODE;

export class LeadsService {
  constructor(
    private readonly cnpjService: CnpjServiceDeps,
    private readonly leadsRepository: LeadsRepository,
  ) {}

  async createLead(input: CreateLeadInput): Promise<LeadRecord> {
    const companyData = await this.cnpjService.getCompanyData(input.cnpj);

    try {
      return await this.leadsRepository.create({
        name: input.name,
        email: input.email,
        phone: input.phone,
        cnpj: companyData.cnpj,
        contactRole: input.role ?? null,
        segment: companyData.segment,
        employeeRange: companyData.employeeRange,
        razaoSocial: companyData.razaoSocial,
        nomeFantasia: companyData.nomeFantasia,
        cnaePrincipal: companyData.cnaePrincipal,
        cnaeDescription: companyData.cnaeDescription,
        capitalSocial: companyData.capitalSocial,
        porte: companyData.porte,
        situacao: companyData.situacao,
        dataAbertura: companyData.dataAbertura,
        logradouro: companyData.logradouro,
        numero: companyData.numero,
        complemento: companyData.complemento,
        bairro: companyData.bairro,
        municipio: companyData.municipio,
        uf: companyData.uf,
        cep: companyData.cep,
        socios: companyData.socios,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new DuplicateLeadError(input.email, companyData.cnpj);
      }
      throw error;
    }
  }

  async getLeadById(id: string): Promise<LeadRecord> {
    const lead = await this.leadsRepository.findById(id);
    if (lead === null) {
      throw new LeadNotFoundError(id);
    }
    return lead;
  }

  async listLeads(options: ListLeadsOptions): Promise<ListLeadsResult> {
    return this.leadsRepository.list(options);
  }
}
