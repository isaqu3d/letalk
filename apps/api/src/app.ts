import fastifySwagger from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./config/env";
import { redis } from "./infra/cache/redis";
import { prisma } from "./infra/db/prisma";
import {
  type BrasilApiClient,
  BrasilApiHttpClient,
} from "./infra/http/brasil-api.client";
import { buildLoggerOptions } from "./infra/logger/pino";
import { type CnpjCache, RedisCnpjCache } from "./modules/cnpj/cnpj.cache";
import { CnpjController } from "./modules/cnpj/cnpj.controller";
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

const SECONDS_IN_HOUR = 3600;

export interface BuildAppOptions {
  withRateLimit?: boolean;
  brasilApiClient?: BrasilApiClient;
  cnpjCache?: CnpjCache;
}

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({
    logger: buildLoggerOptions({
      level: env.LOG_LEVEL,
      pretty: env.NODE_ENV === "development",
    }),
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandlerPlugin);
  await app.register(helmetPlugin);
  await app.register(corsPlugin);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Letalk — API de Enriquecimento de Leads",
        description:
          "API para cadastro de leads enriquecidos com dados públicos de empresa (BrasilAPI).",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      tags: [
        { name: "Health", description: "Status da aplicação" },
        { name: "CNPJ", description: "Consulta de dados públicos de empresa" },
        { name: "Leads", description: "Cadastro e consulta de leads" },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(scalarApiReference, {
    routePrefix: "/docs",
    configuration: {
      theme: "purple",
      metaData: {
        title: "Letalk — API Reference",
      },
    },
  });

  const shouldEnableRateLimit = options.withRateLimit ?? env.NODE_ENV !== "test";
  if (shouldEnableRateLimit) {
    await app.register(rateLimitPlugin);
  }

  const brasilApiClient =
    options.brasilApiClient ??
    new BrasilApiHttpClient({ baseUrl: env.BRASIL_API_BASE_URL });
  const cnpjCache =
    options.cnpjCache ??
    new RedisCnpjCache(redis, env.CNPJ_CACHE_TTL_HOURS * SECONDS_IN_HOUR);
  const cnpjService = new CnpjService(brasilApiClient, cnpjCache);
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
