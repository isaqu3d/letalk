import { describe, expect, it } from "vitest";
import { extractCnaeDivision, segmentFromCnae } from "../cnae-segments";

describe("extractCnaeDivision", () => {
  it("extrai os 2 primeiros dígitos de um código numérico", () => {
    expect(extractCnaeDivision("6201501")).toBe("62");
  });

  it("extrai dígitos ignorando pontuação", () => {
    expect(extractCnaeDivision("62.01-5/01")).toBe("62");
  });

  it("retorna null quando há menos de 2 dígitos", () => {
    expect(extractCnaeDivision("6")).toBeNull();
    expect(extractCnaeDivision("")).toBeNull();
    expect(extractCnaeDivision("abc")).toBeNull();
  });
});

describe("segmentFromCnae", () => {
  it.each([
    ["0111-3/01", "Agronegócio"],
    ["1011-2/01", "Indústria"],
    ["3511-5/01", "Utilities"],
    ["4120-4/00", "Construção"],
    ["4711-3/01", "Comércio"],
    ["4930-2/02", "Logística"],
    ["5510-8/01", "Hospitalidade"],
    ["6201-5/01", "Tecnologia"],
    ["6420-4/00", "Financeiro"],
    ["6810-2/01", "Imobiliário"],
    ["7020-4/00", "Serviços"],
    ["8411-6/00", "Setor Público"],
    ["8520-1/00", "Educação"],
    ["8610-1/01", "Saúde"],
    ["9001-9/01", "Cultura e Lazer"],
    ["9601-7/01", "Serviços"],
    ["9900-8/00", "Outros"],
  ])("mapeia código %s para segmento %s", (code, expectedSegment) => {
    expect(segmentFromCnae(code)).toBe(expectedSegment);
  });

  it("devolve Outros quando o código é null", () => {
    expect(segmentFromCnae(null)).toBe("Outros");
  });

  it("devolve Outros quando o código é undefined", () => {
    expect(segmentFromCnae(undefined)).toBe("Outros");
  });

  it("devolve Outros quando a divisão não está mapeada", () => {
    expect(segmentFromCnae("0400-0/00")).toBe("Outros");
  });

  it("devolve Outros para string sem dígitos", () => {
    expect(segmentFromCnae("xyz")).toBe("Outros");
  });
});
