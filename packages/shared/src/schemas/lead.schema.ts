import { z } from "zod";
import { cnpjSchema } from "./cnpj.schema";
import { contactSchema } from "./contact.schema";

export const createLeadInputSchema = contactSchema.extend({
  cnpj: cnpjSchema,
});

export type CreateLeadInput = z.infer<typeof createLeadInputSchema>;
