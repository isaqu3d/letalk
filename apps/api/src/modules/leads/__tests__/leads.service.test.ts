import type { CreateLeadInput } from "@letalk/shared";
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvalidCnpjError } from "../../cnpj/cnpj.errors";
import type { CompanyData } from "../../cnpj/cnpj.mapper";
import { DuplicateLeadError, LeadNotFoundError } from "../leads.errors";
import type { CnpjServiceDeps } from "../leads.service";
import type { LeadRecord, LeadsRepository } from "../leads.repository";
import { LeadsService } from "../leads.service";

const VALID_CNPJ = "33000167000101";

const SAMPLE_INPUT: CreateLeadInput = {
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "11987654321",
  cnpj: VALID_CNPJ,
  role: "Diretora Comercial",
};

const SAMPLE_COMPANY: CompanyData = {
  cnpj: VALID_CNPJ,
  razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
  nomeFantasia: "PETROBRAS",
  cnaePrincipal: "0600001",
  cnaeDescription: "Extração de petróleo e gás natural",
  capitalSocial: 205431960000,
  porte: "DEMAIS",
  situacao: "ATIVA",
  dataAbertura: new Date("1966-09-28"),
  segment: "Indústria",
  employeeRange: "250+",
  logradouro: "REPUBLICA DO CHILE",
  numero: "65",
  complemento: null,
  bairro: "CENTRO",
  municipio: "RIO DE JANEIRO",
  uf: "RJ",
  cep: "20031170",
  socios: [{ nome: "JOAO DA SILVA", qualificacao: "Diretor" }],
};

function createLead(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id: "lead-1",
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "11987654321",
    cnpj: VALID_CNPJ,
    contactRole: "Diretora Comercial",
    segment: "Indústria",
    employeeRange: "250+",
    createdAt: new Date(),
    razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
    nomeFantasia: "PETROBRAS",
    cnaePrincipal: "0600001",
    cnaeDescription: "Extração de petróleo e gás natural",
    capitalSocial: 205431960000,
    porte: "DEMAIS",
    situacao: "ATIVA",
    dataAbertura: new Date("1966-09-28"),
    logradouro: "REPUBLICA DO CHILE",
    numero: "65",
    complemento: null,
    bairro: "CENTRO",
    municipio: "RIO DE JANEIRO",
    uf: "RJ",
    cep: "20031170",
    socios: [{ nome: "JOAO DA SILVA", qualificacao: "Diretor" }],
    ...overrides,
  };
}

describe("LeadsService.createLead", () => {
  let cnpjService: CnpjServiceDeps;
  let leadsRepository: LeadsRepository;
  let service: LeadsService;

  beforeEach(() => {
    cnpjService = {
      getCompanyData: vi.fn(),
    };
    leadsRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
    };
    service = new LeadsService(cnpjService, leadsRepository);
  });

  it("cria lead enriquecido com segment e employeeRange a partir do CNPJ", async () => {
    vi.mocked(cnpjService.getCompanyData).mockResolvedValue(SAMPLE_COMPANY);
    vi.mocked(leadsRepository.create).mockResolvedValue(createLead());

    await service.createLead(SAMPLE_INPUT);

    expect(leadsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Maria Silva",
        email: "maria@example.com",
        cnpj: VALID_CNPJ,
        contactRole: "Diretora Comercial",
        segment: "Indústria",
        employeeRange: "250+",
        razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
      }),
    );
  });

  it("aceita lead sem role (contactRole vira null)", async () => {
    vi.mocked(cnpjService.getCompanyData).mockResolvedValue(SAMPLE_COMPANY);
    vi.mocked(leadsRepository.create).mockResolvedValue(createLead({ contactRole: null }));
    const { role: _role, ...inputWithoutRole } = SAMPLE_INPUT;

    await service.createLead(inputWithoutRole);

    expect(leadsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ contactRole: null }),
    );
  });

  it("lança DuplicateLeadError quando Prisma retorna P2002 (unique violation)", async () => {
    vi.mocked(cnpjService.getCompanyData).mockResolvedValue(SAMPLE_COMPANY);
    const uniqueError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint violation",
      { code: "P2002", clientVersion: "6.0.0" },
    );
    vi.mocked(leadsRepository.create).mockRejectedValue(uniqueError);

    await expect(service.createLead(SAMPLE_INPUT)).rejects.toBeInstanceOf(
      DuplicateLeadError,
    );
  });

  it("propaga InvalidCnpjError do cnpjService quando CNPJ é inválido", async () => {
    vi.mocked(cnpjService.getCompanyData).mockRejectedValue(
      new InvalidCnpjError("11111111111111"),
    );

    await expect(service.createLead(SAMPLE_INPUT)).rejects.toBeInstanceOf(
      InvalidCnpjError,
    );
    expect(leadsRepository.create).not.toHaveBeenCalled();
  });

  it("propaga outros erros do Prisma sem mascarar", async () => {
    vi.mocked(cnpjService.getCompanyData).mockResolvedValue(SAMPLE_COMPANY);
    const otherError = new Prisma.PrismaClientKnownRequestError(
      "DB indisponível",
      { code: "P1001", clientVersion: "6.0.0" },
    );
    vi.mocked(leadsRepository.create).mockRejectedValue(otherError);

    await expect(service.createLead(SAMPLE_INPUT)).rejects.toBe(otherError);
  });
});

describe("LeadsService.getLeadById", () => {
  let cnpjService: CnpjServiceDeps;
  let leadsRepository: LeadsRepository;
  let service: LeadsService;

  beforeEach(() => {
    cnpjService = {
      getCompanyData: vi.fn(),
    };
    leadsRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
    };
    service = new LeadsService(cnpjService, leadsRepository);
  });

  it("retorna o lead quando encontrado", async () => {
    const lead = createLead();
    vi.mocked(leadsRepository.findById).mockResolvedValue(lead);

    const result = await service.getLeadById("lead-1");

    expect(result).toBe(lead);
  });

  it("lança LeadNotFoundError quando lead não existe", async () => {
    vi.mocked(leadsRepository.findById).mockResolvedValue(null);

    await expect(service.getLeadById("missing")).rejects.toBeInstanceOf(
      LeadNotFoundError,
    );
  });
});

describe("LeadsService.listLeads", () => {
  it("repassa opções de paginação ao repository", async () => {
    const cnpjService: CnpjServiceDeps = {
      getCompanyData: vi.fn(),
    };
    const leadsRepository: LeadsRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    const service = new LeadsService(cnpjService, leadsRepository);

    await service.listLeads({ limit: 10, offset: 20 });

    expect(leadsRepository.list).toHaveBeenCalledWith({ limit: 10, offset: 20 });
  });
});
