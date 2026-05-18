export type RiskLevel = "Rendah" | "Sedang" | "Tinggi" | "Darurat";

export type DurationOption = "Hari ini" | "1–3 hari" | "4–7 hari" | "Lebih dari 1 minggu";

export type AIAnalysisInput = {
  complaintText: string;
  selectedSymptoms: string[];
  duration: DurationOption | "";
  painScore: number;
  hasUploadedImage: boolean;
};

export type AIAnalysisResult = {
  riskLevel: RiskLevel;
  categories: string[];
  summary: string;
  patientComplaintSummary: string;
  recommendation: string;
  safetyNote: string;
  ctas: string[];
  shouldBookDoctor: boolean;
  detectedSignals: string[];
  photoNote?: string;
};

export const MEDICAL_DISCLAIMER =
  "AI Mata hanya digunakan untuk edukasi dan screening awal, bukan pengganti diagnosis dokter. Untuk hasil akurat, silakan konsultasi langsung dengan dokter mata.";

export const PRIVACY_MESSAGE =
  "Data dan foto yang Anda masukkan hanya digunakan untuk membantu screening awal. Jangan gunakan fitur ini untuk kondisi gawat darurat.";

const keywordRules: Array<{ keywords: string[]; signal: string; categories: string[] }> = [
  { keywords: ["merah", "red eye"], signal: "Mata merah", categories: ["Iritasi ringan", "Konjungtivitis"] },
  { keywords: ["gatal"], signal: "Mata gatal", categories: ["Alergi mata", "Iritasi ringan"] },
  { keywords: ["buram", "kabur", "blur"], signal: "Pandangan buram", categories: ["Gangguan refraksi", "Kemungkinan kondisi serius yang perlu pemeriksaan dokter"] },
  { keywords: ["nyeri", "sakit"], signal: "Nyeri mata", categories: ["Kemungkinan kondisi serius yang perlu pemeriksaan dokter"] },
  { keywords: ["kering", "perih"], signal: "Mata kering", categories: ["Mata kering"] },
  { keywords: ["berair"], signal: "Mata berair", categories: ["Iritasi ringan", "Alergi mata"] },
  { keywords: ["belekan", "kotoran", "nanah"], signal: "Keluar kotoran mata", categories: ["Infeksi mata", "Konjungtivitis"] },
  { keywords: ["trauma", "terbentur", "kemasukan benda"], signal: "Riwayat trauma mata", categories: ["Trauma mata"] },
  { keywords: ["mendadak tidak jelas", "hilang penglihatan"], signal: "Penglihatan mendadak menurun", categories: ["Kemungkinan kondisi serius yang perlu pemeriksaan dokter"] },
  { keywords: ["kilatan", "floaters", "bayangan hitam", "bayangan seperti tirai"], signal: "Melihat kilatan cahaya", categories: ["Kemungkinan kondisi serius yang perlu pemeriksaan dokter"] },
  { keywords: ["layar", "komputer", "laptop", "hp", "gadget"], signal: "Paparan layar", categories: ["Mata lelah / digital eye strain"] },
  { keywords: ["silau"], signal: "Silau", categories: ["Kemungkinan kondisi serius yang perlu pemeriksaan dokter"] },
  { keywords: ["sakit kepala", "pusing"], signal: "Sakit kepala", categories: ["Gangguan refraksi"] },
];

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function detectFromText(complaintText: string) {
  const normalizedText = complaintText.toLowerCase();
  const signals: string[] = [];
  const categories: string[] = [];

  keywordRules.forEach((rule) => {
    if (rule.keywords.some((keyword) => normalizedText.includes(keyword))) {
      signals.push(rule.signal);
      categories.push(...rule.categories);
    }
  });

  return {
    signals: unique(signals),
    categories: unique(categories),
  };
}

function durationMoreThanThreeDays(duration: AIAnalysisInput["duration"]) {
  return duration === "4–7 hari" || duration === "Lebih dari 1 minggu";
}

function durationOneToSevenDays(duration: AIAnalysisInput["duration"]) {
  return duration === "1–3 hari" || duration === "4–7 hari";
}

function buildComplaintSummary(input: AIAnalysisInput, detectedSignals: string[]) {
  const symptomSummary = unique([...input.selectedSymptoms, ...detectedSignals]);
  const symptoms = symptomSummary.length ? symptomSummary.join(", ") : "keluhan yang ditulis pasien";
  const duration = input.duration || "durasi belum dipilih";
  const photo = input.hasUploadedImage ? " dengan foto mata pendukung" : " tanpa foto mata";

  return `${symptoms} selama ${duration}, tingkat nyeri ${input.painScore}/10${photo}`;
}

