import {
  Activity,
  Brain,
  CalendarCheck2,
  ChevronRight,
  CircleAlert,
  Download,
  Droplets,
  Eye,
  Stethoscope,
} from 'lucide-react';

const visusSeries = {
  kanan: [68, 64, 60, 56, 52],
  kiri: [80, 76, 72, 67, 62],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'],
};

const tekananSeries = [16, 17, 18, 17, 18];

const periodFilters = ['1 Bulan', '3 Bulan', '6 Bulan', '1 Tahun'];

const examHistory = [
  {
    date: '12 Mei 2026',
    title: 'Pemeriksaan Mata Lengkap',
    meta: 'Dokter: dr. Sp.M',
    status: 'Selesai',
    icon: Stethoscope,
  },
  {
    date: '20 April 2026',
    title: 'Pemeriksaan Minus / Silinder',
    meta: 'Dokter: dr. Sp.M',
    status: 'Selesai',
    icon: Eye,
  },
  {
    date: '10 Maret 2026',
    title: 'AI Screening Mata',
    meta: 'Analisis berbasis AI',
    status: 'Tersimpan',
    icon: Brain,
  },
];

export function LaporanPage() {
  return (
    <section className="space-y-4 pb-3">
      <header className="rounded-3xl bg-white p-4 shadow-sm shadow-cyan-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Kesehatan Mata</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Pantau perkembangan kondisi mata dan riwayat pemeriksaan Anda.
            </p>
          </div>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100">
            <Download size={20} />
          </button>
        </div>
      </header>

      <article className="rounded-3xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500 p-4 text-white shadow-lg shadow-cyan-200">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Status Kesehatan Mata</p>
        <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
          <CircleAlert size={18} />
          <span>Perlu Pemantauan</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-cyan-100">Kunjungan terakhir</p>
            <p className="mt-1 font-medium">12 Mei 2026</p>
          </div>
          <div>
            <p className="text-cyan-100">Dokter pemeriksa</p>
            <p className="mt-1 font-medium">dr. Sp.M</p>
          </div>
          <div className="col-span-2">
            <p className="text-cyan-100">Nomor rekam medis</p>
            <p className="mt-1 font-semibold tracking-wide">RM-2026-00128</p>
          </div>
        </div>
        <button className="mt-4 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur-sm">Unduh Laporan</button>
      </article>

      <div className="grid grid-cols-2 gap-3">
        {[
          { title: 'Visus Mata Kanan', value: '6/9', icon: Eye },
          { title: 'Visus Mata Kiri', value: '6/12', icon: Eye },
          { title: 'Tekanan Intraokular', value: '18 mmHg', icon: Activity },
          { title: 'Risiko Mata Kering', value: 'Sedang', icon: Droplets },
        ].map(({ title, value, icon: Icon }) => (
          <article key={title} className="rounded-2xl bg-white p-3 shadow-sm shadow-slate-200">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Icon size={18} />
            </div>
            <p className="text-xs text-slate-500">{title}</p>
            <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200">
        <div className="mb-3 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1">
          {periodFilters.map((item, idx) => (
            <button
              key={item}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                idx === 1 ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200' : 'text-slate-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <h2 className="text-base font-semibold text-slate-900">Grafik Perkembangan Visus</h2>
        <p className="text-xs text-slate-500">Perbandingan hasil pemeriksaan dari waktu ke waktu</p>

        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <svg viewBox="0 0 320 140" className="h-40 w-full">
            <path d="M20 10v100h280" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
            <polyline
              points={visusSeries.kanan.map((value, i) => `${20 + i * 65},${value}`).join(' ')}
              fill="none"
              stroke="#0891b2"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <polyline
              points={visusSeries.kiri.map((value, i) => `${20 + i * 65},${value}`).join(' ')}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            {visusSeries.labels.map((month, i) => (
              <text key={month} x={20 + i * 65} y="128" textAnchor="middle" fontSize="11" fill="#64748b">
                {month}
              </text>
            ))}
          </svg>
          <div className="mt-1 flex gap-4 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-6 rounded-full bg-cyan-600" />Mata kanan</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-6 rounded-full bg-blue-600" />Mata kiri</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Tekanan Intraokular</h2>
            <p className="text-xs text-slate-500">Pantau tekanan bola mata secara berkala</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Dalam batas aman</span>
        </div>
        <div className="mt-3 flex items-end gap-2 rounded-2xl bg-slate-50 p-3">
          {tekananSeries.map((value, idx) => (
            <div key={idx} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-500" style={{ height: `${value * 4}px` }} />
              <span className="text-[11px] text-slate-500">{visusSeries.labels[idx]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Riwayat Pemeriksaan</h2>
        {examHistory.map(({ date, title, meta, status, icon: Icon }) => (
          <article key={title} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm shadow-slate-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">{date}</p>
              <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-600">{meta}</p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">{status}</span>
              <ChevronRight className="ml-auto mt-2 text-slate-400" size={16} />
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-900">Hasil AI Mata Terakhir</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Perlu Konsultasi</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Gejala mata buram dan merah terdeteksi. Disarankan melakukan pemeriksaan lanjutan ke dokter mata.
        </p>
        <button className="mt-3 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700">Lihat Detail AI</button>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Rekomendasi</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Lakukan pemeriksaan ulang dalam 1 bulan atau lebih cepat jika keluhan bertambah.
        </p>
        <button className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-200">
          <CalendarCheck2 size={16} />
          Booking Pemeriksaan
        </button>
      </section>
    </section>
  );
}
