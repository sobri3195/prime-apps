import { AlertTriangle, Camera, Loader2, RotateCcw, ShieldCheck, ShieldAlert, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzeEyeScreening, type DurationOption } from "@/features/ai-eye/AIAnalysisEngine";

const symptoms = ["Mata merah", "Mata gatal", "Mata berair", "Mata kering", "Nyeri mata", "Pandangan buram", "Silau", "Sakit kepala", "Keluar kotoran mata", "Penglihatan mendadak menurun", "Melihat kilatan cahaya", "Riwayat trauma mata"];
const emergencySymptoms = ["Penglihatan mendadak menurun", "Melihat kilatan cahaya", "Riwayat trauma mata"];
const durations: DurationOption[] = ["Hari ini", "1–3 hari", "4–7 hari", "Lebih dari 1 minggu"];

const schema = z.object({
  complaintText: z.string().max(300),
  selectedSymptoms: z.array(z.string()),
  duration: z.enum(["Hari ini", "1–3 hari", "4–7 hari", "Lebih dari 1 minggu"], { required_error: "Pilih durasi keluhan." }),
  painScore: z.number().min(0).max(10),
}).superRefine((data, ctx) => {
  if (data.selectedSymptoms.length === 0 && data.complaintText.trim().length < 5) {
    ctx.addIssue({ code: "custom", path: ["complaintText"], message: "Isi keluhan atau pilih minimal satu gejala." });
  }
});

type FormData = z.infer<typeof schema>;

