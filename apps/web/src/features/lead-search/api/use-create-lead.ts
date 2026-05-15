import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateLeadInput } from "@letalk/shared";
import type { ApiError } from "@/lib/api";
import { createLead } from "./create-lead";
import type { Lead } from "@/types/lead";

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation<Lead, ApiError, CreateLeadInput>({
    mutationFn: createLead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
