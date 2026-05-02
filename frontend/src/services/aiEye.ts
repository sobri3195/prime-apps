import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { AiEyeFormValues } from '@/schemas/aiEyeSchema';

export function useAiScreenings() {
  return useQuery({
    queryKey: ['ai-screenings'],
    queryFn: () => api('/ai-eye/screenings'),
  });
}

export function useCreateAiScreening() {
  return useMutation({
    mutationFn: (payload: AiEyeFormValues) =>
      api('/ai-eye/screenings', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}
