import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type {
  AiEyeFormValues,
  AiEyeScreeningResult,
} from "@/schemas/aiEyeSchema";

export function useAiScreenings() {
  return useQuery({
    queryKey: ["ai-screenings"],
    queryFn: () => api<AiEyeScreeningResult[]>("/ai-eye/screenings"),
  });
}

export function useCreateAiScreening() {
  return useMutation({
    mutationFn: (payload: AiEyeFormValues) =>
      api<AiEyeScreeningResult>("/ai-eye/screenings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
