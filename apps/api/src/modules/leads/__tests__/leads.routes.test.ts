import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { type AppInstance, buildApp } from "../../../app";
import { prisma } from "../../../infra/db/prisma";
import type { BrasilApiClient } from "../../../infra/http/brasil-api.client";
import type { BrasilApiCnpjData } from "../../cnpj/brasil-api.schema";

const VALID_CNPJ = "33000167000101";

const RAW_PAYLOAD: BrasilApiCnpjData = {
  cnpj: VALID_CNPJ,
  razao_social: "PETROLEO BRASILEIRO S A PETROBRAS",
  nome_fantasia: "PETROBRAS",
  cnae_fiscal: 600001,
  cnae_fiscal_descricao: "Extração de petróleo e gás natural",
  capital_social: 205431960000,
  porte: "DEMAIS",
  descricao_situacao_cadastral: "ATIVA",
  data_inicio_atividade: "1966-09-28",
};

const VALID_PAYLOAD = {
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "(11) 98765-4321",
  cnpj: VALID_CNPJ,
  role: "Diretora Comercial",
};

describe("Leads endpoints", () => {
  let app: AppInstance;
  const brasilApiClient: BrasilApiClient = { fetchCnpj: vi.fn() };

  beforeAll(async () => {
    app = await buildApp({ withRateLimit: false, brasilApiClient });
  });

  afterEach(async () => {
    vi.mocked(brasilApiClient.fetchCnpj).mockReset();
    await prisma.lead.deleteMany();
    await prisma.companySnapshot.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /leads", () => {
    it("cria lead enriquecido e retorna 201", async () => {
      vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);

      const response = await app.inject({
        method: "POST",
        url: "/leads",
        payload: VALID_PAYLOAD,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json() as {
        id: string;
        name: string;
        segment: string;
        employeeRange: string;
        cnpj: string;
      };
      expect(body.id).toBeTruthy();
      expect(body.name).toBe("Maria Silva");
      expect(body.cnpj).toBe(VALID_CNPJ);
      expect(body.segment).toBe("Indústria");
      expect(body.employeeRange).toBe("250+");
    });

    it("retorna 409 com code DUPLICATE_LEAD ao cadastrar mesmo email+cnpj", async () => {
      vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);

      await app.inject({ method: "POST", url: "/leads", payload: VALID_PAYLOAD });
      const duplicate = await app.inject({
        method: "POST",
        url: "/leads",
        payload: VALID_PAYLOAD,
      });

      expect(duplicate.statusCode).toBe(409);
      expect(duplicate.json()).toMatchObject({ code: "DUPLICATE_LEAD" });
    });

    it("retorna 400 VALIDATION_ERROR quando faltam campos obrigatórios", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/leads",
        payload: { name: "Só nome" },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("retorna 400 VALIDATION_ERROR quando CNPJ é inválido", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/leads",
        payload: { ...VALID_PAYLOAD, cnpj: "11111111111111" },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
      expect(brasilApiClient.fetchCnpj).not.toHaveBeenCalled();
    });
  });

  describe("GET /leads", () => {
    it("retorna lista vazia quando não há leads", async () => {
      const response = await app.inject({ method: "GET", url: "/leads" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ items: [], total: 0 });
    });

    it("lista leads criados ordenados por createdAt desc", async () => {
      vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
      await app.inject({ method: "POST", url: "/leads", payload: VALID_PAYLOAD });
      await app.inject({
        method: "POST",
        url: "/leads",
        payload: { ...VALID_PAYLOAD, email: "outro@example.com" },
      });

      const response = await app.inject({ method: "GET", url: "/leads" });

      expect(response.statusCode).toBe(200);
      const body = response.json() as { items: Array<{ email: string }>; total: number };
      expect(body.total).toBe(2);
      expect(body.items).toHaveLength(2);
    });

    it("respeita parâmetros de paginação limit e offset", async () => {
      vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
      for (let attempt = 0; attempt < 3; attempt++) {
        await app.inject({
          method: "POST",
          url: "/leads",
          payload: { ...VALID_PAYLOAD, email: `lead${attempt}@example.com` },
        });
      }

      const response = await app.inject({
        method: "GET",
        url: "/leads?limit=2&offset=1",
      });

      const body = response.json() as { items: unknown[]; total: number };
      expect(body.items).toHaveLength(2);
      expect(body.total).toBe(3);
    });
  });

  describe("GET /leads/:id", () => {
    it("retorna 200 com snapshot incluído quando lead existe", async () => {
      vi.mocked(brasilApiClient.fetchCnpj).mockResolvedValue(RAW_PAYLOAD);
      const created = await app.inject({
        method: "POST",
        url: "/leads",
        payload: VALID_PAYLOAD,
      });
      const { id } = created.json() as { id: string };

      const response = await app.inject({ method: "GET", url: `/leads/${id}` });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        id: string;
        snapshot: { razaoSocial: string } | null;
      };
      expect(body.id).toBe(id);
      expect(body.snapshot?.razaoSocial).toBe(
        "PETROLEO BRASILEIRO S A PETROBRAS",
      );
    });

    it("retorna 404 com code LEAD_NOT_FOUND quando lead não existe", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/leads/non-existent-id",
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: "LEAD_NOT_FOUND" });
    });
  });
});
