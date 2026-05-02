import { z } from 'zod';

export const aiEyeSchema = z.object({
  chiefComplaint: z.string().min(3),
  symptoms: z.array(z.string()).min(1),
  duration: z.string().min(1),
  painLevel: z.number().min(0).max(10),
  blurredVision: z.boolean().default(false),
  traumaHistory: z.boolean().default(false),
});

export type AiEyeFormValues = z.infer<typeof aiEyeSchema>;
