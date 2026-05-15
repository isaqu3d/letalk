import { apiRequest } from "@/lib/api";
import type { CreateLeadInput } from "@letalk/shared";
import type { Lead } from "@/types/lead";

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  return apiRequest<Lead>("/leads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
