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
import { useState } from 'react';
import primeLogo from '@/assets/prime-logo.svg';
import { DailyWinsCard } from '../gamification/GamificationComponents';
import { POINT_RULES, useGamificationStore } from '../gamification/gamificationStore';

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
  const [feedback, setFeedback] = useState('');
  const { addPoints, completeMission } = useGamificationStore();
  const userId = 'patient-001';

  const handleQuickAction = (title: string) => {
    if (title === 'Booking Pemeriksaan') {
      addPoints(userId, 'booking_created', POINT_RULES.booking_created, 'Booking pemeriksaan dari Beranda');
      setFeedback('Booking pemeriksaan dicatat. +25 poin Daily Wins.');
      return;
    }

    setFeedback('Silakan lanjut ke AI Mata. Misi AI Screening akan selesai setelah form dikirim.');
  };

  const handleQuickMenu = (title: string) => {
    if (title === 'Edukasi Mata') {
      const result = completeMission(userId, 'read-eye-tips');
      setFeedback(result.message);
      return;
    }

    if (title === 'Riwayat Pemeriksaan') {
      addPoints(userId, 'clinic_exam_completed', POINT_RULES.clinic_exam_completed, 'Pemeriksaan klinik selesai');
      setFeedback('Pemeriksaan selesai dicatat. +50 poin Daily Wins.');
      return;
    }

    if (title === 'Hasil AI Mata') {
      setFeedback('Hasil AI Mata siap ditinjau di menu Laporan Kesehatan Mata.');
      return;
    }

    setFeedback('Data resep kacamata siap dilihat.');
  };

  return (
    <section className="space-y-4 pb-3 text-prime-black">
      <header className="rounded-[28px] border border-prime-gold/15 bg-white px-4 py-4 shadow-sm shadow-prime-gold/10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <img
              src={primeLogo}
              alt="PRIME Committed to Care"
              className="h-auto w-[150px] max-w-full object-contain"
            />
            <div className="mt-4 space-y-1">
              <p className="text-2xl font-bold tracking-[-0.02em] text-prime-black">Halo, Pasien 👋</p>
              <p className="text-sm font-medium text-prime-black/65">Selamat datang di Klinik Utama Prime</p>
            </div>
          </div>
          <button className="relative rounded-2xl border border-prime-gold/20 bg-prime-cream/45 p-2.5 text-prime-gold shadow-sm shadow-prime-gold/10">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-prime-gold" />
          </button>
        </div>
      </header>

      <article className="relative overflow-hidden rounded-[28px] border border-prime-gold/15 bg-gradient-to-br from-prime-gold via-[#d7bd64] to-prime-cream p-5 text-white shadow-lg shadow-prime-gold/20">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/35 blur-sm" />
        <div className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-white/30 blur-md" />
        <div className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-full bg-prime-black/5" />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Ringkasan Kesehatan Mata Hari Ini
          </span>
          <p className="max-w-[260px] text-sm font-medium leading-relaxed text-white">
            Pantau kondisi mata, jadwal pemeriksaan, dan antrean Anda dalam satu aplikasi.
          </p>
          <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/20 p-3 backdrop-blur-sm">
            <div className="rounded-xl bg-white/25 p-2">
              <HeartPulse className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium leading-relaxed text-white">Pengingat ramah: istirahatkan mata 20 detik setiap 20 menit menatap layar.</p>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              onClick={() => handleQuickAction(action.title)}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                action.primary
                  ? 'border-prime-gold bg-prime-gold text-white shadow-md shadow-prime-gold/20'
                  : 'border-prime-gold/25 bg-prime-cream/70 text-prime-black shadow-sm shadow-prime-gold/10'
              }`}
            >
              <Icon className={`mb-2 h-5 w-5 ${action.primary ? 'text-white' : 'text-prime-gold'}`} />
              <p className="text-sm font-bold">{action.title}</p>
              <p className={`mt-1 text-xs font-medium leading-relaxed ${action.primary ? 'text-white/90' : 'text-prime-black/60'}`}>{action.description}</p>
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className="rounded-2xl border border-prime-gold/20 bg-prime-cream/65 px-3 py-2 text-xs font-semibold text-prime-black">{feedback}</p>
      )}

      <article className="rounded-[28px] border border-prime-gold/20 bg-white p-4 shadow-sm shadow-prime-gold/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-prime-gold">Antrean Hari Ini</p>
            <p className="mt-2 text-2xl font-bold text-prime-black">A-017</p>
            <p className="mt-1 text-sm font-medium text-prime-black/60">Estimasi tunggu 15 menit</p>
            <p className="mt-1 text-xs font-semibold text-amber-700">Status: Menunggu Pemeriksaan</p>
          </div>
          <div className="rounded-2xl bg-prime-cream/75 p-2.5 text-prime-gold">
            <Clock3 className="h-5 w-5" />
          </div>
        </div>
        <button className="mt-4 inline-flex items-center gap-1 rounded-xl bg-prime-gold px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-prime-gold/20">
          Lihat Detail
          <ChevronRight className="h-4 w-4" />
        </button>
      </article>

      <article className="rounded-[28px] border border-prime-gold/20 bg-white p-4 shadow-sm shadow-prime-gold/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-prime-gold">Jadwal Berikutnya</p>
            <h2 className="mt-2 text-base font-bold text-prime-black">dr. Sp.M</h2>
            <p className="mt-1 text-sm font-medium text-prime-black/60">Senin, 4 Mei 2026 • 10.30 WIB</p>
            <p className="mt-1 text-sm font-semibold text-prime-black/80">Pemeriksaan Mata Lengkap</p>
          </div>
          <div className="rounded-2xl bg-prime-cream/75 p-2.5 text-prime-gold">
            <Stethoscope className="h-5 w-5" />
          </div>
        </div>
      </article>

      <section className="rounded-[28px] border border-prime-gold/20 bg-white p-4 shadow-sm shadow-prime-gold/10">
        <h3 className="text-sm font-bold text-prime-black">Menu Cepat</h3>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {quickMenus.map(({ title, icon: Icon }) => (
            <button key={title} type="button" onClick={() => handleQuickMenu(title)} className="space-y-2 rounded-2xl border border-prime-gold/15 bg-prime-cream/55 p-2.5 text-center transition hover:bg-prime-cream">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-prime-gold shadow-sm shadow-prime-gold/10">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-[11px] font-medium leading-snug text-prime-black/70">{title}</p>
            </button>
          ))}
        </div>
      </section>

      <DailyWinsCard />

      <section className="rounded-[28px] border border-prime-gold/20 bg-white p-4 shadow-sm shadow-prime-gold/10">
        <p className="text-xs font-bold uppercase tracking-wide text-prime-gold">Tips Kesehatan Mata</p>
        <h3 className="mt-2 text-sm font-bold text-prime-black">Cara mencegah mata lelah akibat layar</h3>
        <p className="mt-2 text-xs font-medium leading-relaxed text-prime-black/60">
          Atur pencahayaan ruangan, gunakan aturan 20-20-20, dan jaga jarak aman layar agar mata tetap nyaman sepanjang hari.
        </p>
      </section>
    </section>
  );
}
