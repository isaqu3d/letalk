import Fastify from "fastify";
import { env } from "./config/env";
import { buildLoggerOptions } from "./infra/logger/pino";
import { healthRoutes } from "./modules/health/health.routes";

export async function buildApp() {
  const app = Fastify({
    logger: buildLoggerOptions({
      level: env.LOG_LEVEL,
      pretty: env.NODE_ENV === "development",
    }),
  });

  await app.register(healthRoutes);

  return app;
}

export type AppInstance = Awaited<ReturnType<typeof buildApp>>;
