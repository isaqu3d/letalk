import { isValidCnpj, normalizeCnpj } from "@letalk/shared";
import type { BrasilApiClient } from "../../infra/http/brasil-api.client";
import { InvalidCnpjError } from "./cnpj.errors";
import {
  type CompanyData,
  snapshotToCompanyData,
  toCompanyData,
} from "./cnpj.mapper";
import type { CnpjRepository } from "./cnpj.repository";

const HOUR_IN_MS = 60 * 60 * 1000;

export interface CnpjServiceConfig {
  cacheTtlHours: number;
}

export interface CompanyDataWithSnapshot {
  companyData: CompanyData;
  snapshotId: string;
}

export class CnpjService {
  constructor(
    private readonly brasilApiClient: BrasilApiClient,
    private readonly repository: CnpjRepository,
    private readonly config: CnpjServiceConfig,
  ) {}

  async getCompanyData(cnpjInput: string): Promise<CompanyData> {
    const { companyData } = await this.getCompanyDataWithSnapshot(cnpjInput);
    return companyData;
  }

  async getCompanyDataWithSnapshot(
    cnpjInput: string,
  ): Promise<CompanyDataWithSnapshot> {
    const cnpj = normalizeCnpj(cnpjInput);
    if (!isValidCnpj(cnpj)) {
      throw new InvalidCnpjError(cnpjInput);
    }

    const cached = await this.repository.findByCnpj(cnpj);
    if (cached !== null && this.isFresh(cached.fetchedAt)) {
      return {
        companyData: snapshotToCompanyData(cached),
        snapshotId: cached.id,
      };
    }

    const raw = await this.brasilApiClient.fetchCnpj(cnpj);
    const companyData = toCompanyData(raw);

    const snapshot = await this.repository.upsertSnapshot({
      cnpj,
      rawData: raw,
      razaoSocial: companyData.razaoSocial,
      nomeFantasia: companyData.nomeFantasia,
      cnaePrincipal: companyData.cnaePrincipal,
      cnaeDescription: companyData.cnaeDescription,
      capitalSocial: companyData.capitalSocial,
      porte: companyData.porte,
      situacao: companyData.situacao,
      dataAbertura: companyData.dataAbertura,
    });

    return { companyData, snapshotId: snapshot.id };
  }

  private isFresh(fetchedAt: Date): boolean {
    const ageMs = Date.now() - fetchedAt.getTime();
    return ageMs < this.config.cacheTtlHours * HOUR_IN_MS;
  }
}
