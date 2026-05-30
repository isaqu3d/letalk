import { describe, expect, it } from "vitest";
import type { BrasilApiCnpjData } from "../brasil-api.schema";
import { toCompanyData } from "../cnpj.mapper";

const baseRaw: BrasilApiCnpjData = {
  cnpj: "33000167000101",
  razao_social: "PETROLEO BRASILEIRO S A PETROBRAS",
  nome_fantasia: "PETROBRAS",
  cnae_fiscal: 1921700,
  cnae_fiscal_descricao: "Fabricação de produtos do refino de petróleo",
  capital_social: 205431960490.65,
  porte: "DEMAIS",
  descricao_situacao_cadastral: "ATIVA",
  data_inicio_atividade: "1953-10-03",
  logradouro: "REPUBLICA DO CHILE",
  numero: "65",
  complemento: "",
  bairro: "CENTRO",
  municipio: "RIO DE JANEIRO",
  uf: "RJ",
  cep: "20031170",
  qsa: [
    { nome_socio: "ANGELICA GARCIA COBAS LAUREANO", qualificacao_socio: "Diretor" },
    { nome_socio: "JOAO DA SILVA", qualificacao_socio: null },
  ],
};

describe("toCompanyData", () => {
  it("mapeia todos os campos relevantes da BrasilAPI", () => {
    const result = toCompanyData(baseRaw);

    expect(result.cnpj).toBe("33000167000101");
    expect(result.razaoSocial).toBe("PETROLEO BRASILEIRO S A PETROBRAS");
    expect(result.nomeFantasia).toBe("PETROBRAS");
    expect(result.cnaePrincipal).toBe("1921700");
    expect(result.cnaeDescription).toBe(
      "Fabricação de produtos do refino de petróleo",
    );
    expect(result.capitalSocial).toBe(205431960490.65);
    expect(result.porte).toBe("DEMAIS");
    expect(result.situacao).toBe("ATIVA");
    expect(result.dataAbertura).toEqual(new Date("1953-10-03"));
  });

  it("calcula segmento a partir do CNAE principal", () => {
    const result = toCompanyData(baseRaw);
    expect(result.segment).toBe("Indústria");
  });

  it("calcula faixa de funcionários com porte DEMAIS e capital alto", () => {
    const result = toCompanyData(baseRaw);
    expect(result.employeeRange).toBe("250+");
  });

  it("usa null para nomeFantasia ausente", () => {
    const result = toCompanyData({ ...baseRaw, nome_fantasia: null });
    expect(result.nomeFantasia).toBeNull();
  });

  it("usa null para campos opcionais não preenchidos", () => {
    const result = toCompanyData({
      cnpj: "33000167000101",
      razao_social: "EMPRESA TESTE",
    });

    expect(result.nomeFantasia).toBeNull();
    expect(result.cnaePrincipal).toBeNull();
    expect(result.cnaeDescription).toBeNull();
    expect(result.capitalSocial).toBeNull();
    expect(result.porte).toBeNull();
    expect(result.situacao).toBeNull();
    expect(result.dataAbertura).toBeNull();
    expect(result.segment).toBe("Outros");
    expect(result.employeeRange).toBe("unknown");
    expect(result.municipio).toBeNull();
    expect(result.socios).toEqual([]);
  });

  it("mapeia endereço e converte complemento vazio em null", () => {
    const result = toCompanyData(baseRaw);

    expect(result.logradouro).toBe("REPUBLICA DO CHILE");
    expect(result.numero).toBe("65");
    expect(result.complemento).toBeNull();
    expect(result.municipio).toBe("RIO DE JANEIRO");
    expect(result.uf).toBe("RJ");
    expect(result.cep).toBe("20031170");
  });

  it("mapeia sócios do quadro societário (qsa)", () => {
    const result = toCompanyData(baseRaw);

    expect(result.socios).toHaveLength(2);
    expect(result.socios[0]).toEqual({
      nome: "ANGELICA GARCIA COBAS LAUREANO",
      qualificacao: "Diretor",
    });
    expect(result.socios[1].qualificacao).toBeNull();
  });

  it("retorna null para dataAbertura quando string é inválida", () => {
    const result = toCompanyData({
      ...baseRaw,
      data_inicio_atividade: "data-invalida",
    });
    expect(result.dataAbertura).toBeNull();
  });

  it("calcula segmento Tecnologia para CNAE da divisão 62", () => {
    const result = toCompanyData({
      ...baseRaw,
      cnae_fiscal: 6201501,
    });
    expect(result.segment).toBe("Tecnologia");
    expect(result.cnaePrincipal).toBe("6201501");
  });

  it("preserva zero à esquerda do CNAE com padding para 7 dígitos", () => {
    const result = toCompanyData({
      ...baseRaw,
      cnae_fiscal: 600001,
    });
    expect(result.cnaePrincipal).toBe("0600001");
    expect(result.segment).toBe("Indústria");
  });
});
