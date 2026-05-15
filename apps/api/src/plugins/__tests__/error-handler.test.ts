import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { DomainError } from "../../errors/base.error";
import { errorHandlerPlugin } from "../error-handler";

class FakeNotFoundError extends DomainError {
  constructor(resource: string) {
    super({
      code: "FAKE_NOT_FOUND",
      statusCode: 404,
      message: `Recurso ${resource} não encontrado`,
    });
  }
}

interface FastifyClientErrorWithCode extends Error {
  statusCode: number;
  code: string;
}

function createClientError(): FastifyClientErrorWithCode {
  const error = new Error("Limite excedido") as FastifyClientErrorWithCode;
  error.statusCode = 429;
  error.code = "FST_ERR_RATE_LIMIT";
  return error;
}

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  await app.register(errorHandlerPlugin);

  app.get("/throw-domain", async () => {
    throw new FakeNotFoundError("lead");
  });

  app.get("/throw-zod", async () => {
    const schema = z.object({ foo: z.string() });
    schema.parse({ foo: 123 });
    return { ok: true };
  });

  app.get("/throw-generic", async () => {
    throw new Error("Falha inesperada com detalhes internos");
  });

  app.get("/throw-fastify-client", async () => {
    throw createClientError();
  });

  return app;
}

describe("errorHandlerPlugin", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("mapeia DomainError para statusCode e code declarados", async () => {
    const response = await app.inject({ method: "GET", url: "/throw-domain" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      code: "FAKE_NOT_FOUND",
      message: "Recurso lead não encontrado",
    });
  });

  it("mapeia ZodError para 400 com lista de issues", async () => {
    const response = await app.inject({ method: "GET", url: "/throw-zod" });

    expect(response.statusCode).toBe(400);
    const body = response.json() as {
      code: string;
      message: string;
      issues: Array<{ path: string; message: string }>;
    };
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.message).toBe("Dados inválidos");
    expect(body.issues).toHaveLength(1);
    expect(body.issues[0]?.path).toBe("foo");
  });

  it("não vaza mensagem de erro genérico ao cliente (retorna 500 padrão)", async () => {
    const response = await app.inject({ method: "GET", url: "/throw-generic" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
    });
  });

  it("respeita statusCode 4xx de erros do Fastify (ex: rate limit)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/throw-fastify-client",
    });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toEqual({
      code: "FST_ERR_RATE_LIMIT",
      message: "Limite excedido",
    });
  });
});
