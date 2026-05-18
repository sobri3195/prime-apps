import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Eye,
  FileDown,
  Loader2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  MEDICAL_DISCLAIMER,
  PRIVACY_MESSAGE,
  analyzeEyeScreening,
  type AIAnalysisResult,
  type DurationOption,
  type RiskLevel,
} from "@/features/ai-eye/AIAnalysisEngine";

const symptoms = [
  "Mata merah",
  "Mata gatal",
  "Mata berair",
  "Mata kering",
  "Nyeri mata",
  "Pandangan buram",
  "Silau",
  "Sakit kepala",
  "Keluar kotoran mata",
  "Penglihatan mendadak menurun",
  "Melihat kilatan cahaya",
  "Riwayat trauma mata",
];

const durations: DurationOption[] = ["Hari ini", "1–3 hari", "4–7 hari", "Lebih dari 1 minggu"];

const riskClasses: Record<RiskLevel, string> = {
  Rendah: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Sedang: "border-amber-200 bg-amber-50 text-amber-800",
  Tinggi: "border-orange-200 bg-orange-50 text-orange-800",
  Darurat: "border-red-200 bg-red-50 text-red-700",
};

function toggleValue(value: string, values: string[]) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function MedicalDisclaimer() {
  return (
    <div className="rounded-[28px] border border-prime-gold/25 bg-white p-4 shadow-prime-card">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-prime-cream text-prime-gold-dark">
          <ShieldCheck size={19} />
        </span>
        <div className="space-y-2">
          <p className="text-sm font-extrabold text-prime-black">Catatan keamanan medis</p>
          <p className="text-sm leading-relaxed text-prime-muted">{MEDICAL_DISCLAIMER}</p>
          <p className="rounded-2xl bg-prime-surface px-3 py-2 text-xs font-semibold leading-relaxed text-prime-black/70">{PRIVACY_MESSAGE}</p>
        </div>
      </div>
    </div>
  );
}

export function EmergencyWarningCard() {
  return (
    <div className="rounded-[28px] border border-red-200 bg-red-50 p-4 text-red-800 shadow-prime-card">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600">
          <ShieldAlert size={20} />
        </span>
        <div>
          <p className="text-sm font-extrabold">Jika ada tanda darurat</p>
          <p className="mt-1 text-xs font-semibold leading-relaxed">
            Penglihatan mendadak menurun, nyeri berat, trauma mata, kilatan cahaya, atau bayangan seperti tirai harus segera diperiksa oleh dokter mata atau IGD.
          </p>
        </div>
      </div>
    </div>
  );
}

type SymptomSelectorProps = {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
};

