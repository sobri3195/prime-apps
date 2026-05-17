export const AI_STORAGE_KEYS = {
  eyePhotoPreview: "prime_ai_eye_photo_preview",
  eyePhotoAnalysis: "prime_ai_eye_photo_analysis",
  screeningForm: "prime_ai_screening_form",
  screeningResult: "prime_ai_screening_result",
  screeningHistory: "prime_ai_screening_history",
  cekBotMessages: "prime_cekbot_messages",
} as const;

export type RiskLevel = "Rendah" | "Sedang" | "Tinggi";
export type PhotoQuality = "Baik" | "Cukup" | "Kurang jelas";
export type RednessLevel = "Rendah" | "Sedang" | "Tinggi";
export type BrightnessLevel = "Normal" | "Terlalu gelap" | "Terlalu terang";
export type BlurLevel = "Jelas" | "Agak buram" | "Buram";
export type ScreeningLevel = RiskLevel;

export type EyePhotoPreview = {
  imageData: string;
  createdAt: string;
};

export type EyePhotoAnalysis = {
  id: string;
  createdAt: string;
  quality: PhotoQuality;
  rednessLevel: RednessLevel;
  brightnessLevel: BrightnessLevel;
  blurLevel: BlurLevel;
  riskLevel: RiskLevel;
  findings: string[];
  recommendation: string;
  disclaimer: string;
};

export type ScreeningFormDraft = {
  complaint: string;
  duration: string;
  symptoms: string[];
  severity: number;
  redFlags: string[];
  updatedAt: string;
};

export type ScreeningResult = {
  id: string;
  createdAt: string;
  source: "form_photo_local";
  formSnapshot: ScreeningFormDraft;
  photoAnalysis: EyePhotoAnalysis | null;
  finalRiskLevel: RiskLevel;
  finalSummary: string;
  reasons: string[];
  recommendation: string;
  disclaimer: string;
  level: ScreeningLevel;
  summary: string;
};

export type CekBotMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  createdAt: string;
};

export const emptyScreeningForm: ScreeningFormDraft = {
  complaint: "",
  duration: "",
  symptoms: [],
  severity: 4,
  redFlags: [],
  updatedAt: "",
};

export function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Gagal menyimpan data lokal: ${key}`, error);
  }
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) return fallback;
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.warn(`Gagal membaca data lokal: ${key}`, error);
    return fallback;
  }
}

export function removeFromStorage(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Gagal menghapus data lokal: ${key}`, error);
  }
}

function getUniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function raiseLevel(current: number, minimum: number) {
  return Math.max(current, minimum);
}

function getRiskFromScore(score: number): RiskLevel {
  if (score >= 3) return "Tinggi";
  if (score >= 2) return "Sedang";
  return "Rendah";
}

function getScoreFromRisk(riskLevel: RiskLevel) {
  if (riskLevel === "Tinggi") return 3;
  if (riskLevel === "Sedang") return 2;
  return 1;
}

function hasPainBlurOrGlare(symptoms: string[], redFlags: string[]) {
  return (
    symptoms.includes("nyeri") ||
    symptoms.includes("buram") ||
    symptoms.includes("silau") ||
    redFlags.some((flag) => flag.includes("buram") || flag.includes("silau"))
  );
}

