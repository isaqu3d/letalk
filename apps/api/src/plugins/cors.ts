import fastifyCors from "@fastify/cors";
import fp from "fastify-plugin";
import { env } from "../config/env";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export const corsPlugin = fp(async (app) => {
  await app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    methods: ALLOWED_METHODS,
    credentials: true,
  });
});
