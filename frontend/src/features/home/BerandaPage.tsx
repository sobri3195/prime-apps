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
  LucideIcon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import { DailyWinsCard } from '../gamification/GamificationComponents';
import { POINT_RULES, useGamificationStore } from '../gamification/gamificationStore';

type QuickAction = {
  title: string;
  description: string;
  icon: LucideIcon;
  primary: boolean;
};

type QuickMenu = {
  title: string;
  icon: LucideIcon;
};

const quickActions: QuickAction[] = [
  {
    title: 'Booking Pemeriksaan',
    description: 'Pilih jadwal dokter mata dengan alur cepat dan jelas.',
    icon: CalendarCheck2,
    primary: true,
  },
  {
    title: 'Cek AI Mata',
    description: 'Skrining awal keluhan mata sebelum konsultasi.',
    icon: Brain,
    primary: false,
  },
];

const quickMenus: QuickMenu[] = [
  { title: 'Riwayat Pemeriksaan', icon: FileText },
  { title: 'Resep Kacamata', icon: Glasses },
  { title: 'Hasil AI Mata', icon: Eye },
  { title: 'Edukasi Mata', icon: BookOpenText },
];

function PrimeLogo() {
  return (
    <div className="prime-logo-lockup" role="img" aria-label="PRIME Klinik Utama Mata">
      <div className="prime-logo-text">
        PRIME
        <span className="prime-logo-mark" aria-hidden="true" />
      </div>
      <div className="prime-logo-tagline">Klinik Utama Mata</div>
    </div>
  );
}

function HeaderCard() {
  return (
    <header className="home-header-card rounded-prime-xl border border-prime-line bg-white/95 px-5 py-5 shadow-prime-card">
      <div className="header-top">
        <PrimeLogo />

        <button
          type="button"
          aria-label="Notifikasi"
          className="notification-button relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-prime-line bg-white text-prime-gold shadow-prime-soft transition duration-200 hover:-translate-y-0.5 hover:bg-prime-cream focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:translate-y-0"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-prime-teal" />
        </button>
      </div>

      <div className="header-greeting">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-prime-ink">Halo, Pasien 👋</h1>
        <p className="max-w-[270px] text-[15px] font-medium leading-6 text-prime-muted">
          Selamat datang. Pantau kesehatan mata Anda dengan tenang hari ini.
        </p>
      </div>
    </header>
  );
}