export function evaluateEyeScreening(
  form: ScreeningFormDraft,
  photoAnalysis: EyePhotoAnalysis | null = null,
): ScreeningResult {
  const symptoms = form.symptoms.map((symptom) => symptom.toLowerCase());
  const redFlags = form.redFlags.map((flag) => flag.toLowerCase());
  const reasons: string[] = [];
  let score = form.severity >= 5 ? 2 : 1;

  const hasEmergencySignal = redFlags.some(
    (flag) =>
      flag.includes("penglihatan turun mendadak") ||
      flag.includes("trauma") ||
      flag.includes("percikan zat"),
  );
  const hasUrgentRedFlag =
    hasEmergencySignal ||
    redFlags.some((flag) => flag.includes("sakit kepala hebat"));

  if (hasUrgentRedFlag) {
    score = raiseLevel(score, 3);
    reasons.push(
      "Terdapat red flag utama seperti penurunan penglihatan mendadak, trauma/zat kimia, atau sakit kepala hebat disertai mual/muntah sehingga perlu evaluasi dokter segera.",
    );
  }

  if (form.severity >= 8) {
    score = raiseLevel(score, 3);
    reasons.push("Tingkat keluhan 8/10 atau lebih sehingga risiko minimal tinggi.");
  }

  const hasSeverePain = symptoms.includes("nyeri") && form.severity >= 7;
  if (hasSeverePain) {
    score = raiseLevel(score, 3);
    reasons.push("Nyeri dengan tingkat keluhan tinggi perlu evaluasi dokter lebih cepat.");
  }

  const hasContactLensRisk =
    redFlags.some((flag) => flag.includes("lensa kontak")) &&
    hasPainBlurOrGlare(symptoms, redFlags);
  if (hasContactLensRisk) {
    score = raiseLevel(score, 3);
    reasons.push("Penggunaan lensa kontak disertai nyeri/buram/silau perlu evaluasi lebih cepat.");
  }

  const hasMediumFlag =
    redFlags.some(
      (flag) =>
        flag.includes("pandangan buram") ||
        flag.includes("silau") ||
        flag.includes("kotoran mata") ||
        flag.includes("satu mata"),
    ) ||
    symptoms.includes("buram") ||
    symptoms.includes("silau");

  if (hasMediumFlag) {
    score = raiseLevel(score, 2);
    reasons.push("Ada buram, silau, keluhan dominan satu mata, atau kotoran mata berlebih sehingga prioritas minimal sedang.");
  }

  if (form.severity >= 5 && form.severity < 8) {
    score = raiseLevel(score, 2);
    reasons.push("Tingkat keluhan sedang sehingga disarankan pemantauan ketat dan konsultasi bila tidak membaik.");
  }

  if (photoAnalysis) {
    score = raiseLevel(score, getScoreFromRisk(photoAnalysis.riskLevel));
    reasons.push(
      `Analisis foto lokal menunjukkan kualitas ${photoAnalysis.quality.toLowerCase()}, kemerahan ${photoAnalysis.rednessLevel.toLowerCase()}, pencahayaan ${photoAnalysis.brightnessLevel.toLowerCase()}, dan ketajaman ${photoAnalysis.blurLevel.toLowerCase()}.`,
    );

    if (
      photoAnalysis.rednessLevel === "Tinggi" &&
      hasPainBlurOrGlare(symptoms, redFlags)
    ) {
      score = raiseLevel(score, 2);
      reasons.push("Kemerahan tinggi pada foto disertai nyeri/buram/silau sehingga risiko minimal sedang.");
    }

    if (
      photoAnalysis.quality === "Kurang jelas" ||
      photoAnalysis.brightnessLevel !== "Normal" ||
      photoAnalysis.blurLevel === "Buram"
    ) {
      reasons.push("Foto kurang jelas. Ambil ulang foto dengan pencahayaan yang lebih baik sebelum mengandalkan hasil visual.");
    }
  }

  if (reasons.length === 0) {
    reasons.push("Tidak ada red flag utama yang dipilih dan tingkat keluhan masih ringan pada data yang diisi.");
  }

  const finalRiskLevel = getRiskFromScore(score);
  const finalSummary = `Keluhan utama: ${form.complaint || "belum diisi"}. Durasi: ${form.duration || "belum diisi"}. Gejala: ${form.symptoms.length ? form.symptoms.join(", ") : "belum dipilih"}. Tingkat keluhan: ${form.severity}/10. Foto: ${photoAnalysis ? `kualitas ${photoAnalysis.quality}, kemerahan ${photoAnalysis.rednessLevel}` : "belum dianalisis"}.`;
  const recommendation =
    finalRiskLevel === "Tinggi"
      ? "Segera konsultasi ke dokter mata, terutama bila ada nyeri berat, penglihatan buram/menurun, silau berat, trauma, paparan zat kimia, atau keluhan memburuk."
      : finalRiskLevel === "Sedang"
        ? "Pantau keluhan dengan ketat dan pertimbangkan konsultasi dokter mata bila keluhan menetap, memburuk, atau mengganggu aktivitas."
        : "Lakukan perawatan mata umum dan pantau keluhan. Jika muncul red flag atau keluhan memburuk, konsultasi ke dokter mata.";
  const disclaimer = "Hasil ini hanya screening awal berbasis foto dan gejala, bukan diagnosis medis.";

  return {
    id: `screening-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: "form_photo_local",
    formSnapshot: {
      ...form,
      symptoms: getUniqueValues(form.symptoms),
      redFlags: getUniqueValues(form.redFlags),
    },
    photoAnalysis,
    finalRiskLevel,
    finalSummary,
    reasons: getUniqueValues(reasons),
    recommendation,
    disclaimer,
    level: finalRiskLevel,
    summary: finalSummary,
  };
}

export function generateCekBotReply(question: string) {
  const normalizedQuestion = question.toLowerCase();

  if (normalizedQuestion.includes("jadwal") || normalizedQuestion.includes("dokter")) {
    return "Jadwal dokter dapat dicek melalui menu Booking Pemeriksaan atau dengan menghubungi klinik untuk konfirmasi slot terbaru.";
  }

  if (normalizedQuestion.includes("biaya") || normalizedQuestion.includes("tarif")) {
    return "Biaya dapat berbeda tergantung jenis layanan dan tindakan. Silakan cek info klinik atau konfirmasi ke admin agar mendapatkan estimasi terbaru.";
  }

  if (normalizedQuestion.includes("booking") || normalizedQuestion.includes("daftar")) {
    return "Untuk booking, buka menu Booking Pemeriksaan, pilih layanan atau dokter, tentukan jadwal, lalu lengkapi data pasien sebelum mengirim permintaan.";
  }

  if (normalizedQuestion.includes("bpjs")) {
    return "Silakan konfirmasi ketersediaan layanan BPJS ke admin klinik karena kebijakan dapat berubah.";
  }

  if (normalizedQuestion.includes("jam") || normalizedQuestion.includes("operasional")) {
    return "Jam operasional klinik dapat berubah mengikuti jadwal dokter dan hari layanan. Mohon konfirmasi jadwal terbaru ke klinik sebelum datang.";
  }

  if (
    normalizedQuestion.includes("keluhan") ||
    normalizedQuestion.includes("sakit") ||
    normalizedQuestion.includes("mata merah") ||
    normalizedQuestion.includes("buram") ||
    normalizedQuestion.includes("nyeri")
  ) {
    return "Silakan isi AI Screening Mata untuk triase awal. Jika keluhan berat, penglihatan turun mendadak, ada trauma, atau nyeri hebat, segera konsultasi dengan dokter mata.";
  }

  return "Terima kasih sudah bertanya. Anda bisa memilih quick question, mengisi AI Screening Mata, atau membuka menu Booking Pemeriksaan untuk bantuan lebih lanjut.";
}
