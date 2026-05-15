import type { CompanySnapshot } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrasilApiClient } from "../../../infra/http/brasil-api.client";
import type { BrasilApiCnpjData } from "../brasil-api.schema";
import { CnpjNotFoundError, InvalidCnpjError } from "../cnpj.errors";
import type { CnpjRepository } from "../cnpj.repository";
import { CnpjService } from "../cnpj.service";

const VALID_CNPJ = "33000167000101";

const RAW_PAYLOAD: BrasilApiCnpjData = {
  cnpj: VALID_CNPJ,
  razao_social: "PETROLEO BRASILEIRO S A PETROBRAS",
  nome_fantasia: "PETROBRAS",
  cnae_fiscal: 1921700,
  cnae_fiscal_descricao: "Fabricação de produtos do refino de petróleo",
  capital_social: 205431960490.65,
  porte: "DEMAIS",
  descricao_situacao_cadastral: "ATIVA",
  data_inicio_atividade: "1953-10-03",
};

function createSnapshot(overrides: Partial<CompanySnapshot> = {}): CompanySnapshot {
  return {
    id: "snap-1",
    cnpj: VALID_CNPJ,
    rawData: RAW_PAYLOAD,
    razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
    nomeFantasia: "PETROBRAS",
    cnaePrincipal: "1921700",
    cnaeDescription: "Fabricação de produtos do refino de petróleo",
    capitalSocial: 205431960490.65,
    porte: "DEMAIS",
    situacao: "ATIVA",
    dataAbertura: new Date("1953-10-03"),
    fetchedAt: new Date(),
    ...overrides,
  };
}

function buildService(deps: {
  client: BrasilApiClient;
  repository: CnpjRepository;
  cacheTtlHours?: number;
}): CnpjService {
  return new CnpjService(deps.client, deps.repository, {
    cacheTtlHours: deps.cacheTtlHours ?? 24,
  });
}

describe("CnpjService.getCompanyData", () => {
  let client: BrasilApiClient;
  let repository: CnpjRepository;

  beforeEach(() => {
    client = { fetchCnpj: vi.fn() };
    repository = {
      findByCnpj: vi.fn(),
      upsertSnapshot: vi.fn(),
    };
  });

  it("lança InvalidCnpjError quando o CNPJ não passa no algoritmo", async () => {
    const service = buildService({ client, repository });

    await expect(service.getCompanyData("11111111111111")).rejects.toBeInstanceOf(
      InvalidCnpjError,
    );
    expect(client.fetchCnpj).not.toHaveBeenCalled();
    expect(repository.findByCnpj).not.toHaveBeenCalled();
  });

  it("retorna dados do cache quando há snapshot fresh", async () => {
    vi.mocked(repository.findByCnpj).mockResolvedValue(createSnapshot());
    const service = buildService({ client, repository, cacheTtlHours: 24 });

    const result = await service.getCompanyData(VALID_CNPJ);

    expect(result.razaoSocial).toBe("PETROLEO BRASILEIRO S A PETROBRAS");
    expect(result.segment).toBe("Indústria");
    expect(result.employeeRange).toBe("250+");
    expect(client.fetchCnpj).not.toHaveBeenCalled();
    expect(repository.upsertSnapshot).not.toHaveBeenCalled();
  });

  it("busca na BrasilAPI e salva no cache quando não há snapshot", async () => {
    vi.mocked(repository.findByCnpj).mockResolvedValue(null);
    vi.mocked(client.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
    vi.mocked(repository.upsertSnapshot).mockResolvedValue(createSnapshot());
    const service = buildService({ client, repository });

    const result = await service.getCompanyData(VALID_CNPJ);

    expect(client.fetchCnpj).toHaveBeenCalledWith(VALID_CNPJ);
    expect(repository.upsertSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        cnpj: VALID_CNPJ,
        razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
        cnaePrincipal: "1921700",
      }),
    );
    expect(result.razaoSocial).toBe("PETROLEO BRASILEIRO S A PETROBRAS");
  });

  it("busca na BrasilAPI quando o snapshot está expirado", async () => {
    const expiredFetchedAt = new Date(Date.now() - 25 * 60 * 60 * 1000);
    vi.mocked(repository.findByCnpj).mockResolvedValue(
      createSnapshot({ fetchedAt: expiredFetchedAt }),
    );
    vi.mocked(client.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
    vi.mocked(repository.upsertSnapshot).mockResolvedValue(createSnapshot());
    const service = buildService({ client, repository, cacheTtlHours: 24 });

    await service.getCompanyData(VALID_CNPJ);

    expect(client.fetchCnpj).toHaveBeenCalled();
    expect(repository.upsertSnapshot).toHaveBeenCalled();
  });

  it("normaliza CNPJ com máscara antes de buscar", async () => {
    vi.mocked(repository.findByCnpj).mockResolvedValue(null);
    vi.mocked(client.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
    vi.mocked(repository.upsertSnapshot).mockResolvedValue(createSnapshot());
    const service = buildService({ client, repository });

    await service.getCompanyData("33.000.167/0001-01");

    expect(repository.findByCnpj).toHaveBeenCalledWith(VALID_CNPJ);
    expect(client.fetchCnpj).toHaveBeenCalledWith(VALID_CNPJ);
  });

  it("propaga CnpjNotFoundError do cliente quando BrasilAPI retorna 404", async () => {
    vi.mocked(repository.findByCnpj).mockResolvedValue(null);
    vi.mocked(client.fetchCnpj).mockRejectedValue(new CnpjNotFoundError(VALID_CNPJ));
    const service = buildService({ client, repository });

    await expect(service.getCompanyData(VALID_CNPJ)).rejects.toBeInstanceOf(
      CnpjNotFoundError,
    );
    expect(repository.upsertSnapshot).not.toHaveBeenCalled();
  });
});
