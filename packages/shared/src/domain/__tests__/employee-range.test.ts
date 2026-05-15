import { describe, expect, it } from "vitest";
import { estimateEmployeeRange } from "../employee-range";

describe("estimateEmployeeRange", () => {
  it("retorna 1-9 para microempresa", () => {
    expect(
      estimateEmployeeRange({ porte: "MICRO EMPRESA", capitalSocial: 10_000 }),
    ).toBe("1-9");
  });

  it("retorna 1-9 mesmo com capital alto se for MICRO", () => {
    expect(
      estimateEmployeeRange({ porte: "Micro Empresa", capitalSocial: 5_000_000 }),
    ).toBe("1-9");
  });

  it("retorna 10-49 para empresa de pequeno porte", () => {
    expect(
      estimateEmployeeRange({
        porte: "EMPRESA DE PEQUENO PORTE",
        capitalSocial: 100_000,
      }),
    ).toBe("10-49");
  });

  it("retorna 50-249 para DEMAIS com capital abaixo de 1 milhão", () => {
    expect(
      estimateEmployeeRange({ porte: "DEMAIS", capitalSocial: 500_000 }),
    ).toBe("50-249");
  });

  it("retorna 250+ para DEMAIS com capital igual ou acima de 1 milhão", () => {
    expect(
      estimateEmployeeRange({ porte: "DEMAIS", capitalSocial: 1_000_000 }),
    ).toBe("250+");
    expect(
      estimateEmployeeRange({ porte: "DEMAIS", capitalSocial: 50_000_000 }),
    ).toBe("250+");
  });

  it("retorna 250+ para GRANDE com capital alto", () => {
    expect(
      estimateEmployeeRange({ porte: "GRANDE", capitalSocial: 2_000_000 }),
    ).toBe("250+");
  });

  it("retorna 50-249 para GRANDE com capital baixo", () => {
    expect(
      estimateEmployeeRange({ porte: "GRANDE", capitalSocial: 0 }),
    ).toBe("50-249");
  });

  it("trata capitalSocial null como zero", () => {
    expect(
      estimateEmployeeRange({ porte: "DEMAIS", capitalSocial: null }),
    ).toBe("50-249");
  });

  it("trata capitalSocial undefined como zero", () => {
    expect(
      estimateEmployeeRange({ porte: "DEMAIS", capitalSocial: undefined }),
    ).toBe("50-249");
  });

  it("retorna unknown quando porte é null", () => {
    expect(
      estimateEmployeeRange({ porte: null, capitalSocial: 100_000 }),
    ).toBe("unknown");
  });

  it("retorna unknown quando porte é undefined", () => {
    expect(
      estimateEmployeeRange({ porte: undefined, capitalSocial: 100_000 }),
    ).toBe("unknown");
  });

  it("retorna unknown quando porte é desconhecido", () => {
    expect(
      estimateEmployeeRange({ porte: "ALGO ESTRANHO", capitalSocial: 100_000 }),
    ).toBe("unknown");
  });
});
