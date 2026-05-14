import fastifyRateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

const GLOBAL_MAX_REQUESTS = 60;
const GLOBAL_TIME_WINDOW = "1 minute";

export const rateLimitPlugin = fp(async (app) => {
  await app.register(fastifyRateLimit, {
    max: GLOBAL_MAX_REQUESTS,
    timeWindow: GLOBAL_TIME_WINDOW,
  });
});
