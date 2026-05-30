import { isValidCnpj, normalizeCnpj } from "@letalk/shared";
import type { BrasilApiClient } from "../../infra/http/brasil-api.client";
import type { CnpjCache } from "./cnpj.cache";
import { InvalidCnpjError } from "./cnpj.errors";
import { type CompanyData, toCompanyData } from "./cnpj.mapper";

export class CnpjService {
  constructor(
    private readonly brasilApiClient: BrasilApiClient,
    private readonly cache: CnpjCache,
  ) {}

  async getCompanyData(cnpjInput: string): Promise<CompanyData> {
    const cnpj = normalizeCnpj(cnpjInput);
    if (!isValidCnpj(cnpj)) {
      throw new InvalidCnpjError(cnpjInput);
    }

    const cached = await this.cache.get(cnpj);
    if (cached !== null) {
      return cached;
    }

    const raw = await this.brasilApiClient.fetchCnpj(cnpj);
    const companyData = toCompanyData(raw);
    await this.cache.set(cnpj, companyData);
    return companyData;
  }
}