function HealthSummaryCard() {
  return (
    <article className="rounded-prime-xl border border-prime-line bg-white p-5 shadow-prime-card">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-prime-teal-soft text-prime-teal">
          <Eye className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-prime-gold-soft px-3 py-1 text-[12px] font-bold text-prime-gold-dark">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Ringkasan Hari Ini
          </span>
          <h1 className="mt-3 text-[21px] font-extrabold leading-7 tracking-[-0.02em] text-prime-ink">
            Kesehatan mata Anda dalam satu tampilan.
          </h1>
          <p className="mt-2 text-[14px] font-medium leading-6 text-prime-muted">
            Lihat jadwal, antrean, dan rekomendasi ringan agar kunjungan klinik lebih nyaman.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-prime-teal/10 bg-gradient-to-r from-prime-teal-soft to-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-prime-teal shadow-prime-soft">
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-prime-ink">Pengingat 20-20-20</p>
            <p className="mt-1 text-[13px] font-medium leading-5 text-prime-muted">
              Setiap 20 menit, lihat objek jauh selama 20 detik untuk membantu mengurangi mata lelah.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ActionCard({ action, onClick }: { action: QuickAction; onClick: (title: string) => void }) {
  const Icon = action.icon;
  const cardClass = action.primary
    ? 'border-prime-gold-dark bg-prime-gold-dark text-white shadow-prime-gold'
    : 'border-prime-line bg-white text-prime-ink shadow-prime-card';
  const iconClass = action.primary
    ? 'bg-white/20 text-white ring-1 ring-white/25'
    : 'bg-prime-teal-soft text-prime-teal ring-1 ring-prime-teal/10';
  const descriptionClass = action.primary ? 'text-white/90' : 'text-prime-muted';

  return (
    <button
      type="button"
      onClick={() => onClick(action.title)}
      className={`group flex min-h-[168px] flex-col rounded-prime-lg border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-prime-lift focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:translate-y-0 ${cardClass}`}
    >
      <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[18px] transition group-hover:scale-105 ${iconClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-[15px] font-extrabold leading-5 tracking-[-0.01em]">{action.title}</span>
      <span className={`mt-2 text-[13px] font-medium leading-5 ${descriptionClass}`}>{action.description}</span>
      <span className={`mt-auto inline-flex items-center gap-1 pt-4 text-[12px] font-bold ${action.primary ? 'text-white' : 'text-prime-gold-dark'}`}>
        Mulai
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </button>
  );
}

function QueueCard() {
  return (
    <article className="rounded-prime-xl border border-prime-line bg-white p-5 shadow-prime-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-prime-gold-dark">Antrean Hari Ini</p>
          <p className="mt-3 text-[40px] font-extrabold leading-none tracking-[-0.04em] text-prime-ink">A-017</p>
          <div className="mt-4 grid gap-2 text-[14px] font-semibold text-prime-muted">
            <p className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-prime-teal" aria-hidden="true" />
              Estimasi tunggu ±15 menit
            </p>
            <p className="inline-flex w-fit rounded-full bg-prime-gold-soft px-3 py-1 text-[13px] font-bold text-prime-gold-dark">
              Menunggu Pemeriksaan
            </p>
          </div>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-prime-cream text-prime-gold-dark">
          <Clock3 className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
      <button
        type="button"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-prime-ink px-4 py-2 text-[14px] font-bold text-white shadow-prime-soft transition duration-200 hover:-translate-y-0.5 hover:bg-prime-black focus:outline-none focus:ring-4 focus:ring-prime-ink/20 active:translate-y-0"
      >
        Lihat Detail
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}

function AppointmentCard() {
  return (
    <article className="rounded-prime-xl border border-prime-line bg-white p-5 shadow-prime-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-prime-gold-dark">Jadwal Berikutnya</p>
          <h2 className="mt-3 text-[18px] font-extrabold tracking-[-0.01em] text-prime-ink">dr. Sp.M</h2>
          <p className="mt-1.5 text-[14px] font-semibold leading-5 text-prime-muted">Senin, 4 Mei 2026 • 10.30 WIB</p>
          <p className="mt-2 text-[14px] font-bold text-prime-ink">Pemeriksaan Mata Lengkap</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-prime-teal-soft text-prime-teal">
          <Stethoscope className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

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
    <section className="space-y-5 text-prime-ink" aria-label="Beranda pasien PRIME">
      <HeaderCard />
      <HealthSummaryCard />

      <section aria-labelledby="shortcut-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-prime-gold-dark">Aksi Cepat</p>
            <h2 id="shortcut-heading" className="mt-1 text-[18px] font-extrabold tracking-[-0.02em] text-prime-ink">
              Pilih kebutuhan Anda
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          {quickActions.map((action) => (
            <ActionCard key={action.title} action={action} onClick={handleQuickAction} />
          ))}
        </div>
      </section>

      {feedback && (
        <p role="status" className="rounded-[20px] border border-prime-teal/15 bg-prime-teal-soft px-4 py-3 text-[13px] font-bold leading-5 text-prime-ink">
          {feedback}
        </p>
      )}

      <QueueCard />
      <AppointmentCard />

      <section className="rounded-prime-xl border border-prime-line bg-white p-5 shadow-prime-card" aria-labelledby="quick-menu-heading">
        <h2 id="quick-menu-heading" className="text-[17px] font-extrabold tracking-[-0.02em] text-prime-ink">
          Menu Cepat
        </h2>
        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {quickMenus.map(({ title, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => handleQuickMenu(title)}
              className="group rounded-[20px] border border-prime-line bg-prime-surface p-2.5 text-center transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-prime-soft focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:translate-y-0"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-prime-gold-dark shadow-[0_8px_18px_rgba(177,151,49,0.10)] transition group-hover:scale-105">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="mt-2 block text-[11.5px] font-bold leading-snug text-prime-muted">{title}</span>
            </button>
          ))}
        </div>
      </section>

      <DailyWinsCard />

      <section className="rounded-prime-xl border border-prime-line bg-white p-5 shadow-prime-card">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-prime-gold-soft text-prime-gold-dark">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-prime-gold-dark">Tips Kesehatan Mata</p>
            <h2 className="mt-2 text-[16px] font-extrabold leading-6 text-prime-ink">Cara mencegah mata lelah akibat layar</h2>
            <p className="mt-2 text-[13px] font-medium leading-6 text-prime-muted">
              Atur pencahayaan ruangan, gunakan aturan 20-20-20, dan jaga jarak aman layar agar mata tetap nyaman sepanjang hari.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
