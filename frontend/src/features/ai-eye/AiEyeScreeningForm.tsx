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

const levelClasses: Record<ScreeningResult["level"], string> = {
  Rendah: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Sedang: "border-amber-100 bg-amber-50 text-amber-700",
  Tinggi: "border-orange-100 bg-orange-50 text-orange-700",
  "Darurat / Segera ke dokter": "border-red-100 bg-red-50 text-red-700",
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
    form.photoPreview ||
    form.severity !== emptyScreeningForm.severity,
  );
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
  const [cameraError, setCameraError] = useState("");
  const [photoPreview, setPhotoPreview] = useState(
    () => form.photoPreview ?? "",
  );
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  }, [cameraStream]);

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
  };

  const startCamera = async () => {
    setCameraError("");
    setFormMessage("");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraError("Kamera tidak didukung di browser ini.");
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
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
    const updatedAt = new Date().toISOString();

    setPhotoPreview(imageData);
    setForm((currentForm) => {
      const nextForm = { ...currentForm, photoPreview: imageData, updatedAt };
      saveToStorage(AI_STORAGE_KEYS.screeningForm, nextForm);
      return nextForm;
    });
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

    const imageData = canvas.toDataURL("image/jpeg", 0.72);

    if (imageData.length > 1.5 * 1024 * 1024) {
      setFormMessage(
        "Foto terlalu besar untuk disimpan lokal. Coba ambil ulang dengan pencahayaan lebih baik.",
      );
      stopCamera();
      return;
    }

    persistPhotoPreview(imageData);
    setFormMessage("Foto berhasil diambil dan disimpan lokal.");
    stopCamera();
  };

  const retakePhoto = () => {
    startCamera();
  };

  const removePhoto = () => {
    setPhotoPreview("");
    updateForm({ photoPreview: undefined });
    setCameraError("");
    setFormMessage("Foto lokal sudah dihapus dari form screening.");
  };

  const handleSubmit = () => {
    if (!isFormReady(form)) {
      setFormMessage(
        "Lengkapi keluhan utama, durasi, dan minimal satu gejala sebelum mengirim screening.",
      );
      return;
    }

    const screeningResult = evaluateEyeScreening(form);
    setResult(screeningResult);
    saveToStorage(AI_STORAGE_KEYS.screeningResult, screeningResult);
    setFormMessage(
      "Hasil Screening Awal berhasil dibuat dan disimpan di perangkat ini.",
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

  const handleResetForm = () => {
    stopCamera();
    setForm(createDraft());
    setPhotoPreview("");
    setCameraError("");
    setResult(null);
    setFormMessage("Form dan hasil aktif sudah direset dari perangkat ini.");
    removeFromStorage(AI_STORAGE_KEYS.screeningForm);
    removeFromStorage(AI_STORAGE_KEYS.screeningResult);
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
          Mode lokal • localStorage
        </p>
        <h2 className="text-xl font-semibold text-prime-black">
          AI Screening Mata
        </h2>
        <p className="text-sm leading-relaxed text-prime-black/65">
          Isi keluhan Anda untuk mendapatkan screening awal.
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
                Ambil Foto Mata (Opsional)
              </p>
              <p className="text-xs leading-relaxed text-prime-black/65">
                Nyalakan kamera untuk mengambil foto mata. Foto hanya disimpan
                lokal di perangkat Anda.
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
                className="w-full rounded-[18px] border border-white/80 bg-prime-black/10 object-cover shadow-sm aspect-[4/3]"
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
                  Ambil Gambar
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
                src={photoPreview}
                alt="Preview foto mata"
                className="w-full rounded-[18px] border border-white/80 object-cover shadow-sm aspect-[4/3]"
              />
              <p className="rounded-2xl bg-white/85 px-3 py-2 text-xs font-semibold text-teal-800">
                Foto berhasil diambil dan disimpan lokal.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="rounded-2xl bg-prime-gold px-4 py-3 text-sm font-semibold text-white shadow-md shadow-prime-gold/25"
                >
                  Foto Ulang
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-2xl border border-prime-gold/25 bg-white/80 px-4 py-3 text-sm font-semibold text-prime-black/70"
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

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-prime-black/55">
            Foto hanya digunakan untuk screening awal di perangkat ini dan tidak
            dikirim ke server.
          </p>
        </div>
      </div>

      {formMessage && (
        <p className="rounded-2xl bg-prime-cream/50 px-3 py-2 text-sm font-medium text-prime-black/70">
          {formMessage}
        </p>
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
              Lengkapi form screening untuk melihat triase awal berbasis red
              flag, kombinasi gejala, dan kualitas data.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div
              className={`rounded-2xl border p-4 ${levelClasses[result.level]}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">
                Level prioritas
              </p>
              <p className="mt-1 text-xl font-bold">{result.level}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-prime-black/70">
              <p className="font-semibold text-prime-black">
                Ringkasan keluhan
              </p>
              <p className="mt-1">{result.summary}</p>
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
                <p className="font-semibold text-prime-black">{item.level}</p>
                <p className="mt-1 line-clamp-2">{item.summary}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
