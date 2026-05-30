import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrasilApiClient } from "../../../infra/http/brasil-api.client";
import type { BrasilApiCnpjData } from "../brasil-api.schema";
import type { CnpjCache } from "../cnpj.cache";
import { CnpjNotFoundError, InvalidCnpjError } from "../cnpj.errors";
import { type CompanyData, toCompanyData } from "../cnpj.mapper";
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

const CACHED_COMPANY: CompanyData = toCompanyData(RAW_PAYLOAD);

function buildService(deps: {
  client: BrasilApiClient;
  cache: CnpjCache;
}): CnpjService {
  return new CnpjService(deps.client, deps.cache);
}

describe("CnpjService.getCompanyData", () => {
  let client: BrasilApiClient;
  let cache: CnpjCache;

  beforeEach(() => {
    client = { fetchCnpj: vi.fn() };
    cache = { get: vi.fn(), set: vi.fn() };
  });

  it("lança InvalidCnpjError quando o CNPJ não passa no algoritmo", async () => {
    const service = buildService({ client, cache });

    await expect(service.getCompanyData("11111111111111")).rejects.toBeInstanceOf(
      InvalidCnpjError,
    );
    expect(client.fetchCnpj).not.toHaveBeenCalled();
    expect(cache.get).not.toHaveBeenCalled();
  });

  it("retorna dados do cache quando há entrada fresca", async () => {
    vi.mocked(cache.get).mockResolvedValue(CACHED_COMPANY);
    const service = buildService({ client, cache });

    const result = await service.getCompanyData(VALID_CNPJ);

    expect(result.razaoSocial).toBe("PETROLEO BRASILEIRO S A PETROBRAS");
    expect(result.segment).toBe("Indústria");
    expect(result.employeeRange).toBe("250+");
    expect(client.fetchCnpj).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("busca na BrasilAPI e popula o cache quando não há entrada", async () => {
    vi.mocked(cache.get).mockResolvedValue(null);
    vi.mocked(client.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
    const service = buildService({ client, cache });

    const result = await service.getCompanyData(VALID_CNPJ);

    expect(client.fetchCnpj).toHaveBeenCalledWith(VALID_CNPJ);
    expect(cache.set).toHaveBeenCalledWith(
      VALID_CNPJ,
      expect.objectContaining({
        cnpj: VALID_CNPJ,
        razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
        cnaePrincipal: "1921700",
      }),
    );
    expect(result.razaoSocial).toBe("PETROLEO BRASILEIRO S A PETROBRAS");
  });

  it("normaliza CNPJ com máscara antes de buscar", async () => {
    vi.mocked(cache.get).mockResolvedValue(null);
    vi.mocked(client.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
    const service = buildService({ client, cache });

    await service.getCompanyData("33.000.167/0001-01");

    expect(cache.get).toHaveBeenCalledWith(VALID_CNPJ);
    expect(client.fetchCnpj).toHaveBeenCalledWith(VALID_CNPJ);
  });

  it("propaga CnpjNotFoundError do cliente quando BrasilAPI retorna 404", async () => {
    vi.mocked(cache.get).mockResolvedValue(null);
    vi.mocked(client.fetchCnpj).mockRejectedValue(new CnpjNotFoundError(VALID_CNPJ));
    const service = buildService({ client, cache });

    await expect(service.getCompanyData(VALID_CNPJ)).rejects.toBeInstanceOf(
      CnpjNotFoundError,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
