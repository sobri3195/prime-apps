import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Brain,
  CalendarCheck2,
  ChevronRight,
  CircleAlert,
  Download,
  Droplets,
  Eye,
  FileText,
  ScanSearch,
  Send,
  Share2,
  Stethoscope,
  X,
} from 'lucide-react';

type PeriodKey = '1bulan' | '3bulan' | '6bulan' | '1tahun';
type ModalKey = 'downloadOptions' | 'healthStatus' | 'metric' | 'visionPoint' | 'pressurePoint' | 'historyDetail' | 'aiDetail' | null;

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: '1bulan', label: '1 Bulan' },
  { key: '3bulan', label: '3 Bulan' },
  { key: '6bulan', label: '6 Bulan' },
  { key: '1tahun', label: '1 Tahun' },
];

const visionDataset: Record<PeriodKey, Array<{ date: string; label: string; right: number; left: number; note: string }>> = {
  '1bulan': [{ date: '12 Mei 2026', label: '12 Mei', right: 6.9, left: 6.12, note: 'Stabil, lanjutkan tetes air mata buatan.' }],
  '3bulan': [
    { date: '10 Mar 2026', label: 'Mar', right: 6.12, left: 6.15, note: 'Keluhan buram muncul.' },
    { date: '20 Apr 2026', label: 'Apr', right: 6.1, left: 6.13, note: 'Perbaikan ringan pasca koreksi.' },
    { date: '12 Mei 2026', label: 'Mei', right: 6.9, left: 6.12, note: 'Stabil namun perlu pemantauan.' },
  ],
  '6bulan': [
    { date: '15 Des 2025', label: 'Des', right: 6.14, left: 6.18, note: 'Pemeriksaan awal.' },
    { date: '12 Jan 2026', label: 'Jan', right: 6.13, left: 6.16, note: 'Mata kiri menurun ringan.' },
    { date: '08 Feb 2026', label: 'Feb', right: 6.12, left: 6.15, note: 'Kontrol berkala.' },
    { date: '10 Mar 2026', label: 'Mar', right: 6.12, left: 6.15, note: 'Keluhan meningkat saat layar lama.' },
    { date: '20 Apr 2026', label: 'Apr', right: 6.1, left: 6.13, note: 'Respon baik.' },
    { date: '12 Mei 2026', label: 'Mei', right: 6.9, left: 6.12, note: 'Perlu pemantauan.' },
  ],
  '1tahun': [
    { date: 'Jun 2025', label: 'Jun', right: 6.16, left: 6.2, note: 'Baseline.' },
    { date: 'Sep 2025', label: 'Sep', right: 6.15, left: 6.18, note: 'Stabil.' },
    { date: 'Des 2025', label: 'Des', right: 6.14, left: 6.18, note: 'Keluhan ringan.' },
    { date: 'Mar 2026', label: 'Mar', right: 6.12, left: 6.15, note: 'Monitoring.' },
    { date: 'Mei 2026', label: 'Mei', right: 6.9, left: 6.12, note: 'Perlu pemantauan.' },
  ],
};

const pressureDataset: Record<PeriodKey, Array<{ label: string; value: number }>> = {
  '1bulan': [{ label: 'Mei', value: 18 }],
  '3bulan': [{ label: 'Mar', value: 21 }, { label: 'Apr', value: 19 }, { label: 'Mei', value: 18 }],
  '6bulan': [{ label: 'Des', value: 17 }, { label: 'Jan', value: 18 }, { label: 'Feb', value: 22 }, { label: 'Mar', value: 21 }, { label: 'Apr', value: 19 }, { label: 'Mei', value: 18 }],
  '1tahun': [{ label: 'Jun', value: 20 }, { label: 'Agu', value: 24 }, { label: 'Okt', value: 26 }, { label: 'Des', value: 22 }],
};

