import { describe, expect, it, vi } from "vitest";
import {
  BrasilApiUnavailableError,
  CnpjNotFoundError,
} from "../../../modules/cnpj/cnpj.errors";
import { BrasilApiHttpClient } from "../brasil-api.client";

const SAMPLE_BASE_URL = "https://brasilapi.com.br/api";
const SAMPLE_CNPJ = "33000167000101";

const SAMPLE_PAYLOAD = {
  cnpj: SAMPLE_CNPJ,
  razao_social: "PETROLEO BRASILEIRO S A PETROBRAS",
  nome_fantasia: "PETROBRAS",
  cnae_fiscal: 1921700,
  cnae_fiscal_descricao: "Fabricação de produtos do refino de petróleo",
  capital_social: 205431960490.65,
  porte: "DEMAIS",
  descricao_situacao_cadastral: "ATIVA",
  data_inicio_atividade: "1953-10-03",
};

function createFetcherReturning(
  status: number,
  payload: unknown = {},
): typeof fetch {
  return vi.fn(async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("BrasilApiHttpClient.fetchCnpj", () => {
  it("retorna os dados parseados quando a BrasilAPI responde 200", async () => {
    const client = new BrasilApiHttpClient({
      baseUrl: SAMPLE_BASE_URL,
      fetcher: createFetcherReturning(200, SAMPLE_PAYLOAD),
    });

    const result = await client.fetchCnpj(SAMPLE_CNPJ);

    expect(result.cnpj).toBe(SAMPLE_CNPJ);
    expect(result.razao_social).toBe("PETROLEO BRASILEIRO S A PETROBRAS");
    expect(result.cnae_fiscal).toBe(1921700);
  });

  it("monta a URL no formato {baseUrl}/cnpj/v1/{cnpj}", async () => {
    const fetcher = createFetcherReturning(200, SAMPLE_PAYLOAD);
    const client = new BrasilApiHttpClient({
      baseUrl: SAMPLE_BASE_URL,
      fetcher,
    });

    await client.fetchCnpj(SAMPLE_CNPJ);

    expect(fetcher).toHaveBeenCalledWith(
      `${SAMPLE_BASE_URL}/cnpj/v1/${SAMPLE_CNPJ}`,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("remove barras finais do baseUrl ao montar a URL", async () => {
    const fetcher = createFetcherReturning(200, SAMPLE_PAYLOAD);
    const client = new BrasilApiHttpClient({
      baseUrl: `${SAMPLE_BASE_URL}///`,
      fetcher,
    });

    await client.fetchCnpj(SAMPLE_CNPJ);

    expect(fetcher).toHaveBeenCalledWith(
      `${SAMPLE_BASE_URL}/cnpj/v1/${SAMPLE_CNPJ}`,
      expect.anything(),
    );
  });

  it("lança CnpjNotFoundError quando a BrasilAPI responde 404", async () => {
    const client = new BrasilApiHttpClient({
      baseUrl: SAMPLE_BASE_URL,
      fetcher: createFetcherReturning(404, { message: "Not found" }),
    });

    await expect(client.fetchCnpj(SAMPLE_CNPJ)).rejects.toBeInstanceOf(
      CnpjNotFoundError,
    );
  });

  it("lança BrasilApiUnavailableError quando a BrasilAPI responde 5xx", async () => {
    const client = new BrasilApiHttpClient({
      baseUrl: SAMPLE_BASE_URL,
      fetcher: createFetcherReturning(503),
    });

    await expect(client.fetchCnpj(SAMPLE_CNPJ)).rejects.toBeInstanceOf(
      BrasilApiUnavailableError,
    );
  });

  it("lança BrasilApiUnavailableError quando o fetch dispara erro de rede", async () => {
    const failingFetcher: typeof fetch = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const client = new BrasilApiHttpClient({
      baseUrl: SAMPLE_BASE_URL,
      fetcher: failingFetcher,
    });

    await expect(client.fetchCnpj(SAMPLE_CNPJ)).rejects.toBeInstanceOf(
      BrasilApiUnavailableError,
    );
  });

  it("lança BrasilApiUnavailableError quando o request é abortado por timeout", async () => {
    const abortingFetcher: typeof fetch = vi.fn(async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      throw abortError;
    });
    const client = new BrasilApiHttpClient({
      baseUrl: SAMPLE_BASE_URL,
      fetcher: abortingFetcher,
      timeoutMs: 10,
    });

    await expect(client.fetchCnpj(SAMPLE_CNPJ)).rejects.toMatchObject({
      code: "BRASIL_API_UNAVAILABLE",
      message: expect.stringContaining("Timeout"),
    });
  });

  it("lança BrasilApiUnavailableError quando o payload não passa no schema Zod", async () => {
    const client = new BrasilApiHttpClient({
      baseUrl: SAMPLE_BASE_URL,
      fetcher: createFetcherReturning(200, { foo: "bar" }),
    });

    await expect(client.fetchCnpj(SAMPLE_CNPJ)).rejects.toBeInstanceOf(
      BrasilApiUnavailableError,
    );
  });
});
