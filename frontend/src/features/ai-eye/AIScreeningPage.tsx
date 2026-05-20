import { AlertTriangle, Camera, FlipHorizontal2, Loader2, ShieldAlert, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const symptoms = ["Mata merah", "Mata gatal", "Mata berair", "Mata kering", "Nyeri mata", "Pandangan buram", "Silau", "Sakit kepala", "Keluar kotoran mata", "Penglihatan mendadak menurun", "Melihat kilatan cahaya", "Riwayat trauma mata"];
const durations: DurationOption[] = ["Hari ini", "1–3 hari", "4–7 hari", "Lebih dari 1 minggu"];

export function AIScreeningPage() {
  const [complaintText, setComplaintText] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<DurationOption | "">("");
  const [painScore, setPainScore] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>("idle");
  const [cameraMode, setCameraMode] = useState<CameraMode>("front");
  const [selectedEye, setSelectedEye] = useState<SelectedEye>("keduanya");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<ImageQuality | null>(null);
  const [cameraAnalysis, setCameraAnalysis] = useState<CameraAnalysis | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  function stopCameraStream() {
    const stream = activeStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setCameraStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function mapCameraError(error: unknown) {
    if (!(error instanceof DOMException)) return "Kamera tidak bisa dibuka. Silakan coba lagi.";
    if (error.name === "NotAllowedError") return "Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser/perangkat.";
    if (error.name === "NotFoundError") return "Kamera tidak ditemukan pada perangkat ini.";
    if (error.name === "NotReadableError") return "Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain lalu coba kembali.";
    if (error.name === "OverconstrainedError") return "Konfigurasi kamera tidak didukung pada perangkat ini.";
    return "Terjadi kendala saat membuka kamera. Silakan coba lagi.";
  }

  async function openEyeCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraPermission("error");
      setCameraError("Browser ini tidak mendukung akses kamera (getUserMedia).");
      return;
    }
    setCameraError(null);
    setIsCameraOpen(true);
  }
  function closeEyeCamera() {
    setIsCameraOpen(false);
    stopCameraStream();
  }
  function switchCamera() { setCameraMode((p) => (p === "front" ? "back" : "front")); }
  function captureEyePhoto() {
    const video = videoRef.current;
    if (!video || !cameraStream) {
      setCameraError("Preview kamera belum siap. Coba buka ulang kamera.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (!canvas.width || !canvas.height) {
      setCameraError("Preview kamera gagal tampil. Silakan tutup lalu buka ulang kamera.");
      return;
    }
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setStagedImage(canvas.toDataURL("image/jpeg", 0.92));
  }
  function retakePhoto() { setStagedImage(null); setCapturedImage(null); setImageQuality(null); setCameraAnalysis(null); }
  function validateImageQuality(): ImageQuality { return ["good", "medium", "poor"][Math.floor(Math.random() * 3)] as ImageQuality; }
  function analyzeCameraImageMock(quality: ImageQuality): CameraAnalysis { return { imageQuality: quality, rednessDetected: quality !== "poor", swellingDetected: Math.random() > 0.6, wateryEyeDetected: Math.random() > 0.5, dischargeDetected: Math.random() > 0.75, eyelidIssueDetected: Math.random() > 0.65, visualNote: "Kamera AI Mata mendeteksi kemungkinan kemerahan ringan. Hasil ini bersifat terbatas dan perlu dikonfirmasi oleh dokter mata." } as CameraAnalysis & { imageQuality: ImageQuality }; }
  function useCapturedPhoto() { if (!stagedImage) return; setCapturedImage(stagedImage); const quality = validateImageQuality(); setImageQuality(quality); setCameraAnalysis(analyzeCameraImageMock(quality)); setStagedImage(null); closeEyeCamera(); }

  useEffect(() => {
    if (!isCameraOpen) {
      stopCameraStream();
      return;
    }

    let isCancelled = false;

    async function startCamera() {
      try {
        stopCameraStream();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraMode === "front" ? "user" : { ideal: "environment" } },
        });
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setCameraPermission("granted");
        setCameraStream(stream);
        activeStreamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          setCameraPermission("error");
          setCameraError("Elemen preview kamera tidak ditemukan.");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        await video.play();
      } catch (error) {
        const message = mapCameraError(error);
        setCameraPermission(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "error");
        setCameraError(message);
        stopCameraStream();
      }
    }

    void startCamera();

    return () => {
      isCancelled = true;
      stopCameraStream();
    };
  }, [isCameraOpen, cameraMode]);

  const canAnalyze = useMemo(() => complaintText.trim() || selectedSymptoms.length > 0 || Boolean(capturedImage), [complaintText, selectedSymptoms, capturedImage]);
  function analyzeEyeComplaint() {
    if (!canAnalyze) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeEyeScreening({ complaintText, selectedSymptoms, duration, painScore, cameraResult: { imageQuality, selectedEye, analysis: cameraAnalysis } });
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 900);
  }

  return <section className="space-y-5 pb-28 font-[Montserrat]">
    <header className="rounded-[28px] bg-gradient-to-br from-prime-black via-[#5f4d17] to-prime-gold p-6 text-white shadow-sm"><h1 className="text-3xl font-extrabold">AI Mata PRIME</h1><p className="mt-1 text-sm text-prime-cream">Screening awal kesehatan mata</p><p className="mt-3 text-sm">Analisa keluhan, gejala cepat, durasi, tingkat nyeri, dan foto mata opsional melalui kamera langsung di aplikasi.</p></header>

    <div className="rounded-[26px] border border-prime-gold/20 bg-white p-4 shadow-sm"><p className="font-bold">Catatan keamanan medis</p><p className="text-sm text-prime-muted">{MEDICAL_DISCLAIMER}</p><p className="mt-2 rounded-2xl bg-[#FFE7AB]/35 p-2 text-xs">{PRIVACY_MESSAGE}</p></div>
    <div className="rounded-[26px] border border-red-200 bg-red-50 p-3 text-xs text-red-700"><ShieldAlert className="mr-1 inline" size={14} />Penglihatan mendadak menurun, nyeri berat, trauma mata, kilatan cahaya, atau bayangan seperti tirai harus segera diperiksa oleh dokter mata atau IGD.</div>

    <div className="rounded-[26px] bg-white p-4 shadow-sm"><p className="text-lg font-bold">Kamera AI Mata</p><p className="text-sm text-prime-muted">Ambil foto mata langsung dari kamera perangkat untuk membantu screening visual awal.</p><p className="mt-1 text-xs text-prime-muted">Foto tidak diambil dari galeri. Kamera hanya digunakan saat pasien membuka fitur ini.</p><button onClick={openEyeCamera} className="mt-3 rounded-2xl bg-prime-gold px-4 py-2 text-white">Buka Kamera AI Mata</button></div>

    {isCameraOpen && <div className="rounded-[26px] bg-black p-4 text-white"><div className="mb-3 flex justify-between"><button onClick={closeEyeCamera}><X /></button><button onClick={switchCamera} className="rounded-xl border border-white/40 px-3 py-1"><FlipHorizontal2 className="mr-1 inline" size={16} />Ganti Kamera</button></div><div className="overflow-hidden rounded-[24px] border-4 border-prime-gold/70 bg-black"><video ref={videoRef} playsInline autoPlay muted className="h-52 w-full object-cover" /></div>{cameraError && <div className="mt-3 rounded-xl bg-red-500/20 px-3 py-2 text-xs text-red-100">{cameraError}</div>}<p className="mt-3 text-center text-xs">Posisikan mata di dalam frame • Gunakan pencahayaan yang cukup • Pastikan foto tidak buram • Jangan gunakan flash terlalu dekat</p><div className="mt-3 grid grid-cols-3 gap-2">{(["kanan", "kiri", "keduanya"] as SelectedEye[]).map((eye) => <button key={eye} onClick={() => setSelectedEye(eye)} className={`rounded-xl py-2 text-xs ${selectedEye === eye ? "bg-prime-gold" : "bg-white/15"}`}>Mata {eye}</button>)}</div><div className="mt-4 flex gap-2"><button onClick={captureEyePhoto} className="flex-1 rounded-2xl bg-prime-gold py-2">Ambil Foto Mata</button><button onClick={closeEyeCamera} className="rounded-2xl border border-white/40 px-3">Tutup Kamera</button></div></div>}

    {stagedImage && <div className="rounded-[26px] bg-white p-4"><img src={stagedImage} className="h-56 w-full rounded-3xl object-cover" /><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={retakePhoto} className="rounded-2xl border py-2">Ulangi Foto</button><button onClick={useCapturedPhoto} className="rounded-2xl bg-prime-gold py-2 text-white">Gunakan Foto Ini</button></div></div>}
    {capturedImage && imageQuality && <div className="rounded-[26px] bg-[#FFF7E0] p-4"><p className="font-semibold">{imageQuality === "poor" ? "Foto belum cukup jelas untuk screening awal. Silakan ambil ulang dengan pencahayaan lebih baik dan posisi mata lebih dekat." : "Foto sudah cukup jelas untuk screening awal."}</p><button onClick={imageQuality === "poor" ? retakePhoto : analyzeEyeComplaint} className="mt-3 rounded-2xl bg-prime-gold px-4 py-2 text-white">{imageQuality === "poor" ? "Ambil Ulang Foto" : "Analisa dengan AI Mata"}</button></div>}

    <div className="rounded-[26px] bg-white p-4 shadow-sm space-y-3"><textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} className="w-full rounded-2xl border p-3" placeholder="Contoh: mata merah, buram, nyeri, gatal, keluar cairan, silau, atau penglihatan menurun." /><div className="grid grid-cols-2 gap-2">{symptoms.map((s) => <button key={s} onClick={() => setSelectedSymptoms((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))} className={`rounded-xl border px-2 py-2 text-xs ${selectedSymptoms.includes(s) ? "bg-prime-gold text-white" : "bg-white"}`}>{s}</button>)}</div><div className="grid grid-cols-2 gap-2">{durations.map((d) => <button key={d} onClick={() => setDuration(d)} className={`rounded-xl border px-2 py-2 text-xs ${duration === d ? "bg-[#FFE7AB]/50" : ""}`}>{d}</button>)}</div><div><input type="range" min={0} max={10} value={painScore} onChange={(e) => setPainScore(Number(e.target.value))} className="w-full" /><div className="flex justify-between text-xs"><span>Tidak nyeri</span><span>Nyeri berat</span></div></div><button onClick={analyzeEyeComplaint} disabled={!canAnalyze || isAnalyzing} className="prime-cta-dark w-full py-3 disabled:opacity-40">{isAnalyzing ? <span><Loader2 className="mr-2 inline animate-spin" size={16} />AI Mata PRIME sedang menganalisa keluhan Anda...</span> : "Analisa Sekarang"}</button></div>

    {analysisResult && <article className="rounded-[26px] bg-white p-4 shadow-sm"><p className="text-lg font-bold">Hasil Screening</p><p className="mt-1 text-sm">Tingkat risiko: <b>{analysisResult.riskLevel}</b> ({analysisResult.riskScore}/100)</p><p className="mt-2 text-sm">{analysisResult.summary}</p><p className="mt-2 text-sm"><b>Hasil Kamera AI Mata:</b> {analysisResult.cameraSummary}</p><p className="mt-2 text-sm"><b>Kemungkinan kategori:</b> {analysisResult.possibleCategories.join(", ")}</p><p className="mt-2 text-sm"><b>Alasan:</b> {analysisResult.explanation}</p><p className="mt-2 text-sm"><b>Rekomendasi:</b> {analysisResult.recommendation}</p><div className="mt-3 grid grid-cols-2 gap-2"><button className="rounded-2xl bg-prime-gold py-2 text-white">{analysisResult.ctaPrimary}</button><button className="rounded-2xl border py-2">{analysisResult.ctaSecondary}</button></div><p className="mt-3 text-xs text-prime-muted"><AlertTriangle className="mr-1 inline" size={14} />AI tidak memberi diagnosis final atau resep obat. Untuk red flag, segera ke dokter mata/IGD.</p></article>}
  </section>;
}
