import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AI_STORAGE_KEYS,
  emptyScreeningForm,
  evaluateEyeScreening,
  loadFromStorage,
  removeFromStorage,
  saveToStorage,
  type BrightnessLevel,
  type BlurLevel,
  type EyePhotoAnalysis,
  type EyePhotoPreview,
  type PhotoQuality,
  type RednessLevel,
  type RiskLevel,
  type ScreeningFormDraft,
  type ScreeningResult,
} from "@/features/ai-eye/localAiStorage";

const symptomOptions = [
  "Mata merah",
  "Buram",
  "Nyeri",
  "Gatal",
  "Berair",
  "Silau",
  "Kering",
  "Bengkak",
];

const redFlagOptions = [
  "Penglihatan turun mendadak",
  "Ada trauma/benturan/percikan zat",
  "Sakit kepala hebat, mual, atau muntah",
  "Pandangan buram",
  "Silau atau sensitif cahaya",
  "Sedang memakai lensa kontak",
  "Kotoran mata berlebih/lengket",
  "Keluhan dominan satu mata",
];

const levelClasses: Record<RiskLevel, string> = {
  Rendah: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Sedang: "border-amber-100 bg-amber-50 text-amber-700",
  Tinggi: "border-red-100 bg-red-50 text-red-700",
};

function createDraft(
  overrides: Partial<ScreeningFormDraft> = {},
): ScreeningFormDraft {
  return {
    ...emptyScreeningForm,
    ...overrides,
    symptoms: overrides.symptoms ?? [],
    redFlags: overrides.redFlags ?? [],
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  };
}

function toggleSelected(value: string, selectedValues: string[]) {
  return selectedValues.includes(value)
    ? selectedValues.filter((selectedValue) => selectedValue !== value)
    : [...selectedValues, value];
}

function isFormReady(form: ScreeningFormDraft) {
  return (
    form.complaint.trim().length >= 3 &&
    form.duration.trim().length > 0 &&
    form.symptoms.length > 0
  );
}

function hasDraftData(form: ScreeningFormDraft) {
  return Boolean(
    form.complaint.trim() ||
      form.duration.trim() ||
      form.symptoms.length ||
      form.redFlags.length ||
      form.severity !== emptyScreeningForm.severity,
  );
}

function getPhotoFindingColor(analysis: EyePhotoAnalysis) {
  if (analysis.riskLevel === "Tinggi" || analysis.quality === "Kurang jelas") {
    return "border-red-100 bg-red-50 text-red-700";
  }

  if (analysis.riskLevel === "Sedang") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  return "border-emerald-100 bg-emerald-50 text-emerald-700";
}

