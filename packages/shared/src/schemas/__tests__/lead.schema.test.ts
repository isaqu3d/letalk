import { describe, expect, it } from "vitest";
import { createLeadInputSchema } from "../lead.schema";

describe("createLeadInputSchema", () => {
  const validPayload = {
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "(11) 91234-5678",
    cnpj: "11.222.333/0001-81",
    role: "Diretora Comercial",
  };

  it("aceita payload completo e normaliza CNPJ + telefone", () => {
    const parsed = createLeadInputSchema.parse(validPayload);

    expect(parsed).toEqual({
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "11912345678",
      cnpj: "11222333000181",
      role: "Diretora Comercial",
    });
  });

  it("aceita payload sem role (campo opcional)", () => {
    const { role: _role, ...payloadWithoutRole } = validPayload;
    const parsed = createLeadInputSchema.parse(payloadWithoutRole);

    expect(parsed.role).toBeUndefined();
    expect(parsed.cnpj).toBe("11222333000181");
  });

  it("rejeita quando CNPJ é inválido", () => {
    expect(() =>
      createLeadInputSchema.parse({ ...validPayload, cnpj: "11222333000182" }),
    ).toThrow();
  });

  it("rejeita quando e-mail é inválido", () => {
    expect(() =>
      createLeadInputSchema.parse({ ...validPayload, email: "not-an-email" }),
    ).toThrow();
  });

  it("rejeita quando telefone é inválido", () => {
    expect(() =>
      createLeadInputSchema.parse({ ...validPayload, phone: "123" }),
    ).toThrow();
  });

  it("rejeita quando faltam campos obrigatórios", () => {
    expect(() =>
      createLeadInputSchema.parse({
        name: "Maria",
        email: "maria@example.com",
      }),
    ).toThrow();
  });
});
