import { useQuery } from "@tanstack/react-query";
import { getLead } from "./get-lead";

export function useLead(id: string) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => getLead(id),
    enabled: id.length > 0,
  });
}
