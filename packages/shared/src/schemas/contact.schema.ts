import { z } from "zod";

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const ROLE_MIN_LENGTH = 2;
const ROLE_MAX_LENGTH = 80;
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 11;
const NON_DIGIT_PATTERN = /\D/g;

export const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, "Nome deve ter ao menos 2 caracteres")
  .max(NAME_MAX_LENGTH, "Nome deve ter no máximo 120 caracteres");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("E-mail inválido");

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(NON_DIGIT_PATTERN, ""))
  .refine(
    (digits) =>
      digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS,
    "Telefone deve ter 10 ou 11 dígitos (DDD + número)",
  );

export const contactRoleSchema = z
  .string()
  .trim()
  .min(ROLE_MIN_LENGTH, "Cargo deve ter ao menos 2 caracteres")
  .max(ROLE_MAX_LENGTH, "Cargo deve ter no máximo 80 caracteres");

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: contactRoleSchema.optional(),
});

export type Contact = z.infer<typeof contactSchema>;
