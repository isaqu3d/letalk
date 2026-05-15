import { describe, expect, it } from "vitest";
import { DomainError } from "../../../errors/base.error";
import {
  BrasilApiUnavailableError,
  CnpjNotFoundError,
  InvalidCnpjError,
} from "../cnpj.errors";

describe("InvalidCnpjError", () => {
  it("herda de DomainError com code, statusCode e mensagem contendo o CNPJ", () => {
    const error = new InvalidCnpjError("11.111.111/1111-11");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe("INVALID_CNPJ");
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain("11.111.111/1111-11");
  });
});

describe("CnpjNotFoundError", () => {
  it("herda de DomainError com statusCode 404", () => {
    const error = new CnpjNotFoundError("11222333000181");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe("CNPJ_NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.message).toContain("11222333000181");
  });
});

describe("BrasilApiUnavailableError", () => {
  it("herda de DomainError com statusCode 502 e reason na mensagem", () => {
    const error = new BrasilApiUnavailableError("HTTP 500");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe("BRASIL_API_UNAVAILABLE");
    expect(error.statusCode).toBe(502);
    expect(error.message).toContain("HTTP 500");
  });
});
