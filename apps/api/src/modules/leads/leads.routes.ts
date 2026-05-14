import type { FastifyPluginAsync } from "fastify";
import type { LeadsController } from "./leads.controller";

export interface LeadsRoutesOptions {
  controller: LeadsController;
}

export const leadsRoutes: FastifyPluginAsync<LeadsRoutesOptions> = async (
  app,
  options,
) => {
  app.post("/leads", async (request, reply) =>
    options.controller.create(request, reply),
  );

  app.get("/leads", async (request) => options.controller.list(request));

  app.get<{ Params: { id: string } }>("/leads/:id", async (request) =>
    options.controller.getById(request),
  );
};
