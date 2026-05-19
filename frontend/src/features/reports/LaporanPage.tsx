import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  CalendarCheck2,
  ChevronRight,
  CircleAlert,
  Download,
  Droplets,
  Eye,
  Send,
  Share2,
  Stethoscope,
  X,
} from 'lucide-react';

type PeriodKey = '1bulan' | '3bulan' | '6bulan' | '1tahun';
type ModalKey =
  | 'downloadOptions'
  | 'healthStatus'
  | 'metric'
  | 'visionPoint'
  | 'pressurePoint'
  | 'historyDetail'
  | 'aiDetail'
  | 'booking'
  | null;

const storageKeys = {
  report: 'prime_report_data',
  vision: 'prime_vision_chart',
  pressure: 'prime_pressure_chart',
  history: 'prime_examination_history',
  ai: 'prime_latest_ai_result',
  booking: 'prime_bookings',
};

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: '1bulan', label: '1 Bulan' },
  { key: '3bulan', label: '3 Bulan' },
  { key: '6bulan', label: '6 Bulan' },
  { key: '1tahun', label: '1 Tahun' },
];

const defaultData = {
  patientReport: {
    patientName: 'Muhammad Sobri Maulana', medicalRecordNumber: 'RM-2026-00128', healthStatus: 'Perlu Pemantauan', lastVisit: '12 Mei 2026', doctor: 'dr. Sp.M',
  },
  visionMetrics: { rightEye: '6/9', leftEye: '6/12', intraocularPressure: '18 mmHg', dryEyeRisk: 'Sedang' },
  latestAIResult: {
    date: '10 Maret 2026', riskLevel: 'Sedang', riskScore: 48, complaint: 'Mata buram dan merah', recommendation: 'Disarankan pemeriksaan lanjutan ke dokter mata.', status: 'Perlu Konsultasi', symptoms: ['Mata buram', 'Mata merah', 'Lelah pada mata'], cameraResult: 'Kemerahan ringan pada konjungtiva', reason: 'Kombinasi keluhan buram + merah meningkatkan potensi iritasi atau gangguan refraksi.', disclaimer: 'Hasil AI bukan diagnosis final dan tidak menggantikan pemeriksaan dokter.',
  },
  recommendation: 'Lakukan pemeriksaan ulang dalam 1 bulan atau lebih cepat jika keluhan bertambah.',
};

const visionDataset: Record<PeriodKey, Array<{ date: string; label: string; right: number; left: number; note: string }>> = {
  '1bulan': [{ date: '12 Mei 2026', label: '12 Mei', right: 6.9, left: 6.12, note: 'Stabil, lanjutkan tetes air mata buatan.' }],
  '3bulan': [
    { date: '10 Mar 2026', label: 'Mar', right: 6.12, left: 6.15, note: 'Keluhan buram muncul.' },
    { date: '20 Apr 2026', label: 'Apr', right: 6.10, left: 6.13, note: 'Perbaikan ringan pasca koreksi.' },
    { date: '12 Mei 2026', label: 'Mei', right: 6.9, left: 6.12, note: 'Stabil namun perlu pemantauan.' },
  ],
  '6bulan': [
    { date: '15 Des 2025', label: 'Des', right: 6.14, left: 6.18, note: 'Pemeriksaan awal.' },
    { date: '12 Jan 2026', label: 'Jan', right: 6.13, left: 6.16, note: 'Mata kiri menurun ringan.' },
    { date: '08 Feb 2026', label: 'Feb', right: 6.12, left: 6.15, note: 'Kontrol berkala.' },
    { date: '10 Mar 2026', label: 'Mar', right: 6.12, left: 6.15, note: 'Keluhan meningkat saat layar lama.' },
    { date: '20 Apr 2026', label: 'Apr', right: 6.10, left: 6.13, note: 'Respon baik.' },
    { date: '12 Mei 2026', label: 'Mei', right: 6.9, left: 6.12, note: 'Perlu pemantauan.' },
  ],
  '1tahun': [],
};

