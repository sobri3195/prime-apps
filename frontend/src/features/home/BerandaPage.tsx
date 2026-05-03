import { CalendarCheck2, ChevronRight, Eye, Sparkles, Stethoscope } from 'lucide-react';

const quickActions = [
  {
    title: 'Booking Pemeriksaan',
    description: 'Pilih jadwal dokter mata tanpa antre lama.',
    icon: CalendarCheck2,
    primary: true,
  },
  {
    title: 'Cek AI Mata',
    description: 'Skrining cepat gejala mata berbasis AI.',
    icon: Eye,
    primary: false,
  },
];

export function BerandaPage() {
  return (
    <section className="space-y-5 pb-2">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white shadow-lg shadow-cyan-200">
        <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20 blur-sm" />
        <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-blue-300/30 blur-sm" />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Kesehatan Mata Hari Ini
          </span>
          <h1 className="text-2xl font-semibold">Halo, Pasien 👋</h1>
          <p className="max-w-sm text-sm text-cyan-50">
            Pantau kondisi mata, cek jadwal, dan lanjutkan pemeriksaan dari satu aplikasi.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className={`group rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                action.primary
                  ? 'border-cyan-500 bg-cyan-600 text-white shadow-cyan-100'
                  : 'border-cyan-200 bg-white text-cyan-800'
              }`}
            >
              <Icon className={`mb-2 h-5 w-5 ${action.primary ? 'text-white' : 'text-cyan-600'}`} />
              <p className="text-sm font-semibold">{action.title}</p>
              <p className={`mt-1 text-xs ${action.primary ? 'text-cyan-50' : 'text-slate-500'}`}>{action.description}</p>
            </button>
          );
        })}
      </div>

      <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-cyan-600">Antrean Klinik</p>
            <h2 className="mt-1 text-base font-semibold text-slate-800">Estimasi tunggu 12 menit</h2>
            <p className="mt-1 text-sm text-slate-500">Datang sebelum 10:30 agar proses pemeriksaan lebih cepat.</p>
          </div>
          <div className="rounded-xl bg-cyan-50 p-2 text-cyan-600">
            <Stethoscope className="h-5 w-5" />
          </div>
        </div>
        <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-700">
          Lihat detail antrean
          <ChevronRight className="h-4 w-4" />
        </button>
      </article>
    </section>
  );
}
