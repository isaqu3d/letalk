import type { FastifyError } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { DomainError } from "../errors/base.error";

const INTERNAL_SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const CLIENT_ERROR_MIN = 400;
const CLIENT_ERROR_MAX = 499;

function formatZodIssues(zodError: ZodError): Array<{ path: string; message: string }> {
  return zodError.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function isFastifyClientError(error: FastifyError): boolean {
  return (
    typeof error.statusCode === "number" &&
    error.statusCode >= CLIENT_ERROR_MIN &&
    error.statusCode <= CLIENT_ERROR_MAX
  );
}

export const errorHandlerPlugin = fp(async (app) => {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    if (error instanceof DomainError) {
      request.log.warn(
        { code: error.code, statusCode: error.statusCode },
        error.message,
      );
      reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
      return;
    }

    if (error instanceof ZodError) {
      const issues = formatZodIssues(error);
      request.log.warn({ code: "VALIDATION_ERROR", issues }, "Validação falhou");
      reply.status(BAD_REQUEST).send({
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        issues,
      });
      return;
    }

    if (isFastifyClientError(error)) {
      request.log.warn(
        { code: error.code, statusCode: error.statusCode },
        error.message,
      );
      reply.status(error.statusCode ?? BAD_REQUEST).send({
        code: error.code ?? "BAD_REQUEST",
        message: error.message,
      });
      return;
    }

    request.log.error({ err: error }, "Erro não tratado");
    reply.status(INTERNAL_SERVER_ERROR).send({
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
    });
  });
});
