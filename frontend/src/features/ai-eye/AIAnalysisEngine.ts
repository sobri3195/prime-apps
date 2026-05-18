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
  medicalHistory: string[];
  cameraResult?: {
    imageQuality: ImageQuality | null;
    selectedEye: SelectedEye;
    analysis: CameraAnalysis | null;
  };
};

export type AIAnalysisResult = {
  riskLevel: RiskLevel;
  riskScore: number;
  categories: string[];
  summary: string;
  patientComplaintSummary: string;
  recommendation: string;
  safetyNote: string;
  ctas: string[];
  shouldBookDoctor: boolean;
  detectedSignals: string[];
  cameraSectionNote?: string;
};

export const MEDICAL_DISCLAIMER =
  "Kamera AI Mata hanya membantu screening visual awal. Hasil ini bukan diagnosis medis final dan tidak menggantikan pemeriksaan dokter mata.";
export const PRIVACY_MESSAGE = "Data kamera digunakan untuk screening awal dan tidak boleh dipakai untuk kondisi gawat darurat.";

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export function calculateRiskScore(baseSignals: string[], painScore: number, hasEmergencySignal: boolean) {
  let score = Math.min(100, baseSignals.length * 8 + painScore * 4);
  if (hasEmergencySignal) score = Math.max(score, 85);
  return score;
}

export function mergeCameraResultWithSymptoms(input: AIAnalysisInput, detectedSignals: string[]) {
  const mergedSignals = [...detectedSignals];
  let scoreBoost = 0;
  const notes: string[] = [];

  const quality = input.cameraResult?.imageQuality;
  const analysis = input.cameraResult?.analysis;

  if (!analysis || !quality) return { mergedSignals, scoreBoost, notes };
  if (quality === "poor") {
    notes.push("Visual kamera tidak dapat dianalisis optimal karena kualitas foto kurang.");
    return { mergedSignals, scoreBoost, notes };
  }

  if (analysis.rednessDetected) mergedSignals.push("Mata merah (kamera)");
  if (analysis.swellingDetected) mergedSignals.push("Bengkak kelopak (kamera)");
  if (analysis.dischargeDetected) mergedSignals.push("Keluar kotoran mata (kamera)");

  const hasPain = input.painScore >= 4 || input.selectedSymptoms.includes("Nyeri mata");
  if (analysis.rednessDetected && hasPain) scoreBoost += 8;
  if (analysis.swellingDetected && hasPain) scoreBoost += 8;
  if (analysis.dischargeDetected) scoreBoost += 10;

  notes.push(analysis.visualNote);
  return { mergedSignals: unique(mergedSignals), scoreBoost, notes };
}

export function analyzeEyeScreening(input: AIAnalysisInput): AIAnalysisResult {
  const combinedText = `${input.complaintText} ${input.selectedSymptoms.join(" ")}`.toLowerCase();
  const signals = unique(input.selectedSymptoms);

  if (combinedText.includes("buram")) signals.push("Pandangan buram");
  if (combinedText.includes("merah")) signals.push("Mata merah");
  if (combinedText.includes("trauma")) signals.push("Riwayat trauma mata");
  if (combinedText.includes("kilatan") || combinedText.includes("tirai")) signals.push("Melihat kilatan cahaya");

  const emergency =
    signals.includes("Penglihatan mendadak menurun") ||
    signals.includes("Riwayat trauma mata") ||
    signals.includes("Melihat kilatan cahaya") ||
    (signals.includes("Mata merah") && signals.includes("Pandangan buram")) ||
    input.painScore >= 8 ||
    (input.medicalHistory.includes("Diabetes") && signals.includes("Pandangan buram"));

  const mergedCamera = mergeCameraResultWithSymptoms(input, signals);
  const finalSignals = unique(mergedCamera.mergedSignals);
  const categories = unique([
    finalSignals.some((s) => s.includes("merah")) ? "Iritasi / inflamasi" : "",
    finalSignals.some((s) => s.includes("buram")) ? "Gangguan visual perlu evaluasi" : "",
    finalSignals.some((s) => s.includes("kotoran")) ? "Kemungkinan infeksi mata" : "",
    finalSignals.some((s) => s.includes("trauma")) ? "Trauma mata" : "",
  ]).filter(Boolean);

  let score = calculateRiskScore(finalSignals, input.painScore, emergency) + mergedCamera.scoreBoost;
  score = Math.min(score, 100);

  let riskLevel: RiskLevel = "Rendah";
  if (emergency || score >= 85) riskLevel = "Darurat";
  else if (score >= 65) riskLevel = "Tinggi";
  else if (score >= 35) riskLevel = "Sedang";

  const cameraSectionNote = mergedCamera.notes.join(" ") || undefined;

  return {
    riskLevel,
    riskScore: score,
    categories: categories.length ? categories : ["Iritasi ringan"],
    summary: `Berdasarkan kombinasi keluhan, gejala, faktor risiko, dan hasil visual kamera, skor risiko awal Anda adalah ${score}/100 (${riskLevel}).`,
    patientComplaintSummary: `${finalSignals.join(", ") || "Keluhan umum"}; durasi ${input.duration || "belum dipilih"}; nyeri ${input.painScore}/10.`,
    recommendation:
      riskLevel === "Darurat"
        ? "Segera ke dokter mata/IGD untuk evaluasi langsung."
        : "Lanjutkan pemantauan dan pertimbangkan konsultasi dokter mata untuk konfirmasi diagnosis.",
    safetyNote:
      "AI tidak menetapkan diagnosis final, tidak meresepkan obat, dan tidak menggantikan pemeriksaan dokter mata langsung.",
    ctas: riskLevel === "Darurat" ? ["Ke IGD Sekarang"] : ["Booking Dokter Mata", "Lihat Edukasi Perawatan"],
    shouldBookDoctor: riskLevel !== "Rendah",
    detectedSignals: finalSignals,
    cameraSectionNote,
  };
}