export function SymptomSelector({ selectedSymptoms, onChange }: SymptomSelectorProps) {
  return (
    <div>
      <label className="text-sm font-extrabold text-prime-black">Pilihan gejala cepat</label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {symptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom);
          return (
            <button
              key={symptom}
              type="button"
              onClick={() => onChange(toggleValue(symptom, selectedSymptoms))}
              className={`rounded-2xl border px-3 py-3 text-left text-xs font-bold transition ${
                isSelected
                  ? "border-prime-gold bg-prime-gold text-white shadow-prime-gold"
                  : "border-prime-line bg-white text-prime-black hover:border-prime-gold/60 hover:bg-prime-cream/35"
              }`}
            >
              {symptom}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type PainScaleProps = {
  painScore: number;
  onChange: (score: number) => void;
};

export function PainScale({ painScore, onChange }: PainScaleProps) {
  return (
    <div className="rounded-[26px] border border-prime-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="pain-score" className="text-sm font-extrabold text-prime-black">Tingkat nyeri</label>
        <span className="rounded-full bg-prime-black px-3 py-1 text-sm font-extrabold text-prime-cream">{painScore}/10</span>
      </div>
      <input
        id="pain-score"
        type="range"
        min="0"
        max="10"
        value={painScore}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full accent-prime-gold"
      />
      <div className="mt-2 flex justify-between text-[11px] font-bold text-prime-muted">
        <span>Tidak nyeri</span>
        <span>Nyeri berat</span>
      </div>
    </div>
  );
}

type EyePhotoUploaderProps = {
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
};

export function EyePhotoUploader({ uploadedImage, onImageChange }: EyePhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onImageChange(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-[28px] border border-prime-gold/20 bg-prime-cream/30 p-4">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-prime-black">Upload foto mata opsional</p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-prime-muted">Simulasi visual assistant, siap dihubungkan ke API computer vision/backend AI.</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-prime-black px-4 py-3 text-xs font-extrabold text-white shadow-prime-soft"
        >
          <Camera size={16} /> Upload Foto Mata
        </button>
      </div>

      {uploadedImage ? (
        <div className="mt-4 space-y-3">
          <img src={uploadedImage} alt="Preview foto mata" className="h-48 w-full rounded-[24px] border border-white object-cover shadow-prime-soft" />
          <div className="rounded-2xl bg-white p-3 text-xs font-semibold leading-relaxed text-prime-black/75">
            <p className="flex items-center gap-2 text-prime-gold-dark"><CheckCircle2 size={15} /> Foto berhasil diunggah. AI akan membantu membaca gejala visual secara awal.</p>
            <p className="mt-1">Analisa foto bersifat terbatas dan perlu dikonfirmasi oleh dokter mata.</p>
          </div>
          <button type="button" onClick={() => onImageChange(null)} className="text-xs font-extrabold text-prime-gold-dark underline underline-offset-4">Hapus foto</button>
        </div>
      ) : null}
    </div>
  );
}

type AIResultCardProps = {
  result: AIAnalysisResult;
  onReset: () => void;
};

export function AIResultCard({ result, onReset }: AIResultCardProps) {
  const isEmergency = result.riskLevel === "Darurat";

  return (
    <article className="rounded-[32px] border border-prime-gold/25 bg-white p-5 shadow-prime-lift">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-prime-gold-dark">Hasil Screening AI Mata</p>
          <h2 className="mt-2 text-2xl font-extrabold text-prime-black">Ringkasan edukasi awal</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${riskClasses[result.riskLevel]}`}>Risiko {result.riskLevel}</span>
      </div>

      <div className="mt-5 space-y-4">
        <section className="rounded-[24px] bg-prime-surface p-4">
          <p className="text-xs font-extrabold text-prime-gold-dark">Ringkasan keluhan pasien</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-prime-black/80">{result.patientComplaintSummary}</p>
        </section>

        <section>
          <p className="text-xs font-extrabold text-prime-gold-dark">Kemungkinan kategori keluhan</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.categories.map((category) => (
              <span key={category} className="rounded-full bg-prime-cream/70 px-3 py-1 text-xs font-bold text-prime-black">{category}</span>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-prime-line p-4">
          <p className="text-sm font-extrabold text-prime-black">Ringkasan hasil screening</p>
          <p className="mt-2 text-sm leading-relaxed text-prime-muted">{result.summary}</p>
        </section>

        <section className={`rounded-[24px] p-4 ${isEmergency ? "bg-red-50 text-red-800" : "bg-prime-black text-white"}`}>
          <p className="text-sm font-extrabold">Rekomendasi tindakan</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed">{result.recommendation}</p>
        </section>

        {result.photoNote ? <p className="rounded-2xl bg-prime-cream/50 p-3 text-xs font-semibold leading-relaxed text-prime-black/75">{result.photoNote}</p> : null}

        <section className="rounded-[24px] border border-prime-gold/20 bg-white p-4">
          <p className="text-sm font-extrabold text-prime-black">Catatan keamanan medis</p>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-prime-muted">{MEDICAL_DISCLAIMER}</p>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-prime-muted">{result.safetyNote}</p>
        </section>

        <div className="grid gap-2">
          {result.ctas.map((cta, index) => (
            <button key={cta} type="button" className={`rounded-2xl px-4 py-3 text-sm font-extrabold shadow-prime-soft ${index === 0 ? "bg-prime-gold text-white" : "bg-prime-black text-white"}`}>
              {cta}
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-prime-line bg-white px-4 py-3 text-xs font-extrabold text-prime-black">
              <RotateCcw size={15} /> Ulangi Screening
            </button>
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-prime-gold/30 bg-prime-cream/60 px-4 py-3 text-xs font-extrabold text-prime-gold-dark">
              <FileDown size={15} /> Simpan Hasil
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AIScreeningPage() {
  const [complaintText, setComplaintText] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<DurationOption | "">("");
  const [painScore, setPainScore] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formError, setFormError] = useState("");

  const canAnalyze = useMemo(() => complaintText.trim().length > 0 || selectedSymptoms.length > 0, [complaintText, selectedSymptoms]);

  const resetScreening = () => {
    setComplaintText("");
    setSelectedSymptoms([]);
    setDuration("");
    setPainScore(0);
    setUploadedImage(null);
    setAnalysisResult(null);
    setFormError("");
  };

  const handleAnalyze = () => {
    if (!canAnalyze) {
      setFormError("Isi keluhan atau pilih minimal satu gejala sebelum analisa.");
      return;
    }

    setFormError("");
    setIsAnalyzing(true);
    window.setTimeout(() => {
      const result = analyzeEyeScreening({
        complaintText,
        selectedSymptoms,
        duration,
        painScore,
        hasUploadedImage: Boolean(uploadedImage),
      });
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <section className="space-y-6 pb-4">
      <header className="overflow-hidden rounded-[34px] bg-gradient-to-br from-prime-black via-[#5f4d17] to-prime-gold p-5 text-white shadow-prime-gold">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-prime-cream">AI Mata PRIME</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight">Screening awal kesehatan mata</h1>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-prime-cream ring-1 ring-white/20">
            <Eye size={24} />
          </span>
        </div>
        <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/88">Analisa keluhan, gejala cepat, durasi, tingkat nyeri, dan foto opsional melalui engine rule-based frontend yang aman untuk edukasi.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-extrabold text-prime-cream ring-1 ring-white/20">
          <Sparkles size={15} /> Premium gold visual assistant
        </div>
      </header>

      <MedicalDisclaimer />
      <EmergencyWarningCard />

      <form className="space-y-5 rounded-[34px] border border-prime-gold/20 bg-white p-5 shadow-prime-card" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="complaint" className="text-sm font-extrabold text-prime-black">Keluhan bebas pasien</label>
          <textarea
            id="complaint"
            value={complaintText}
            onChange={(event) => setComplaintText(event.target.value)}
            rows={5}
            placeholder="Contoh: mata merah, buram, nyeri, gatal, keluar cairan, silau, atau penglihatan menurun."
            className="mt-3 w-full resize-none rounded-[26px] border border-prime-line bg-prime-surface px-4 py-4 text-sm font-semibold leading-relaxed text-prime-black outline-none transition placeholder:text-prime-muted/70 focus:border-prime-gold focus:ring-4 focus:ring-prime-gold/15"
          />
        </div>

        <SymptomSelector selectedSymptoms={selectedSymptoms} onChange={setSelectedSymptoms} />

        <div>
          <label className="text-sm font-extrabold text-prime-black">Durasi keluhan</label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {durations.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDuration(item)}
                className={`rounded-2xl border px-3 py-3 text-xs font-extrabold transition ${duration === item ? "border-prime-gold bg-prime-cream text-prime-gold-dark" : "border-prime-line bg-white text-prime-muted hover:border-prime-gold/60"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <PainScale painScore={painScore} onChange={setPainScore} />
        <EyePhotoUploader uploadedImage={uploadedImage} onImageChange={setUploadedImage} />

        {formError ? (
          <p className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-xs font-extrabold text-red-700"><AlertTriangle size={15} /> {formError}</p>
        ) : null}

        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-prime-gold px-5 py-4 text-sm font-extrabold text-white shadow-prime-gold transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {isAnalyzing ? "AI sedang menganalisa keluhan Anda..." : "Analisa Sekarang"}
        </button>
      </form>

      {analysisResult ? <AIResultCard result={analysisResult} onReset={resetScreening} /> : null}
    </section>
  );
}
