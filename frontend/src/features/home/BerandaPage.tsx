import {
  Bell,
  BookOpenText,
  Brain,
  CalendarCheck2,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Glasses,
  HeartPulse,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

const quickActions = [
  {
    title: 'Booking Pemeriksaan',
    description: 'Atur jadwal dokter mata tanpa menunggu lama.',
    icon: CalendarCheck2,
    primary: true,
  },
  {
    title: 'Cek AI Mata',
    description: 'Skrining gejala awal mata dalam hitungan menit.',
    icon: Brain,
    primary: false,
  },
];

const quickMenus = [
  { title: 'Riwayat Pemeriksaan', icon: FileText },
  { title: 'Resep Kacamata', icon: Glasses },
  { title: 'Hasil AI Mata', icon: Eye },
  { title: 'Edukasi Mata', icon: BookOpenText },
];

export function BerandaPage() {
  return (
    <section className="space-y-4 pb-3">
      <header className="flex items-start justify-between rounded-3xl bg-white px-1 pb-1 pt-2">
        <div>
          <p className="text-2xl font-semibold text-slate-900">Halo, Pasien 👋</p>
          <p className="mt-1 text-sm text-slate-500">Selamat datang di Klinik Utama Prime</p>
        </div>
        <button className="relative rounded-2xl border border-cyan-100 bg-cyan-50 p-2.5 text-cyan-700 shadow-sm">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
      </header>

      <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 p-5 text-white shadow-lg shadow-cyan-100">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/25 blur-sm" />
        <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-blue-300/40 blur-sm" />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Ringkasan Kesehatan Mata Hari Ini
          </span>
          <p className="max-w-[240px] text-sm leading-relaxed text-cyan-50">
            Pantau kondisi mata, jadwal pemeriksaan, dan antrean Anda dalam satu aplikasi.
          </p>
          <div className="flex items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <div className="rounded-xl bg-white/20 p-2">
              <HeartPulse className="h-5 w-5" />
            </div>
            <p className="text-xs leading-relaxed text-cyan-50">Pengingat ramah: istirahatkan mata 20 detik setiap 20 menit menatap layar.</p>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                action.primary
                  ? 'border-cyan-500 bg-cyan-600 text-white shadow-md shadow-cyan-100'
                  : 'border-cyan-100 bg-cyan-50/60 text-cyan-800'
              }`}
            >
              <Icon className={`mb-2 h-5 w-5 ${action.primary ? 'text-white' : 'text-cyan-600'}`} />
              <p className="text-sm font-semibold">{action.title}</p>
              <p className={`mt-1 text-xs ${action.primary ? 'text-cyan-50' : 'text-slate-500'}`}>{action.description}</p>
            </button>
          );
        })}
      </div>

      <article className="rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm shadow-cyan-50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Antrean Hari Ini</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">A-017</p>
            <p className="mt-1 text-sm text-slate-500">Estimasi tunggu 15 menit</p>
            <p className="mt-1 text-xs font-medium text-amber-600">Status: Menunggu Pemeriksaan</p>
          </div>
          <div className="rounded-2xl bg-cyan-50 p-2.5 text-cyan-600">
            <Clock3 className="h-5 w-5" />
          </div>
        </div>
        <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-700">
          Lihat Detail
          <ChevronRight className="h-4 w-4" />
        </button>
      </article>

      <article className="rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm shadow-cyan-50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Jadwal Berikutnya</p>
            <h2 className="mt-2 text-base font-semibold text-slate-900">dr. Sp.M</h2>
            <p className="mt-1 text-sm text-slate-500">Senin, 4 Mei 2026 • 10.30 WIB</p>
            <p className="mt-1 text-sm text-slate-700">Pemeriksaan Mata Lengkap</p>
          </div>
          <div className="rounded-2xl bg-cyan-50 p-2.5 text-cyan-600">
            <Stethoscope className="h-5 w-5" />
          </div>
        </div>
      </article>

      <section className="rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm shadow-cyan-50">
        <h3 className="text-sm font-semibold text-slate-900">Menu Cepat</h3>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {quickMenus.map(({ title, icon: Icon }) => (
            <button key={title} className="space-y-2 rounded-2xl bg-cyan-50/70 p-2.5 text-center">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-[11px] leading-snug text-slate-600">{title}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm shadow-cyan-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Tips Kesehatan Mata</p>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">Cara mencegah mata lelah akibat layar</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Atur pencahayaan ruangan, gunakan aturan 20-20-20, dan jaga jarak aman layar agar mata tetap nyaman sepanjang hari.
        </p>
      </section>
    </section>
  );
}
