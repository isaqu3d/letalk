import Fastify from "fastify";
import { env } from "./config/env";
import { prisma } from "./infra/db/prisma";
import {
  type BrasilApiClient,
  BrasilApiHttpClient,
} from "./infra/http/brasil-api.client";
import { buildLoggerOptions } from "./infra/logger/pino";
import { CnpjController } from "./modules/cnpj/cnpj.controller";
import { PrismaCnpjRepository } from "./modules/cnpj/cnpj.repository";
import { cnpjRoutes } from "./modules/cnpj/cnpj.routes";
import { CnpjService } from "./modules/cnpj/cnpj.service";
import { healthRoutes } from "./modules/health/health.routes";
import { LeadsController } from "./modules/leads/leads.controller";
import { PrismaLeadsRepository } from "./modules/leads/leads.repository";
import { leadsRoutes } from "./modules/leads/leads.routes";
import { LeadsService } from "./modules/leads/leads.service";
import { corsPlugin } from "./plugins/cors";
import { errorHandlerPlugin } from "./plugins/error-handler";
import { helmetPlugin } from "./plugins/helmet";
import { rateLimitPlugin } from "./plugins/rate-limit";

export interface BuildAppOptions {
  withRateLimit?: boolean;
  brasilApiClient?: BrasilApiClient;
}

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({
    logger: buildLoggerOptions({
      level: env.LOG_LEVEL,
      pretty: env.NODE_ENV === "development",
    }),
  });

  await app.register(errorHandlerPlugin);
  await app.register(helmetPlugin);
  await app.register(corsPlugin);

  const shouldEnableRateLimit = options.withRateLimit ?? env.NODE_ENV !== "test";
  if (shouldEnableRateLimit) {
    await app.register(rateLimitPlugin);
  }

  const brasilApiClient =
    options.brasilApiClient ??
    new BrasilApiHttpClient({ baseUrl: env.BRASIL_API_BASE_URL });
  const cnpjRepository = new PrismaCnpjRepository(prisma);
  const cnpjService = new CnpjService(brasilApiClient, cnpjRepository, {
    cacheTtlHours: env.CNPJ_CACHE_TTL_HOURS,
  });
  const cnpjController = new CnpjController(cnpjService);

  const leadsRepository = new PrismaLeadsRepository(prisma);
  const leadsService = new LeadsService(cnpjService, leadsRepository);
  const leadsController = new LeadsController(leadsService);

  await app.register(healthRoutes);
  await app.register(cnpjRoutes, { controller: cnpjController });
  await app.register(leadsRoutes, { controller: leadsController });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}

export type AppInstance = Awaited<ReturnType<typeof buildApp>>;
