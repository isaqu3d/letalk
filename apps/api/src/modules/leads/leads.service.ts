import type { CreateLeadInput } from "@letalk/shared";
import { Prisma } from "@prisma/client";
import type { CnpjService } from "../cnpj/cnpj.service";
import { DuplicateLeadError, LeadNotFoundError } from "./leads.errors";
import type {
  LeadsRepository,
  LeadWithSnapshot,
  ListLeadsOptions,
  ListLeadsResult,
} from "./leads.repository";

const PRISMA_UNIQUE_CONSTRAINT_CODE = "P2002";

export type CnpjServiceDeps = Pick<CnpjService, "getCompanyDataWithSnapshot">;

const isUniqueConstraintViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === PRISMA_UNIQUE_CONSTRAINT_CODE;

export class LeadsService {
  constructor(
    private readonly cnpjService: CnpjServiceDeps,
    private readonly leadsRepository: LeadsRepository,
  ) {}

  async createLead(input: CreateLeadInput): Promise<LeadWithSnapshot> {
    const { companyData, snapshotId } =
      await this.cnpjService.getCompanyDataWithSnapshot(input.cnpj);

    try {
      return await this.leadsRepository.create({
        name: input.name,
        email: input.email,
        phone: input.phone,
        cnpj: companyData.cnpj,
        contactRole: input.role ?? null,
        segment: companyData.segment,
        employeeRange: companyData.employeeRange,
        snapshotId,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new DuplicateLeadError(input.email, companyData.cnpj);
      }
      throw error;
    }
  }

  async getLeadById(id: string): Promise<LeadWithSnapshot> {
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
