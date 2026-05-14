import { describe, expect, it } from "vitest";
import { formatCnpj, isValidCnpj, normalizeCnpj } from "../cnpj";

describe("normalizeCnpj", () => {
  it("remove pontos, barras e hífens", () => {
    expect(normalizeCnpj("11.222.333/0001-81")).toBe("11222333000181");
  });

  it("retorna string vazia quando não há dígitos", () => {
    expect(normalizeCnpj("abc/-.")).toBe("");
  });

  it("preserva string já normalizada", () => {
    expect(normalizeCnpj("11222333000181")).toBe("11222333000181");
  });
});

describe("formatCnpj", () => {
  it("formata um CNPJ válido em XX.XXX.XXX/XXXX-XX", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formata mesmo que a entrada já venha mascarada", () => {
    expect(formatCnpj("11.222.333/0001-81")).toBe("11.222.333/0001-81");
  });

  it("devolve a entrada original se não tiver 14 dígitos", () => {
    expect(formatCnpj("123")).toBe("123");
    expect(formatCnpj("")).toBe("");
  });
});

describe("isValidCnpj", () => {
  it.each([
    ["11.222.333/0001-81", "com máscara completa"],
    ["11222333000181", "só dígitos"],
    ["33.000.167/0001-01", "Petrobras com máscara"],
    ["33000167000101", "Petrobras só dígitos"],
  ])("aceita CNPJ com dígitos verificadores corretos (%s — %s)", (cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(true);
  });

  it("rejeita CNPJ com DV1 errado", () => {
    expect(isValidCnpj("11222333000171")).toBe(false);
  });

  it("rejeita CNPJ com DV2 errado", () => {
    expect(isValidCnpj("11222333000182")).toBe(false);
  });

  it("rejeita CNPJ com menos de 14 dígitos", () => {
    expect(isValidCnpj("1122233300018")).toBe(false);
  });

  it("rejeita CNPJ com mais de 14 dígitos", () => {
    expect(isValidCnpj("112223330001811")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isValidCnpj("")).toBe(false);
  });

  it("rejeita string só com caracteres não numéricos", () => {
    expect(isValidCnpj("abc.def.ghi/jklm-no")).toBe(false);
  });

  it.each([
    "00000000000000",
    "11111111111111",
    "22222222222222",
    "99999999999999",
  ])("rejeita CNPJ com todos os dígitos iguais (%s)", (cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(false);
  });
});
