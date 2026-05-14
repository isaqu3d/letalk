import { z } from "zod";
import { isValidCnpj, normalizeCnpj } from "../validation/cnpj";

export const cnpjSchema = z
  .string()
  .transform((value) => normalizeCnpj(value))
  .refine(isValidCnpj, "CNPJ inválido");

export type Cnpj = z.infer<typeof cnpjSchema>;
