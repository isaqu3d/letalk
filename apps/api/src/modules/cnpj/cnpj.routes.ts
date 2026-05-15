import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { CnpjController } from "./cnpj.controller";
import {
  apiErrorResponseSchema,
  cnpjParamsSchema,
  companyDataResponseSchema,
  toCompanyDataResponse,
} from "./cnpj.openapi";

export interface CnpjRoutesOptions {
  controller: CnpjController;
}

export const cnpjRoutes: FastifyPluginAsyncZod<CnpjRoutesOptions> = async (
  app,
  options,
) => {
  app.get(
    "/cnpj/:cnpj",
    {
      schema: {
        tags: ["CNPJ"],
        summary: "Consulta dados públicos de uma empresa pelo CNPJ",
        description:
          "Consulta a BrasilAPI (com cache de 24h) e devolve os dados enriquecidos: razão social, CNAE, capital, porte, segmento derivado e faixa estimada de funcionários.",
        params: cnpjParamsSchema,
        response: {
          200: companyDataResponseSchema,
          400: apiErrorResponseSchema.describe("CNPJ inválido"),
          404: apiErrorResponseSchema.describe(
            "CNPJ não encontrado na BrasilAPI",
          ),
          502: apiErrorResponseSchema.describe("BrasilAPI indisponível"),
        },
      },
    },
    async (request, reply) => {
      const data = await options.controller.getCnpj(request, reply);
      return toCompanyDataResponse(data);
    },
  );
};
