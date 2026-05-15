import { apiRequest } from "@/lib/api";
import type { PaginatedLeads } from "@/types/lead";

export interface ListLeadsParams {
  limit: number;
  offset: number;
}

export async function listLeads(
  params: ListLeadsParams,
): Promise<PaginatedLeads> {
  const search = new URLSearchParams({
    limit: params.limit.toString(),
    offset: params.offset.toString(),
  });
  return apiRequest<PaginatedLeads>(`/leads?${search.toString()}`);
}
