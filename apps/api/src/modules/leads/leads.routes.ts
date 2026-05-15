import { createLeadInputSchema } from "@letalk/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { apiErrorResponseSchema } from "../cnpj/cnpj.openapi";
import type { LeadsController } from "./leads.controller";
import {
  leadIdParamsSchema,
  leadResponseSchema,
  listLeadsQuerySchema,
  listLeadsResponseSchema,
  toLeadResponse,
  toListLeadsResponse,
} from "./leads.openapi";

export interface LeadsRoutesOptions {
  controller: LeadsController;
}

export const leadsRoutes: FastifyPluginAsyncZod<LeadsRoutesOptions> = async (
  app,
  options,
) => {
  app.post(
    "/leads",
    {
      schema: {
        tags: ["Leads"],
        summary: "Cria um lead enriquecido com dados da empresa",
        description:
          "Recebe os dados de contato + CNPJ, consulta a BrasilAPI (ou cache), classifica por segmento e faixa de funcionários e devolve o lead criado com o snapshot completo da empresa.",
        body: createLeadInputSchema,
        response: {
          201: leadResponseSchema,
          400: apiErrorResponseSchema.describe(
            "Erro de validação ou CNPJ inválido",
          ),
          404: apiErrorResponseSchema.describe(
            "CNPJ não encontrado na BrasilAPI",
          ),
          409: apiErrorResponseSchema.describe(
            "Lead duplicado (mesmo e-mail e CNPJ já cadastrados)",
          ),
          502: apiErrorResponseSchema.describe("BrasilAPI indisponível"),
        },
      },
    },
    async (request, reply) => {
      const lead = await options.controller.create(request, reply);
      return lead === undefined ? undefined : toLeadResponse(lead);
    },
  );

  app.get(
    "/leads",
    {
      schema: {
        tags: ["Leads"],
        summary: "Lista leads paginados (mais recentes primeiro)",
        querystring: listLeadsQuerySchema,
        response: {
          200: listLeadsResponseSchema,
        },
      },
    },
    async (request) => {
      const result = await options.controller.list(request);
      return toListLeadsResponse(result);
    },
  );

  app.get(
    "/leads/:id",
    {
      schema: {
        tags: ["Leads"],
        summary: "Retorna os detalhes de um lead específico",
        params: leadIdParamsSchema,
        response: {
          200: leadResponseSchema,
          404: apiErrorResponseSchema.describe("Lead não encontrado"),
        },
      },
    },
    async (request) => {
      const lead = await options.controller.getById(request);
      return toLeadResponse(lead);
    },
  );
};
