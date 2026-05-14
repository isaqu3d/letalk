import fastifyHelmet from "@fastify/helmet";
import fp from "fastify-plugin";
import { env } from "../config/env";

export const helmetPlugin = fp(async (app) => {
  if (env.NODE_ENV !== "production") {
    return;
  }
  await app.register(fastifyHelmet);
});
