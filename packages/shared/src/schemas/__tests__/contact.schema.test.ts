import { describe, expect, it } from "vitest";
import {
  contactSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
} from "../contact.schema";

describe("nameSchema", () => {
  it("aceita nome válido", () => {
    expect(nameSchema.parse("Maria Silva")).toBe("Maria Silva");
  });

  it("faz trim de espaços nas pontas", () => {
    expect(nameSchema.parse("  João  ")).toBe("João");
  });

  it("rejeita nome com menos de 2 caracteres", () => {
    expect(() => nameSchema.parse("A")).toThrow();
  });

  it("rejeita nome com mais de 120 caracteres", () => {
    expect(() => nameSchema.parse("a".repeat(121))).toThrow();
  });
});

describe("emailSchema", () => {
  it("aceita e-mail válido e normaliza caixa", () => {
    expect(emailSchema.parse("Foo@Bar.COM")).toBe("foo@bar.com");
  });

  it("faz trim", () => {
    expect(emailSchema.parse("  user@host.io  ")).toBe("user@host.io");
  });

  it("rejeita e-mail sem @", () => {
    expect(() => emailSchema.parse("invalid")).toThrow();
  });

  it("rejeita e-mail vazio", () => {
    expect(() => emailSchema.parse("")).toThrow();
  });
});

describe("phoneSchema", () => {
  it("aceita telefone com 11 dígitos formatado e retorna só dígitos", () => {
    expect(phoneSchema.parse("(11) 91234-5678")).toBe("11912345678");
  });

  it("aceita telefone fixo com 10 dígitos", () => {
    expect(phoneSchema.parse("(11) 1234-5678")).toBe("1112345678");
  });

  it("aceita string só com dígitos", () => {
    expect(phoneSchema.parse("11987654321")).toBe("11987654321");
  });

  it("rejeita telefone com menos de 10 dígitos", () => {
    expect(() => phoneSchema.parse("123456789")).toThrow();
  });

  it("rejeita telefone com mais de 11 dígitos", () => {
    expect(() => phoneSchema.parse("119876543210")).toThrow();
  });

  it("rejeita string sem dígitos", () => {
    expect(() => phoneSchema.parse("abc-def")).toThrow();
  });
});

describe("contactSchema", () => {
  it("aceita payload completo com role opcional preenchido", () => {
    const parsed = contactSchema.parse({
      name: "Maria",
      email: "maria@example.com",
      phone: "(11) 91234-5678",
      role: "Diretora Comercial",
    });

    expect(parsed).toEqual({
      name: "Maria",
      email: "maria@example.com",
      phone: "11912345678",
      role: "Diretora Comercial",
    });
  });

  it("aceita payload sem role", () => {
    const parsed = contactSchema.parse({
      name: "João",
      email: "joao@example.com",
      phone: "11987654321",
    });

    expect(parsed.role).toBeUndefined();
  });

  it("trata role como ausente quando vier string vazia", () => {
    const parsed = contactSchema.parse({
      name: "João",
      email: "joao@example.com",
      phone: "11987654321",
      role: "",
    });

    expect(parsed.role).toBeUndefined();
  });

  it("trata role como ausente quando vier só espaços", () => {
    const parsed = contactSchema.parse({
      name: "João",
      email: "joao@example.com",
      phone: "11987654321",
      role: "   ",
    });

    expect(parsed.role).toBeUndefined();
  });

  it("ainda rejeita role com 1 caractere", () => {
    expect(() =>
      contactSchema.parse({
        name: "João",
        email: "joao@example.com",
        phone: "11987654321",
        role: "A",
      }),
    ).toThrow();
  });

  it("rejeita quando faltam campos obrigatórios", () => {
    expect(() =>
      contactSchema.parse({
        name: "Maria",
        email: "maria@example.com",
      }),
    ).toThrow();
  });
});
