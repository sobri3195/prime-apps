import { Injectable, NotFoundException } from "@nestjs/common";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
type RecommendedAction =
  | "SELF_CARE"
  | "ROUTINE_CHECK"
  | "PRIORITY_CHECK"
  | "EMERGENCY_NOW";

type ScreeningPayload = Record<string, unknown> & {
  symptoms?: string[];
  painLevel?: number;
  blurredVision?: boolean;
  traumaHistory?: boolean;
  suddenVisionLoss?: boolean;
  severeHeadacheNausea?: boolean;
  contactLensUse?: boolean;
  photophobia?: boolean;
  discharge?: boolean;
  oneEyeOnly?: boolean;
  duration?: string;
  chiefComplaint?: string;
  eyePhotoMetadata?: Record<string, unknown>;
};

const emergencyRules: Array<{
  key: keyof ScreeningPayload;
  label: string;
  reason: string;
}> = [
  {
    key: "suddenVisionLoss",
    label: "Penurunan penglihatan mendadak",
    reason:
      "Penurunan penglihatan mendadak perlu dianggap gawat sampai terbukti aman oleh dokter mata.",
  },
  {
    key: "traumaHistory",
    label: "Riwayat trauma mata",
    reason:
      "Trauma dapat menyebabkan luka kornea, perdarahan, atau cedera intraokular yang tidak aman dipantau mandiri.",
  },
  {
    key: "severeHeadacheNausea",
    label: "Nyeri kepala hebat/mual dengan keluhan mata",
    reason:
      "Kombinasi nyeri mata, sakit kepala hebat, mual, atau muntah dapat mengarah ke kondisi akut yang perlu evaluasi segera.",
  },
];

const weightedRiskFactors: Array<{
  key: keyof ScreeningPayload;
  label: string;
  weight: number;
  reason: string;
}> = [
  {
    key: "blurredVision",
    label: "Pandangan buram",
    weight: 4,
    reason:
      "Pandangan buram meningkatkan prioritas karena dapat terkait gangguan kornea, tekanan bola mata, retina, atau saraf mata.",
  },
  {
    key: "photophobia",
    label: "Silau/sensitif cahaya",
    weight: 3,
    reason:
      "Sensitif cahaya bersama mata merah/nyeri dapat menjadi tanda iritasi kornea atau peradangan intraokular.",
  },
  {
    key: "contactLensUse",
    label: "Penggunaan lensa kontak",
    weight: 3,
    reason:
      "Keluhan pada pengguna lensa kontak perlu lebih waspada terhadap infeksi kornea.",
  },
  {
    key: "discharge",
    label: "Kotoran mata berlebih",
    weight: 2,
    reason:
      "Kotoran mata berlebih dapat mendukung kemungkinan infeksi atau peradangan yang perlu terapi tepat.",
  },
  {
    key: "oneEyeOnly",
    label: "Keluhan dominan satu mata",
    weight: 1,
    reason:
      "Keluhan satu mata lebih memerlukan korelasi klinis dibanding keluhan ringan bilateral.",
  },
];

function hasTextValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeSymptoms(symptoms: unknown) {
  return Array.isArray(symptoms)
    ? symptoms.map((symptom) => String(symptom).toLowerCase())
    : [];
}

function includesSymptom(symptoms: string[], keyword: string) {
  return symptoms.some((symptom) => symptom.includes(keyword));
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "ya"].includes(normalized);
  }
  return false;
}

@Injectable()
export class AiEyeService {
  private data: Array<Record<string, unknown>> = [];

