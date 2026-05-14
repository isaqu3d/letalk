import Fastify from "fastify";
import { env } from "./config/env";
import { buildLoggerOptions } from "./infra/logger/pino";
import { healthRoutes } from "./modules/health/health.routes";
import { corsPlugin } from "./plugins/cors";
import { errorHandlerPlugin } from "./plugins/error-handler";
import { helmetPlugin } from "./plugins/helmet";
import { rateLimitPlugin } from "./plugins/rate-limit";

export interface BuildAppOptions {
  withRateLimit?: boolean;
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

  await app.register(healthRoutes);

  return app;
}

export type AppInstance = Awaited<ReturnType<typeof buildApp>>;