function createImageFromData(imageData: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
    image.src = imageData;
  });
}

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AiEyeScreeningForm() {
  const [form, setForm] = useState<ScreeningFormDraft>(() =>
    createDraft(
      loadFromStorage<ScreeningFormDraft>(
        AI_STORAGE_KEYS.screeningForm,
        emptyScreeningForm,
      ),
    ),
  );
  const [result, setResult] = useState<ScreeningResult | null>(() =>
    loadFromStorage<ScreeningResult | null>(
      AI_STORAGE_KEYS.screeningResult,
      null,
    ),
  );
  const [history, setHistory] = useState<ScreeningResult[]>(() =>
    loadFromStorage<ScreeningResult[]>(AI_STORAGE_KEYS.screeningHistory, []),
  );
  const [formMessage, setFormMessage] = useState("");
  const [historyMessage, setHistoryMessage] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [photoPreview, setPhotoPreview] = useState<EyePhotoPreview | null>(() =>
    loadFromStorage<EyePhotoPreview | null>(
      AI_STORAGE_KEYS.eyePhotoPreview,
      null,
    ),
  );
  const [photoAnalysis, setPhotoAnalysis] = useState<EyePhotoAnalysis | null>(
    () =>
      loadFromStorage<EyePhotoAnalysis | null>(
        AI_STORAGE_KEYS.eyePhotoAnalysis,
        null,
      ),
  );
  const [cameraError, setCameraError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResetPhotoChoice, setShowResetPhotoChoice] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!hasDraftData(form)) {
      removeFromStorage(AI_STORAGE_KEYS.screeningForm);
      return;
    }

    saveToStorage(AI_STORAGE_KEYS.screeningForm, {
      ...form,
      updatedAt: new Date().toISOString(),
    });
  }, [form]);

  useEffect(() => {
    cameraStreamRef.current = cameraStream;

    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      void videoRef.current.play().catch(() => {
        setCameraError("Preview kamera belum bisa diputar. Coba tutup dan nyalakan ulang kamera.");
      });
    }
  }, [cameraStream, isCameraOpen]);

  const stopCamera = useCallback(() => {
    const activeStream = cameraStreamRef.current;

    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    cameraStreamRef.current = null;
    setCameraStream(null);
    setIsCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const updateForm = (updates: Partial<ScreeningFormDraft>) => {
    setForm((currentForm) => ({
      ...currentForm,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
    setFormMessage("");
    setShowResetPhotoChoice(false);
  };

  const startCamera = async () => {
    setCameraError("");
    setFormMessage("");
    setShowResetPhotoChoice(false);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraError("Kamera tidak didukung di browser ini.");
      return;
    }

    stopCamera();

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });
      } catch (environmentError) {
        if (
          environmentError instanceof DOMException &&
          (environmentError.name === "NotAllowedError" ||
            environmentError.name === "SecurityError")
        ) {
          throw environmentError;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });
      }

      cameraStreamRef.current = stream;
      setIsCameraOpen(true);
      setCameraStream(stream);
    } catch (error) {
      stopCamera();

      if (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError")
      ) {
        setCameraError(
          "Izin kamera ditolak. Aktifkan izin kamera di browser untuk menggunakan fitur ini.",
        );
        return;
      }

      setCameraError(
        "Kamera belum bisa dibuka. Coba ulangi atau periksa izin perangkat.",
      );
    }
  };

  const persistPhotoPreview = (imageData: string) => {
    const nextPreview = {
      imageData,
      createdAt: new Date().toISOString(),
    };

    setPhotoPreview(nextPreview);
    setPhotoAnalysis(null);
    saveToStorage(AI_STORAGE_KEYS.eyePhotoPreview, nextPreview);
    removeFromStorage(AI_STORAGE_KEYS.eyePhotoAnalysis);
    setFormMessage("Foto berhasil diambil dan disimpan lokal di perangkat ini.");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const sourceWidth = video.videoWidth || 960;
    const sourceHeight = video.videoHeight || 720;
    const maxSize = 960;
    const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight));

    canvas.width = Math.round(sourceWidth * scale);
    canvas.height = Math.round(sourceHeight * scale);

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    if (imageData.length > 1.5 * 1024 * 1024) {
      setFormMessage(
        "Foto terlalu besar untuk disimpan lokal. Coba ambil ulang dengan pencahayaan lebih baik.",
      );
      stopCamera();
      return;
    }

    persistPhotoPreview(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    void startCamera();
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoAnalysis(null);
    setCameraError("");
    setFormMessage("Foto lokal dan hasil analisis foto sudah dihapus dari perangkat ini.");
    removeFromStorage(AI_STORAGE_KEYS.eyePhotoPreview);
    removeFromStorage(AI_STORAGE_KEYS.eyePhotoAnalysis);
    setResult(null);
    removeFromStorage(AI_STORAGE_KEYS.screeningResult);
  };

  const analyzeEyePhoto = async (imageData: string): Promise<EyePhotoAnalysis> => {
    const canvas = analysisCanvasRef.current ?? document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("Canvas browser tidak tersedia untuk analisis lokal.");
    }

    const image = await createImageFromData(imageData);
    const targetWidth = 320;
    const targetHeight = 240;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const pixels = context.getImageData(0, 0, targetWidth, targetHeight).data;
    let brightnessTotal = 0;
    let rednessPixels = 0;
    let sampledPixels = 0;
    let contrastTotal = 0;
    let previousBrightness = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const brightness = (red + green + blue) / 3;
      const redDominance = red - (green + blue) / 2;

      brightnessTotal += brightness;

      if (red > 95 && redDominance > 22 && red > green * 1.15 && red > blue * 1.15) {
        rednessPixels += 1;
      }

      if (sampledPixels > 0) {
        contrastTotal += Math.abs(brightness - previousBrightness);
      }

      previousBrightness = brightness;
      sampledPixels += 1;
    }

    const averageBrightness = brightnessTotal / sampledPixels;
    const rednessRatio = rednessPixels / sampledPixels;
    const edgeContrast = contrastTotal / Math.max(sampledPixels - 1, 1);

    const brightnessLevel: BrightnessLevel =
      averageBrightness < 58
        ? "Terlalu gelap"
        : averageBrightness > 218
          ? "Terlalu terang"
          : "Normal";
    const rednessLevel: RednessLevel =
      rednessRatio > 0.09 ? "Tinggi" : rednessRatio > 0.035 ? "Sedang" : "Rendah";
    const blurLevel: BlurLevel =
      edgeContrast < 6 ? "Buram" : edgeContrast < 10 ? "Agak buram" : "Jelas";
    const quality: PhotoQuality =
      brightnessLevel !== "Normal" || blurLevel === "Buram"
        ? "Kurang jelas"
        : blurLevel === "Agak buram" || rednessLevel === "Sedang"
          ? "Cukup"
          : "Baik";

    let riskLevel: RiskLevel = "Rendah";
    if (quality === "Kurang jelas" || rednessLevel === "Sedang") {
      riskLevel = "Sedang";
    }
    if (rednessLevel === "Tinggi") {
      riskLevel = "Tinggi";
    }

    const findings: string[] = [];

    if (rednessLevel === "Tinggi") {
      findings.push("Terdapat indikasi kemerahan cukup tinggi pada area foto.");
      findings.push("Kemungkinan iritasi perlu dievaluasi bersama gejala dan pemeriksaan dokter bila keluhan berat.");
    } else if (rednessLevel === "Sedang") {
      findings.push("Terdapat indikasi kemerahan pada area foto.");
    } else {
      findings.push("Dominasi warna merah pada foto tampak rendah.");
    }

    if (brightnessLevel === "Terlalu gelap") {
      findings.push("Foto terlalu gelap. Coba ambil ulang di tempat lebih terang.");
    } else if (brightnessLevel === "Terlalu terang") {
      findings.push("Foto terlalu terang sehingga detail area mata dapat berkurang.");
    } else {
      findings.push("Pencahayaan foto berada pada rentang normal untuk screening awal.");
    }

    if (blurLevel === "Buram") {
      findings.push("Foto kurang jelas. Coba ambil ulang dengan posisi lebih stabil.");
    } else if (blurLevel === "Agak buram") {
      findings.push("Foto agak buram, tetapi masih dapat memberi gambaran screening awal terbatas.");
    } else {
      findings.push("Foto cukup jelas untuk screening awal.");
    }

    findings.push("Keluhan kering tidak dapat disimpulkan hanya dari foto; gunakan informasi gejala pada form screening.");

    return {
      id: createLocalId("eye-photo-analysis"),
      createdAt: new Date().toISOString(),
      quality,
      rednessLevel,
      brightnessLevel,
      blurLevel,
      riskLevel,
      findings,
      recommendation:
        "Jika mata merah disertai nyeri, penglihatan buram, silau berat, atau keluhan memburuk, segera konsultasi ke dokter mata.",
      disclaimer: "Hasil ini hanya screening awal berbasis foto dan gejala, bukan diagnosis medis.",
    };
  };

  const handleAnalyzePhoto = async () => {
    if (!photoPreview) {
      setFormMessage("Ambil foto mata terlebih dahulu sebelum analisis lokal.");
      return;
    }

    setIsAnalyzing(true);
    setCameraError("");
    setFormMessage("");

    try {
      const analysis = await analyzeEyePhoto(photoPreview.imageData);
      setPhotoAnalysis(analysis);
      saveToStorage(AI_STORAGE_KEYS.eyePhotoAnalysis, analysis);

      if (analysis.brightnessLevel === "Terlalu gelap") {
        setFormMessage("Foto terlalu gelap. Coba ambil ulang di tempat lebih terang.");
      } else if (analysis.blurLevel === "Buram") {
        setFormMessage("Foto kurang jelas. Coba ambil ulang dengan posisi lebih stabil.");
      } else if (analysis.quality === "Kurang jelas") {
        setFormMessage("Foto kurang jelas. Ambil ulang foto dengan pencahayaan yang lebih baik.");
      } else {
        setFormMessage("Analisis foto lokal selesai dan tersimpan di perangkat ini.");
      }
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Analisis foto lokal belum berhasil. Coba ambil ulang foto.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!isFormReady(form)) {
      setFormMessage(
        "Lengkapi keluhan utama, durasi, dan minimal satu gejala sebelum mengirim screening.",
      );
      return;
    }

    const screeningResult = evaluateEyeScreening(form, photoAnalysis);
    setResult(screeningResult);
    saveToStorage(AI_STORAGE_KEYS.screeningResult, screeningResult);

    const nextHistory = [
      screeningResult,
      ...history.filter((item) => item.id !== screeningResult.id),
    ].slice(0, 10);
    setHistory(nextHistory);
    saveToStorage(AI_STORAGE_KEYS.screeningHistory, nextHistory);
    setFormMessage(
      "Hasil Screening Awal berhasil dibuat, digabungkan dengan analisis foto bila tersedia, dan disimpan di perangkat ini.",
    );
  };

  const handleSaveResult = () => {
    if (!result) return;

    const nextHistory = [
      result,
      ...history.filter((item) => item.id !== result.id),
    ].slice(0, 10);
    setHistory(nextHistory);
    saveToStorage(AI_STORAGE_KEYS.screeningHistory, nextHistory);
    setHistoryMessage("Hasil screening ditambahkan ke riwayat lokal.");
  };

  const resetFormOnly = () => {
    stopCamera();
    setForm(createDraft());
    setCameraError("");
    setResult(null);
    setFormMessage("Form dan hasil aktif sudah direset dari perangkat ini.");
    removeFromStorage(AI_STORAGE_KEYS.screeningForm);
    removeFromStorage(AI_STORAGE_KEYS.screeningResult);
  };

  const handleResetForm = () => {
    resetFormOnly();

    if (photoPreview || photoAnalysis) {
      setShowResetPhotoChoice(true);
      setFormMessage("Form sudah direset. Apakah foto lokal dan analisis foto juga ingin dihapus?");
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setHistoryMessage("Riwayat hasil screening lokal sudah dihapus.");
    removeFromStorage(AI_STORAGE_KEYS.screeningHistory);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-prime-gold/20 bg-white p-5 shadow-lg shadow-prime-gold/10">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-prime-gold">
          Mode lokal • Kamera perangkat • localStorage
        </p>
        <h2 className="text-xl font-semibold text-prime-black">
          AI Screening Mata
        </h2>
        <p className="text-sm leading-relaxed text-prime-black/65">
          Isi keluhan dan, bila nyaman, ambil foto mata untuk screening awal lokal di browser.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-prime-black">
            Keluhan utama
          </span>
          <input
            value={form.complaint}
            onChange={(event) => updateForm({ complaint: event.target.value })}
            className="w-full rounded-2xl border border-prime-gold/20 bg-prime-cream/30 px-4 py-3 text-sm text-prime-black outline-none transition focus:border-prime-gold focus:bg-white"
            placeholder="Contoh: mata merah, buram, atau nyeri"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-prime-black">
            Durasi keluhan
          </span>
          <input
            value={form.duration}
            onChange={(event) => updateForm({ duration: event.target.value })}
            className="w-full rounded-2xl border border-prime-gold/20 bg-prime-cream/30 px-4 py-3 text-sm text-prime-black outline-none transition focus:border-prime-gold focus:bg-white"
            placeholder="Contoh: 2 hari, 1 minggu"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-prime-black">
            Gejala tambahan
          </p>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => {
              const selected = form.symptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() =>
                    updateForm({
                      symptoms: toggleSelected(symptom, form.symptoms),
                    })
                  }
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                    selected
                      ? "border-prime-gold bg-prime-gold text-white shadow-sm shadow-prime-gold/30"
                      : "border-prime-gold/20 bg-white text-prime-black/70"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>

        <label className="space-y-3 rounded-2xl border border-prime-gold/15 bg-prime-cream/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-prime-black">
              Tingkat keluhan
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-prime-gold shadow-sm">
              {form.severity}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={form.severity}
            onChange={(event) =>
              updateForm({ severity: Number(event.target.value) })
            }
            className="w-full accent-prime-gold"
          />
          <div className="flex justify-between text-xs font-medium text-prime-black/55">
            <span>Ringan</span>
            <span>Sedang</span>
            <span>Berat</span>
          </div>
        </label>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-prime-gold" />
            <p className="text-sm font-semibold text-prime-black">
              Red flag checklist
            </p>
          </div>
          <div className="grid gap-2">
            {redFlagOptions.map((redFlag) => {
              const selected = form.redFlags.includes(redFlag);
              return (
                <button
                  key={redFlag}
                  type="button"
                  onClick={() =>
                    updateForm({
                      redFlags: toggleSelected(redFlag, form.redFlags),
                    })
                  }
                  className={`flex items-start gap-2 rounded-2xl border p-3 text-left text-sm transition ${
                    selected
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-prime-gold/15 bg-white text-prime-black/70"
                  }`}
                >
                  <CheckCircle2
                    size={17}
                    className={
                      selected
                        ? "mt-0.5 text-red-500"
                        : "mt-0.5 text-prime-black/25"
                    }
                  />
                  <span>{redFlag}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-[28px] border border-teal-700/10 bg-teal-50/70 p-4 shadow-inner shadow-white/60">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-white p-2 text-prime-gold shadow-sm">
              <Camera size={18} />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-prime-black">
                Ambil Foto Mata
              </p>
              <p className="text-xs leading-relaxed text-prime-black/65">
                Ambil foto mata langsung dari kamera. Foto hanya disimpan lokal di perangkat Anda dan tidak dikirim ke server.
              </p>
            </div>
          </div>

          {cameraError && (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium leading-relaxed text-red-700">
              {cameraError}
            </p>
          )}

          {isCameraOpen ? (
            <div className="space-y-3">
              <video
                ref={videoRef}
                className="aspect-[4/3] w-full rounded-[18px] border border-white/80 bg-prime-black/10 object-cover shadow-sm"
                playsInline
                muted
                autoPlay
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-2xl bg-prime-gold px-4 py-3 text-sm font-semibold text-white shadow-md shadow-prime-gold/25"
                >
                  Ambil Foto
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="rounded-2xl border border-prime-gold/25 bg-white/80 px-4 py-3 text-sm font-semibold text-prime-black/70"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : photoPreview ? (
            <div className="space-y-3">
              <img
                src={photoPreview.imageData}
                alt="Preview foto mata"
                className="aspect-[4/3] w-full rounded-[18px] border border-white/80 object-cover shadow-sm"
              />
              <p className="rounded-2xl bg-white/85 px-3 py-2 text-xs font-semibold text-teal-800">
                Foto tersimpan lokal sejak {new Date(photoPreview.createdAt).toLocaleString("id-ID")}.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleAnalyzePhoto}
                  disabled={isAnalyzing}
                  className="rounded-2xl bg-prime-gold px-4 py-3 text-sm font-semibold text-white shadow-md shadow-prime-gold/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAnalyzing ? "Menganalisis..." : "Analisis Foto"}
                </button>
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="rounded-2xl border border-prime-gold/25 bg-white/80 px-4 py-3 text-sm font-semibold text-prime-black/70"
                >
                  Foto Ulang
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-2xl border border-red-100 bg-white/80 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  Hapus Foto
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="w-full rounded-2xl bg-prime-gold px-4 py-3 text-sm font-semibold text-white shadow-md shadow-prime-gold/25"
            >
              Nyalakan Kamera
            </button>
          )}

          {isAnalyzing && (
            <p className="rounded-2xl bg-white/85 px-3 py-2 text-xs font-semibold text-teal-800">
              Menganalisis foto secara lokal...
            </p>
          )}

          {photoAnalysis && (
            <div className="space-y-3 rounded-3xl border border-white/80 bg-white/90 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-prime-gold">
                    Hasil Analisis Foto
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-prime-black">
                    Screening visual lokal
                  </h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getPhotoFindingColor(photoAnalysis)}`}>
                  {photoAnalysis.riskLevel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                <div className="rounded-2xl bg-prime-cream/40 p-3">
                  <p className="font-semibold text-prime-black">Kualitas foto</p>
                  <p className="mt-1 text-prime-black/65">{photoAnalysis.quality}</p>
                </div>
                <div className="rounded-2xl bg-prime-cream/40 p-3">
                  <p className="font-semibold text-prime-black">Tingkat kemerahan</p>
                  <p className="mt-1 text-prime-black/65">{photoAnalysis.rednessLevel}</p>
                </div>
                <div className="rounded-2xl bg-prime-cream/40 p-3">
                  <p className="font-semibold text-prime-black">Pencahayaan</p>
                  <p className="mt-1 text-prime-black/65">{photoAnalysis.brightnessLevel}</p>
                </div>
                <div className="rounded-2xl bg-prime-cream/40 p-3">
                  <p className="font-semibold text-prime-black">Ketajaman</p>
                  <p className="mt-1 text-prime-black/65">{photoAnalysis.blurLevel}</p>
                </div>
                <div className="rounded-2xl bg-prime-cream/40 p-3">
                  <p className="font-semibold text-prime-black">Level risiko awal</p>
                  <p className="mt-1 text-prime-black/65">{photoAnalysis.riskLevel}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-prime-black">Temuan</p>
                <ul className="mt-2 space-y-1 text-sm leading-relaxed text-prime-black/70">
                  {photoAnalysis.findings.map((finding) => (
                    <li key={finding}>• {finding}</li>
                  ))}
                </ul>
              </div>
              <p className="rounded-2xl bg-teal-50 px-3 py-2 text-sm leading-relaxed text-teal-800">
                {photoAnalysis.recommendation}
              </p>
              <p className="text-xs leading-relaxed text-prime-black/55">
                {photoAnalysis.disclaimer}
              </p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          <canvas ref={analysisCanvasRef} className="hidden" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-prime-black/55">
            Foto dan hasil analisis hanya disimpan di perangkat ini menggunakan localStorage dan tidak dikirim ke server.
          </p>
        </div>
      </div>

      {formMessage && (
        <p className="rounded-2xl bg-prime-cream/50 px-3 py-2 text-sm font-medium text-prime-black/70">
          {formMessage}
        </p>
      )}

      {showResetPhotoChoice && (
        <div className="rounded-3xl border border-prime-gold/20 bg-prime-cream/30 p-4">
          <p className="text-sm font-semibold text-prime-black">
            Foto lokal masih tersimpan. Ingin hapus juga?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-prime-black/60">
            Pilihan ini tampil inline tanpa popup. Jika dihapus, preview dan hasil analisis foto juga hilang dari localStorage.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                removePhoto();
                setShowResetPhotoChoice(false);
              }}
              className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white"
            >
              Hapus foto juga
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResetPhotoChoice(false);
                setFormMessage("Foto lokal tetap disimpan di perangkat ini.");
              }}
              className="rounded-2xl border border-prime-gold/25 bg-white px-4 py-3 text-sm font-semibold text-prime-black/70"
            >
              Simpan foto
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-2xl bg-prime-gold px-4 py-3 text-sm font-semibold text-white shadow-md shadow-prime-gold/25"
        >
          Kirim Screening
        </button>
        <button
          type="button"
          onClick={handleResetForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-prime-gold/20 px-4 py-3 text-sm font-semibold text-prime-black/70"
        >
          <RotateCcw size={16} /> Reset Form
        </button>
      </div>

      <div className="rounded-3xl border border-prime-gold/20 bg-prime-cream/25 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-prime-gold">
              Status
            </p>
            <h3 className="mt-1 text-lg font-semibold text-prime-black">
              Hasil Screening Awal
            </h3>
          </div>
          <ShieldCheck className="text-prime-gold" size={22} />
        </div>

        {!result ? (
          <div className="mt-4 rounded-2xl border border-prime-gold/20 bg-white p-4">
            <p className="text-sm font-semibold text-prime-black">
              Menunggu Form
            </p>
            <p className="mt-1 text-sm leading-relaxed text-prime-black/65">
              Lengkapi form screening untuk melihat triase awal berbasis red flag, kombinasi gejala, tingkat keluhan, dan analisis foto lokal bila tersedia.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div
              className={`rounded-2xl border p-4 ${levelClasses[result.finalRiskLevel]}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">
                Level risiko akhir
              </p>
              <p className="mt-1 text-xl font-bold">{result.finalRiskLevel}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-prime-black/70">
              <p className="font-semibold text-prime-black">
                Ringkasan keluhan
              </p>
              <p className="mt-1">{result.finalSummary}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm font-semibold text-prime-black">
                Alasan triase
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-prime-black/70">
                {result.reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            </div>
            <p className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-prime-black/75">
              {result.recommendation}
            </p>
            <p className="rounded-2xl bg-white px-4 py-3 text-xs leading-relaxed text-prime-black/55">
              {result.disclaimer}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormMessage(
                    "Silakan gunakan menu booking atau hubungi klinik untuk menjadwalkan pemeriksaan.",
                  )
                }
                className="rounded-2xl bg-prime-gold px-4 py-3 text-sm font-semibold text-white"
              >
                Booking Pemeriksaan
              </button>
              <button
                type="button"
                onClick={handleSaveResult}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-prime-gold/20 bg-white px-4 py-3 text-sm font-semibold text-prime-black/70"
              >
                <Save size={16} /> Simpan Hasil
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-prime-gold/15 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-prime-black">
              Riwayat screening lokal
            </h3>
            <p className="text-xs text-prime-black/55">
              Menyimpan maksimal 10 hasil terakhir di perangkat ini.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1 rounded-full border border-prime-gold/20 px-3 py-2 text-xs font-semibold text-prime-black/65"
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
        {historyMessage && (
          <p className="mt-3 rounded-2xl bg-prime-cream/40 px-3 py-2 text-xs font-medium text-prime-black/65">
            {historyMessage}
          </p>
        )}
        {history.length > 0 && (
          <div className="mt-3 space-y-2">
            {history.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-prime-cream/30 p-3 text-xs text-prime-black/65"
              >
                <p className="font-semibold text-prime-black">{item.finalRiskLevel}</p>
                <p className="mt-1 line-clamp-2">{item.finalSummary}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
