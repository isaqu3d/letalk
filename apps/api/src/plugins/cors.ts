import fastifyCors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import { env } from "../config/env";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    methods: ALLOWED_METHODS,
    credentials: true,
  });
};
