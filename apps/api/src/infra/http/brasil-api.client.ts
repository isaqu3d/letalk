import {
  type BrasilApiCnpjData,
  brasilApiCnpjSchema,
} from "../../modules/cnpj/brasil-api.schema";
import {
  BrasilApiUnavailableError,
  CnpjNotFoundError,
} from "../../modules/cnpj/cnpj.errors";
import { HttpStatus } from "../../shared/http-status";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_HEADERS = {
  "User-Agent": "letalk-cnpj-enricher/1.0",
  Accept: "application/json",
};

export interface BrasilApiClient {
  fetchCnpj(cnpj: string): Promise<BrasilApiCnpjData>;
}

export interface BrasilApiHttpClientConfig {
  baseUrl: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

export class BrasilApiHttpClient implements BrasilApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(config: BrasilApiHttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.fetcher = config.fetcher ?? fetch;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async fetchCnpj(cnpj: string): Promise<BrasilApiCnpjData> {
    const url = `${this.baseUrl}/cnpj/v1/${cnpj}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetcher(url, {
        signal: controller.signal,
        headers: DEFAULT_HEADERS,
      });

      if (response.status === HttpStatus.NOT_FOUND) {
        throw new CnpjNotFoundError(cnpj);
      }

      if (!response.ok) {
        throw new BrasilApiUnavailableError(
          `HTTP ${response.status} ao consultar CNPJ`,
        );
      }

      const payload: unknown = await response.json();
      return brasilApiCnpjSchema.parse(payload);
    } catch (error) {
      if (
        error instanceof CnpjNotFoundError ||
        error instanceof BrasilApiUnavailableError
      ) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new BrasilApiUnavailableError("Timeout ao consultar BrasilAPI");
      }
      const reason = error instanceof Error ? error.message : "Erro desconhecido";
      throw new BrasilApiUnavailableError(reason);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
