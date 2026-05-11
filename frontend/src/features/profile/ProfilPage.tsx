import {
  Bell,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Eye,
  FileText,
  Fingerprint,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  User,
  UserRound,
  Users,
} from 'lucide-react';
import { BadgeSection, PointsStreakCard, RewardSection } from '../gamification/GamificationComponents';

const familyMembers = [
  { role: 'Ibu', rm: 'RM-2026-00110', status: 'Aktif' },
  { role: 'Ayah', rm: 'RM-2025-00095', status: 'Aktif' },
  { role: 'Anak', rm: 'RM-2026-00142', status: 'Kontrol Berkala' },
];

const profileMenus = [
  { label: 'Data Pribadi', icon: UserRound },
  { label: 'Rekam Medis', icon: FileText },
  { label: 'Riwayat Pemeriksaan', icon: CalendarDays },
  { label: 'Resep Kacamata', icon: Eye },
  { label: 'Hasil AI Mata', icon: Fingerprint },
  { label: 'Alamat & Kontak', icon: MapPin },
  { label: 'Pengaturan Notifikasi', icon: Bell },
  { label: 'Bantuan Klinik', icon: ShieldCheck },
];

export function ProfilPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2 px-1 pt-1">
        <div className="flex items-start justify-between">
          <h1 className="text-[30px] font-bold leading-tight text-prime-black">Profil Pasien</h1>
          <button className="mt-1 rounded-xl border border-prime-gold/20 bg-white p-2.5 text-prime-gold shadow-sm shadow-prime-gold/10 transition hover:bg-prime-cream/50">
            <Settings size={18} />
          </button>
        </div>
        <p className="text-sm text-prime-black/70">Kelola data akun, rekam medis, dan keluarga Anda.</p>
      </header>

      <article className="rounded-[28px] bg-gradient-to-br from-prime-black via-prime-gold to-[#d7bd64] p-4 text-white shadow-lg shadow-prime-gold/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/20">
              <UserRound size={34} />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight">Muhammad Sobri Maulana</p>
              <p className="text-xs text-white/90">Pasien Klinik Utama Prime</p>
            </div>
          </div>
          <span className="rounded-full bg-prime-cream px-3 py-1 text-xs font-semibold text-prime-black">Aktif</span>
        </div>
        <div className="mt-4 rounded-2xl border border-white/25 bg-white/20 p-3 backdrop-blur-sm">
          <p className="text-xs text-white/90">Nomor Rekam Medis</p>
          <p className="text-base font-semibold tracking-wide">RM-2026-00128</p>
        </div>
        <button className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-prime-gold shadow-sm transition hover:bg-prime-cream/50">
          Edit Profil
        </button>
      </article>

      <PointsStreakCard />

      <BadgeSection />

      <article className="rounded-[28px] bg-white p-4 shadow-md shadow-prime-gold/10">
        <h2 className="text-base font-semibold text-prime-black">Informasi Akun</h2>
        <ul className="mt-3 space-y-3 text-sm text-prime-black/75">
          {[
            { icon: Phone, label: 'Nomor HP', value: '+62 812 3456 7890' },
            { icon: Mail, label: 'Email', value: 'sobri.maulana@email.com' },
            { icon: CalendarDays, label: 'Tanggal lahir', value: '21 Maret 1992' },
            { icon: User, label: 'Jenis kelamin', value: 'Laki-laki' },
            { icon: MapPin, label: 'Alamat', value: 'Jl. Melati Indah No. 23, Makassar' },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-3 rounded-xl bg-[#fff8e8] px-3 py-2.5">
              <item.icon size={16} className="mt-0.5 text-prime-gold" />
              <div>
                <p className="text-xs text-prime-black/60">{item.label}</p>
                <p className="font-medium text-prime-black">{item.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-[28px] bg-white p-4 shadow-md shadow-prime-gold/10">
        <h2 className="text-base font-semibold text-prime-black">Ringkasan Rekam Medis</h2>
        <div className="mt-3 grid grid-cols-1 gap-2.5 text-sm">
          <div className="rounded-xl bg-prime-cream/50 p-3"><span className="text-xs text-prime-black/60">Kunjungan terakhir</span><p className="font-semibold">12 Mei 2026</p></div>
          <div className="rounded-xl bg-prime-cream/50 p-3"><span className="text-xs text-prime-black/60">Keluhan terakhir</span><p className="font-semibold">Mata buram</p></div>
          <div className="rounded-xl bg-prime-cream/50 p-3"><span className="text-xs text-prime-black/60">Dokter terakhir</span><p className="font-semibold">dr. Sp.M</p></div>
        </div>
        <button className="mt-4 w-full rounded-xl bg-prime-gold px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-prime-gold/20 transition hover:bg-[#9e8629]">
          Lihat Rekam Medis
        </button>
      </article>

      <article className="rounded-[28px] bg-white p-4 shadow-md shadow-prime-gold/10">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-prime-gold" />
          <h2 className="text-base font-semibold text-prime-black">Keluarga Terdaftar</h2>
        </div>
        <div className="mt-3 space-y-2.5">
          {familyMembers.map((member) => (
            <div key={member.rm} className="rounded-xl border border-prime-gold/10 bg-[#fff8e8] px-3 py-2.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-prime-black">{member.role}</p>
                <span className="rounded-full bg-prime-cream/70 px-2.5 py-0.5 text-xs font-semibold text-prime-gold">{member.status}</span>
              </div>
              <p className="mt-1 text-xs text-prime-black/60">Nomor Rekam Medis</p>
              <p className="text-sm font-medium text-prime-black/75">{member.rm}</p>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-xl border border-prime-gold/25 bg-prime-cream/50 px-4 py-2.5 text-sm font-semibold text-prime-gold transition hover:bg-prime-cream/70">
          Tambah Anggota Keluarga
        </button>
      </article>

      <article className="rounded-[28px] bg-white p-4 shadow-md shadow-prime-gold/10">
        <h2 className="text-base font-semibold text-prime-black">Menu Profil</h2>
        <ul className="mt-2 divide-y divide-prime-gold/10">
          {profileMenus.map((menu) => (
            <li key={menu.label}>
              <button className="flex w-full items-center justify-between py-3 text-left">
                <span className="flex items-center gap-3 text-sm font-medium text-prime-black/75">
                  <menu.icon size={17} className="text-prime-gold" />
                  {menu.label}
                </span>
                <ChevronRight size={16} className="text-prime-black/40" />
              </button>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-[28px] border border-prime-gold/20 bg-prime-cream/50 p-4 shadow-sm shadow-prime-gold/10">
        <div className="flex items-start gap-2.5">
          <Lock size={18} className="mt-0.5 text-prime-gold" />
          <div>
            <h2 className="text-base font-semibold text-prime-black">Keamanan Akun</h2>
            <p className="mt-0.5 text-sm text-prime-black/70">Pastikan data Anda selalu terlindungi.</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {['Ubah Password', 'Verifikasi Nomor HP'].map((item) => (
            <button key={item} className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-prime-black/75">
              <span className="flex items-center gap-2"><CircleCheck size={15} className="text-prime-gold" />{item}</span>
              <ChevronRight size={16} className="text-prime-black/40" />
            </button>
          ))}
        </div>
      </article>

      <RewardSection />

      <button className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100">
        Keluar Akun
      </button>
    </section>
  );
}
