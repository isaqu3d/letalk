import { useQuery } from "@tanstack/react-query";
import { type ListLeadsParams, listLeads } from "./list-leads";

export function useListLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => listLeads(params),
    placeholderData: (previous) => previous,
  });
}
