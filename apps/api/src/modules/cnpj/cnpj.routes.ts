import type { FastifyPluginAsync } from "fastify";
import type { CnpjController } from "./cnpj.controller";

export interface CnpjRoutesOptions {
  controller: CnpjController;
}

export const cnpjRoutes: FastifyPluginAsync<CnpjRoutesOptions> = async (
  app,
  options,
) => {
  app.get<{ Params: { cnpj: string } }>("/cnpj/:cnpj", async (request, reply) =>
    options.controller.getCnpj(request, reply),
  );
};