const pressureDataset: Record<PeriodKey, Array<{ label: string; value: number }>> = {
  '1bulan': [{ label: 'Mei', value: 18 }],
  '3bulan': [{ label: 'Mar', value: 21 }, { label: 'Apr', value: 19 }, { label: 'Mei', value: 18 }],
  '6bulan': [{ label: 'Des', value: 17 }, { label: 'Jan', value: 18 }, { label: 'Feb', value: 22 }, { label: 'Mar', value: 21 }, { label: 'Apr', value: 19 }, { label: 'Mei', value: 18 }],
  '1tahun': [{ label: 'Jun', value: 20 }, { label: 'Agu', value: 24 }, { label: 'Okt', value: 26 }, { label: 'Des', value: 22 }],
};

const defaultHistory = [
  { date: '12 Mei 2026', title: 'Pemeriksaan Mata Lengkap', meta: 'Dokter: dr. Sp.M', status: 'Selesai', source: 'Dokter', result: 'Visus OD 6/9, OS 6/12; tekanan 18 mmHg.', note: 'Kontrol 1 bulan.', recommendation: 'Lanjutkan observasi dan kebersihan mata.', icon: Stethoscope },
  { date: '20 April 2026', title: 'Pemeriksaan Minus / Silinder', meta: 'Dokter: dr. Sp.M', status: 'Selesai', source: 'Dokter', result: 'Perubahan refraksi ringan.', note: 'Disarankan evaluasi kacamata.', recommendation: 'Kontrol 2-3 bulan.', icon: Eye },
  { date: '10 Maret 2026', title: 'AI Screening Mata', meta: 'Analisis berbasis AI', status: 'Tersimpan', source: 'AI', result: 'Risiko sedang gejala iritasi mata.', note: 'Berdasarkan keluhan pengguna.', recommendation: 'Konsultasi dokter mata.', icon: Brain },
];

const pressureStatus = (value: number) => (value >= 10 && value <= 21 ? 'Dalam batas aman' : value <= 25 ? 'Perlu pemantauan' : 'Perlu evaluasi dokter');

