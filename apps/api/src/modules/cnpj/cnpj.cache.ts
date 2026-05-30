import type { Redis } from "ioredis";
import type { CompanyData } from "./cnpj.mapper";

export interface CnpjCache {
  get(cnpj: string): Promise<CompanyData | null>;
  set(cnpj: string, data: CompanyData): Promise<void>;
}

const CACHE_KEY_PREFIX = "cnpj:";

type SerializedCompanyData = Omit<CompanyData, "dataAbertura"> & {
  dataAbertura: string | null;
};

function reviveCompanyData(serialized: SerializedCompanyData): CompanyData {
  return {
    ...serialized,
    dataAbertura:
      serialized.dataAbertura === null
        ? null
        : new Date(serialized.dataAbertura),
  };
}

function keyFor(cnpj: string): string {
  return `${CACHE_KEY_PREFIX}${cnpj}`;
}

export class RedisCnpjCache implements CnpjCache {
  constructor(
    private readonly redis: Redis,
    private readonly ttlSeconds: number,
  ) {}

  async get(cnpj: string): Promise<CompanyData | null> {
    const cached = await this.redis.get(keyFor(cnpj));
    if (cached === null) {
      return null;
    }
    return reviveCompanyData(JSON.parse(cached) as SerializedCompanyData);
  }

  async set(cnpj: string, data: CompanyData): Promise<void> {
    await this.redis.set(keyFor(cnpj), JSON.stringify(data), "EX", this.ttlSeconds);
  }
}

export class InMemoryCnpjCache implements CnpjCache {
  private readonly store = new Map<string, CompanyData>();

  async get(cnpj: string): Promise<CompanyData | null> {
    return this.store.get(cnpj) ?? null;
  }

  async set(cnpj: string, data: CompanyData): Promise<void> {
    this.store.set(cnpj, data);
  }

  clear(): void {
    this.store.clear();
  }
}
