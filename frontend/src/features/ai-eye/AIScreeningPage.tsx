import { AlertTriangle, Camera, CheckCircle2, Eye, FlipHorizontal2, Loader2, ShieldAlert, ShieldCheck, Sparkles, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  MEDICAL_DISCLAIMER,
  PRIVACY_MESSAGE,
  analyzeEyeScreening,
  type AIAnalysisResult,
  type CameraAnalysis,
  type CameraMode,
  type CameraPermission,
  type DurationOption,
  type ImageQuality,
  type SelectedEye,
} from "@/features/ai-eye/AIAnalysisEngine";

const symptoms = ["Mata merah", "Mata gatal", "Mata berair", "Mata kering", "Nyeri mata", "Pandangan buram", "Silau", "Keluar kotoran mata", "Penglihatan mendadak menurun", "Melihat kilatan cahaya", "Riwayat trauma mata"];
const durations: DurationOption[] = ["Hari ini", "1–3 hari", "4–7 hari", "Lebih dari 1 minggu"];
const medicalHistories = ["Lensa kontak", "Diabetes", "Hipertensi", "Riwayat trauma"];

const requestCameraPermission = async () => {
  try { await navigator.mediaDevices.getUserMedia({ video: true }); return "granted" as CameraPermission; } catch { return "denied" as CameraPermission; }
};
const validateImageQuality = (): ImageQuality => ["good", "medium", "poor"][Math.floor(Math.random() * 3)] as ImageQuality;
const analyzeCameraImageMock = (imageQuality: ImageQuality): CameraAnalysis => ({ rednessDetected: imageQuality !== "poor", swellingDetected: Math.random() > 0.5, wateryEyeDetected: Math.random() > 0.4, dischargeDetected: Math.random() > 0.7, eyelidIssueDetected: Math.random() > 0.6, visualNote: "AI mendeteksi kemungkinan kemerahan ringan pada area mata. Hasil ini bersifat terbatas dan perlu dikonfirmasi oleh dokter mata." });

function MedicalDisclaimer() { return <div className="rounded-[28px] border border-prime-gold/25 bg-white p-4 text-sm"><p className="font-extrabold text-prime-black">Catatan keamanan medis</p><p className="mt-1 text-prime-muted">{MEDICAL_DISCLAIMER}</p><p className="mt-2 rounded-2xl bg-prime-surface px-3 py-2 text-xs font-semibold text-prime-black/70">{PRIVACY_MESSAGE}</p></div>; }

function CameraPermissionState({ onRetry, onSkip }: { onRetry: () => void; onSkip: () => void }) { return <div className="rounded-3xl bg-white p-4"><p className="font-bold text-red-700">Izin kamera diperlukan untuk menggunakan Kamera AI Mata. Anda tetap dapat melakukan screening melalui input keluhan.</p><div className="mt-3 flex gap-2"><button onClick={onRetry} className="rounded-2xl bg-prime-gold px-4 py-2 text-white">Coba Lagi</button><button onClick={onSkip} className="rounded-2xl border px-4 py-2">Screening Tanpa Kamera</button></div></div>; }

function EyeCameraOverlay({ selectedEye, setSelectedEye }: { selectedEye: SelectedEye; setSelectedEye: (value: SelectedEye) => void }) { return <div className="space-y-3"><div className="mx-auto h-48 w-72 rounded-[999px] border-4 border-prime-gold/70" /><p className="text-center text-xs">Posisikan mata di dalam frame • Gunakan pencahayaan cukup • Pastikan foto tidak buram</p><div className="grid grid-cols-3 gap-2">{(["kanan", "kiri", "keduanya"] as SelectedEye[]).map((eye) => <button key={eye} onClick={() => setSelectedEye(eye)} className={`rounded-2xl px-2 py-2 text-xs ${selectedEye === eye ? "bg-prime-gold text-white" : "bg-white border"}`}>Mata {eye}</button>)}</div></div>; }

function EyeCapturePreview({ capturedImage, onRetake, onUse }: { capturedImage: string; onRetake: () => void; onUse: () => void }) { return <div className="space-y-3"><img src={capturedImage} className="h-52 w-full rounded-3xl object-cover" /><div className="grid grid-cols-2 gap-2"><button onClick={onRetake} className="rounded-2xl border px-3 py-2">Ulangi Foto</button><button onClick={onUse} className="rounded-2xl bg-prime-gold px-3 py-2 text-white">Gunakan Foto Ini</button></div></div>; }

function CameraAIAnalysis({ quality, onAnalyze, onRetake }: { quality: ImageQuality; onAnalyze: () => void; onRetake: () => void }) { const poor = quality === "poor"; return <div className="rounded-3xl bg-prime-cream/40 p-3 text-sm"><p className="font-bold">{poor ? "Foto belum cukup jelas untuk screening awal. Silakan ambil ulang dengan pencahayaan lebih baik dan posisi mata lebih dekat." : "Foto sudah cukup jelas untuk screening awal."}</p><button onClick={poor ? onRetake : onAnalyze} className="mt-3 rounded-2xl bg-prime-gold px-4 py-2 text-white">{poor ? "Ambil Ulang" : "Analisa dengan AI Mata"}</button></div>; }

function AIResultCard({ result }: { result: AIAnalysisResult }) { return <article className="rounded-3xl bg-white p-5"><h2 className="text-xl font-extrabold">Hasil Screening AI Mata</h2><p className="mt-2 text-sm">Skor Risiko: {result.riskScore}/100 ({result.riskLevel})</p><p className="mt-2 text-sm">{result.summary}</p><section className="mt-4 rounded-2xl bg-prime-surface p-3"><p className="font-bold">Hasil Kamera AI Mata</p><p className="text-sm">Kualitas foto & tanda visual dipakai sebagai screening awal. {result.cameraSectionNote ?? "Tidak ada temuan kamera tambahan."}</p></section></article>; }

