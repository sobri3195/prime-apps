export type RiskLevel = "Rendah" | "Sedang" | "Tinggi" | "Darurat";

export type DurationOption = "Hari ini" | "1–3 hari" | "4–7 hari" | "Lebih dari 1 minggu";
export type CameraPermission = "idle" | "granted" | "denied";
export type CameraMode = "front" | "back";
export type SelectedEye = "kanan" | "kiri" | "keduanya";
export type ImageQuality = "good" | "medium" | "poor";

export type CameraAnalysis = {
  rednessDetected: boolean;
  swellingDetected: boolean;
  wateryEyeDetected: boolean;
  dischargeDetected: boolean;
  eyelidIssueDetected: boolean;
  visualNote: string;
};

export type AIAnalysisInput = {
  complaintText: string;
  selectedSymptoms: string[];
  duration: DurationOption | "";
  painScore: number;
  cameraResult?: {
    imageQuality: ImageQuality | null;
    selectedEye: SelectedEye;
    analysis: CameraAnalysis | null;
  };
};

export type AIAnalysisResult = {
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  cameraSummary: string;
  possibleCategories: string[];
  explanation: string;
  recommendation: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export const MEDICAL_DISCLAIMER =
  "AI Mata hanya digunakan untuk edukasi dan screening awal, bukan pengganti diagnosis dokter. Untuk hasil akurat, silakan konsultasi langsung dengan dokter mata.";
export const PRIVACY_MESSAGE =
  "Data dan foto yang Anda masukkan hanya digunakan untuk membantu screening awal. Jangan gunakan fitur ini untuk kondisi gawat darurat.";

const redFlags = [
  "Penglihatan mendadak menurun",
  "Nyeri mata",
  "Riwayat trauma mata",
  "Melihat kilatan cahaya",
  "Mata merah+buram",
  "Lensa kontak + merah/nyeri",
  "Diabetes + buram",
];

export function detectRedFlags(selectedSymptoms: string[], painScore: number, complaintText: string) {
  const txt = `${selectedSymptoms.join(" ")} ${complaintText}`.toLowerCase();
  return (
    selectedSymptoms.includes("Penglihatan mendadak menurun") ||
    selectedSymptoms.includes("Riwayat trauma mata") ||
    selectedSymptoms.includes("Melihat kilatan cahaya") ||
    (selectedSymptoms.includes("Mata merah") && selectedSymptoms.includes("Pandangan buram")) ||
    painScore >= 8 ||
    txt.includes("tirai")
  );
}

export function calculateRiskScore(input: AIAnalysisInput, hasRedFlag: boolean) {
  let score = input.selectedSymptoms.length * 7 + input.painScore * 4;
  if (input.duration === "Lebih dari 1 minggu") score += 8;
  if (input.cameraResult?.analysis?.rednessDetected) score += 6;
  if (input.cameraResult?.analysis?.swellingDetected) score += 6;
  if (input.cameraResult?.analysis?.dischargeDetected) score += 8;
  if (input.cameraResult?.imageQuality === "poor") score -= 8;
  if (hasRedFlag) score = Math.max(score, 85);
  return Math.min(100, Math.max(score, 0));
}

export function generateRecommendation(riskLevel: RiskLevel) {
  if (riskLevel === "Darurat") return { recommendation: "Segera ke dokter mata atau IGD.", ctaPrimary: "Hubungi Klinik", ctaSecondary: "Cari Bantuan Medis Segera" };
  if (riskLevel === "Tinggi") return { recommendation: "Perlu evaluasi dokter mata sesegera mungkin.", ctaPrimary: "Booking Dokter Mata", ctaSecondary: "Lihat Jadwal Terdekat" };
  if (riskLevel === "Sedang") return { recommendation: "Disarankan pemeriksaan terjadwal untuk konfirmasi.", ctaPrimary: "Simpan Hasil Screening", ctaSecondary: "Booking Pemeriksaan" };
  return { recommendation: "Lanjutkan perawatan mata harian dan observasi.", ctaPrimary: "Mulai 20-20-20", ctaSecondary: "Baca Tips Mata Sehat" };
}

export function analyzeEyeScreening(input: AIAnalysisInput): AIAnalysisResult {
  const hasRedFlag = detectRedFlags(input.selectedSymptoms, input.painScore, input.complaintText);
  const riskScore = calculateRiskScore(input, hasRedFlag);

  let riskLevel: RiskLevel = "Rendah";
  if (hasRedFlag || riskScore >= 85) riskLevel = "Darurat";
  else if (riskScore >= 65) riskLevel = "Tinggi";
  else if (riskScore >= 35) riskLevel = "Sedang";

  const possibleCategories = [
    input.selectedSymptoms.includes("Mata merah") ? "Iritasi / inflamasi" : "",
    input.selectedSymptoms.includes("Keluar kotoran mata") ? "Kemungkinan infeksi mata" : "",
    input.selectedSymptoms.includes("Pandangan buram") ? "Gangguan visual perlu evaluasi" : "",
  ].filter(Boolean);

  const cameraSummary = input.cameraResult?.analysis
    ? `${input.cameraResult.analysis.visualNote} Kualitas foto: ${input.cameraResult.imageQuality ?? "tidak ada"}.`
    : "Tidak ada foto kamera yang digunakan pada screening ini.";

  const explanation = hasRedFlag
    ? `Terdapat red flag (${redFlags.join(", ")}) yang meningkatkan prioritas pemeriksaan langsung.`
    : "Skor dihitung dari gejala, durasi, tingkat nyeri, dan temuan visual kamera (jika ada).";

  const { recommendation, ctaPrimary, ctaSecondary } = generateRecommendation(riskLevel);

  return {
    riskLevel,
    riskScore,
    summary: `Ringkasan keluhan: ${input.complaintText || "keluhan singkat tidak diisi"}; gejala: ${input.selectedSymptoms.join(", ") || "belum dipilih"}; durasi: ${input.duration || "belum dipilih"}; nyeri: ${input.painScore}/10.`,
    cameraSummary,
    possibleCategories: possibleCategories.length ? possibleCategories : ["Keluhan mata non-spesifik"],
    explanation,
    recommendation,
    ctaPrimary,
    ctaSecondary,
  };
}
