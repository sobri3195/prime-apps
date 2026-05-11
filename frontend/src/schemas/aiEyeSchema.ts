import { z } from "zod";

export const aiEyeSchema = z.object({
  chiefComplaint: z.string().min(3),
  symptoms: z.array(z.string()).min(1),
  duration: z.string().min(1),
  painLevel: z.number().min(0).max(10),
  blurredVision: z.boolean().default(false),
  traumaHistory: z.boolean().default(false),
  suddenVisionLoss: z.boolean().default(false),
  severeHeadacheNausea: z.boolean().default(false),
  contactLensUse: z.boolean().default(false),
  photophobia: z.boolean().default(false),
  discharge: z.boolean().default(false),
  oneEyeOnly: z.boolean().default(false),
  eyePhotoMetadata: z
    .object({
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      capturedAt: z.string().optional(),
    })
    .optional(),
});

export type AiEyeFormValues = z.infer<typeof aiEyeSchema>;

export type AiEyeRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
export type AiEyeRecommendedAction =
  | "SELF_CARE"
  | "ROUTINE_CHECK"
  | "PRIORITY_CHECK"
  | "EMERGENCY_NOW";

export type AiEyeScreeningResult = AiEyeFormValues & {
  id: string;
  riskScore: number;
  riskLevel: AiEyeRiskLevel;
  recommendedAction: AiEyeRecommendedAction;
  confidenceScore: number;
  hasEyePhoto: boolean;
  redFlags: Array<{ label: string; reason: string }>;
  riskFactors: Array<{ label: string; weight: number; reason: string }>;
  missingData: string[];
  sensitivityGuardrails: string[];
  specificityGuardrails: string[];
  recommendation: string;
  disclaimer: string;
  createdAt: string;
};