const historyItems = [
  { date: '12 Mei 2026', title: 'Pemeriksaan Mata Lengkap', meta: 'Dokter: dr. Sp.M', status: 'Selesai', result: 'Visus OD 6/9, OS 6/12; tekanan 18 mmHg.' },
  { date: '20 April 2026', title: 'Pemeriksaan Minus / Silinder', meta: 'Dokter: dr. Sp.M', status: 'Selesai', result: 'Perubahan refraksi ringan; evaluasi kacamata.' },
  { date: '10 Maret 2026', title: 'AI Screening Mata', meta: 'Analisis berbasis AI', status: 'Tersimpan', result: 'Risiko sedang, perlu konsultasi dokter mata.' },
];

const pressureStatus = (value: number) => (value >= 10 && value <= 21 ? 'Dalam batas aman' : value <= 25 ? 'Perlu pemantauan' : 'Perlu evaluasi dokter');

export function LaporanPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PeriodKey>('3bulan');
  const [selectedModal, setSelectedModal] = useState<ModalKey>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [toast, setToast] = useState('');

  const visionData = visionDataset[activeTab];
  const pressureData = pressureDataset[activeTab];
  const pressureBadge = pressureStatus(pressureData[pressureData.length - 1]?.value ?? 18);

  const chartPoints = useMemo(() => {
    if (!visionData.length) return { right: '', left: '' };
    const max = Math.max(...visionData.map((v) => Math.max(v.right, v.left)));
    const min = Math.min(...visionData.map((v) => Math.min(v.right, v.left)));
    const range = Math.max(max - min, 0.4);
    const mapPoints = (key: 'right' | 'left') =>
      visionData.map((point, i) => `${(i / Math.max(visionData.length - 1, 1)) * 100},${80 - ((point[key] - min) / range) * 64}`).join(' ');
    return { right: mapPoints('right'), left: mapPoints('left') };
  }, [visionData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const openModal = (key: ModalKey, detail?: any) => {
    setSelectedDetail(detail ?? null);
    setSelectedModal(key);
  };

  return (
    <section className="space-y-5 pb-[calc(120px+env(safe-area-inset-bottom))]">
      <header className="rounded-[24px] bg-white p-5 shadow-[0_12px_28px_rgba(35,31,32,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-prime-black">Laporan Kesehatan Mata</h1>
            <p className="mt-2 text-sm text-prime-black/70">Pantau kondisi mata Anda secara terstruktur dan mudah dibaca.</p>
          </div>
          <button onClick={() => openModal('downloadOptions')} className="prime-interactive rounded-2xl bg-prime-cream/70 p-3 text-prime-gold">
            <Download size={20} />
          </button>
        </div>
      </header>

      <article onClick={() => openModal('healthStatus')} className="prime-interactive cursor-pointer rounded-[24px] bg-gradient-to-br from-[#231F20] via-[#7f6922] to-[#B19731] p-5 text-white">
        <div className="flex items-center gap-2 text-sm"><CircleAlert size={16} />Status Kesehatan Mata</div>
        <p className="mt-2 text-xl font-bold">Perlu Pemantauan</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-2 rounded-2xl bg-white/12 p-3">
            <p className="text-white/80">Kunjungan terakhir</p><p className="font-semibold">12 Mei 2026</p>
            <p className="text-white/80">Nomor rekam medis</p><p className="font-semibold">RM-2026-00128</p>
          </div>
          <div className="space-y-2 rounded-2xl bg-white/12 p-3">
            <p className="text-white/80">Dokter pemeriksa</p><p className="font-semibold">dr. Sp.M</p>
            <p className="text-white/80">Status laporan</p><p className="font-semibold">Perlu Pemantauan</p>
          </div>
        </div>
        <button className="prime-interactive prime-cta-gold mt-4 px-4 py-2">Unduh Laporan</button>
      </article>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Eye, label: 'Visus Mata Kanan', value: '6/9', detail: 'Ketajaman penglihatan sedikit menurun dari normal.' },
          { icon: Eye, label: 'Visus Mata Kiri', value: '6/12', detail: 'Perlu pemantauan lanjutan untuk mata kiri.' },
          { icon: Activity, label: 'Tekanan Intraokular', value: '18 mmHg', detail: 'Tekanan saat ini masih dalam batas aman.' },
          { icon: Droplets, label: 'Risiko Mata Kering', value: 'Sedang', detail: 'Perbanyak istirahat layar dan hidrasi mata.' },
        ].map((item) => (
          <button key={item.label} onClick={() => openModal('metric', item)} className="prime-interactive rounded-[20px] bg-white p-4 text-left shadow-sm">
            <item.icon size={16} className="text-prime-gold" />
            <p className="mt-2 text-xs text-prime-black/65">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-prime-black">{item.value}</p>
          </button>
        ))}
      </div>

      <section className="rounded-[24px] bg-white p-5">
        <h2 className="text-lg font-bold">Grafik Perkembangan Visus</h2>
        <p className="text-sm text-prime-black/65">Perbandingan hasil pemeriksaan dari waktu ke waktu</p>
        <div className="mt-3 flex flex-wrap gap-2 rounded-2xl bg-prime-cream/45 p-1.5">
          {periodOptions.map((period) => (
            <button key={period.key} onClick={() => setActiveTab(period.key)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${activeTab === period.key ? 'bg-prime-gold text-white' : 'text-prime-black/70 hover:bg-white'}`}>
              {period.label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-[#fffaf0] p-3">
          <svg viewBox="0 0 100 86" className="h-44 w-full">
            <polyline fill="none" stroke="#B19731" strokeWidth="1.8" points={chartPoints.right} />
            <polyline fill="none" stroke="#231F20" strokeWidth="1.8" points={chartPoints.left} />
            {visionData.map((p, i) => {
              const x = (i / Math.max(visionData.length - 1, 1)) * 100;
              return (
                <g key={p.date}>
                  <circle cx={x} cy={parseFloat(chartPoints.right.split(' ')[i]?.split(',')[1] || '0')} r="1.8" fill="#B19731" onClick={() => openModal('visionPoint', p)} className="cursor-pointer" />
                  <circle cx={x} cy={parseFloat(chartPoints.left.split(' ')[i]?.split(',')[1] || '0')} r="1.8" fill="#231F20" onClick={() => openModal('visionPoint', p)} className="cursor-pointer" />
                </g>
              );
            })}
          </svg>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-prime-gold" />Mata kanan</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-prime-black" />Mata kiri</span>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Tekanan Intraokular</h2>
          <span className="rounded-full bg-prime-cream px-3 py-1 text-xs font-semibold text-prime-black">{pressureBadge}</span>
        </div>
        <div className="mt-4 flex min-h-[170px] items-end gap-2 rounded-2xl bg-[#fffaf0] p-4">
          {pressureData.map((bar) => (
            <button key={bar.label} onClick={() => openModal('pressurePoint', bar)} className="prime-interactive flex flex-1 flex-col items-center justify-end gap-2">
              <div className="w-full rounded-t-xl bg-prime-gold" style={{ height: `${Math.max(bar.value * 4, 64)}px` }} />
              <span className="text-[11px] font-semibold">{bar.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-prime-black">Riwayat Pemeriksaan</h2>
        {historyItems.map((item) => (
          <button key={item.title + item.date} onClick={() => openModal('historyDetail', item)} className="prime-interactive flex w-full items-center rounded-[20px] bg-white p-4 text-left">
            <div className="flex-1">
              <p className="text-xs text-prime-black/60">{item.date}</p>
              <p className="mt-1 font-bold text-prime-black">{item.title}</p>
              <p className="text-sm text-prime-black/75">{item.meta}</p>
              <p className="mt-1 text-xs font-semibold text-prime-gold">Status: {item.status}</p>
            </div>
            <ChevronRight size={16} className="text-prime-black/50" />
          </button>
        ))}
      </section>

      <section className="rounded-[24px] bg-white p-5">
        <h2 className="text-lg font-bold">Hasil AI Mata Terakhir</h2>
        <p className="mt-2 text-sm text-prime-black/75">Risiko: Sedang • Keluhan: Mata buram dan merah. AI menyarankan pemeriksaan lanjutan.</p>
        <button onClick={() => openModal('aiDetail')} className="prime-interactive prime-cta-dark mt-4 w-full px-4 py-2">Lihat Detail AI</button>
      </section>

      <section className="rounded-[24px] bg-white p-5">
        <h2 className="text-lg font-bold">Rekomendasi</h2>
        <p className="mt-2 text-sm text-prime-black/75">Lakukan pemeriksaan ulang 1 bulan lagi atau lebih cepat jika keluhan bertambah.</p>
        <button onClick={() => navigate('/booking', { state: { service: 'Pemeriksaan Mata Lengkap' } })} className="prime-interactive prime-cta-gold mt-4 w-full px-4 py-3 text-white">Booking Pemeriksaan</button>
      </section>

      {selectedModal && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4" onClick={() => setSelectedModal(null)}><div className="max-h-[85vh] w-full max-w-[410px] overflow-auto rounded-[24px] bg-white p-4" onClick={(e) => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Detail</h3><button onClick={() => setSelectedModal(null)} className="rounded-xl p-1.5 hover:bg-prime-cream/40"><X size={18} /></button></div>
        {selectedModal === 'metric' && <p className="text-sm">{selectedDetail?.detail}</p>}
        {selectedModal === 'pressurePoint' && <p className="text-sm">{selectedDetail?.label}: {selectedDetail?.value} mmHg ({pressureStatus(selectedDetail?.value || 0)})</p>}
        {selectedModal === 'visionPoint' && <p className="text-sm">{selectedDetail?.date} • Mata kanan {selectedDetail?.right} • Mata kiri {selectedDetail?.left}</p>}
        {selectedModal === 'healthStatus' && <p className="text-sm">Status kesehatan saat ini: Perlu Pemantauan. Dokter pemeriksa dr. Sp.M, kunjungan terakhir 12 Mei 2026.</p>}
        {selectedModal === 'historyDetail' && <p className="text-sm">{selectedDetail?.result}</p>}
        {selectedModal === 'downloadOptions' && <div className="space-y-2">{[['Unduh PDF Laporan Lengkap', Download], ['Unduh Ringkasan Pemeriksaan', FileText], ['Kirim ke Email', Send], ['Bagikan ke Dokter', Share2]].map(([label, Icon]: any) => <button key={label} onClick={() => setToast(`${label} diproses.`)} className="prime-interactive flex w-full items-center gap-2 rounded-xl bg-prime-cream/40 p-3 text-sm"><Icon size={16} />{label}</button>)}</div>}
        {selectedModal === 'aiDetail' && <div className="space-y-2 text-sm"><p>Risiko: Sedang</p><p>Keluhan: Mata buram, merah, mudah lelah.</p><p>Rekomendasi: Konsultasi dokter mata dan kurangi paparan layar lama.</p><p className="rounded-xl bg-prime-cream/40 p-3 text-xs">Disclaimer: Hasil AI bukan diagnosis final dan tidak menggantikan pemeriksaan dokter.</p><button onClick={() => navigate('/booking', { state: { service: 'Pemeriksaan Mata Lengkap' } })} className="prime-interactive prime-cta-gold w-full px-3 py-2 text-white">Booking Dokter Mata</button></div>}
      </div></div>}

      {toast && <div className="fixed bottom-[calc(112px+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-xl bg-prime-black px-4 py-2 text-sm text-white">{toast}</div>}
    </section>
  );
}
