import { createLeadInputSchema } from "@letalk/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { HttpStatus } from "../../shared/http-status";
import type { LeadsService } from "./leads.service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const idParamsSchema = z.object({
  id: z.string().min(1, "id é obrigatório"),
});

const listQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createLeadInputSchema.parse(request.body);
    const lead = await this.leadsService.createLead(input);
    return reply.status(HttpStatus.CREATED).send(lead);
  }

  async list(request: FastifyRequest) {
    const { limit, offset } = listQuerySchema.parse(request.query);
    return this.leadsService.listLeads({ limit, offset });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>) {
    const { id } = idParamsSchema.parse(request.params);
    return this.leadsService.getLeadById(id);
  }
}
