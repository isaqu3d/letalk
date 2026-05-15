import type { FastifyError } from "fastify";
import fp from "fastify-plugin";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { DomainError } from "../errors/base.error";
import {
  CLIENT_ERROR_MAX,
  CLIENT_ERROR_MIN,
  HttpStatus,
} from "../shared/http-status";

function formatZodIssues(zodError: ZodError): Array<{ path: string; message: string }> {
  return zodError.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function formatFastifyZodIssues(
  validation: ReadonlyArray<{
    instancePath?: string;
    message?: string;
  }>,
): Array<{ path: string; message: string }> {
  return validation.map((issue) => ({
    path: (issue.instancePath ?? "").replace(/^\//, "").replace(/\//g, "."),
    message: issue.message ?? "Valor inválido",
  }));
}

function isFastifyClientError(error: FastifyError): boolean {
  return (
    typeof error.statusCode === "number" &&
    error.statusCode >= CLIENT_ERROR_MIN &&
    error.statusCode <= CLIENT_ERROR_MAX
  );
}

interface ErrorPayload {
  code: string;
  message: string;
  statusCode: number;
  issues: Array<{ path: string; message: string }>;
}

const buildPayload = (
  code: string,
  message: string,
  statusCode: number,
  issues: Array<{ path: string; message: string }> = [],
): ErrorPayload => ({ code, message, statusCode, issues });

export const errorHandlerPlugin = fp(async (app) => {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    if (error instanceof DomainError) {
      request.log.warn(
        { code: error.code, statusCode: error.statusCode },
        error.message,
      );
      reply
        .status(error.statusCode)
        .send(buildPayload(error.code, error.message, error.statusCode));
      return;
    }

    if (error instanceof ZodError) {
      const issues = formatZodIssues(error);
      request.log.warn({ code: "VALIDATION_ERROR", issues }, "Validação falhou");
      reply
        .status(HttpStatus.BAD_REQUEST)
        .send(
          buildPayload(
            "VALIDATION_ERROR",
            "Dados inválidos",
            HttpStatus.BAD_REQUEST,
            issues,
          ),
        );
      return;
    }

    if (hasZodFastifySchemaValidationErrors(error)) {
      const issues = formatFastifyZodIssues(error.validation);
      request.log.warn({ code: "VALIDATION_ERROR", issues }, "Validação falhou");
      reply
        .status(HttpStatus.BAD_REQUEST)
        .send(
          buildPayload(
            "VALIDATION_ERROR",
            "Dados inválidos",
            HttpStatus.BAD_REQUEST,
            issues,
          ),
        );
      return;
    }

    if (isFastifyClientError(error)) {
      const statusCode = error.statusCode ?? HttpStatus.BAD_REQUEST;
      request.log.warn(
        { code: error.code, statusCode },
        error.message,
      );
      reply
        .status(statusCode)
        .send(
          buildPayload(
            error.code ?? "CLIENT_ERROR",
            error.message,
            statusCode,
          ),
        );
      return;
    }

    request.log.error({ err: error }, "Erro não tratado");
    reply
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(
        buildPayload(
          "INTERNAL_ERROR",
          "Erro interno do servidor",
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
  });
});