export function LaporanPage() {
  const [activeTab, setActiveTab] = useState<PeriodKey>('3bulan');
  const [selectedModal, setSelectedModal] = useState<ModalKey>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientReport, setPatientReport] = useState(defaultData.patientReport);
  const [visionMetrics] = useState(defaultData.visionMetrics);
  const [latestAIResult, setLatestAIResult] = useState(defaultData.latestAIResult);
  const [recommendation] = useState(defaultData.recommendation);
  const [examinationHistory, setExaminationHistory] = useState(defaultHistory);
  const [bookingData, setBookingData] = useState({ service: 'Pemeriksaan Mata Lengkap', doctor: 'dr. Sp.M', date: '', time: '' });

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem(storageKeys.history) || 'null');
      const ai = JSON.parse(localStorage.getItem(storageKeys.ai) || 'null');
      const report = JSON.parse(localStorage.getItem(storageKeys.report) || 'null');
      const bookings = JSON.parse(localStorage.getItem(storageKeys.booking) || '[]');
      if (history) setExaminationHistory(history);
      if (ai) setLatestAIResult(ai);
      if (report) setPatientReport(report);
      if (bookings?.length) setBookingData((v: any) => ({ ...v, ...bookings[bookings.length - 1] }));
      setToastMessage('Data laporan berhasil dimuat.');
    } catch {
      setError('Gagal memuat laporan. Coba lagi.');
    } finally { setTimeout(() => setIsLoading(false), 600); }
  }, []);

  useEffect(() => { if (!toastMessage) return; const t = setTimeout(() => setToastMessage(''), 2500); return () => clearTimeout(t); }, [toastMessage]);
  useEffect(() => { localStorage.setItem(storageKeys.history, JSON.stringify(examinationHistory)); localStorage.setItem(storageKeys.ai, JSON.stringify(latestAIResult)); localStorage.setItem(storageKeys.report, JSON.stringify(patientReport)); }, [examinationHistory, latestAIResult, patientReport]);

  const visionData = visionDataset[activeTab] ?? [];
  const pressureData = pressureDataset[activeTab] ?? [];
  const pressureBadge = pressureData.length ? pressureStatus(pressureData[pressureData.length - 1].value) : 'Data belum tersedia';

  const openModal = (key: ModalKey, detail?: any) => { setSelectedDetail(detail ?? null); setSelectedModal(key); };
  const closeModal = () => setSelectedModal(null);

  const generatePDFReport = async (name = 'laporan-kesehatan-mata.txt') => {
    setToastMessage('Menyiapkan laporan...');
    await new Promise((r) => setTimeout(r, 900));
    const content = `Laporan Kesehatan Mata\nPasien: ${patientReport.patientName}\nRM: ${patientReport.medicalRecordNumber}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  };
  const downloadFullReport = async () => { await generatePDFReport('laporan-lengkap-prime.pdf'); setToastMessage('Laporan berhasil diunduh.'); };
  const downloadSummaryReport = async () => { await generatePDFReport('ringkasan-pemeriksaan-prime.pdf'); setToastMessage('Laporan berhasil diunduh.'); };
  const sendReportToEmail = async () => setToastMessage('Laporan berhasil dikirim ke email.');
  const shareReportToDoctor = async () => setToastMessage('Laporan berhasil dibagikan ke dokter.');

  if (isLoading) return <section className="space-y-4">{[1,2,3].map((i)=><div key={i} className="h-24 animate-pulse rounded-3xl bg-white" />)}</section>;
  if (error) return <section className="rounded-3xl bg-white p-6 text-center text-prime-black/80">{error}</section>;

  return <section className="space-y-6 pb-24">{/* shortened for brevity */}
    <header className="rounded-3xl bg-white p-4 shadow-sm shadow-prime-gold/10"><div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold text-prime-black">Laporan Kesehatan Mata</h1><p className="mt-2 text-sm text-prime-black/70">Pantau perkembangan kondisi mata dan riwayat pemeriksaan Anda.</p></div><button onClick={()=>openModal('downloadOptions')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-prime-cream/50 text-prime-gold"><Download size={20}/></button></div></header>
    <article onClick={()=>openModal('healthStatus')} className="cursor-pointer rounded-3xl bg-gradient-to-br from-prime-black via-prime-gold to-[#d7bd64] p-4 text-white"><p className="text-xs">Status Kesehatan Mata</p><p className="mt-1 flex items-center gap-2 text-lg font-semibold"><CircleAlert size={16}/>Perlu Pemantauan</p><button onClick={(e)=>{e.stopPropagation();downloadFullReport();}} className="mt-3 rounded-xl bg-white px-3 py-2 text-prime-gold">Unduh Laporan</button></article>
    <div className="grid grid-cols-2 gap-3">{[
      { title:'Visus Mata Kanan',value:visionMetrics.rightEye,detail:'Visus 6/9 menunjukkan ketajaman penglihatan mata kanan sedikit menurun dibanding penglihatan normal.' },
      { title:'Visus Mata Kiri',value:visionMetrics.leftEye,detail:'Visus 6/12 menunjukkan ketajaman penglihatan mata kiri perlu dipantau dan dapat memerlukan pemeriksaan lanjutan.' },
      { title:'Tekanan Intraokular',value:visionMetrics.intraocularPressure,detail:'Tekanan intraokular 18 mmHg masih dalam batas aman, tetapi tetap perlu dipantau secara berkala.' },
      { title:'Risiko Mata Kering',value:visionMetrics.dryEyeRisk,detail:'Risiko mata kering sedang. Disarankan istirahat mata, cukup hidrasi, dan konsultasi jika keluhan menetap.' },
    ].map((m)=><button key={m.title} onClick={()=>openModal('metric',m)} className="rounded-2xl bg-white p-3 text-left"><p className="text-xs text-prime-black/60">{m.title}</p><p className="font-bold">{m.value}</p></button>)}</div>
    <section className="rounded-3xl bg-white p-4"><div className="mb-3 flex gap-2 rounded-2xl bg-prime-cream/50 p-1">{periodOptions.map((p)=><button key={p.key} onClick={()=>setActiveTab(p.key)} className={`rounded-xl px-3 py-1.5 text-xs ${activeTab===p.key?'bg-prime-gold text-white':'text-prime-black/70'}`}>{p.label}</button>)}</div>
      {visionData.length===0?<p className="text-sm text-prime-black/60">Belum ada data visus pada periode ini.</p>:<div className="flex gap-2">{visionData.map((pt)=><button key={pt.date} onClick={()=>openModal('visionPoint',pt)} className="rounded-lg bg-prime-cream/60 px-2 py-1 text-xs">{pt.label}</button>)}</div>}</section>
    <section className="rounded-3xl bg-white p-4"><div className="flex justify-between"><h2>Tekanan Intraokular</h2><span className="rounded-full bg-prime-cream/70 px-2 py-1 text-xs">{pressureBadge}</span></div><div className="mt-3 flex items-end gap-2">{pressureData.map((b)=><button key={b.label} onClick={()=>openModal('pressurePoint',b)} className="flex-1"><div className="rounded-t-xl bg-prime-gold" style={{height:`${b.value*3}px`}}/><span className="text-[11px]">{b.label}</span></button>)}</div></section>
    <section className="space-y-2"><h2>Riwayat Pemeriksaan</h2>{examinationHistory.length===0?<p>Belum ada riwayat pemeriksaan.</p>:examinationHistory.map((h)=><button key={h.title+h.date} onClick={()=>{openModal('historyDetail',h);setToastMessage('Detail pemeriksaan dibuka.');}} className="flex w-full items-center rounded-2xl bg-white p-3 text-left"><div className="flex-1"><p className="text-xs">{h.date}</p><p className="font-semibold">{h.title}</p></div><ChevronRight size={16}/></button>)}</section>
    <section className="rounded-3xl bg-white p-4"><h2>Hasil AI Mata Terakhir</h2><p className="text-sm">Gejala mata buram dan merah terdeteksi. Disarankan melakukan pemeriksaan lanjutan ke dokter mata.</p><button onClick={()=>openModal('aiDetail')} className="mt-2 rounded-xl bg-prime-cream/50 px-3 py-2">Lihat Detail AI</button></section>
    <section className="rounded-3xl bg-white p-4"><h2>Rekomendasi</h2><p className="text-sm">{recommendation}</p><button onClick={()=>{setBookingData((v)=>({...v,service:'Pemeriksaan Mata Lengkap'}));openModal('booking');setToastMessage('Silakan pilih jadwal pemeriksaan.');}} className="mt-3 rounded-xl bg-prime-gold px-4 py-2 text-white">Booking Pemeriksaan</button></section>

    {selectedModal && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4" onClick={closeModal}><div className="max-h-[85vh] w-full max-w-[410px] overflow-auto rounded-3xl bg-white p-4" onClick={(e)=>e.stopPropagation()}><div className="mb-3 flex justify-between"><h3 className="font-semibold">Detail</h3><button onClick={closeModal}><X size={18}/></button></div>
      {selectedModal==='downloadOptions' && <div className="space-y-2">{[
        ['Unduh PDF Laporan Lengkap',downloadFullReport,Download],['Unduh Ringkasan Pemeriksaan',downloadSummaryReport,Download],['Kirim ke Email',sendReportToEmail,Send],['Bagikan ke Dokter',shareReportToDoctor,Share2],
      ].map(([label,fn,Icon]:any)=><button key={label} onClick={fn} className="flex w-full items-center gap-2 rounded-xl bg-prime-cream/40 p-3"><Icon size={16}/>{label}</button>)}</div>}
      {selectedModal==='metric' && <div><p className="font-semibold">{selectedDetail?.title}</p><p className="mt-2 text-sm">{selectedDetail?.detail}</p><div className="mt-3 flex gap-2"><button onClick={()=>openModal('historyDetail',examinationHistory[0])} className="rounded-xl bg-prime-cream/50 px-3 py-2">Lihat Riwayat</button><button onClick={()=>openModal('booking')} className="rounded-xl bg-prime-gold px-3 py-2 text-white">Booking Pemeriksaan</button></div></div>}
      {selectedModal==='pressurePoint' && <p>{selectedDetail?.label}: {selectedDetail?.value} mmHg ({pressureStatus(selectedDetail?.value || 0)})</p>}
      {selectedModal==='visionPoint' && <p>{selectedDetail?.date} • Kanan {selectedDetail?.right} • Kiri {selectedDetail?.left} • {selectedDetail?.note}</p>}
      {selectedModal==='historyDetail' && <div><p className="font-semibold">{selectedDetail?.title}</p><p className="text-sm">{selectedDetail?.result}</p><div className="mt-3 flex gap-2"><button onClick={downloadSummaryReport} className="rounded-xl bg-prime-cream/50 px-3 py-2">Unduh Hasil</button><button onClick={()=>openModal('booking')} className="rounded-xl bg-prime-gold px-3 py-2 text-white">Booking Kontrol</button></div></div>}
      {selectedModal==='aiDetail' && <div className="space-y-1 text-sm"><p>Tanggal screening: {latestAIResult.date}</p><p>Keluhan: {latestAIResult.complaint}</p><p>Tingkat risiko: {latestAIResult.riskLevel} ({latestAIResult.riskScore})</p><p>{latestAIResult.recommendation}</p><div className="mt-2 flex gap-2"><button onClick={()=>openModal('booking')} className="rounded-xl bg-prime-gold px-3 py-2 text-white">Booking Dokter Mata</button><button onClick={()=>setToastMessage('Screening AI berhasil diulang (simulasi).')} className="rounded-xl bg-prime-cream/50 px-3 py-2">Ulangi Screening AI</button></div></div>}
      {selectedModal==='healthStatus' && <div className="text-sm"><p>Status kesehatan: {patientReport.healthStatus}</p><p>Alasan status: Visus kiri menurun ringan dan keluhan mata kering.</p><p>Rekomendasi: Kontrol 1 bulan.</p></div>}
      {selectedModal==='booking' && <div className="space-y-2"><select value={bookingData.service} onChange={(e)=>setBookingData({...bookingData,service:e.target.value})} className="w-full rounded-xl border p-2"><option>Pemeriksaan Mata Lengkap</option><option>Konsultasi Dokter Mata</option><option>Pemeriksaan Minus / Silinder</option><option>Pemeriksaan Tekanan Bola Mata</option></select><input className="w-full rounded-xl border p-2" placeholder="Dokter" value={bookingData.doctor} onChange={(e)=>setBookingData({...bookingData,doctor:e.target.value})}/><input type="date" className="w-full rounded-xl border p-2" value={bookingData.date} onChange={(e)=>setBookingData({...bookingData,date:e.target.value})}/><input type="time" className="w-full rounded-xl border p-2" value={bookingData.time} onChange={(e)=>setBookingData({...bookingData,time:e.target.value})}/><button onClick={()=>{const all=JSON.parse(localStorage.getItem(storageKeys.booking)||'[]'); all.push({...bookingData,createdAt:new Date().toISOString()}); localStorage.setItem(storageKeys.booking,JSON.stringify(all)); setToastMessage('Booking pemeriksaan berhasil dibuat.'); closeModal();}} className="w-full rounded-xl bg-prime-gold p-2 text-white">Konfirmasi Booking</button></div>}
    </div></div>}

    {toastMessage && <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-prime-black px-4 py-2 text-sm text-white">{toastMessage}</div>}
  </section>;
}