  createScreening(payload: ScreeningPayload) {
    const rawPainLevel = Number(payload.painLevel ?? 0);
    const painLevel = Number.isFinite(rawPainLevel)
      ? Math.min(10, Math.max(0, rawPainLevel))
      : 0;
    const symptoms = normalizeSymptoms(payload.symptoms);
    const hasEyePhoto = Boolean(payload.eyePhotoMetadata);
    const sanitizedFlags = {
      blurredVision: parseBoolean(payload.blurredVision),
      traumaHistory: parseBoolean(payload.traumaHistory),
      suddenVisionLoss: parseBoolean(payload.suddenVisionLoss),
      severeHeadacheNausea: parseBoolean(payload.severeHeadacheNausea),
      contactLensUse: parseBoolean(payload.contactLensUse),
      photophobia: parseBoolean(payload.photophobia),
      discharge: parseBoolean(payload.discharge),
      oneEyeOnly: parseBoolean(payload.oneEyeOnly),
    };
    const triggeredEmergencyRules = emergencyRules.filter((rule) =>
      parseBoolean(payload[rule.key]),
    );
    const triggeredWeightedFactors = weightedRiskFactors.filter((factor) =>
      parseBoolean(payload[factor.key]),
    );
    const symptomRisk =
      (includesSymptom(symptoms, "nyeri") ? 2 : 0) +
      (includesSymptom(symptoms, "merah") ? 1 : 0) +
      (includesSymptom(symptoms, "bengkak") ? 1 : 0) +
      (includesSymptom(symptoms, "silau") ? 2 : 0);
    const weightedScore = triggeredWeightedFactors.reduce(
      (total, factor) => total + factor.weight,
      0,
    );
    const riskScore =
      painLevel +
      symptomRisk +
      weightedScore +
      (triggeredEmergencyRules.length > 0 ? 10 : 0);

    let riskLevel: RiskLevel = "LOW";
    let recommendedAction: RecommendedAction = "SELF_CARE";

    if (
      triggeredEmergencyRules.length > 0 ||
      painLevel >= 9 ||
      (sanitizedFlags.blurredVision && painLevel >= 7)
    ) {
      riskLevel = "EMERGENCY";
      recommendedAction = "EMERGENCY_NOW";
    } else if (
      riskScore >= 11 ||
      (sanitizedFlags.contactLensUse &&
        (sanitizedFlags.photophobia || sanitizedFlags.blurredVision || painLevel >= 5))
    ) {
      riskLevel = "HIGH";
      recommendedAction = "PRIORITY_CHECK";
    } else if (riskScore >= 6 || painLevel >= 5 || sanitizedFlags.blurredVision) {
      riskLevel = "MEDIUM";
      recommendedAction = "ROUTINE_CHECK";
    }

    const missingData = [
      !hasTextValue(payload.chiefComplaint) ? "keluhan utama" : null,
      !hasTextValue(payload.duration) ? "durasi" : null,
      symptoms.length === 0 ? "gejala tambahan" : null,
      !hasEyePhoto ? "foto mata" : null,
    ].filter(Boolean);
    const confidenceScore = Math.max(
      55,
      Math.min(
        96,
        96 -
          missingData.length * 8 -
          (hasEyePhoto ? 0 : 5) -
          (riskLevel === "EMERGENCY" ? 0 : 3),
      ),
    );
    const sensitivityGuardrails = [
      "Pertanyaan red flag diberi bobot tinggi agar kasus gawat tidak tersaring sebagai risiko rendah.",
      "Pengguna lensa kontak dinaikkan prioritas bila disertai nyeri, buram, atau silau.",
      "Nyeri berat atau buram dengan nyeri sedang-berat otomatis memicu rekomendasi segera.",
    ];
    const specificityGuardrails = [
      "Skor risiko menggabungkan intensitas, kombinasi gejala, dan kualitas data agar keluhan ringan tidak selalu menjadi gawat.",
      "Confidence diturunkan bila data kurang lengkap sehingga hasil tidak terlihat terlalu pasti.",
      "Foto hanya meningkatkan kelengkapan data; keputusan tetap berbasis red flag klinis yang dilaporkan pasien.",
    ];

    const recommendationByAction: Record<RecommendedAction, string> = {
      EMERGENCY_NOW:
        "Segera ke IGD/fasilitas kesehatan mata hari ini. Jangan menunda bila ada penurunan penglihatan, trauma, nyeri hebat, mual, atau muntah.",
      PRIORITY_CHECK:
        "Booking pemeriksaan prioritas dalam 24 jam, terutama bila keluhan memburuk atau Anda memakai lensa kontak.",
      ROUTINE_CHECK:
        "Disarankan booking pemeriksaan dokter mata. Pantau gejala dan percepat kunjungan bila muncul red flag.",
      SELF_CARE:
        "Edukasi mandiri, istirahatkan mata, hindari mengucek mata, dan monitor gejala. Periksa bila menetap atau memburuk.",
    };

    const result = {
      id: crypto.randomUUID(),
      ...payload,
      ...sanitizedFlags,
      symptoms,
      painLevel,
      riskScore,
      riskLevel,
      recommendedAction,
      confidenceScore,
      hasEyePhoto,
      redFlags: triggeredEmergencyRules.map(({ label, reason }) => ({
        label,
        reason,
      })),
      riskFactors: triggeredWeightedFactors.map(
        ({ label, weight, reason }) => ({ label, weight, reason }),
      ),
      missingData,
      sensitivityGuardrails,
      specificityGuardrails,
      recommendation: recommendationByAction[recommendedAction],
      disclaimer:
        "AI Mata adalah alat screening/triase awal, bukan diagnosis. Diagnosis dan terapi final hanya oleh dokter mata.",
      createdAt: new Date().toISOString(),
    };

    this.data.push(result);
    return result;
  }

  getScreenings() {
    return [...this.data].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  getScreeningById(id: string) {
    const screening = this.data.find((row) => row.id === id);
    if (!screening) {
      throw new NotFoundException(`Screening dengan id ${id} tidak ditemukan.`);
    }
    return screening;
  }
}