export function AIScreeningPage() {
  const [complaintText, setComplaintText] = useState(""); const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]); const [duration, setDuration] = useState<DurationOption | "">(""); const [painScore, setPainScore] = useState(0); const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>("idle"); const [cameraMode, setCameraMode] = useState<CameraMode>("front"); const [selectedEye, setSelectedEye] = useState<SelectedEye>("kanan"); const [capturedImage, setCapturedImage] = useState<string | null>(null); const [imageQuality, setImageQuality] = useState<ImageQuality | null>(null); const [cameraAnalysis, setCameraAnalysis] = useState<CameraAnalysis | null>(null); const [isAnalyzingCamera, setIsAnalyzingCamera] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const cameraRef = useRef<HTMLVideoElement | null>(null);

  const canAnalyze = useMemo(() => complaintText.trim() || selectedSymptoms.length > 0, [complaintText, selectedSymptoms]);
  const startCamera = async () => { const perm = await requestCameraPermission(); setCameraPermission(perm); };
  const switchCamera = () => setCameraMode((prev) => (prev === "front" ? "back" : "front"));
  const captureEyePhoto = () => setCapturedImage("https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900");
  const retakePhoto = () => { setCapturedImage(null); setImageQuality(null); setCameraAnalysis(null); };
  const usePhoto = () => setImageQuality(validateImageQuality());

  const handleAnalyze = () => { if (!canAnalyze) return; setIsAnalyzingCamera(true); const analysis = imageQuality ? analyzeCameraImageMock(imageQuality) : null; setCameraAnalysis(analysis); const result = analyzeEyeScreening({ complaintText, selectedSymptoms, duration, painScore, medicalHistory, cameraResult: { imageQuality, selectedEye, analysis } }); setAnalysisResult(result); setIsAnalyzingCamera(false); };

  return <section className="space-y-5 pb-4"><header className="rounded-[34px] bg-gradient-to-br from-prime-black via-[#5f4d17] to-prime-gold p-5 text-white"><h1 className="text-3xl font-extrabold">Kamera AI Mata</h1><p className="mt-2 text-sm">Ambil foto mata secara langsung untuk membantu AI membaca tanda visual awal seperti kemerahan, bengkak, atau iritasi.</p><p className="mt-2 text-xs">Analisa kamera bersifat screening awal, bukan diagnosis final.</p></header><MedicalDisclaimer />
    <div className="rounded-3xl bg-white p-4"><button onClick={startCamera} className="rounded-2xl bg-prime-gold px-4 py-3 text-white"><Camera className="mr-2 inline" size={16} />Buka Kamera</button>{cameraPermission === "denied" && <CameraPermissionState onRetry={startCamera} onSkip={() => setCameraPermission("idle")} />}{cameraPermission === "granted" && <div className="mt-4 rounded-3xl bg-[#F7F3E9] p-4"><div className="mb-3 flex justify-between"><button><X /></button><button onClick={switchCamera}><FlipHorizontal2 /> {cameraMode === "front" ? "Depan" : "Belakang"}</button></div><video ref={cameraRef} className="hidden" /><EyeCameraOverlay selectedEye={selectedEye} setSelectedEye={setSelectedEye} /><button onClick={captureEyePhoto} className="mx-auto mt-4 block rounded-full bg-prime-gold p-5 text-white"><Camera /></button></div>}</div>
    {capturedImage && <EyeCapturePreview capturedImage={capturedImage} onRetake={retakePhoto} onUse={usePhoto} />}
    {imageQuality && <CameraAIAnalysis quality={imageQuality} onAnalyze={handleAnalyze} onRetake={retakePhoto} />}
    <form className="space-y-3 rounded-3xl bg-white p-4"><textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} className="w-full rounded-2xl border p-3" placeholder="Keluhan pasien" />
      <div className="grid grid-cols-2 gap-2">{symptoms.map((s) => <button key={s} type="button" onClick={() => setSelectedSymptoms((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))} className={`rounded-xl border px-2 py-2 text-xs ${selectedSymptoms.includes(s) ? "bg-prime-gold text-white" : "bg-white"}`}>{s}</button>)}</div>
      <div className="grid grid-cols-2 gap-2">{durations.map((d) => <button key={d} type="button" onClick={() => setDuration(d)} className={`rounded-xl border px-2 py-2 text-xs ${duration === d ? "bg-prime-cream" : ""}`}>{d}</button>)}</div>
      <input type="range" min={0} max={10} value={painScore} onChange={(e) => setPainScore(Number(e.target.value))} className="w-full" />
      <div className="grid grid-cols-2 gap-2">{medicalHistories.map((m) => <button key={m} type="button" onClick={() => setMedicalHistory((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]))} className="rounded-xl border px-2 py-2 text-xs">{m}</button>)}</div>
      <button type="button" onClick={handleAnalyze} className="w-full rounded-2xl bg-prime-black py-3 text-white">{isAnalyzingCamera ? <Loader2 className="mx-auto animate-spin" /> : "Analisa dengan AI Mata"}</button></form>
    <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"><ShieldAlert className="mr-2 inline" size={14} />Red flag: penglihatan mendadak menurun, nyeri berat, trauma, mata merah + buram, kilatan cahaya, tirai hitam, pengguna lensa kontak dengan nyeri/merah, diabetes dengan pandangan buram harus dirujuk ke dokter/IGD.</div>
    {analysisResult && <AIResultCard result={analysisResult} />}
  </section>;
}
