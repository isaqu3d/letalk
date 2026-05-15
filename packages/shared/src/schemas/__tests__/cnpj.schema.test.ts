import { describe, expect, it } from "vitest";
import { cnpjSchema } from "../cnpj.schema";

describe("cnpjSchema", () => {
  it("normaliza CNPJ com máscara para apenas dígitos", () => {
    expect(cnpjSchema.parse("11.222.333/0001-81")).toBe("11222333000181");
  });

  it("aceita CNPJ válido só com dígitos", () => {
    expect(cnpjSchema.parse("33000167000101")).toBe("33000167000101");
  });

  it("rejeita CNPJ com dígito verificador errado", () => {
    expect(() => cnpjSchema.parse("11222333000182")).toThrow();
  });

  it("rejeita CNPJ com tamanho inválido", () => {
    expect(() => cnpjSchema.parse("123")).toThrow();
  });

  it("rejeita string vazia", () => {
    expect(() => cnpjSchema.parse("")).toThrow();
  });

  it("rejeita CNPJ com todos os dígitos iguais", () => {
    expect(() => cnpjSchema.parse("00000000000000")).toThrow();
  });
});
