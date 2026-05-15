import { apiRequest } from "@/lib/api";
import type { Lead } from "@/types/lead";

export async function getLead(id: string): Promise<Lead> {
  return apiRequest<Lead>(`/leads/${id}`);
}
