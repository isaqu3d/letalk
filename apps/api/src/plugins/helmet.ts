import fastifyHelmet from "@fastify/helmet";
import type { FastifyPluginAsync } from "fastify";
import { env } from "../config/env";

export const helmetPlugin: FastifyPluginAsync = async (app) => {
  if (env.NODE_ENV !== "production") {
    return;
  }
  await app.register(fastifyHelmet);
};