export function AIScreeningPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [cameraUnsupported, setCameraUnsupported] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<any>(null);
  const [ackEmergency, setAckEmergency] = useState(false);

  const { control, watch, setValue, reset, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema), mode: "onChange",
    defaultValues: { complaintText: "", selectedSymptoms: [], duration: undefined as never, painScore: 0 },
  });

  const w = watch();
  const hasEmergencySymptom = w.selectedSymptoms.some((s) => emergencySymptoms.includes(s));

  useEffect(() => {
    if (!cameraOpen) return;
    if (!navigator.mediaDevices?.getUserMedia) { setCameraUnsupported(true); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false }).then((s) => {
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    }).catch((err: DOMException) => {
      if (err.name === "NotAllowedError") setCameraDenied(true); else setCameraUnsupported(true);
      setCameraOpen(false);
    });
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [cameraOpen]);

  const onAnalyze = handleSubmit((data) => {
    setAnalyzeError("");
    setIsAnalyzing(true);
    setTimeout(() => {
      try {
        setResult(analyzeEyeScreening(data));
      } catch {
        setAnalyzeError("Analisis gagal. Coba lagi.");
      } finally { setIsAnalyzing(false); }
    }, 900);
  });

  return <section className="space-y-4 pb-[120px]">
    <header className="rounded-3xl bg-gradient-to-br from-[#3f320c] via-[#6a5217] to-[#b19731] p-5 text-white shadow-sm"><h1 className="text-2xl font-extrabold">AI Mata PRIME</h1><p className="text-sm text-[#f8ecd0]">Screening awal kesehatan mata</p><p className="mt-2 text-sm">Jawab beberapa pertanyaan untuk mendapatkan rekomendasi awal. AI tidak menggantikan diagnosis dokter.</p></header>
    <div className="rounded-3xl border bg-white p-4 shadow-sm"><p className="font-bold"><ShieldCheck className="mr-2 inline" size={16}/>Catatan keamanan medis</p><p className="text-sm text-prime-muted mt-2">AI Mata PRIME hanya membantu screening awal dan edukasi. Hasil bukan diagnosis dokter.</p><p className="text-xs text-prime-muted mt-1">Data gejala dan foto hanya digunakan untuk membantu analisis awal.</p></div>
    <div className="rounded-3xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{ackEmergency ? <div className="flex items-center justify-between"><span>Alert darurat sudah dibaca.</span><button onClick={()=>setAckEmergency(false)} className="text-xs underline">Lihat lagi</button></div> : <><p><ShieldAlert className="mr-1 inline" size={14}/>Segera ke IGD atau dokter mata bila mengalami penurunan penglihatan mendadak, nyeri hebat, trauma mata, kilatan cahaya, atau bayangan tirai.</p><button onClick={()=>setAckEmergency(true)} className="mt-2 rounded-xl border border-red-300 px-3 py-1 text-xs">Saya Mengerti</button></>}</div>

    <div className="rounded-3xl bg-white p-4 shadow-sm space-y-3"><p className="font-bold">Kamera AI Mata</p><button onClick={()=>setCameraOpen(true)} className="rounded-2xl bg-prime-gold px-4 py-2 text-white"><Camera className="mr-2 inline" size={16}/>Buka Kamera AI Mata</button>
      {cameraDenied && <p className="text-sm text-red-600">Akses kamera ditolak. Anda tetap bisa melanjutkan screening tanpa foto.</p>}
      {cameraUnsupported && <label className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><Upload size={16}/>Unggah foto mata<input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=()=>setCapturedImage(String(r.result)); r.readAsDataURL(f);} }}/></label>}
      {cameraOpen && <div className="space-y-2"><video ref={videoRef} autoPlay playsInline className="h-56 w-full rounded-2xl bg-black object-cover"/><button onClick={()=>{ const v=videoRef.current; if(!v) return; const c=document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d')?.drawImage(v,0,0); setStagedImage(c.toDataURL('image/jpeg')); }} className="rounded-xl bg-prime-gold px-3 py-2 text-white">Ambil Foto</button><button onClick={()=>setCameraOpen(false)} className="rounded-xl border px-3 py-2">Tutup</button></div>}
      {stagedImage && <div className="space-y-2"><img src={stagedImage} className="h-52 w-full rounded-2xl object-cover"/><div className="grid grid-cols-2 gap-2"><button onClick={()=>{ setCapturedImage(stagedImage); setStagedImage(null); setCameraOpen(false); }} className="rounded-xl bg-prime-gold py-2 text-white">Gunakan Foto</button><button onClick={()=>setStagedImage(null)} className="rounded-xl border py-2">Ulangi Foto</button></div></div>}
    </div>

    <form onSubmit={onAnalyze} className="rounded-3xl bg-white p-4 shadow-sm space-y-4">
      <Controller control={control} name="complaintText" render={({ field }) => <div><label className="text-sm font-semibold">Keluhan utama</label><textarea {...field} placeholder="Contoh: mata merah, buram, nyeri, gatal, keluar cairan, silau" className="mt-1 h-28 w-full rounded-2xl border p-3" maxLength={300}/><p className="text-xs text-prime-muted text-right">{field.value.length}/300</p>{errors.complaintText && <p className="text-xs text-red-600">{errors.complaintText.message}</p>}</div>} />
      <div><p className="text-sm font-semibold mb-2">Pilihan gejala</p><div className="grid grid-cols-2 gap-2">{symptoms.map((s)=><button key={s} type="button" onClick={()=>setValue("selectedSymptoms", w.selectedSymptoms.includes(s)?w.selectedSymptoms.filter(x=>x!==s):[...w.selectedSymptoms,s], { shouldValidate:true })} className={`min-h-[44px] rounded-xl border px-2 text-sm ${w.selectedSymptoms.includes(s)?"bg-prime-gold text-white":"bg-white"}`}>{s}</button>)}</div>{hasEmergencySymptom && <p className="mt-2 text-xs text-amber-700"><AlertTriangle className="mr-1 inline" size={14}/>Gejala ini perlu pemeriksaan dokter segera.</p>}</div>
      <div><p className="text-sm font-semibold mb-2">Sejak kapan keluhan dirasakan?</p><div className="grid grid-cols-2 gap-2">{durations.map((d)=><button key={d} type="button" onClick={()=>setValue("duration", d, { shouldValidate:true })} className={`min-h-[44px] rounded-xl border text-sm ${w.duration===d?"bg-prime-gold-soft border-prime-gold":""}`}>{d}</button>)}</div>{errors.duration && <p className="text-xs text-red-600 mt-1">{errors.duration.message}</p>}</div>
      <div><label className="text-sm font-semibold">Tingkat nyeri</label><p className="text-sm font-medium">Nyeri: {w.painScore}/10</p><Controller control={control} name="painScore" render={({ field }) => <input type="range" min={0} max={10} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} className="w-full accent-prime-gold h-3"/>} /><div className="flex justify-between text-xs"><span>Tidak nyeri</span><span>Nyeri berat</span></div>{w.painScore >= 7 && <p className="text-xs text-amber-700">Nyeri berat sebaiknya segera diperiksa dokter mata.</p>}</div>
      <button disabled={!isValid || isAnalyzing} className="prime-cta-dark w-full py-3 disabled:opacity-40">{isAnalyzing ? <><Loader2 className="mr-2 inline animate-spin" size={16}/>Menganalisis keluhan...</> : "Analisa Sekarang"}</button>
      {!isValid && <p className="text-xs text-prime-muted">Lengkapi keluhan dan durasi untuk mulai analisis.</p>}
    </form>

    {!result && !isAnalyzing && !analyzeError && <div className="rounded-3xl border border-dashed bg-white p-4 text-sm text-prime-muted">Belum ada hasil analisis. Isi form lalu klik Analisa Sekarang.</div>}
    {analyzeError && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{analyzeError}</div>}
    {result && <article className="rounded-3xl bg-white p-4 shadow-sm space-y-2"><p className="font-bold text-lg">Hasil Analisis AI</p><p><b>Level Risiko:</b> {result.riskLevel}</p><p>{result.summary}</p><ul className="list-disc pl-5 text-sm"><li>Gejala utama: {w.selectedSymptoms.join(", ") || "Tidak dipilih"}</li><li>Durasi: {w.duration}</li><li>Tingkat nyeri: {w.painScore}/10</li><li>Gejala bahaya: {hasEmergencySymptom ? "Ada" : "Tidak"}</li></ul><p className="text-sm">Rekomendasi: {result.recommendation}</p><div className="grid grid-cols-2 gap-2 pt-2"><button onClick={()=>navigate('/booking')} className="rounded-xl bg-prime-gold py-2 text-white">Booking Pemeriksaan</button><button onClick={()=>{ localStorage.setItem('ai-screening-result', JSON.stringify(result)); setToast('Hasil screening tersimpan.'); }} className="rounded-xl border py-2">Simpan Hasil</button><button onClick={()=>{ reset({ complaintText:'', selectedSymptoms:[], duration: undefined as never, painScore:0 }); setResult(null); setCapturedImage(null); }} className="rounded-xl border py-2"><RotateCcw className="mr-1 inline" size={14}/>Ulangi Screening</button><button onClick={()=>navigate('/laporan')} className="rounded-xl border py-2">Lihat Laporan</button></div></article>}
    {toast && <div role="status" className="fixed left-1/2 bottom-28 z-50 w-[min(390px,calc(100%-2rem))] -translate-x-1/2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white">{toast}<button className="ml-2" onClick={()=>setToast("")} aria-label="Tutup toast"><X className="inline" size={14}/></button></div>}
  </section>;
}
