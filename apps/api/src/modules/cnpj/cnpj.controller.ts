import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { CompanyData } from "./cnpj.mapper";
import type { CnpjService } from "./cnpj.service";

const paramsSchema = z.object({
  cnpj: z.string().min(1, "CNPJ obrigatório"),
});

export class CnpjController {
  constructor(private readonly cnpjService: CnpjService) {}

  async getCnpj(
    request: FastifyRequest<{ Params: { cnpj: string } }>,
    _reply: FastifyReply,
  ): Promise<CompanyData> {
    const { cnpj } = paramsSchema.parse(request.params);
    return this.cnpjService.getCompanyData(cnpj);
  }
}
