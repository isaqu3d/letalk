import { z } from "zod";

const brasilApiSocioSchema = z
  .object({
    nome_socio: z.string(),
    qualificacao_socio: z.string().nullable().optional(),
  })
  .passthrough();

export const brasilApiCnpjSchema = z
  .object({
    cnpj: z.string(),
    razao_social: z.string(),
    nome_fantasia: z.string().nullable().optional(),
    cnae_fiscal: z.number().nullable().optional(),
    cnae_fiscal_descricao: z.string().nullable().optional(),
    capital_social: z.number().nullable().optional(),
    porte: z.string().nullable().optional(),
    descricao_situacao_cadastral: z.string().nullable().optional(),
    data_inicio_atividade: z.string().nullable().optional(),
    logradouro: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    complemento: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    municipio: z.string().nullable().optional(),
    uf: z.string().nullable().optional(),
    cep: z.string().nullable().optional(),
    qsa: z.array(brasilApiSocioSchema).nullable().optional(),
  })
  .passthrough();

export type BrasilApiCnpjData = z.infer<typeof brasilApiCnpjSchema>;
