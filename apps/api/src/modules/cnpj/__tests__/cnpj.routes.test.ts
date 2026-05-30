import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { type AppInstance, buildApp } from "../../../app";
import { prisma } from "../../../infra/db/prisma";
import type { BrasilApiClient } from "../../../infra/http/brasil-api.client";
import type { BrasilApiCnpjData } from "../brasil-api.schema";
import { InMemoryCnpjCache } from "../cnpj.cache";
import { BrasilApiUnavailableError, CnpjNotFoundError } from "../cnpj.errors";

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

describe("GET /cnpj/:cnpj", () => {
  let app: AppInstance;
  const brasilApiClient: BrasilApiClient = { fetchCnpj: vi.fn() };
  const cnpjCache = new InMemoryCnpjCache();

  beforeAll(async () => {
    app = await buildApp({ withRateLimit: false, brasilApiClient, cnpjCache });
  });

  afterEach(async () => {
    vi.mocked(brasilApiClient.fetchCnpj).mockReset();
    cnpjCache.clear();
    await prisma.lead.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it("retorna 200 com dados da empresa enriquecidos quando CNPJ é válido", async () => {
    vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);

    const response = await app.inject({
      method: "GET",
      url: `/cnpj/${VALID_CNPJ}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      cnpj: string;
      razaoSocial: string;
      segment: string;
      employeeRange: string;
    };
    expect(body.cnpj).toBe(VALID_CNPJ);
    expect(body.razaoSocial).toBe("PETROLEO BRASILEIRO S A PETROBRAS");
    expect(body.segment).toBe("Indústria");
    expect(body.employeeRange).toBe("250+");
  });

  it("aceita CNPJ com máscara no parâmetro (com slash URL-encoded)", async () => {
    vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);

    const response = await app.inject({
      method: "GET",
      url: "/cnpj/33.000.167%2F0001-01",
    });

    expect(response.statusCode).toBe(200);
  });

  it("retorna 400 com code INVALID_CNPJ quando CNPJ é inválido", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/cnpj/11111111111111",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "INVALID_CNPJ" });
    expect(brasilApiClient.fetchCnpj).not.toHaveBeenCalled();
  });

  it("retorna 404 com code CNPJ_NOT_FOUND quando BrasilAPI não encontra", async () => {
    vi.mocked(brasilApiClient.fetchCnpj).mockRejectedValue(
      new CnpjNotFoundError(VALID_CNPJ),
    );

    const response = await app.inject({
      method: "GET",
      url: `/cnpj/${VALID_CNPJ}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "CNPJ_NOT_FOUND" });
  });

  it("retorna 502 com code BRASIL_API_UNAVAILABLE quando BrasilAPI falha", async () => {
    vi.mocked(brasilApiClient.fetchCnpj).mockRejectedValue(
      new BrasilApiUnavailableError("HTTP 503"),
    );

    const response = await app.inject({
      method: "GET",
      url: `/cnpj/${VALID_CNPJ}`,
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({ code: "BRASIL_API_UNAVAILABLE" });
  });

  it("não chama BrasilAPI na segunda requisição (cache hit)", async () => {
    vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);

    await app.inject({ method: "GET", url: `/cnpj/${VALID_CNPJ}` });
    await app.inject({ method: "GET", url: `/cnpj/${VALID_CNPJ}` });

    expect(brasilApiClient.fetchCnpj).toHaveBeenCalledTimes(1);
  });
});