export function analyzeEyeScreening(input: AIAnalysisInput): AIAnalysisResult {
  const textDetection = detectFromText(input.complaintText);
  const signals = unique([...input.selectedSymptoms, ...textDetection.signals]);
  const signalText = signals.join(" ").toLowerCase();
  const has = (value: string) => signals.includes(value) || signalText.includes(value.toLowerCase());
  const categories = unique([...textDetection.categories]);

  if (has("Mata kering")) categories.push("Mata kering");
  if (has("Mata gatal") || has("Mata berair")) categories.push("Alergi mata", "Iritasi ringan");
  if (has("Keluar kotoran mata")) categories.push("Infeksi mata", "Konjungtivitis");
  if (has("Pandangan buram") || has("Sakit kepala")) categories.push("Gangguan refraksi");
  if (has("Riwayat trauma mata")) categories.push("Trauma mata");
  if (has("Penglihatan mendadak menurun") || has("Melihat kilatan cahaya")) {
    categories.push("Kemungkinan kondisi serius yang perlu pemeriksaan dokter");
  }
  if (has("Paparan layar") || (!input.painScore && has("Mata kering"))) categories.push("Mata lelah / digital eye strain");

  const redPainBlur = has("Mata merah") && input.painScore >= 8 && has("Pandangan buram");
  const emergency =
    has("Penglihatan mendadak menurun") ||
    input.painScore >= 8 ||
    has("Riwayat trauma mata") ||
    has("Melihat kilatan cahaya") ||
    signalText.includes("bayangan seperti tirai") ||
    redPainBlur;

  const high =
    input.painScore >= 6 ||
    (has("Mata merah") && durationMoreThanThreeDays(input.duration)) ||
    has("Keluar kotoran mata") ||
    (has("Pandangan buram") && input.duration !== "Hari ini") ||
    has("Silau");

  const medium =
    has("Mata merah") ||
    has("Mata gatal") ||
    has("Mata berair") ||
    has("Mata kering") ||
    durationOneToSevenDays(input.duration) ||
    (input.painScore >= 1 && input.painScore <= 5);

  const low =
    (has("Paparan layar") || has("Mata kering")) &&
    input.painScore === 0 &&
    input.duration === "Hari ini" &&
    !has("Mata merah") &&
    !has("Pandangan buram");

  let riskLevel: RiskLevel = "Rendah";
  let recommendation = "Kemungkinan keluhan ringan. Coba istirahat mata, hidrasi, dan aturan 20-20-20.";
  let ctas = ["Mulai 20-20-20"];
  let shouldBookDoctor = false;

  if (emergency) {
    riskLevel = "Darurat";
    recommendation = "Segera periksa ke dokter mata atau IGD. Gejala Anda memerlukan evaluasi medis secepatnya.";
    ctas = ["Booking Pemeriksaan Segera"];
    shouldBookDoctor = true;
  } else if (high) {
    riskLevel = "Tinggi";
    recommendation = "Disarankan melakukan pemeriksaan dokter mata dalam waktu dekat.";
    ctas = ["Booking Dokter Mata"];
    shouldBookDoctor = true;
  } else if (medium && !low) {
    riskLevel = "Sedang";
    recommendation = "Kondisi perlu dipantau. Lakukan perawatan awal dan pertimbangkan konsultasi bila tidak membaik.";
    ctas = ["Lihat Tips Perawatan", "Booking Pemeriksaan"];
    shouldBookDoctor = true;
  }

  const finalCategories = unique(categories).length ? unique(categories) : ["Iritasi ringan"];
  const patientComplaintSummary = buildComplaintSummary(input, textDetection.signals);
  const summary = `Berdasarkan ${patientComplaintSummary}, kondisi Anda kemungkinan mengarah ke ${finalCategories.slice(0, 2).join(" atau ").toLowerCase()}. Saat ini risiko berada pada kategori ${riskLevel}.`;

  return {
    riskLevel,
    categories: finalCategories,
    summary,
    patientComplaintSummary,
    recommendation,
    safetyNote: emergency
      ? "Jangan menunda pemeriksaan dan jangan menjadikan hasil AI ini sebagai diagnosis final. Bila gejala berat sedang berlangsung, prioritaskan dokter mata atau IGD."
      : "Pantau perubahan gejala, hindari mengucek mata, dan konsultasikan ke dokter mata bila keluhan memburuk atau tidak membaik.",
    ctas,
    shouldBookDoctor,
    detectedSignals: signals,
    photoNote: input.hasUploadedImage
      ? "Foto berhasil diunggah. AI akan membantu membaca gejala visual secara awal. Analisa foto bersifat terbatas dan perlu dikonfirmasi oleh dokter mata."
      : undefined,
  };
}
