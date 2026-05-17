export const AI_STORAGE_KEYS = {
  screeningForm: "prime_ai_screening_form",
  screeningResult: "prime_ai_screening_result",
  screeningHistory: "prime_ai_screening_history",
  cekBotMessages: "prime_cekbot_messages",
} as const;

export type ScreeningLevel = "Rendah" | "Sedang" | "Tinggi" | "Darurat / Segera ke dokter";

export type ScreeningFormDraft = {
  complaint: string;
  duration: string;
  symptoms: string[];
  severity: number;
  redFlags: string[];
  photoPreview?: string;
  updatedAt: string;
};

export type ScreeningResult = {
  id: string;
  createdAt: string;
  level: ScreeningLevel;
  summary: string;
  reasons: string[];
  recommendation: string;
  formSnapshot: ScreeningFormDraft;
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

function getLevelFromScore(score: number): ScreeningLevel {
  if (score >= 4) return "Darurat / Segera ke dokter";
  if (score >= 3) return "Tinggi";
  if (score >= 2) return "Sedang";
  return "Rendah";
}

export function evaluateEyeScreening(form: ScreeningFormDraft): ScreeningResult {
  const symptoms = form.symptoms.map((symptom) => symptom.toLowerCase());
  const redFlags = form.redFlags.map((flag) => flag.toLowerCase());
  const reasons: string[] = [];
  let score = form.severity >= 5 ? 2 : 1;

  const hasEmergencySignal = redFlags.some(
    (flag) => flag.includes("penglihatan turun mendadak") || flag.includes("trauma") || flag.includes("percikan zat"),
  );
  const hasUrgentRedFlag = hasEmergencySignal || redFlags.some((flag) => flag.includes("sakit kepala hebat"));

  if (hasUrgentRedFlag) {
    score = raiseLevel(score, hasEmergencySignal && form.severity >= 8 ? 4 : 3);
    reasons.push("Terdapat red flag utama seperti penurunan penglihatan mendadak, trauma/zat kimia, atau sakit kepala hebat disertai mual/muntah.");
  }

  const hasSeverePain = form.severity >= 8 || symptoms.includes("nyeri") && form.severity >= 7;
  if (hasSeverePain) {
    score = raiseLevel(score, 3);
    reasons.push("Tingkat keluhan tinggi atau nyeri berat sehingga prioritas minimal tinggi.");
  }

  const hasContactLensRisk = redFlags.some((flag) => flag.includes("lensa kontak")) &&
    (symptoms.includes("nyeri") || symptoms.includes("buram") || symptoms.includes("silau") || redFlags.some((flag) => flag.includes("buram") || flag.includes("silau")));
  if (hasContactLensRisk) {
    score = raiseLevel(score, 3);
    reasons.push("Penggunaan lensa kontak disertai nyeri/buram/silau perlu evaluasi lebih cepat.");
  }

  const hasMediumFlag = redFlags.some(
    (flag) =>
      flag.includes("pandangan buram") ||
      flag.includes("silau") ||
      flag.includes("kotoran mata") ||
      flag.includes("satu mata"),
  ) || symptoms.includes("buram") || symptoms.includes("silau");

  if (hasMediumFlag) {
    score = raiseLevel(score, 2);
    reasons.push("Ada buram, silau, keluhan dominan satu mata, atau kotoran mata berlebih sehingga prioritas minimal sedang.");
  }

  const allergyLikePattern = symptoms.includes("mata merah") && symptoms.includes("gatal") && symptoms.includes("berair") && !hasUrgentRedFlag && form.severity <= 4;
  if (allergyLikePattern) {
    score = Math.max(score, 1);
    reasons.push("Kombinasi mata merah, gatal, dan berair dengan tingkat ringan tanpa red flag cenderung prioritas rendah hingga sedang untuk screening awal.");
  }

  if (form.severity >= 5 && form.severity < 8) {
    score = raiseLevel(score, 2);
    reasons.push("Tingkat keluhan sedang sehingga disarankan pemantauan ketat dan konsultasi bila tidak membaik.");
  }

  if (reasons.length === 0) {
    reasons.push("Tidak ada red flag utama yang dipilih dan tingkat keluhan masih ringan pada data yang diisi.");
  }

  const summary = `Keluhan utama: ${form.complaint}. Durasi: ${form.duration}. Gejala: ${form.symptoms.length ? form.symptoms.join(", ") : "belum dipilih"}. Tingkat keluhan: ${form.severity}/10.`;

  return {
    id: `screening-${Date.now()}`,
    createdAt: new Date().toISOString(),
    level: getLevelFromScore(score),
    summary,
    reasons: getUniqueValues(reasons),
    recommendation: "Segera konsultasi ke dokter mata jika keluhan memburuk atau muncul red flag. Hasil ini hanya untuk edukasi dan screening awal, bukan diagnosis final.",
    formSnapshot: { ...form, symptoms: getUniqueValues(form.symptoms), redFlags: getUniqueValues(form.redFlags) },
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
